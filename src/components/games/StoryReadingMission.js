import React, { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { loadStoryChapter, loadStoryIndex, loadStoryReadingManifest } from '../../utils/storyReadingLoader';
import './EslReviewGames.css';

const isCorrectChoice = (question, index) => {
  if (question.type === 'true_false') {
    return (index === 0) === question.answer;
  }
  return index === question.answerIndex;
};

const answerOptions = (question) =>
  question.type === 'true_false' ? ['True', 'False'] : question.options || [];

const PROGRESS_VERSION = 2;

const getProgress = (storyId) => {
  try {
    return JSON.parse(localStorage.getItem(`story_progress_${storyId}`) || '{}');
  } catch (err) {
    console.warn('Could not read story reading progress:', err);
    return {};
  }
};

const saveProgress = (storyId, chapterId, result) => {
  const progress = getProgress(storyId);
  progress[chapterId] = {
    ...(progress[chapterId] || {}),
    ...result,
    version: PROGRESS_VERSION,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(`story_progress_${storyId}`, JSON.stringify(progress));
  return progress;
};

const getChapterQuestionCount = (chapter) =>
  chapter?.questionCount || chapter?.pages?.reduce((sum, page) => sum + (page.inlineQuestions?.length || 0), 0) || 0;

const getAnswerStats = (chapter, answers) => {
  const validIds = new Set(
    (chapter?.pages || []).flatMap((page) => (page.inlineQuestions || []).map((question) => question.id))
  );
  const chapterAnswers = Object.entries(answers || {}).filter(([id]) => validIds.has(id));
  const correct = chapterAnswers.filter(([, answer]) => answer?.correct).length;
  const totalQuestions = getChapterQuestionCount(chapter);

  return {
    correct,
    total: chapterAnswers.length,
    totalQuestions,
    score: chapterAnswers.length > 0 ? Math.round((correct / chapterAnswers.length) * 100) : 0,
  };
};

const isChapterComplete = (progress, chapterSummary) => {
  if (!progress) return false;
  const totalQuestions = progress.totalQuestions || chapterSummary?.questionCount || 0;
  return Boolean(progress.completed || (totalQuestions > 0 && progress.total >= totalQuestions));
};

const getChapterStatus = (progress, chapterSummary) => {
  const totalQuestions = progress?.totalQuestions || chapterSummary?.questionCount || 0;
  return {
    answered: progress?.total || 0,
    complete: isChapterComplete(progress, chapterSummary),
    score: progress?.score || 0,
    totalQuestions,
    resumePage: Math.min(
      Math.max((progress?.pageIndex || 0) + 1, 1),
      chapterSummary?.pageCount || Math.max((progress?.pageIndex || 0) + 1, 1)
    ),
  };
};

const findResumePageIndex = (chapter, savedProgress) => {
  const pages = chapter?.pages || [];
  if (pages.length === 0) return 0;

  const savedAnswers = savedProgress?.answers || {};
  if (Object.keys(savedAnswers).length === 0 && isChapterComplete(savedProgress, chapter)) {
    return pages.length - 1;
  }

  const firstIncompletePage = pages.findIndex((page) => {
    const questions = page.inlineQuestions || [];
    return questions.length > 0 && questions.some((question) => !savedAnswers[question.id]);
  });

  if (firstIncompletePage >= 0) return firstIncompletePage;
  return Math.max(0, Math.min(savedProgress?.pageIndex || pages.length - 1, pages.length - 1));
};

const findFirstUnansweredQuestionId = (page, answers) =>
  (page?.inlineQuestions || []).find((question) => !answers?.[question.id])?.id || null;

const findLastAnsweredQuestionId = (page, answers) => {
  const answered = (page?.inlineQuestions || []).filter((question) => answers?.[question.id]);
  return answered[answered.length - 1]?.id || null;
};

/**
 * Inline scroll-picker blank — sits within the text like a small slot machine.
 * All 3 states (blank, picker, answered) use the SAME fixed width
 * so the surrounding text never shifts.
 */
const InlinePickerBlank = ({ question, picked, onPick }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [active, setActive] = useState(false);
  const options = answerOptions(question);
  const viewportRef = useRef(null);
  const lastOptionTapRef = useRef({ index: null, time: 0 });
  const itemH = 30;

  // Calculate a stable width — tight fit for short options, scales for long ones
  // ~8px per char + 100px for arrows + confirm + padding/gaps
  const longestLen = useMemo(
    () => Math.max(...options.map((o) => o.length), 4),
    [options]
  );
  const stableWidth = Math.min(Math.max(longestLen * 8 + 100, 140), 450);

  // Scroll to selected item
  useEffect(() => {
    if (active && viewportRef.current && !viewportRef.current._userScrolling) {
      viewportRef.current.scrollTo({ top: selectedIdx * itemH, behavior: 'smooth' });
    }
  }, [active, selectedIdx]);

  // Detect scroll position
  useEffect(() => {
    if (!active) return;
    const vp = viewportRef.current;
    if (!vp) return;
    let timer = null;
    const onScroll = () => {
      vp._userScrolling = true;
      clearTimeout(timer);
      timer = setTimeout(() => {
        vp._userScrolling = false;
        const idx = Math.round(vp.scrollTop / itemH);
        if (idx >= 0 && idx < options.length) setSelectedIdx(idx);
      }, 60);
    };
    vp.addEventListener('scroll', onScroll, { passive: true });
    return () => { vp.removeEventListener('scroll', onScroll); clearTimeout(timer); };
  }, [active, options.length]);

  // Stable container style — same width AND height for all states
  const stableHeight = 36;
  const containerStyle = {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: stableWidth,
    maxWidth: 'min(100%, calc(100vw - 48px))',
    height: stableHeight,
    margin: '0 4px',
    verticalAlign: 'middle',
    boxSizing: 'border-box',
  };

  const handleOptionTap = (index) => {
    const now = Date.now();
    const isDoubleTap =
      lastOptionTapRef.current.index === index &&
      now - lastOptionTapRef.current.time < 450;

    setSelectedIdx(index);
    lastOptionTapRef.current = { index, time: now };

    if (isDoubleTap) {
      onPick(index);
    }
  };

  // Already answered
  if (picked) {
    return (
      <span style={containerStyle}>
        <span className={`srm-answered ${picked.correct ? 'srm-correct' : 'srm-wrong'}`}>
          {options[picked.selectedIndex]}
        </span>
      </span>
    );
  }

  // Inactive — show tappable blank
  if (!active) {
    return (
      <span style={containerStyle}>
        <span className="srm-blank" onClick={() => setActive(true)}>
          ______
        </span>
      </span>
    );
  }

  // Active — inline scroll picker
  return (
    <span style={containerStyle}>
      <span className="srm-picker" onClick={(e) => e.stopPropagation()}>
        <span className="srm-picker-arrow" onClick={() => setSelectedIdx(Math.max(0, selectedIdx - 1))}>▲</span>
        <span className="srm-picker-vp" ref={viewportRef}>
          <span className="srm-picker-track">
            {options.map((opt, i) => (
              <span
                key={`${question.id}_${i}`}
                className={`srm-picker-opt ${i === selectedIdx ? 'srm-picker-sel' : ''}`}
                style={{ minHeight: itemH }}
                title={i === selectedIdx ? 'Double tap to submit' : 'Tap to choose'}
                onClick={() => handleOptionTap(i)}
              >
                {opt}
              </span>
            ))}
          </span>
        </span>
        <span className="srm-picker-arrow" onClick={() => setSelectedIdx(Math.min(options.length - 1, selectedIdx + 1))}>▼</span>
        <span className="srm-picker-ok" onClick={() => onPick(selectedIdx)}>✓</span>
      </span>
    </span>
  );
};

/**
 * Renders a question prompt as inline text with the picker blank.
 */
const InlineQ = ({ question, picked, onPick }) => {
  const parts = question.prompt.split(/_{3,}/);
  const picker = <InlinePickerBlank question={question} picked={picked} onPick={onPick} />;
  const fb = picked && (
    <span className={`srm-fb ${picked.correct ? 'srm-fb-ok' : 'srm-fb-no'}`}>
      {picked.correct ? ' ✓' : ` ✗ ${question.explanation}`}
    </span>
  );

  if (parts.length === 1) {
    return <span className="srm-q">{question.prompt} {picker}{fb}</span>;
  }
  return (
    <span className="srm-q">
      {parts.map((p, i) => (
        <React.Fragment key={i}>{p}{i < parts.length - 1 && picker}</React.Fragment>
      ))}
      {fb}
    </span>
  );
};

const StoryReadingMission = ({ onAnswer, onComplete, onHome }) => {
  const [view, setView] = useState('selection');
  const [story, setStory] = useState(null);
  const [storyBasePath, setStoryBasePath] = useState('');
  const [chapter, setChapter] = useState(null);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chapterProgress, setChapterProgress] = useState({});
  const [resumeScrollTargetId, setResumeScrollTargetId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const manifest = await loadStoryReadingManifest();
        const loaded = await loadStoryIndex(manifest);
        if (cancelled) return;
        setStory(loaded.story);
        setStoryBasePath(loaded.storyBasePath);
        setChapterProgress(getProgress(loaded.story.id));
      } catch (err) { if (!cancelled) setError(err.message); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!story || !storyBasePath || view !== 'reading') return;
      try {
        setLoading(true);
        const ch = await loadStoryChapter(storyBasePath, story.chapters[chapterIndex]);
        if (cancelled) return;
        const savedProgress = getProgress(story.id)[ch.chapterId] || {};
        const savedAnswers = savedProgress.answers || {};
        const resumePageIndex = findResumePageIndex(ch, savedProgress);
        const resumePage = ch.pages?.[resumePageIndex];
        setChapter(ch);
        setPageIndex(resumePageIndex);
        setAnswers(savedAnswers);
        setResumeScrollTargetId(
          findFirstUnansweredQuestionId(resumePage, savedAnswers) ||
          findLastAnsweredQuestionId(resumePage, savedAnswers)
        );
      } catch (err) { if (!cancelled) setError(err.message); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [story, storyBasePath, chapterIndex, view]);

  const page = chapter?.pages?.[pageIndex];
  const pageQs = useMemo(() => page?.inlineQuestions || [], [page]);
  const pageAnsweredCount = useMemo(
    () => pageQs.filter((q) => answers[q.id]).length,
    [answers, pageQs]
  );
  const allDone = pageQs.length === 0 || pageAnsweredCount === pageQs.length;
  const chapterStats = useMemo(() => getAnswerStats(chapter, answers), [chapter, answers]);
  const totalQ = chapterStats.totalQuestions;

  useEffect(() => {
    if (view !== 'reading' || !resumeScrollTargetId) return undefined;

    const timer = window.setTimeout(() => {
      const target = document.querySelector(`[data-srm-question-id="${resumeScrollTargetId}"]`);
      if (target) {
        target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
      setResumeScrollTargetId(null);
    }, 120);

    return () => window.clearTimeout(timer);
  }, [resumeScrollTargetId, view, pageIndex]);

  const persistChapterAnswers = useCallback((nextAnswers, overrides = {}) => {
    if (!story || !chapter) return;

    const stats = getAnswerStats(chapter, nextAnswers);
    const progress = saveProgress(story.id, chapter.chapterId, {
      answers: nextAnswers,
      correct: stats.correct,
      total: stats.total,
      totalQuestions: stats.totalQuestions,
      score: stats.score,
      completed: stats.totalQuestions > 0 && stats.total >= stats.totalQuestions,
      pageIndex,
      pageId: page?.pageId,
      ...overrides,
    });
    setChapterProgress(progress);
  }, [chapter, page, pageIndex, story]);

  const handlePick = useCallback((question, index) => {
    if (answers[question.id]) return;
    const correct = isCorrectChoice(question, index);
    const label = question.type === 'true_false'
      ? (index === 0 ? 'True' : 'False') : question.options[index];
    const nextAnswers = {
      ...answers,
      [question.id]: {
        selectedIndex: index,
        correct,
        pageId: page?.pageId,
        answeredAt: new Date().toISOString(),
      },
    };
    setAnswers(nextAnswers);
    persistChapterAnswers(nextAnswers, {
      pageIndex,
      pageId: page?.pageId,
      lastQuestionId: question.id,
    });
    onAnswer(question.id, correct, 3000, {
      word: question.id, definition: question.prompt,
      example: page?.sourceText, explanation: question.explanation,
      category: question.reviewTopic, type: question.type,
    }, label);
  }, [answers, onAnswer, page, pageIndex, persistChapterAnswers]);

  const handleNext = () => {
    if (!allDone) return;
    if (chapter && pageIndex < chapter.pages.length - 1) {
      const nextPageIndex = pageIndex + 1;
      persistChapterAnswers(answers, {
        pageIndex: nextPageIndex,
        pageId: chapter.pages[nextPageIndex]?.pageId,
      });
      setPageIndex(nextPageIndex);
      window.scrollTo({ top: 0, behavior: 'smooth' }); return;
    }
    
    // Chapter Complete
    const s = chapterStats.score;
    if (story && chapter) {
      const progress = saveProgress(story.id, chapter.chapterId, {
        answers,
        score: s,
        correct: chapterStats.correct,
        total: chapterStats.total,
        totalQuestions: chapterStats.totalQuestions,
        completed: true,
        pageIndex,
        pageId: page?.pageId,
      });
      setChapterProgress(progress);
    }
    onComplete({ score: s, totalQuestions: chapterStats.totalQuestions || chapterStats.total, correctCount: chapterStats.correct });
  };

  if (loading && view !== 'selection') return (
    <div className="esl-review-game"><div className="esl-review-card">
      <p className="esl-review-prompt">Loading...</p>
    </div></div>
  );
  if (error) return (
    <div className="esl-review-game"><div className="esl-review-card">
      <p className="esl-review-prompt">Error loading story.</p>
      <div className="esl-review-feedback wrong">{error}</div>
      <button className="esl-review-action" onClick={onHome}>Back</button>
    </div></div>
  );

  if (view === 'selection' && story) {
    const totalChapters = story.chapters.length;
    const completedChapters = story.chapters.filter((c) => isChapterComplete(chapterProgress[c.chapterId], c)).length;
    let totalQs = 0;
    let totalCs = 0;
    Object.values(chapterProgress).forEach((p) => {
      totalQs += p.total || 0;
      totalCs += p.correct || 0;
    });
    const overallScore = totalQs > 0 ? Math.round((totalCs / totalQs) * 100) : 0;

    return (
      <div className="esl-review-game story-reading-shell">
        <header className="esl-review-header">
          <button className="esl-review-back" onClick={onHome}>←</button>
          <div className="esl-review-title">
            <h1>Story Reading Mission</h1>
            <p>{story.title}</p>
          </div>
        </header>
        <main className="esl-review-card story-reading-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="esl-review-progress" style={{ marginBottom: '20px' }}>
            <span>Progress: {completedChapters}/{totalChapters} Chapters</span>
            <span>Overall Score: {overallScore}%</span>
          </div>
          <div className="story-chapter-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {story.chapters.map((ch, idx) => {
              const p = chapterProgress[ch.chapterId];
              const status = getChapterStatus(p, ch);
              return (
                <button 
                  key={ch.chapterId}
                  className="esl-review-action"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', padding: '15px', height: 'auto', opacity: 1 }}
                  onClick={() => {
                    setChapterIndex(idx);
                    setView('reading');
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <strong style={{ display: 'block', fontSize: '1.1em', marginBottom: '4px' }}>Ch {ch.chapterNumber}: {ch.title}</strong>
                    <div style={{ fontSize: '0.85em', opacity: 0.8 }}>
                      {ch.dateLabel} • {ch.questionCount} Qs
                      {status.answered > 0 && !status.complete ? ` • Resume page ${status.resumePage}` : ''}
                    </div>
                  </div>
                  {status.answered > 0 && (
                    <div style={{ fontWeight: 'bold', fontSize: '1.2em', color: status.score >= 80 ? '#4caf50' : (status.score >= 50 ? '#ff9800' : '#f44336'), marginLeft: '15px', textAlign: 'right' }}>
                      {status.complete ? `${status.score}%` : `${status.answered}/${status.totalQuestions || '?'}`}
                      <div style={{ fontSize: '0.65em', opacity: 0.75 }}>
                        {status.complete ? 'Done' : 'Saved'}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  if (view === 'reading' && chapter && page) {
    // Distribute questions among paragraphs
    const paras = page.sourceText.split(/\n\s*\n/);
    const qByP = Array.from({ length: paras.length }, () => []);
    if (pageQs.length > 0) {
      pageQs.forEach((q, i) => {
        const p = Math.min(Math.floor(((i + 1) / pageQs.length) * paras.length) - 1, paras.length - 1);
        qByP[Math.max(0, p)].push(q);
      });
    }

    return (
      <div className="esl-review-game story-reading-shell">
        <header className="esl-review-header">
          <button className="esl-review-back" onClick={() => setView('selection')}>←</button>
          <div className="esl-review-title">
            <h1>Story Reading Mission</h1>
            <p>Ch {chapter.chapterNumber}: Read & fill the blanks!</p>
          </div>
        </header>
        <main className="esl-review-card story-reading-card">
          <div className="esl-review-progress">
            <span>{story ? `Ch ${chapterIndex + 1}/${story.chapters.length}` : ''}</span>
            <span>{chapterStats.correct}/{totalQ || '?'}</span>
          </div>
          <span className="esl-review-category">Page {pageIndex + 1}/{chapter.pages.length}</span>
          <h2 className="story-reading-chapter-title">{chapter.title}</h2>
          <p className="story-reading-date">{chapter.dateLabel}</p>
          <div className="story-reading-page-text">
            {paras.map((para, pi) => (
              <p key={pi}>
                {para}
                {qByP[pi].map((q) => (
                  <span key={q.id} data-srm-question-id={q.id}>
                    {' '}
                    <InlineQ question={q} picked={answers[q.id]} onPick={(idx) => handlePick(q, idx)} />
                  </span>
                ))}
              </p>
            ))}
          </div>
          <div className="story-reading-nav">
            <div className="story-reading-lock-note">
              {allDone ? '✅ Next page unlocked!' : `${pageAnsweredCount}/${pageQs.length} answered`}
            </div>
            <button className={`esl-review-action story-reading-next ${allDone ? '' : 'locked'}`}
              disabled={!allDone} onClick={handleNext}>
              {pageIndex === chapter.pages.length - 1 ? 'Finish Chapter' : 'Next →'}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return null;
};

export default StoryReadingMission;
