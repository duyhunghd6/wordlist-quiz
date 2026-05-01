import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
 * Simple inline blank — just a tappable span within the text.
 * No popup. Tapping sets the active question for the bottom panel.
 */
const InlineBlank = ({ question, picked, isSelected, onSelect }) => {
  const options = answerOptions(question);

  if (picked) {
    return (
      <span className={`srm-answered-blank ${picked.correct ? 'srm-correct' : 'srm-wrong'}`}>
        {options[picked.selectedIndex]}
      </span>
    );
  }

  return (
    <span
      className={`srm-blank-tap ${isSelected ? 'srm-blank-selected' : ''}`}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      ______
    </span>
  );
};

/**
 * Renders a question prompt as inline text with an interactive blank.
 */
const InlineQuestionText = ({ question, picked, isSelected, onSelect }) => {
  const parts = question.prompt.split('_____');

  const blankEl = (
    <InlineBlank
      question={question}
      picked={picked}
      isSelected={isSelected}
      onSelect={onSelect}
    />
  );

  const feedback = picked && (
    <span className={`srm-inline-feedback ${picked.correct ? 'srm-fb-correct' : 'srm-fb-wrong'}`}>
      {picked.correct ? ' ✓' : ` ✗ ${question.explanation}`}
    </span>
  );

  if (parts.length === 1) {
    return (
      <span className="srm-inline-q">
        {question.prompt}{' '}{blankEl}{feedback}
      </span>
    );
  }

  return (
    <span className="srm-inline-q">
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part}
          {i < parts.length - 1 && blankEl}
        </React.Fragment>
      ))}
      {feedback}
    </span>
  );
};

/**
 * Fixed bottom panel showing the answer options for the selected blank.
 * Big tappable buttons — stays visible, never covers the story text.
 */
const AnswerBottomPanel = ({ question, onPick }) => {
  const options = answerOptions(question);

  return (
    <div className="srm-bottom-panel">
      <div className="srm-bottom-prompt">{question.prompt.replace('_____', '______')}</div>
      <div className="srm-bottom-options">
        {options.map((opt, i) => (
          <button
            key={`${question.id}_${i}`}
            className="srm-bottom-option"
            onClick={() => onPick(i)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
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
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);

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
        setSelectedQuestionId(null);
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

  // The question object for the currently selected blank
  const selectedQuestion = useMemo(
    () => pageQuestions.find((q) => q.id === selectedQuestionId && !answers[q.id]),
    [pageQuestions, selectedQuestionId, answers]
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
      setSelectedQuestionId(null);

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
      setSelectedQuestionId(null);
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

      <main className="esl-review-card story-reading-card" style={{ paddingBottom: selectedQuestion ? '180px' : undefined }}>
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
                      <InlineQuestionText
                        question={question}
                        picked={picked}
                        isSelected={selectedQuestionId === question.id}
                        onSelect={() => setSelectedQuestionId(question.id)}
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

      {/* Fixed bottom panel — only shows when a blank is selected */}
      {selectedQuestion && (
        <AnswerBottomPanel
          question={selectedQuestion}
          onPick={(index) => handlePick(selectedQuestion, index)}
        />
      )}
    </div>
  );
};

export default StoryReadingMission;
