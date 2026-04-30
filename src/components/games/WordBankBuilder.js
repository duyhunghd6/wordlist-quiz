import React, { useMemo, useState } from 'react';
import { makeReviewResultQuestion } from '../../utils/eslReviewNormalizer';
import './EslReviewGames.css';

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const blankPattern = /_{3,}|____________________|\(\d+\)/;

const renderPrompt = (question, selected) => {
  const value = selected || 'Tap a word';
  const text = question.passage || question.sentence || question.prompt;
  if (question.passage) {
    return text.replace(new RegExp(`_{3,}\\s*\\(${question.question_number}\\)`), `[${value}]`);
  }
  return text.replace(blankPattern, `[${value}]`);
};

const WordBankBuilder = ({ eslReviewQuestions, onAnswer, onComplete, onHome, words = [] }) => {
  const questions = useMemo(() => {
    const banks = eslReviewQuestions?.banks || {};
    const items = [
      ...(banks.fill_given_words || []),
      ...(banks.fill_passage || []),
      ...(banks.grammar_completion || []).filter((q) => q.wordBank.length > 0 || !q.correctAnswer.includes(';')),
    ];
    return shuffle(items).slice(0, words.length || 20);
  }, [eslReviewQuestions, words.length]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const current = questions[index];

  if (!current) {
    return (
      <div className="esl-review-game">
        <div className="esl-review-card">
          <p className="esl-review-prompt">Word bank questions are still loading.</p>
          <button className="esl-review-action" onClick={onHome}>Back home</button>
        </div>
      </div>
    );
  }

  const choices = current.wordBank.length
    ? current.wordBank
    : [...new Set([current.correctAnswer, ...questions.map((question) => question.correctAnswer).filter((answer) => answer !== current.correctAnswer)])].slice(0, 4);

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
    }, isCorrect ? 900 : 1700);
  };

  return (
    <div className="esl-review-game">
      <header className="esl-review-header">
        <button className="esl-review-back" onClick={onHome}>←</button>
        <div className="esl-review-title">
          <h1>Word Bank Builder</h1>
          <p>Pick one word for the highlighted blank.</p>
        </div>
      </header>

      <main className="esl-review-card">
        <div className="esl-review-progress">
          <span>Blank {index + 1} of {questions.length}</span>
          <span>{score} correct</span>
        </div>
        <span className="esl-review-category">{current.category}</span>
        <div className={current.passage ? 'esl-review-passage' : 'esl-review-prompt'}>
          {renderPrompt(current, selected).split(/(\[[^\]]+\])/).map((part, partIndex) => (
            part.startsWith('[') ? <span key={partIndex} className="esl-review-blank">{part.slice(1, -1)}</span> : <React.Fragment key={partIndex}>{part}</React.Fragment>
          ))}
        </div>
        <div className="esl-review-chip-row">
          {choices.map((choice) => {
            const state = selected && (choice === current.correctAnswer ? 'correct' : choice === selected ? 'wrong' : '');
            return (
              <button key={choice} className={`esl-review-chip ${state}`} onClick={() => handlePick(choice)}>
                {choice}
              </button>
            );
          })}
        </div>
        {selected && (
          <div className={`esl-review-feedback ${selected === current.correctAnswer ? 'correct' : 'wrong'}`}>
            {selected === current.correctAnswer ? 'Nice building!' : `Correct answer: ${current.correctAnswer}`}
          </div>
        )}
      </main>
    </div>
  );
};

export default WordBankBuilder;
