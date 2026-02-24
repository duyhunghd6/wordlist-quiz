import React, { useState, useCallback, useMemo } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import TENSE_SIGNAL_WORLDS from './tenseSignalData';
import './TenseSignalGame.css';

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/** Split a sentence into tappable tokens, keeping the signalWord as one unit */
const tokenize = (sentence, signalWord) => {
  const lower = sentence.toLowerCase();
  const sigLower = signalWord.toLowerCase();
  const idx = lower.indexOf(sigLower);

  if (idx === -1) {
    // Fallback: split by spaces
    return sentence.split(/\s+/).map(w => ({ text: w, isSignal: false }));
  }

  const tokens = [];
  const before = sentence.slice(0, idx).trim();
  const match = sentence.slice(idx, idx + signalWord.length);
  const after = sentence.slice(idx + signalWord.length).trim();

  if (before) before.split(/\s+/).forEach(w => tokens.push({ text: w, isSignal: false }));
  tokens.push({ text: match, isSignal: true });
  if (after) after.split(/\s+/).forEach(w => tokens.push({ text: w, isSignal: false }));

  return tokens;
};

const TenseSignalGame = ({ words, onAnswer, onComplete, onHome }) => {
  const [phase, setPhase] = useState('worldSelect');
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [tappedToken, setTappedToken] = useState(null); // index of tapped token
  const [isCorrect, setIsCorrect] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const [worldsCompleted, setWorldsCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tsg_worlds_completed') || '[]'); }
    catch { return []; }
  });

  // Build tokens for current question
  const tokens = useMemo(() => {
    if (phase !== 'playing' || !questions[currentQ]) return [];
    const q = questions[currentQ];
    return tokenize(q.sentence, q.signalWord);
  }, [phase, questions, currentQ]);

  // ─── Start a world ───
  const startWorld = useCallback((world) => {
    let qs;
    if (world.id === 'mix_all') {
      const allQs = [];
      TENSE_SIGNAL_WORLDS.forEach(w => {
        const pick = shuffle(w.questions)[0];
        allQs.push({ sentence: pick.sentence, signalWord: pick.signalWord, category: w.category, tenseName: w.name });
      });
      qs = shuffle(allQs);
    } else {
      const picked = shuffle(world.questions).slice(0, 8);
      qs = picked.map(q => ({ sentence: q.sentence, signalWord: q.signalWord, category: world.category, tenseName: world.name }));
    }
    setQuestions(qs);
    setSelectedWorld(world);
    setCurrentQ(0);
    setScore(0);
    setHearts(3);
    setTappedToken(null);
    setIsCorrect(null);
    setQuestionStartTime(Date.now());
    setPhase('playing');
  }, []);

  // ─── Handle token tap ───
  const handleTokenTap = useCallback((tokenIdx) => {
    if (tappedToken !== null) return; // already answered
    const token = tokens[tokenIdx];
    const correct = token.isSignal;
    const responseTime = Date.now() - questionStartTime;

    setTappedToken(tokenIdx);
    setIsCorrect(correct);

    if (correct) setScore(prev => prev + 1);

    if (window.navigator?.vibrate) {
      window.navigator.vibrate(correct ? [40, 30, 40] : [200]);
    }

    if (onAnswer && words?.length > 0) {
      const wordIndex = currentQ % words.length;
      onAnswer(words[wordIndex]?.word || `signal_q${currentQ}`, correct, responseTime);
    }

    const newHearts = correct ? hearts : hearts - 1;
    if (!correct) setHearts(newHearts);
    const delay = correct ? 1200 : 2000;

    setTimeout(() => {
      setTappedToken(null);
      setIsCorrect(null);

      if (newHearts <= 0) { setPhase('gameOver'); return; }
      if (currentQ + 1 >= questions.length) {
        const wid = selectedWorld.id;
        setWorldsCompleted(prev => {
          const upd = prev.includes(wid) ? prev : [...prev, wid];
          localStorage.setItem('tsg_worlds_completed', JSON.stringify(upd));
          return upd;
        });
        setPhase('worldComplete');
        return;
      }
      setCurrentQ(prev => prev + 1);
      setQuestionStartTime(Date.now());
    }, delay);
  }, [tappedToken, tokens, questionStartTime, hearts, words, onAnswer, currentQ, questions, selectedWorld]);

  // ─── Finish game ───
  const handleFinish = useCallback(() => {
    if (onComplete) {
      onComplete({ gameId: 'tenseSignal', totalQuestions: questions.length, correctAnswers: score, wrongAnswers: [], averageResponseTime: 3000 });
    }
  }, [onComplete, questions.length, score]);

  // ═══════════════════════════════════════
  // RENDER: WORLD SELECTOR
  // ═══════════════════════════════════════
  if (phase === 'worldSelect') {
    const bgColors = {
      present: 'linear-gradient(135deg, #22c55e, #16a34a)',
      past: 'linear-gradient(135deg, #3b82f6, #2563eb)',
      future: 'linear-gradient(135deg, #f59e0b, #d97706)',
    };
    return (
      <div className="tsg-game">
        <div className="tsg-world-select">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', maxWidth: '400px', marginBottom: '10px' }}>
            <button className="tsg-back-btn" onClick={onHome} aria-label="Go back"><ArrowLeft size={16} /></button>
            <div>
              <h1 className="tsg-ws-title">🔍 Tense Signal</h1>
              <p className="tsg-ws-sub">Tap the signal word!</p>
            </div>
          </div>
          <div className="tsg-ws-grid">
            <button className="tsg-ws-card tsg-ws-mix" onClick={() => startWorld({ id: 'mix_all', name: 'Mix All Tenses', emoji: '🔥', category: 'present', questions: [] })}>
              <span style={{ fontSize: '1.8rem' }}>🔥</span>
              <div style={{ textAlign: 'left' }}>
                <span className="ws-num">Mix All Tenses!</span>
                <span className="ws-label">12 random questions from all tenses</span>
              </div>
            </button>
            {TENSE_SIGNAL_WORLDS.map((world, i) => (
              <button key={world.id} className="tsg-ws-card" style={{ background: bgColors[world.category] }} onClick={() => startWorld(world)}>
                <span className="ws-emoji">{world.emoji}</span>
                <span className="ws-num">{i + 1}</span>
                <span className="ws-label">{world.name}</span>
                {worldsCompleted.includes(world.id) && <span className="ws-star">⭐</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // RENDER: GAME OVER
  // ═══════════════════════════════════════
  if (phase === 'gameOver') {
    return (
      <div className="tsg-game">
        <div className="tsg-overlay">
          <div className="tsg-overlay-icon">💔</div>
          <h2>Game Over!</h2>
          <p>Score: {score}/{questions.length}</p>
          <div className="tsg-overlay-actions">
            <button className="tsg-o-btn primary" onClick={() => startWorld(selectedWorld)}>Try Again</button>
            <button className="tsg-o-btn secondary" onClick={() => setPhase('worldSelect')}>World Map</button>
            <button className="tsg-o-btn secondary" onClick={onHome}>Home</button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // RENDER: WORLD COMPLETE
  // ═══════════════════════════════════════
  if (phase === 'worldComplete') {
    const pct = Math.round((score / questions.length) * 100);
    const starCount = pct >= 90 ? 3 : pct >= 70 ? 2 : 1;
    return (
      <div className="tsg-game">
        <div className="tsg-overlay">
          <div className="tsg-overlay-icon">{'⭐'.repeat(starCount)}</div>
          <h2>World Complete!</h2>
          <p>{selectedWorld?.name}<br/>Score: {score}/{questions.length} ({pct}%)</p>
          <div className="tsg-overlay-actions">
            <button className="tsg-o-btn primary" onClick={() => setPhase('worldSelect')}>Next World</button>
            <button className="tsg-o-btn secondary" onClick={() => startWorld(selectedWorld)}>Replay</button>
            <button className="tsg-o-btn secondary" onClick={handleFinish}>Finish</button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // RENDER: PLAYING — Tap words in sentence
  // ═══════════════════════════════════════
  const q = questions[currentQ];
  if (!q) return null;

  const getTokenClass = (token, idx) => {
    if (tappedToken === null) return 'tappable'; // all tappable
    if (token.isSignal && isCorrect) return 'signal-correct'; // correct answer found
    if (token.isSignal && !isCorrect) return 'signal-reveal'; // reveal correct after wrong
    if (idx === tappedToken && !isCorrect) return 'signal-wrong'; // wrong tap
    return 'signal-dimmed'; // everything else dims
  };

  return (
    <div className="tsg-game">
      {/* Particles */}
      <div className="tsg-particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="tsg-particle" style={{
            width: `${20 + Math.random() * 40}px`, height: `${20 + Math.random() * 40}px`,
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            background: ['#C084FC', '#FBBF24', '#60A5FA', '#34D399'][i % 4],
            animationDelay: `${Math.random() * 4}s`, animationDuration: `${6 + Math.random() * 4}s`,
          }} />
        ))}
      </div>

      {/* HUD */}
      <div className="tsg-hud">
        <div className="tsg-hud-left">
          <button className="tsg-back-btn" onClick={() => setPhase('worldSelect')} aria-label="Back"><ArrowLeft size={15} /></button>
          <div className="tsg-score-pill">🪙 {score}</div>
          <div className="tsg-hearts">
            {[0,1,2].map(i => <span key={i} className={`tsg-heart ${i >= hearts ? 'lost' : ''}`}>❤️</span>)}
          </div>
        </div>
        <div className="tsg-progress-pill">{currentQ + 1}/{questions.length}</div>
      </div>

      <div className="tsg-progress-bar">
        <div className="tsg-progress-fill" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
      </div>

      {/* Content */}
      <div className="tsg-content">
        <span className={`tsg-tense-label ${isCorrect === true ? 'correct-state' : q.category}`}>
          {q.tenseName}
        </span>

        {/* Prompt */}
        <p className="tsg-prompt">
          {tappedToken === null ? '👆 Tap the signal word!' : (isCorrect ? '✨ That\'s the signal!' : '❌ Try to remember this one!')}
        </p>

        {/* Sentence Card with tappable tokens */}
        <div className={`tsg-sentence-card ${isCorrect === true ? 'revealed-correct' : isCorrect === false ? 'revealed-wrong' : ''}`}>
          <div className="tsg-token-row">
            {tokens.map((token, idx) => (
              <button
                key={idx}
                className={`tsg-token ${getTokenClass(token, idx)}`}
                onClick={() => handleTokenTap(idx)}
                disabled={tappedToken !== null}
              >
                {token.text}
                {tappedToken !== null && token.isSignal && (
                  <span className="tsg-token-badge correct-badge"><Check size={14} strokeWidth={3} /></span>
                )}
                {tappedToken !== null && idx === tappedToken && !isCorrect && !token.isSignal && (
                  <span className="tsg-token-badge wrong-badge"><X size={14} strokeWidth={3} /></span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feedback overlay */}
      {tappedToken !== null && (
        <div className="tsg-feedback">
          <div className={`tsg-feedback-icon ${isCorrect ? 'correct-icon' : 'wrong-icon'}`}>
            {isCorrect ? <Check size={40} strokeWidth={3} /> : <X size={40} strokeWidth={3} />}
          </div>
          <span className="tsg-feedback-text">{isCorrect ? 'Correct!' : 'Not quite!'}</span>
        </div>
      )}
    </div>
  );
};

export default TenseSignalGame;
