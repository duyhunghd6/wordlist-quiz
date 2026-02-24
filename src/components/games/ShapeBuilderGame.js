import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import anime from 'animejs';

const SUBJECTS = [
  { text: 'I', be: 'am' },
  { text: 'You', be: 'are' },
  { text: 'He', be: 'is' },
  { text: 'She', be: 'is' },
  { text: 'It', be: 'is' },
  { text: 'We', be: 'are' },
  { text: 'They', be: 'are' },
  { text: 'The dog', be: 'is' },
  { text: 'The cats', be: 'are' }
];

const VERBS = ['playing', 'eating', 'running', 'sleeping', 'reading', 'jumping', 'studying', 'swimming'];

const ShapeBuilderGame = ({ words, onAnswer, onComplete, onHome }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options] = useState(['am', 'is', 'are']);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    // Generate questions based on the number of words in the round
    const numQuestions = Math.min(words.length, 10) || 5;
    const generated = [];
    
    for (let i = 0; i < numQuestions; i++) {
      const subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
      const verb = VERBS[Math.floor(Math.random() * VERBS.length)];
      generated.push({
        subject: subject.text,
        verb: verb,
        correctBe: subject.be,
        // we map it to the actual word from the wordlist to count score appropriately
        targetWord: words[i]?.word || `q${i}`
      });
    }
    setQuestions(generated);
    setStartTime(Date.now());
  }, [words]);

  const handleSelect = (choice) => {
    if (selectedWord !== null) return; // Prevent multiple clicks

    const currentQ = questions[currentIndex];
    const correct = choice === currentQ.correctBe;
    const responseTime = Date.now() - startTime;
    
    setSelectedWord(choice);
    setIsCorrect(correct);

    // Provide haptic feedback if possible
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(correct ? [50, 50, 50] : [200]);
    }

    // Animate the bridge connecting
    if (correct) {
      anime({
        targets: '.missing-link-slot',
        scale: [1, 1.2, 1],
        backgroundColor: ['#e2e8f0', '#22c55e'],
        duration: 500,
        easing: 'easeOutElastic(1, .8)'
      });
    } else {
      anime({
        targets: '.missing-link-slot',
        translateX: [0, -10, 10, -10, 10, 0],
        backgroundColor: ['#e2e8f0', '#ef4444'],
        duration: 400,
        easing: 'easeInOutSine'
      });
    }

    // Send result to parent tracker
    if (onAnswer && currentQ.targetWord) {
      onAnswer(currentQ.targetWord, correct, responseTime);
    }

    setTimeout(() => {
      setSelectedWord(null);
      setIsCorrect(null);
      
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setStartTime(Date.now());
      } else {
        if (onComplete) onComplete();
      }
    }, correct ? 1200 : 2000);
  };

  if (questions.length === 0) return null;

  const currentQ = questions[currentIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '80vh', padding: 'var(--space-md)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <button onClick={onHome} className="btn-icon" style={{ background: 'white', borderRadius: '50%', padding: '10px', border: '2px solid var(--color-border-default)' }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ margin: 0, color: 'var(--color-text-primary)' }}>Shape Builder</h2>
        <div className="badge badge-info" style={{ fontSize: '1rem', padding: '4px 12px' }}>
          {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Instructions */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
        <h3 style={{ color: 'var(--color-primary)', fontSize: '1.5rem', fontWeight: 800 }}>Complete the sentence!</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>Tap the missing shape to fix the bridge.</p>
      </div>

      {/* Game Area (The Bridge) */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-2xl)'
      }}>
        {/* Subject (Red Oval) */}
        <div style={{
          background: '#fee2e2',
          border: '4px solid #ef4444',
          borderRadius: '50px',
          padding: '16px 32px',
          fontSize: '1.8rem',
          fontWeight: 800,
          color: '#991b1b',
          boxShadow: '0 4px 0 #ef4444'
        }}>
          {currentQ.subject}
        </div>

        {/* Missing Link Slot (Blue Hexagon placeholder) */}
        <div className="missing-link-slot" style={{
          width: '100px',
          height: '80px',
          border: '4px dashed #94a3b8',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: selectedWord ? (isCorrect ? '#dcfce7' : '#fee2e2') : '#f8fafc',
          borderColor: selectedWord ? (isCorrect ? '#22c55e' : '#ef4444') : '#94a3b8',
          transition: 'all 0.2s',
          clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
        }}>
          {selectedWord && (
            <span style={{ 
              fontSize: '1.8rem', 
              fontWeight: 800, 
              color: isCorrect ? '#166534' : '#991b1b' 
            }}>
              {selectedWord}
            </span>
          )}
        </div>

        {/* Verb+ing (Blue Arrow) */}
        <div style={{
          background: '#e0f2fe',
          border: '4px solid #0ea5e9',
          padding: '16px 32px',
          fontSize: '1.8rem',
          fontWeight: 800,
          color: '#075985',
          boxShadow: '0 4px 0 #0ea5e9',
          clipPath: 'polygon(0 0, 85% 0, 100% 50%, 85% 100%, 0 100%)',
          paddingRight: '48px'
        }}>
          {currentQ.verb}
        </div>
      </div>

      {/* Answer Options */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-lg)', paddingBottom: 'var(--space-2xl)' }}>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleSelect(opt)}
            disabled={selectedWord !== null}
            style={{
              background: '#dbeafe',
              border: '4px solid #3b82f6',
              clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
              width: '120px',
              height: '100px',
              fontSize: '1.8rem',
              fontWeight: 800,
              color: '#1e40af',
              cursor: selectedWord === null ? 'pointer' : 'default',
              boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: selectedWord === opt ? 'scale(0.9)' : 'scale(1)',
              opacity: selectedWord !== null && selectedWord !== opt ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            {opt}
          </button>
        ))}
      </div>
      
      {/* Feedback Overlay */}
      {selectedWord !== null && (
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

export default ShapeBuilderGame;
