import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, CheckCircle, XCircle, ChevronRight, BookOpen, RotateCcw } from 'lucide-react';
import './GameUI.css';
import './WordScramble.css';

/**
 * WordScramble Game Component
 * 
 * Kids drag and drop to REARRANGE scrambled letters in a single row.
 * Time: 5 seconds per character.
 * Single difficulty level with retry feature.
 */

const SECONDS_PER_CHAR = 5;

const WordScramble = ({ words, onAnswer, onComplete, onHome, gameId = 'scramble' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [letters, setLetters] = useState([]); // Single array of letters to rearrange
  const [feedback, setFeedback] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [results, setResults] = useState({ correct: 0, wrong: [], times: [] });
  const [isRetryMode, setIsRetryMode] = useState(false);
  const [showRetryPrompt, setShowRetryPrompt] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  
  const resultsRef = useRef(results);
  const timerRef = useRef(null);
  
  const currentWord = words[currentIndex];
  
  // Keep results ref updated
  useEffect(() => {
    resultsRef.current = results;
  }, [results]);
  
  // Scramble word letters - returns shuffled array
  const scrambleWord = useCallback((word) => {
    const chars = word.toUpperCase().split('');
    const letters = chars.map((letter, idx) => ({ id: idx, letter, originalIndex: idx }));
    
    // Shuffle using Fisher-Yates
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    
    // Ensure it's actually scrambled (not same as original)
    const isOriginalOrder = letters.every((l, i) => l.originalIndex === i);
    if (isOriginalOrder && letters.length > 1) {
      [letters[0], letters[1]] = [letters[1], letters[0]];
    }
    
    return letters;
  }, []);
  
  // Initialize question
  useEffect(() => {
    if (!currentWord) return;
    
    const wordText = currentWord.word.replace(/\s+/g, ''); // Remove spaces
    const timeLimit = wordText.length * SECONDS_PER_CHAR;
    
    setLetters(scrambleWord(wordText));
    setTimeRemaining(timeLimit);
    setQuestionStartTime(Date.now());
    setFeedback(null);
    setIsAnswered(false);
    
    // Start timer
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
  
  // Handle timeout
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
  
  // Finish game
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
  
  // Start retry
  const handleRetry = useCallback(() => {
    setShowRetryPrompt(false);
    setIsRetryMode(true);
    setCurrentIndex(0);
    setResults(prev => ({ ...prev, wrong: [] }));
  }, []);
  
  // Proceed to next question
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
  
  // Check if current arrangement is correct
  const checkAnswer = useCallback(() => {
    if (isAnswered) return;
    
    const arrangedWord = letters.map(l => l.letter).join('');
    const correctWord = currentWord.word.replace(/\s+/g, '').toUpperCase();
    const isCorrect = arrangedWord === correctWord;
    
    clearInterval(timerRef.current);
    setIsAnswered(true);
    
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
  
  // Drag handlers - for reordering within the single row
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
    
    // Swap the two letters
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
  
  // Touch-friendly: tap to select, tap another to swap
  const [selectedIndex, setSelectedIndex] = useState(null);
  
  const handleLetterTap = (index) => {
    if (isAnswered) return;
    
    if (selectedIndex === null) {
      // First tap - select this letter
      setSelectedIndex(index);
    } else if (selectedIndex === index) {
      // Tap same letter - deselect
      setSelectedIndex(null);
    } else {
      // Second tap - swap with selected
      setLetters(prev => {
        const newLetters = [...prev];
        [newLetters[selectedIndex], newLetters[index]] = [newLetters[index], newLetters[selectedIndex]];
        return newLetters;
      });
      setSelectedIndex(null);
    }
  };
  
  if (words.length === 0) {
    return <div className="scramble-container">Loading...</div>;
  }
  
  const wordLength = currentWord?.word.replace(/\s+/g, '').length || 0;
  const isUrgent = timeRemaining <= 10;
  const isCritical = timeRemaining <= 5;
  
  return (
    <div className="scramble-container">
      {/* Header */}
      <div className="game-progress">
        <button className="home-btn-small" onClick={onHome} aria-label="Go home">
          <span style={{ fontSize: '20px' }}>🏠</span>
        </button>
        <div className="progress-bar">
          {words.map((_, idx) => (
            <div 
              key={idx} 
              className={`progress-segment ${
                idx < currentIndex 
                  ? (results.wrong.some(w => w?.word === words[idx]?.word) ? 'wrong' : 'correct')
                  : idx === currentIndex ? 'current' : ''
              }`}
              style={{ width: `${100 / words.length}%` }}
            />
          ))}
        </div>
        <div className="progress-text">
          <span className="current">{currentIndex + 1}</span>
          <span className="separator">/</span>
          <span className="total">{words.length}</span>
        </div>
        <div className={`timer ${isUrgent ? 'urgent' : ''} ${isCritical ? 'critical' : ''}`}>
          <Clock size={16} />
          <span>{timeRemaining}s</span>
        </div>
      </div>
      
      {/* Question */}
      <div className="scramble-question">
        <h2 className="definition">{currentWord?.definition}</h2>
        <p className="hint-text">Tap two letters to swap them ({wordLength} letters)</p>
      </div>
      
      {/* Letters Row - Single row to rearrange */}
      <div className="letters-row">
        {letters.map((letter, idx) => (
          <div
            key={`letter-${letter.id}`}
            className={`letter-tile 
              ${selectedIndex === idx ? 'selected' : ''} 
              ${dragOverIndex === idx ? 'drag-over' : ''}
              ${draggedIndex === idx ? 'dragging' : ''}
              ${feedback?.isCorrect === true ? 'correct' : ''} 
              ${feedback?.isCorrect === false ? 'incorrect' : ''}
            `}
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
        ))}
      </div>
      
      {/* Submit Button */}
      {!isAnswered && (
        <button className="submit-btn" onClick={checkAnswer}>
          <CheckCircle size={20} />
          Check Answer
        </button>
      )}
      
      {/* Feedback */}
      {feedback && (
        <div className={`feedback-card ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-header">
            {feedback.timedOut ? (
              <>
                <Clock size={24} />
                <span>Time's up! The word was <strong>{feedback.correctAnswer}</strong></span>
              </>
            ) : feedback.isCorrect ? (
              <>
                <CheckCircle size={24} />
                <span>Correct! Well done!</span>
              </>
            ) : (
              <>
                <XCircle size={24} />
                <span>The word is <strong>{feedback.correctAnswer}</strong></span>
              </>
            )}
            <ChevronRight size={20} className="next-icon" />
          </div>
          
          {!feedback.isCorrect && currentWord && (
            <div className="learning-context">
              <div className="learning-header">
                <BookOpen size={14} />
                <span>Learn this word!</span>
              </div>
              {currentWord.example && (
                <p className="learning-example">"{currentWord.example}"</p>
              )}
              {currentWord.vietnamese && (
                <p className="learning-vietnamese">{currentWord.vietnamese}</p>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Retry Prompt */}
      {showRetryPrompt && (
        <div className="retry-prompt-overlay">
          <div className="retry-prompt-modal">
            <h3>🎯 Retry Wrong Answers?</h3>
            <p>You got {results.wrong.length} word{results.wrong.length > 1 ? 's' : ''} wrong. Want to practice them again?</p>
            <div className="retry-prompt-buttons">
              <button className="retry-btn primary" onClick={handleRetry}>
                <RotateCcw size={18} />
                Try Again
              </button>
              <button className="retry-btn secondary" onClick={finishGame}>
                Finish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordScramble;
