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
  { id: 'typing', emoji: '⌨️', name: 'Typing', available: true },
  { id: 'scramble', emoji: '🔀', name: 'Word Scramble', available: true },
  { id: 'wordSearch', emoji: '🔤', name: 'Word Search', available: true },
  { id: 'swipe', emoji: '👆', name: 'Swipe Cards', available: true },
  { id: 'bubble', emoji: '🫧', name: 'Bubble Pop', available: true },
  
  // Tense & Grammar Games
  { id: 'shapeBuilder', emoji: '🧩', name: 'Shape Builder', available: true, isGrammar: true },
  { id: 'timelineDetective', emoji: '🕵️', name: 'Timeline Detective', available: true, isGrammar: true },
  { id: 'photobomb', emoji: '📸', name: 'Photobomb', available: true, isGrammar: true },
  { id: 'marioTense', emoji: '🍄', name: 'Tense Runner', available: true, isGrammar: true },
  { id: 'tenseSignal', emoji: '🔍', name: 'Signal Spotter', available: true, isGrammar: true },
  { id: 'endlessRunner', emoji: '🏃', name: 'Word Runner', available: true, isGrammar: true },
  { id: 'angryTenses', emoji: '😠', name: 'Angry Tenses', available: true, isGrammar: true },

  // Science Games
  { id: 'scienceThinkQuiz', emoji: '🧪', name: 'Science Think Quiz', available: true, isScience: true },
  { id: 'scienceTrueFalseGame', emoji: '⚖️', name: 'Science True/False', available: true, isScience: true },
  { id: 'scienceMatchGame', emoji: '🧩', name: 'Science Match', available: true, isScience: true },

  // Math Games
  { id: 'math_weather_station', emoji: '🌦️', name: 'Math Weather Station', available: true, isMath: true },
  { id: 'math_mystery_safe', emoji: '🔐', name: 'Math Mystery Safe', available: true, isMath: true },
  { id: 'math_sorting_factory', emoji: '🏭', name: 'Math Sorting Factory', available: true, isMath: true },
  { id: 'math_data_cinema', emoji: '🎞️', name: 'Math Data Cinema', available: true, isMath: true }
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
