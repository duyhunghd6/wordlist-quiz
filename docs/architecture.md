# Wordlist Quiz Brownfield Enhancement Architecture

<!-- unid-meta
unid: arch:wordlist-quiz:brownfield-enhancement-introduction
fulfills: []
-->
## 1. Introduction

This document outlines the architectural approach for enhancing **Wordlist Quiz**. Its primary goal is to serve as the guiding architectural blueprint for AI-driven development, capturing the baseline presentation layer and core algorithm dependencies.

### Existing Project Analysis

- **Primary Purpose:** A gamified, mobile-first spaced repetition learning platform for children to master vocabulary through varied interactive modalities.
- **Current Tech Stack:** React 19.x (react-scripts SPA), Vanilla CSS, Howler.js, Hammer.js, Anime.js, and browser `localStorage`.
- **Architecture Style:** Client-side SPA with a unified "Presentation Layer" pattern (Game interfaces) wrapping a single "Core Learning Algorithm". No backend required.
- **Constraints:** Heavy reliance on a single monolithic `App.js` controller. Complex migrations between legacy `profile` structure and new `profiles` array. Game interfaces must adhere strictly to the shared unified `onAnswer(word, isCorrect, time)` callback contract to not break spaced-repetition metrics.

<!-- unid-meta
unid: arch:wordlist-quiz:brownfield-enhancement-tech-stack
fulfills: []
-->
## 2. Tech Stack

### Existing Technology Stack

| Category        | Current Technology | Version | Purpose                                                |
| --------------- | ------------------ | ------- | ------------------------------------------------------ |
| Runtime         | Browser DOM / Node | 16+     | Execution environment via Create React App bundle      |
| Framework       | React DOM          | 19.2.0  | Core UI and state management                           |
| Audio/Animation | Howler/Anime.js    | 2.2/4.3 | Interactive feedback hooks for core gameplay loop      |
| Storage         | localStorage       | Native  | Persists `learningData`, `gameHistory`, and `profiles` |

<!-- unid-meta
unid: arch:wordlist-quiz:brownfield-enhancement-component-architecture
fulfills: []
-->
## 3. Component Architecture

### Identified Core Components

1. **`App.js` State Controller**
   **Responsibility:** Orchestrates user sessions, toggles active Profile, dynamically loads JSON wordlists into memory, and swaps current game components based on state.
   **Integration Points:** Passes localized `words` slices to Games and receives performance reports (`onAnswer`, `onComplete`).
2. **`learningAlgorithm.js` (Weighted SM-2 Lite)**
   **Responsibility:** Receives response times and correctness boolean to penalize weights (up to 2.0x) or reward mastery (minimum 0.5x). Calculates temporally decayed review weights.
   **Integration Points:** Pure functional layer. `App.js` manages writing its output state back to `localStorage`.
3. **Pluggable Game Components (`src/components/*`)**
   **Responsibility:** Render interactive vocabulary tests (e.g. `SwipeCards`, `WordSearch`, `BubblePop`).
   **Integration Points:** Adheres to the unified `GameProps` interface. Emits local game state changes to the root component using `onAnswer`.

### Integration Boundaries

New games added to the system must NOT handle their own scoring internally aside from presentation. They act purely as decoupled views that relay correct/incorrect triggers to `App.js`, which then delegates algorithmic updates to `learningAlgorithm.js`.

<!-- unid-meta
unid: arch:wordlist-quiz:brownfield-enhancement-data-models-schema
fulfills: []
-->
## 4. Data Models and Schema

### Source Data Models

Data is statically queried from local JSON lists (`public/db/wordlist_*.json`), requiring components to handle fetching lifecycle explicitly.

```json
{
  "unit": "2.1",
  "word": "Freezing",
  "definition": "Extremely cold",
  "example": "It was freezing outside",
  "vietnamese": "Lạnh cóng"
}
```

### Persistence Models (localStorage)

The architecture pivots unconditionally around schema structures in local web storage. Any new feature must handle potential parse errors or schema migration correctly:

- **`learningData`**: `{ "version": 1, "WordKey": { "weight": 1.0, "interval": 1, ... } }`
- **Profiles**: Moving to array-based configuration (`useProfiles`).

<!-- unid-meta
unid: arch:wordlist-quiz:brownfield-enhancement-coding-standards
fulfills: []
-->
## 5. Coding Standards & Conventions

- **Component Prop Drilling:** Ensure clear functional contracts (`words`, `onAnswer`, `onComplete` mapped via props).
- **Hooks & State:** Side effects affecting `localStorage` should be corralled inside the available hooks (`src/hooks/useLocalStorage.js`), avoiding redundant scattered parsing calls.
- **Legacy Compatibility:** All updates touching profile logic MUST respect the presence of older `profile` keys fallback paths to avoid breaking active user dashboards.

<!-- unid-meta
unid: arch:wordlist-quiz:brownfield-enhancement-development-deployment
fulfills: []
-->
## 6. Development and Deployment

- **Setup:** Clone, `npm install`, `npm start` (Runs on Webpack Dev Server, port 3000).
- **Deployment:** Zero-config statically compiled bundle (`npm run build`). Deployable generically via simple file hosting services (Netlify, GH Pages, S3).
- **Testing:** Unit tests (Jest + RTL) are runnable via `npm test`. High value integration coverage is mostly manual, particularly on mobile viewports given touch interaction mechanics via Hammer.js.

<!-- unid-meta
unid: arch:wordlist-quiz:brownfield-enhancement-next-steps
fulfills: []
-->
## 7. Next Steps & Developer Handoff

When implementing new stories, developers should:

1. Review the `learningAlgorithm.js` weight penalty logic before implementing new game evaluation cycles to confirm they are emitting valid tracking data.
2. Ensure strict backwards compatibility for active profile users in storage.
3. Validate mobile responsiveness explicitly using browser emulated touch (via Hammer.js event bindings) to confirm UX fidelity.
