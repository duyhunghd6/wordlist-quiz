import React from 'react';
import { ClipboardList, Search, Layers, Circle, Check, Lock, Keyboard } from 'lucide-react';
import { GAMES } from '../constants/gameConfig';
import './GameSelector.css';

const GAME_ICONS = {
  quiz: ClipboardList,
  typing: Keyboard,
  wordSearch: Search,
  swipe: Layers,
  bubble: Circle,
};

const GameSelector = ({ selectedGame, onSelectGame, gameStats }) => {
  return (
    <section className="game-selector">
      <h2>Choose a Game</h2>
      <div className="game-grid">
        {GAMES.map((game) => {
          const stats = gameStats?.[game.id] || { played: 0, bestScore: 0 };
          const isSelected = selectedGame === game.id;
          const isNew = stats.played === 0;
          const Icon = GAME_ICONS[game.id] || ClipboardList;

          return (
            <button
              key={game.id}
              className={`game-card ${isSelected ? 'selected' : ''} ${!game.available ? 'locked' : ''}`}
              onClick={() => game.available && onSelectGame(game.id)}
              disabled={!game.available}
              aria-label={game.available ? game.name : `${game.name} - Coming Soon`}
              aria-pressed={isSelected}
            >
              <div className="game-icon-wrapper">
                <Icon size={32} strokeWidth={2} />
                {isSelected && (
                  <span className="selected-badge">
                    <Check size={14} strokeWidth={3} />
                  </span>
                )}
                {!game.available && (
                  <span className="lock-badge">
                    <Lock size={14} strokeWidth={2.5} />
                  </span>
                )}
              </div>
              <span className="game-name">{game.name}</span>
              <span className="game-stat">
                {!game.available ? 'Soon' : isNew ? 'NEW!' : `Best: ${stats.bestScore}%`}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default GameSelector;
