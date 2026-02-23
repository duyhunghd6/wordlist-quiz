import React, { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, XCircle, Home, Lightbulb, BookOpen, AlertTriangle, ChevronRight } from 'lucide-react';

const QUESTION_TIME_LIMIT = 30; // 30 seconds per question

const Quiz = ({ selectedWordlist, questions, currentQuestionIndex, handleAnswer, answerHistory = [], onHome }) => {
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isAnswered) return;
      const key = event.key.toUpperCase();
      let optionIndex = -1;
      if (key >= '1' && key <= '4') optionIndex = parseInt(key) - 1;
      else if (key >= 'A' && key <= 'D') optionIndex = key.charCodeAt(0) - 65;
      
      if (optionIndex >= 0 && optionIndex < currentQuestion.options.length) {
        onAnswer(currentQuestion.options[optionIndex]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, currentQuestion, onAnswer]);

  const correctCount = answerHistory.filter(a => a?.isCorrect).length;
  const isUrgent = timeRemaining <= 10;
  const isCritical = timeRemaining <= 5;
  const timerPercent = (timeRemaining / QUESTION_TIME_LIMIT) * 100;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* HUD Header */}
      <div className="game-hud" style={{ width: '100%', maxWidth: '100%' }}>
        <button className="hud-btn" onClick={onHome} aria-label="Go home">
          <Home size={20} />
        </button>
        
        <div style={{ flex: 1, margin: '0 var(--space-md)' }}>
          <div className={`timer-container ${isUrgent ? 'urgent' : ''}`}>
            <div 
              className={`timer-bar ${isCritical ? 'danger pulse' : isUrgent ? 'warning' : 'safe'}`} 
              style={{ width: `${timerPercent}%` }}
            />
            <div className="timer-icon"><Clock size={16} /></div>
          </div>
        </div>

        <div className="score-pill">
          <span style={{ fontSize: '18px' }}>⭐</span>
          <span className="score-text">{correctCount}</span>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '-10px' }}>
        <span className="badge badge-neutral">Question {currentQuestionIndex + 1} of {questions.length}</span>
      </div>

      {/* Question Card */}
      <div className="card shadow-md" style={{ width: '100%', padding: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: '1.5rem', textAlign: 'center', margin: '0 0 var(--space-xl) 0', color: 'var(--color-text-primary)' }}>
          {currentQuestion.definition || currentQuestion.vietnamese}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {currentQuestion.options.map((option, index) => {
            const isCorrect = option === currentQuestion.word;
            const isSelected = option === selectedOption;
            
            let btnClass = 'quiz-option';
            if (isAnswered) {
              if (isCorrect) btnClass += ' correct';
              else if (isSelected) btnClass += ' wrong';
              else btnClass += ' disabled';
            } else if (isSelected) {
              btnClass += ' selected';
            }

            return (
              <button
                key={option}
                onClick={() => !isAnswered && onAnswer(option)}
                disabled={isAnswered}
                className={btnClass}
                style={{ opacity: isAnswered && !isCorrect && !isSelected ? 0.6 : 1 }}
              >
                <div className="option-letter">{String.fromCharCode(65 + index)}</div>
                <div className="option-text">{option}</div>
                {isAnswered && isCorrect && <CheckCircle className="outcome-icon" />}
                {isAnswered && isSelected && !isCorrect && <XCircle className="outcome-icon" />}
              </button>
            );
          })}
        </div>

        {/* Hint System */}
        {currentQuestion.definition && !isAnswered && !showHint && (
          <button 
            className="btn btn-secondary" 
            style={{ width: '100%', marginTop: 'var(--space-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
            onClick={() => setShowHint(true)}
          >
            <Lightbulb size={18} /> Show Hint
          </button>
        )}

        {showHint && !isAnswered && (
          <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: '#FEF3C7', borderRadius: 'var(--radius-lg)', border: '2px solid #FCD34D' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <Lightbulb size={20} color="#D97706" style={{ marginTop: '2px' }} />
              <div>
                {currentQuestion.example && <p style={{ margin: '0 0 4px', fontStyle: 'italic', color: '#92400E' }}>"{currentQuestion.example}"</p>}
                {currentQuestion.vietnamese && <p style={{ margin: 0, fontWeight: 600, color: '#B45309' }}>{currentQuestion.vietnamese}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Feedback Area */}
        {feedback && (
          <div style={{ 
            marginTop: 'var(--space-lg)', 
            padding: 'var(--space-md)', 
            borderRadius: 'var(--radius-lg)',
            background: feedback.isCorrect ? '#F0FDF4' : '#FEF2F2',
            border: `3px solid ${feedback.isCorrect ? 'var(--color-success)' : 'var(--color-danger)'}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: feedback.isCorrect ? 'var(--color-success-hover)' : 'var(--color-danger-hover)' }}>
              {feedback.timedOut ? <AlertTriangle size={24} /> : feedback.isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
              <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {feedback.timedOut ? 'Time\'s up!' : feedback.isCorrect ? 'Correct!' : 'Oops!'}
              </span>
            </div>
            {!feedback.isCorrect && (
              <div style={{ marginTop: 'var(--space-sm)' }}>
                <p style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text-primary)' }}>
                  The answer is <strong style={{ color: 'var(--color-danger)' }}>{feedback.correctAnswer}</strong>
                </p>
                
                <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-sm)', background: 'white', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-info)', marginBottom: '4px', fontWeight: 700 }}>
                    <BookOpen size={16} /> Let's review:
                  </div>
                  {currentQuestion.example && <p style={{ margin: '0 0 4px', fontSize: '0.9rem' }}>"{currentQuestion.example}"</p>}
                  {currentQuestion.vietnamese && <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{currentQuestion.vietnamese}</p>}
                </div>
              </div>
            )}
            <div style={{ marginTop: 'var(--space-sm)', textAlign: 'center', opacity: 0.6, fontSize: '0.9rem', fontWeight: 600 }}>
              Loading next question <ChevronRight size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;