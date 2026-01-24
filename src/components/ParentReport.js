import React from 'react';
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
  
  // Get word details for display
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

  // Calculate progress percentage
  const progressPercent = stats.totalWords > 0 
    ? Math.round((stats.mastered / stats.totalWords) * 100) 
    : 0;

  return (
    <div className="report-overlay" onClick={onClose}>
      <div className="report-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <header className="report-header">
          <div className="header-profile">
            <span className="report-avatar">{avatar?.emoji || '🐼'}</span>
            <div className="header-text">
              <h1>{profile?.name || 'Student'}'s Progress</h1>
              <p>Learning Report</p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            <X size={24} />
          </button>
        </header>

        <div className="report-content">
          {/* Progress Ring */}
          <div className="progress-hero">
            <div className="progress-ring-container">
              <svg viewBox="0 0 100 100" className="progress-ring">
                <circle className="progress-ring-bg" cx="50" cy="50" r="42" />
                <circle 
                  className="progress-ring-fill" 
                  cx="50" 
                  cy="50" 
                  r="42"
                  strokeDasharray={`${progressPercent * 2.64} 264`}
                />
              </svg>
              <div className="progress-ring-text">
                <span className="progress-percent">{progressPercent}%</span>
                <span className="progress-label">Mastered</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card mastered">
              <Trophy size={24} />
              <span className="stat-value">{stats.mastered}</span>
              <span className="stat-label">Mastered</span>
            </div>
            <div className="stat-card learning">
              <BookOpen size={24} />
              <span className="stat-value">{stats.learning}</span>
              <span className="stat-label">Learning</span>
            </div>
            <div className="stat-card struggling">
              <Target size={24} />
              <span className="stat-value">{stats.struggling}</span>
              <span className="stat-label">Practice</span>
            </div>
            <div className="stat-card total">
              <FileText size={24} />
              <span className="stat-value">{stats.totalWords}</span>
              <span className="stat-label">Total</span>
            </div>
          </div>

          {/* Games Played */}
          <section className="report-section">
            <h2>Games Played</h2>
            <div className="games-strip">
              {GAMES.filter(g => g.available).map(game => {
                const gameStat = gameStats?.[game.id] || { played: 0, bestScore: 0 };
                const Icon = GAME_ICONS[game.id] || ClipboardList;
                return (
                  <div key={game.id} className="game-mini-card">
                    <div className="game-mini-icon">
                      <Icon size={20} />
                    </div>
                    <span className="game-mini-name">{game.name}</span>
                    <span className="game-mini-played">{gameStat.played}x</span>
                  </div>
                );
              })}
            </div>
            <p className="total-sessions">{totalGamesPlayed} total sessions</p>
          </section>

          {/* Activity Heatmap */}
          <ActivityHeatmap activityLog={activityLog} />

          {/* Word Cards - Replace boring table */}
          <section className="report-section">
            <h2>Word Progress</h2>
            {wordDetails.length > 0 ? (
              <div className="word-cards-grid">
                {wordDetails.slice(0, 20).map(word => (
                  <div key={word.word} className={`word-card status-${word.status}`}>
                    <span className="word-text">{word.word}</span>
                    <div className="word-meta">
                      <span className="word-streak">
                        <Zap size={12} />
                        {word.correctStreak || 0}
                      </span>
                      {word.avgResponseTime && (
                        <span className="word-time">
                          <Clock size={12} />
                          {(word.avgResponseTime / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Start playing to track your progress!</p>
              </div>
            )}
            {wordDetails.length > 20 && (
              <p className="more-words">+ {wordDetails.length - 20} more words</p>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer className="report-footer">
          <button className="back-btn" onClick={onClose}>
            <ArrowLeft size={20} />
            <span>Back to Games</span>
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ParentReport;
