import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Clock, Lightbulb, CheckCircle, XCircle, 
  ChevronRight, AlertTriangle, BookOpen, Delete, RotateCcw, Home 
} from 'lucide-react';

const QUESTION_TIME_LIMIT = 30;

const DIFFICULTY = {
  EASY: 'easy',     
  MEDIUM: 'medium', 
  HARD: 'hard'     
};

function generateLetterBoxes(word, difficulty) {
  const upperWord = word.toUpperCase();
  const letters = upperWord.split('');
  const specialChars = [' ', "'", '-', '.', ','];
  
  const letterPositions = letters.map((char, i) => ({ char, index: i, isSpecial: specialChars.includes(char) }));
  const editablePositions = letterPositions.filter(p => !p.isSpecial);
  const totalEditable = editablePositions.length;
  
  let hiddenIndices = new Set();
  
  if (difficulty === DIFFICULTY.EASY) {
    const numToHide = Math.max(1, Math.ceil(totalEditable / 3));
    const shuffled = [...editablePositions].sort(() => Math.random() - 0.5);
    shuffled.slice(0, numToHide).forEach(p => hiddenIndices.add(p.index));
  } else if (difficulty === DIFFICULTY.MEDIUM) {
    const numToHide = Math.ceil(totalEditable / 2);
    const hideFromStart = Math.random() > 0.5;
    const toHide = hideFromStart 
      ? editablePositions.slice(0, numToHide)
      : editablePositions.slice(-numToHide);
    toHide.forEach(p => hiddenIndices.add(p.index));
  } else {
    editablePositions.forEach(p => hiddenIndices.add(p.index));
  }
  
  return letters.map((char, index) => {
    const isSpecial = specialChars.includes(char);
    const isHidden = hiddenIndices.has(index);
    return {
      char,
      index,
      isSpecial,
      isHidden,
      userInput: '',
      isCorrect: null
    };
  });
}

function getAdaptiveDifficulty(wordData) {
  if (!wordData) return DIFFICULTY.EASY;
  if (wordData.correctStreak >= 5 && wordData.weight <= 0.7) {
    return DIFFICULTY.HARD;
  } else if (wordData.correctStreak >= 2) {
    return DIFFICULTY.MEDIUM;
  }
  return DIFFICULTY.EASY;
}

const TypingQuiz = ({ words, onAnswer, onComplete, onHome, gameId, learningData = {} }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [letterBoxes, setLetterBoxes] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(QUESTION_TIME_LIMIT);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [keystrokeCount, setKeystrokeCount] = useState(0);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [results, setResults] = useState({ correct: 0, wrong: [], times: [] });
  const [difficulty, setDifficulty] = useState(DIFFICULTY.EASY);
  const [isRetryMode, setIsRetryMode] = useState(false);
  const [showRetryPrompt, setShowRetryPrompt] = useState(false);
  
  const inputRefs = useRef([]);
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  
  const currentWord = words[currentIndex];
  
  useEffect(() => {
    if (!currentWord) return;
    
    const wordData = learningData[currentWord.word];
    const adaptiveDifficulty = getAdaptiveDifficulty(wordData);
    setDifficulty(adaptiveDifficulty);
    
    const boxes = generateLetterBoxes(currentWord.word, adaptiveDifficulty);
    setLetterBoxes(boxes);
    setQuestionStartTime(Date.now());
    setKeystrokeCount(0);
    setBackspaceCount(0);
    setShowHint(false);
    setFeedback(null);
    setIsAnswered(false);
    setTimeRemaining(QUESTION_TIME_LIMIT);
    setActiveIndex(-1);
    
    setTimeout(() => {
      const firstHiddenIndex = boxes.findIndex(b => b.isHidden && !b.isSpecial);
      if (firstHiddenIndex >= 0 && inputRefs.current[firstHiddenIndex]) {
        inputRefs.current[firstHiddenIndex].focus();
        setActiveIndex(firstHiddenIndex);
      }
    }, 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);
  
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
  }, [isAnswered, currentIndex]);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleTimeUp = useCallback(() => {
    if (!isAnswered) {
      setIsAnswered(true);
      setActiveIndex(-1);
      setFeedback({
        isCorrect: false,
        correctAnswer: currentWord?.word || '',
        timedOut: true,
        userAnswer: ''
      });
      if (currentWord) {
        onAnswer(currentWord.word, false, QUESTION_TIME_LIMIT * 1000);
      }
      
      setResults(prev => ({
        ...prev,
        wrong: [...prev.wrong, currentWord],
        times: [...prev.times, QUESTION_TIME_LIMIT * 1000]
      }));
      
      setTimeout(() => {
        if (currentIndex + 1 >= words.length) {
          setShowRetryPrompt(true);
        } else {
          setCurrentIndex(prev => prev + 1);
        }
      }, 6000);
    }
  }, [isAnswered, currentWord, currentIndex, words.length, onAnswer]);
  
  const findNextEditableIndex = (fromIndex, direction = 1) => {
    let i = fromIndex + direction;
    while (i >= 0 && i < letterBoxes.length) {
      if (letterBoxes[i].isHidden && !letterBoxes[i].isSpecial) {
        return i;
      }
      i += direction;
    }
    return -1;
  };
  
  const handleInputChange = (index, value) => {
    if (isAnswered) return;
    
    const char = value.slice(-1).toUpperCase();
    if (!char) return; // Ignore clear, handled by Backspace
    
    setKeystrokeCount(prev => prev + 1);
    
    setLetterBoxes(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], userInput: char };
      return updated;
    });
    
    const nextIndex = findNextEditableIndex(index, 1);
    if (nextIndex >= 0 && inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex].focus();
      setActiveIndex(nextIndex);
    } else {
      inputRefs.current[index].blur();
      setActiveIndex(-1);
    }
  };
  
  const handleKeyDown = (index, e) => {
    if (isAnswered) return;
    
    if (e.key === 'Backspace') {
      e.preventDefault();
      setBackspaceCount(prev => prev + 1);
      
      setLetterBoxes(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], userInput: '' };
        return updated;
      });
      
      // If already empty, move back
      if (!letterBoxes[index].userInput) {
        const prevIndex = findNextEditableIndex(index, -1);
        if (prevIndex >= 0 && inputRefs.current[prevIndex]) {
          inputRefs.current[prevIndex].focus();
          setActiveIndex(prevIndex);
          setLetterBoxes(prev => {
            const updated = [...prev];
            updated[prevIndex] = { ...updated[prevIndex], userInput: '' };
            return updated;
          });
        }
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      submitAnswer(false);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = findNextEditableIndex(index, -1);
      if (prevIndex >= 0 && inputRefs.current[prevIndex]) {
        inputRefs.current[prevIndex].focus();
        setActiveIndex(prevIndex);
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = findNextEditableIndex(index, 1);
      if (nextIndex >= 0 && inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
        setActiveIndex(nextIndex);
      }
    }
  };
  
  const submitAnswer = (timedOut = false) => {
    if (isAnswered) return;
    setActiveIndex(-1);
    
    const responseTimeMs = Date.now() - questionStartTime;
    const userAnswer = letterBoxes.map(box => box.isHidden ? (box.userInput || '') : box.char).join('');
    const correctAnswer = currentWord.word.toUpperCase();
    const isCorrect = userAnswer === correctAnswer;
    
    setLetterBoxes(prev => prev.map(box => {
      if (box.isHidden) {
        const expectedChar = correctAnswer[box.index];
        return {
          ...box,
          isCorrect: box.userInput === expectedChar
        };
      }
      return box;
    }));
    
    setIsAnswered(true);
    setFeedback({
      isCorrect,
      correctAnswer: currentWord.word,
      timedOut,
      userAnswer
    });
    
    const hesitationScore = keystrokeCount > 0 ? backspaceCount / keystrokeCount : 0;
    const adjustedResponseTime = responseTimeMs * (1 + hesitationScore * 0.5);
    const effectiveResponseTime = isRetryMode ? adjustedResponseTime * 1.5 : adjustedResponseTime;
    
    onAnswer(currentWord.word, isCorrect, effectiveResponseTime);
    
    setResults(prev => ({
      correct: prev.correct + (isCorrect ? (isRetryMode ? 0.5 : 1) : 0),
      wrong: isCorrect ? prev.wrong : [...prev.wrong, currentWord],
      times: [...prev.times, responseTimeMs]
    }));
    
    const delay = isCorrect ? 1500 : 6000;
    setTimeout(() => {
      if (currentIndex + 1 >= words.length) {
        const wrongCount = results.wrong.length + (isCorrect ? 0 : 1);
        if (wrongCount > 0 && !isRetryMode) {
          setShowRetryPrompt(true);
        } else {
          finishGame();
        }
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    }, delay);
  };
  
  const finishGame = () => {
    onComplete({
      gameId,
      totalQuestions: words.length,
      correctAnswers: Math.round(results.correct),
      wrongAnswers: results.wrong,
      averageResponseTime: results.times.length > 0 
        ? results.times.reduce((a, b) => a + b, 0) / results.times.length 
        : 0
    });
  };
  
  const handleRetry = () => {
    setShowRetryPrompt(false);
    setIsRetryMode(true);
    setCurrentIndex(0);
  };
  
  const handleClear = () => {
    if (isAnswered) return;
    setLetterBoxes(prev => prev.map(box => ({
      ...box,
      userInput: box.isHidden ? '' : box.userInput
    })));
    
    const firstHiddenIndex = letterBoxes.findIndex(b => b.isHidden && !b.isSpecial);
    if (firstHiddenIndex >= 0 && inputRefs.current[firstHiddenIndex]) {
      inputRefs.current[firstHiddenIndex].focus();
      setActiveIndex(firstHiddenIndex);
    }
  };
  
  const correctCount = Math.round(results.correct);
  const isUrgent = timeRemaining <= 10;
  const isCritical = timeRemaining <= 5;
  const timerPercent = (timeRemaining / QUESTION_TIME_LIMIT) * 100;
  
  if (!currentWord) return null;
  
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
              <RotateCcw size={18} /> Retry Wrong
            </button>
            <button className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={finishGame}>
              <CheckCircle size={18} /> Done
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }} ref={containerRef}>
      
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
        <span className="badge badge-neutral">
          Word {currentIndex + 1} of {words.length} {isRetryMode ? '(Retry)' : ''}
        </span>
      </div>
      
      {/* Question Card */}
      <div className="card shadow-md" style={{ width: '100%', padding: 'var(--space-xl)', textAlign: 'center', position: 'relative' }}>
        <div className={`badge ${difficulty === DIFFICULTY.HARD ? 'badge-danger' : difficulty === DIFFICULTY.MEDIUM ? 'badge-neutral' : 'badge-success'}`} style={{ position: 'absolute', top: '16px', right: '16px' }}>
          {difficulty.toUpperCase()}
        </div>
        
        <h2 style={{ fontSize: '1.5rem', margin: 'var(--space-lg) 0 var(--space-2xl) 0', color: 'var(--color-text-primary)' }}>
          {currentWord.definition || currentWord.vietnamese}
        </h2>
        
        {/* Letter Boxes */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', justifyContent: 'center', marginBottom: 'var(--space-2xl)', maxWidth: '100%' }}>
          {(() => {
            const wordGroups = [];
            let currentGroup = [];
            
            letterBoxes.forEach((box, index) => {
              if (box.char === ' ') {
                if (currentGroup.length > 0) {
                  wordGroups.push({ boxes: currentGroup, spaceAfter: true });
                  currentGroup = [];
                }
              } else {
                currentGroup.push({ ...box, originalIndex: index });
              }
            });
            if (currentGroup.length > 0) {
              wordGroups.push({ boxes: currentGroup, spaceAfter: false });
            }
            
            return wordGroups.map((group, groupIndex) => (
              <div key={groupIndex} style={{ display: 'flex', gap: '4px', marginRight: group.spaceAfter ? 'var(--space-xl)' : '0' }}>
                {group.boxes.map((box) => {
                  const index = box.originalIndex;
                  const isActive = activeIndex === index;
                  
                  if (box.isSpecial) {
                    return (
                      <div key={index} className="typing-cell" style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
                        {box.char}
                      </div>
                    );
                  }
                  
                  if (!box.isHidden) {
                    return (
                      <div key={index} className="typing-cell filled">
                        {box.char}
                      </div>
                    );
                  }
                  
                  let cellClasses = 'typing-cell';
                  let cellStyles = {};
                  
                  if (isActive) cellClasses += ' active';
                  
                  if (isAnswered) {
                    if (box.isCorrect === true) {
                       cellStyles = { borderColor: 'var(--color-success)', background: '#F0FDF4', color: 'var(--color-success)' };
                    } else if (box.isCorrect === false) {
                       cellStyles = { borderColor: 'var(--color-danger)', background: '#FEF2F2', color: 'var(--color-danger)' };
                    }
                  }
                  
                  return (
                    <input
                      key={index}
                      ref={el => inputRefs.current[index] = el}
                      type="text"
                      className={cellClasses}
                      style={{ ...(isAnswered && box.isCorrect !== null ? cellStyles : {}), textAlign: 'center', textTransform: 'uppercase' }}
                      value={box.userInput}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onFocus={() => setActiveIndex(index)}
                      onBlur={() => { if (activeIndex === index) setActiveIndex(-1) }}
                      maxLength={1}
                      disabled={isAnswered}
                      autoComplete="off"
                      autoCapitalize="off"
                      autoCorrect="off"
                    />
                  );
                })}
              </div>
            ));
          })()}
        </div>
        
        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', marginBottom: 'var(--space-lg)' }}>
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleClear} disabled={isAnswered}>
            <Delete size={18} /> Clear
          </button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => submitAnswer(false)} disabled={isAnswered}>
            <CheckCircle size={18} /> Submit
          </button>
        </div>
        
        {/* Hint System */}
        {currentWord.definition && !isAnswered && !showHint && (
          <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '0 auto' }} onClick={() => setShowHint(true)}>
            <Lightbulb size={18} /> Show Hint
          </button>
        )}
        
        {showHint && !isAnswered && (
          <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: '#FEF3C7', borderRadius: 'var(--radius-lg)', border: '2px solid #FCD34D', textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <Lightbulb size={20} color="#D97706" style={{ marginTop: '2px' }} />
              <div>
                {currentWord.example && <p style={{ margin: '0 0 4px', fontStyle: 'italic', color: '#92400E' }}>"{currentWord.example}"</p>}
                {currentWord.vietnamese && <p style={{ margin: 0, fontWeight: 600, color: '#B45309' }}>{currentWord.vietnamese}</p>}
              </div>
            </div>
          </div>
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
              {feedback.timedOut ? <AlertTriangle size={24} /> : feedback.isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
              <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                {feedback.timedOut ? 'Time\'s up!' : feedback.isCorrect ? 'Correct! Well done!' : 'Oops!'}
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

export default TypingQuiz;
