# Lessons Learned

## Random Selection in Games and SRS

- **Mistake:** Using pure `Math.random()` over a small filtered array or creating a weighted pool without an "anti-repetition" filter causes words to loop consecutively.
- **Correction:** Always implement a "Recent Words Buffer" (e.g., track the last 5-10 words seen) and actively filter them out of the selection pool to guarantee variety. True Flashcard logic relies on drawing without replacement until a subset is exhausted, or using stringent cooldowns. This ensures a premium user experience without frustrating repetition.

## Hardcoded UI Renderers and String Parsing Antipatterns

- **Mistake:** Building feature-specific dynamic parser logic directly inside React components to map UI labels to arbitrary string IDs (e.g. `sub.split(",").map(gameName => gameName.toLowerCase().replace(" ", "_"))`) while skipping the app's established truth arrays (like a generic `GAMES` registry or standard `App.js` casing conventions). This breaks generalizability and strips access to generic global features (like "Quiz").
- **Correction:** When given a source format containing IDs like `M1` or `M1_L1`, DO NOT pipe these IDs verbatim into the user-facing UI unless explicitly told to. Respect the project's established conventions; new UI views for "Math" should use the same logical `type` routing arrays (`vocabGames`, `mathGames`) and the `GAME_ICONS` registry pattern as "Science" and "ESL" instead of inventing a hacky string-replace mapping. Always add new game implementations cleanly into the main configuration single source of truth (`gameConfig.js`).
