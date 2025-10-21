import React, { useState, useEffect } from 'react';
import './Quiz.css';

const Quiz = ({ selectedWordlist, questions, currentQuestionIndex, handleAnswer }) => {
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timer, setTimer] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setShowHint(false);
    setFeedback('');
    setIsAnswered(false);
    setSelectedOption(null);
    setTimer(0);
  }, [currentQuestionIndex]);

  const onAnswer = option => {
    const correctAnswer = currentQuestion.word;
    const isCorrect = option === correctAnswer;
    setIsAnswered(true);
    setSelectedOption(option);
    setFeedback(isCorrect ? 'Correct!' : `Wrong! The answer is ${correctAnswer}`);

    handleAnswer(option);
  };

  const handleHint = () => {
    setShowHint(true);
    setTimeout(() => setShowHint(false), 3000);
  };

  return (
    <div className="quiz">
      <h1>Quiz of {selectedWordlist.replace('wordlist_', '').toUpperCase()} Words</h1>
      <p>
        Question {currentQuestionIndex + 1} of {questions.length} | {Math.floor(timer / 60)}:
        {String(timer % 60).padStart(2, '0')}
      </p>
      {currentQuestion.definition || currentQuestion.example ? (
        <>
          <p className="definition">{currentQuestion.definition}</p>
          {currentQuestion.example && <p className="example">Example: {currentQuestion.example}</p>}
        </>
      ) : (
        <p className="definition">{currentQuestion.vietnamese}</p>
      )}
      <p>What word is being mentioned?</p>
      <div className="options">
        {currentQuestion.options.map(option => {
          const isCorrect = option === currentQuestion.word;
          const isSelected = option === selectedOption;
          let className = '';
          if (isAnswered) {
            if (isCorrect) {
              className = 'correct-answer';
            } else if (isSelected) {
              className = 'wrong-answer';
            }
          }
          if (isSelected) {
            className += ' selected';
          }

          return (
            <button
              key={option}
              onClick={() => onAnswer(option)}
              disabled={isAnswered}
              className={className}
            >
              {option}
            </button>
          );
        })}
      </div>
      {currentQuestion.definition || currentQuestion.example ? (
        <>
          <button onClick={handleHint}>Hint</button>
          {showHint && <p>{currentQuestion.vietnamese}</p>}
        </>
      ) : null}
      {feedback && (
        <p className={`feedback ${feedback.includes('Correct') ? 'correct' : 'incorrect'}`}>
          {feedback}
        </p>
      )}
    </div>
  );
};

export default Quiz;