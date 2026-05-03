import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Clock, History } from 'lucide-react';
import anime from 'animejs';

const TENSES = {
  SIMPLE_PRESENT: 'SIMPLE_PRESENT',
  PRESENT_CONTINUOUS: 'PRESENT_CONTINUOUS',
  SIMPLE_PAST: 'SIMPLE_PAST',
  PAST_CONTINUOUS: 'PAST_CONTINUOUS',
  PRESENT_PERFECT: 'PRESENT_PERFECT',
  PRESENT_PERFECT_CONTINUOUS: 'PRESENT_PERFECT_CONTINUOUS',
  PAST_PERFECT: 'PAST_PERFECT',
  PAST_PERFECT_CONTINUOUS: 'PAST_PERFECT_CONTINUOUS',
  SIMPLE_FUTURE: 'SIMPLE_FUTURE',
  FUTURE_CONTINUOUS: 'FUTURE_CONTINUOUS',
  FUTURE_PERFECT: 'FUTURE_PERFECT',
  FUTURE_PERFECT_CONTINUOUS: 'FUTURE_PERFECT_CONTINUOUS'
};

const TENSE_EXPLANATIONS = {
  [TENSES.SIMPLE_PRESENT]: "Use: routines, habits, general facts.",
  [TENSES.PRESENT_CONTINUOUS]: "Use: action in progress right now, OR planned future arrangements.",
  [TENSES.SIMPLE_PAST]: "Use: completed action at a specific time in the past.",
  [TENSES.PAST_CONTINUOUS]: "Use: action in progress in the past, or a background action.",
  [TENSES.PRESENT_PERFECT]: "Use: experiences, or actions with no exact time.",
  [TENSES.PRESENT_PERFECT_CONTINUOUS]: "Use: ongoing action that started in the past and is still happening.",
  [TENSES.PAST_PERFECT]: "Use: an action completed before another action in the past.",
  [TENSES.PAST_PERFECT_CONTINUOUS]: "Use: an action ongoing in the past up until another past event.",
  [TENSES.SIMPLE_FUTURE]: "Use: predictions or instant decisions (Will), or planned actions (Be Going To).",
  [TENSES.FUTURE_CONTINUOUS]: "Use: action that will be ongoing at a specific time in the future.",
  [TENSES.FUTURE_PERFECT]: "Use: action that will be finished before a specific time in the future.",
  [TENSES.FUTURE_PERFECT_CONTINUOUS]: "Use: ongoing action up to a specific time in the future."
};

const SIGNAL_WORDS = {
  [TENSES.SIMPLE_PRESENT]: ['always', 'usually', 'often', 'sometimes', 'every day'],
  [TENSES.PRESENT_CONTINUOUS]: ['now', 'at the moment', 'look', 'listen', 'tomorrow', 'tonight', 'next week'],
  [TENSES.SIMPLE_PAST]: ['yesterday', 'last', 'ago'],
  [TENSES.PAST_CONTINUOUS]: ['when', 'while'],
  [TENSES.PRESENT_PERFECT]: ['already', 'just', 'yet', 'ever', 'never', 'since', 'for'],
  [TENSES.PRESENT_PERFECT_CONTINUOUS]: ['for', 'since', 'all day'],
  [TENSES.PAST_PERFECT]: ['by the time', 'before', 'after', 'already'],
  [TENSES.PAST_PERFECT_CONTINUOUS]: ['for', 'since'],
  [TENSES.SIMPLE_FUTURE]: ['think', 'probably', 'tomorrow', 'next'],
  [TENSES.FUTURE_CONTINUOUS]: ['at this time tomorrow', 'this time next week'],
  [TENSES.FUTURE_PERFECT]: ['by', 'by the time', 'before'],
  [TENSES.FUTURE_PERFECT_CONTINUOUS]: ['for', 'by']
};

const QUESTIONS = [
  { text: "I eat an apple every day.", type: TENSES.SIMPLE_PRESENT, highlighted: "eat" },
  { text: "I am eating an apple now.", type: TENSES.PRESENT_CONTINUOUS, highlighted: "am eating" },
  { text: "I ate an apple yesterday.", type: TENSES.SIMPLE_PAST, highlighted: "ate" },
  { text: "I was eating an apple when you called.", type: TENSES.PAST_CONTINUOUS, highlighted: "was eating" },
  { text: "We have lived here for 5 years.", type: TENSES.PRESENT_PERFECT, highlighted: "have lived" },
  { text: "I have been eating this for an hour.", type: TENSES.PRESENT_PERFECT_CONTINUOUS, highlighted: "have been eating" },
  { text: "They had left before it rained.", type: TENSES.PAST_PERFECT, highlighted: "had left" },
  { text: "She had been sleeping before the alarm rang.", type: TENSES.PAST_PERFECT_CONTINUOUS, highlighted: "had been sleeping" },
  { text: "I will go to the store tomorrow.", type: TENSES.SIMPLE_FUTURE, highlighted: "will go" },
  { text: "I will be working at 5 PM.", type: TENSES.FUTURE_CONTINUOUS, highlighted: "will be working" },
  { text: "I will have finished by tomorrow.", type: TENSES.FUTURE_PERFECT, highlighted: "will have finished" },
  { text: "I will have been working for 2 hours.", type: TENSES.FUTURE_PERFECT_CONTINUOUS, highlighted: "will have been working" }
];



const TimelineDetectiveGame = ({ words, numQuestions = 10, isAllQuestions = false, tenseSentences, onAnswer, onComplete, onHome }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedZone, setSelectedZone] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongWords, setWrongWords] = useState([]);

  useEffect(() => {
    let availableQuestions = [...QUESTIONS];

    if (tenseSentences && tenseSentences.length > 0) {
      const allowedTenses = {
        'Present Simple': TENSES.SIMPLE_PRESENT,
        'Present Continuous': TENSES.PRESENT_CONTINUOUS,
        'Past Simple': TENSES.SIMPLE_PAST,
        'Past Continuous': TENSES.PAST_CONTINUOUS,
        'Present Perfect': TENSES.PRESENT_PERFECT,
        'Present Perfect Continuous': TENSES.PRESENT_PERFECT_CONTINUOUS,
        'Past Perfect': TENSES.PAST_PERFECT,
        'Past Perfect Continuous': TENSES.PAST_PERFECT_CONTINUOUS,
        'Future Simple': TENSES.SIMPLE_FUTURE,
        'Future Continuous': TENSES.FUTURE_CONTINUOUS,
        'Future Perfect': TENSES.FUTURE_PERFECT,
        'Future Perfect Continuous': TENSES.FUTURE_PERFECT_CONTINUOUS
      };
      
      const filtered = tenseSentences.filter(ts => allowedTenses[ts.tense]);
      
      if (filtered.length > 0) {
        availableQuestions = filtered.map(ts => {
          let highlighted = '';
          if (ts.verb_choices && ts.verb_choices.trim()) {
            highlighted = ts.verb_choices.split('|')[0].trim();
          } else if (ts.correct_sentence && ts.wrong_sentence) {
            const correctWords = ts.correct_sentence.split(' ');
            const wrongWords = ts.wrong_sentence.split(' ');
            const diffs = [];
            for (let i = 0; i < Math.max(correctWords.length, wrongWords.length); i++) {
              if (correctWords[i] !== wrongWords[i] && correctWords[i]) {
                diffs.push(correctWords[i].replace(/[.,!?]$/, ''));
              }
            }
            if (diffs.length > 0) {
              const diffStr = diffs.join(' ');
              if (ts.correct_sentence.includes(diffStr)) {
                highlighted = diffStr;
              } else if (diffs.length === 1 && ts.correct_sentence.includes(diffs[0])) {
                highlighted = diffs[0];
              }
            }
          }

          if (highlighted && !ts.correct_sentence.includes(highlighted)) {
            highlighted = '';
          }

          return {
            text: ts.correct_sentence,
            type: allowedTenses[ts.tense],
            highlighted: highlighted,
            translation: ts.vietnamese_translation
          };
        });
      }
    }

    const count = isAllQuestions ? availableQuestions.length : Math.min(numQuestions || words?.length || 10, availableQuestions.length);
    const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random()).slice(0, count);
    setQuestions(shuffled.map((q, i) => ({
      ...q,
      targetWord: words && words[i] ? words[i].word : `q${i}`
    })));
    setStartTime(Date.now());
  }, [words, numQuestions, isAllQuestions, tenseSentences]);

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
    }, correct ? 3500 : 9000);
  };

  if (questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  // Helper to render sentence with highlight
  const renderSentence = () => {
    const containerStyle = {
      background: 'white',
      border: '3px solid var(--color-border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-lg)',
      fontSize: '1.5rem',
      fontWeight: 600,
      textAlign: 'center',
      boxShadow: '0 4px 0 var(--color-border-default)',
      marginBottom: 'var(--space-2xl)'
    };

    let text = currentQ.text;
    const tenseClues = SIGNAL_WORDS[currentQ.type] || [];
    let activeClue = null;
    
    // Find the first matching clue in the sentence text
    for (const clue of tenseClues) {
      const regex = new RegExp(`\\b${clue}\\b`, 'i');
      if (regex.test(text)) {
        activeClue = text.match(regex)[0];
        break;
      }
    }

    if (!currentQ.highlighted && !activeClue) {
      return (
        <div style={containerStyle}>
          {text}
        </div>
      );
    }

    // Split text by both highlighted and activeClue to render them distinctly
    const splitRegex = new RegExp(`(${currentQ.highlighted ? currentQ.highlighted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '____NOTHING____'}|${activeClue ? activeClue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') : '____NOTHING____'})`, 'gi');
    const parts = text.split(splitRegex);

    return (
      <div style={containerStyle}>
        {parts.map((part, i) => {
          if (!part) return null;
          
          const isHighlighted = currentQ.highlighted && part.toLowerCase() === currentQ.highlighted.toLowerCase();
          const isClue = activeClue && part.toLowerCase() === activeClue.toLowerCase();

          if (isHighlighted && isClue) {
            // Rare edge case where the verb is also the clue
            return (
              <span key={i} style={{ 
                background: '#fef08a', color: '#854d0e', padding: '4px 8px', borderRadius: '8px', border: '2px dashed #9333ea', margin: '0 4px'
              }}>
                🔍 {part}
              </span>
            );
          } else if (isHighlighted) {
            return (
              <span key={i} style={{ 
                background: '#fef08a', color: '#854d0e', padding: '4px 8px', borderRadius: '8px', border: '2px solid #eab308', margin: '0 4px'
              }}>
                {part}
              </span>
            );
          } else if (isClue) {
            return (
              <span key={i} style={{ 
                color: '#9333ea', borderBottom: '3px dashed #d8b4fe', fontWeight: 800, margin: '0 4px', display: 'inline-block'
              }}>
                🔍 {part}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
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

      {/* Instructions & Legend */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ color: 'var(--color-primary)', fontSize: '1.5rem', fontWeight: 800 }}>When did it happen?</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', marginBottom: '16px' }}>Read the sentence and tap the correct place on the timeline.</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid #64748B' }}></div>
            <span>Specific Time</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 100 100"><polygon points="50,5 5,95 95,95" fill="none" stroke="#64748B" strokeWidth="8" strokeDasharray="10,10" /></svg>
            <span>Happening (ing)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '24px', height: '12px', borderRadius: '3px', border: '2px solid #64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#64748b' }}>➔</div>
            <span>Connecting Times</span>
          </div>
        </div>
      </div>

      {renderSentence()}

      {/* Timeline Graphic UI */}
      <div style={{ 
        flex: 1, 
        marginTop: 'var(--space-2xl)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        overflow: 'hidden'
      }}>
        <div className="timeline-scroll-container" style={{
          width: '100%', 
          overflowX: 'auto', 
          paddingBottom: '40px',
          paddingTop: '40px',
          WebkitOverflowScrolling: 'touch'
        }}>
          <div style={{ 
            display: 'flex', 
            minWidth: '800px', 
            justifyContent: 'space-between', 
            position: 'relative', 
            zIndex: 10,
            padding: '0 40px'
          }}>
            
            {/* The Base Line */}
            <div style={{ 
              position: 'absolute', 
              top: '40px', 
              left: '40px', 
              right: '40px', 
              height: '8px', 
              background: '#cbd5e1', 
              borderRadius: '4px',
              zIndex: 0
            }} />

            {/* Helper to render a basic point node */}
            {[
              { id: TENSES.PAST_PERFECT, label: 'Past of Past', sub: '(Before)', color: '#8b5cf6' },
              { id: TENSES.SIMPLE_PAST, label: 'Past', sub: '(Yesterday)', color: '#3b82f6' },
              { id: TENSES.SIMPLE_PRESENT, label: 'Now', sub: '(Today)', color: '#eab308' },
              { id: TENSES.SIMPLE_FUTURE, label: 'Future', sub: '(Tomorrow)', color: '#f97316' }
            ].map((node, idx) => (
              <div key={node.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px', position: 'relative', zIndex: 10 }}>
                <button 
                  id={`node-${node.id}`}
                  onClick={() => handleSelect(node.id)}
                  disabled={selectedZone !== null}
                  style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: selectedZone === node.id ? (isCorrect ? '#22c55e' : '#ef4444') : 'white',
                    border: `6px solid ${selectedZone === node.id ? 'white' : node.color}`,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: selectedZone === null ? 'pointer' : 'default',
                    transform: selectedZone === node.id ? 'scale(1.1)' : 'scale(1)',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  {idx === 2 ? <Clock size={32} color={selectedZone === node.id ? 'white' : node.color} /> : <History size={32} color={selectedZone === node.id ? 'white' : node.color} />}
                </button>
                <span style={{ marginTop: '12px', fontWeight: 800, color: '#6b7280', textAlign: 'center', whiteSpace: 'nowrap' }}>{node.label}<br/><small>{node.sub}</small></span>
                
                {/* Continuous Triangles (overlaying the nodes) */}
                {idx === 1 && (
                  <button 
                    id={`node-${TENSES.PAST_CONTINUOUS}`}
                    onClick={() => handleSelect(TENSES.PAST_CONTINUOUS)}
                    disabled={selectedZone !== null}
                    style={{
                      position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)',
                      width: '45px', height: '45px', background: 'transparent', border: 'none', cursor: 'pointer', zIndex: 20,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                    }}
                  >
                    <svg viewBox="0 0 100 100" style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, overflow: 'visible' }}>
                      <polygon points="50,5 5,95 95,95" fill={selectedZone === TENSES.PAST_CONTINUOUS ? (isCorrect ? '#22c55e' : '#ef4444') : 'white'} stroke={selectedZone === TENSES.PAST_CONTINUOUS ? 'white' : '#3b82f6'} strokeWidth="6" strokeDasharray="8,8" style={{ filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.15))' }} />
                    </svg>
                    <span style={{ position: 'relative', top: '5px', color: selectedZone === TENSES.PAST_CONTINUOUS ? 'white' : '#3b82f6', fontSize: '0.75rem', fontWeight: 800, zIndex: 2 }}>ing</span>
                  </button>
                )}
                {idx === 2 && (
                  <button 
                    id={`node-${TENSES.PRESENT_CONTINUOUS}`}
                    onClick={() => handleSelect(TENSES.PRESENT_CONTINUOUS)}
                    disabled={selectedZone !== null}
                    style={{
                      position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)',
                      width: '45px', height: '45px', background: 'transparent', border: 'none', cursor: 'pointer', zIndex: 20,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                    }}
                  >
                    <svg viewBox="0 0 100 100" style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, overflow: 'visible' }}>
                      <polygon points="50,5 5,95 95,95" fill={selectedZone === TENSES.PRESENT_CONTINUOUS ? (isCorrect ? '#22c55e' : '#ef4444') : 'white'} stroke={selectedZone === TENSES.PRESENT_CONTINUOUS ? 'white' : '#eab308'} strokeWidth="6" strokeDasharray="8,8" style={{ filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.15))' }} />
                    </svg>
                    <span style={{ position: 'relative', top: '5px', color: selectedZone === TENSES.PRESENT_CONTINUOUS ? 'white' : '#eab308', fontSize: '0.75rem', fontWeight: 800, zIndex: 2 }}>ing</span>
                  </button>
                )}
                {idx === 3 && (
                  <button 
                    id={`node-${TENSES.FUTURE_CONTINUOUS}`}
                    onClick={() => handleSelect(TENSES.FUTURE_CONTINUOUS)}
                    disabled={selectedZone !== null}
                    style={{
                      position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)',
                      width: '45px', height: '45px', background: 'transparent', border: 'none', cursor: 'pointer', zIndex: 20,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                    }}
                  >
                    <svg viewBox="0 0 100 100" style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, overflow: 'visible' }}>
                      <polygon points="50,5 5,95 95,95" fill={selectedZone === TENSES.FUTURE_CONTINUOUS ? (isCorrect ? '#22c55e' : '#ef4444') : 'white'} stroke={selectedZone === TENSES.FUTURE_CONTINUOUS ? 'white' : '#f97316'} strokeWidth="6" strokeDasharray="8,8" style={{ filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.15))' }} />
                    </svg>
                    <span style={{ position: 'relative', top: '5px', color: selectedZone === TENSES.FUTURE_CONTINUOUS ? 'white' : '#f97316', fontSize: '0.75rem', fontWeight: 800, zIndex: 2 }}>ing</span>
                  </button>
                )}
              </div>
            ))}

            {/* Perfect Spans (Rectangles between nodes) */}
            {/* Past Perfect Continuous (Past of Past -> Past) */}
            <button
              id={`node-${TENSES.PAST_PERFECT_CONTINUOUS}`}
              onClick={() => handleSelect(TENSES.PAST_PERFECT_CONTINUOUS)}
              disabled={selectedZone !== null}
              style={{
                position: 'absolute', top: '20px', left: '16.5%', transform: 'translateX(-50%)',
                width: '110px', height: '36px', borderRadius: '8px',
                background: selectedZone === TENSES.PAST_PERFECT_CONTINUOUS ? (isCorrect ? '#22c55e' : '#ef4444') : '#ede9fe',
                border: `2px dashed ${selectedZone === TENSES.PAST_PERFECT_CONTINUOUS ? 'white' : '#8b5cf6'}`,
                color: selectedZone === TENSES.PAST_PERFECT_CONTINUOUS ? 'white' : '#6d28d9',
                fontWeight: 800, fontSize: '0.75rem', cursor: selectedZone === null ? 'pointer' : 'default', zIndex: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              Past ➔ Past (ing)
            </button>

            {/* Present Perfect (Past -> Now) */}
            <button
              id={`node-${TENSES.PRESENT_PERFECT}`}
              onClick={() => handleSelect(TENSES.PRESENT_PERFECT)}
              disabled={selectedZone !== null}
              style={{
                position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)',
                width: '120px', height: '36px', borderRadius: '8px',
                background: selectedZone === TENSES.PRESENT_PERFECT ? (isCorrect ? '#22c55e' : '#ef4444') : '#dcfce7',
                border: `3px solid ${selectedZone === TENSES.PRESENT_PERFECT ? 'white' : '#10b981'}`,
                color: selectedZone === TENSES.PRESENT_PERFECT ? 'white' : '#047857',
                fontWeight: 800, fontSize: '0.85rem', cursor: selectedZone === null ? 'pointer' : 'default',
                boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)', zIndex: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center'
              }}
            >
              Past ➔ Now
            </button>

            {/* Present Perfect Continuous (Past -> Now + ing) */}
            <button
              id={`node-${TENSES.PRESENT_PERFECT_CONTINUOUS}`}
              onClick={() => handleSelect(TENSES.PRESENT_PERFECT_CONTINUOUS)}
              disabled={selectedZone !== null}
              style={{
                position: 'absolute', top: '55px', left: '50%', transform: 'translateX(-50%)',
                width: '130px', height: '36px', borderRadius: '8px',
                background: selectedZone === TENSES.PRESENT_PERFECT_CONTINUOUS ? (isCorrect ? '#22c55e' : '#ef4444') : '#fef9c3',
                border: `2px dashed ${selectedZone === TENSES.PRESENT_PERFECT_CONTINUOUS ? 'white' : '#eab308'}`,
                color: selectedZone === TENSES.PRESENT_PERFECT_CONTINUOUS ? 'white' : '#a16207',
                fontWeight: 800, fontSize: '0.75rem', cursor: selectedZone === null ? 'pointer' : 'default', zIndex: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              Past ➔ Now (ing)
            </button>

            {/* Future Perfect (Now -> Future) */}
            <button
              id={`node-${TENSES.FUTURE_PERFECT}`}
              onClick={() => handleSelect(TENSES.FUTURE_PERFECT)}
              disabled={selectedZone !== null}
              style={{
                position: 'absolute', top: '-15px', left: '83.3%', transform: 'translateX(-50%)',
                width: '120px', height: '36px', borderRadius: '8px',
                background: selectedZone === TENSES.FUTURE_PERFECT ? (isCorrect ? '#22c55e' : '#ef4444') : '#ffedd5',
                border: `3px solid ${selectedZone === TENSES.FUTURE_PERFECT ? 'white' : '#f97316'}`,
                color: selectedZone === TENSES.FUTURE_PERFECT ? 'white' : '#c2410c',
                fontWeight: 800, fontSize: '0.85rem', cursor: selectedZone === null ? 'pointer' : 'default', zIndex: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                boxShadow: '0 4px 6px rgba(249, 115, 22, 0.3)'
              }}
            >
              Now ➔ Fut
            </button>

            {/* Future Perfect Continuous (Now -> Future + ing) */}
            <button
              id={`node-${TENSES.FUTURE_PERFECT_CONTINUOUS}`}
              onClick={() => handleSelect(TENSES.FUTURE_PERFECT_CONTINUOUS)}
              disabled={selectedZone !== null}
              style={{
                position: 'absolute', top: '55px', left: '83.3%', transform: 'translateX(-50%)',
                width: '130px', height: '36px', borderRadius: '8px',
                background: selectedZone === TENSES.FUTURE_PERFECT_CONTINUOUS ? (isCorrect ? '#22c55e' : '#ef4444') : '#ffedd5',
                border: `2px dashed ${selectedZone === TENSES.FUTURE_PERFECT_CONTINUOUS ? 'white' : '#f97316'}`,
                color: selectedZone === TENSES.FUTURE_PERFECT_CONTINUOUS ? 'white' : '#c2410c',
                fontWeight: 800, fontSize: '0.75rem', cursor: selectedZone === null ? 'pointer' : 'default', zIndex: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              Now ➔ Fut (ing)
            </button>

          </div>
        </div>
      </div>

      {/* Feedback Overlay Wrapper */}
      {selectedZone !== null && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          pointerEvents: 'none' // Don't block clicks elsewhere
        }}>
          {/* Animated Modal Box */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '90%',
            maxWidth: '600px',
            animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
            pointerEvents: 'auto'
          }}>
          {isCorrect ? (
            <div style={{ background: '#22c55e', color: 'white', padding: '20px', borderRadius: '50%', boxShadow: '0 10px 25px rgba(34,197,94,0.5)', marginBottom: '16px' }}>
              <Check size={64} strokeWidth={4} />
            </div>
          ) : (
            <div style={{ background: '#ef4444', color: 'white', padding: '20px', borderRadius: '50%', boxShadow: '0 10px 25px rgba(239,68,68,0.5)', marginBottom: '16px' }}>
              <X size={64} strokeWidth={4} />
            </div>
          )}
          
          {(TENSE_EXPLANATIONS[currentQ.type] || currentQ.translation) && (
            <div style={{
              background: 'white',
              padding: '16px',
              borderRadius: '16px',
              border: `4px solid ${isCorrect ? '#22c55e' : '#ef4444'}`,
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              width: '100%',
              textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: isCorrect ? '#166534' : '#991b1b', fontSize: '1.2rem' }}>
                {isCorrect ? 'Correct!' : 'Not quite!'}
              </h4>
              
              {/* Shape Hint Feedback */}
              <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.95rem', fontWeight: 600, color: '#334155' }}>
                {currentQ.type.includes('CONTINUOUS') && !currentQ.type.includes('PERFECT') && "▲ Triangle: This action was happening right at that time."}
                {currentQ.type.includes('PERFECT') && "▭ Rectangle: This action connects two different times together."}
                {!currentQ.type.includes('CONTINUOUS') && !currentQ.type.includes('PERFECT') && "● Circle: This happened at one specific point in time."}
              </div>

              {TENSE_EXPLANATIONS[currentQ.type] && (
                <p style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '1rem', lineHeight: '1.4' }}>
                  {TENSE_EXPLANATIONS[currentQ.type]}
                </p>
              )}
              
              {SIGNAL_WORDS[currentQ.type] && SIGNAL_WORDS[currentQ.type].length > 0 && (
                <div style={{ margin: '8px 0', fontSize: '0.95rem', color: '#6366f1', fontWeight: 600, background: '#e0e7ff', padding: '6px 12px', borderRadius: '8px', display: 'inline-block' }}>
                  🔍 Detective Clues: {SIGNAL_WORDS[currentQ.type].join(', ')}
                </div>
              )}

              {currentQ.translation && (
                <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '0.95rem', fontStyle: 'italic' }}>
                  "{currentQ.translation}"
                </p>
              )}
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineDetectiveGame;
