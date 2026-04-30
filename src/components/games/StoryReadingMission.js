import React, { useEffect, useMemo, useState } from 'react';
import { loadStoryChapter, loadStoryIndex, loadStoryReadingManifest } from '../../utils/storyReadingLoader';
import './EslReviewGames.css';

const optionLabel = (question, index) => {
  if (question.type === 'true_false') {
    return index === 0 ? 'True' : 'False';
  }
  return question.options[index];
};

const isCorrectChoice = (question, index) => {
  if (question.type === 'true_false') {
    return (index === 0) === question.answer;
  }
  return index === question.answerIndex;
};

const answerOptions = (question) => question.type === 'true_false' ? ['True', 'False'] : question.options || [];

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
  const pageAnswered = pageQuestions.length > 0 && pageQuestions.every((question) => answers[question.id]);
  const totalQuestions = useMemo(() => story?.chapters?.reduce((sum, item) => sum + (item.questionCount || 0), 0) || totalAnswered, [story, totalAnswered]);

  const handlePick = (question, index) => {
    if (answers[question.id]) return;

    const correct = isCorrectChoice(question, index);
    const selectedLabel = optionLabel(question, index);
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
        example: page.sourceText,
        explanation: question.explanation,
        category: question.reviewTopic,
        type: question.type,
      },
      selectedLabel
    );
  };

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

  return (
    <div className="esl-review-game story-reading-shell">
      <header className="esl-review-header">
        <button className="esl-review-back" onClick={onHome}>←</button>
        <div className="esl-review-title">
          <h1>Story Reading Mission</h1>
          <p>Read the page. Answer every question to unlock the next page.</p>
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
          {page.sourceText.split(/\n\s*\n/).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <section className="story-reading-questions" aria-label="Inline questions">
          {pageQuestions.map((question) => {
            const picked = answers[question.id];
            return (
              <div key={question.id} className="story-reading-question-card">
                <span className="esl-review-category">{question.reviewTopic}</span>
                <h3 className="esl-review-prompt">{question.prompt}</h3>
                <div className="story-reading-option-row">
                  {answerOptions(question).map((option, index) => {
                    const state = picked && (isCorrectChoice(question, index) ? 'correct' : picked.selectedIndex === index ? 'wrong' : '');
                    return (
                      <button
                        key={`${question.id}_${index}`}
                        className={`esl-review-option ${state}`}
                        onClick={() => handlePick(question, index)}
                        disabled={Boolean(picked)}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                {picked && (
                  <div className={`esl-review-feedback ${picked.correct ? 'correct' : 'wrong'}`}>
                    {picked.correct ? 'Correct!' : `Try to remember: ${question.explanation}`}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <div className="story-reading-nav">
          <div className="story-reading-lock-note">
            {pageAnswered ? 'Next page unlocked.' : 'Answer all questions to unlock the next page.'}
          </div>
          <button
            className={`esl-review-action story-reading-next ${pageAnswered ? '' : 'locked'}`}
            disabled={!pageAnswered}
            onClick={handleNext}
          >
            {story && chapterIndex === story.chapters.length - 1 && pageIndex === chapter.pages.length - 1 ? 'Finish Mission' : 'Next Page'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default StoryReadingMission;
