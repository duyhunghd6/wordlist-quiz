import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Check, Clock, Search, Home } from 'lucide-react';
import './GameUI.css';
import './WordSearch.css';

/**
 * WordSearch Game Component
 * 
 * Classic word search grid. Words are hidden horizontally, vertically, or diagonally.
 * User drags to select letters. Find all words before time runs out.
 */

const GAME_TIME_LIMIT = 120000; // 2 minutes total
const GRID_SIZE = 10;
const DIRECTIONS = [
  { dx: 1, dy: 0 },   // right
  { dx: 0, dy: 1 },   // down
  { dx: 1, dy: 1 },   // diagonal down-right
  { dx: -1, dy: 1 },  // diagonal down-left
];

const WordSearch = ({ words, onAnswer, onComplete, onHome, gameId = 'wordSearch' }) => {
  const [grid, setGrid] = useState([]);
  const [wordList, setWordList] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const [selection, setSelection] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(GAME_TIME_LIMIT);
  const [wordStartTimes, setWordStartTimes] = useState({});
  const [lastFoundWord, setLastFoundWord] = useState(null);
  const [highlightedCells, setHighlightedCells] = useState([]);
  const [gameComplete, setGameComplete] = useState(false);
  
  const gridRef = useRef(null);
  const timerRef = useRef(null);

  // Filter to single words only (no phrases) and limit for grid
  const filterWords = useCallback((allWords) => {
    return allWords
      .filter(w => !w.word.includes(' ') && w.word.length <= GRID_SIZE)
      .slice(0, Math.min(6, allWords.length)); // Max 6 words per puzzle
  }, []);

  // Generate word search grid
  const generateGrid = useCallback((wordsToPlace) => {
    const newGrid = Array(GRID_SIZE).fill(null).map(() => 
      Array(GRID_SIZE).fill(null).map(() => ({ letter: '', wordId: null }))
    );
    
    const placedWords = [];
    
    for (const wordObj of wordsToPlace) {
      const word = wordObj.word.toUpperCase();
      let placed = false;
      let attempts = 0;
      
      while (!placed && attempts < 100) {
        attempts++;
        const direction = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
        const maxX = GRID_SIZE - (direction.dx > 0 ? word.length : (direction.dx < 0 ? 1 : 1));
        const maxY = GRID_SIZE - (direction.dy > 0 ? word.length : 1);
        const startX = direction.dx < 0 
          ? word.length - 1 + Math.floor(Math.random() * (GRID_SIZE - word.length + 1))
          : Math.floor(Math.random() * (maxX + 1));
        const startY = Math.floor(Math.random() * (maxY + 1));
        
        // Check if word fits
        let canPlace = true;
        const positions = [];
        
        for (let i = 0; i < word.length; i++) {
          const x = startX + direction.dx * i;
          const y = startY + direction.dy * i;
          
          if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) {
            canPlace = false;
            break;
          }
          
          const cell = newGrid[y][x];
          if (cell.letter && cell.letter !== word[i]) {
            canPlace = false;
            break;
          }
          positions.push({ x, y, letter: word[i] });
        }
        
        if (canPlace) {
          positions.forEach(({ x, y, letter }) => {
            newGrid[y][x] = { letter, wordId: wordObj.word };
          });
          placedWords.push({
            ...wordObj,
            positions,
            found: false
          });
          placed = true;
        }
      }
    }
    
    // Fill empty cells with random letters
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        if (!newGrid[y][x].letter) {
          newGrid[y][x].letter = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }
    
    return { grid: newGrid, placedWords };
  }, []);

  // Initialize game
  useEffect(() => {
    if (words.length === 0) return;
    
    const filteredWords = filterWords(words);
    const { grid: newGrid, placedWords } = generateGrid(filteredWords);
    
    setGrid(newGrid);
    setWordList(placedWords);
    setFoundWords([]);
    setStartTime(Date.now());
    setTimeLeft(GAME_TIME_LIMIT);
    setWordStartTimes({});
    setGameComplete(false);
    
    // Start timer for all words
    const initialTimes = {};
    placedWords.forEach(w => {
      initialTimes[w.word] = Date.now();
    });
    setWordStartTimes(initialTimes);
  }, [words, filterWords, generateGrid]);

  // Timer countdown
  useEffect(() => {
    if (gameComplete) return;
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 100;
      });
    }, 100);
    
    return () => clearInterval(timerRef.current);
  }, [gameComplete]);

  const handleTimeout = () => {
    setGameComplete(true);
    clearInterval(timerRef.current);
    
    // Mark unfound words as wrong
    const unfoundWords = wordList.filter(w => !foundWords.includes(w.word));
    unfoundWords.forEach(word => {
      onAnswer(word.word, false, GAME_TIME_LIMIT);
    });
    
    finishGame(foundWords, unfoundWords.map(w => w));
  };

  const getCellFromEvent = (e) => {
    if (!gridRef.current) return null;
    
    const rect = gridRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const cellWidth = rect.width / GRID_SIZE;
    const cellHeight = rect.height / GRID_SIZE;
    
    const x = Math.floor((clientX - rect.left) / cellWidth);
    const y = Math.floor((clientY - rect.top) / cellHeight);
    
    if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
      return { x, y };
    }
    return null;
  };

  const handleSelectionStart = (e) => {
    if (gameComplete) return;
    e.preventDefault();
    
    const cell = getCellFromEvent(e);
    if (cell) {
      setIsSelecting(true);
      setSelection([cell]);
    }
  };

  const handleSelectionMove = (e) => {
    if (!isSelecting || gameComplete) return;
    e.preventDefault();
    
    const cell = getCellFromEvent(e);
    if (cell && selection.length > 0) {
      const start = selection[0];
      
      // Check if this forms a valid line (horizontal, vertical, or diagonal)
      const dx = Math.sign(cell.x - start.x);
      const dy = Math.sign(cell.y - start.y);
      
      if (dx === 0 && dy === 0) {
        setSelection([start]);
        return;
      }
      
      // Only allow straight lines
      const isHorizontal = dy === 0;
      const isVertical = dx === 0;
      const isDiagonal = Math.abs(cell.x - start.x) === Math.abs(cell.y - start.y);
      
      if (!isHorizontal && !isVertical && !isDiagonal) return;
      
      // Build path from start to current
      const newSelection = [];
      let x = start.x;
      let y = start.y;
      
      while (true) {
        newSelection.push({ x, y });
        if (x === cell.x && y === cell.y) break;
        x += dx;
        y += dy;
        if (newSelection.length > GRID_SIZE) break; // Safety
      }
      
      setSelection(newSelection);
    }
  };

  const handleSelectionEnd = () => {
    if (!isSelecting || gameComplete) return;
    setIsSelecting(false);
    
    // Check if selection matches any word
    const selectedWord = selection.map(
      ({ x, y }) => grid[y]?.[x]?.letter || ''
    ).join('');
    
    const matchedWord = wordList.find(w => {
      const wordUpper = w.word.toUpperCase();
      return (wordUpper === selectedWord || wordUpper === selectedWord.split('').reverse().join('')) 
        && !foundWords.includes(w.word);
    });
    
    if (matchedWord) {
      // Found a word!
      const responseTime = Date.now() - (wordStartTimes[matchedWord.word] || startTime);
      onAnswer(matchedWord.word, true, responseTime);
      
      const newFoundWords = [...foundWords, matchedWord.word];
      setFoundWords(newFoundWords);
      setLastFoundWord(matchedWord);
      setHighlightedCells([...highlightedCells, ...selection.map(s => `${s.x}-${s.y}`)]);
      
      // Check if all words found
      if (newFoundWords.length === wordList.length) {
        setGameComplete(true);
        clearInterval(timerRef.current);
        finishGame(newFoundWords, []);
      }
    }
    
    setSelection([]);
  };

  const finishGame = (found, unfound) => {
    setTimeout(() => {
      const results = {
        gameId,
        totalQuestions: wordList.length,
        correctAnswers: found.length,
        wrongAnswers: unfound,
        averageResponseTime: found.length > 0 
          ? (GAME_TIME_LIMIT - timeLeft) / found.length 
          : GAME_TIME_LIMIT
      };
      onComplete(results);
    }, 2000);
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (grid.length === 0) {
    return <div className="wordsearch-container">Loading...</div>;
  }

  const isUrgent = timeLeft < 30000;
  const isCritical = timeLeft < 15000;

  return (
    <div className="wordsearch-container">
      {/* Header */}
      <div className="wordsearch-header">
        <button className="home-btn-small" onClick={onHome} aria-label="Go home">
          <Home size={24} />
        </button>
        <div className="header-left">
          <Search size={20} />
          <span>Find all words!</span>
        </div>
        <div className={`timer ${isUrgent ? 'urgent' : ''} ${isCritical ? 'critical' : ''}`}>
          <Clock size={16} />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="wordsearch-progress">
        <div className="progress-text">
          Found: <strong>{foundWords.length}</strong> / {wordList.length}
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${(foundWords.length / wordList.length) * 100}%` }} 
          />
        </div>
      </div>

      {/* Word List */}
      <div className="word-list">
        {wordList.map((word) => (
          <div 
            key={word.word}
            className={`word-chip ${foundWords.includes(word.word) ? 'found' : ''}`}
          >
            <span className="word-text">{word.word}</span>
            {foundWords.includes(word.word) && <Check size={14} />}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div 
        ref={gridRef}
        className="wordsearch-grid"
        onMouseDown={handleSelectionStart}
        onMouseMove={handleSelectionMove}
        onMouseUp={handleSelectionEnd}
        onMouseLeave={handleSelectionEnd}
        onTouchStart={handleSelectionStart}
        onTouchMove={handleSelectionMove}
        onTouchEnd={handleSelectionEnd}
      >
        {grid.map((row, y) => (
          <div key={y} className="grid-row">
            {row.map((cell, x) => {
              const isSelected = selection.some(s => s.x === x && s.y === y);
              const isHighlighted = highlightedCells.includes(`${x}-${y}`);
              
              return (
                <div 
                  key={x}
                  className={`grid-cell ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                >
                  {cell.letter}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Found Word Popup */}
      {lastFoundWord && (
        <div className="found-popup" key={lastFoundWord.word}>
          <Check size={16} />
          <span><strong>{lastFoundWord.word}</strong>: {lastFoundWord.definition}</span>
        </div>
      )}

      {/* Game Complete */}
      {gameComplete && (
        <div className="game-complete-overlay">
          <div className="complete-card">
            {foundWords.length === wordList.length ? (
              <>
                <Check size={40} className="success-icon" />
                <h2>All Words Found!</h2>
              </>
            ) : (
              <>
                <Clock size={40} className="timeout-icon" />
                <h2>Time's Up!</h2>
                <p>You found {foundWords.length} of {wordList.length} words</p>
              </>
            )}
            <p className="loading-text">Loading results...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordSearch;
