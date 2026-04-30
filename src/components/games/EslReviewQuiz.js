import React, { useMemo, useState } from 'react';
import { makeReviewResultQuestion } from '../../utils/eslReviewNormalizer';
import './EslReviewGames.css';

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const EslReviewQuiz = ({ eslReviewQuestions, onAnswer, onComplete, onHome, selectedUnits = [], words = [] }) => {
  const questions = useMemo(() => {
    const banks = eslReviewQuestions?.banks || {};
    const multipleChoice = banks.multiple_choice || [];
    const simpleGrammar = (banks.grammar_completion || [])
      .filter((item) => !item.correctAnswer.includes(';'))
      .slice(0, 20)
      .map((item, _, grammarItems) => {
        const distractors = item.wordBank.length > 1
          ? item.wordBank
          : grammarItems.map((grammarItem) => grammarItem.correctAnswer).filter((answer) => answer !== item.correctAnswer);
        return { ...item, options: shuffle([...new Set([item.correctAnswer, ...distractors])]).slice(0, 4) };
      });
    return shuffle([...multipleChoice, ...simpleGrammar]).slice(0, words.length || 20);
  }, [eslReviewQuestions, words.length]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const current = questions[index];

  if (!current) {
    return (
      <div className="esl-review-game">
        <div className="esl-review-card">
          <p className="esl-review-prompt">ESL review questions are still loading.</p>
          <button className="esl-review-action" onClick={onHome}>Back home</button>
        </div>
      </div>
    );
  }

  const finish = (nextScore) => {
    onComplete({ score: Math.round((nextScore / questions.length) * 100), totalQuestions: questions.length, correctCount: nextScore });
  };

  const handleSelect = (option) => {
    if (selected) return;
    const isCorrect = option === current.correctAnswer;
    const nextScore = isCorrect ? score + 1 : score;
    setSelected(option);
    setScore(nextScore);
    onAnswer(current.correctAnswer, isCorrect, 3000, makeReviewResultQuestion(current), option);
    setTimeout(() => {
      if (index < questions.length - 1) {
        setIndex(index + 1);
        setSelected(null);
      } else {
        finish(nextScore);
      }
    }, isCorrect ? 900 : 1700);
  };

  return (
    <div className="esl-review-game">
      <header className="esl-review-header">
        <button className="esl-review-back" onClick={onHome}>←</button>
        <div className="esl-review-title">
          <h1>Review Quiz</h1>
          <p>{selectedUnits.length ? `Units ${selectedUnits.join(', ')}` : 'ESL Review Tenses'}</p>
        </div>
      </header>

      <main className="esl-review-card">
        <div className="esl-review-progress">
          <span>Question {index + 1} of {questions.length}</span>
          <span>{score} correct</span>
        </div>
        <span className="esl-review-category">{current.category}</span>
        {current.passage && <div className="esl-review-passage">{current.passage}</div>}
        <h2 className="esl-review-prompt">{current.prompt}</h2>
        <div className="esl-review-options">
          {current.options.map((option) => {
            const state = selected && (option === current.correctAnswer ? 'correct' : option === selected ? 'wrong' : '');
            return (
              <button key={option} className={`esl-review-option ${state}`} onClick={() => handleSelect(option)}>
                {option}
              </button>
            );
          })}
        </div>
        {selected && (
          <div className={`esl-review-feedback ${selected === current.correctAnswer ? 'correct' : 'wrong'}`}>
            {selected === current.correctAnswer ? 'Great choice!' : `Good try. Correct answer: ${current.correctAnswer}`}
          </div>
        )}
      </main>
    </div>
  );
};

export default EslReviewQuiz;
