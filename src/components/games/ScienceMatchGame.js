import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Brain } from 'lucide-react';
import anime from 'animejs';
import './ScienceMatchGame.css';

// 5 Distinct colors for the 5 maximum connections per round
const CONNECTION_COLORS = ['#f87171', '#60a5fa', '#facc15', '#4ade80', '#c084fc'];

// Utility to shuffle array
const shuffle = (array) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

const ScienceMatchGame = ({ words, isAllQuestions = false, onAnswer, onComplete, onHome, gameId }) => {
    const [rounds, setRounds] = useState([]);
    const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
    
    // UI state for the current round
    const [shuffledWords, setShuffledWords] = useState([]);
    const [shuffledDefs, setShuffledDefs] = useState([]);
    
    // Connection state
    // connections = array of { defId, wordId, color }
    const [connections, setConnections] = useState([]);
    const [activeDefId, setActiveDefId] = useState(null);
    const [activeWordId, setActiveWordId] = useState(null);
    
    // Verification state
    const [verifiedCorrect, setVerifiedCorrect] = useState([]); // array of matched IDs (since defId === wordId)
    const [verifiedWrong, setVerifiedWrong] = useState([]); // array of connections
    const [hintConnections, setHintConnections] = useState([]); // array of correct pairs shown as hints
    const [isChecking, setIsChecking] = useState(false);
    const [showRoundComplete, setShowRoundComplete] = useState(false);
    
    // Stats
    const [score, setScore] = useState(0);
    const [startTime, setStartTime] = useState(Date.now());
    
    // Refs for measurements
    const boardRef = useRef(null);
    const defDotRefs = useRef({});
    const wordDotRefs = useRef({});
    const [dotCoords, setDotCoords] = useState({ defs: {}, words: {} });

    // Initialize game rounds
    useEffect(() => {
        if (!words || words.length === 0) return;
        
        const pairsPerRound = 5;
        const selectedWords = shuffle([...words]);
        const generatedRounds = [];

        for (let i = 0; i < selectedWords.length; i += pairsPerRound) {
            const roundItems = selectedWords.slice(i, i + pairsPerRound).map((item) => ({
                id: item.word + '_' + Math.random().toString(36).substring(7),
                word: item.word,
                definition: item.definition || item.translation || 'No definition'
            }));

            generatedRounds.push(roundItems);
        }
        
        setRounds(generatedRounds);
        setupRound(generatedRounds[0]);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [words, isAllQuestions]);

    const setupRound = (roundItems) => {
        if (!roundItems) return;
        setShuffledWords(shuffle([...roundItems]));
        setShuffledDefs(shuffle([...roundItems]));
        setConnections([]);
        setActiveDefId(null);
        setActiveWordId(null);
        setVerifiedCorrect([]);
        setVerifiedWrong([]);
        setHintConnections([]);
        setIsChecking(false);
        setStartTime(Date.now());
        
        setTimeout(() => measureDots(), 100);
        
        setTimeout(() => {
            anime({
                targets: '.science-match-card',
                translateY: [20, 0],
                opacity: [0, 1],
                delay: anime.stagger(50),
                duration: 500,
                easing: 'easeOutQuad'
            });
        }, 150);
    };

    // Measure positions of connection dots relative to the board
    const measureDots = useCallback(() => {
        if (!boardRef.current) return;
        const boardRect = boardRef.current.getBoundingClientRect();
        
        const newCoords = { defs: {}, words: {} };
        const scrollY = boardRef.current.scrollTop;
        const scrollX = boardRef.current.scrollLeft;
        
        Object.keys(defDotRefs.current).forEach(id => {
            const el = defDotRefs.current[id];
            if (el) {
                const rect = el.getBoundingClientRect();
                newCoords.defs[id] = {
                    x: rect.left - boardRect.left + scrollX + rect.width / 2,
                    y: rect.top - boardRect.top + scrollY + rect.height / 2
                };
            }
        });
        
        Object.keys(wordDotRefs.current).forEach(id => {
            const el = wordDotRefs.current[id];
            if (el) {
                const rect = el.getBoundingClientRect();
                newCoords.words[id] = {
                    x: rect.left - boardRect.left + scrollX + rect.width / 2,
                    y: rect.top - boardRect.top + scrollY + rect.height / 2
                };
            }
        });
        
        setDotCoords(newCoords);
    }, []);

    // Update measurements on resize or scroll
    useEffect(() => {
        window.addEventListener('resize', measureDots);
        return () => window.removeEventListener('resize', measureDots);
    }, [measureDots]);

    const getAvailableColor = () => {
        const usedColors = connections.map(c => c.color);
        return CONNECTION_COLORS.find(c => !usedColors.includes(c)) || CONNECTION_COLORS[0];
    };

    const handleDefClick = (id) => {
        if (isChecking || verifiedCorrect.includes(id)) return;
        
        // If already connected, disconnect it
        const existingConnection = connections.find(c => c.defId === id);
        if (existingConnection) {
            setConnections(prev => prev.filter(c => c.defId !== id));
            return;
        }
        
        if (activeDefId === id) {
            setActiveDefId(null);
        } else {
            setActiveDefId(id);
            if (activeWordId) {
                // Form connection
                const color = getAvailableColor();
                setConnections(prev => [...prev, { defId: id, wordId: activeWordId, color }]);
                setActiveDefId(null);
                setActiveWordId(null);
                if (window.navigator?.vibrate) window.navigator.vibrate([20]);
            }
        }
    };

    const handleWordClick = (id) => {
        if (isChecking || verifiedCorrect.includes(id)) return;
        
        // If already connected, disconnect it
        const existingConnection = connections.find(c => c.wordId === id);
        if (existingConnection) {
            setConnections(prev => prev.filter(c => c.wordId !== id));
            return;
        }
        
        if (activeWordId === id) {
            setActiveWordId(null);
        } else {
            setActiveWordId(id);
            if (activeDefId) {
                // Form connection
                const color = getAvailableColor();
                setConnections(prev => [...prev, { defId: activeDefId, wordId: id, color }]);
                setActiveDefId(null);
                setActiveWordId(null);
                if (window.navigator?.vibrate) window.navigator.vibrate([20]);
            }
        }
    };

    const handleCheckAnswers = () => {
        setIsChecking(true);
        const correctList = [...verifiedCorrect];
        const wrongList = [];
        const hintList = [];
        const currentRoundItems = rounds[currentRoundIndex];
        
        // Find newly verified ones among connections
        connections.forEach(conn => {
            // Already verified?
            if (verifiedCorrect.includes(conn.defId) && verifiedCorrect.includes(conn.wordId)) return;
            
            // Note: because words can be identical across different units if combined, 
            // relying on exact ID match is safe since ID is derived from word_random.
            // Actually wait, ID = 'word_random'. The word text is what matters for accuracy.
            const defItem = shuffledDefs.find(d => d.id === conn.defId);
            const wordItem = shuffledWords.find(w => w.id === conn.wordId);
            const isCorrect = defItem && wordItem && defItem.word === wordItem.word;
            
            if (isCorrect) {
                // Just use the defId as the success marker so we don't accidentally match duplicates
                correctList.push(conn.defId);
                correctList.push(conn.wordId);
                setScore(prev => prev + 10);
                
                if (onAnswer) {
                    onAnswer(wordItem.word, true, Date.now() - startTime);
                }
            } else {
                wrongList.push(conn);
                setScore(prev => Math.max(0, prev - 2));
                
                if (onAnswer && wordItem) {
                    onAnswer(wordItem.word, false, Date.now() - startTime);
                }
                
                // Generate hint for this incorrect definition
                if (defItem) {
                    const correctWordItem = shuffledWords.find(w => w.word === defItem.word);
                    if (correctWordItem) {
                        hintList.push({ 
                            defId: conn.defId, 
                            wordId: correctWordItem.id, 
                            color: '#fbbf24' // Yellow hint
                        });
                    }
                }
            }
        });
        
        setVerifiedCorrect(correctList);
        setVerifiedWrong(wrongList);
        
        if (wrongList.length > 0) {
            if (window.navigator?.vibrate) window.navigator.vibrate([200, 100, 200]);
            
            // Task 2: Do not clear wrong answer but blinking connection as red color
            anime({
                targets: '.science-line-error',
                opacity: [1, 0.2, 1, 0.2, 1, 0.2, 1], // Blink effect
                duration: 5000,
                easing: 'linear'
            });
            
            // After 5s blink finishes, release check lock so kid can try again
            // We do NOT clear wrong connections, so they stay red (verifiedWrong)
            // and kids can click dots to manually re-connect.
            setTimeout(() => {
                setIsChecking(false);
            }, 5000); // 5 seconds
        } else {
            if (window.navigator?.vibrate) window.navigator.vibrate([50, 50]);
            
            if (correctList.length === currentRoundItems.length * 2) {
                // Task 1: Pause about 3 seconds if passed to show result to kids
                // Display the score of that play
                setShowRoundComplete(true);
                setTimeout(() => {
                    setShowRoundComplete(false);
                    if (currentRoundIndex < rounds.length - 1) {
                        setCurrentRoundIndex(prev => prev + 1);
                        setupRound(rounds[currentRoundIndex + 1]);
                    } else {
                        if (onComplete) {
                            const totalQuestions = rounds.reduce((sum, round) => sum + round.length, 0);
                            onComplete({
                                score,
                                totalCorrect: score > 0 ? score/10 : 0,
                                totalQuestions
                            });
                        }
                    }
                }, 3000); // 3 seconds
            } else {
                setIsChecking(false);
            }
        }
    };

    if (rounds.length === 0) {
        return <div className="science-match-container h-full flex items-center justify-center">Loading...</div>;
    }

    const currentRoundItems = rounds[currentRoundIndex];
    if (!currentRoundItems) return null;
    
    const progressPercentage = (currentRoundIndex / rounds.length) * 100;
    const isAllConnected = connections.length === currentRoundItems.length;

    return (
        <div className="science-match-container">
            {/* Header */}
            <div className="science-match-header">
                <button className="science-match-back-btn" onClick={onHome}>
                    <ArrowLeft size={24} />
                </button>
                
                <div className="science-match-progress-container">
                    <Brain size={20} color="#a78bfa" />
                    <div className="science-match-progress-bar">
                        <div 
                            className="science-match-progress-fill" 
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    <span className="science-match-round-text">
                        Round {currentRoundIndex + 1} / {rounds.length}
                    </span>
                </div>
                
                <div className="science-match-score">
                    ⭐ {score}
                </div>
            </div>

            {/* Board composed of 3 areas */}
            <div 
                className="science-match-board" 
                ref={boardRef} 
                onScroll={measureDots} 
                onWheel={measureDots} 
                onTouchMove={measureDots}
                style={{ position: 'relative' }}
            >
                {/* Score overlay for completed play */}
                {showRoundComplete && (
                    <div className="science-match-round-complete" style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        zIndex: 100,
                        borderRadius: '24px',
                        animation: 'fadeIn 0.3s ease-out'
                    }}>
                        <h2 style={{ fontSize: '2.5rem', color: '#4ade80', marginBottom: '10px', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>Excellent!</h2>
                        <p style={{ fontSize: '1.5rem', color: '#1e293b', fontWeight: 'bold' }}>
                            Score: ⭐ {score}
                        </p>
                    </div>
                )}

                {/* SVG Overlay for lines */}
                <svg className="science-match-svg-overlay">
                    {/* Render hint connections (dashed lines) */}
                    {hintConnections.map((c, i) => {
                        const start = dotCoords.defs[c.defId];
                        const end = dotCoords.words[c.wordId];
                        if (!start || !end) return null;
                        
                        return (
                            <line
                                key={`hint-${c.defId}-${c.wordId}-${i}`}
                                x1={start.x}
                                y1={start.y}
                                x2={end.x}
                                y2={end.y}
                                stroke={c.color || '#fbbf24'}
                                strokeWidth="4"
                                strokeDasharray="10 10"
                                strokeLinecap="round"
                            />
                        );
                    })}

                    {/* Main user connections */}
                    {connections.map((c, i) => {
                        const start = dotCoords.defs[c.defId];
                        const end = dotCoords.words[c.wordId];
                        if (!start || !end) return null;
                        
                        const isCorrect = verifiedCorrect.includes(c.defId);
                        const isWrong = verifiedWrong.includes(c);
                        
                        let strokeColor = c.color;
                        if (isCorrect) strokeColor = '#4ade80'; // Force green when locked correct
                        if (isWrong) strokeColor = '#f87171'; // Red when wrong
                        
                        return (
                            <line
                                key={`${c.defId}-${c.wordId}-${i}`}
                                x1={start.x}
                                y1={start.y}
                                x2={end.x}
                                y2={end.y}
                                stroke={strokeColor}
                                strokeWidth="5"
                                strokeLinecap="round"
                                className={`science-line-path ${isWrong ? 'science-line-error' : ''}`}
                            />
                        );
                    })}
                </svg>

                {/* Left: Definitions Column (45%) */}
                <div className="science-match-column science-match-column-left">
                    <div className="science-match-column-title">Theory</div>
                    {shuffledDefs.map(item => {
                        const isSelected = activeDefId === item.id;
                        const match = connections.find(c => c.defId === item.id);
                        const isMatched = verifiedCorrect.includes(item.id);
                        
                        let cardStyle = {};
                        let dotStyle = {};
                        
                        if (match) {
                            cardStyle = { borderColor: match.color, background: `${match.color}20` };
                            dotStyle = { background: match.color, borderColor: 'white' };
                        } else if (isSelected) {
                            cardStyle = { borderColor: 'white', background: 'rgba(255,255,255,0.2)' };
                            dotStyle = { background: 'white', borderColor: 'rgba(255,255,255,0.8)' };
                        }
                        
                        if (isMatched) {
                            cardStyle = { ...cardStyle, opacity: 0.8, borderColor: '#4ade80', background: 'rgba(74,222,128,0.2)' };
                            dotStyle = { background: '#4ade80', borderColor: 'white' };
                        }
                        
                        let cardClass = 'science-match-card science-match-def';
                        if (isSelected) cardClass += ' is-selected';
                        if (match) cardClass += ' is-connected';
                        
                        return (
                            <div 
                                key={`def-${item.id}`}
                                className={cardClass}
                                style={cardStyle}
                                onClick={() => handleDefClick(item.id)}
                            >
                                {item.definition}
                                <div 
                                    className="science-match-dot" 
                                    style={dotStyle}
                                    ref={el => defDotRefs.current[item.id] = el}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* Center: Empty Space for lines (20%) */}
                <div className="science-match-column science-match-column-center"></div>

                {/* Right: Terms Column (35%) */}
                <div className="science-match-column science-match-column-right">
                    <div className="science-match-column-title">Term</div>
                    {shuffledWords.map(item => {
                        const isSelected = activeWordId === item.id;
                        const match = connections.find(c => c.wordId === item.id);
                        const isMatched = verifiedCorrect.includes(item.id);
                        
                        let cardStyle = {};
                        let dotStyle = {};
                        
                        if (match) {
                            cardStyle = { borderColor: match.color, background: `${match.color}20` };
                            dotStyle = { background: match.color, borderColor: 'white' };
                        } else if (isSelected) {
                            cardStyle = { borderColor: 'white', background: 'rgba(255,255,255,0.2)' };
                            dotStyle = { background: 'white', borderColor: 'rgba(255,255,255,0.8)' };
                        }
                        
                        if (isMatched) {
                            cardStyle = { ...cardStyle, opacity: 0.8, borderColor: '#4ade80', background: 'rgba(74,222,128,0.2)' };
                            dotStyle = { background: '#4ade80', borderColor: 'white' };
                        }
                        
                        let cardClass = 'science-match-card science-match-word';
                        if (isSelected) cardClass += ' is-selected';
                        if (match) cardClass += ' is-connected';
                        
                        return (
                            <div 
                                key={`word-${item.id}`}
                                className={cardClass}
                                style={cardStyle}
                                onClick={() => handleWordClick(item.id)}
                            >
                                <div 
                                    className="science-match-dot" 
                                    style={dotStyle}
                                    ref={el => wordDotRefs.current[item.id] = el}
                                />
                                {item.word}
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Actions Footer */}
            <div className="science-match-actions">
                <button 
                    className="science-match-check-btn"
                    onClick={handleCheckAnswers}
                    disabled={!isAllConnected || isChecking}
                >
                    {isChecking ? "Checking..." : "Check Matches"}
                </button>
            </div>
        </div>
    );
};

export default ScienceMatchGame;
