import React, { useMemo, useState } from 'react';
import { makeReviewResultQuestion } from '../../utils/eslReviewNormalizer';
import './EslReviewGames.css';

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const sentenceOptions = (question, allQuestions) => {
  const answers = [question.correctAnswer, ...shuffle(allQuestions.map((q) => q.correctAnswer).filter((answer) => answer !== question.correctAnswer))].filter(Boolean);
  return [...new Set(answers)].slice(0, 4);
};

const ReadingExplorer = ({ eslReviewQuestions, onAnswer, onComplete, onHome, words = [], numQuestions = 10, isAllQuestions = false }) => {
  const questions = useMemo(() => {
    const banks = eslReviewQuestions?.banks || {};
    const readingChoices = (banks.multiple_choice || []).filter((q) => q.category?.startsWith('Reading'));
    const items = shuffle([...(banks.reading_find_words || []), ...(banks.reading_short_answer || []), ...readingChoices]);
    const count = isAllQuestions ? items.length : Math.min(numQuestions || words.length || 10, items.length);
    return items.slice(0, count);
  }, [eslReviewQuestions, isAllQuestions, numQuestions, words.length]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const current = questions[index];

  if (!current) {
    return (
      <div className="esl-review-game">
        <div className="esl-review-card">
          <p className="esl-review-prompt">Reading questions are still loading.</p>
          <button className="esl-review-action" onClick={onHome}>Back home</button>
        </div>
      </div>
    );
  }

  const options = current.options?.length > 1 ? current.options : sentenceOptions(current, questions);
  const highlightedPassage = selected === current.correctAnswer && current.passage
    ? current.passage.split(new RegExp(`(${current.correctAnswer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i'))
    : [current.passage || ''];

  const handlePick = (choice) => {
    if (selected) return;
    const isCorrect = choice === current.correctAnswer;
    const nextScore = isCorrect ? score + 1 : score;
    setSelected(choice);
    setScore(nextScore);
    onAnswer(current.correctAnswer, isCorrect, 3000, makeReviewResultQuestion(current), choice);
    setTimeout(() => {
      if (index < questions.length - 1) {
        setIndex(index + 1);
        setSelected(null);
      } else {
        onComplete({ score: Math.round((nextScore / questions.length) * 100), totalQuestions: questions.length, correctCount: nextScore });
      }
    }, isCorrect ? 1000 : 1900);
  };

  return (
    <div className="esl-review-game">
      <header className="esl-review-header">
        <button className="esl-review-back" onClick={onHome}>←</button>
        <div className="esl-review-title">
          <h1>Reading Explorer</h1>
          <p>Read the passage, then choose the best card.</p>
        </div>
      </header>

      <main className="esl-review-card">
        <div className="esl-review-progress">
          <span>Mission {index + 1} of {questions.length}</span>
          <span>{score} correct</span>
        </div>
        <span className="esl-review-category">{current.category}</span>
        <div className="esl-review-passage">
          {highlightedPassage.map((part, partIndex) => (
            part.toLowerCase() === current.correctAnswer.toLowerCase()
              ? <span key={partIndex} className="esl-review-highlight">{part}</span>
              : <React.Fragment key={partIndex}>{part}</React.Fragment>
          ))}
        </div>
        <h2 className="esl-review-prompt">{current.prompt}</h2>
        <div className="esl-review-options">
          {options.map((option) => {
            const state = selected && (option === current.correctAnswer ? 'correct' : option === selected ? 'wrong' : '');
            return (
              <button key={option} className={`esl-review-option ${state}`} onClick={() => handlePick(option)}>
                {option}
              </button>
            );
          })}
        </div>
        {selected && (
          <div className={`esl-review-feedback ${selected === current.correctAnswer ? 'correct' : 'wrong'}`}>
            {selected === current.correctAnswer ? 'You found it!' : `Correct answer: ${current.correctAnswer}`}
          </div>
        )}
      </main>
    </div>
  );
};

export default ReadingExplorer;
