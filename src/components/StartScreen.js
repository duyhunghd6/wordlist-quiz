import React from 'react';
import { BookOpen, Calculator, Microscope, BarChart3, Play, CheckSquare, Square, Pencil } from 'lucide-react';
import GameSelector from './GameSelector';
import { GAMES } from '../constants/gameConfig';
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
  startGrammarGame,
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
    <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', paddingBottom: 'var(--space-2xl)' }}>
      {/* Profile Header */}
      <div className="flex-row shadow-sm" style={{ padding: 'var(--space-sm) var(--space-md)', justifyContent: 'space-between', alignItems: 'center', background: 'white', border: '3px solid var(--color-border-default)', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <button 
            onClick={onProfileClick}
            className="avatar avatar-md"
            style={{ cursor: 'pointer', background: 'var(--color-background-default)', border: '2px solid var(--color-border-default)' }}
            aria-label="Switch profile"
          >
            <span style={{ fontSize: '24px' }}>{avatar?.emoji || '🐼'}</span>
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Hi, {profile?.name || 'Student'}!
            </span>
            <button 
              onClick={onEditName}
              style={{ background: 'none', border: 'none', padding: 0, color: 'var(--color-text-secondary)', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Pencil size={12} /> Edit Name
            </button>
          </div>
        </div>
        
        <button 
          className="badge badge-neutral"
          onClick={onOpenParentReport}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', height: 'fit-content' }}
        >
          <BarChart3 size={14} /> Report
        </button>
      </div>

      {/* Hero Title */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: 'var(--color-info)', fontSize: '2.5rem', marginBottom: '8px' }}>Wordlist Quiz</h1>
        <p style={{ color: 'var(--color-text-secondary)', margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Learn new words through fun games!</p>
      </div>
      
      {/* Subject Selection */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        <h2 className="gs-section-title">Pick a Subject</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-sm)' }}>
          {wordlists.map(wl => {
            const subject = SUBJECTS[wl] || { name: wl, icon: BookOpen, color: 'esl' };
            const Icon = subject.icon;
            const isSelected = selectedWordlist === wl;
            return (
              <button 
                key={wl} 
                className="card"
                style={{ 
                  width: '100%', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: 'var(--space-sm)',
                  borderColor: isSelected ? 'var(--color-info)' : 'var(--color-border-default)',
                  background: isSelected ? '#EFF6FF' : 'white',
                  boxShadow: isSelected ? '0 8px 0 var(--color-info)' : '0 4px 0 var(--color-border-default)',
                  transform: isSelected ? 'translateY(-4px)' : 'none',
                  transition: 'all 0.2s'
                }}
                onClick={() => handleWordlistChange(wl)}
              >
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: 'var(--radius-md)', 
                  background: isSelected ? 'var(--color-info)' : 'var(--color-background-default)', 
                  color: isSelected ? 'white' : 'var(--color-info)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon size={24} strokeWidth={2.5} />
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>{subject.name}</span>
              </button>
            );
          })}
        </div>
      </div>



      {/* Game Options */}
      {wordlist && (
        <>
          {/* Game Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            <h2 className="gs-section-title">Choose Game</h2>
            <GameSelector
              selectedGame={selectedGame}
              onSelectGame={onSelectGame}
              gameStats={gameStats}
              selectedWordlist={selectedWordlist}
            />
          </div>

          {/* Unit Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            <div className="gs-units-header">
              <h2 className="gs-section-title" style={{ margin: 0 }}>Choose Units</h2>
              <button className="gs-select-all" onClick={handleSelectAll}>
                {allSelected ? <Square size={12} /> : <CheckSquare size={12} />}
                {allSelected ? 'Clear' : 'Select All'}
              </button>
            </div>
            <div className="gs-units-grid">
              {units.map(unit => {
                const isChecked = selectedUnits.includes(unit);
                return (
                  <button
                    key={unit}
                    className={`gs-unit-pill ${isChecked ? 'active' : ''}`}
                    onClick={() => {
                      if (isChecked) {
                        setSelectedUnits(selectedUnits.filter(u => u !== unit));
                      } else {
                        setSelectedUnits([...selectedUnits, unit]);
                      }
                    }}
                  >
                    {unit}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Count using Segmented Control strategy */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
            <h2 className="gs-section-title">How Many Words?</h2>
            <div className="segmented-control" style={{ maxWidth: '220px' }}>
              {[5, 10, 20].map(num => (
                <button
                  key={num}
                  className={`seg-btn ${numQuestions === num ? 'active' : ''}`}
                  style={{ flex: 1 }}
                  onClick={() => setNumQuestions(num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <button 
            className="btn btn-primary"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1.5rem', padding: 'var(--space-lg)' }}
            onClick={() => {
              const gameDef = GAMES.find(g => g.id === selectedGame);
              if (gameDef && gameDef.isGrammar) {
                startGrammarGame(selectedGame);
              } else {
                startQuiz();
              }
            }} 
            disabled={selectedUnits.length === 0}
          >
            <Play size={28} fill="currentColor" />
            <span>Play Now!</span>
          </button>
          
          {/* Recent History */}
          {history[selectedWordlist]?.length > 0 && (
            <div className="card" style={{ width: '100%', borderColor: 'var(--color-success)', background: '#F0FDF4', marginTop: 'var(--space-md)' }}>
              <h4 style={{ color: 'var(--color-success-hover)', marginTop: 0 }}>Recent Plays</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {history[selectedWordlist].slice(0, 3).map((res, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{new Date(res.date).toLocaleDateString()}</span>
                    <span style={{ color: 'var(--color-success)' }}>{res.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StartScreen;