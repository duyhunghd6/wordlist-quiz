# Game Journey Component Logic & Categorization

This document explains the internal mechanics, component logic, and the game categorization filtering system inside the `GameJourney.js` component.

<!-- unid-meta
unid: arch:wordlist-quiz:game-journey-data-structure-state
fulfills: []
-->
## 1. Data Structure & State

The `GameJourney` component utilizes hardcoded structures to frame educational progression:
- **`SUBJECTS`**: Defines three core domains (`wordlist_esl`, `wordlist_math`, `wordlist_science`), mapping each to UI labels and icons.
- **`JOURNEY_DATA`**: The core pedagogical progression tree. Each domain contains:
  - An overarching `objective`.
  - An array of `nodes` representing progression checkpoints.
  - Each node dictates its ID, description, and an expected game `type` (`vocab`, `grammar`, `science`, or `both`).
- **`GAME_ICONS`**: A dictionary that maps game string names to pedagogical metadata (Phosphor React icons, theme colors, and visual tags).

<!-- unid-meta
unid: arch:wordlist-quiz:game-journey-categorization-filtering
fulfills: []
-->
## 2. Game Categorization & Filtering Architecture

The logic for how game categories are displayed is managed in three distinct layers within the dashboard modal:

### A. Data Filtering (The Master Lists)
At initialization, the entire `GAMES` dataset (imported from `gameConfig.js`) is sliced into four specific lists depending on boolean flags present on each game object:

```javascript
const vocabGames = GAMES.filter(g => !g.isGrammar && !g.isScience && !g.isMath);    // General vocabulary games
const grammarGames = GAMES.filter(g => g.isGrammar);                               // Strict grammar games
const scienceGames = GAMES.filter(g => g.isScience);                               // Strict science games
const mathGames = GAMES.filter(g => g.isMath);                                     // Strict math games
```

### B. Contextual Display (Inside the Game Selection Modal)
When a user clicks on an active node, the Bottom Sheet Game Modal uses **nested conditional logic** depending on the `currentSubjectKey` and the active `node.type` to display relevant bold headers and maps:

- **ESL Subject (`wordlist_esl`)**:
  - If node type is `"vocab"` or `"both"` -> Renders **Vocab Games** and displays `vocabGames`.
  - If node type is `"grammar"` or `"both"` -> Renders **Grammar Games** and displays `grammarGames`.
- **Science Subject (`wordlist_science`)**:
  - If node type is EXACTLY `"vocab"` -> Renders **Vocab Games** and displays `vocabGames`.
  - Universally renders **"🧪 Science Games"** and displays `scienceGames`.
- **Math Subject (`wordlist_math`)**:
  - If node type is `"vocab"` or `"both"` -> Renders **General Games** and displays `vocabGames`.
  - If node type is `"math"` or `"both"` -> Renders **"🧮 Math Arcade"** and displays `mathGames`.

Additionally, if a node's description array contains "coming soon", a visual placeholder indicating upcoming updates is automatically injected.

### C. Visual Categorization Factory (`renderGameCardRow`)
The visual representation of a game, including its color scheme and pedagogical flair, is uniquely dictated by the `renderGameCardRow(g)` factory. This factory:
1. Performs a string-matching lookup of the game's name inside the `GAME_ICONS` dictionary.
2. Injects a dynamically referenced `Phosphor React` icon.
3. Overrides the default CSS color via specific token classes (e.g., `gs-bg-blue`, `gs-bg-purple`).
4. Iterates through the predefined string tags (e.g., `["Math", "Pairs"]`) and renders them as pill badges beneath the title.
5. If a game is missing from the dictionary, it defaults safely to the "Quiz" styling.

<!-- unid-meta
unid: arch:wordlist-quiz:game-journey-map-drawing-strategy
fulfills: []
-->
## 3. Map Drawing Strategy
- Uses a `useEffect` wrapped `getBoundingClientRect()` calculation against the rendered DOM nodes.
- Extracts an SVG `path` built entirely utilizing Bezier Curves (`C`) spanning from the geometric centers of the `locked`, `active`, and `completed` nodes.
- Dynamically attaches an overlapping green `completedPathD` stroke for nodes flagged as `completed` simulating forward progress.
