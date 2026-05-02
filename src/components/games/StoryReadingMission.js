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

const getProgress = (storyId) => JSON.parse(localStorage.getItem(`story_progress_${storyId}`) || '{}');
const saveProgress = (storyId, chapterId, result) => {
  const p = getProgress(storyId);
  p[chapterId] = result;
  localStorage.setItem(`story_progress_${storyId}`, JSON.stringify(p));
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
  const containerStyle = { display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: stableWidth, height: stableHeight, margin: '0 4px', verticalAlign: 'middle', boxSizing: 'border-box' };

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
                onClick={() => setSelectedIdx(i)}
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
  const parts = question.prompt.split('_____');
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
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chapterProgress, setChapterProgress] = useState({});

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
        setChapter(ch);
        setPageIndex(0);
        setAnswers({});
        setTotalAnswered(0);
        setCorrectCount(0);
      } catch (err) { if (!cancelled) setError(err.message); }
      finally { if (!cancelled) setLoading(false); }
    }
    load();
    return () => { cancelled = true; };
  }, [story, storyBasePath, chapterIndex, view]);

  const page = chapter?.pages?.[pageIndex];
  const pageQs = useMemo(() => page?.inlineQuestions || [], [page]);
  const allDone = pageQs.length > 0 && pageQs.every((q) => answers[q.id]);
  const totalQ = useMemo(
    () => chapter?.questionCount || totalAnswered,
    [chapter, totalAnswered]
  );

  const handlePick = useCallback((question, index) => {
    if (answers[question.id]) return;
    const correct = isCorrectChoice(question, index);
    const label = question.type === 'true_false'
      ? (index === 0 ? 'True' : 'False') : question.options[index];
    setAnswers((c) => ({ ...c, [question.id]: { selectedIndex: index, correct } }));
    setTotalAnswered((c) => c + 1);
    setCorrectCount((c) => c + (correct ? 1 : 0));
    onAnswer(question.id, correct, 3000, {
      word: question.id, definition: question.prompt,
      example: page?.sourceText, explanation: question.explanation,
      category: question.reviewTopic, type: question.type,
    }, label);
  }, [answers, onAnswer, page]);

  const handleNext = () => {
    if (!allDone) return;
    if (chapter && pageIndex < chapter.pages.length - 1) {
      setPageIndex((c) => c + 1); setAnswers({});
      window.scrollTo({ top: 0, behavior: 'smooth' }); return;
    }
    
    // Chapter Complete
    const s = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    if (story && chapter) {
        saveProgress(story.id, chapter.chapterId, { score: s, correct: correctCount, total: totalAnswered });
    }
    onComplete({ score: s, totalQuestions: totalAnswered, correctCount });
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
    const completedChapters = story.chapters.filter(c => chapterProgress[c.chapterId]).length;
    let totalQs = 0;
    let totalCs = 0;
    Object.values(chapterProgress).forEach(p => { totalQs += p.total; totalCs += p.correct; });
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
                    <div style={{ fontSize: '0.85em', opacity: 0.8 }}>{ch.dateLabel} • {ch.questionCount} Qs</div>
                  </div>
                  {p && (
                    <div style={{ fontWeight: 'bold', fontSize: '1.2em', color: p.score >= 80 ? '#4caf50' : (p.score >= 50 ? '#ff9800' : '#f44336'), marginLeft: '15px' }}>
                      {p.score}%
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
            <span>{correctCount}/{totalQ || '?'}</span>
          </div>
          <span className="esl-review-category">Page {pageIndex + 1}/{chapter.pages.length}</span>
          <h2 className="story-reading-chapter-title">{chapter.title}</h2>
          <p className="story-reading-date">{chapter.dateLabel}</p>
          <div className="story-reading-page-text">
            {paras.map((para, pi) => (
              <p key={pi}>
                {para}
                {qByP[pi].map((q) => (
                  <React.Fragment key={q.id}>
                    {' '}
                    <InlineQ question={q} picked={answers[q.id]} onPick={(idx) => handlePick(q, idx)} />
                  </React.Fragment>
                ))}
              </p>
            ))}
          </div>
          <div className="story-reading-nav">
            <div className="story-reading-lock-note">
              {allDone ? '✅ Next page unlocked!' : `${Object.keys(answers).length}/${pageQs.length} answered`}
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
