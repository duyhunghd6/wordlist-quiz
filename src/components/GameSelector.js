import React from 'react';
import { ClipboardList, Search, Layers, Circle, Check, Lock, Keyboard, ChevronRight } from 'lucide-react';
import { GAMES } from '../constants/gameConfig';

const GAME_ICONS = {
  quiz: ClipboardList,
  typing: Keyboard,
  wordSearch: Search,
  swipe: Layers,
  bubble: Circle,
};

const GAME_COLORS = {
  quiz: '#3B82F6', // info
  typing: '#A855F7', // purple
  wordSearch: '#F59E0B', // accent
  swipe: '#EC4899', // pink
  bubble: '#10B981', // success
};

const GameSelector = ({ selectedGame, onSelectGame, gameStats }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      {GAMES.map((game) => {
        const stats = gameStats?.[game.id] || { played: 0, bestScore: 0 };
        const isSelected = selectedGame === game.id;
        const isNew = stats.played === 0;
        const Icon = GAME_ICONS[game.id] || ClipboardList;
        const color = GAME_COLORS[game.id] || '#A855F7';

        return (
          <button
            key={game.id}
            className="game-selector-card"
            style={{ 
              width: '100%', 
              maxWidth: '100%', 
              opacity: game.available ? 1 : 0.6,
              cursor: game.available ? 'pointer' : 'not-allowed',
              borderColor: isSelected ? 'var(--color-info)' : 'var(--color-border-default)',
              boxShadow: isSelected ? 'var(--shadow-bouncy)' : 'var(--shadow-sm)'
            }}
            onClick={() => game.available && onSelectGame(game.id)}
            disabled={!game.available}
            aria-label={game.available ? game.name : `${game.name} - Coming Soon`}
            aria-pressed={isSelected}
          >
            <div className="game-icon-bg" style={{ background: color }}>
              <Icon size={28} color="white" strokeWidth={2.5} />
            </div>
            
            <div className="game-info">
              <h4>{game.name}</h4>
              <p>{!game.available ? 'Coming Soon' : isNew ? '✨ New Game!' : `Best Score: ${stats.bestScore}%`}</p>
            </div>
            
            <div className="game-meta">
              {isSelected ? (
                <div style={{ background: 'var(--color-info)', color: 'white', borderRadius: '50%', padding: '4px' }}>
                  <Check size={16} strokeWidth={4} />
                </div>
              ) : !game.available ? (
                <Lock size={20} color="var(--color-text-secondary)" />
              ) : (
                <ChevronRight size={24} color="var(--color-text-secondary)" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default GameSelector;
