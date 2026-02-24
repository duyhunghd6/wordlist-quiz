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

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
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
    <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* HUD Header */}
      <div className="game-hud" style={{ width: '100%', maxWidth: '100%' }}>
        <button className="hud-btn" onClick={onHome} aria-label="Go home">
          <Home size={20} />
        </button>
        
        <div style={{ flex: 1, margin: '0 var(--space-md)' }}>
          {/* Progress display instead of timer */}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 var(--space-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)', fontWeight: 700 }}>
          <ThumbsDown size={20} /> Wrong
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)', fontWeight: 700 }}>
          Correct <ThumbsUp size={20} />
        </div>
      </div>

      {/* Card Area */}
      <div style={{ position: 'relative', width: '100%', height: '400px', margin: '0 auto' }}>
        {/* Next Card */}
        {currentIndex + 1 < cards.length && (
          <div className="card shadow-md" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: 'var(--space-lg)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.6, transform: 'scale(0.95) translateY(20px)', zIndex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{cards[currentIndex + 1].word}</div>
          </div>
        )}

        {/* Current Card */}
        <div 
          ref={cardRef}
          className="card shadow-drag"
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: 'var(--space-lg)',
            textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            backgroundColor: 'white', zIndex: 10, cursor: isDragging ? 'grabbing' : 'grab',
            overflow: 'hidden',
            transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          {/* Overlays */}
          <div style={{ 
            position: 'absolute', top: 0, left: 0, bottom: 0, width: '50%', background: 'linear-gradient(to right, rgba(239,68,68,0.2), transparent)', 
            borderTopLeftRadius: 'var(--radius-xl)', borderBottomLeftRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: 'var(--space-lg)',
            opacity: swipeIndicator === 'left' ? 1 : 0, transition: 'opacity 0.2s', pointerEvents: 'none'
          }}>
            <div style={{ color: 'var(--color-danger)', display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'rotate(-15deg)' }}>
              <X size={48} strokeWidth={3} />
              <span style={{ fontWeight: 800, fontSize: '1.2rem', marginTop: '8px' }}>WRONG</span>
            </div>
          </div>
          
          <div style={{ 
            position: 'absolute', top: 0, right: 0, bottom: 0, width: '50%', background: 'linear-gradient(to left, rgba(34,197,94,0.2), transparent)', 
            borderTopRightRadius: 'var(--radius-xl)', borderBottomRightRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 'var(--space-lg)',
            opacity: swipeIndicator === 'right' ? 1 : 0, transition: 'opacity 0.2s', pointerEvents: 'none'
          }}>
            <div style={{ color: 'var(--color-success)', display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'rotate(15deg)' }}>
              <Check size={48} strokeWidth={3} />
              <span style={{ fontWeight: 800, fontSize: '1.2rem', marginTop: '8px' }}>CORRECT</span>
            </div>
          </div>

          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-info)', marginBottom: 'var(--space-md)', wordBreak: 'break-word', maxWidth: '90%' }}>
            {currentCard?.word}
          </div>
          <div style={{ width: '80%', height: '4px', background: 'var(--color-border-default)', marginBottom: 'var(--space-md)', borderRadius: '2px', flexShrink: 0 }} />
          <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--color-text-primary)', maxWidth: '90%', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' }}>
            {currentCard?.shownDefinition}
          </div>
          <div style={{ marginTop: 'auto', color: 'var(--color-text-secondary)', fontWeight: 600, paddingTop: 'var(--space-sm)', fontSize: '0.9rem', flexShrink: 0 }}>
            Does this definition match?
          </div>
        </div>
      </div>

      {/* Button Controls */}
      {!showFeedback && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2xl)', marginTop: 'var(--space-md)' }}>
          <button 
            style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'white', border: 'none', boxShadow: 'var(--shadow-md)', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => handleSwipe('left')}
            aria-label="Wrong match"
          >
            <ThumbsDown size={40} />
          </button>
          <button 
            style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'white', border: 'none', boxShadow: 'var(--shadow-md)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
            onClick={() => handleSwipe('right')}
            aria-label="Correct match"
          >
            <ThumbsUp size={40} />
          </button>
        </div>
      )}

      {/* Feedback Overlay */}
      {showFeedback && lastAnswer && (
        <div style={{ 
          marginTop: 'var(--space-md)', 
          padding: 'var(--space-md)', 
          borderRadius: 'var(--radius-lg)',
          background: lastAnswer.isCorrect ? '#F0FDF4' : '#FEF2F2',
          border: `3px solid ${lastAnswer.isCorrect ? 'var(--color-success)' : 'var(--color-danger)'}`,
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: lastAnswer.isCorrect ? 'var(--color-success-hover)' : 'var(--color-danger-hover)' }}>
            {lastAnswer.isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
            <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              {lastAnswer.isCorrect ? 'Correct!' : `The pair was ${lastAnswer.card.correctAnswer ? 'a MATCH' : 'NOT a match'}`}
            </span>
          </div>
          
          {!lastAnswer.isCorrect && (
            <div style={{ marginTop: 'var(--space-sm)' }}>
              <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-sm)', background: 'white', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-info)', marginBottom: '4px', fontWeight: 700 }}>
                  <BookOpen size={16} /> Learn: {lastAnswer.card.word}
                </div>
                <p style={{ margin: '0 0 4px', fontSize: '0.9rem' }}>
                  <strong>Correct definition:</strong> {lastAnswer.card.sourceWord.definition || lastAnswer.card.sourceWord.vietnamese}
                </p>
                {lastAnswer.card.example && <p style={{ margin: '0 0 4px', fontSize: '0.9rem', fontStyle: 'italic' }}>"{lastAnswer.card.example}"</p>}
              </div>
            </div>
          )}
          <div style={{ marginTop: 'var(--space-sm)', textAlign: 'center', opacity: 0.6, fontSize: '0.9rem', fontWeight: 600 }}>
            Loading next card <ChevronRight size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SwipeCards;
