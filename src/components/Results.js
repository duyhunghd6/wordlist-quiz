import React from 'react';
import './Results.css';

const Results = ({ score, questions, userAnswers, playAgain }) => {
  return (
    <div className="results">
      <h1>Results</h1>
      <h2>Your score: {((score / questions.length) * 100).toFixed(2)}%</h2>
      <div>
        {userAnswers.map((answer, index) => (
          <div key={index} className="answer-summary">
            <p>
              <strong>Question:</strong> {answer.question.definition}
            </p>
            <p>
              Your answer:{' '}
              <span style={{ color: answer.isCorrect ? 'green' : 'red' }}>
                {answer.selected}
              </span>
            </p>
            {!answer.isCorrect && (
              <p>
                Correct answer:{' '}
                <span style={{ color: 'green' }}>{answer.question.word}</span>
              </p>
            )}
            <div>
              {answer.question.options.map(opt => (
                <button
                  key={opt}
                  disabled
                  style={{
                    backgroundColor:
                      answer.question.word === opt
                        ? 'lightgreen'
                        : answer.selected === opt
                        ? 'lightcoral'
                        : 'white',
                    color: 'black',
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button onClick={playAgain}>PLAY AGAIN</button>
    </div>
  );
};

export default Results;