import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Check, Clock, Search, Home } from 'lucide-react';

const GAME_TIME_LIMIT = 600000; // 10 minutes total
const GRID_SIZE = 10;
const DIRECTIONS = [
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 1, dy: 1 },
  { dx: -1, dy: 1 },
];

const WordSearch = ({ words, numQuestions = 10, onAnswer, onComplete, onHome, gameId = 'wordSearch', isAllQuestions = false }) => {
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

  const filterWords = useCallback((allWords) => {
    const playableWords = allWords.filter(w => !w.word.includes(' ') && w.word.length <= GRID_SIZE);
    const count = isAllQuestions
      ? playableWords.length
      : Math.min(numQuestions || playableWords.length || 10, playableWords.length);
    return playableWords.slice(0, count);
  }, [isAllQuestions, numQuestions]);

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
    
    const initialTimes = {};
    placedWords.forEach(w => {
      initialTimes[w.word] = Date.now();
    });
    setWordStartTimes(initialTimes);
  }, [words, filterWords, generateGrid]);

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameComplete]);

  const handleTimeout = () => {
    setGameComplete(true);
    clearInterval(timerRef.current);
    
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
      
      const dx = Math.sign(cell.x - start.x);
      const dy = Math.sign(cell.y - start.y);
      
      if (dx === 0 && dy === 0) {
        setSelection([start]);
        return;
      }
      
      const isHorizontal = dy === 0;
      const isVertical = dx === 0;
      const isDiagonal = Math.abs(cell.x - start.x) === Math.abs(cell.y - start.y);
      
      if (!isHorizontal && !isVertical && !isDiagonal) return;
      
      const newSelection = [];
      let x = start.x;
      let y = start.y;
      
      while (true) {
        newSelection.push({ x, y });
        if (x === cell.x && y === cell.y) break;
        x += dx;
        y += dy;
        if (newSelection.length > GRID_SIZE) break;
      }
      
      setSelection(newSelection);
    }
  };

  const handleSelectionEnd = () => {
    if (!isSelecting || gameComplete) return;
    setIsSelecting(false);
    
    const selectedWord = selection.map(
      ({ x, y }) => grid[y]?.[x]?.letter || ''
    ).join('');
    
    const matchedWord = wordList.find(w => {
      const wordUpper = w.word.toUpperCase();
      return (wordUpper === selectedWord || wordUpper === selectedWord.split('').reverse().join('')) 
        && !foundWords.includes(w.word);
    });
    
    if (matchedWord) {
      const responseTime = Date.now() - (wordStartTimes[matchedWord.word] || startTime);
      onAnswer(matchedWord.word, true, responseTime);
      
      const newFoundWords = [...foundWords, matchedWord.word];
      setFoundWords(newFoundWords);
      setLastFoundWord(matchedWord);
      setHighlightedCells([...highlightedCells, ...selection.map(s => `${s.x}-${s.y}`)]);
      
      if (newFoundWords.length === wordList.length) {
        setGameComplete(true);
        clearInterval(timerRef.current);
        finishGame(newFoundWords, []);
      }
      
      // Auto-hide popup after 3 seconds
      setTimeout(() => {
        setLastFoundWord(null);
      }, 3000);
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

  if (grid.length === 0) return <div>Loading...</div>;

  const isUrgent = timeLeft < 30000;
  const isCritical = timeLeft < 15000;

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
              style={{ width: `${(timeLeft / GAME_TIME_LIMIT) * 100}%` }}
            />
            <div className="timer-icon"><Clock size={16} /> <span style={{ marginLeft: '4px', fontSize: '0.8rem', fontWeight: 800 }}>{formatTime(timeLeft)}</span></div>
          </div>
        </div>

        <div className="score-pill">
          <span style={{ fontSize: '18px' }}>⭐</span>
          <span className="score-text">{foundWords.length}/{wordList.length}</span>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '-10px' }}>
        <span className="badge badge-accent"><Search size={14} style={{ marginRight: '4px' }}/> Find all the words!</span>
      </div>

      {/* Main Container */}
      <div className="card shadow-md" style={{ width: '100%', padding: 'var(--space-md)', textAlign: 'center', position: 'relative' }}>
        
        {/* Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)', justifyContent: 'center', marginBottom: 'var(--space-xl)' }}>
          {wordList.map((word) => (
            <div 
              key={word.word}
              className={`badge ${foundWords.includes(word.word) ? 'badge-success' : 'badge-neutral'}`}
              style={{ padding: 'var(--space-xs) var(--space-sm)', opacity: foundWords.includes(word.word) ? 0.6 : 1 }}
            >
              <span style={{ textTransform: 'uppercase', fontWeight: 800 }}>{word.word}</span>
              {foundWords.includes(word.word) && <Check size={14} style={{ marginLeft: '4px' }} />}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div 
          ref={gridRef}
          style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, 
            gap: '2px', 
            background: 'var(--color-border-default)', 
            border: '4px solid var(--color-border-default)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            touchAction: 'none',
            margin: '0 auto',
            maxWidth: '500px'
          }}
          onMouseDown={handleSelectionStart}
          onMouseMove={handleSelectionMove}
          onMouseUp={handleSelectionEnd}
          onMouseLeave={handleSelectionEnd}
          onTouchStart={handleSelectionStart}
          onTouchMove={handleSelectionMove}
          onTouchEnd={handleSelectionEnd}
        >
          {grid.map((row, y) => (
            row.map((cell, x) => {
              const isSelected = selection.some(s => s.x === x && s.y === y);
              const isHighlighted = highlightedCells.includes(`${x}-${y}`);
              
              let bg = 'white';
              let color = 'var(--color-text-primary)';
              
              if (isSelected) {
                bg = 'var(--color-accent)';
                color = 'white';
              } else if (isHighlighted) {
                bg = '#D1FAE5'; // light emerald
                color = 'var(--color-success-hover)';
              }
              
              return (
                <div 
                  key={`${x}-${y}`}
                  style={{
                    backgroundColor: bg,
                    color: color,
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    userSelect: 'none',
                    transition: 'all 0.1s'
                  }}
                >
                  {cell.letter}
                </div>
              );
            })
          ))}
        </div>

        {/* Found Popup Overlay */}
        {lastFoundWord && (
          <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: 'var(--color-success)', color: 'white', padding: 'var(--space-md) var(--space-xl)', borderRadius: 'var(--radius-full)', fontWeight: 700, boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 10, animation: 'fadeIn 0.3s' }}>
            <Check size={20} />
            {lastFoundWord.word}
          </div>
        )}

      </div>

      {/* Game Complete Overlay */}
      {gameComplete && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(30, 41, 59, 0.8)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-md)' }}>
          <div className="card shadow-lg" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: 'var(--space-2xl)' }}>
            {foundWords.length === wordList.length ? (
              <>
                <div style={{ color: 'var(--color-success)', marginBottom: 'var(--space-sm)' }}>
                  <Check size={64} style={{ margin: '0 auto' }} />
                </div>
                <h2 style={{ fontSize: '2rem', margin: '0 0 var(--space-md) 0' }}>All Words Found!</h2>
              </>
            ) : (
              <>
                <div style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-sm)' }}>
                  <Clock size={64} style={{ margin: '0 auto' }} />
                </div>
                <h2 style={{ fontSize: '2rem', margin: '0 0 var(--space-md) 0' }}>Time's Up!</h2>
                <p style={{ fontSize: '1.2rem' }}>You found {foundWords.length} of {wordList.length} words</p>
              </>
            )}
            <p style={{ marginTop: 'var(--space-xl)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Loading results...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordSearch;
