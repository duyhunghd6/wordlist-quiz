import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, X, Magnet } from 'lucide-react';
import anime from 'animejs';

const InspectorTailGame = ({ tagQuestions = [], onComplete, onHome }) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [step, setStep] = useState(1); // 1: Polarity, 2: Tag
  const [selectedPolarity, setSelectedPolarity] = useState(null);
  const [feedbackState, setFeedbackState] = useState('none'); // 'none', 'success', 'error'
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [wrongAnswers, setWrongAnswers] = useState([]);

  useEffect(() => {
    const loadQuestions = async () => {
      let available = [];
      if (tagQuestions && tagQuestions.length > 0) {
        available = [...tagQuestions];
      } else {
        try {
          const res = await fetch('db/tag_questions_esl.toon');
          if (res.ok) {
            const text = await res.text();
            const lines = text.trim().split('\n');
            const headers = lines[0].split('|').map(h => h.trim());
            for (let i = 1; i < lines.length; i++) {
              if (!lines[i].trim()) continue;
              const values = lines[i].split('|').map(v => v.trim());
              const obj = {};
              headers.forEach((h, idx) => { obj[h] = values[idx]; });
              available.push(obj);
            }
          }
        } catch (e) {
          console.warn("Failed to load tag_questions_esl.toon", e);
        }
      }

      if (available.length === 0) {
        // Fallback mock
        available = [
          { id: 1, difficulty: 1, sentence_prompt: "She is happy, _______?", polarity: "pos", correct_tag: "isn't she", wrong_tag_1: "is she", wrong_tag_2: "aren't they" },
          { id: 2, difficulty: 1, sentence_prompt: "He isn't sad, _______?", polarity: "neg", correct_tag: "is he", wrong_tag_1: "isn't he", wrong_tag_2: "is she" }
        ];
      }

      // Shuffle and pick top 10 for a session
      const shuffled = available.sort(() => 0.5 - Math.random()).slice(0, 10);
      setQuestions(shuffled);
      setStartTime(Date.now());
    };
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentQ = questions[currentIndex];

  const handlePolaritySelect = (polarity) => {
    if (step !== 1 || feedbackState !== 'none') return;
    
    setSelectedPolarity(polarity);
    
    // Give immediate haptic/visual feedback
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }

    if (polarity === currentQ.polarity) {
      // Correct polarity! Move to step 2
      setStep(2);
      anime({
        targets: '.sentence-box',
        scale: [1, 1.05, 1],
        borderColor: polarity === 'pos' ? '#ef4444' : '#3b82f6',
        duration: 400,
        easing: 'easeOutQuad'
      });
    } else {
      // Incorrect polarity
      setFeedbackState('error');
      anime({
        targets: '.polarity-btn-container',
        translateX: [-10, 10, -10, 10, 0],
        duration: 400,
        easing: 'easeInOutSine'
      });
      setTimeout(() => {
        setFeedbackState('none');
        setSelectedPolarity(null);
      }, 1500);
    }
  };

  const handleTagSelect = (tag) => {
    if (step !== 2 || feedbackState !== 'none') return;

    const isCorrect = tag === currentQ.correct_tag;
    setFeedbackState(isCorrect ? 'success' : 'error');

    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(isCorrect ? [50, 50, 50] : [200]);
    }

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      anime({
        targets: '.tag-btn-correct',
        scale: [1, 1.1, 1],
        backgroundColor: '#22c55e',
        color: '#fff',
        duration: 400,
        easing: 'easeOutElastic(1, .8)'
      });
    } else {
      setWrongAnswers(prev => [...prev, currentQ]);
      anime({
        targets: '.tag-drawer',
        translateX: [-10, 10, -10, 10, 0],
        duration: 400,
        easing: 'easeInOutSine'
      });
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setStep(1);
        setSelectedPolarity(null);
        setFeedbackState('none');
        setStartTime(Date.now());
      } else {
        const responseTime = Date.now() - startTime;
        if (onComplete) {
          onComplete({
            gameId: 'inspectorTail',
            totalQuestions: questions.length,
            correctAnswers: correctCount + (isCorrect ? 1 : 0),
            wrongAnswers: isCorrect ? wrongAnswers : [...wrongAnswers, currentQ],
            averageResponseTime: responseTime
          });
        }
      }
    }, isCorrect ? 1500 : 2500);
  };

  if (!currentQ) return null;

  // Shuffle tags for display
  const tags = [currentQ.correct_tag, currentQ.wrong_tag_1, currentQ.wrong_tag_2].sort(() => 0.5 - Math.random());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '80vh', padding: 'var(--space-md)', background: 'var(--color-background-app)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <button onClick={onHome} className="btn-icon" style={{ background: 'white', borderRadius: '50%', padding: '10px', border: '2px solid var(--color-border-default)' }}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ margin: 0, color: 'var(--color-text-primary)' }}>Inspector Tail</h2>
        <div className="badge badge-warning" style={{ fontSize: '1rem', padding: '4px 12px' }}>
          {currentIndex + 1} / {questions.length}
        </div>
      </div>

      {/* Instructions */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
        <h3 style={{ color: 'var(--color-primary)', fontSize: '1.5rem', fontWeight: 800 }}>The Magnet Mystery</h3>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
          {step === 1 ? "Is the sentence Positive (+) or Negative (-)?" : "Opposites attract! Attach the right tail."}
        </p>
      </div>

      {/* Sentence Prompt */}
      <div className="sentence-box" style={{
        background: 'white',
        border: `3px solid ${step === 2 ? (selectedPolarity === 'pos' ? '#ef4444' : '#3b82f6') : 'var(--color-border-default)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)',
        fontSize: '1.5rem',
        fontWeight: 600,
        textAlign: 'center',
        boxShadow: '0 4px 0 var(--color-border-default)',
        marginBottom: 'var(--space-2xl)',
        transition: 'border-color 0.3s ease'
      }}>
        {currentQ.sentence_prompt.split('_______').map((part, i, arr) => (
          <React.Fragment key={i}>
            {part}
            {i < arr.length - 1 && (
              <span style={{ 
                borderBottom: '3px dashed var(--color-text-tertiary)', 
                padding: '0 20px',
                color: feedbackState === 'success' ? '#22c55e' : (step === 2 && selectedPolarity === 'pos' ? '#3b82f6' : (step === 2 && selectedPolarity === 'neg' ? '#ef4444' : 'transparent')),
                fontWeight: 800
              }}>
                {feedbackState === 'success' ? currentQ.correct_tag : (step === 2 ? '?' : '_______')}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Polarity Selector */}
      {step === 1 && (
        <div className="polarity-btn-container" style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
          <button 
            onClick={() => handlePolaritySelect('pos')}
            disabled={feedbackState !== 'none'}
            className="btn" 
            style={{ flex: 1, maxWidth: '150px', background: '#fee2e2', border: '3px solid #ef4444', color: '#b91c1c', fontSize: '1.2rem', opacity: feedbackState === 'error' && selectedPolarity === 'pos' ? 0.5 : 1 }}
          >
            [+] Positive
          </button>
          <button 
            onClick={() => handlePolaritySelect('neg')}
            disabled={feedbackState !== 'none'}
            className="btn" 
            style={{ flex: 1, maxWidth: '150px', background: '#e0f2fe', border: '3px solid #3b82f6', color: '#1d4ed8', fontSize: '1.2rem', opacity: feedbackState === 'error' && selectedPolarity === 'neg' ? 0.5 : 1 }}
          >
            [-] Negative
          </button>
        </div>
      )}

      {/* Step 2: Tag Drawer */}
      {step === 2 && (
        <div className="tag-drawer" style={{ 
          flex: 1, 
          background: '#f8fafc', 
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', 
          padding: 'var(--space-lg)', 
          borderTop: '3px solid var(--color-border-default)', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <h3 style={{ marginBottom: 'var(--space-md)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Magnet size={20} color={selectedPolarity === 'pos' ? '#3b82f6' : '#ef4444'} style={{ transform: 'rotate(180deg)' }} />
            Attach the tail:
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', width: '100%', maxWidth: '300px' }}>
            {tags.map((tag, idx) => {
              const isCorrect = tag === currentQ.correct_tag;
              return (
                <button 
                  key={idx}
                  onClick={() => handleTagSelect(tag)}
                  disabled={feedbackState !== 'none'}
                  className={`btn ${isCorrect && feedbackState !== 'none' ? 'tag-btn-correct' : ''}`}
                  style={{ 
                    // Give it the OPPOSITE color of the sentence to show magnet attraction
                    background: selectedPolarity === 'pos' ? '#e0f2fe' : '#fee2e2',
                    border: `3px solid ${selectedPolarity === 'pos' ? '#3b82f6' : '#ef4444'}`,
                    color: selectedPolarity === 'pos' ? '#1d4ed8' : '#b91c1c',
                    fontSize: '1.2rem', 
                    width: '100%',
                    opacity: feedbackState === 'error' && !isCorrect ? 0.5 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Feedback Overlay */}
      {feedbackState !== 'none' && step === 2 && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          zIndex: 100, pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center',
          animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
        }}>
          {feedbackState === 'success' ? (
            <div style={{ background: '#22c55e', color: 'white', padding: '20px', borderRadius: '50%', boxShadow: '0 10px 25px rgba(34,197,94,0.5)' }}>
              <Check size={64} strokeWidth={4} />
            </div>
          ) : (
            <>
              <div style={{ background: '#ef4444', color: 'white', padding: '20px', borderRadius: '50%', boxShadow: '0 10px 25px rgba(239,68,68,0.5)', marginBottom: '16px' }}>
                <X size={64} strokeWidth={4} />
              </div>
              <div style={{ background: 'white', padding: '16px', borderRadius: '16px', border: '4px solid #ef4444', textAlign: 'center' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#991b1b' }}>Oops! Magnets repelled!</h4>
                <p style={{ margin: 0, color: '#475569' }}>The tail didn't fit. Look at the pronoun and verb!</p>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Global styles for animations needed for this component */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes popIn {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          80% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default InspectorTailGame;
