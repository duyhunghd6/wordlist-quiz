/**
 * Avatar definitions for kid profile selection
 */

export const AVATARS = [
  { id: 'lion', emoji: '🦁', name: 'Leo' },
  { id: 'panda', emoji: '🐼', name: 'Panda' },
  { id: 'fox', emoji: '🦊', name: 'Foxy' },
  { id: 'frog', emoji: '🐸', name: 'Hoppy' },
  { id: 'cat', emoji: '🐱', name: 'Kitty' },
  { id: 'dog', emoji: '🐶', name: 'Buddy' },
  { id: 'bunny', emoji: '🐰', name: 'Bunny' },
  { id: 'bear', emoji: '🐻', name: 'Bear' },
  { id: 'unicorn', emoji: '🦄', name: 'Sparkle' },
  { id: 'koala', emoji: '🐨', name: 'Koala' }
];

export const GAMES = [
  { id: 'quiz', emoji: '📝', name: 'Quiz', available: true },
  { id: 'wordSearch', emoji: '🔤', name: 'Word Search', available: true },
  { id: 'swipe', emoji: '👆', name: 'Swipe Cards', available: true },
  { id: 'bubble', emoji: '🫧', name: 'Bubble Pop', available: true }
];

export const DEFAULT_PREFERENCES = {
  lastSubject: '',
  lastUnits: [],
  lastQuestionCount: 10,
  lastGame: 'quiz'
};

export const DEFAULT_PROFILE = {
  name: '',
  avatar: 'panda',
  createdAt: null
};

export function getAvatarById(id) {
  return AVATARS.find(a => a.id === id) || AVATARS[1]; // Default to panda
}

export function getGameById(id) {
  return GAMES.find(g => g.id === id) || GAMES[0]; // Default to quiz
}
