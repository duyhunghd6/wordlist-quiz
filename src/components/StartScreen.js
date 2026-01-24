import React from 'react';
import { BookOpen, Calculator, Microscope, BarChart3, Play, CheckSquare, Square, Pencil } from 'lucide-react';
import GameSelector from './GameSelector';
import './StartScreen.css';

const SUBJECTS = {
  wordlist_esl: {
    name: 'English',
    icon: BookOpen,
    color: 'esl',
  },
  wordlist_math: {
    name: 'Math',
    icon: Calculator,
    color: 'math',
  },
  wordlist_science: {
    name: 'Science',
    icon: Microscope,
    color: 'science',
  },
};

const StartScreen = ({
  wordlists,
  selectedWordlist,
  handleWordlistChange,
  history,
  wordlist,
  units,
  selectedUnits,
  setSelectedUnits,
  handleUnitChange,
  numQuestions,
  setNumQuestions,
  startQuiz,
  profile,
  avatar,
  selectedGame,
  onSelectGame,
  gameStats,
  hasPreferences,
  onOpenParentReport,
  onProfileClick,
  onEditName,
}) => {
  const allSelected = units.length > 0 && units.length === selectedUnits.length;
  
  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedUnits([]);
    } else {
      setSelectedUnits([...units]);
    }
  };
  return (
    <div className="start-screen">
      {/* Profile Header */}
      <header className="profile-header">
        <div className="profile-info">
          <button 
            className="profile-avatar-btn"
            onClick={onProfileClick}
            aria-label="Switch profile"
          >
            <span className="profile-avatar">{avatar?.emoji || '🐼'}</span>
          </button>
          <span className="profile-greeting">
            Hi, <strong>{profile?.name || 'Student'}</strong>!
          </span>
          <button 
            className="edit-name-btn"
            onClick={onEditName}
            aria-label="Edit profile name"
          >
            <Pencil size={14} />
          </button>
        </div>
        <button 
          className="report-btn"
          onClick={onOpenParentReport}
          aria-label="View Parent Report"
        >
          <BarChart3 size={20} />
          <span>Report</span>
        </button>
      </header>

      {/* Hero Title */}
      <div className="hero">
        <h1>Wordlist Quiz</h1>
        <p className="tagline">Learn new words through fun games!</p>
      </div>
      
      {/* Subject Selection */}
      <section className="section">
        <h2>Pick a Subject</h2>
        <div className="subject-grid">
          {wordlists.map(wl => {
            const subject = SUBJECTS[wl] || { name: wl, icon: BookOpen, color: 'esl' };
            const Icon = subject.icon;
            const isSelected = selectedWordlist === wl;
            return (
              <button 
                key={wl} 
                onClick={() => handleWordlistChange(wl)}
                className={`subject-card subject-${subject.color} ${isSelected ? 'selected' : ''}`}
                aria-pressed={isSelected}
              >
                <div className="subject-icon">
                  <Icon size={40} strokeWidth={2} />
                </div>
                <span className="subject-name">{subject.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recent History */}
      {selectedWordlist && history[selectedWordlist]?.length > 0 && (
        <section className="history-card">
          <h3>Recent Plays</h3>
          <div className="history-list">
            {history[selectedWordlist].slice(0, 3).map((res, i) => (
              <div key={i} className="history-item">
                <span className="history-date">{new Date(res.date).toLocaleDateString()}</span>
                <span className="history-score">{res.score}%</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Game Options - Only show after subject selected */}
      {wordlist && (
        <>
          {/* Game Selector */}
          <GameSelector
            selectedGame={selectedGame}
            onSelectGame={onSelectGame}
            gameStats={gameStats}
          />

          {/* Unit Selection */}
          <section className="section">
            <div className="section-header">
              <h2>Choose Units</h2>
              <button 
                className="select-all-btn"
                onClick={handleSelectAll}
                aria-label={allSelected ? 'Unselect all units' : 'Select all units'}
              >
                {allSelected ? (
                  <><Square size={14} /> <span>Clear</span></>
                ) : (
                  <><CheckSquare size={14} /> <span>All</span></>
                )}
              </button>
            </div>
            <div className="unit-grid">
              {units.map(unit => {
                const isChecked = selectedUnits.includes(unit);
                return (
                  <label 
                    key={unit} 
                    className={`unit-chip ${isChecked ? 'checked' : ''}`}
                  >
                    <input
                      type="checkbox"
                      value={unit}
                      checked={isChecked}
                      onChange={handleUnitChange}
                    />
                    <span>Unit {unit}</span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Question Count */}
          <section className="section">
            <h2>How Many Questions?</h2>
            <div className="question-pills">
              {[5, 10, 20].map(num => (
                <button
                  key={num}
                  className={`question-pill ${numQuestions === num ? 'selected' : ''}`}
                  onClick={() => setNumQuestions(num)}
                  aria-pressed={numQuestions === num}
                >
                  {num}
                </button>
              ))}
            </div>
          </section>

          {/* Start Button */}
          <button 
            className="start-button"
            onClick={startQuiz} 
            disabled={selectedUnits.length === 0}
          >
            <Play size={24} fill="currentColor" />
            <span>Start {selectedGame === 'quiz' ? 'Quiz' : 'Game'}!</span>
          </button>
        </>
      )}
    </div>
  );
};

export default StartScreen;