import React, { useState } from 'react';
import { 
  Trophy, BookOpen, Target, FileText, 
  ClipboardList, Search, Layers, Circle, 
  X, ArrowLeft, Clock, Zap 
} from 'lucide-react';
import { getLearningStats } from '../learningAlgorithm';
import { GAMES } from '../constants/gameConfig';
import ActivityHeatmap from './ActivityHeatmap';
import './ParentReport.css';

const GAME_ICONS = {
  quiz: ClipboardList,
  wordSearch: Search,
  swipe: Layers,
  bubble: Circle,
};

const ParentReport = ({ 
  profile, 
  avatar, 
  learningData, 
  gameStats, 
  gameHistory, 
  activityLog,
  onClose 
}) => {
  const stats = getLearningStats(learningData);
  
  const wordDetails = Object.entries(learningData)
    .filter(([key]) => key !== 'version')
    .map(([word, data]) => ({
      word,
      ...data,
      status: data.weight <= 0.7 ? 'mastered' : data.weight >= 4 ? 'struggling' : 'learning'
    }))
    .sort((a, b) => b.weight - a.weight);

  const totalGamesPlayed = Object.values(gameStats || {})
    .reduce((sum, g) => sum + (g.played || 0), 0);

  const progressPercent = stats.totalWords > 0 
    ? Math.round((stats.mastered / stats.totalWords) * 100) 
    : 0;

  const [showAllWords, setShowAllWords] = useState(false);

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--color-overlay)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div 
        className="card shadow-lg"
        style={{ width: '100%', maxWidth: '800px', height: '90vh', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: 'var(--color-bg-base)' }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <header style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--color-border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <span className="avatar avatar-md">{avatar?.emoji || '🐼'}</span>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--color-text-primary)' }}>{profile?.name || 'Student'}'s Progress</h1>
              <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>Learning Report</p>
            </div>
          </div>
          <button className="btn btn-icon" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2xl)' }}>
          {/* Progress Ring */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 'var(--space-lg)' }}>
            <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-border-default)" strokeWidth="8" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="42"
                  fill="none"
                  stroke="var(--color-success)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${progressPercent * 2.64} 264`}
                  style={{ transition: 'stroke-dasharray 1s ease-out' }}
                />
              </svg>
              <div style={{ zIndex: 1, textAlign: 'center' }}>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)', display: 'block' }}>{progressPercent}%</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mastered</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-md)', '@media (min-width: 600px)': { gridTemplateColumns: 'repeat(4, 1fr)' } }}>
            <div className="card shadow-sm" style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <Trophy size={28} color="var(--color-success)" style={{ marginBottom: 'var(--space-xs)' }} />
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{stats.mastered}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Mastered</span>
            </div>
            <div className="card shadow-sm" style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <BookOpen size={28} color="var(--color-info)" style={{ marginBottom: 'var(--space-xs)' }} />
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{stats.learning}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Learning</span>
            </div>
            <div className="card shadow-sm" style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
              <Target size={28} color="var(--color-danger)" style={{ marginBottom: 'var(--space-xs)' }} />
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{stats.struggling}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Practice</span>
            </div>
            <div className="card shadow-sm" style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', backgroundColor: 'white' }}>
              <FileText size={28} color="var(--color-text-secondary)" style={{ marginBottom: 'var(--space-xs)' }} />
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{stats.totalWords}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Total</span>
            </div>
          </div>

          {/* Games Played */}
          <section>
            <h2 style={{ fontSize: '1.2rem', margin: '0 0 var(--space-md) 0' }}>Games Played</h2>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', overflowX: 'auto', paddingBottom: 'var(--space-sm)', scrollbarWidth: 'none' }}>
              {GAMES.filter(g => g.available).map(game => {
                const gameStat = gameStats?.[game.id] || { played: 0, bestScore: 0 };
                const Icon = GAME_ICONS[game.id] || ClipboardList;
                return (
                  <div key={game.id} className="card shadow-sm" style={{ minWidth: '100px', flex: 1, padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--color-bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)' }}>
                      <Icon size={20} />
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{game.name}</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text-secondary)' }}>{gameStat.played}x</span>
                  </div>
                );
              })}
            </div>
            <p style={{ margin: 'var(--space-xs) 0 0 0', fontSize: '0.9rem', color: 'var(--color-text-secondary)', textAlign: 'center', fontWeight: 600 }}>{totalGamesPlayed} total sessions played</p>
          </section>

          {/* Activity Heatmap */}
          <ActivityHeatmap activityLog={activityLog} />

          {/* Word Progress */}
          <section>
            <h2 style={{ fontSize: '1.2rem', margin: '0 0 var(--space-md) 0' }}>Word Progress</h2>
            {wordDetails.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--space-sm)' }}>
                {(showAllWords ? wordDetails : wordDetails.slice(0, 20)).map(word => {
                  
                  let borderCol = 'var(--color-border-default)';
                  let bgCol = 'white';
                  if (word.status === 'mastered') { borderCol = '#86EFAC'; bgCol = '#F0FDF4'; }
                  else if (word.status === 'struggling') { borderCol = '#FCA5A5'; bgCol = '#FEF2F2'; }
                  else if (word.status === 'learning') { borderCol = '#93C5FD'; bgCol = '#EFF6FF'; }

                  return (
                    <div key={word.word} className="card" style={{ padding: 'var(--space-sm)', border: `1px solid ${borderCol}`, backgroundColor: bgCol, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--color-text-primary)' }}>{word.word}</span>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B' }}>
                          <Zap size={12} />
                          {word.correctStreak || 0}
                        </span>
                        {word.avgResponseTime && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} />
                            {(word.avgResponseTime / 1000).toFixed(1)}s
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="card shadow-sm" style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <p>Start playing to track your progress!</p>
              </div>
            )}
            
            {wordDetails.length > 20 && (
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', marginTop: 'var(--space-md)' }}
                onClick={() => setShowAllWords(!showAllWords)}
              >
                {showAllWords ? 'Show Less' : `Show ${wordDetails.length - 20} More Words`}
              </button>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer style={{ padding: 'var(--space-md) var(--space-xl)', borderTop: '1px solid var(--color-border-default)', backgroundColor: 'white' }}>
          <button className="btn btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={onClose}>
            <ArrowLeft size={20} />
            <span>Back to Games</span>
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ParentReport;
