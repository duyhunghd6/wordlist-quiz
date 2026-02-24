import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Check, X, ChevronRight, BookOpen, Sparkles, RotateCcw, Home, Clock } from 'lucide-react';

const BUBBLE_COLORS = [
  { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', glow: 'rgba(102, 126, 234, 0.5)' },
  { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', glow: 'rgba(240, 147, 251, 0.5)' },
  { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', glow: 'rgba(79, 172, 254, 0.5)' },
  { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', glow: 'rgba(67, 233, 123, 0.5)' },
  { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', glow: 'rgba(250, 112, 154, 0.5)' },
  { bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', glow: 'rgba(168, 237, 234, 0.5)' },
];

const GAME_TIME_LIMIT = 10000; 
const BUBBLE_ESCAPE_TIME = 8000; 

const BubblePop = ({ words, onAnswer, onComplete, onHome, gameId = 'bubble' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [results, setResults] = useState({ correct: 0, wrong: [], times: [] });
  const [bubbles, setBubbles] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastAnswer, setLastAnswer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_LIMIT);
  const [poppedBubble, setPoppedBubble] = useState(null);
  const [isRetryMode, setIsRetryMode] = useState(false);
  const [showRetryPrompt, setShowRetryPrompt] = useState(false);
  
  const timerRef = useRef(null);

  const generateBubbles = useCallback((currentWord, allWords) => {
    const wrongWords = allWords
      .filter(w => w.word !== currentWord.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    const options = [currentWord, ...wrongWords].sort(() => Math.random() - 0.5);
    const xPositions = [10, 35, 60, 85];
    
    return options.map((word, idx) => ({
      id: idx,
      word: word.word,
      isCorrect: word.word === currentWord.word,
      color: BUBBLE_COLORS[idx % BUBBLE_COLORS.length],
      x: xPositions[idx] + (Math.random() * 8 - 4),
      speed: 12 + Math.random() * 4,
      wobbleOffset: Math.random() * Math.PI * 2,
      startDelay: idx * 300,
    }));
  }, []);

  useEffect(() => {
    if (words.length === 0 || currentIndex >= words.length) return;
    
    const currentWord = words[currentIndex];
    const newBubbles = generateBubbles(currentWord, words);
    setBubbles(newBubbles);
    setQuestionStartTime(Date.now());
    setTimeLeft(GAME_TIME_LIMIT);
    setPoppedBubble(null);
  }, [words, currentIndex, generateBubbles]);

  const timeoutTriggeredRef = useRef(false);

  useEffect(() => {
    if (showFeedback) return;
    
    timeoutTriggeredRef.current = false;
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          clearInterval(timerRef.current);
          timeoutTriggeredRef.current = true;
          return 0;
        }
        return prev - 100;
      });
    }, 100);
    
    return () => clearInterval(timerRef.current);
  }, [currentIndex, showFeedback]);

  const resultsRef = useRef(results);
  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

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

  const proceedToNext = useCallback((isCorrect, currentWord, responseTimeMs) => {
    clearInterval(timerRef.current);
    
    const delay = isCorrect ? 1500 : 4000;
    setTimeout(() => {
      setShowFeedback(false);
      
      if (currentIndex + 1 >= words.length) {
        const currentResults = resultsRef.current;
        const wrongCount = currentResults.wrong.length + (isCorrect ? 0 : 1);
        
        if (wrongCount > 0 && !isRetryMode) {
          setShowRetryPrompt(true);
        } else {
          finishGame();
        }
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    }, delay);
  }, [currentIndex, words.length, isRetryMode, finishGame]);

  useEffect(() => {
    if (timeLeft === 0 && timeoutTriggeredRef.current && !showFeedback) {
      timeoutTriggeredRef.current = false;
      
      const currentWord = words[currentIndex];
      if (!currentWord) return;
      
      const responseTimeMs = GAME_TIME_LIMIT;
      
      onAnswer(currentWord.word, false, responseTimeMs);
      
      setLastAnswer({ 
        word: currentWord, 
        isCorrect: false, 
        wasTimeout: true 
      });
      setShowFeedback(true);
      
      setResults(prev => ({
        correct: prev.correct,
        wrong: [...prev.wrong, currentWord],
        times: [...prev.times, responseTimeMs]
      }));
      
      proceedToNext(false, currentWord, responseTimeMs);
    }
  }, [timeLeft, showFeedback, currentIndex, words, onAnswer, proceedToNext]);

  const handleBubbleTap = useCallback((bubble) => {
    if (showFeedback) return;
    
    const currentWord = words[currentIndex];
    const responseTimeMs = Date.now() - questionStartTime;
    const isCorrect = bubble.isCorrect;
    
    onAnswer(currentWord.word, isCorrect, responseTimeMs);
    
    setPoppedBubble(bubble.id);
    setLastAnswer({ 
      word: currentWord, 
      isCorrect,
      tappedWord: bubble.word,
      wasTimeout: false 
    });
    setShowFeedback(true);
    
    const pointsEarned = isCorrect ? (isRetryMode ? 0.5 : 1) : 0;
    setResults(prev => ({
      correct: prev.correct + pointsEarned,
      wrong: isCorrect ? prev.wrong : [...prev.wrong, currentWord],
      times: [...prev.times, responseTimeMs]
    }));
    
    proceedToNext(isCorrect, currentWord, responseTimeMs);
  }, [currentIndex, words, onAnswer, questionStartTime, showFeedback, isRetryMode, proceedToNext]);

  if (words.length === 0) return <div>Loading...</div>;

  const currentWord = words[currentIndex];
  const timerPercent = (timeLeft / GAME_TIME_LIMIT) * 100;
  const isUrgent = timeLeft < 4000;
  const isCritical = timeLeft < 2000;
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
              <Check size={18} /> Finish
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <style>{`
        @keyframes floatUp {
          0% { bottom: -100px; opacity: 0; transform: translateX(0) scale(0.8); }
          5% { opacity: 1; transform: translateX(0) scale(1); }
          15% { transform: translateX(12px) scale(1.02); }
          30% { transform: translateX(-10px) scale(0.98); }
          45% { transform: translateX(8px) scale(1.01); }
          60% { transform: translateX(-6px) scale(0.99); }
          75% { transform: translateX(4px) scale(1); }
          90% { opacity: 1; transform: translateX(-2px) scale(1); }
          100% { bottom: calc(100% + 50px); opacity: 0; transform: translateX(0) scale(0.7); }
        }
        .bubble {
          position: absolute;
          width: 90px;
          height: 90px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 0.85rem;
          padding: 8px;
          word-break: break-word;
          text-align: center;
          line-height: 1.1;
          border: none;
          cursor: pointer;
          background: var(--bubble-bg);
          box-shadow: inset -5px -5px 15px rgba(0,0,0,0.2), inset 5px 5px 15px rgba(255,255,255,0.4), 0 5px 15px var(--bubble-glow);
          left: calc(var(--bubble-x) - 45px);
          bottom: -100px;
          animation: floatUp var(--bubble-speed) ease-in-out forwards;
          animation-delay: var(--bubble-delay);
          transition: transform 0.1s;
        }
        .bubble:active {
          transform: scale(0.9) !important;
        }
        .bubble.popped {
          animation: none;
          transform: scale(1.5) !important;
          opacity: 0 !important;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        }
        .bubble.fade {
          opacity: 0.3;
        }
      `}</style>

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

      {/* Main Game Area */}
      <div className="card shadow-md" style={{ width: '100%', padding: 'var(--space-xl)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--color-info)', fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
          <Sparkles size={20} /> Tap the matching word!
        </div>
        
        <h2 style={{ fontSize: '1.8rem', margin: '0 0 var(--space-xl) 0', color: 'var(--color-text-primary)' }}>
          {currentWord?.definition || currentWord?.vietnamese}
        </h2>
        
        {/* Arena */}
        <div style={{ position: 'relative', width: '100%', height: '400px', background: '#F8FAFC', borderRadius: 'var(--radius-xl)', border: '2px dashed var(--color-border-default)', overflow: 'hidden' }}>
          {bubbles.map((bubble) => (
            <button
              key={`${currentIndex}-${bubble.id}`}
              className={`bubble ${poppedBubble === bubble.id ? 'popped' : ''} ${showFeedback && !bubble.isCorrect && poppedBubble !== bubble.id ? 'fade' : ''}`}
              style={{
                '--bubble-x': `${bubble.x}%`,
                '--bubble-bg': bubble.color.bg,
                '--bubble-glow': bubble.color.glow,
                '--bubble-speed': `${bubble.speed}s`,
                '--bubble-delay': `${bubble.startDelay}ms`,
              }}
              onClick={() => handleBubbleTap(bubble)}
              disabled={showFeedback}
            >
              <span style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>{bubble.word}</span>
            </button>
          ))}
          
          {showFeedback && lastAnswer && !lastAnswer.isCorrect && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(255,255,255,0.9)', padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', border: '2px solid var(--color-success)', color: 'var(--color-success)', fontWeight: 800, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10 }}>
              <Check size={28} /> {currentWord.word}
            </div>
          )}
        </div>
        
        {/* Feedback */}
        {showFeedback && lastAnswer && (
          <div style={{ 
            marginTop: 'var(--space-lg)', 
            padding: 'var(--space-md)', 
            borderRadius: 'var(--radius-lg)',
            background: lastAnswer.isCorrect ? '#F0FDF4' : '#FEF2F2',
            border: `3px solid ${lastAnswer.isCorrect ? 'var(--color-success)' : 'var(--color-danger)'}`,
            textAlign: 'left',
            animation: 'fadeIn 0.3s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: lastAnswer.isCorrect ? 'var(--color-success-hover)' : 'var(--color-danger-hover)' }}>
              {lastAnswer.wasTimeout ? <Clock size={24} /> : lastAnswer.isCorrect ? <Check size={24} /> : <X size={24} />}
              <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {lastAnswer.isCorrect ? 'Correct! Well done!' : lastAnswer.wasTimeout ? `Time's up! The answer was "${currentWord.word}"` : `Wrong! The answer was "${currentWord.word}"`}
              </span>
            </div>
            
            {!lastAnswer.isCorrect && currentWord && (
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

export default BubblePop;
