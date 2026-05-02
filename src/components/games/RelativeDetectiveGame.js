import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import './RelativeDetectiveGame.css';
import { RELATIVE_DETECTIVE_QUESTIONS } from './relativeDetectiveData';

const ALL_PRONOUNS = ['who', 'which', 'whose', 'that', 'where'];

const RelativeDetectiveGame = ({ onHome, onComplete }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(0);

  // Phases: 'spotting' (finding the noun) -> 'answering' (picking pronoun) -> 'finished'
  const [phase, setPhase] = useState('spotting');
  
  // State for step 1
  const [errorWord, setErrorWord] = useState(null);
  
  // State for step 2
  const [selectedPronoun, setSelectedPronoun] = useState(null);
  const [options, setOptions] = useState([]);
  
  const audioContextRef = useRef(null);

  useEffect(() => {
    // Initialize questions (shuffle them)
    const shuffled = [...RELATIVE_DETECTIVE_QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 10); // Let's limit to 10 for a standard session length
    setQuestions(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setPhase('spotting');
    setStartTime(Date.now());
    
    // Init audio context
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, []);

  useEffect(() => {
    if (phase === 'answering') {
      // Shuffle options when entering phase 2
      setOptions([...ALL_PRONOUNS].sort(() => Math.random() - 0.5));
    }
  }, [phase, currentIndex]);

  const playTone = (type) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  };

  const currentQ = questions[currentIndex];

  if (!currentQ) return null;

  const buildSentenceNodes = () => {
    const words = currentQ.sentence.split(' ');
    
    return words.map((rawWord, idx) => {
      const cleanWord = rawWord.replace(/[^a-zA-Z]/g, '').toLowerCase();
      const isTargetNoun = cleanWord === currentQ.targetNoun.toLowerCase();
      const isPronoun = cleanWord === currentQ.correctPronoun.toLowerCase();
      
      return {
        id: idx,
        raw: rawWord,
        clean: cleanWord,
        isTargetNoun,
        isPronoun
      };
    });
  };

  const handleWordClick = (node) => {
    if (phase !== 'spotting') return;
    
    if (node.isTargetNoun) {
      playTone('correct');
      setPhase('answering');
    } else if (!node.isPronoun) {
      // Wrong word clicked
      playTone('wrong');
      setErrorWord(node.id);
      setTimeout(() => setErrorWord(null), 400);
    }
  };

  const handleOptionClick = (option) => {
    if (phase !== 'answering' || selectedPronoun !== null) return;
    
    const isCorrect = option === currentQ.correctPronoun;
    
    if (isCorrect) {
      playTone('correct');
      setSelectedPronoun(option); // marks correct
      setScore(s => s + 1);
      
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(c => c + 1);
          setPhase('spotting');
          setSelectedPronoun(null);
        } else {
          setPhase('finished');
          if (onComplete) {
            onComplete({
              gameId: 'relativeDetective',
              totalQuestions: questions.length,
              correctAnswers: score + 1,
              averageResponseTime: Date.now() - startTime
            });
          }
        }
      }, 1500);
    } else {
      playTone('wrong');
      // Mark as error, let them try again
      setSelectedPronoun(`error-${option}`);
      setTimeout(() => setSelectedPronoun(null), 500);
    }
  };

  const nodes = buildSentenceNodes();

  if (phase === 'finished') {
    return (
      <div className="rdg-game">
        <div className="rdg-hud">
          <div className="rdg-hud-left">
            <button className="rdg-back-btn" onClick={onHome}><ArrowLeft size={16} /></button>
          </div>
        </div>
        <div className="rdg-stage">
          <h1 className="rdg-ws-title">🎉 Case Closed!</h1>
          <p className="rdg-ws-sub">You solved {score} out of {questions.length} mysteries.</p>
          <button className="rdg-option-btn correct" onClick={onHome}>Return to Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="rdg-game" id="ds-lay-relative-detective">
      <div className="rdg-hud">
        <div className="rdg-hud-left">
          <button className="rdg-back-btn" onClick={onHome}>
            <ArrowLeft size={20} />
          </button>
          <div className="rdg-score-pill">
            ⭐ {score} / {questions.length}
          </div>
        </div>
      </div>

      <div className="rdg-stage">
        <div className="rdg-clue-board">
          <h2 className="rdg-instruction">
            {phase === 'spotting' ? '🔍 Find the Clue Word (Noun)!' : 'Which relative pronoun?'}
          </h2>
          <div className="rdg-sentence">
            {nodes.map(node => {
              if (node.isPronoun) {
                // Render blank or answer
                if (phase === 'spotting') {
                  return <span key={node.id} className="rdg-blank">___</span>;
                } else {
                  return (
                    <span key={node.id} className={`rdg-blank ${selectedPronoun === currentQ.correctPronoun ? 'filled' : ''}`}>
                      {selectedPronoun === currentQ.correctPronoun ? currentQ.correctPronoun : '___'}
                    </span>
                  );
                }
              }

              // Render normal words
              let classes = "rdg-word";
              if (phase === 'spotting') classes += " clickable";
              if (phase === 'answering' && node.isTargetNoun) classes += " target spotted";
              if (errorWord === node.id) classes += " error";

              return (
                <span 
                  key={node.id} 
                  className={classes}
                  onClick={() => handleWordClick(node)}
                >
                  {node.raw}
                </span>
              );
            })}
          </div>
        </div>

        {phase === 'answering' && (
          <div className="rdg-selection-board">
            <div className="rdg-options-scroll">
              {options.map(opt => {
                let btnClass = "rdg-option-btn";
                if (selectedPronoun === currentQ.correctPronoun && opt === currentQ.correctPronoun) btnClass += " correct";
                if (selectedPronoun === `error-${opt}`) btnClass += " error";

                return (
                  <button 
                    key={opt} 
                    className={btnClass}
                    onClick={() => handleOptionClick(opt)}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RelativeDetectiveGame;
