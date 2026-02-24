import React, { useState } from 'react';
import { 
  Trophy, Target, 
  ClipboardList, Search, Layers, Circle, 
  X, ArrowLeft, Clock, Flame, Keyboard
} from 'lucide-react';
import { getLearningStats } from '../learningAlgorithm';
import { GAMES } from '../constants/gameConfig';
import ActivityHeatmap from './ActivityHeatmap';
import EmptyState from './EmptyState';
import './ParentReport.css';

const GAME_ICONS = {
  quiz: ClipboardList,
  typing: Keyboard,
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
  const [showAllBest, setShowAllBest] = useState(false);
  const [showAllWorst, setShowAllWorst] = useState(false);
  const [showAllImproved, setShowAllImproved] = useState(false);
  
  const wordDetails = Object.entries(learningData)
    .filter(([key]) => key !== 'version')
    .map(([word, data]) => ({
      word,
      ...data,
      status: data.weight <= 0.7 ? 'mastered' : data.weight >= 4 ? 'struggling' : 'learning'
    }));

  const totalGamesPlayed = Object.values(gameStats || {})
    .reduce((sum, g) => sum + (g.played || 0), 0);

  // Compute day streak from activityLog
  const computeDayStreak = () => {
    if (!activityLog || Object.keys(activityLog).length === 0) return 0;
    const today = new Date();
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (activityLog[key]) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  };

  const dayStreak = computeDayStreak();

  // Compute total study time estimate (sessions * ~3 min average)
  const totalMinutes = totalGamesPlayed * 3;
  const totalTimeStr = totalMinutes >= 60 
    ? `${(totalMinutes / 60).toFixed(1)}h` 
    : `${totalMinutes}m`;

  // Word lists
  const worstWords = [...wordDetails].filter(w => w.weight >= 2.5).sort((a, b) => b.weight - a.weight);
  const bestWords = [...wordDetails].filter(w => w.weight <= 1.0).sort((a, b) => a.weight - b.weight);
  const improvedWords = [...wordDetails].filter(w => (w.reviewCount || 0) > 0).sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));

  const renderDots = (word) => {
    const total = 4;
    const correct = Math.min(word.correctStreak || 0, total);
    return (
      <div className="word-score">
        {Array.from({ length: total }, (_, i) => {
          let cls = 'w-dot';
          if (word.status === 'struggling') {
            cls += i < correct ? ' filled' : (i < (word.reviewCount || 0) && i >= correct) ? ' struggle' : '';
          } else if (word.status === 'mastered') {
            cls += ' filled';
          } else {
            cls += i < correct ? ' learning' : '';
          }
          return <div key={i} className={cls} />;
        })}
      </div>
    );
  };

  const renderWordRow = (word) => (
    <div key={word.word} className="word-row">
      <span className="word-term">{word.word}</span>
      {renderDots(word)}
    </div>
  );

  const displayWorst = showAllWorst ? worstWords : worstWords.slice(0, 5);
  const displayBest = showAllBest ? bestWords : bestWords.slice(0, 5);
  const displayImproved = showAllImproved ? improvedWords : improvedWords.slice(0, 5);

  return (
    <div className="pr-overlay" onClick={onClose}>
      <div className="pr-container" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="dash-header">
          <h3>Parental Controls</h3>
          <button className="btn-close-circle" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="dash-content">
          {/* Stat Bento Grid */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-icon"><Flame size={24} color="var(--color-accent)" /></div>
              <div className="stat-val">{dayStreak}</div>
              <div className="stat-label">Day Streak</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><Clock size={24} color="var(--color-info)" /></div>
              <div className="stat-val">{totalTimeStr}</div>
              <div className="stat-label">Total Time</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><Trophy size={24} color="var(--color-success)" /></div>
              <div className="stat-val">{stats.mastered}</div>
              <div className="stat-label">Words Mastered</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon"><Target size={24} color="var(--color-danger)" /></div>
              <div className="stat-val">{stats.struggling}</div>
              <div className="stat-label">Need Practice</div>
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className="dash-section" style={{ padding: 0, overflow: 'hidden', flexShrink: 0 }}>
            <ActivityHeatmap activityLog={activityLog} />
          </div>

          {/* Worst Words */}
          {worstWords.length > 0 && (
            <div className="dash-section">
              <h4 className="dash-section-title">Worst Words Result</h4>
              {displayWorst.map(renderWordRow)}
              {worstWords.length > 5 && (
                <button 
                  className="view-more-btn" 
                  onClick={() => setShowAllWorst(!showAllWorst)}
                >
                  {showAllWorst ? 'Show Less' : `View ${worstWords.length - 5} More`}
                </button>
              )}
            </div>
          )}

          {/* Best Words */}
          {bestWords.length > 0 && (
            <div className="dash-section">
              <h4 className="dash-section-title">Best Words</h4>
              {displayBest.map(renderWordRow)}
              {bestWords.length > 5 && (
                <button 
                  className="view-more-btn" 
                  onClick={() => setShowAllBest(!showAllBest)}
                >
                  {showAllBest ? 'Show Less' : `View ${bestWords.length - 5} More`}
                </button>
              )}
            </div>
          )}

          {/* Improved Words */}
          {improvedWords.length > 0 && (
            <div className="dash-section">
              <h4 className="dash-section-title">Words That Improved (Times Solved)</h4>
              {displayImproved.map(renderWordRow)}
              {improvedWords.length > 5 && (
                <button 
                  className="view-more-btn" 
                  onClick={() => setShowAllImproved(!showAllImproved)}
                >
                  {showAllImproved ? 'Show Less' : `View ${improvedWords.length - 5} More`}
                </button>
              )}
            </div>
          )}

          {/* Games Played */}
          <div className="dash-section">
            <h4 className="dash-section-title">Games Played</h4>
            <div className="games-row">
              {GAMES.filter(g => g.available).map(game => {
                const gameStat = gameStats?.[game.id] || { played: 0, bestScore: 0 };
                const Icon = GAME_ICONS[game.id] || ClipboardList;
                return (
                  <div key={game.id} className="game-stat-card">
                    <div className="game-stat-icon">
                      <Icon size={16} />
                    </div>
                    <span className="game-stat-name">{game.name.replace('Game', '').trim()}</span>
                    <span className="game-stat-count">{gameStat.played}x</span>
                  </div>
                );
              })}
            </div>
            <p className="section-label">{totalGamesPlayed} total sessions</p>
          </div>

          {/* Empty state */}
          {wordDetails.length === 0 && (
            <div className="dash-section" style={{ padding: 'var(--space-md) 0' }}>
              <EmptyState 
                icon={Search} 
                title="No Data Yet" 
                message="Start playing games to track your vocabulary progress!" 
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pr-footer">
          <button className="btn btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} onClick={onClose}>
            <ArrowLeft size={20} />
            <span>Back to Games</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParentReport;
