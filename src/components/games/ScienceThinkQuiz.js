import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Check, X, Star, Brain, Lightbulb } from 'phosphor-react';
import anime from 'animejs';
import './ScienceThinkQuiz.css';

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

const ScienceThinkQuiz = ({ words, onAnswer, onComplete, onHome, gameId }) => {
  const [allQuestions, setAllQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongWords, setWrongWords] = useState([]);
  const [difficulty, setDifficulty] = useState(null); // null = selection screen
  const [loading, setLoading] = useState(true);

  // Load the question bank
  useEffect(() => {
    fetch('db/science_quiz_unit5.json')
      .then(res => res.json())
      .then(data => {
        setAllQuestions(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load science quiz:', err);
        setLoading(false);
      });
  }, []);

  // Filter and prepare questions when difficulty is selected
  const startGame = useCallback((diff) => {
    setDifficulty(diff);

    let filtered;
    if (diff === 'mixed') {
      filtered = [...allQuestions];
    } else {
      filtered = allQuestions.filter(q => q.difficulty === diff);
    }

    // Shuffle
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    // Take up to numQuestions (from words.length) or all available
    const count = Math.min(words.length || 10, shuffled.length);
    setQuestions(shuffled.slice(0, count));
    setCurrentIndex(0);
    setCorrectCount(0);
    setWrongWords([]);
    setStartTime(Date.now());
  }, [allQuestions, words.length]);

  const handleSelect = (optionIndex) => {
    if (selectedOption !== null) return;

    const currentQ = questions[currentIndex];
    const correct = optionIndex === currentQ.correctIndex;
    const responseTime = Date.now() - startTime;

    setSelectedOption(optionIndex);
    setIsCorrect(correct);

    if (correct) {
      setCorrectCount(prev => prev + 1);
      // Animate correct
      anime({
        targets: `.stq-option-${optionIndex}`,
        scale: [1, 1.05, 1],
        duration: 400,
        easing: 'easeOutElastic(1, .8)'
      });
    } else {
      setWrongWords(prev => [...prev, { word: currentQ.id }]);
      // Animate wrong
      anime({
        targets: `.stq-option-${optionIndex}`,
        translateX: [0, -8, 8, -8, 0],
        duration: 400,
        easing: 'easeInOutSine'
      });
    }

    // Report to learning engine
    const targetWord = words[currentIndex]?.word || currentQ.id;
    if (onAnswer) {
      onAnswer(targetWord, correct, responseTime);
    }

    // Show explanation after a brief pause
    setTimeout(() => {
      setShowExplanation(true);
    }, 500);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsCorrect(null);
    setShowExplanation(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setStartTime(Date.now());
    } else {
      // Game complete
      if (onComplete) {
        onComplete({
          gameId: gameId || 'scienceThinkQuiz',
          totalQuestions: questions.length,
          correctAnswers: correctCount + (isCorrect ? 0 : 0), // already counted
          wrongAnswers: wrongWords,
          averageResponseTime: 0
        });
      }
    }
  };

  // Haptic feedback
  const vibrate = (pattern) => {
    if (window.navigator?.vibrate) window.navigator.vibrate(pattern);
  };

  // Loading state
  if (loading) {
    return (
      <div className="stq-container">
        <div className="stq-loading">
          <Brain size={48} weight="duotone" color="#7c3aed" />
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  // Difficulty selection screen
  if (difficulty === null) {
    return (
      <div className="stq-container">
        <div className="stq-header">
          <button onClick={onHome} className="stq-back-btn">
            <ArrowLeft size={24} weight="bold" />
          </button>
          <h2 className="stq-title">🧪 Science Think Quiz</h2>
          <div style={{ width: 40 }} />
        </div>

        <div className="stq-difficulty-screen">
          <div className="stq-difficulty-hero">
            <Brain size={64} weight="duotone" color="#7c3aed" />
            <h3>Choose Your Challenge</h3>
            <p>Unit 5: Light & Solar System</p>
          </div>

          <div className="stq-difficulty-grid">
            {[
              { key: 'easy', emoji: '🌱', title: 'Easy', desc: 'Basic facts & recall', count: allQuestions.filter(q => q.difficulty === 'easy').length },
              { key: 'medium', emoji: '🔥', title: 'Medium', desc: 'Think & apply', count: allQuestions.filter(q => q.difficulty === 'medium').length },
              { key: 'hard', emoji: '🧠', title: 'Hard', desc: 'Reason & analyze', count: allQuestions.filter(q => q.difficulty === 'hard').length },
              { key: 'mixed', emoji: '🎲', title: 'Mixed', desc: 'All levels!', count: allQuestions.length }
            ].map(d => (
              <button
                key={d.key}
                className={`stq-diff-card stq-diff-${d.key}`}
                onClick={() => { vibrate([50]); startGame(d.key); }}
              >
                <span className="stq-diff-emoji">{d.emoji}</span>
                <span className="stq-diff-title">{d.title}</span>
                <span className="stq-diff-desc">{d.desc}</span>
                <span className="stq-diff-count">{d.count} Qs</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // No questions edge case
  if (questions.length === 0) {
    return (
      <div className="stq-container">
        <div className="stq-loading">
          <p>No questions available for this selection.</p>
          <button onClick={onHome} className="stq-btn-primary">Go Back</button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const diffMeta = DIFFICULTY_META[currentQ.difficulty];
  const topicIcon = TOPIC_ICONS[currentQ.topic] || '🔬';
  const progress = ((currentIndex + (showExplanation ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="stq-container">
      {/* Header */}
      <div className="stq-header">
        <button onClick={onHome} className="stq-back-btn">
          <ArrowLeft size={24} weight="bold" />
        </button>
        <div className="stq-header-center">
          <span className="stq-score-badge">
            <Star size={16} weight="fill" color="#f59e0b" />
            {correctCount}/{currentIndex + (showExplanation ? 1 : 0)}
          </span>
        </div>
        <div className="stq-counter">
          {currentIndex + 1}/{questions.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="stq-progress-bar">
        <div className="stq-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Topic & Difficulty badge */}
      <div className="stq-badges">
        <span className="stq-topic-badge">
          {topicIcon} {currentQ.topic}
        </span>
        <span className="stq-diff-badge" style={{ background: diffMeta.bg, color: diffMeta.color }}>
          {diffMeta.emoji} {diffMeta.label}
        </span>
      </div>

      {/* Question */}
      <div className="stq-question-area">
        <h3 className="stq-question-text">{currentQ.question}</h3>
      </div>

      {/* Options */}
      <div className="stq-options">
        {currentQ.options.map((option, idx) => {
          let optClass = `stq-option stq-option-${idx}`;
          if (selectedOption !== null) {
            if (idx === currentQ.correctIndex) {
              optClass += ' stq-correct';
            } else if (idx === selectedOption && !isCorrect) {
              optClass += ' stq-wrong';
            } else {
              optClass += ' stq-dimmed';
            }
          }

          return (
            <button
              key={idx}
              className={optClass}
              onClick={() => {
                vibrate(isCorrect ? [50, 50, 50] : [200]);
                handleSelect(idx);
              }}
              disabled={selectedOption !== null}
            >
              <span className="stq-option-letter">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="stq-option-text">{option}</span>
              {selectedOption !== null && idx === currentQ.correctIndex && (
                <Check size={20} weight="bold" className="stq-option-icon stq-icon-correct" />
              )}
              {selectedOption !== null && idx === selectedOption && !isCorrect && idx !== currentQ.correctIndex && (
                <X size={20} weight="bold" className="stq-option-icon stq-icon-wrong" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Card */}
      {showExplanation && (
        <div className={`stq-explanation ${isCorrect ? 'stq-exp-correct' : 'stq-exp-wrong'}`}>
          <div className="stq-exp-header">
            <Lightbulb size={24} weight="duotone" color={isCorrect ? '#16a34a' : '#dc2626'} />
            <span>{isCorrect ? 'Correct! Great thinking! 🎉' : 'Not quite! Let\'s learn why 📚'}</span>
          </div>
          <p className="stq-exp-text">{currentQ.explanation}</p>
          <button className="stq-btn-next" onClick={handleNext}>
            {currentIndex < questions.length - 1 ? 'Next Question →' : 'See Results 🏆'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ScienceThinkQuiz;
