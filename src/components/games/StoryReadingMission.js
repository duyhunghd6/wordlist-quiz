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
 * ALL blanks are interactive at all times — the kid taps whichever one they want.
 * Tapping opens a scroll-picker popup right below the blank.
 */
const InlineBlank = ({ question, picked, onConfirm, openBlankId, setOpenBlankId }) => {
  const [activeOption, setActiveOption] = useState(0);
  const viewportRef = useRef(null);
  const blankRef = useRef(null);

  const options = answerOptions(question);
  const isOpen = openBlankId === question.id && !picked;

  // Keyboard: arrows + enter (only when THIS blank's picker is open)
  useEffect(() => {
    if (!isOpen) return;
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
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setOpenBlankId(null);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, activeOption, options, onConfirm, setOpenBlankId]);

  // Scroll viewport to active item
  useEffect(() => {
    if (isOpen && viewportRef.current && !viewportRef.current._userScrolling) {
      const itemH = 48;
      viewportRef.current.scrollTo({ top: activeOption * itemH, behavior: 'smooth' });
    }
  }, [isOpen, activeOption]);

  // Detect which item is centered when user scrolls the picker
  useEffect(() => {
    if (!isOpen) return;
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
  }, [isOpen, options]);

  // Already answered — show the chosen word inline
  if (picked) {
    return (
      <span className={`srm-answered-blank ${picked.correct ? 'srm-correct' : 'srm-wrong'}`}>
        {options[picked.selectedIndex]}
      </span>
    );
  }

  // Unanswered blank — always tappable
  const handleTap = () => {
    if (isOpen) {
      setOpenBlankId(null);
    } else {
      setActiveOption(0);
      setOpenBlankId(question.id);
      // Scroll into view after a tick so picker is visible
      setTimeout(() => {
        blankRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  };

  return (
    <span className="srm-active-blank-wrapper" ref={blankRef}>
      <span className={`srm-blank-tap ${isOpen ? 'srm-blank-open' : ''}`} onClick={handleTap}>
        {isOpen ? options[activeOption] : '______'}
      </span>

      {isOpen && (
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
 * Blends seamlessly into the story text — no cards, no borders, no visual break.
 */
const InlineQuestionText = ({ question, picked, onConfirm, openBlankId, setOpenBlankId }) => {
  const options = answerOptions(question);
  const parts = question.prompt.split('_____');

  const blankElement = (
    <InlineBlank
      question={question}
      picked={picked}
      onConfirm={onConfirm}
      openBlankId={openBlankId}
      setOpenBlankId={setOpenBlankId}
    />
  );

  const feedbackElement = picked && (
    <span className={`srm-inline-feedback ${picked.correct ? 'srm-fb-correct' : 'srm-fb-wrong'}`}>
      {picked.correct ? ' ✓' : ` ✗ ${question.explanation}`}
    </span>
  );

  // true_false or no blank in prompt — put blank at end
  if (parts.length === 1) {
    return (
      <span className="srm-inline-q">
        {question.prompt}{' '}
        {blankElement}
        {feedbackElement}
      </span>
    );
  }

  // Fill-in-the-blank — replace _____ with interactive blank
  return (
    <span className="srm-inline-q">
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 && blankElement}
        </React.Fragment>
      ))}
      {feedbackElement}
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
  // Which blank's picker is currently open (only one at a time)
  const [openBlankId, setOpenBlankId] = useState(null);

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
        setOpenBlankId(null);
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
          ? index === 0 ? 'True' : 'False'
          : question.options[index];

      setAnswers((current) => ({
        ...current,
        [question.id]: { selectedIndex: index, correct },
      }));
      setTotalAnswered((current) => current + 1);
      setCorrectCount((current) => current + (correct ? 1 : 0));
      setOpenBlankId(null); // Close picker after answering

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
      setOpenBlankId(null);
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

  // Distribute questions evenly among paragraphs
  const paragraphs = page.sourceText.split(/\n\s*\n/);
  const numQs = pageQuestions.length;
  const numParas = paragraphs.length;
  const questionsByParagraph = Array.from({ length: numParas }, () => []);
  if (numQs > 0 && numParas > 0) {
    pageQuestions.forEach((q, i) => {
      const pos = Math.min(Math.floor(((i + 1) / numQs) * numParas) - 1, numParas - 1);
      questionsByParagraph[Math.max(0, pos)].push(q);
    });
  }

  return (
    <div className="esl-review-game story-reading-shell">
      <header className="esl-review-header">
        <button className="esl-review-back" onClick={onHome}>←</button>
        <div className="esl-review-title">
          <h1>Story Reading Mission</h1>
          <p>Read the story. Tap any blank to answer!</p>
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

        {/* Story text flows continuously — questions blend in as sentences */}
        <div className="story-reading-page-text">
          {paragraphs.map((para, pIdx) => (
            <React.Fragment key={`p${pIdx}`}>
              <p>
                {para}
                {/* Questions for this paragraph appear as continuing sentences */}
                {questionsByParagraph[pIdx].map((question) => {
                  const picked = answers[question.id];
                  return (
                    <React.Fragment key={question.id}>
                      {' '}
                      <InlineQuestionText
                        question={question}
                        picked={picked}
                        onConfirm={(optIndex) => handlePick(question, optIndex)}
                        openBlankId={openBlankId}
                        setOpenBlankId={setOpenBlankId}
                      />
                    </React.Fragment>
                  );
                })}
              </p>
            </React.Fragment>
          ))}
        </div>

        <div className="story-reading-nav">
          <div className="story-reading-lock-note">
            {pageAnswered
              ? '✅ Next page unlocked!'
              : `Tap the blanks to answer (${Object.keys(answers).length}/${pageQuestions.length})`}
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
