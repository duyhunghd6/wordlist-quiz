import React from 'react';
import { XCircle, CheckCircle, RotateCcw, Home, Zap } from 'lucide-react';
import './Results.css';

const Results = ({ score, questions, userAnswers, resultSummary, playAgain, saveResult, playerName }) => {
  const answerCorrectCount = userAnswers.filter(a => a.isCorrect).length;
  const answerWrongCount = userAnswers.filter(a => !a.isCorrect).length;
  const answerTotal = answerCorrectCount + answerWrongCount;
  const correctCount = resultSummary?.correctAnswers ?? answerCorrectCount;
  const totalAnswered = resultSummary?.totalQuestions ?? answerTotal;
  const wrongCount = Math.max(0, totalAnswered - correctCount);

  const percentage = resultSummary
    ? resultSummary.score
    : answerTotal > 0
      ? Math.round((answerCorrectCount / answerTotal) * 100)
      : Math.min(100, Math.round((score / Math.max(1, questions.length)) * 100));
  
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
    playAgain();
  };

  return (
    <div className="results-container">
      {/* Hero Score */}
      <div className="card shadow-lg results-hero" style={{ backgroundColor: performanceBg, borderColor: performanceColor }}>
        <div className="rh-emoji">{performanceEmoji}</div>
        <h1 className="rh-score" style={{ color: performanceColor }}>{percentage}%</h1>
        <p className="rh-message">{performanceText}</p>
        
        <div className="rh-stats">
          <div className="rh-stat success">
            <CheckCircle size={24} />
            <span>{correctCount} correct</span>
          </div>
          <div className="rh-stat danger">
            <XCircle size={24} />
            <span>{wrongCount} wrong</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="results-actions">
        <button className="btn btn-primary results-action-btn" onClick={handlePlayAgain}>
          <RotateCcw size={20} />
          <span>Play Again</span>
        </button>
        <button className="btn btn-secondary results-action-btn" onClick={playAgain}>
          <Home size={20} />
          <span>Home</span>
        </button>
      </div>

      {/* Answer Review */}
      <div className="card shadow-sm results-review">
        <h2 className="rr-title">Review Answers</h2>
        <div className="rr-list">
          {userAnswers.map((answer, index) => (
            <div 
              key={index} 
              className={`rr-item ${answer.isCorrect ? 'correct' : 'wrong'}`}
            >
              <div className="rr-header">
                <span className="badge badge-neutral rr-badge">Q{index + 1}</span>
                {answer.isCorrect ? (
                  <CheckCircle size={20} color="var(--color-success)" />
                ) : (
                  <XCircle size={20} color="var(--color-danger)" />
                )}
              </div>
              
              <p className="rr-definition">{answer.question.definition}</p>
              
              <div className="rr-details">
                {answer.isCorrect ? (
                  <div className="rr-row correct">
                    <CheckCircle size={16} />
                    <span>{answer.question.word}</span>
                  </div>
                ) : (
                  <>
                    <div className="rr-row wrong">
                      <XCircle size={16} />
                      <span>{answer.selected || 'No answer'}</span>
                    </div>
                    <div className="rr-row correct">
                      <CheckCircle size={16} />
                      <span>{answer.question.word}</span>
                    </div>
                    
                  </>
                )}

                {/* Learning context */}
                {(answer.question.explanation || answer.question.example || answer.question.vietnamese) && (
                  <div className="rr-context">
                    {answer.question.explanation && (
                      <p className="rr-example">
                        <strong className="rr-label">Explanation:</strong> {answer.question.explanation}
                      </p>
                    )}
                    {answer.question.example && (
                      <p className="rr-example">
                        <strong className="rr-label">Example:</strong> "{answer.question.example}"
                      </p>
                    )}
                    {answer.question.vietnamese && (
                      <p className="rr-meaning">
                        <strong className="rr-label">Meaning:</strong> {answer.question.vietnamese}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {answer.responseTime && (
                <div className="rr-time">
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