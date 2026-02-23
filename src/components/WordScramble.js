import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, CheckCircle, XCircle, ChevronRight, BookOpen, RotateCcw, Home } from 'lucide-react';

const SECONDS_PER_CHAR = 5;

const WordScramble = ({ words, onAnswer, onComplete, onHome, gameId = 'scramble' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [letters, setLetters] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [results, setResults] = useState({ correct: 0, wrong: [], times: [] });
  const [isRetryMode, setIsRetryMode] = useState(false);
  const [showRetryPrompt, setShowRetryPrompt] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  
  const resultsRef = useRef(results);
  const timerRef = useRef(null);
  
  const currentWord = words[currentIndex];
  
  useEffect(() => {
    resultsRef.current = results;
  }, [results]);
  
  const scrambleWord = useCallback((word) => {
    const chars = word.toUpperCase().split('');
    const letters = chars.map((letter, idx) => ({ id: idx, letter, originalIndex: idx }));
    
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    
    const isOriginalOrder = letters.every((l, i) => l.originalIndex === i);
    if (isOriginalOrder && letters.length > 1) {
      [letters[0], letters[1]] = [letters[1], letters[0]];
    }
    
    return letters;
  }, []);
  
  useEffect(() => {
    if (!currentWord) return;
    
    const wordText = currentWord.word.replace(/\s+/g, '');
    const timeLimit = wordText.length * SECONDS_PER_CHAR;
    
    setLetters(scrambleWord(wordText));
    setTimeRemaining(timeLimit);
    setQuestionStartTime(Date.now());
    setFeedback(null);
    setIsAnswered(false);
    setSelectedIndex(null);
    
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, scrambleWord]);
  
  const handleTimeUp = useCallback(() => {
    if (isAnswered) return;
    clearInterval(timerRef.current);
    
    setIsAnswered(true);
    setFeedback({
      isCorrect: false,
      correctAnswer: currentWord?.word || '',
      timedOut: true
    });
    
    if (currentWord) {
      onAnswer(currentWord.word, false, timeRemaining * 1000);
    }
    
    setResults(prev => ({
      ...prev,
      wrong: [...prev.wrong, currentWord],
      times: [...prev.times, timeRemaining * 1000]
    }));
    
    setTimeout(() => {
      proceedToNext(false);
    }, 4000);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnswered, currentWord, onAnswer, timeRemaining]);
  
  const finishGame = useCallback(() => {
    const currentResults = resultsRef.current;
    onComplete({
      gameId,
      totalQuestions: words.length,
      correctAnswers: Math.round(currentResults.correct),
      wrongAnswers: currentResults.wrong,
      averageResponseTime: currentResults.times.length > 0
        ? currentResults.times.reduce((a, b) => a + b, 0) / currentResults.times.length
        : 0
    });
  }, [gameId, words.length, onComplete]);
  
  const handleRetry = useCallback(() => {
    setShowRetryPrompt(false);
    setIsRetryMode(true);
    setCurrentIndex(0);
    setResults(prev => ({ ...prev, wrong: [] }));
  }, []);
  
  const proceedToNext = useCallback((wasCorrect) => {
    if (currentIndex + 1 >= words.length) {
      const currentResults = resultsRef.current;
      const wrongCount = currentResults.wrong.length;
      
      if (wrongCount > 0 && !isRetryMode) {
        setShowRetryPrompt(true);
      } else {
        finishGame();
      }
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, words.length, isRetryMode, finishGame]);
  
  const checkAnswer = useCallback(() => {
    if (isAnswered) return;
    
    const arrangedWord = letters.map(l => l.letter).join('');
    const correctWord = currentWord.word.replace(/\s+/g, '').toUpperCase();
    const isCorrect = arrangedWord === correctWord;
    
    clearInterval(timerRef.current);
    setIsAnswered(true);
    setSelectedIndex(null);
    
    const responseTimeMs = Date.now() - questionStartTime;
    onAnswer(currentWord.word, isCorrect, responseTimeMs);
    
    setFeedback({
      isCorrect,
      correctAnswer: currentWord.word
    });
    
    const pointsEarned = isCorrect ? (isRetryMode ? 0.5 : 1) : 0;
    setResults(prev => ({
      correct: prev.correct + pointsEarned,
      wrong: isCorrect ? prev.wrong : [...prev.wrong, currentWord],
      times: [...prev.times, responseTimeMs]
    }));
    
    setTimeout(() => {
      proceedToNext(isCorrect);
    }, isCorrect ? 1500 : 4000);
  }, [isAnswered, letters, currentWord, questionStartTime, onAnswer, isRetryMode, proceedToNext]);
  
  // Drag handlers
  const handleDragStart = (e, index) => {
    if (isAnswered) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };
  
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };
  
  const handleDragLeave = () => {
    setDragOverIndex(null);
  };
  
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    
    setLetters(prev => {
      const newLetters = [...prev];
      [newLetters[draggedIndex], newLetters[targetIndex]] = [newLetters[targetIndex], newLetters[draggedIndex]];
      return newLetters;
    });
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };
  
  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };
  
  // Touch
  const handleLetterTap = (index) => {
    if (isAnswered) return;
    
    if (selectedIndex === null) {
      setSelectedIndex(index);
    } else if (selectedIndex === index) {
      setSelectedIndex(null);
    } else {
      setLetters(prev => {
        const newLetters = [...prev];
        [newLetters[selectedIndex], newLetters[index]] = [newLetters[index], newLetters[selectedIndex]];
        return newLetters;
      });
      setSelectedIndex(null);
    }
  };
  
  if (words.length === 0) return <div>Loading...</div>;
  
  const wordLength = currentWord?.word.replace(/\s+/g, '').length || 0;
  const isUrgent = timeRemaining <= 10;
  const isCritical = timeRemaining <= 5;
  const maxTime = wordLength * SECONDS_PER_CHAR;
  const timerPercent = (timeRemaining / maxTime) * 100;
  const correctCount = Math.round(results.correct);
  
  if (showRetryPrompt) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-xl)' }}>
        <div className="card shadow-md" style={{ textAlign: 'center', width: '100%', maxWidth: '400px' }}>
          <div style={{ fontSize: '48px', marginBottom: 'var(--space-md)' }}>🔄</div>
          <h2>Quiz Complete!</h2>
          <p style={{ fontSize: '1.2rem', margin: 'var(--space-sm) 0' }}>You got <strong>{correctCount}</strong> out of <strong>{words.length}</strong> correct</p>
          <p style={{ color: 'var(--color-danger)', fontWeight: 600 }}>❌ {results.wrong.length} words wrong. Want to try again?</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-lg)' }}>⚠️ Retry answers count for 50% points</p>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={handleRetry}>
              <RotateCcw size={18} /> Try Again
            </button>
            <button className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={finishGame}>
              <CheckCircle size={18} /> Finish
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
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
        <span className="badge badge-neutral">Word {currentIndex + 1} of {words.length}</span>
      </div>

      {/* Main Card */}
      <div className="card shadow-md" style={{ width: '100%', padding: 'var(--space-xl)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', margin: '0 0 var(--space-sm) 0', color: 'var(--color-text-primary)' }}>
          {currentWord?.definition || currentWord?.vietnamese}
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', margin: '0 0 var(--space-xl) 0', fontSize: '0.9rem' }}>
          Tap two letters to swap them ({wordLength} letters)
        </p>
        
        {/* Letters Row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', justifyContent: 'center', marginBottom: 'var(--space-2xl)' }}>
          {letters.map((letter, idx) => {
            const isSelected = selectedIndex === idx;
            const isDragOver = dragOverIndex === idx;
            const isDragging = draggedIndex === idx;
            
            let bgStyles = { background: 'white', borderColor: 'var(--color-border-default)', color: 'var(--color-text-primary)' };
            if (isSelected) bgStyles = { background: '#EFF6FF', borderColor: 'var(--color-info)', color: 'var(--color-info)' };
            if (isDragOver) bgStyles = { background: '#FEF3C7', borderColor: 'var(--color-accent)' };
            if (isDragging) bgStyles = { opacity: 0.5 };
            
            if (isAnswered) {
              if (feedback?.isCorrect === true) {
                bgStyles = { background: '#F0FDF4', borderColor: 'var(--color-success)', color: 'var(--color-success-hover)' };
              } else if (feedback?.isCorrect === false) {
                bgStyles = { background: '#FEF2F2', borderColor: 'var(--color-danger)', color: 'var(--color-danger-hover)' };
              }
            }
            
            return (
              <div
                key={`letter-${letter.id}`}
                style={{
                  width: '56px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2rem', fontWeight: 800, borderRadius: 'var(--radius-lg)', border: '3px solid',
                  cursor: isAnswered ? 'default' : 'pointer', transition: 'all 0.2s', userSelect: 'none',
                  boxShadow: isSelected || isDragging ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  ...bgStyles
                }}
                draggable={!isAnswered}
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                onClick={() => handleLetterTap(idx)}
              >
                {letter.letter}
              </div>
            );
          })}
        </div>
        
        {/* Submit */}
        {!isAnswered && (
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '0 auto', fontSize: '1.2rem', padding: 'var(--space-md) var(--space-xl)' }} onClick={checkAnswer}>
            <CheckCircle size={24} /> Check Answer
          </button>
        )}
        
        {/* Feedback */}
        {feedback && (
          <div style={{ 
            marginTop: 'var(--space-lg)', 
            padding: 'var(--space-md)', 
            borderRadius: 'var(--radius-lg)',
            background: feedback.isCorrect ? '#F0FDF4' : '#FEF2F2',
            border: `3px solid ${feedback.isCorrect ? 'var(--color-success)' : 'var(--color-danger)'}`,
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: feedback.isCorrect ? 'var(--color-success-hover)' : 'var(--color-danger-hover)' }}>
              {feedback.timedOut ? <Clock size={24} /> : feedback.isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
              <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {feedback.timedOut ? `Time's up! The word was ${feedback.correctAnswer}` : feedback.isCorrect ? 'Correct! Well done!' : `The word is ${feedback.correctAnswer}`}
              </span>
            </div>
            
            {!feedback.isCorrect && currentWord && (
              <div style={{ marginTop: 'var(--space-sm)' }}>
                <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-sm)', background: 'white', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-info)', marginBottom: '4px', fontWeight: 700 }}>
                    <BookOpen size={16} /> Learn this word:
                  </div>
                  {currentWord.example && <p style={{ margin: '0 0 4px', fontSize: '0.9rem' }}>"{currentWord.example}"</p>}
                  {currentWord.vietnamese && <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{currentWord.vietnamese}</p>}
                </div>
              </div>
            )}
            <div style={{ marginTop: 'var(--space-sm)', textAlign: 'center', opacity: 0.6, fontSize: '0.9rem', fontWeight: 600 }}>
              Loading next word <ChevronRight size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordScramble;
