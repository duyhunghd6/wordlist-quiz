/**
 * Unbiased Fisher-Yates (Knuth) Shuffle
 * Returns a new shuffled array without mutating the original.
 * @param {Array} arr - The array to shuffle
 * @returns {Array} Shuffled copy of the array
 */
export function shuffleArray(arr) {
  if (!Array.isArray(arr) || arr.length <= 1) {
    return arr ? [...arr] : [];
  }
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
