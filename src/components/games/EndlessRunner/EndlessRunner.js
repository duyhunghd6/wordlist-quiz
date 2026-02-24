import React, { useState, useEffect } from 'react';
import './EndlessRunner.css';
import { useRunnerEngine } from './RunnerQuestionEngine';

const EndlessRunner = ({ onComplete, words = [], tenseSentences = [] }) => {
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(180); // 3-minute timer (180 seconds)
    const [gameActive, setGameActive] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [feedback, setFeedback] = useState(null); // 'correct' or 'wrong'
    const [actionText, setActionText] = useState(null);

    // Initialize the Pedagogical Engine
    const { 
        currentQuestion, 
        level,
        maxLevel, 
        streak, 
        processAnswer, 
        generateNext 
    } = useRunnerEngine(words, tenseSentences);

    // Timer Logic
    useEffect(() => {
        if (!gameActive) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setGameActive(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameActive]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const handleOptionClick = (option) => {
        if (!gameActive || selectedId !== null || !currentQuestion) return;
        
        setSelectedId(option.id);
        const isCorrect = option.isCorrect;
        
        // Notify the engine to adjust difficulty internally
        processAnswer(isCorrect);

        if (isCorrect) {
            setFeedback('correct');
            setScore(prev => prev + 10);
            
            // Show Level Up animation if they hit a multiple of 5
            if ((streak + 1) % 5 === 0 && level < 6) {
                setActionText("LEVEL UP!");
            } else {
                setActionText("+10");
            }
            
            setTimeout(() => {
                setSelectedId(null);
                setFeedback(null);
                setActionText(null);
                generateNext();
            }, 800);
            
        } else {
            setFeedback('wrong');
            setActionText("Miss!");
            
            setTimeout(() => {
                setSelectedId(null);
                setFeedback(null);
                setActionText(null);
                generateNext(); 
            }, 800);
        }
    };

    const handleGameOverComplete = () => {
        if (onComplete) {
            onComplete(score);
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
                {/* Replaced Health with Timer */}
                <div className="er-timer" style={{ color: timeLeft <= 30 ? '#EF4444' : '#F8FAFC', fontWeight: 'bold', fontSize: '18px' }}>
                    🕒 {formatTime(timeLeft)}
                </div>
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

            <div className="er-character-area">
                <div className="er-character" style={{ animationPlayState: gameActive && selectedId===null ? 'running' : 'paused' }}>
                    {gameActive && selectedId === null && <div className="er-dust"></div>}
                </div>
            </div>
            
            {!gameActive && timeLeft <= 0 && (
                <div className="er-feedback-overlay">
                    <div className="er-game-over">
                        <h2>Time's Up!</h2>
                        <p>Total Score: {score}</p>
                        <p style={{ color: '#FCD34D', fontWeight: 'bold', marginTop: '10px' }}>Max Level Reached: {maxLevel}</p>
                        <button onClick={handleGameOverComplete} style={{ marginTop: '20px' }}>Keep Learning</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EndlessRunner;
