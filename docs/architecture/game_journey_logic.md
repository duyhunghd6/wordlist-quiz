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
  - Each node dictates its ID, description, and an explicit array of `games` IDs denoting what games are unlocked.
- **`GAME_ICONS`**: A dictionary that maps game string names to pedagogical metadata (Phosphor React icons, theme colors, and visual tags).

<!-- unid-meta
unid: arch:wordlist-quiz:game-journey-categorization-filtering
fulfills: []
-->
## 2. Game Categorization & Filtering Architecture

The logic for how game categories are displayed is managed in three distinct layers within the dashboard modal:

### A. Exact Node-to-Game Mapping

At initialization, the entire `GAMES` dataset (imported from `gameConfig.js`) is used as a lookup dictionary. We no longer slice the games into massive buckets via boolean flags.

### B. Contextual Display (Inside the Game Selection Modal)

When a user clicks on an active node, the Bottom Sheet Game Modal explicitly maps over the `games` array defined within the `node` itself.

For example, if the active node contains `games: ["swipe", "quiz", "bubble"]`, the modal will only fetch and strictly render those 3 specific games. This isolates the pedagogical context and ensures a structured "journey" feel, preventing the user from being overwhelmed by the entire game roster at once.

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
