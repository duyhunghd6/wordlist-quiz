import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ThumbsUp, ThumbsDown, Check, X, ChevronRight, BookOpen, Home, CheckCircle, XCircle } from 'lucide-react';

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

  useEffect(() => {
    if (words.length === 0) return;
    
    const generatedCards = words.map((word, i) => {
      const isCorrectPair = Math.random() > 0.5;
      const wrongDefIndex = (i + 1 + Math.floor(Math.random() * (words.length - 1))) % words.length;
      
      return {
        word: word.word,
        shownDefinition: isCorrectPair ? (word.definition || word.vietnamese) : (words[wrongDefIndex].definition || words[wrongDefIndex].vietnamese),
        correctAnswer: isCorrectPair,
        sourceWord: word,
        example: word.example,
        vietnamese: word.vietnamese,
      };
    });
    
    setCards(generatedCards);
    setQuestionStartTime(Date.now());
  }, [words]);

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentIndex]);

  const handleSwipe = useCallback((direction) => {
    if (showFeedback || currentIndex >= cards.length) return;
    
    const card = cards[currentIndex];
    const responseTimeMs = Date.now() - questionStartTime;
    const userSaidCorrect = direction === 'right';
    const isCorrect = userSaidCorrect === card.correctAnswer;

    onAnswer(card.sourceWord.word, isCorrect, responseTimeMs);

    setLastAnswer({ card, isCorrect, userSaidCorrect });
    setSwipeDirection(direction);
    setShowFeedback(true);

    setResults(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: isCorrect ? prev.wrong : [...prev.wrong, card.sourceWord],
      times: [...prev.times, responseTimeMs]
    }));

    const delay = isCorrect ? 1500 : 4000;
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

  const handleDragStart = (e) => {
    if (showFeedback) return;
    setIsDragging(true);
    
    if (e.target && e.target.setPointerCapture && e.pointerId != null) {
      e.target.setPointerCapture(e.pointerId);
    }
    
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
    setDragOffset({ x: deltaX, y: deltaY * 0.3 });
  };

  const handleDragEnd = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (e && e.target && e.target.releasePointerCapture && e.pointerId != null) {
      try { e.target.releasePointerCapture(e.pointerId); } catch (err) {}
    }
    
    const threshold = 100;
    if (dragOffset.x > threshold) {
      handleSwipe('right');
    } else if (dragOffset.x < -threshold) {
      handleSwipe('left');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  if (cards.length === 0) return <div>Loading...</div>;

  const currentCard = cards[currentIndex];
  const rotation = dragOffset.x * 0.05;
  const swipeIndicator = dragOffset.x > 50 ? 'right' : dragOffset.x < -50 ? 'left' : null;

  return (
    <div className="swipe-board" style={{ width: '100%', height: '100dvh', maxHeight: '100dvh', overflow: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '600px', width: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', flex: 1, minHeight: 0 }}>
        {/* HUD Header */}
        <div className="game-hud" style={{ width: '100%', maxWidth: '100%', flexShrink: 0 }}>
          <button className="hud-btn" onClick={onHome} aria-label="Go home">
            <Home size={20} />
          </button>
          
          <div style={{ flex: 1, margin: '0 var(--space-md)' }}>
            <span className="badge badge-neutral" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              Card {currentIndex + 1} of {cards.length}
            </span>
          </div>

          <div className="score-pill">
            <span style={{ fontSize: '18px' }}>⭐</span>
            <span className="score-text">{results.correct}</span>
          </div>
        </div>

      {/* Swipe Instructions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 var(--space-md)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-danger)', fontWeight: 700, fontSize: '0.9rem' }}>
          <ThumbsDown size={16} /> Wrong
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontWeight: 700, fontSize: '0.9rem' }}>
          Correct <ThumbsUp size={16} />
        </div>
      </div>

      {/* Card Area — fills remaining space */}
      <div className="swipe-card-container" style={{ margin: '0 auto', flex: 1, minHeight: 0 }}>
        {/* Next Card */}
        {currentIndex + 1 < cards.length && (
          <div className="swipe-card" style={{ opacity: 0.6, transform: 'scale(0.95) translateY(10px)', zIndex: 1 }}>
            <div className="card-content">
              <h2>{cards[currentIndex + 1].word}</h2>
            </div>
          </div>
        )}

        {/* Current Card */}
        <div 
          ref={cardRef}
          className="swipe-card"
          style={{
            zIndex: 10, cursor: isDragging ? 'grabbing' : 'grab',
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
        >
          {/* Swipe Hints */}
          <div className="swipe-hint left" style={{ opacity: dragOffset.x < -20 ? Math.min(1, Math.abs(dragOffset.x)/100) : 0, transition: 'opacity 0.2s', pointerEvents: 'none' }}>
            Wrong
          </div>
          <div className="swipe-hint right" style={{ opacity: dragOffset.x > 20 ? Math.min(1, dragOffset.x/100) : 0, transition: 'opacity 0.2s', pointerEvents: 'none' }}>
            Got It!
          </div>

          <div className="card-content" style={{ width: '100%', wordBreak: 'break-word' }}>
            <h2 style={{ color: 'var(--color-info)', marginBottom: currentCard?.sourceWord?.image ? '2px' : 'var(--space-xs)' }}>
              {currentCard?.word}
            </h2>
            {currentCard?.sourceWord?.image && (
              <div className="vocab-image-container">
                <img src={currentCard.sourceWord.image} alt={currentCard.word} className="vocab-image" />
              </div>
            )}
            <hr style={{ width: '50%', margin: 'var(--space-xs) auto', borderColor: 'var(--color-border-default)', borderStyle: 'solid', borderWidth: '1px 0 0 0', opacity: 0.4, flexShrink: 0 }} />
            <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--color-text-primary)' }}>
              {currentCard?.shownDefinition}
            </p>
          </div>

          <div style={{ flexShrink: 0, padding: '4px 0 var(--space-sm)', fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Does this definition match?
          </div>
        </div>
      </div>

      {/* Button Controls */}
      {!showFeedback && (
        <div style={{ display: 'flex', justifyContent: 'space-evenly', padding: '0 40px', flexShrink: 0 }}>
          <button 
            style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'white', border: 'none', boxShadow: 'var(--shadow-md)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => handleSwipe('left')}
            aria-label="Wrong match"
          >
            <ThumbsDown size={28} />
          </button>
          <button 
            style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'white', border: 'none', boxShadow: 'var(--shadow-md)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => handleSwipe('right')}
            aria-label="Correct match"
          >
            <ThumbsUp size={28} />
          </button>
        </div>
      )}

      {/* Feedback Overlay */}
      {showFeedback && lastAnswer && (
        <div style={{ 
          padding: 'var(--space-sm)', 
          borderRadius: 'var(--radius-lg)',
          background: lastAnswer.isCorrect ? '#F0FDF4' : '#FEF2F2',
          border: `3px solid ${lastAnswer.isCorrect ? 'var(--color-success)' : 'var(--color-danger)'}`,
          textAlign: 'left',
          flexShrink: 0,
          overflow: 'auto',
          maxHeight: '30vh'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: lastAnswer.isCorrect ? 'var(--color-success-hover)' : 'var(--color-danger-hover)' }}>
            {lastAnswer.isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
            <span style={{ fontSize: '1rem', fontWeight: 700 }}>
              {lastAnswer.isCorrect ? 'Correct!' : `The pair was ${lastAnswer.card.correctAnswer ? 'a MATCH' : 'NOT a match'}`}
            </span>
          </div>
          
          {!lastAnswer.isCorrect && (
            <div style={{ marginTop: '4px' }}>
              <div style={{ padding: '4px var(--space-sm)', background: 'white', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-info)', marginBottom: '2px', fontWeight: 700, fontSize: '0.85rem' }}>
                  <BookOpen size={14} /> Learn: {lastAnswer.card.word}
                </div>
                <p style={{ margin: '0 0 2px', fontSize: '0.85rem' }}>
                  <strong>Correct definition:</strong> {lastAnswer.card.sourceWord.definition || lastAnswer.card.sourceWord.vietnamese}
                </p>
                {lastAnswer.card.example && <p style={{ margin: '0', fontSize: '0.85rem', fontStyle: 'italic' }}>"{lastAnswer.card.example}"</p>}
              </div>
            </div>
          )}
          <div style={{ marginTop: '4px', textAlign: 'center', opacity: 0.6, fontSize: '0.8rem', fontWeight: 600 }}>
            Loading next card <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default SwipeCards;
