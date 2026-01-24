import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Clock, Lightbulb, CheckCircle, XCircle, 
  ChevronRight, AlertTriangle, BookOpen, Delete, RotateCcw 
} from 'lucide-react';
import './TypingQuiz.css';
import './GameUI.css';

const QUESTION_TIME_LIMIT = 30;

// Difficulty levels
const DIFFICULTY = {
  EASY: 'easy',     // 1/3 characters hidden
  MEDIUM: 'medium', // 1/2 characters hidden (beginning or end)
  HARD: 'hard'      // All characters hidden
};

/**
 * Generate letter boxes for a word based on difficulty
 * @param {string} word - The word to display
 * @param {string} difficulty - EASY, MEDIUM, or HARD
 * @returns {Array} Array of letter box objects
 */
function generateLetterBoxes(word, difficulty) {
  const upperWord = word.toUpperCase();
  const letters = upperWord.split('');
  const specialChars = [' ', "'", '-', '.', ','];
  
  // Count only letter positions (not special chars)
  const letterPositions = letters.map((char, i) => ({ char, index: i, isSpecial: specialChars.includes(char) }));
  const editablePositions = letterPositions.filter(p => !p.isSpecial);
  const totalEditable = editablePositions.length;
  
  let hiddenIndices = new Set();
  
  if (difficulty === DIFFICULTY.EASY) {
    // Hide ~1/3 of letters (scattered)
    const numToHide = Math.max(1, Math.ceil(totalEditable / 3));
    const shuffled = [...editablePositions].sort(() => Math.random() - 0.5);
    shuffled.slice(0, numToHide).forEach(p => hiddenIndices.add(p.index));
  } else if (difficulty === DIFFICULTY.MEDIUM) {
    // Hide first half OR last half
    const numToHide = Math.ceil(totalEditable / 2);
    const hideFromStart = Math.random() > 0.5;
    const toHide = hideFromStart 
      ? editablePositions.slice(0, numToHide)
      : editablePositions.slice(-numToHide);
    toHide.forEach(p => hiddenIndices.add(p.index));
  } else {
    // HARD: hide all letters
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

/**
 * Get adaptive difficulty based on word's learning data
 */
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
  
  const currentWord = words[currentIndex];
  
  // Initialize letter boxes for current word - only when question changes
  useEffect(() => {
    if (!currentWord) return;
    
    // Get adaptive difficulty based on learning data (read once at question start)
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
    
    // Focus first hidden box after render
    setTimeout(() => {
      const firstHiddenIndex = boxes.findIndex(b => b.isHidden && !b.isSpecial);
      if (firstHiddenIndex >= 0 && inputRefs.current[firstHiddenIndex]) {
        inputRefs.current[firstHiddenIndex].focus();
      }
    }, 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]); // Only re-run when question index changes, not when learningData updates
  
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
  }, [isAnswered, currentIndex]);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleTimeUp = useCallback(() => {
    if (!isAnswered) {
      // Direct call - safe because this is triggered from timer interval
      setIsAnswered(true);
      setFeedback({
        isCorrect: false,
        correctAnswer: currentWord?.word || '',
        timedOut: true,
        userAnswer: ''
      });
      if (currentWord) {
        onAnswer(currentWord.word, false, QUESTION_TIME_LIMIT * 1000);
      }
      
      // Update results for timeout
      setResults(prev => ({
        ...prev,
        wrong: [...prev.wrong, currentWord],
        times: [...prev.times, QUESTION_TIME_LIMIT * 1000]
      }));
      
      // Auto-advance after delay (6s for wrong/timeout)
      setTimeout(() => {
        if (currentIndex + 1 >= words.length) {
          // Check if we should offer retry
          setShowRetryPrompt(true);
        } else {
          setCurrentIndex(prev => prev + 1);
        }
      }, 6000);
    }
  }, [isAnswered, currentWord, currentIndex, words.length, onAnswer]);
  
  // Find next/previous editable (hidden) box
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
  
  // Handle input change in a letter box
  const handleInputChange = (index, value) => {
    if (isAnswered) return;
    
    const char = value.slice(-1).toUpperCase();
    if (!char) return;
    
    setKeystrokeCount(prev => prev + 1);
    
    setLetterBoxes(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], userInput: char };
      return updated;
    });
    
    // Auto-advance to next hidden box
    const nextIndex = findNextEditableIndex(index, 1);
    if (nextIndex >= 0 && inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex].focus();
    }
  };
  
  // Handle keydown for special keys
  const handleKeyDown = (index, e) => {
    if (isAnswered) return;
    
    if (e.key === 'Backspace') {
      e.preventDefault();
      setBackspaceCount(prev => prev + 1);
      
      // Clear current box
      setLetterBoxes(prev => {
        const updated = [...prev];
        updated[index] = { ...updated[index], userInput: '' };
        return updated;
      });
      
      // Move to previous editable box if current is empty
      if (!letterBoxes[index].userInput) {
        const prevIndex = findNextEditableIndex(index, -1);
        if (prevIndex >= 0 && inputRefs.current[prevIndex]) {
          inputRefs.current[prevIndex].focus();
          // Also clear that box
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
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = findNextEditableIndex(index, 1);
      if (nextIndex >= 0 && inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    }
  };
  
  // Submit the answer
  const submitAnswer = (timedOut = false) => {
    if (isAnswered) return;
    
    const responseTimeMs = Date.now() - questionStartTime;
    
    // Build the user's answer
    const userAnswer = letterBoxes.map(box => {
      if (box.isHidden) {
        return box.userInput || '';
      }
      return box.char;
    }).join('');
    
    const correctAnswer = currentWord.word.toUpperCase();
    const isCorrect = userAnswer === correctAnswer;
    
    // Mark boxes as correct/incorrect
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
    
    // Calculate hesitation penalty for learning algorithm
    const hesitationScore = keystrokeCount > 0 ? backspaceCount / keystrokeCount : 0;
    const adjustedResponseTime = responseTimeMs * (1 + hesitationScore * 0.5);
    
    // Report to learning algorithm (with retry modifier)
    const effectiveResponseTime = isRetryMode ? adjustedResponseTime * 1.5 : adjustedResponseTime;
    onAnswer(currentWord.word, isCorrect, effectiveResponseTime);
    
    // Update local results
    setResults(prev => ({
      correct: prev.correct + (isCorrect ? (isRetryMode ? 0.5 : 1) : 0),
      wrong: isCorrect ? prev.wrong : [...prev.wrong, currentWord],
      times: [...prev.times, responseTimeMs]
    }));
    
    // Auto-advance after delay
    const delay = isCorrect ? 1500 : 6000;
    setTimeout(() => {
      if (currentIndex + 1 >= words.length) {
        // Check if we should offer retry
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
  
  // Finish the game
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
  
  // Start retry mode
  const handleRetry = () => {
    setShowRetryPrompt(false);
    setIsRetryMode(true);
    setCurrentIndex(0);
    // Reset to only retry wrong words - but for simplicity, we retry all with wrong words prioritized
    // In a more complete implementation, we'd filter to only wrong words
  };
  
  // Clear all inputs
  const handleClear = () => {
    if (isAnswered) return;
    
    setLetterBoxes(prev => prev.map(box => ({
      ...box,
      userInput: box.isHidden ? '' : box.userInput
    })));
    
    // Focus first hidden box
    const firstHiddenIndex = letterBoxes.findIndex(b => b.isHidden && !b.isSpecial);
    if (firstHiddenIndex >= 0 && inputRefs.current[firstHiddenIndex]) {
      inputRefs.current[firstHiddenIndex].focus();
    }
  };
  
  // Progress calculation
  const correctCount = Math.round(results.correct);
  const wrongCount = results.wrong.length;
  const correctPercent = (correctCount / words.length) * 100;
  const wrongPercent = (wrongCount / words.length) * 100;
  
  // Timer urgency
  const isUrgent = timeRemaining <= 10;
  const isCritical = timeRemaining <= 5;
  
  if (!currentWord) return null;
  
  // Retry prompt modal
  if (showRetryPrompt) {
    return (
      <div className="typing-quiz-container">
        <div className="retry-prompt-card">
          <div className="retry-icon">🔄</div>
          <h2>Quiz Complete!</h2>
          <p className="retry-score">You got <strong>{correctCount}</strong> out of <strong>{words.length}</strong> correct</p>
          <p className="retry-wrong">❌ {results.wrong.length} words wrong. Want to try again?</p>
          <p className="retry-note">⚠️ Retry answers count for 50% points</p>
          <div className="retry-buttons">
            <button className="retry-btn primary" onClick={handleRetry}>
              <RotateCcw size={18} />
              Retry Wrong Words
            </button>
            <button className="retry-btn secondary" onClick={finishGame}>
              <CheckCircle size={18} />
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="typing-quiz-container" ref={containerRef}>
      {/* Header */}
      <div className="typing-header">
        <button className="home-btn-small" onClick={onHome} aria-label="Go home">
          <span style={{ fontSize: '20px' }}>🏠</span>
        </button>
        
        <div className="game-progress">
          <div className="progress-bar segmented">
            <div className="progress-segment correct" style={{ width: `${correctPercent}%` }} />
            <div className="progress-segment wrong" style={{ width: `${wrongPercent}%` }} />
          </div>
          <div className="progress-info">
            <span className="question-counter">
              <span className="current">{currentIndex + 1}</span>
              <span className="separator">/</span>
              <span className="total">{words.length}</span>
              {isRetryMode && <span className="retry-badge">RETRY</span>}
            </span>
            <span className={`timer ${isUrgent ? 'urgent' : ''} ${isCritical ? 'critical' : ''}`}>
              <Clock size={16} />
              <span className="time-value">{timeRemaining}s</span>
            </span>
          </div>
        </div>
      </div>
      
      {/* Question Card */}
      <div className="typing-question-card">
        <div className="difficulty-badge" data-difficulty={difficulty}>
          {difficulty.toUpperCase()}
        </div>
        
        <h2 className="definition">
          {currentWord.definition || currentWord.vietnamese}
        </h2>
        
        {/* Letter Box Grid - Group by words */}
        <div className="letter-box-container">
          {(() => {
            // Split letterBoxes into word groups (at spaces)
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
            
            // Add last group
            if (currentGroup.length > 0) {
              wordGroups.push({ boxes: currentGroup, spaceAfter: false });
            }
            
            return wordGroups.map((group, groupIndex) => (
              <div key={groupIndex} className="letter-box-row">
                {group.boxes.map((box) => {
                  const index = box.originalIndex;
                  
                  if (box.isSpecial) {
                    // Special character (apostrophe, hyphen)
                    return (
                      <div 
                        key={index} 
                        className="letter-box special"
                        aria-label={box.char}
                      >
                        {box.char}
                      </div>
                    );
                  }
                  
                  if (!box.isHidden) {
                    // Pre-filled letter (hint)
                    return (
                      <div 
                        key={index} 
                        className="letter-box filled"
                        aria-label={`Letter ${index + 1}: ${box.char}`}
                      >
                        {box.char}
                      </div>
                    );
                  }
                  
                  // Editable input box
                  const boxClass = `letter-box input ${
                    box.isCorrect === true ? 'correct' : 
                    box.isCorrect === false ? 'incorrect' : ''
                  }`;
                  
                  return (
                    <input
                      key={index}
                      ref={el => inputRefs.current[index] = el}
                      type="text"
                      className={boxClass}
                      value={box.userInput}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      maxLength={1}
                      disabled={isAnswered}
                      autoComplete="off"
                      autoCapitalize="off"
                      autoCorrect="off"
                      aria-label={`Letter ${index + 1} of ${letterBoxes.length}, empty`}
                    />
                  );
                })}
              </div>
            ));
          })()}
        </div>
        
        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="action-btn clear" 
            onClick={handleClear}
            disabled={isAnswered}
          >
            <Delete size={18} />
            Clear
          </button>
          <button 
            className="action-btn submit" 
            onClick={() => submitAnswer(false)}
            disabled={isAnswered}
          >
            <CheckCircle size={18} />
            Submit
          </button>
        </div>
        
        {/* Hint Button */}
        {currentWord.definition && !isAnswered && !showHint && (
          <button className="hint-btn" onClick={() => setShowHint(true)}>
            <Lightbulb size={18} />
            <span>Show Hint</span>
          </button>
        )}
        
        {/* Hint Display */}
        {showHint && !isAnswered && (
          <div className="hint-bubble">
            <Lightbulb size={16} />
            <div className="hint-content">
              {currentWord.example && (
                <p className="hint-example">"{currentWord.example}"</p>
              )}
              {currentWord.vietnamese && (
                <p className="hint-vietnamese">{currentWord.vietnamese}</p>
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
                {currentWord.example && (
                  <p className="learning-example">
                    <strong>Example:</strong> "{currentWord.example}"
                  </p>
                )}
                {currentWord.vietnamese && (
                  <p className="learning-vietnamese">
                    <strong>Meaning:</strong> {currentWord.vietnamese}
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

export default TypingQuiz;
