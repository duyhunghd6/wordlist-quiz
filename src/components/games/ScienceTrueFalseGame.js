import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Check, X, Star, Brain, Lightbulb } from 'phosphor-react';
import anime from 'animejs';
import './ScienceTrueFalseGame.css';

const TOPIC_ICONS = {
  'Light sources and seeing': '💡',
  'Light travels in straight lines': '➡️',
  'Reflection and surfaces': '🪞',
  'Solar system': '🌍',
  "Earth's rotation and shadows": '🌗'
};

const DIFFICULTY_META = {
  easy: { label: 'Easy', color: '#22c55e', bg: '#dcfce7', emoji: '🌱' },
  medium: { label: 'Medium', color: '#f59e0b', bg: '#fef3c7', emoji: '🔥' },
  hard: { label: 'Hard', color: '#ef4444', bg: '#fee2e2', emoji: '🧠' }
};

const ScienceTrueFalseGame = ({ words, selectedUnits, onAnswer, onComplete, onHome, gameId }) => {
  const [allStatements, setAllStatements] = useState([]);
  const [statements, setStatements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongWords, setWrongWords] = useState([]);
  const [difficulty, setDifficulty] = useState(null); 
  const [loading, setLoading] = useState(true);

  // Load the statement bank
  useEffect(() => {
    const unitsToLoad = (selectedUnits && selectedUnits.length > 0) ? selectedUnits : ['5'];
    
    Promise.all(
      unitsToLoad.map(unit => 
        fetch(`db/science_tf_unit${unit}.json`)
          .then(res => {
            if (!res.ok) {
              console.warn(`Unit ${unit} tf file not found.`);
              return [];
            }
            return res.json();
          })
          .catch(err => {
            console.error(`Failed to load tf quiz for unit ${unit}:`, err);
            return [];
          })
      )
    )
    .then(dataArrays => {
      const allData = dataArrays.flat();
      setAllStatements(allData);
      setLoading(false);
    })
    .catch(err => {
      console.error('Failed to load TF quiz:', err);
      setLoading(false);
    });
  }, [selectedUnits]);

  const startGame = useCallback((diff) => {
    setDifficulty(diff);

    let filtered;
    if (diff === 'mixed') {
      filtered = [...allStatements];
    } else {
      filtered = allStatements.filter(s => s.difficulty === diff);
    }

    // Shuffle statements
    const shuffledQs = filtered.sort(() => Math.random() - 0.5);
    // Take up to words.length or default to 10
    const count = Math.min(words?.length || 10, shuffledQs.length);
    
    setStatements(shuffledQs.slice(0, count));
    setCurrentIndex(0);
    setCorrectCount(0);
    setWrongWords([]);
    setStartTime(Date.now());
  }, [allStatements, words]);

  const handleSelect = (answerTrueOrFalse) => {
    if (selectedAnswer !== null) return;

    const currentS = statements[currentIndex];
    const correct = answerTrueOrFalse === currentS.isTrue;
    const responseTime = Date.now() - startTime;

    setSelectedAnswer(answerTrueOrFalse);
    setIsCorrect(correct);

    if (correct) {
      setCorrectCount(prev => prev + 1);
      anime({
        targets: `.stf-btn-${answerTrueOrFalse ? 'true' : 'false'}`,
        scale: [1, 1.1, 1],
        duration: 400,
        easing: 'easeOutElastic(1, .8)'
      });
    } else {
      setWrongWords(prev => [...prev, { word: currentS.id }]);
      anime({
        targets: `.stf-btn-${answerTrueOrFalse ? 'true' : 'false'}`,
        translateX: [0, -10, 10, -10, 10, 0],
        duration: 500,
        easing: 'easeInOutSine'
      });
    }

    // Report
    const targetWord = words?.[currentIndex]?.word || currentS.id;
    if (onAnswer) {
      onAnswer(targetWord, correct, responseTime);
    }

    setTimeout(() => {
      setShowExplanation(true);
    }, 600);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowExplanation(false);

    if (currentIndex < statements.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setStartTime(Date.now());
    } else {
      if (onComplete) {
        onComplete({
          gameId: gameId || 'scienceTrueFalseGame',
          totalQuestions: statements.length,
          correctAnswers: correctCount + (isCorrect ? 0 : 0),
          wrongAnswers: wrongWords,
          averageResponseTime: 0
        });
      }
    }
  };

  const vibrate = (pattern) => {
    if (window.navigator?.vibrate) window.navigator.vibrate(pattern);
  };

  if (loading) {
    return (
      <div className="stf-container">
        <div className="stf-loading">
          <Brain size={48} weight="duotone" color="#ec4899" />
          <p>Loading facts...</p>
        </div>
      </div>
    );
  }

  // Difficulty screen
  if (difficulty === null) {
    return (
      <div className="stf-container">
        <div className="stf-header">
          <button onClick={onHome} className="stf-back-btn">
            <ArrowLeft size={24} weight="bold" />
          </button>
          <h2 className="stf-title">🔍 True or False</h2>
          <div style={{ width: 40 }} />
        </div>

        <div className="stf-difficulty-screen">
          <div className="stf-difficulty-hero">
            <Brain size={64} weight="duotone" color="#ec4899" />
            <h3>Fact or Fiction?</h3>
            <p>Selected Units: {selectedUnits?.join(', ') || '5'}</p>
          </div>

          <div className="stf-difficulty-grid">
            {[
              { key: 'easy', emoji: '🌱', title: 'Easy', desc: 'Basic facts', count: allStatements.filter(q => q.difficulty === 'easy').length },
              { key: 'medium', emoji: '🔥', title: 'Medium', desc: 'Think twice', count: allStatements.filter(q => q.difficulty === 'medium').length },
              { key: 'hard', emoji: '🧠', title: 'Hard', desc: 'Tricky logic', count: allStatements.filter(q => q.difficulty === 'hard').length },
              { key: 'mixed', emoji: '🎲', title: 'Mixed', desc: 'All levels!', count: allStatements.length }
            ].map(d => (
              <button
                key={d.key}
                className={`stf-diff-card stf-diff-${d.key}`}
                onClick={() => { vibrate([50]); startGame(d.key); }}
              >
                <span className="stf-diff-emoji">{d.emoji}</span>
                <span className="stf-diff-title">{d.title}</span>
                <span className="stf-diff-desc">{d.desc}</span>
                <span className="stf-diff-count">{d.count} Qs</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (statements.length === 0) {
    return (
      <div className="stf-container">
        <div className="stf-loading">
          <p>No questions available.</p>
          <button onClick={onHome} className="stf-btn-primary">Go Back</button>
        </div>
      </div>
    );
  }

  const currentS = statements[currentIndex];
  const diffMeta = DIFFICULTY_META[currentS.difficulty];
  const topicIcon = TOPIC_ICONS[currentS.topic] || '🔬';
  const progress = ((currentIndex + (showExplanation ? 1 : 0)) / statements.length) * 100;

  return (
    <div className="stf-container">
      {/* Header */}
      <div className="stf-header">
        <button onClick={onHome} className="stf-back-btn">
          <ArrowLeft size={24} weight="bold" />
        </button>
        <div className="stf-header-center">
          <span className="stf-score-badge">
            <Star size={16} weight="fill" color="#f59e0b" />
            {correctCount}/{currentIndex + (showExplanation ? 1 : 0)}
          </span>
        </div>
        <div className="stf-counter">
          {currentIndex + 1}/{statements.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="stf-progress-bar">
        <div className="stf-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Badges */}
      <div className="stf-badges">
        <span className="stf-topic-badge">
          {topicIcon} {currentS.topic}
        </span>
        <span className="stf-diff-badge" style={{ background: diffMeta.bg, color: diffMeta.color }}>
          {diffMeta.emoji} {diffMeta.label}
        </span>
      </div>

      {/* Statement Area */}
      <div className="stf-statement-area">
        <div className="stf-statement-card">
            <h3 className="stf-statement-text">{currentS.statement}</h3>
        </div>
      </div>

      {/* T/F Buttons */}
      <div className="stf-action-area">
        <button
          className={`stf-btn stf-btn-true ${selectedAnswer !== null ? (selectedAnswer === true ? (isCorrect ? 'stf-selected-correct' : 'stf-selected-wrong') : 'stf-dim') : ''}`}
          onClick={() => {
            vibrate(50);
            handleSelect(true);
          }}
          disabled={selectedAnswer !== null}
        >
          <div className="stf-btn-icon"><Check size={32} weight="bold" /></div>
          <span>TRUE</span>
        </button>
        
        <button
          className={`stf-btn stf-btn-false ${selectedAnswer !== null ? (selectedAnswer === false ? (isCorrect ? 'stf-selected-correct' : 'stf-selected-wrong') : 'stf-dim') : ''}`}
          onClick={() => {
            vibrate(50);
            handleSelect(false);
          }}
          disabled={selectedAnswer !== null}
        >
          <div className="stf-btn-icon"><X size={32} weight="bold" /></div>
          <span>FALSE</span>
        </button>
      </div>

      {/* Explanation */}
      {showExplanation && (
        <div className={`stf-explanation ${isCorrect ? 'stf-exp-correct' : 'stf-exp-wrong'}`}>
          <div className="stf-exp-header">
            <Lightbulb size={24} weight="duotone" color={isCorrect ? '#16a34a' : '#dc2626'} />
            <span style={{ fontWeight: 800 }}>{isCorrect ? 'Correct! 🎉' : 'Oops! Let\'s learn why 📚'}</span>
          </div>
          <p className="stf-exp-text">
            {/* Break the explanation down to remove repetitive "True!" or "False!" if it matches the answer */}
            {currentS.explanation}
          </p>
          <button className="stf-btn-next" onClick={handleNext}>
            {currentIndex < statements.length - 1 ? 'Next Fact →' : 'See Results 🏆'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ScienceTrueFalseGame;
