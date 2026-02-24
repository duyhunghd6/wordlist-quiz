import React, { useState, useEffect, useCallback } from 'react';
import { useRunnerEngine } from './RunnerQuestionEngine';
import './EndlessRunner.css';

const EndlessRunner = ({ onComplete, words = [], tenseSentences = [] }) => {
    const [score, setScore] = useState(0);
    const [gameActive, setGameActive] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [feedback, setFeedback] = useState(null); // 'correct' or 'wrong'
    const [actionText, setActionText] = useState(null);
    
    // Global Timer state based on selected questions (5 -> 2 mins, 10 -> 4 mins, 20 -> 5 mins)
    const initialTime = words.length >= 20 ? 300 : (words.length >= 10 ? 240 : 120);
    const [timeLeft, setTimeLeft] = useState(initialTime); 
    const [maxTimeLeft] = useState(initialTime);
    
    // Performance Review Logger
    const sessionLogs = React.useRef([]);
    
    // For calculating time taken per individual question
    const questionStartTime = React.useRef(Date.now());

    // Initialize the Pedagogical Engine
    const { 
        currentQuestion, 
        level,
        maxLevel, 
        averageSpeedPercent,
        processAnswer, 
        generateNext 
    } = useRunnerEngine(words, tenseSentences);

    useEffect(() => {
        if (currentQuestion) {
            questionStartTime.current = Date.now();
        }
    }, [currentQuestion]);

    const handleOptionClick = useCallback((option) => {
        if (!gameActive || selectedId !== null || !currentQuestion) return;
        
        setSelectedId(option.id || -1);
        const isCorrect = option.isCorrect;
        const timeRemainingPercentage = timeLeft / maxTimeLeft;
        
        // Notify the engine to adjust difficulty internally based on speed
        processAnswer(isCorrect, timeRemainingPercentage);
        
        // Log for Review Dashboard
        const timeTaken = Math.round((Date.now() - questionStartTime.current) / 1000);
        const correctAnswerObj = currentQuestion.options.find(o => o.isCorrect);
        sessionLogs.current.push({
            question: currentQuestion.sentence || 'Spelling check',
            userAnswer: option.text,
            correctAnswer: correctAnswerObj ? correctAnswerObj.text : '?',
            isCorrect: isCorrect,
            timeTaken: timeTaken,
            timeLimit: currentQuestion.timeLimit || 20
        });

        if (isCorrect) {
            setFeedback('correct');
            // Harder questions yield higher base scores, plus a speed bonus multiplier
            const speedMultiplier = 1.0 + (timeRemainingPercentage * 0.5);
            const rawScore = 10 * (level / 2);
            const finalPoints = Math.round(rawScore * speedMultiplier);
            setScore(prev => prev + finalPoints);
            setActionText(`+${finalPoints}`);
        } else {
            setFeedback('wrong');
            setActionText("Miss!");
        }

        setTimeout(() => {
            setSelectedId(null);
            setFeedback(null);
            setActionText(null);
            generateNext();
        }, 800);
    }, [gameActive, selectedId, currentQuestion, timeLeft, maxTimeLeft, level, processAnswer, generateNext]);

    // Global Timer Logic - drains every second
    useEffect(() => {
        if (!gameActive) return; // Note: We want the global timer to keep ticking down even if selectedId is not null
        
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Global Time is up!
                    setGameActive(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        return () => clearInterval(timer);
    }, [gameActive]);

    const handleGameOverComplete = () => {
        if (onComplete) {
            const correctAnswers = sessionLogs.current.filter(l => l.isCorrect).length;
            const totalQuestions = sessionLogs.current.length;
            const totalSecondsSpent = sessionLogs.current.reduce((acc, log) => acc + log.timeTaken, 0);
            
            onComplete({
                score,
                correctCount: correctAnswers,
                totalQuestions: totalQuestions,
                totalTimeTaken: totalSecondsSpent
            });
        }
    };

    return (
        <div className="endless-runner-container" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999 }}>
            <div className="er-background">
                <div className="er-layer-far" style={{ animationPlayState: gameActive && selectedId===null ? 'running' : 'paused' }}></div>
                <div className="er-layer-bg" style={{ animationPlayState: gameActive && selectedId===null ? 'running' : 'paused' }}></div>
            </div>

            <div className="er-hud">
                <div className="er-score" style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ color: '#FCD34D' }}>LVL {level}</span>
                    <span>SCORE: {score}</span>
                </div>
                {/* Visual Timer Progress Bar Hidden */}
                <div className="er-timer" style={{ display: 'none' }}></div>
            </div>

            {/* Render sentence if a contextual/definition question */}
            {currentQuestion && currentQuestion.sentence && (
                <div key={currentQuestion.id} className="er-sentence-prompt" style={{ padding: '0 20px', textAlign: 'center' }}>
                    {currentQuestion.sentence}
                </div>
            )}

            {actionText && (
                <div className={`er-action-text ${feedback === 'correct' ? 'er-action-success' : 'er-action-error'}`}>
                    {actionText}
                </div>
            )}

            <div className="er-options-area">
                {currentQuestion && currentQuestion.options && currentQuestion.options.map(opt => {
                    let btnClass = "er-option-btn";
                    if (selectedId !== null) {
                        if (opt.id === selectedId) {
                            btnClass += feedback === 'correct' ? ' correct' : ' wrong';
                        } else if (feedback === 'wrong' && opt.isCorrect) {
                            btnClass += ' correct'; // Show the right one
                        } else {
                            btnClass += ' disabled';
                        }
                    }

                    return (
                        <div 
                            key={opt.id} 
                            className={btnClass}
                            onClick={() => handleOptionClick(opt)}
                        >
                            {opt.text}
                        </div>
                    );
                })}
            </div>

            <div className="er-character-area" style={{ left: 0, width: '100vw', padding: '0 5vw', boxSizing: 'border-box' }}>
                <div style={{ position: 'relative', width: '100%', height: '80px' }}>
                    <div className="er-character" style={{ 
                        animationPlayState: gameActive && selectedId===null ? 'running' : 'paused',
                        position: 'absolute',
                        left: `max(0px, calc(${(1 - (timeLeft / maxTimeLeft)) * 100}% - 70px))`,
                        bottom: '0',
                        transition: 'left 1s linear'
                    }}>
                        {gameActive && selectedId === null && <div className="er-dust"></div>}
                    </div>
                    <div style={{ 
                        position: 'absolute', 
                        right: '-10px', 
                        bottom: '0', 
                        fontSize: '3rem', 
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))',
                        paddingBottom: '10px'
                    }}>
                        🏅
                    </div>
                </div>
            </div>
            
            {!gameActive && (
                <div className="er-feedback-overlay" style={{ overflowY: 'auto', alignItems: 'flex-start', padding: '40px 20px' }}>
                    <div className="er-game-over" style={{ maxWidth: '600px', width: '100%', margin: '0 auto', background: '#F8FAFC', padding: '0', overflow: 'hidden' }}>
                        
                        <div style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', padding: '30px', color: 'white' }}>
                            <h2 style={{ color: 'white', margin: 0, fontSize: '2rem' }}>Run Complete!</h2>
                            <p style={{ color: '#93C5FD', margin: '5px 0 0', fontSize: '1.2rem' }}>Max Level: {maxLevel} • Avg Speed: {Math.round(averageSpeedPercent * 100)}%</p>
                        </div>

                        <div style={{ padding: '30px', textAlign: 'left' }}>
                            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                                <div style={{ flex: 1, background: 'white', padding: '15px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
                                    <h3 style={{ fontSize: '2rem', color: '#0369A1', margin: '0' }}>{score}</h3>
                                    <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 'bold' }}>FINAL SCORE</span>
                                </div>
                                <div style={{ flex: 1, background: 'white', padding: '15px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
                                    <h3 style={{ fontSize: '2rem', color: '#16A34A', margin: '0' }}>{sessionLogs.current.filter(l => l.isCorrect).length}/{sessionLogs.current.length}</h3>
                                    <span style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: 'bold' }}>CORRECT ANSWERS</span>
                                </div>
                            </div>

                            <h4 style={{ margin: '0 0 15px', color: '#0F172A', fontSize: '1.2rem' }}>Performance Review</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                                {sessionLogs.current.map((log, idx) => (
                                    <div key={idx} style={{ 
                                        padding: '12px 16px', 
                                        background: 'white', 
                                        borderRadius: '8px', 
                                        borderLeft: `4px solid ${log.isCorrect ? '#22C55E' : '#EF4444'}`,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <strong style={{ color: '#334155', fontSize: '1.1rem' }}>{log.question === "" ? 'Spelling Verification' : log.question}</strong>
                                            <span style={{ fontSize: '0.85rem', color: '#94A3B8', fontWeight: 'bold', background: '#F1F5F9', padding: '2px 8px', borderRadius: '10px' }}>
                                                {log.timeTaken}s / {log.timeLimit}s
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem' }}>
                                            <span style={{ color: log.isCorrect ? '#16A34A' : '#DC2626', fontWeight: '500' }}>
                                                You chose: {log.userAnswer}
                                            </span>
                                            {!log.isCorrect && (
                                                <span style={{ color: '#64748B' }}>
                                                    Correct: {log.correctAnswer}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button onClick={handleGameOverComplete} style={{ marginTop: '30px' }}>Keep Learning</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EndlessRunner;
