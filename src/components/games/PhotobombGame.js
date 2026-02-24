import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Camera } from 'lucide-react';
import anime from 'animejs';

const QUESTIONS = [
  { 
    context: "I ______ when the phone ______.",
    background: "was sleeping",
    interruption: "rang",
    options: ["was sleeping", "slept", "was ringing", "rang"]
  },
  { 
    context: "We ______ TV when the power ______ out.",
    background: "were watching",
    interruption: "went",
    options: ["watched", "were watching", "was going", "went"]
  },
  { 
    context: "She ______ a book when her friend ______.",
    background: "was reading",
    interruption: "arrived",
    options: ["was reading", "read", "was arriving", "arrived"]
  },
  { 
    context: "They ______ football when it ______ to rain.",
    background: "were playing",
    interruption: "started",
    options: ["played", "were playing", "was starting", "started"]
  }
];

const PhotobombGame = ({ words, onAnswer, onComplete, onHome }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({ background: null, interruption: null });
  const [activeSlot, setActiveSlot] = useState('background'); // 'background' or 'interruption'
  const [isCorrect, setIsCorrect] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    // Generate questions
    const numQuestions = Math.min(words.length, 4) || 3;
    const shuffled = [...QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, numQuestions);
    setQuestions(shuffled.map((q, i) => ({
      ...q,
      targetWord: words[i]?.word || `q${i}`,
      // shuffle options
      options: [...q.options].sort(() => 0.5 - Math.random())
    })));
    setStartTime(Date.now());
  }, [words]);

  const handleSelectOption = (option) => {
    if (isCorrect !== null) return; // Prevent clicks while animating

    const newAnswers = { ...answers, [activeSlot]: option };
    setAnswers(newAnswers);

    // If both are filled, check correctness
    if (newAnswers.background !== null && newAnswers.interruption !== null) {
      checkAnswers(newAnswers);
    } else {
      // Auto-switch to the other empty slot
      setActiveSlot(activeSlot === 'background' ? 'interruption' : 'background');
    }
  };

  const handleSlotClick = (slot) => {
    if (isCorrect !== null) return;
    
    // If the slot already has an answer, clear it and make it active
    if (answers[slot] !== null) {
      setAnswers(prev => ({ ...prev, [slot]: null }));
    }
    setActiveSlot(slot);
  };

  const checkAnswers = (currentAnswers) => {
    const currentQ = questions[currentIndex];
    const correct = currentAnswers.background === currentQ.background && 
                    currentAnswers.interruption === currentQ.interruption;
    
    setIsCorrect(correct);
    const responseTime = Date.now() - startTime;

    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(correct ? [50, 50, 50] : [200]);
    }

    if (correct) {
      anime({
        targets: '.sentence-container',
        scale: [1, 1.05, 1],
        backgroundColor: ['#ffffff', '#dcfce7', '#ffffff'],
        duration: 600,
        easing: 'easeOutElastic(1, .8)'
      });
      // Camera flash effect for "photobomb"
      anime({
        targets: '.flash-overlay',
        opacity: [0, 1, 0],
        duration: 400,
        easing: 'easeOutExpo'
      });
    } else {
      anime({
        targets: '.sentence-container',
        translateX: [-10, 10, -10, 10, 0],
        backgroundColor: ['#ffffff', '#fee2e2', '#ffffff'],
        duration: 400,
        easing: 'easeInOutSine'
      });
    }

    if (onAnswer && currentQ.targetWord) {
      onAnswer(currentQ.targetWord, correct, responseTime);
    }

    setTimeout(() => {
      if (correct) {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setAnswers({ background: null, interruption: null });
          setActiveSlot('background');
          setIsCorrect(null);
          setStartTime(Date.now());
        } else {
          if (onComplete) onComplete();
        }
      } else {
        // Reset so they can try again
        setAnswers({ background: null, interruption: null });
        setActiveSlot('background');
        setIsCorrect(null);
      }
    }, correct ? 2000 : 1500);
  };

  if (questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  // Helper to render sentence with interactive blanks
  const renderSentence = () => {
    const parts = currentQ.context.split("______");
    return (
      <div className="sentence-container" style={{
        background: 'white',
        border: '3px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-xl)',
        fontSize: '1.4rem',
        fontWeight: 600,
        textAlign: 'center',
        boxShadow: '0 4px 0 var(--color-border-default)',
        marginBottom: 'var(--space-2xl)',
        lineHeight: 2.5
      }}>
        {parts[0]}
        
        {/* Background Action Slot */}
        <span 
          onClick={() => handleSlotClick('background')}
          style={{ 
            display: 'inline-block',
            minWidth: '120px',
            background: activeSlot === 'background' ? '#e0f2fe' : (answers.background ? '#bfdbfe' : '#f1f5f9'), 
            color: '#1e40af',
            padding: '4px 12px',
            borderRadius: '8px',
            border: `3px ${activeSlot === 'background' ? 'dashed' : 'solid'} ${activeSlot === 'background' ? '#0ea5e9' : '#3b82f6'}`,
            cursor: 'pointer',
            margin: '0 8px',
            transition: 'all 0.2s',
            boxShadow: activeSlot === 'background' ? '0 0 0 4px rgba(14, 165, 233, 0.2)' : 'none'
          }}>
          {answers.background || 'Ongoing Action'}
        </span>
        
        {parts[1]}
        
        {/* Interruption Slot */}
        <span 
          onClick={() => handleSlotClick('interruption')}
          style={{ 
            display: 'inline-block',
            minWidth: '120px',
            background: activeSlot === 'interruption' ? '#fee2e2' : (answers.interruption ? '#fecaca' : '#f1f5f9'), 
            color: '#991b1b',
            padding: '4px 12px',
            borderRadius: '8px',
            border: `3px ${activeSlot === 'interruption' ? 'dashed' : 'solid'} ${activeSlot === 'interruption' ? '#ef4444' : '#f87171'}`,
            cursor: 'pointer',
            margin: '0 8px',
            transition: 'all 0.2s',
            boxShadow: activeSlot === 'interruption' ? '0 0 0 4px rgba(239, 68, 68, 0.2)' : 'none'
          }}>
          {answers.interruption || 'Sudden Action'}
        </span>
        
        {parts[2]}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '80vh', padding: 'var(--space-md)' }}>
      {/* Flash overlay for Photobomb effect */}
      <div className="flash-overlay" style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'white', opacity: 0, zIndex: 999, pointerEvents: 'none'
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <button onClick={onHome} className="btn-icon" style={{ background: 'white', borderRadius: '50%', padding: '10px', border: '2px solid var(--color-border-default)' }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ margin: 0, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Camera size={24} color="#ec4899" /> The Photobomb
        </h2>
        <div className="badge badge-warning" style={{ fontSize: '1rem', padding: '4px 12px' }}>
          {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Instructions */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ color: 'var(--color-primary)', fontSize: '1.5rem', fontWeight: 800 }}>Fill in the actions!</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>Match the long background action and the sudden interruption.</p>
      </div>

      {renderSentence()}

      {/* Answer Options Word Bank */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        justifyContent: 'center', 
        gap: 'var(--space-md)', 
        paddingBottom: 'var(--space-2xl)' 
      }}>
        {currentQ.options.map((opt, idx) => {
          const isUsed = answers.background === opt || answers.interruption === opt;
          return (
            <button
              key={`${opt}-${idx}`}
              onClick={() => handleSelectOption(opt)}
              disabled={isUsed || isCorrect !== null}
              style={{
                background: isUsed ? '#e2e8f0' : '#ffffff',
                border: `3px solid ${isUsed ? '#cbd5e1' : '#64748b'}`,
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '1.2rem',
                fontWeight: 700,
                color: isUsed ? '#94a3b8' : '#334155',
                cursor: (isUsed || isCorrect !== null) ? 'default' : 'pointer',
                boxShadow: isUsed ? 'none' : '0 4px 0 #64748b',
                transform: isUsed ? 'translateY(4px)' : 'none',
                transition: 'all 0.1s'
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback Overlay */}
      {isCorrect !== null && (
        <div style={{
          position: 'fixed',
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          zIndex: 1000
        }}>
          {isCorrect ? (
            <div style={{ background: '#22c55e', color: 'white', padding: '20px', borderRadius: '50%', boxShadow: '0 10px 25px rgba(34,197,94,0.5)' }}>
              <Check size={64} strokeWidth={4} />
            </div>
          ) : (
            <div style={{ background: '#ef4444', color: 'white', padding: '20px', borderRadius: '50%', boxShadow: '0 10px 25px rgba(239,68,68,0.5)' }}>
              <X size={64} strokeWidth={4} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotobombGame;
