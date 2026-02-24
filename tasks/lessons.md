# Lessons Learned

## Random Selection in Games and SRS

- **Mistake:** Using pure `Math.random()` over a small filtered array or creating a weighted pool without an "anti-repetition" filter causes words to loop consecutively.
- **Correction:** Always implement a "Recent Words Buffer" (e.g., track the last 5-10 words seen) and actively filter them out of the selection pool to guarantee variety. True Flashcard logic relies on drawing without replacement until a subset is exhausted, or using stringent cooldowns. This ensures a premium user experience without frustrating repetition.
