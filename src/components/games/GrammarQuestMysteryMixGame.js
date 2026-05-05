import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import './GrammarQuestMysteryMixGame.css';
import { loadAllMysteryMixQuestions } from './grammarQuestMysteryMixAdapters';
import { loadMysteryMixWeights, saveMysteryMixWeights, updateWeightsAfterQuestion } from './grammarQuestMysteryMixProgress';
import { selectMysteryMixQuestions } from './grammarQuestMysteryMixSelection';

export default function GrammarQuestMysteryMixGame({
  numQuestions = 10,
  onComplete,
  onHome
}) {
  const audioContextRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState('loading'); // loading, clue, answer, explain, summary
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [wrongClueTaps, setWrongClueTaps] = useState(0);
  const [wrongAnswerTaps, setWrongAnswerTaps] = useState(0);
  const [wrongAnswer, setWrongAnswer] = useState(null);
  const [startTime, setStartTime] = useState(0);
  const [attempts, setAttempts] = useState([]);
  
  const [weights, setWeights] = useState({ questionWeights: {}, tagWeights: {}, attempts: {} });
  
  const [sourceBreakdown, setSourceBreakdown] = useState({});
  const [tagBreakdown, setTagBreakdown] = useState({});

  useEffect(() => {
    async function initGame() {
      const allQ = await loadAllMysteryMixQuestions();
      const loadedWeights = loadMysteryMixWeights();
      setWeights(loadedWeights);
      
      const selected = selectMysteryMixQuestions(allQ, numQuestions, loadedWeights);
      
      if (selected.length === 0) {
        setPhase('summary');
        return;
      }

      setQuestions(selected);
      setCurrentIndex(0);
      setScore(0);
      setPhase(selected[0].clueText ? 'clue' : 'answer');
      setAttempts([]);
      setStartTime(Date.now());
      
      setSourceBreakdown({});
      setTagBreakdown({});

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    initGame();
  }, [numQuestions]);

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

  const tokens = useMemo(() => {
    if (!currentQ || phase === 'loading' || phase === 'summary') return [];
    
    const { prompt, clueText } = currentQ;
    if (!clueText) {
      // If no clue text, just return the prompt with a blank
      const parts = prompt.split('_______');
      if (parts.length > 1) {
         return [
           { id: 't1', type: 'text', content: parts[0] },
           { id: 'b1', type: 'blank', content: '___' },
           { id: 't2', type: 'text', content: parts[1] }
         ];
      }
      return [{ id: 't1', type: 'text', content: prompt }];
    }

    const parts = prompt.split(clueText);
    
    if (parts.length !== 2) {
      return [{ id: 'fallback', type: 'text', content: prompt }];
    }
    
    const beforeText = parts[0];
    const afterText = parts[1];
    
    const t = [];
    let idCounter = 0;
    
    const processPart = (text) => {
      const words = text.split(/(\s+)/);
      words.forEach(w => {
        if (!w.trim() && w.length > 0) {
           t.push({ id: `space-${idCounter++}`, type: 'space', content: w });
        } else if (w.includes('___') || w.includes('_______')) {
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
  }, [currentQ, phase]);

  const handleCompleteSession = useCallback(() => {
    setPhase('summary');
    saveMysteryMixWeights(weights);

    if (onComplete) {
      onComplete({
        gameId: 'grammarQuestMysteryMix',
        totalQuestions: questions.length,
        correctAnswers: score,
        score: Math.round((score / questions.length) * 100),
        averageResponseTime: (Date.now() - startTime) / questions.length,
        sourceBreakdown,
        tagBreakdown,
        attempts
      });
    }
  }, [attempts, onComplete, questions.length, score, sourceBreakdown, startTime, tagBreakdown, weights]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setPhase(questions[nextIdx].clueText ? 'clue' : 'answer');
      setFeedback(null);
      setSelectedAnswer(null);
      setWrongAnswer(null);
      setWrongClueTaps(0);
      setWrongAnswerTaps(0);
    } else {
      handleCompleteSession();
    }
  }, [currentIndex, questions, handleCompleteSession]);

  const handleClueTap = (tokenType) => {
    if (phase !== 'clue') return;
    
    if (tokenType === 'clue') {
      playTone('correct');
      setPhase('answer');
      setFeedback({ type: 'success', text: currentQ.meaningHint || 'Great! You found the clue.' });
    } else if (tokenType === 'word') {
      playTone('wrong');
      setWrongClueTaps(prev => prev + 1);
      
      const isSecondMiss = wrongClueTaps + 1 >= 2;
      setFeedback({ 
        type: 'error', 
        text: isSecondMiss ? `Hint: The clue is "${currentQ.clueText}"` : 'Not quite. Find the clue word first.'
      });
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const updateBreakdowns = (q, isCorrect) => {
    setSourceBreakdown(prev => ({
      ...prev,
      [q.sourceGameId]: {
        seen: (prev[q.sourceGameId]?.seen || 0) + 1,
        correct: (prev[q.sourceGameId]?.correct || 0) + (isCorrect ? 1 : 0),
        wrong: (prev[q.sourceGameId]?.wrong || 0) + (isCorrect ? 0 : 1),
      }
    }));

    if (q.tags) {
      setTagBreakdown(prev => {
        const next = { ...prev };
        q.tags.forEach(tag => {
          if (!next[tag]) next[tag] = { seen: 0, wrong: 0 };
          next[tag].seen += 1;
          if (!isCorrect) next[tag].wrong += 1;
        });
        return next;
      });
    }
  };

  const handleAnswerTap = (option) => {
    if (phase !== 'answer') return;
    
    const isCorrect = option === currentQ.answer || (currentQ.acceptedAnswers && currentQ.acceptedAnswers.includes(option));
    
    if (isCorrect) {
      playTone('correct');
      setSelectedAnswer(option);
      setPhase('explain');
      
      const firstTryCorrect = wrongAnswerTaps === 0 && wrongClueTaps === 0;
      if (firstTryCorrect) {
        setScore(prev => prev + 1);
      }
      
      setFeedback({ type: 'success', text: 'Correct!' });
      
      // Track attempt
      const attemptData = {
        questionId: currentQ.id,
        sourceGameId: currentQ.sourceGameId,
        correct: firstTryCorrect,
        selectedAnswer: option,
        finalAnswer: currentQ.answer,
        wrongClueTaps,
        wrongAnswerTaps,
        tags: currentQ.tags,
      };
      setAttempts(prev => [...prev, attemptData]);

      // Update Weights locally
      const updatedWeights = updateWeightsAfterQuestion(weights, currentQ.id, currentQ.tags, firstTryCorrect, wrongClueTaps > 0);
      setWeights(updatedWeights);
      
      updateBreakdowns(currentQ, firstTryCorrect);

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

  if (phase === 'loading') {
    return <div className="gqmm-loading">Loading Mystery Cases...</div>;
  }

  if (phase === 'summary') {
    // Determine strongest and weakest
    let strongest = [];
    let weakest = [];
    
    if (Object.keys(sourceBreakdown).length > 0) {
      const sourceStats = Object.entries(sourceBreakdown).map(([id, stats]) => ({
        id,
        name: questions.find(q => q.sourceGameId === id)?.sourceGameName || id,
        accuracy: stats.correct / stats.seen
      }));
      
      sourceStats.sort((a, b) => b.accuracy - a.accuracy);
      strongest = sourceStats.filter(s => s.accuracy >= 0.7).map(s => s.name);
      weakest = sourceStats.filter(s => s.accuracy < 0.5).map(s => s.name);
    }

    return (
      <div className="gqmm-game">
        <div className="gqmm-summary-card">
          <h2>Mystery Mix Complete!</h2>
          <div className="gqmm-final-score">⭐ {score} / {questions.length} Solved Perfectly</div>
          
          <div className="gqmm-stats">
            {strongest.length > 0 && (
              <div className="gqmm-stat-group positive">
                <h3>Strong Cases:</h3>
                <p>{strongest.join(', ')}</p>
              </div>
            )}
            
            {weakest.length > 0 && (
              <div className="gqmm-stat-group needs-practice">
                <h3>Needs More Practice:</h3>
                <p>{weakest.join(', ')}</p>
              </div>
            )}

            {strongest.length === 0 && weakest.length === 0 && (
              <div className="gqmm-stat-group neutral">
                <p>Great detective work across all cases!</p>
              </div>
            )}
          </div>
          
          <button className="gqmm-home-btn" onClick={onHome}>Back to Journey</button>
        </div>
      </div>
    );
  }

  const showCluePulse = wrongClueTaps >= 2 && phase === 'clue';

  return (
    <div className="gqmm-game">
      <div className="gqmm-hud">
        <button onClick={onHome} className="gqmm-home-small">🏠 Home</button>
        <div className="gqmm-progress">Mystery {currentIndex + 1} / {questions.length}</div>
        <div className="gqmm-score">⭐ {score}</div>
      </div>
      
      <div className="gqmm-stage">
        <div className="gqmm-case-card">
          <h2>Mystery Mix Review</h2>
          <div className="gqmm-instruction">
            {phase === 'clue' && "Find the clue word to solve the mystery."}
            {phase === 'answer' && "Choose the correct grammar."}
            {phase === 'explain' && "Case Solved!"}
          </div>

          <div className="gqmm-sentence">
            {tokens.map(t => {
              if (t.type === 'space') return <span key={t.id}>{t.content}</span>;
              
              if (t.type === 'blank') {
                return (
                  <span key={t.id} className={`gqmm-token-blank ${selectedAnswer ? 'filled' : ''}`}>
                    {selectedAnswer ? selectedAnswer : '___'}
                  </span>
                );
              }
              
              const isClueToken = t.type === 'clue';
              const isRevealed = isClueToken && phase !== 'clue';
              const isInteractive = phase === 'clue' && t.type !== 'space' && t.type !== 'blank';
              
              let className = 'gqmm-token';
              if (isInteractive) className += ' gqmm-token-interactive';
              if (isRevealed) className += ' gqmm-token-clue revealed';
              if (isClueToken && showCluePulse) className += ' gqmm-pulse';

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
            <div className="gqmm-options">
              {currentQ.options.map((opt, i) => (
                <button 
                  key={i} 
                  className={`gqmm-option-btn ${wrongAnswer === opt ? 'wrong' : ''}`}
                  onClick={() => handleAnswerTap(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {feedback && (
            <div className={`gqmm-feedback ${feedback.type}`}>
              {feedback.text}
            </div>
          )}

          {phase === 'explain' && (
            <div className="gqmm-explanation-area">
              <div className="gqmm-badge">{currentQ.sourceGameName} Case</div>
              <div className="gqmm-explanation-text">
                {currentQ.explanation}
              </div>
              <button className="gqmm-next-btn" onClick={nextQuestion}>
                {currentIndex < questions.length - 1 ? 'Next Mystery' : 'Finish Session'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
