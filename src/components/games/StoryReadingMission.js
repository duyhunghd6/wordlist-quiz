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
 * Inline blank + expandable options that appear RIGHT below the sentence.
 * The kid's eyes never leave the reading position.
 * - Tap blank → options expand inline (pushing text down)
 * - Tap an option → answer fills in, options collapse
 * - Tapping story text does NOT collapse the options
 */
const InlineQuestionBlock = ({ question, picked, onPick, isExpanded, onExpand }) => {
  const options = answerOptions(question);
  const blockRef = useRef(null);
  const parts = question.prompt.split('_____');

  // Scroll the block into comfortable view when expanded
  useEffect(() => {
    if (isExpanded && !picked && blockRef.current) {
      blockRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isExpanded, picked]);

  // Build the inline sentence with blank
  const blankEl = picked ? (
    <span className={`srm-answered-blank ${picked.correct ? 'srm-correct' : 'srm-wrong'}`}>
      {options[picked.selectedIndex]}
    </span>
  ) : (
    <span
      className={`srm-blank-tap ${isExpanded ? 'srm-blank-selected' : ''}`}
      onClick={(e) => { e.stopPropagation(); onExpand(); }}
    >
      ______
    </span>
  );

  const feedback = picked && (
    <span className={`srm-inline-feedback ${picked.correct ? 'srm-fb-correct' : 'srm-fb-wrong'}`}>
      {picked.correct ? ' ✓' : ` ✗ ${question.explanation}`}
    </span>
  );

  // Render sentence
  let sentenceContent;
  if (parts.length === 1) {
    sentenceContent = <>{question.prompt}{' '}{blankEl}{feedback}</>;
  } else {
    sentenceContent = (
      <>
        {parts.map((part, i) => (
          <React.Fragment key={i}>
            {part}
            {i < parts.length - 1 && blankEl}
          </React.Fragment>
        ))}
        {feedback}
      </>
    );
  }

  return (
    <span className="srm-question-block" ref={blockRef}>
      <span className="srm-inline-q">{sentenceContent}</span>
      {/* Options expand RIGHT HERE — inline in the text flow */}
      {isExpanded && !picked && (
        <span className="srm-inline-options" onClick={(e) => e.stopPropagation()}>
          {options.map((opt, i) => (
            <button
              key={`${question.id}_${i}`}
              className="srm-inline-option-btn"
              onClick={() => onPick(i)}
            >
              {opt}
            </button>
          ))}
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
  const [expandedId, setExpandedId] = useState(null);

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
        setExpandedId(null);
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
      setExpandedId(null);

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
      setExpandedId(null);
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

        <div className="story-reading-page-text">
          {paragraphs.map((para, pIdx) => (
            <React.Fragment key={`p${pIdx}`}>
              <p>
                {para}
                {questionsByParagraph[pIdx].map((question) => {
                  const picked = answers[question.id];
                  return (
                    <React.Fragment key={question.id}>
                      {' '}
                      <InlineQuestionBlock
                        question={question}
                        picked={picked}
                        isExpanded={expandedId === question.id}
                        onExpand={() => setExpandedId(question.id)}
                        onPick={(optIndex) => handlePick(question, optIndex)}
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
