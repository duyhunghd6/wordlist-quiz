import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Clock, History } from 'lucide-react';
import anime from 'animejs';

const TENSES = {
  SIMPLE_PAST: 'SIMPLE_PAST',
  PRESENT_PERFECT: 'PRESENT_PERFECT',
  PAST_PERFECT: 'PAST_PERFECT'
};

const QUESTIONS = [
  { text: "I ate an apple yesterday.", type: TENSES.SIMPLE_PAST, highlighted: "ate" },
  { text: "She went to the store.", type: TENSES.SIMPLE_PAST, highlighted: "went" },
  { text: "We have lived here for 5 years.", type: TENSES.PRESENT_PERFECT, highlighted: "have lived" },
  { text: "I have just finished my homework.", type: TENSES.PRESENT_PERFECT, highlighted: "have finished" },
  { text: "They had left before it rained.", type: TENSES.PAST_PERFECT, highlighted: "had left" },
  { text: "He had already eaten when I arrived.", type: TENSES.PAST_PERFECT, highlighted: "had eaten" }
];



const TimelineDetectiveGame = ({ words, isAllQuestions = false, onAnswer, onComplete, onHome }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedZone, setSelectedZone] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongWords, setWrongWords] = useState([]);

  useEffect(() => {
    const numQuestions = isAllQuestions ? QUESTIONS.length : Math.min(words.length || 4, QUESTIONS.length);
    const shuffled = [...QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, numQuestions);
    setQuestions(shuffled.map((q, i) => ({
      ...q,
      targetWord: words[i]?.word || `q${i}`
    })));
    setStartTime(Date.now());
  }, [words, isAllQuestions]);

  const handleSelect = (zoneId) => {
    if (selectedZone !== null) return;

    const currentQ = questions[currentIndex];
    const correct = zoneId === currentQ.type;
    const responseTime = Date.now() - startTime;

    setSelectedZone(zoneId);
    setIsCorrect(correct);

    if (correct) {
      setCorrectCount(prev => prev + 1);
    } else {
      setWrongWords(prev => [...prev, { word: currentQ.targetWord }]);
    }

    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(correct ? [50, 50, 50] : [200]);
    }

    if (correct) {
      anime({
        targets: `#node-${zoneId}`,
        scale: [1, 1.2, 1],
        duration: 600,
        easing: 'easeOutElastic(1, .8)'
      });
    } else {
      anime({
        targets: `#node-${zoneId}`,
        translateX: [-10, 10, -10, 10, 0],
        duration: 400,
        easing: 'easeInOutSine'
      });
    }

    if (onAnswer && currentQ.targetWord) {
      onAnswer(currentQ.targetWord, correct, responseTime);
    }

    setTimeout(() => {
      setSelectedZone(null);
      setIsCorrect(null);
      
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setStartTime(Date.now());
      } else {
        const finalCorrect = correctCount + (correct ? 1 : 0);
        const finalWrong = correct ? wrongWords : [...wrongWords, { word: currentQ.targetWord }];
        if (onComplete) onComplete({
          gameId: 'timelineDetective',
          totalQuestions: questions.length,
          correctAnswers: finalCorrect,
          wrongAnswers: finalWrong,
          averageResponseTime: responseTime
        });
      }
    }, correct ? 1500 : 2500);
  };

  if (questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  // Helper to render sentence with highlight
  const renderSentence = () => {
    const parts = currentQ.text.split(currentQ.highlighted);
    return (
      <div style={{
        background: 'white',
        border: '3px solid var(--color-border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)',
        fontSize: '1.5rem',
        fontWeight: 600,
        textAlign: 'center',
        boxShadow: '0 4px 0 var(--color-border-default)',
        marginBottom: 'var(--space-2xl)'
      }}>
        {parts[0]}
        <span style={{ 
          background: '#fef08a', 
          color: '#854d0e',
          padding: '4px 8px',
          borderRadius: '8px',
          border: '2px solid #eab308'
        }}>
          {currentQ.highlighted}
        </span>
        {parts[1]}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '80vh', padding: 'var(--space-md)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <button onClick={onHome} className="btn-icon" style={{ background: 'white', borderRadius: '50%', padding: '10px', border: '2px solid var(--color-border-default)' }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ margin: 0, color: 'var(--color-text-primary)' }}>Timeline Detective</h2>
        <div className="badge badge-warning" style={{ fontSize: '1rem', padding: '4px 12px' }}>
          {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Instructions */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ color: 'var(--color-primary)', fontSize: '1.5rem', fontWeight: 800 }}>When did it happen?</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>Read the sentence and tap the correct place on the timeline.</p>
      </div>

      {renderSentence()}

      {/* Timeline Graphic UI */}
      <div style={{ 
        flex: 1, 
        position: 'relative', 
        marginTop: 'var(--space-2xl)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* The Base Line */}
        <div style={{ 
          position: 'absolute', 
          top: '40px', 
          left: '10%', 
          right: '10%', 
          height: '8px', 
          background: '#cbd5e1', 
          borderRadius: '4px',
          zIndex: 0
        }} />

        {/* Nodes and Interactions */}
        <div style={{ 
          display: 'flex', 
          width: '90%', 
          justifyContent: 'space-between', 
          position: 'relative', 
          zIndex: 10 
        }}>
          
          {/* Node 1: Past Perfect */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '33%' }}>
            <button 
              id={`node-${TENSES.PAST_PERFECT}`}
              onClick={() => handleSelect(TENSES.PAST_PERFECT)}
              disabled={selectedZone !== null}
              style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: selectedZone === TENSES.PAST_PERFECT ? (isCorrect ? '#22c55e' : '#ef4444') : 'white',
                border: `6px solid ${selectedZone === TENSES.PAST_PERFECT ? 'white' : '#8b5cf6'}`,
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: selectedZone === null ? 'pointer' : 'default',
                transform: selectedZone === TENSES.PAST_PERFECT ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.2s'
              }}
            >
              <History size={32} color={selectedZone === TENSES.PAST_PERFECT ? 'white' : '#8b5cf6'} />
            </button>
            <span style={{ marginTop: '12px', fontWeight: 800, color: '#6b7280', textAlign: 'center' }}>Past of Past<br/><small>(Before)</small></span>
          </div>

          {/* Node 2: Simple Past */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '33%' }}>
            <button 
              id={`node-${TENSES.SIMPLE_PAST}`}
              onClick={() => handleSelect(TENSES.SIMPLE_PAST)}
              disabled={selectedZone !== null}
              style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: selectedZone === TENSES.SIMPLE_PAST ? (isCorrect ? '#22c55e' : '#ef4444') : 'white',
                border: `6px solid ${selectedZone === TENSES.SIMPLE_PAST ? 'white' : '#3b82f6'}`,
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: selectedZone === null ? 'pointer' : 'default',
                transform: selectedZone === TENSES.SIMPLE_PAST ? 'scale(1.1)' : 'scale(1)',
                transition: 'all 0.2s'
              }}
            >
              <History size={32} color={selectedZone === TENSES.SIMPLE_PAST ? 'white' : '#3b82f6'} />
            </button>
            <span style={{ marginTop: '12px', fontWeight: 800, color: '#6b7280', textAlign: 'center' }}>Past Time<br/><small>(Yesterday)</small></span>
          </div>

          {/* Node 3: Now / Present Perfect Span */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '33%' }}>
            {/* The Now Node is just a marker, not clickable */}
            <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: '#cbd5e1', border: '4px solid white',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: '20px'
            }}>
              <Clock size={20} color="white" />
            </div>
            <span style={{ marginTop: '32px', fontWeight: 800, color: '#94a3b8' }}>NOW</span>
            
            {/* Present Perfect Span clickable button */}
            <button
              id={`node-${TENSES.PRESENT_PERFECT}`}
              onClick={() => handleSelect(TENSES.PRESENT_PERFECT)}
              disabled={selectedZone !== null}
              style={{
                position: 'absolute',
                top: '-30px',
                left: '40%',
                width: '120px',
                padding: '8px 16px',
                borderRadius: '20px',
                background: selectedZone === TENSES.PRESENT_PERFECT ? (isCorrect ? '#22c55e' : '#ef4444') : '#dcfce7',
                border: `3px solid ${selectedZone === TENSES.PRESENT_PERFECT ? 'white' : '#10b981'}`,
                color: selectedZone === TENSES.PRESENT_PERFECT ? 'white' : '#047857',
                fontWeight: 800,
                cursor: selectedZone === null ? 'pointer' : 'default',
                boxShadow: '0 4px 0 rgba(16, 185, 129, 0.3)',
                transform: selectedZone === TENSES.PRESENT_PERFECT ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s',
                zIndex: 20
              }}
            >
              Past ➔ Now
            </button>
          </div>

        </div>
      </div>

      {/* Feedback Overlay */}
      {selectedZone !== null && (
        <div style={{
          position: 'fixed',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          zIndex: 100
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

export default TimelineDetectiveGame;
