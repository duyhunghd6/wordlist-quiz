import { useState, useEffect, useMemo, useRef } from 'react';
import './GrammarDetectiveGame.css';
import { GRAMMAR_DETECTIVE_MODES } from './grammarDetectiveModes';
import { grammarDetectiveData } from './grammarDetectiveData';

export default function GrammarDetectiveGame({
  gameId,
  numQuestions = 10,
  onComplete,
  onHome
}) {
  const mode = GRAMMAR_DETECTIVE_MODES[gameId];
  const audioContextRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState('clue'); // clue, answer, explain, finished
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', text: string }
  const [wrongClueTaps, setWrongClueTaps] = useState(0);
  const [wrongAnswerTaps, setWrongAnswerTaps] = useState(0);
  const [wrongAnswer, setWrongAnswer] = useState(null);
  const [perfectAnswers, setPerfectAnswers] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [attempts, setAttempts] = useState([]);

  // Initialize session
  useEffect(() => {
    if (!mode) return;
    
    // Filter questions by gameId
    const available = grammarDetectiveData.filter(q => q.game === gameId);
    // Shuffle and pick
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(numQuestions, shuffled.length));
    
    setQuestions(selected);
    setCurrentIndex(0);
    setScore(0);
    setPhase('clue');
    setAttempts([]);
    setStartTime(Date.now());
    
    // Init audio context
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
  }, [gameId, mode, numQuestions]);

  const playTone = (type) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
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

  // Tokenize sentence into clickable parts
  const tokens = useMemo(() => {
    if (!currentQ) return [];
    
    const { sentence, clueText } = currentQ;
    const parts = sentence.split(clueText);
    
    if (parts.length !== 2) {
      // Fallback if split fails (should not happen with valid data)
      return [{ id: 'fallback', type: 'text', content: sentence }];
    }
    
    const beforeText = parts[0];
    const afterText = parts[1];
    
    const t = [];
    let idCounter = 0;
    
    const processPart = (text) => {
      // split by space, preserve empty strings if needed, but better to use regex to keep punctuation attached to words
      const words = text.split(/(\s+)/);
      words.forEach(w => {
        if (!w.trim() && w.length > 0) {
           t.push({ id: `space-${idCounter++}`, type: 'space', content: w });
        } else if (w.includes('___')) {
           t.push({ id: `blank-${idCounter++}`, type: 'blank', content: w });
        } else if (w.length > 0) {
           t.push({ id: `word-${idCounter++}`, type: 'word', content: w });
        }
      });
    };
    
    processPart(beforeText);
    t.push({ id: `clue-${idCounter++}`, type: 'clue', content: clueText });
    processPart(afterText);
    
    return t;
  }, [currentQ]);

  if (!mode || !currentQ) {
    return <div>Loading game...</div>;
  }

  const handleClueTap = (tokenType) => {
    if (phase !== 'clue') return;
    
    if (tokenType === 'clue') {
      playTone('correct');
      setPhase('answer');
      const successText = currentQ.meaningHint 
        ? `Clue Found! ${currentQ.meaningHint}`
        : 'Great! You found the clue.';
      setFeedback({ type: 'success', text: successText });
      // No timeout, leave the meaning hint visible while they choose an answer
    } else if (tokenType === 'word') {
      playTone('wrong');
      setWrongClueTaps(prev => prev + 1);
      
      const isSecondMiss = wrongClueTaps + 1 >= 2;
      setFeedback({ 
        type: 'error', 
        text: isSecondMiss ? `Hint: The clue is "${currentQ.clueText}"` : 'Not quite. Try to find a time word, condition, or evidence.'
      });
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const handleAnswerTap = (option) => {
    if (phase !== 'answer') return;
    
    const isCorrect = option === currentQ.answer || (currentQ.acceptedAnswers && currentQ.acceptedAnswers.includes(option));
    
    if (isCorrect) {
      playTone('correct');
      setSelectedAnswer(option);
      setPhase('explain');
      setScore(prev => prev + 1);
      
      const firstTryCorrect = wrongAnswerTaps === 0 && wrongClueTaps === 0;
      if (firstTryCorrect) {
        setPerfectAnswers(prev => prev + 1);
      }
      
      setFeedback({ type: 'success', text: 'Correct!' });
      
      // Record attempt
      setAttempts(prev => [...prev, {
        questionId: currentQ.id,
        clueCorrect: wrongClueTaps === 0,
        answerCorrect: wrongAnswerTaps === 0,
        wrongClueTaps,
        wrongAnswerTaps,
        tags: currentQ.tags
      }]);
    } else {
      playTone('wrong');
      setWrongAnswerTaps(prev => prev + 1);
      setWrongAnswer(option);
      
      let specificRationale = currentQ.distractorRationale && currentQ.distractorRationale[option];
      let formHint = currentQ.formHint || '';
      
      let hintText = specificRationale 
        ? `${specificRationale} ${formHint}`.trim()
        : `Not quite. ${formHint || 'Try again!'}`.trim();

      setFeedback({ 
        type: 'error', 
        text: hintText
      });
      setTimeout(() => {
        setFeedback(null);
        setWrongAnswer(null);
      }, 4000);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setPhase('clue');
      setFeedback(null);
      setSelectedAnswer(null);
      setWrongAnswer(null);
      setWrongClueTaps(0);
      setWrongAnswerTaps(0);
    } else {
      setPhase('finished');
      if (onComplete) {
        onComplete({
          gameId: mode.id,
          totalQuestions: questions.length,
          correctAnswers: score, // total solved
          perfectAnswers: perfectAnswers, // first try correct
          score: Math.round((perfectAnswers / questions.length) * 100),
          averageResponseTime: (Date.now() - startTime) / questions.length,
          attempts
        });
      }
    }
  };

  const showCluePulse = wrongClueTaps >= 2 && phase === 'clue';

  return (
    <div className={`gdd-game ${mode.themeClass}`}>
      <div className="gdd-hud">
        <button onClick={onHome} className="gdd-option-button" style={{minWidth: 'auto', padding: '8px 16px'}}>🏠 Home</button>
        <div className="gdd-progress">Case {currentIndex + 1} / {questions.length}</div>
        <div className="gdd-score">⭐ {score}</div>
      </div>
      
      <div className="gdd-stage">
        <div className="gdd-case-card">
          <h2>{mode.title}</h2>
          <div className="gdd-instruction">
            {phase === 'clue' && mode.clueInstruction}
            {phase === 'answer' && mode.answerInstruction}
            {phase === 'explain' && 'Case Solved!'}
          </div>

          {mode.guideIntro && (
            <div className="gdd-guide-intro" aria-label={`${mode.title} grammar guide`}>
              <div className="gdd-guide-intro-title">{mode.guideIntro.title}</div>
              {mode.guideIntro.lines.map(line => (
                <p key={line} className="gdd-guide-intro-line">{line}</p>
              ))}
              <div className="gdd-guide-structures">
                {mode.guideIntro.structures.map(item => (
                  <div key={item.label} className="gdd-guide-structure">
                    <div className="gdd-guide-structure-label">{item.label}</div>
                    <div className="gdd-guide-structure-formula">{item.formula}</div>
                    <div className="gdd-guide-structure-example">{item.example}</div>
                  </div>
                ))}
              </div>
              <div className="gdd-guide-reminder">{mode.guideIntro.reminder}</div>
            </div>
          )}

          {mode.guideBoard && (
            <div className="gdd-guide-board" aria-label={`${mode.title} quick guide`}>
              {mode.guideBoard.map(item => (
                <div key={item.job} className="gdd-guide-card">
                  <div className="gdd-guide-job">{item.job}</div>
                  <div className="gdd-guide-clue">{item.clue}</div>
                  <div className="gdd-guide-modal">{item.modal || item.form}</div>
                </div>
              ))}
            </div>
          )}

          <div className="gdd-sentence">
            {tokens.map(t => {
              if (t.type === 'space') return <span key={t.id}>{t.content}</span>;
              
              if (t.type === 'blank') {
                return (
                  <span key={t.id} className={`gdd-token-blank ${selectedAnswer ? 'filled' : ''}`}>
                    {selectedAnswer ? selectedAnswer : '___'}
                  </span>
                );
              }
              
              const isClueToken = t.type === 'clue';
              const isRevealed = isClueToken && phase !== 'clue';
              const isInteractive = phase === 'clue' && t.type !== 'space' && t.type !== 'blank';
              
              let className = 'gdd-token';
              if (isInteractive) className += ' gdd-token-interactive';
              if (isRevealed) className += ' gdd-token-clue revealed';
              if (isClueToken && showCluePulse) className += ' gdd-pulse';

              return (
                <span 
                  key={t.id} 
                  className={className}
                  onClick={() => handleClueTap(t.type)}
                >
                  {t.content}
                </span>
              );
            })}
          </div>

          {phase === 'answer' && (
            <div className="gdd-options">
              {currentQ.options.map((opt, i) => (
                <button 
                  key={i} 
                  className={`gdd-option-button ${wrongAnswer === opt ? 'wrong' : ''}`}
                  onClick={() => handleAnswerTap(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {feedback && (
            <div className={`gdd-feedback ${feedback.type}`}>
              {feedback.text}
            </div>
          )}

          {phase === 'explain' && (
            <>
              <div className="gdd-feedback success" style={{backgroundColor: '#E3F2FD', borderColor: '#64B5F6', color: '#0D47A1'}}>
                {currentQ.explanation}
              </div>
              <button className="gdd-next-button" onClick={nextQuestion}>
                {currentIndex < questions.length - 1 ? 'Next Case ➡️' : 'Finish 🏁'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
