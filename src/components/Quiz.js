import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Lightbulb, CheckCircle, XCircle, ChevronRight, AlertTriangle, BookOpen } from 'lucide-react';
import './Quiz.css';

const QUESTION_TIME_LIMIT = 30; // 30 seconds per question

const Quiz = ({ selectedWordlist, questions, currentQuestionIndex, handleAnswer, answerHistory = [] }) => {
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(QUESTION_TIME_LIMIT);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const currentQuestion = questions[currentQuestionIndex];

  // Countdown timer
  useEffect(() => {
    if (isAnswered) return;
    
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - auto-submit wrong answer
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnswered, currentQuestionIndex]);

  const handleTimeUp = useCallback(() => {
    if (!isAnswered) {
      const responseTimeMs = QUESTION_TIME_LIMIT * 1000;
      setIsAnswered(true);
      setSelectedOption(null);
      setFeedback({
        isCorrect: false,
        correctAnswer: currentQuestion.word,
        timedOut: true
      });
      handleAnswer(null, responseTimeMs);
    }
  }, [isAnswered, currentQuestion, handleAnswer]);

  // Reset on question change
  useEffect(() => {
    setShowHint(false);
    setFeedback(null);
    setIsAnswered(false);
    setSelectedOption(null);
    setTimeRemaining(QUESTION_TIME_LIMIT);
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  // Memoized answer handler
  const onAnswer = useCallback((option) => {
    const responseTimeMs = Date.now() - questionStartTime;
    const correctAnswer = currentQuestion.word;
    const isCorrect = option === correctAnswer;
    setIsAnswered(true);
    setSelectedOption(option);
    setFeedback({
      isCorrect,
      correctAnswer
    });

    handleAnswer(option, responseTimeMs);
  }, [questionStartTime, currentQuestion, handleAnswer]);

  // Keyboard shortcuts for selecting options (1-4, A-D)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isAnswered) return;
      
      const key = event.key.toUpperCase();
      let optionIndex = -1;
      
      // Support 1, 2, 3, 4
      if (key >= '1' && key <= '4') {
        optionIndex = parseInt(key) - 1;
      }
      // Support A, B, C, D
      else if (key >= 'A' && key <= 'D') {
        optionIndex = key.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
      }
      
      // Select the option if valid
      if (optionIndex >= 0 && optionIndex < currentQuestion.options.length) {
        onAnswer(currentQuestion.options[optionIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, currentQuestion, onAnswer]);

  const handleHintClick = () => {
    setShowHint(true);
  };

  // Calculate progress segments
  const correctCount = answerHistory.filter(a => a?.isCorrect).length;
  const wrongCount = answerHistory.filter(a => a && !a.isCorrect).length;
  const totalAnswered = correctCount + wrongCount;
  const correctPercent = (correctCount / questions.length) * 100;
  const wrongPercent = (wrongCount / questions.length) * 100;

  // Timer urgency
  const isUrgent = timeRemaining <= 10;
  const isCritical = timeRemaining <= 5;

  return (
    <div className="quiz-container">
      {/* Segmented Progress Bar */}
      <div className="quiz-progress">
        <div className="progress-bar segmented">
          <div 
            className="progress-segment correct" 
            style={{ width: `${correctPercent}%` }} 
          />
          <div 
            className="progress-segment wrong" 
            style={{ width: `${wrongPercent}%` }} 
          />
        </div>
        <div className="progress-info">
          <span className="question-counter">
            <span className="current">{currentQuestionIndex + 1}</span>
            <span className="separator">/</span>
            <span className="total">{questions.length}</span>
            {totalAnswered > 0 && (
              <span className="score-mini">
                <span className="correct-count">✓{correctCount}</span>
                <span className="wrong-count">✗{wrongCount}</span>
              </span>
            )}
          </span>
          <span className={`timer ${isUrgent ? 'urgent' : ''} ${isCritical ? 'critical' : ''}`}>
            <Clock size={16} />
            <span className="time-value">{timeRemaining}s</span>
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="question-card">
        <div className="question-content">
          {/* Definition only - Example is hidden until hint */}
          <h2 className="definition">
            {currentQuestion.definition || currentQuestion.vietnamese}
          </h2>
        </div>

        <p className="question-prompt">What word is this?</p>

        {/* Answer Options */}
        <div className="options-grid">
          {currentQuestion.options.map((option, index) => {
            const isCorrect = option === currentQuestion.word;
            const isSelected = option === selectedOption;
            
            let optionClass = 'option-card';
            if (isAnswered) {
              if (isCorrect) {
                optionClass += ' correct';
              } else if (isSelected) {
                optionClass += ' incorrect';
              } else {
                optionClass += ' disabled';
              }
            }
            if (isSelected) {
              optionClass += ' selected';
            }

            return (
              <button
                key={option}
                onClick={() => !isAnswered && onAnswer(option)}
                disabled={isAnswered}
                className={optionClass}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="option-text">{option}</span>
                {isAnswered && isCorrect && <CheckCircle size={20} className="option-icon" />}
                {isAnswered && isSelected && !isCorrect && <XCircle size={20} className="option-icon" />}
              </button>
            );
          })}
        </div>

        {/* Hint Button - shows Example + Vietnamese */}
        {currentQuestion.definition && !isAnswered && !showHint && (
          <button className="hint-btn" onClick={handleHintClick}>
            <Lightbulb size={18} />
            <span>Show Hint</span>
          </button>
        )}

        {/* Hint Display - Example + Vietnamese */}
        {showHint && !isAnswered && (
          <div className="hint-bubble">
            <Lightbulb size={16} />
            <div className="hint-content">
              {currentQuestion.example && (
                <p className="hint-example">"{currentQuestion.example}"</p>
              )}
              {currentQuestion.vietnamese && (
                <p className="hint-vietnamese">{currentQuestion.vietnamese}</p>
              )}
            </div>
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div className={`feedback-card ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="feedback-header">
              {feedback.timedOut ? (
                <>
                  <AlertTriangle size={24} />
                  <span>Time's up! Answer: <strong>{feedback.correctAnswer}</strong></span>
                </>
              ) : feedback.isCorrect ? (
                <>
                  <CheckCircle size={24} />
                  <span>Correct! Well done!</span>
                </>
              ) : (
                <>
                  <XCircle size={24} />
                  <span>The answer is <strong>{feedback.correctAnswer}</strong></span>
                </>
              )}
              <ChevronRight size={20} className="next-icon" />
            </div>
            
            {/* Learning Context - Only show on wrong answer */}
            {!feedback.isCorrect && (
              <div className="learning-context">
                <div className="learning-header">
                  <BookOpen size={16} />
                  <span>Let's learn this word!</span>
                </div>
                {currentQuestion.example && (
                  <p className="learning-example">
                    <strong>Example:</strong> "{currentQuestion.example}"
                  </p>
                )}
                {currentQuestion.vietnamese && (
                  <p className="learning-vietnamese">
                    <strong>Meaning:</strong> {currentQuestion.vietnamese}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;