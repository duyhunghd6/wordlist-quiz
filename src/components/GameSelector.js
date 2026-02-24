import React from 'react';
import { ClipboardList, Search, Layers, Circle, Check, Lock, Keyboard, Blocks, History, Camera, Gamepad2, FastForward } from 'lucide-react';
import { GAMES } from '../constants/gameConfig';

const GAME_ICONS = {
  quiz: ClipboardList,
  typing: Keyboard,
  wordSearch: Search,
  swipe: Layers,
  bubble: Circle,
  shapeBuilder: Blocks,
  timelineDetective: History,
  photobomb: Camera,
  marioTense: Gamepad2,
  tenseSignal: Search,
  endlessRunner: FastForward
};

const GAME_COLORS = {
  quiz: '#3B82F6', // info
  typing: '#A855F7', // purple
  wordSearch: '#F59E0B', // accent
  swipe: '#EC4899', // pink
  bubble: '#10B981', // success
  shapeBuilder: '#3B82F6',
  timelineDetective: '#FBBF24',
  photobomb: '#EC4899',
  marioTense: '#22C55E',
  tenseSignal: '#A855F7',
  endlessRunner: '#14B8A6'
};

const GameSelector = ({ selectedGame, onSelectGame, gameStats, selectedWordlist }) => {
  const visibleGames = GAMES.filter(g => !g.isGrammar || (g.isGrammar && selectedWordlist === 'wordlist_esl'));

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {visibleGames.map((game) => {
        const stats = gameStats?.[game.id] || { played: 0, bestScore: 0 };
        const isSelected = selectedGame === game.id;
        const isNew = stats.played === 0;
        const Icon = GAME_ICONS[game.id] || ClipboardList;
        const color = GAME_COLORS[game.id] || '#A855F7';

        return (
          <button
            key={game.id}
            className={`game-selector-compact ${isSelected ? 'active' : ''} ${!game.available ? 'disabled' : ''}`}
            onClick={() => game.available && onSelectGame(game.id)}
            disabled={!game.available}
            aria-label={game.available ? game.name : `${game.name} - Coming Soon`}
            aria-pressed={isSelected}
            style={{ flex: '1 1 calc(33.333% - 8px)', minWidth: '90px', maxWidth: '140px' }}
          >
            <div className="compact-icon-bg compact-icon-sm" style={{ backgroundColor: !game.available ? 'var(--color-text-secondary)' : color }}>
              {isSelected && (
                <div style={{ position: 'absolute', top: -4, right: -4, background: 'white', color: 'var(--color-success)', borderRadius: '50%', padding: '1px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex' }}>
                  <Check size={12} strokeWidth={4} />
                </div>
              )}
              {isNew && game.available && !isSelected && (
                <div style={{ position: 'absolute', top: -4, right: -6, background: 'var(--color-danger)', color: 'white', fontSize: '8px', fontWeight: 'bold', borderRadius: 'var(--radius-full)', padding: '1px 4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  NEW
                </div>
              )}
              {!game.available && (
                <div style={{ position: 'absolute', top: -4, right: -4, background: 'white', color: 'var(--color-text-secondary)', borderRadius: '50%', padding: '1px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex' }}>
                  <Lock size={12} strokeWidth={3} />
                </div>
              )}
              <Icon size={18} color="white" strokeWidth={2.5} />
            </div>
            <span className="compact-label compact-label-sm" style={{ opacity: game.available ? 1 : 0.75 }}>
              {game.name.replace('Game', '').trim()}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default GameSelector;
