import React from 'react';
import './StartScreen.css';

const StartScreen = ({
  wordlists,
  selectedWordlist,
  handleWordlistChange,
  history,
  wordlist,
  units,
  selectedUnits,
  handleUnitChange,
  numQuestions,
  setNumQuestions,
  startQuiz,
}) => {
  return (
    <div className="start-screen">
      <h1>Wordlist Quiz</h1>
      <div>
        <label>Choose a wordlist: </label>
        <div>
          {wordlists.map(wl => (
            <button key={wl} onClick={() => handleWordlistChange(wl)}>
              {wl.replace('wordlist_', '').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {selectedWordlist && history[selectedWordlist] && (
        <div className="history">
          <h3>Last 3 plays:</h3>
          <ul>
            {history[selectedWordlist].map((res, i) => (
              <li key={i}>
                {res.name || 'NoName'}: {new Date(res.date).toLocaleString()} - Score: {res.score.toFixed(2)}%
              </li>
            ))}
          </ul>
        </div>
      )}

      {wordlist && (
        <>
          <div className="unit-selection">
            <h3>Select Units:</h3>
            {units.map(unit => (
              <label key={unit}>
                <input
                  type="checkbox"
                  value={unit}
                  checked={selectedUnits.includes(unit)}
                  onChange={handleUnitChange}
                />{' '}
                {unit}
              </label>
            ))}
          </div>
          <div className="question-selection">
            <h3>Number of Questions:</h3>
            <select
              value={numQuestions}
              onChange={e => setNumQuestions(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>
          <button onClick={startQuiz} disabled={selectedUnits.length === 0}>
            Start Quiz
          </button>
        </>
      )}
    </div>
  );
};

export default StartScreen;