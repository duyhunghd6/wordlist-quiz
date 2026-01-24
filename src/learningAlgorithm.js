/**
 * Weighted SM-2 Lite Learning Algorithm
 * 
 * A spaced repetition algorithm that considers:
 * - Response time (quick answers indicate mastery)
 * - Bidirectional weight adjustment (correct reduces, wrong increases)
 * - Temporal decay (words not reviewed recently increase in priority)
 * - Streak bonuses (consecutive correct answers accelerate mastery)
 */

// Constants
const QUICK_THRESHOLD_MS = 3000;  // 3 seconds - answers faster than this are "quick"
const MIN_WEIGHT = 0.5;           // Minimum selection weight
const MAX_WEIGHT = 8.0;           // Maximum selection weight
const MIN_EASE_FACTOR = 1.3;      // Minimum ease factor
const MAX_EASE_FACTOR = 2.5;      // Maximum ease factor
const MAX_INTERVAL = 365;         // Maximum days between reviews

/**
 * Create default learning data for a new word
 * @param {string} word - The word to create data for
 * @returns {Object} Default learning data structure
 */
export function createDefaultLearning(word) {
  return {
    word,
    weight: 1.0,           // Selection probability (0.5 - 8.0)
    interval: 1,           // Days until next review (1 - 365)
    easeFactor: 2.5,       // Difficulty modifier (1.3 - 2.5)
    lastReviewed: null,    // Timestamp (ms)
    reviewCount: 0,        // Total reviews
    correctStreak: 0,      // Consecutive correct answers
    avgResponseTime: 0     // Rolling average in ms
  };
}

/**
 * Update word learning data based on answer result
 * @param {Object} wordData - Current learning data for the word
 * @param {boolean} isCorrect - Whether the answer was correct
 * @param {number} responseTimeMs - Time taken to answer in milliseconds
 * @returns {Object} Updated learning data
 */
export function updateWordLearning(wordData, isCorrect, responseTimeMs) {
  // Clone to avoid mutation
  const updated = { ...wordData };
  
  if (isCorrect) {
    updated.correctStreak++;
    
    if (responseTimeMs < QUICK_THRESHOLD_MS) {
      // Quick correct = strong mastery signal
      updated.weight = Math.max(MIN_WEIGHT, updated.weight * 0.6);
      updated.interval = Math.min(MAX_INTERVAL, updated.interval * 2.5);
      updated.easeFactor = Math.min(MAX_EASE_FACTOR, updated.easeFactor + 0.1);
    } else {
      // Slow correct = needs reinforcement but still progress
      updated.weight = Math.max(MIN_WEIGHT, updated.weight * 0.8);
      updated.interval = Math.min(MAX_INTERVAL, updated.interval * 1.5);
    }
    
    // Streak bonus: additional weight reduction for long streaks
    if (updated.correctStreak >= 3) {
      updated.weight = Math.max(MIN_WEIGHT, updated.weight * 0.9);
    }
  } else {
    // Wrong answer = reset progress
    updated.correctStreak = 0;
    updated.weight = Math.min(MAX_WEIGHT, updated.weight * 2);
    updated.interval = 1;
    updated.easeFactor = Math.max(MIN_EASE_FACTOR, updated.easeFactor - 0.2);
  }
  
  // Update metadata
  updated.lastReviewed = Date.now();
  updated.reviewCount++;
  
  // Rolling average for response time (70% old, 30% new)
  updated.avgResponseTime = updated.avgResponseTime 
    ? Math.round(updated.avgResponseTime * 0.7 + responseTimeMs * 0.3)
    : responseTimeMs;
    
  return updated;
}

/**
 * Calculate effective weight considering temporal decay (forgetting curve)
 * Words not reviewed recently should increase in priority
 * @param {Object} wordData - Learning data for the word
 * @returns {number} Effective weight for selection
 */
export function calculateEffectiveWeight(wordData) {
  if (!wordData || !wordData.lastReviewed) {
    return wordData?.weight || 1.0;
  }
  
  const daysSinceReview = (Date.now() - wordData.lastReviewed) / (1000 * 60 * 60 * 24);
  const overdueFactor = daysSinceReview / wordData.interval;
  
  if (overdueFactor > 1) {
    // Overdue - increase weight based on how overdue (logarithmic scale)
    return Math.min(MAX_WEIGHT, wordData.weight * (1 + Math.log(overdueFactor)));
  }
  
  return wordData.weight;
}

/**
 * Select words for review using weighted random selection
 * Prioritizes: overdue words, recently failed words, new words
 * @param {Array} allWords - All available words from the wordlist
 * @param {Object} learningData - Learning data keyed by word
 * @param {number} count - Number of words to select
 * @returns {Array} Selected words for the quiz
 */
export function getWordsForReview(allWords, learningData, count) {
  const now = Date.now();
  
  // Score each word for priority
  const scoredWords = allWords.map(word => {
    const data = learningData[word.word] || createDefaultLearning(word.word);
    const effectiveWeight = calculateEffectiveWeight(data);
    
    // Priority score: higher = more likely to be selected
    let priority = effectiveWeight;
    
    // Boost new words slightly (never reviewed)
    if (data.reviewCount === 0) {
      priority *= 1.5;
    }
    
    // Boost overdue words significantly
    if (data.lastReviewed) {
      const daysSince = (now - data.lastReviewed) / (1000 * 60 * 60 * 24);
      if (daysSince > data.interval) {
        priority *= 2;
      }
    }
    
    return { word, priority, data };
  });
  
  // Weighted random selection without replacement
  return weightedRandomSelect(scoredWords, count);
}

/**
 * Weighted random selection without replacement
 * @param {Array} scoredWords - Words with priority scores
 * @param {number} count - Number to select
 * @returns {Array} Selected word objects
 */
function weightedRandomSelect(scoredWords, count) {
  const selected = [];
  const remaining = [...scoredWords];
  
  while (selected.length < count && remaining.length > 0) {
    // Calculate total weight
    const totalWeight = remaining.reduce((sum, item) => sum + item.priority, 0);
    
    // Random selection
    let random = Math.random() * totalWeight;
    let selectedIndex = 0;
    
    for (let i = 0; i < remaining.length; i++) {
      random -= remaining[i].priority;
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }
    
    // Move selected word from remaining to selected
    const [selectedItem] = remaining.splice(selectedIndex, 1);
    selected.push(selectedItem.word);
  }
  
  return selected;
}

/**
 * Migrate legacy wordWeights format to new learningData format
 * @param {Object} oldWeights - Old format { word: weight }
 * @returns {Object} New format with full learning data
 */
export function migrateLegacyWeights(oldWeights) {
  // If already migrated or empty, return with version marker
  if (!oldWeights || Object.keys(oldWeights).length === 0) {
    return { version: 1 };
  }
  
  // If already has version, it's already migrated
  if (oldWeights.version) {
    return oldWeights;
  }
  
  const migrated = { version: 1 };
  
  for (const [word, weight] of Object.entries(oldWeights)) {
    migrated[word] = {
      word,
      weight: weight,
      interval: weight > 1 ? 1 : 3, // High weight words need more review
      easeFactor: 2.5,
      lastReviewed: null,
      reviewCount: 0,
      correctStreak: 0,
      avgResponseTime: 0
    };
  }
  
  return migrated;
}

/**
 * Get learning statistics for display
 * @param {Object} learningData - All learning data
 * @returns {Object} Statistics object
 */
export function getLearningStats(learningData) {
  const words = Object.entries(learningData)
    .filter(([key]) => key !== 'version')
    .map(([, data]) => data);
  
  if (words.length === 0) {
    return {
      totalWords: 0,
      mastered: 0,
      learning: 0,
      struggling: 0,
      avgResponseTime: 0
    };
  }
  
  const mastered = words.filter(w => w.weight <= 0.7 && w.correctStreak >= 3).length;
  const struggling = words.filter(w => w.weight >= 4).length;
  const learning = words.length - mastered - struggling;
  
  const avgResponseTime = words.reduce((sum, w) => sum + (w.avgResponseTime || 0), 0) / words.length;
  
  return {
    totalWords: words.length,
    mastered,
    learning,
    struggling,
    avgResponseTime: Math.round(avgResponseTime)
  };
}
