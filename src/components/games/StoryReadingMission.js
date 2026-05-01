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

/**
 * A single inline blank that lives inside the flowing text.
 * When active, it opens a scroll-picker popup (like Angry Tenses).
 * When answered, it shows the chosen word highlighted green/red.
 * When not yet active, it shows a simple underline blank.
 */
const InlineBlank = ({ question, isActive, picked, onConfirm }) => {
  const [activeOption, setActiveOption] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const viewportRef = useRef(null);
  const blankRef = useRef(null);

  const options = answerOptions(question);

  // Open picker when this blank becomes active
  useEffect(() => {
    if (isActive && !picked) {
      setPickerOpen(true);
      setActiveOption(0);
    } else {
      setPickerOpen(false);
    }
  }, [isActive, picked]);

  // Keyboard: arrows + enter
  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveOption((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveOption((prev) => Math.min(options.length - 1, prev + 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm(activeOption);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [pickerOpen, activeOption, options, onConfirm]);

  // Scroll viewport to active item
  useEffect(() => {
    if (pickerOpen && viewportRef.current && !viewportRef.current._userScrolling) {
      const itemH = 48;
      viewportRef.current.scrollTo({ top: activeOption * itemH, behavior: 'smooth' });
    }
  }, [pickerOpen, activeOption]);

  // Detect which item is centered when user scrolls
  useEffect(() => {
    if (!pickerOpen) return;
    const vp = viewportRef.current;
    if (!vp) return;
    let scrollTimer = null;
    const handleScroll = () => {
      vp._userScrolling = true;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        vp._userScrolling = false;
        const itemH = 48;
        const centered = Math.round(vp.scrollTop / itemH);
        if (centered >= 0 && centered < options.length) {
          setActiveOption(centered);
        }
      }, 80);
    };
    vp.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      vp.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
  }, [pickerOpen, options]);

  // Scroll the blank into view when it becomes active
  useEffect(() => {
    if (isActive && !picked && blankRef.current) {
      blankRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isActive, picked]);

  // Already answered
  if (picked) {
    return (
      <span
        className="srm-answered-blank"
        style={{
          background: picked.correct ? '#dcfce7' : '#fee2e2',
          color: picked.correct ? '#166534' : '#991b1b',
          padding: '2px 10px',
          borderRadius: '8px',
          fontWeight: 900,
          border: `2px solid ${picked.correct ? '#86efac' : '#fca5a5'}`,
        }}
      >
        {options[picked.selectedIndex]}
      </span>
    );
  }

  // Not yet active — just a plain blank
  if (!isActive) {
    return (
      <span className="srm-blank-placeholder" ref={blankRef}>
        {'_______'}
      </span>
    );
  }

  // Active — show the picker
  return (
    <span className="srm-active-blank-wrapper" ref={blankRef} style={{ position: 'relative', display: 'inline-block' }}>
      <span
        className="srm-blank-active"
        onClick={() => setPickerOpen(!pickerOpen)}
      >
        {options[activeOption]}
      </span>

      {pickerOpen && (
        <div className="srm-picker-popup">
          <div className="srm-picker-popup-arrow-up">▲</div>
          <div className="srm-picker-popup-viewport" ref={viewportRef}>
            <div className="srm-picker-popup-track">
              {options.map((opt, i) => (
                <div
                  key={`${question.id}_${i}`}
                  className={`srm-picker-popup-item ${i === activeOption ? 'srm-picker-popup-active' : ''}`}
                  onClick={() => setActiveOption(i)}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>
          <div className="srm-picker-popup-arrow-down">▼</div>
          <button
            className="srm-picker-confirm-btn"
            onClick={() => onConfirm(activeOption)}
          >
            ✓ Enter
          </button>
        </div>
      )}
    </span>
  );
};

/**
 * Renders a question prompt as inline flowing text with an interactive blank.
 * The prompt text like "Grunnings is a company _____ makes drills."
 * becomes flowing text with the _____ replaced by <InlineBlank />.
 *
 * For true_false questions (no _____), the entire prompt is shown
 * with a blank at the end for True/False selection.
 */
const InlineQuestionText = ({ question, isActive, picked, onConfirm }) => {
  const parts = question.prompt.split('_____');

  // If there's no blank in the prompt (e.g. true/false), put blank at end
  if (parts.length === 1) {
    return (
      <span className="srm-inline-question-text">
        <span>{question.prompt} </span>
        <InlineBlank
          question={question}
          isActive={isActive}
          picked={picked}
          onConfirm={onConfirm}
        />
        {picked && (
          <span className="srm-inline-feedback" style={{ color: picked.correct ? '#166534' : '#991b1b', fontSize: '0.85em' }}>
            {picked.correct ? ' ✓' : ` ✗ ${question.explanation}`}
          </span>
        )}
      </span>
    );
  }

  return (
    <span className="srm-inline-question-text">
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          <span>{part}</span>
          {i < parts.length - 1 && (
            <InlineBlank
              question={question}
              isActive={isActive}
              picked={picked}
              onConfirm={onConfirm}
            />
          )}
        </React.Fragment>
      ))}
      {picked && (
        <span className="srm-inline-feedback" style={{ color: picked.correct ? '#166534' : '#991b1b', fontSize: '0.85em' }}>
          {picked.correct ? ' ✓' : ` ✗ ${question.explanation}`}
        </span>
      )}
    </span>
  );
};

const StoryReadingMission = ({ onAnswer, onComplete, onHome }) => {
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

  useEffect(() => {
    let cancelled = false;

    async function loadInitialStory() {
      try {
        setLoading(true);
        const manifest = await loadStoryReadingManifest();
        const loaded = await loadStoryIndex(manifest);
        if (cancelled) return;
        setStory(loaded.story);
        setStoryBasePath(loaded.storyBasePath);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadInitialStory();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadChapter() {
      if (!story || !storyBasePath) return;
      try {
        setLoading(true);
        const loadedChapter = await loadStoryChapter(storyBasePath, story.chapters[chapterIndex]);
        if (cancelled) return;
        setChapter(loadedChapter);
        setPageIndex(0);
        setAnswers({});
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadChapter();
    return () => { cancelled = true; };
  }, [story, storyBasePath, chapterIndex]);

  const page = chapter?.pages?.[pageIndex];
  const pageQuestions = useMemo(() => page?.inlineQuestions || [], [page]);
  const pageAnswered = pageQuestions.length > 0 && pageQuestions.every((q) => answers[q.id]);
  const activeQuestionIndex = pageQuestions.findIndex((q) => !answers[q.id]);
  const totalQuestions = useMemo(
    () => story?.chapters?.reduce((sum, item) => sum + (item.questionCount || 0), 0) || totalAnswered,
    [story, totalAnswered]
  );

  const handlePick = useCallback(
    (question, index) => {
      if (answers[question.id]) return;

      const correct = isCorrectChoice(question, index);
      const selectedLabel =
        question.type === 'true_false'
          ? index === 0
            ? 'True'
            : 'False'
          : question.options[index];

      setAnswers((current) => ({
        ...current,
        [question.id]: { selectedIndex: index, correct },
      }));
      setTotalAnswered((current) => current + 1);
      setCorrectCount((current) => current + (correct ? 1 : 0));

      onAnswer(
        question.id,
        correct,
        3000,
        {
          word: question.id,
          definition: question.prompt,
          example: page?.sourceText,
          explanation: question.explanation,
          category: question.reviewTopic,
          type: question.type,
        },
        selectedLabel
      );
    },
    [answers, onAnswer, page]
  );

  const finishMission = (nextCorrectCount = correctCount, nextTotalAnswered = totalAnswered) => {
    const score = nextTotalAnswered > 0 ? Math.round((nextCorrectCount / nextTotalAnswered) * 100) : 0;
    onComplete({ score, totalQuestions: nextTotalAnswered, correctCount: nextCorrectCount });
  };

  const handleNext = () => {
    if (!pageAnswered) return;
    if (chapter && pageIndex < chapter.pages.length - 1) {
      setPageIndex((current) => current + 1);
      setAnswers({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (story && chapterIndex < story.chapters.length - 1) {
      setChapterIndex((current) => current + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    finishMission();
  };

  if (loading && !page) {
    return (
      <div className="esl-review-game story-reading-shell">
        <div className="esl-review-card">
          <p className="esl-review-prompt">Loading your story mission...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="esl-review-game story-reading-shell">
        <div className="esl-review-card">
          <p className="esl-review-prompt">Story mission is not ready yet.</p>
          {error && <div className="esl-review-feedback wrong">{error}</div>}
          <button className="esl-review-action" onClick={onHome}>Back home</button>
        </div>
      </div>
    );
  }

  const chapterProgress = story ? `Chapter ${chapterIndex + 1} of ${story.chapters.length}` : '';
  const pageProgress = `Page ${pageIndex + 1} of ${chapter.pages.length}`;

  // Build the mixed content: story paragraphs with question prompts distributed inline
  const paragraphs = page.sourceText.split(/\n\s*\n/);
  const numQs = pageQuestions.length;
  const numParas = paragraphs.length;

  // Assign each question to appear after a paragraph
  // Evenly distribute across the paragraphs
  const questionsByParagraph = Array.from({ length: numParas }, () => []);
  if (numQs > 0 && numParas > 0) {
    pageQuestions.forEach((q, i) => {
      // Spread evenly: question i goes after paragraph at proportional position
      const pos = Math.min(
        Math.floor(((i + 1) / numQs) * numParas) - 1,
        numParas - 1
      );
      const safePos = Math.max(0, pos);
      questionsByParagraph[safePos].push(q);
    });
  }

  return (
    <div className="esl-review-game story-reading-shell">
      <header className="esl-review-header">
        <button className="esl-review-back" onClick={onHome}>←</button>
        <div className="esl-review-title">
          <h1>Story Reading Mission</h1>
          <p>Read the story. Fill in the blanks to unlock the next page.</p>
        </div>
      </header>

      <main className="esl-review-card story-reading-card">
        <div className="esl-review-progress">
          <span>{chapterProgress}</span>
          <span>{correctCount} / {totalQuestions || '?'} correct</span>
        </div>
        <span className="esl-review-category">{pageProgress}</span>
        <h2 className="story-reading-chapter-title">{chapter.title}</h2>
        <p className="story-reading-date">{chapter.dateLabel}</p>

        {/* Story text with inline questions */}
        <div className="story-reading-page-text">
          {paragraphs.map((para, pIdx) => (
            <React.Fragment key={`p${pIdx}`}>
              <p>{para}</p>
              {questionsByParagraph[pIdx].map((question) => {
                const qIdx = pageQuestions.indexOf(question);
                const picked = answers[question.id];
                const isActive = qIdx === activeQuestionIndex;
                return (
                  <p key={question.id} className="srm-question-line">
                    <InlineQuestionText
                      question={question}
                      isActive={isActive}
                      picked={picked}
                      onConfirm={(optIndex) => handlePick(question, optIndex)}
                    />
                  </p>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        <div className="story-reading-nav">
          <div className="story-reading-lock-note">
            {pageAnswered ? '✅ Next page unlocked!' : `Answer all blanks to unlock the next page (${Object.keys(answers).length}/${pageQuestions.length})`}
          </div>
          <button
            className={`esl-review-action story-reading-next ${pageAnswered ? '' : 'locked'}`}
            disabled={!pageAnswered}
            onClick={handleNext}
          >
            {story && chapterIndex === story.chapters.length - 1 && pageIndex === chapter.pages.length - 1 ? 'Finish Mission' : 'Next Page →'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default StoryReadingMission;
