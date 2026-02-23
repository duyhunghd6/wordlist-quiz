# Wordlist Quiz Brownfield Architecture Document

## Introduction

This document captures the CURRENT STATE of the Wordlist Quiz codebase, including technical debt, workarounds, and real-world patterns. It serves as a reference for AI agents and developers working on enhancements.

### Document Scope

Comprehensive documentation of the entire system as it currently exists. The project is an open-source, mobile-first React web application utilizing spaced-repetition algorithms.

### Change Log

| Date       | Version | Description                 | Author                      |
| ---------- | ------- | --------------------------- | --------------------------- |
| 2026-02-23 | 1.0     | Initial brownfield analysis | Antigravity (Agile Analyst) |

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Main Entry**: `src/index.js` and `src/App.js`
- **Core Learning Algorithm**: `src/learningAlgorithm.js`
- **Game Component Registry**: `src/components/games/` (Note: Actually exists flattened within `src/components/`, e.g., `src/components/Quiz.js`, `src/components/WordSearch.js`)
- **JSON Data Content**: `public/db/wordlist_*.json` (Static vocabulary databases)

## High Level Architecture

### Technical Summary

The application is a pure client-side React Single Page Application (SPA). It has no dedicated backend service.

- **Presentation Layer**: Wrappers ("Games") that supply a unified learning mechanism with an interactive format.
- **Learning Engine Layer**: The `Weighted SM-2 Lite` algorithm shared across the platform.
- **Data Layer**: Static JSON for vocabulary (fetched on demand). Browser `localStorage` for all user states and tracking.

### Actual Tech Stack (from package.json)

| Category   | Technology    | Version | Notes                                                   |
| ---------- | ------------- | ------- | ------------------------------------------------------- |
| Runtime    | Node.js       | 16+     | Expected based on typical Create React App environments |
| Framework  | React         | 19.2.0  | Single Page App, created via build context              |
| Build Tool | react-scripts | 5.0.1   | Standard CRA                                            |
| Styling    | CSS           | Vanilla | `index.css`, component-bound `.css` files               |
| Database   | localStorage  | N/A     | unified per-word tracking stored client-side            |

### Repository Structure Reality Check

- Type: Monorepo (Single frontend client)
- Package Manager: npm
- Notable: Word lists are pulled from `/public/db/` statically rather than through an API layer.

## Source Tree and Module Organization

### Project Structure (Actual)

```text
root/
├── public/
│   └── db/
│       ├── wordlist_esl.json      # ESL vocabulary (173 words across 5 units)
│       ├── wordlist_math.json     # Math vocabulary
│       └── wordlist_science.json  # Science vocabulary
├── src/
│   ├── components/                # React UI Components and all Game views
│   │   ├── Quiz.js                # Game: Multiple Choice (Reference implementation)
│   │   ├── WordSearch.js          # Game: Word Search Matrix
│   │   ├── SwipeCards.js          # Game: Swipe Cards (Tinder-style)
│   │   ├── BubblePop.js           # Game: Bubble Pop
│   │   ├── TypingQuiz.js          # Game: Typing Recall
│   │   ├── ActivityHeatmap.js     # User insights
│   │   └── GameSelector.js        # Game swapping logic
│   ├── hooks/                     # Custom React hooks
│   ├── constants/                 # Shared data / configs
│   ├── learningAlgorithm.js       # Spaced repetition engine (Weighted SM-2 Lite)
│   ├── App.js                     # Root logic and router emulation
│   └── index.css                  # Global styles
└── package.json                   # Dependencies & Scripts
```

### Key Modules and Their Purpose

- **Learning Algorithm**: `src/learningAlgorithm.js` - Contains `updateWordLearning` and `getWordsForReview`. Controls probability bounds (0.6x mastery to 2.0x needs practice).
- **Multiple Choice Quiz Game**: `src/components/Quiz.js` - Reference implementation that acts as the contract consumer for the unified loop.

## Data Models and APIs

### Data Schema (localStorage)

The truth of progress is entirely persisted in `localStorage`. There is no cloud sync. The schema represents:

1. `learningData`: Per-word learning state (e.g., `weight`, `interval`, `correctStreak`, `avgResponseTime`).
2. `userPreferences`: `lastSubject`, `lastUnits`, `lastQuestionCount`, `lastGame`.
3. `gameHistory`: Append-only history of gameplay dates/scores.
4. `gameStats`: Overall aggregate metrics.

### Content Database Schema

Data fetched from `public/db/wordlist_*.json`:

```json
{
  "unit": "2.1",
  "word": "Freezing",
  "definition": "Extremely cold, at or below 0°C",
  "example": "It was freezing outside",
  "vietnamese": "Lạnh cóng"
}
```

## Technical Debt and Known Issues

### Critical Technical Debt

1. **Content Consistency**:
   - Missing "Unit 4" gap in curriculum.
   - Inconsistent unit naming (`1.1` vs `Unit 6`).
   - ~26% of entries are multi-word phrases, which severely limits letter-based logic games like Word Search.
   - Known data swaps where definitions are placed in the word fields.
2. **Missing Media Assets**: Image/Audio URLs are recommended enhancements (`imageUrl`, `audioUrl`), but are currently missing, restricting multi-modal voice inputs.
3. **Flat Component Structure**: All game components (e.g., `Quiz.js`, `WordSearch.js`, `BubblePop.js`) share the `src/components/` directory with UI primitives, lacking domain-model segregation (`src/components/games/` path vs generic UI).

### Workarounds and Gotchas

- **Component Contract Adherence**: Any new `/src/components/*` that represents a "Game" MUST respect the `GameProps` contract specifically taking `words`, emitting `onAnswer(word, isCorrect, ms)`, and emitting `onComplete(results)`.
- **Timer Reset Dependencies**: Within Games, `questionStartTime` state must immediately reset in `useEffect` arrays observing `currentIndex` to prevent inaccurate response profiling which cascades into broken spaced-repetition logic.

## Integration Points and External Dependencies

### Internal Integration Points

- Data is retrieved statically via Fetch API pointing at standard `public/db/` paths based on base URL parameters.
- There are NO external REST API services required; the entire loop handles state inside browser DOM.

## Development and Deployment

### Local Development Setup

1. Run `npm install`
2. Run `npm start` (Default port `3000`)
3. `docker-compose up` is also supported for isolated testing

### Build and Deployment Process

- **Build Command**: `npm run build`
- **Output**: Generates optimized static assets in `/build`.
- **Deployment Strategy**: Output directory is ready to drop into any static host (Netlify, GitHub Pages, Vercel) since there's zero runtime dependency.

## Testing Reality

### Current Test Coverage

- Unit tests: Assumed standard Jest via `react-scripts`.
- No specific tests observed directly in project root `src/` (Requires verifying test folders if existing, typically `__tests__` or `*.test.js` files).
- Predominantly manual verification via the web client interface.

### Running Tests

```bash
npm test
```
