import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ThumbsUp, ThumbsDown, Check, X, ChevronRight, BookOpen, Home } from 'lucide-react';
import './GameUI.css';
import './SwipeCards.css';

/**
 * SwipeCards Game Component
 * 
 * Tinder-style word matching game. Shows word-definition pairs.
 * User swipes RIGHT if the pair is correct, LEFT if wrong.
 * 50% of cards show correct pairs, 50% show mismatched definitions.
 */
const SwipeCards = ({ words, onAnswer, onComplete, onHome, gameId = 'swipe' }) => {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [results, setResults] = useState({ correct: 0, wrong: [], times: [] });
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswer, setLastAnswer] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  const cardRef = useRef(null);
  const startPosRef = useRef({ x: 0, y: 0 });

  // Generate cards with mixed correct/incorrect pairs
  useEffect(() => {
    if (words.length === 0) return;
    
    const generatedCards = words.map((word, i) => {
      const isCorrectPair = Math.random() > 0.5;
      // For incorrect pairs, use a different word's definition
      const wrongDefIndex = (i + 1 + Math.floor(Math.random() * (words.length - 1))) % words.length;
      
      return {
        word: word.word,
        shownDefinition: isCorrectPair ? word.definition : words[wrongDefIndex].definition,
        correctAnswer: isCorrectPair, // true = swipe right is correct
        sourceWord: word,
        example: word.example,
        vietnamese: word.vietnamese,
      };
    });
    
    setCards(generatedCards);
    setQuestionStartTime(Date.now());
  }, [words]);

  // Reset timer when card changes
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentIndex]);

  const handleSwipe = useCallback((direction) => {
    if (showFeedback || currentIndex >= cards.length) return;
    
    const card = cards[currentIndex];
    const responseTimeMs = Date.now() - questionStartTime;
    const userSaidCorrect = direction === 'right';
    const isCorrect = userSaidCorrect === card.correctAnswer;

    // Report to learning algorithm
    onAnswer(card.sourceWord.word, isCorrect, responseTimeMs);

    setLastAnswer({ card, isCorrect, userSaidCorrect });
    setSwipeDirection(direction);
    setShowFeedback(true);

    // Update local results
    setResults(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: isCorrect ? prev.wrong : [...prev.wrong, card.sourceWord],
      times: [...prev.times, responseTimeMs]
    }));

    // Move to next card or finish
    const delay = isCorrect ? 1500 : 4000; // More time to learn on wrong
    setTimeout(() => {
      setShowFeedback(false);
      setSwipeDirection(null);
      setDragOffset({ x: 0, y: 0 });
      
      if (currentIndex + 1 >= cards.length) {
        const finalCorrect = results.correct + (isCorrect ? 1 : 0);
        const finalWrong = isCorrect ? results.wrong : [...results.wrong, card.sourceWord];
        const finalTimes = [...results.times, responseTimeMs];
        
        onComplete({
          gameId,
          totalQuestions: cards.length,
          correctAnswers: finalCorrect,
          wrongAnswers: finalWrong,
          averageResponseTime: finalTimes.reduce((a, b) => a + b, 0) / finalTimes.length
        });
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    }, delay);
  }, [currentIndex, cards, questionStartTime, onAnswer, onComplete, gameId, results, showFeedback]);

  // Touch/Mouse event handlers for swipe gesture
  const handleDragStart = (e) => {
    if (showFeedback) return;
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startPosRef.current = { x: clientX, y: clientY };
  };

  const handleDragMove = (e) => {
    if (!isDragging || showFeedback) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - startPosRef.current.x;
    const deltaY = clientY - startPosRef.current.y;
    setDragOffset({ x: deltaX, y: deltaY * 0.3 }); // Limit vertical movement
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const threshold = 100; // Minimum swipe distance
    
    if (dragOffset.x > threshold) {
      handleSwipe('right');
    } else if (dragOffset.x < -threshold) {
      handleSwipe('left');
    } else {
      // Snap back
      setDragOffset({ x: 0, y: 0 });
    }
  };

  if (cards.length === 0) {
    return <div className="swipe-container">Loading...</div>;
  }

  const currentCard = cards[currentIndex];
  const rotation = dragOffset.x * 0.05; // Slight rotation based on drag
  const swipeIndicator = dragOffset.x > 50 ? 'right' : dragOffset.x < -50 ? 'left' : null;

  return (
    <div className="swipe-container">
      {/* Progress */}
      <div className="game-progress">
        <button className="home-btn-small" onClick={onHome} aria-label="Go home">
          <Home size={24} />
        </button>
        <div className="progress-bar">
          {cards.map((_, idx) => (
            <div 
              key={idx} 
              className={`progress-segment ${
                idx < currentIndex 
                  ? (results.wrong.some(w => w.word === cards[idx].sourceWord.word) ? 'wrong' : 'correct')
                  : ''
              }`}
              style={{ width: `${100 / cards.length}%` }}
            />
          ))}
        </div>
        <div className="progress-info">
          <span className="question-counter">
            <span className="current">{currentIndex + 1}</span>
            <span className="separator">/</span>
            <span className="total">{cards.length}</span>
          </span>
          <div className="score-mini">
            <span className="correct-count">✓ {results.correct}</span>
            <span className="wrong-count">✗ {results.wrong.length}</span>
          </div>
        </div>
      </div>

      {/* Swipe Instructions */}
      <div className="swipe-instructions">
        <div className="instruction left">
          <ThumbsDown size={20} />
          <span>Wrong</span>
        </div>
        <div className="instruction right">
          <span>Correct</span>
          <ThumbsUp size={20} />
        </div>
      </div>

      {/* Card Stack */}
      <div className="card-stack">
        {/* Next card preview (behind) */}
        {currentIndex + 1 < cards.length && (
          <div className="swipe-card next-card">
            <div className="card-word">{cards[currentIndex + 1].word}</div>
          </div>
        )}

        {/* Current card */}
        <div 
          ref={cardRef}
          className={`swipe-card ${swipeDirection ? `swiped-${swipeDirection}` : ''} ${isDragging ? 'dragging' : ''}`}
          style={{
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease'
          }}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          {/* Swipe Indicator Overlays */}
          <div className={`swipe-overlay left ${swipeIndicator === 'left' ? 'active' : ''}`}>
            <X size={48} />
            <span>WRONG</span>
          </div>
          <div className={`swipe-overlay right ${swipeIndicator === 'right' ? 'active' : ''}`}>
            <Check size={48} />
            <span>CORRECT</span>
          </div>

          <div className="card-content">
            <div className="card-word">{currentCard.word}</div>
            <div className="card-divider"></div>
            <div className="card-definition">{currentCard.shownDefinition}</div>
            <div className="card-question">Does this definition match?</div>
          </div>
        </div>
      </div>

      {/* Button Controls (alternative to swipe) */}
      {!showFeedback && (
        <div className="swipe-buttons">
          <button 
            className="swipe-btn wrong" 
            onClick={() => handleSwipe('left')}
            aria-label="Wrong match"
          >
            <ThumbsDown size={28} />
          </button>
          <button 
            className="swipe-btn correct" 
            onClick={() => handleSwipe('right')}
            aria-label="Correct match"
          >
            <ThumbsUp size={28} />
          </button>
        </div>
      )}

      {/* Feedback */}
      {showFeedback && lastAnswer && (
        <div className={`feedback-card ${lastAnswer.isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-header">
            {lastAnswer.isCorrect ? <Check size={20} /> : <X size={20} />}
            <span>
              {lastAnswer.isCorrect 
                ? 'Correct!' 
                : `The pair was ${lastAnswer.card.correctAnswer ? 'a MATCH' : 'NOT a match'}`
              }
            </span>
            <ChevronRight className="next-icon" size={18} />
          </div>
          
          {!lastAnswer.isCorrect && (
            <div className="learning-context">
              <div className="learning-header">
                <BookOpen size={14} />
                <span>Learn: {lastAnswer.card.word}</span>
              </div>
              <p className="learning-definition">
                <strong>Correct definition:</strong> {lastAnswer.card.sourceWord.definition}
              </p>
              {lastAnswer.card.example && (
                <p className="learning-example">"{lastAnswer.card.example}"</p>
              )}
              {lastAnswer.card.vietnamese && (
                <p className="learning-vietnamese">{lastAnswer.card.vietnamese}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SwipeCards;
