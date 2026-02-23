import React from 'react';
import { XCircle, CheckCircle, RotateCcw, Home, Zap } from 'lucide-react';
import './Results.css';

const Results = ({ score, questions, userAnswers, playAgain, saveResult, playerName }) => {
  const percentage = Math.min(100, Math.round((score / questions.length) * 100));
  const correctCount = userAnswers.filter(a => a.isCorrect).length;
  const wrongCount = userAnswers.filter(a => !a.isCorrect).length;
  
  let performanceEmoji, performanceText, performanceColor, performanceBg;
  if (percentage >= 90) {
    performanceEmoji = '🏆';
    performanceText = 'Amazing!';
    performanceColor = 'var(--color-success)';
    performanceBg = '#F0FDF4'; // emerald-50
  } else if (percentage >= 70) {
    performanceEmoji = '⭐';
    performanceText = 'Great job!';
    performanceColor = 'var(--color-success)';
    performanceBg = '#F0FDF4'; 
  } else if (percentage >= 50) {
    performanceEmoji = '👍';
    performanceText = 'Keep practicing!';
    performanceColor = '#F59E0B'; // amber
    performanceBg = '#FFFBEB';
  } else {
    performanceEmoji = '💪';
    performanceText = 'Try again!';
    performanceColor = 'var(--color-danger)';
    performanceBg = '#FEF2F2';
  }

  const handlePlayAgain = () => {
    saveResult(playerName);
    playAgain();
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', padding: 'var(--space-md)' }}>
      {/* Hero Score */}
      <div className="card shadow-lg" style={{ textAlign: 'center', padding: 'var(--space-2xl) var(--space-xl)', backgroundColor: performanceBg, border: `2px solid ${performanceColor}` }}>
        <div style={{ fontSize: '4rem', lineHeight: 1, marginBottom: 'var(--space-sm)' }}>{performanceEmoji}</div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: '0 0 var(--space-xs) 0', color: performanceColor }}>{percentage}%</h1>
        <p style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 var(--space-xl) 0', color: 'var(--color-text-primary)' }}>{performanceText}</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)' }}>
            <CheckCircle size={24} />
            <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{correctCount} correct</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)' }}>
            <XCircle size={24} />
            <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{wrongCount} wrong</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
        <button className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: 'var(--space-md)' }} onClick={handlePlayAgain}>
          <RotateCcw size={20} />
          <span>Play Again</span>
        </button>
        <button className="btn btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: 'var(--space-md)' }} onClick={playAgain}>
          <Home size={20} />
          <span>Home</span>
        </button>
      </div>

      {/* Answer Review */}
      <div className="card shadow-sm" style={{ padding: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: '1.5rem', margin: '0 0 var(--space-lg) 0', color: 'var(--color-text-primary)' }}>Review Answers</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {userAnswers.map((answer, index) => (
            <div 
              key={index} 
              style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)', backgroundColor: answer.isCorrect ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${answer.isCorrect ? '#BBF7D0' : '#FECACA'}` }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xs)' }}>
                <span className="badge badge-neutral" style={{ padding: '2px 8px' }}>Q{index + 1}</span>
                {answer.isCorrect ? (
                  <CheckCircle size={20} color="var(--color-success)" />
                ) : (
                  <XCircle size={20} color="var(--color-danger)" />
                )}
              </div>
              
              <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 var(--space-sm) 0' }}>{answer.question.definition}</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {answer.isCorrect ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)' }}>
                    <CheckCircle size={16} />
                    <span style={{ fontWeight: 800 }}>{answer.question.word}</span>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)' }}>
                      <XCircle size={16} />
                      <span style={{ fontWeight: 600, textDecoration: 'line-through' }}>{answer.selected || 'No answer'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)' }}>
                      <CheckCircle size={16} />
                      <span style={{ fontWeight: 800 }}>{answer.question.word}</span>
                    </div>
                    
                    {/* Learning context */}
                    <div style={{ marginTop: 'var(--space-sm)', padding: 'var(--space-sm)', backgroundColor: 'white', borderRadius: 'var(--radius-md)' }}>
                      {answer.question.example && (
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: '0 0 4px 0' }}>
                          <strong style={{ color: 'var(--color-info)' }}>Example:</strong> "{answer.question.example}"
                        </p>
                      )}
                      {answer.question.vietnamese && (
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', margin: '0' }}>
                          <strong style={{ color: 'var(--color-info)' }}>Meaning:</strong> {answer.question.vietnamese}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {answer.responseTime && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600, marginTop: 'var(--space-sm)' }}>
                  <Zap size={12} />
                  <span>{(answer.responseTime / 1000).toFixed(1)}s</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Results;