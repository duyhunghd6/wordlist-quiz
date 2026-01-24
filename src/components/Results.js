import React from 'react';
import { XCircle, CheckCircle, RotateCcw, Home, Zap } from 'lucide-react';
import './Results.css';

const Results = ({ score, questions, userAnswers, playAgain, saveResult, playerName }) => {
  const percentage = Math.min(100, Math.round((score / questions.length) * 100));
  const correctCount = userAnswers.filter(a => a.isCorrect).length;
  const wrongCount = userAnswers.filter(a => !a.isCorrect).length;
  
  // Determine performance level
  let performanceEmoji, performanceText, performanceClass;
  if (percentage >= 90) {
    performanceEmoji = '🏆';
    performanceText = 'Amazing!';
    performanceClass = 'excellent';
  } else if (percentage >= 70) {
    performanceEmoji = '⭐';
    performanceText = 'Great job!';
    performanceClass = 'good';
  } else if (percentage >= 50) {
    performanceEmoji = '👍';
    performanceText = 'Keep practicing!';
    performanceClass = 'okay';
  } else {
    performanceEmoji = '💪';
    performanceText = 'Try again!';
    performanceClass = 'needs-work';
  }

  const handlePlayAgain = () => {
    saveResult(playerName);
    playAgain();
  };

  return (
    <div className="results-container">
      {/* Hero Score */}
      <div className={`score-hero ${performanceClass}`}>
        <span className="performance-emoji">{performanceEmoji}</span>
        <h1 className="score-value">{percentage}%</h1>
        <p className="performance-text">{performanceText}</p>
        
        <div className="score-breakdown">
          <span className="stat correct">
            <CheckCircle size={18} />
            {correctCount} correct
          </span>
          <span className="stat wrong">
            <XCircle size={18} />
            {wrongCount} wrong
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="play-again-btn" onClick={handlePlayAgain}>
          <RotateCcw size={20} />
          <span>Play Again</span>
        </button>
        <button className="home-btn" onClick={playAgain}>
          <Home size={20} />
          <span>Home</span>
        </button>
      </div>

      {/* Answer Review */}
      <div className="answers-review">
        <h2>Review Answers</h2>
        <div className="answers-list">
            {userAnswers.map((answer, index) => (
            <div 
              key={index} 
              className={`answer-card ${answer.isCorrect ? 'correct' : 'incorrect'}`}
            >
              <div className="answer-header">
                <span className="question-number">Q{index + 1}</span>
                {answer.isCorrect ? (
                  <CheckCircle size={20} className="status-icon" />
                ) : (
                  <XCircle size={20} className="status-icon" />
                )}
              </div>
              
              <p className="question-text">{answer.question.definition}</p>
              
              <div className="answer-details">
                {answer.isCorrect ? (
                  <div className="correct-answer-display">
                    <CheckCircle size={16} />
                    <span><strong>{answer.question.word}</strong></span>
                  </div>
                ) : (
                  <>
                    <div className="your-answer">
                      <XCircle size={16} />
                      <span>{answer.selected || 'No answer'}</span>
                    </div>
                    <div className="correct-answer-display">
                      <CheckCircle size={16} />
                      <span><strong>{answer.question.word}</strong></span>
                    </div>
                    
                    {/* Learning context for wrong answers */}
                    <div className="learning-review">
                      {answer.question.example && (
                        <p className="review-example">
                          <strong>Example:</strong> "{answer.question.example}"
                        </p>
                      )}
                      {answer.question.vietnamese && (
                        <p className="review-vietnamese">
                          <strong>Meaning:</strong> {answer.question.vietnamese}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Response time indicator */}
              {answer.responseTime && (
                <div className="response-time">
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