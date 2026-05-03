import React, { useMemo, useState } from 'react';
import { makeReviewResultQuestion } from '../../utils/eslReviewNormalizer';
import './EslReviewGames.css';

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

const EslMatchingGame = ({ words, numQuestions, isAllQuestions = false, eslReviewQuestions, onAnswer, onComplete, onHome }) => {
  const questions = useMemo(() => {
    const bank = eslReviewQuestions?.banks?.matching || [];
    const count = isAllQuestions ? bank.length : Math.min(numQuestions || words?.length || 10, bank.length);
    return shuffle(bank).slice(0, count);
  }, [eslReviewQuestions, words?.length, numQuestions, isAllQuestions]);
  const answers = useMemo(() => shuffle(questions.map((q) => ({ id: q.id, text: q.correctAnswer }))), [questions]);
  const [activeTermId, setActiveTermId] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  const [missedTermIds, setMissedTermIds] = useState([]);
  const [wrongId, setWrongId] = useState(null);
  const [score, setScore] = useState(0);

  if (!questions.length) {
    return (
      <div className="esl-review-game">
        <div className="esl-review-card">
          <p className="esl-review-prompt">Matching questions are still loading.</p>
          <button className="esl-review-action" onClick={onHome}>Back home</button>
        </div>
      </div>
    );
  }

  const handleAnswer = (answer) => {
    if (!activeTermId || matchedIds.includes(answer.id)) return;
    const question = questions.find((q) => q.id === activeTermId);
    if (!question) return;

    const isCorrect = question.id === answer.id;
    onAnswer?.(question.correctAnswer, isCorrect, 3000, makeReviewResultQuestion(question), answer.text);
    if (isCorrect) {
      const nextMatched = [...matchedIds, answer.id];
      const nextScore = missedTermIds.includes(question.id) ? score : score + 1;
      setMatchedIds(nextMatched);
      setScore(nextScore);
      setActiveTermId(null);
      if (nextMatched.length === questions.length) {
        setTimeout(() => onComplete?.({ score: Math.round((nextScore / questions.length) * 100), totalQuestions: questions.length, correctCount: nextScore }), 700);
      }
    } else {
      setMissedTermIds((ids) => ids.includes(question.id) ? ids : [...ids, question.id]);
      setWrongId(answer.id);
      setTimeout(() => setWrongId(null), 700);
    }
  };

  return (
    <div className="esl-review-game">
      <header className="esl-review-header">
        <button className="esl-review-back" onClick={onHome}>←</button>
        <div className="esl-review-title">
          <h1>ESL Matching</h1>
          <p>Tap a word, then tap its meaning.</p>
        </div>
      </header>

      <div className="esl-review-panel esl-review-progress">
        <span>{matchedIds.length} of {questions.length} matched</span>
        <span>{score} first try</span>
      </div>

      <main className="esl-review-matching-board">
        <section className="esl-review-column">
          {questions.map((question) => (
            <button
              key={question.id}
              className={`esl-review-match-card ${activeTermId === question.id ? 'active' : ''} ${matchedIds.includes(question.id) ? 'done' : ''}`}
              onClick={() => !matchedIds.includes(question.id) && setActiveTermId(question.id)}
            >
              {question.term}
            </button>
          ))}
        </section>
        <section className="esl-review-column">
          {answers.map((answer) => (
            <button
              key={answer.id}
              className={`esl-review-match-card ${matchedIds.includes(answer.id) ? 'done' : ''} ${wrongId === answer.id ? 'wrong' : ''}`}
              onClick={() => handleAnswer(answer)}
            >
              {answer.text}
            </button>
          ))}
        </section>
      </main>
    </div>
  );
};

export default EslMatchingGame;
