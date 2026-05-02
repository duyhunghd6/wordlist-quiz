import React, { useMemo, useState, useRef, useEffect } from 'react';
import { makeReviewResultQuestion } from '../../utils/eslReviewNormalizer';
import './EslReviewGames.css';

const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

/**
 * Inline scroll-picker blank — sits within the text like a small slot machine.
 */
const InlinePickerBlank = ({ options, selectedOption, active, onToggleActive, onPick, isSubmitted, correctAnswer }) => {
  const [selectedIdx, setSelectedIdx] = useState(
    selectedOption ? options.indexOf(selectedOption) : 0
  );
  const viewportRef = useRef(null);
  const itemH = 30;

  const longestLen = useMemo(
    () => Math.max(...options.map((o) => (o ? o.length : 0)), 4),
    [options]
  );
  const stableWidth = Math.min(Math.max(longestLen * 8 + 100, 140), 450);

  useEffect(() => {
    if (active && viewportRef.current && !viewportRef.current._userScrolling) {
      viewportRef.current.scrollTo({ top: selectedIdx * itemH, behavior: 'smooth' });
    }
  }, [active, selectedIdx]);

  useEffect(() => {
    if (!active) return;
    const vp = viewportRef.current;
    if (!vp) return;
    let timer = null;
    const onScroll = () => {
      vp._userScrolling = true;
      clearTimeout(timer);
      timer = setTimeout(() => {
        vp._userScrolling = false;
        const idx = Math.round(vp.scrollTop / itemH);
        if (idx >= 0 && idx < options.length) setSelectedIdx(idx);
      }, 60);
    };
    vp.addEventListener('scroll', onScroll, { passive: true });
    return () => { vp.removeEventListener('scroll', onScroll); clearTimeout(timer); };
  }, [active, options.length]);

  const stableHeight = 36;
  const containerStyle = { display: 'inline-flex', justifyContent: 'center', alignItems: 'center', width: stableWidth, height: stableHeight, margin: '0 4px', verticalAlign: 'middle', boxSizing: 'border-box' };

  if (isSubmitted) {
    const isCorrect = selectedOption === correctAnswer;
    return (
      <span style={containerStyle}>
        <span className={`srm-answered ${isCorrect ? 'srm-correct' : 'srm-wrong'}`}>
          {selectedOption || 'No answer'}
        </span>
      </span>
    );
  }

  if (selectedOption && !active) {
    return (
      <span style={containerStyle}>
        <span className="srm-answered srm-correct" style={{ background: '#e0e0e0', color: '#333' }} onClick={onToggleActive}>
          {selectedOption}
        </span>
      </span>
    );
  }

  if (!active) {
    return (
      <span style={containerStyle}>
        <span className="srm-blank" onClick={onToggleActive}>
          ______
        </span>
      </span>
    );
  }

  return (
    <span style={containerStyle}>
      <span className="srm-picker" onClick={(e) => e.stopPropagation()}>
        <span className="srm-picker-arrow" onClick={() => setSelectedIdx(Math.max(0, selectedIdx - 1))}>▲</span>
        <span className="srm-picker-vp" ref={viewportRef}>
          <span className="srm-picker-track">
            {options.map((opt, i) => (
              <span
                key={`${opt}_${i}`}
                className={`srm-picker-opt ${i === selectedIdx ? 'srm-picker-sel' : ''}`}
                style={{ minHeight: itemH }}
                onClick={() => setSelectedIdx(i)}
              >
                {opt}
              </span>
            ))}
          </span>
        </span>
        <span className="srm-picker-arrow" onClick={() => setSelectedIdx(Math.min(options.length - 1, selectedIdx + 1))}>▼</span>
        <span className="srm-picker-ok" onClick={() => onPick(options[selectedIdx])}>✓</span>
      </span>
    </span>
  );
};

const InlineQ = ({ question, index, selectedOption, active, onToggleActive, onPick, isSubmitted, hidePassage }) => {
  const parts = question.prompt.split(/_{3,}/);
  const picker = (
    <InlinePickerBlank 
      options={question.options} 
      selectedOption={selectedOption}
      active={active}
      onToggleActive={onToggleActive}
      onPick={onPick}
      isSubmitted={isSubmitted}
      correctAnswer={question.correctAnswer}
    />
  );
  
  const isCorrect = selectedOption === question.correctAnswer;
  const fb = isSubmitted && (
    <span className={`srm-fb ${isCorrect ? 'srm-fb-ok' : 'srm-fb-no'}`}>
      {isCorrect ? ' ✓' : ` ✗ (Correct: ${question.correctAnswer})`}
    </span>
  );

  let content;
  if (parts.length === 1) {
    content = <span className="srm-q">{question.prompt} {picker}</span>;
  } else {
    content = (
      <span className="srm-q">
        {parts.map((p, i) => (
          <React.Fragment key={i}>{p}{i < parts.length - 1 && picker}</React.Fragment>
        ))}
      </span>
    );
  }

  return (
    <div className="esl-review-list-item" style={{ padding: '16px', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '2px solid rgba(0,0,0,0.1)' }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#666' }}>{index + 1}. {question.category}</div>
      {!hidePassage && question.passage && <div className="esl-review-passage" style={{ marginBottom: '12px' }}>{question.passage}</div>}
      {content}
      {fb}
    </div>
  );
};

const EslReviewQuiz = ({ eslReviewQuestions, onAnswer, onComplete, onHome, selectedUnits = [], words = [] }) => {
  const questions = useMemo(() => {
    const banks = eslReviewQuestions?.banks || {};
    const multipleChoice = banks.multiple_choice || [];
    const simpleGrammar = (banks.grammar_completion || [])
      .filter((item) => !item.correctAnswer.includes(';'))
      .slice(0, 20)
      .map((item, _, grammarItems) => {
        const distractors = item.wordBank.length > 1
          ? item.wordBank
          : grammarItems.map((grammarItem) => grammarItem.correctAnswer).filter((answer) => answer !== item.correctAnswer);
        return { ...item, options: shuffle([...new Set([item.correctAnswer, ...distractors])]).slice(0, 4) };
      });
      
    let mixed = shuffle([...multipleChoice, ...simpleGrammar]).slice(0, 30); // Show up to 30 as requested
    
    // Group them so passages are together
    const grouped = [];
    const passageGroups = new Map();
    const nonPassages = [];
    
    mixed.forEach(q => {
      if (q.passage) {
        if (!passageGroups.has(q.passage)) {
          passageGroups.set(q.passage, []);
        }
        passageGroups.get(q.passage).push(q);
      } else {
        nonPassages.push(q);
      }
    });
    
    // We can shuffle the groups themselves to keep randomness while keeping passages together
    const allGroups = [
      ...Array.from(passageGroups.values()),
      ...nonPassages.map(q => [q]) // each non-passage is its own group
    ];
    
    shuffle(allGroups).forEach(group => grouped.push(...group));
    
    return grouped;
  }, [eslReviewQuestions]);

  const [answers, setAnswers] = useState({});
  const [activePickerIdx, setActivePickerIdx] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  if (!questions || questions.length === 0) {
    return (
      <div className="esl-review-game">
        <div className="esl-review-card">
          <p className="esl-review-prompt">ESL review questions are still loading.</p>
          <button className="esl-review-action" onClick={onHome}>Back home</button>
        </div>
      </div>
    );
  }

  const handlePick = (index, option) => {
    setAnswers(prev => ({ ...prev, [index]: option }));
    setActivePickerIdx(null);
  };

  const handleSubmit = () => {
    let nextScore = 0;
    questions.forEach((q, idx) => {
      const isCorrect = answers[idx] === q.correctAnswer;
      if (isCorrect) nextScore++;
      
      // If we want to record each answer tracking
      if (answers[idx]) {
        onAnswer(q.correctAnswer, isCorrect, 3000, makeReviewResultQuestion(q), answers[idx]);
      }
    });
    setScore(nextScore);
    setIsSubmitted(true);
  };

  const handleFinish = () => {
    onComplete({ 
      score: Math.round((score / questions.length) * 100), 
      totalQuestions: questions.length, 
      correctCount: score 
    });
  };

  const allAnswered = Object.keys(answers).length === questions.length;

  const renderList = () => {
    const groups = [];
    let currentPassage = null;
    let currentGroup = [];

    questions.forEach((q, idx) => {
      if (q.passage !== currentPassage) {
        if (currentGroup.length > 0) {
          groups.push({ passage: currentPassage, questions: currentGroup });
        }
        currentPassage = q.passage;
        currentGroup = [{ q, idx }];
      } else {
        currentGroup.push({ q, idx });
      }
    });
    if (currentGroup.length > 0) {
      groups.push({ passage: currentPassage, questions: currentGroup });
    }

    return groups.map((g, gIdx) => (
      <div key={gIdx} className="esl-review-group" style={{ marginBottom: '32px' }}>
        {g.passage && <div className="esl-review-passage" style={{ marginBottom: '16px' }}>{g.passage}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {g.questions.map(({ q, idx }) => (
            <InlineQ 
              key={idx} 
              index={idx}
              question={q} 
              selectedOption={answers[idx]}
              active={activePickerIdx === idx}
              onToggleActive={(e) => { e.stopPropagation(); setActivePickerIdx(activePickerIdx === idx ? null : idx); }}
              onPick={(option) => handlePick(idx, option)}
              isSubmitted={isSubmitted}
              hidePassage={true}
            />
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className="esl-review-game">
      <header className="esl-review-header">
        <button className="esl-review-back" onClick={onHome}>←</button>
        <div className="esl-review-title">
          <h1>Review Quiz</h1>
          <p>{selectedUnits.length ? `Units ${selectedUnits.join(', ')}` : 'ESL Review Tenses'}</p>
        </div>
      </header>

      <main className="esl-review-card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left', maxHeight: '75vh', overflowY: 'auto' }} onClick={() => setActivePickerIdx(null)}>
        {!isSubmitted && (
          <div className="esl-review-progress" style={{ marginBottom: '20px' }}>
            <span>{Object.keys(answers).length} of {questions.length} answered</span>
          </div>
        )}
        
        {isSubmitted && (
          <div className="esl-review-progress" style={{ marginBottom: '20px', background: '#e8f5e9', padding: '16px', borderRadius: '12px' }}>
            <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#2e7d32' }}>Score: {score} / {questions.length}</span>
            <button className="esl-review-action" style={{ padding: '8px 16px', fontSize: '1em' }} onClick={handleFinish}>Finish Quiz</button>
          </div>
        )}

        <div className="esl-review-list">
          {renderList()}
        </div>

        {!isSubmitted && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button 
              className={`esl-review-action ${!allAnswered ? 'locked' : ''}`} 
              style={{ fontSize: '1.2em', padding: '12px 32px' }}
              onClick={handleSubmit}
            >
              {allAnswered ? 'Submit Quiz' : 'Please answer all questions'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default EslReviewQuiz;

