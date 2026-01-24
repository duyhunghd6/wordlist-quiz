import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Check, X, ChevronRight, BookOpen, Sparkles, RotateCcw } from 'lucide-react';
import './GameUI.css';
import './BubblePop.css';

/**
 * BubblePop Game Component
 * 
 * Definition is shown at top. Word bubbles float up from the bottom.
 * User taps the correct word bubble before it escapes off the top.
 * Wrong tap or timeout = incorrect answer.
 */

const BUBBLE_COLORS = [
  { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', glow: 'rgba(102, 126, 234, 0.5)' },
  { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', glow: 'rgba(240, 147, 251, 0.5)' },
  { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', glow: 'rgba(79, 172, 254, 0.5)' },
  { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', glow: 'rgba(67, 233, 123, 0.5)' },
  { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', glow: 'rgba(250, 112, 154, 0.5)' },
  { bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', glow: 'rgba(168, 237, 234, 0.5)' },
];

const GAME_TIME_LIMIT = 10000; // 10 seconds per question
const BUBBLE_ESCAPE_TIME = 8000; // Time for bubble to float up

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

  // Generate bubbles for current question
  const generateBubbles = useCallback((currentWord, allWords) => {
    // Get 3 random wrong options
    const wrongWords = allWords
      .filter(w => w.word !== currentWord.word)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    // Mix correct and wrong words
    const options = [currentWord, ...wrongWords].sort(() => Math.random() - 0.5);
    
    // Create bubbles with evenly distributed positions
    const positions = [15, 38, 62, 85]; // Evenly spaced positions
    return options.map((word, idx) => ({
      id: idx,
      word: word.word,
      isCorrect: word.word === currentWord.word,
      color: BUBBLE_COLORS[idx % BUBBLE_COLORS.length],
      x: positions[idx], // Evenly distributed horizontal positions
      speed: 0.9 + Math.random() * 0.2, // Less speed variation
      wobbleOffset: Math.random() * Math.PI * 2, // Phase offset for wobble
      startDelay: idx * 400, // More staggered start to separate bubbles
    }));
  }, []);

  // Initialize question
  useEffect(() => {
    if (words.length === 0 || currentIndex >= words.length) return;
    
    const currentWord = words[currentIndex];
    const newBubbles = generateBubbles(currentWord, words);
    setBubbles(newBubbles);
    setQuestionStartTime(Date.now());
    setTimeLeft(GAME_TIME_LIMIT);
    setPoppedBubble(null);
  }, [words, currentIndex, generateBubbles]);

  // Track if timeout occurred
  const timeoutTriggeredRef = useRef(false);

  // Timer countdown
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

  // Use ref to track results for proceedToNext to avoid stale closure
  const resultsRef = useRef(results);
  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  // Finish the game - called when truly complete
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

  // Start retry mode
  const handleRetry = useCallback(() => {
    setShowRetryPrompt(false);
    setIsRetryMode(true);
    setCurrentIndex(0);
    setResults(prev => ({ ...prev, wrong: [] })); // Keep correct count but clear wrong list
  }, []);

  const proceedToNext = useCallback((isCorrect, currentWord, responseTimeMs) => {
    clearInterval(timerRef.current);
    
    const delay = isCorrect ? 1500 : 4000;
    setTimeout(() => {
      setShowFeedback(false);
      
      if (currentIndex + 1 >= words.length) {
        // Check for wrong answers - offer retry if not already in retry mode
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

  // Handle timeout in separate effect
  useEffect(() => {
    if (timeLeft === 0 && timeoutTriggeredRef.current && !showFeedback) {
      timeoutTriggeredRef.current = false;
      
      const currentWord = words[currentIndex];
      if (!currentWord) return;
      
      const responseTimeMs = GAME_TIME_LIMIT;
      
      // Timeout = wrong answer
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
    
    // Report to learning algorithm
    onAnswer(currentWord.word, isCorrect, responseTimeMs);
    
    setPoppedBubble(bubble.id);
    setLastAnswer({ 
      word: currentWord, 
      isCorrect,
      tappedWord: bubble.word,
      wasTimeout: false 
    });
    setShowFeedback(true);
    
    // Give partial credit (0.5) in retry mode
    const pointsEarned = isCorrect ? (isRetryMode ? 0.5 : 1) : 0;
    setResults(prev => ({
      correct: prev.correct + pointsEarned,
      wrong: isCorrect ? prev.wrong : [...prev.wrong, currentWord],
      times: [...prev.times, responseTimeMs]
    }));
    
    proceedToNext(isCorrect, currentWord, responseTimeMs);
  }, [currentIndex, words, onAnswer, questionStartTime, showFeedback, isRetryMode, proceedToNext]);

  if (words.length === 0) {
    return <div className="bubble-container">Loading...</div>;
  }

  const currentWord = words[currentIndex];
  const timerPercent = (timeLeft / GAME_TIME_LIMIT) * 100;
  const isUrgent = timeLeft < 4000;
  const isCritical = timeLeft < 2000;

  return (
    <div className="bubble-container">
      {/* Progress */}
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
                  ? (results.wrong.some(w => w.word === words[idx].word) ? 'wrong' : 'correct')
                  : ''
              }`}
              style={{ width: `${100 / words.length}%` }}
            />
          ))}
        </div>
        <div className="progress-info">
          <span className="question-counter">
            <span className="current">{currentIndex + 1}</span>
            <span className="separator">/</span>
            <span className="total">{words.length}</span>
          </span>
          <div className="score-mini">
            <span className="correct-count">✓ {results.correct}</span>
            <span className="wrong-count">✗ {results.wrong.length}</span>
          </div>
        </div>
      </div>

      {/* Timer Bar */}
      <div className={`timer-bar ${isUrgent ? 'urgent' : ''} ${isCritical ? 'critical' : ''}`}>
        <div className="timer-fill" style={{ width: `${timerPercent}%` }} />
      </div>

      {/* Definition Card */}
      <div className="definition-card">
        <div className="question-label">
          <Sparkles size={16} />
          <span>Tap the matching word!</span>
        </div>
        <p className="definition-text">{currentWord.definition}</p>
      </div>

      {/* Bubble Arena */}
      <div className="bubble-arena">
        {bubbles.map((bubble) => (
          <button
            key={`${currentIndex}-${bubble.id}`}
            className={`bubble ${poppedBubble === bubble.id ? 'popped' : ''} ${showFeedback && !bubble.isCorrect && poppedBubble !== bubble.id ? 'fade' : ''}`}
            style={{
              '--bubble-x': `${bubble.x}%`,
              '--bubble-bg': bubble.color.bg,
              '--bubble-glow': bubble.color.glow,
              '--bubble-speed': `${BUBBLE_ESCAPE_TIME * bubble.speed}ms`,
              '--bubble-delay': `${bubble.startDelay}ms`,
              '--wobble-offset': bubble.wobbleOffset,
            }}
            onClick={() => handleBubbleTap(bubble)}
            disabled={showFeedback}
          >
            <span className="bubble-word">{bubble.word}</span>
          </button>
        ))}
        
        {/* Show correct answer indicator */}
        {showFeedback && lastAnswer && !lastAnswer.isCorrect && (
          <div className="correct-indicator">
            <Check size={16} />
            <span>{currentWord.word}</span>
          </div>
        )}
      </div>

      {/* Feedback */}
      {showFeedback && lastAnswer && (
        <div className={`feedback-card ${lastAnswer.isCorrect ? 'correct' : 'incorrect'}`}>
          <div className="feedback-header">
            {lastAnswer.isCorrect ? <Check size={20} /> : <X size={20} />}
            <span>
              {lastAnswer.isCorrect 
                ? 'Correct!' 
                : lastAnswer.wasTimeout 
                  ? `Time's up! The answer was "${currentWord.word}"`
                  : `Wrong! The answer was "${currentWord.word}"`
              }
            </span>
            <ChevronRight className="next-icon" size={18} />
          </div>
          
          {!lastAnswer.isCorrect && (
            <div className="learning-context">
              <div className="learning-header">
                <BookOpen size={14} />
                <span>Learn: {currentWord.word}</span>
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

      {/* Retry Prompt Modal */}
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

export default BubblePop;
