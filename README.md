# 📚 Wordlist Quiz - Interactive Vocabulary Learning for Kids

An open-source, mobile-first web application designed to help children build vocabulary through engaging, gamified learning experiences powered by spaced repetition algorithms.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![Mobile](https://img.shields.io/badge/Mobile-First-green.svg)

## 🎯 Learning Objective

Build strong vocabulary foundations for elementary school children (Grade 3+) through:

- **Active recall** - Not passive reading, but active retrieval
- **Spaced repetition** - Review words at optimal intervals
- **Gamification** - Make learning exciting and habit-forming
- **Multi-modal engagement** - Different games for different learning styles

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
│              (Games = Engagement Wrappers)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  Quiz    │ │  Word    │ │  Swipe   │ │  Bubble  │  ...more  │
│  │(current) │ │  Search  │ │  Cards   │ │   Pop    │           │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘           │
└───────┼────────────┼────────────┼────────────┼──────────────────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│              🧠 CORE LEARNING ALGORITHM                         │
│                (Weighted SM-2 Lite)                             │
│  • All games feed the SAME learning algorithm                  │
│  • Weight adjustment (correct ↓ / wrong ↑)                     │
│  • Response time tracking (fast = mastery)                     │
│  • Temporal decay (forgetting curve)                           │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│  📚 Vocab:   public/db/wordlist_*.json                         │
│  📚 Grammar: public/db/tense_sentences_esl.toon                │
│  💾 Progress: localStorage (unified per-word tracking)         │
└─────────────────────────────────────────────────────────────────┘
```

**Key Design Decisions:**

- ✅ **All games available from start** - No unlocking required
- ✅ **Default to last game** - One-tap to change, remembers preference
- ✅ **Unified learning algorithm** - Progress syncs across all games
- ✅ **Centralized Tense DB** - Grammar MUST use `*.toon` DB. Regex scrambling is strictly forbidden.

---

## 📱 UX Flow Design

### Quick Start (Returning User)

```
┌──────────────────────────────────────────────────────────────┐
│                    WELCOME BACK! 👋                          │
│                                                              │
│   📚 Continue where you left off:                           │
│   ┌────────────────────────────────────────────────────┐    │
│   │  ESL • Units 1,2 • 10 questions                    │    │
│   │                                                    │    │
│   │  🔤 Word Search (last played)                     │    │
│   │                                                    │    │
│   │  [ ▶ QUICK START ]    [ ⚙ CHANGE ]               │    │
│   └────────────────────────────────────────────────────┘    │
│                                                              │
│   🎮 Switch game: [📝] [🔤] [👆] [🫧]                       │
└──────────────────────────────────────────────────────────────┘
```

### Game Selector (One-tap Change)

```
┌──────────────────────────────────────────────────────────────┐
│   ESL • Units 1,2 • 10 questions                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│   │    📝    │  │    🔤    │  │    👆    │  │    🫧    │   │
│   │   Quiz   │  │  Search  │  │  Swipe   │  │  Bubble  │   │
│   │          │  │    ✓     │  │          │  │          │   │
│   │  Best:85%│  │ Best:72% │  │  NEW!    │  │  NEW!    │   │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                              │
│   ✓ = Last played (default on Quick Start)                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 💾 localStorage Structure

```javascript
localStorage = {
  // Per-word learning state (unified across all games)
  learningData: {
    version: 1,
    "Freezing": { weight: 0.6, interval: 7, correctStreak: 5, ... },
    "Humid": { weight: 2.0, interval: 1, correctStreak: 0, ... }
  },

  // User preferences (auto-saved, restored on return)
  userPreferences: {
    lastSubject: "wordlist_esl",
    lastUnits: ["1", "2"],
    lastQuestionCount: 10,
    lastGame: "wordSearch",        // Default for Quick Start
    playerName: "Minh"
  },

  // Session history
  gameHistory: [
    { game: "wordSearch", date: "2024-01-24", score: 72, words: 8 },
    { game: "quiz", date: "2024-01-23", score: 85, words: 10 }
  ],

  // Per-game best scores (for display only)
  gameStats: {
    quiz: { played: 45, bestScore: 95 },
    wordSearch: { played: 12, bestScore: 80 },
    swipe: { played: 0, bestScore: 0 },
    bubble: { played: 0, bestScore: 0 }
  }
}
```

Our spaced repetition implementation tracks per-word learning state:

```javascript
{
  word: "Freezing",
  weight: 1.0,           // Selection probability (0.5 - 8.0)
  interval: 1,           // Days until next review
  correctStreak: 0,      // Consecutive correct answers
  avgResponseTime: 2500, // Rolling average in ms
  lastReviewed: null     // Timestamp
}
```

### Weight Adjustment Rules

| Answer     | Response Time | Weight Change               | Interval   |
| ---------- | ------------- | --------------------------- | ---------- |
| ✅ Correct | < 3 seconds   | × 0.6 (strong mastery)      | × 2.5      |
| ✅ Correct | ≥ 3 seconds   | × 0.8 (needs reinforcement) | × 1.5      |
| ❌ Wrong   | any           | × 2.0 (needs practice)      | reset to 1 |

---

## 🎯 Core Principle: Games = Presentation Layer Over Learning Algorithm

### The Philosophy

**Games are NOT separate learning systems.** They are engagement wrappers that present the same learning content in different interactive formats. Think of games like different "costumes" for the same underlying vocabulary practice.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         THE CRITICAL INSIGHT                                │
│                                                                             │
│   ❌ WRONG: Each game has its own scoring, progress, difficulty system     │
│   ✅ RIGHT: All games share ONE learning algorithm, ONE progress state     │
│                                                                             │
│   Why? Because learning is about the WORDS, not the game.                  │
│   A word mastered in Quiz should not need re-learning in Swipe Cards.     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### What This Means in Practice

| Aspect         | Traditional Approach (❌)   | Our Approach (✅)             |
| -------------- | --------------------------- | ----------------------------- |
| Progress       | Each game tracks separately | Single `learningData` object  |
| Word Selection | Random or sequential        | Weighted by learning state    |
| Difficulty     | Game-specific levels        | Algorithm-driven word weights |
| Success Metric | In-game score only          | Long-term retention           |
| Data Schema    | Game-specific structures    | Unified per-word tracking     |

---

## 🎮 Game Architecture

### The Game Contract

Every game component MUST implement this interface to integrate with the learning system:

```javascript
// ═══════════════════════════════════════════════════════════════════════
// GAME CONTRACT - All games must follow this pattern
// ═══════════════════════════════════════════════════════════════════════

interface GameProps {
  // INPUT: Words to practice (pre-selected by algorithm)
  words: Word[];                    // Already weighted-selected

  // OUTPUT: Report each answer back to learning algorithm
  onAnswer: (
    word: string,                   // The word being tested
    isCorrect: boolean,             // User got it right?
    responseTimeMs: number          // How long did they take?
  ) => void;

  // LIFECYCLE: Signal when game session is complete
  onComplete: (results: GameResult) => void;

  // METADATA: For analytics and display
  gameId: string;                   // 'quiz' | 'wordSearch' | 'swipe' | 'bubble'
}

interface Word {
  word: string;
  definition: string;
  example?: string;
  vietnamese?: string;
  unit: string;
}

interface GameResult {
  gameId: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: Word[];             // For review screen
  averageResponseTime: number;
}
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GAME SESSION LIFECYCLE                            │
└─────────────────────────────────────────────────────────────────────────────┘

1. SESSION START
   ┌─────────────┐      getWordsForReview()      ┌──────────────────┐
   │ Word Pool   │ ──────────────────────────▶   │ Selected Words   │
   │ (all units) │   weighted by learningData    │ (10-20 words)    │
   └─────────────┘                               └────────┬─────────┘
                                                          │
                                                          ▼
2. DURING GAME                               ┌────────────────────────┐
                                             │      GAME COMPONENT    │
   For EACH word interaction:                │  (Quiz/Swipe/Bubble)   │
   ┌────────────────────────────────┐        └───────────┬────────────┘
   │ User sees prompt               │                    │
   │ User responds (correct/wrong)  │◀───────────────────┘
   │ Timer records responseTimeMs   │
   └────────────────┬───────────────┘
                    │
                    ▼ onAnswer(word, isCorrect, responseTimeMs)
   ┌────────────────────────────────┐
   │ updateWordLearning()           │
   │ • Adjust weight (0.6x - 2.0x)  │
   │ • Update interval              │
   │ • Track response time avg      │
   │ • Save to localStorage         │
   └────────────────────────────────┘

3. SESSION END
   ┌────────────────────────────────┐      onComplete(results)
   │ Game Summary                   │ ─────────────────────────▶  Results Screen
   │ • Score %                      │
   │ • Wrong words (for review)     │
   └────────────────────────────────┘
```

### Implementation Pattern

Here's the canonical pattern every game should follow:

```javascript
// src/components/games/SwipeCards.js (example)
import React, { useState, useEffect, useCallback } from 'react';

const SwipeCards = ({ words, onAnswer, onComplete, gameId }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [results, setResults] = useState({ correct: 0, wrong: [], times: [] });

  // Reset timer when word changes
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentIndex]);

  const handleSwipe = useCallback((direction) => {
    const currentWord = words[currentIndex];
    const responseTimeMs = Date.now() - questionStartTime;

    // Determine correctness based on game logic
    const isCorrect = /* game-specific logic */;

    // ═══════════════════════════════════════════════════════════════════
    // CRITICAL: Report to learning algorithm (this is the contract!)
    // ═══════════════════════════════════════════════════════════════════
    onAnswer(currentWord.word, isCorrect, responseTimeMs);

    // Update local game state
    setResults(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: isCorrect ? prev.wrong : [...prev.wrong, currentWord],
      times: [...prev.times, responseTimeMs]
    }));

    // Move to next or finish
    if (currentIndex + 1 >= words.length) {
      onComplete({
        gameId,
        totalQuestions: words.length,
        correctAnswers: results.correct + (isCorrect ? 1 : 0),
        wrongAnswers: isCorrect ? results.wrong : [...results.wrong, currentWord],
        averageResponseTime: [...results.times, responseTimeMs].reduce((a,b) => a+b, 0) / (results.times.length + 1)
      });
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, words, onAnswer, onComplete, gameId, questionStartTime, results]);

  return (
    <div className="swipe-game">
      {/* Game UI here */}
    </div>
  );
};

export default SwipeCards;
```

---

## 🎮 Game Specifications

### ✅ Implemented: Multiple Choice Quiz

The reference implementation. All other games should follow this pattern.

**Mechanics:**

- 4 options displayed (1 correct, 3 distractors)
- 10-second timer per question
- Immediate visual feedback (green/red)
- Keyboard shortcuts (1-4 or A-D)

**Files:**

- `src/components/Quiz.js`
- `src/components/Quiz.css`

---

### 📱 Priority Games (Mobile-Optimized)

#### 1. Swipe Cards (Tinder-style)

**Concept:** Show a word-definition pair. User swipes RIGHT if match is correct, LEFT if wrong.

```
┌───────────────────────────────────────┐
│                                       │
│         ┌─────────────────┐           │
│         │                 │           │
│         │    "Freezing"   │           │
│         │                 │           │
│    ←    │   Very cold,    │    →      │
│  WRONG  │   below 0°C     │  CORRECT  │
│         │                 │           │
│         │    ✓ or ✗?      │           │
│         └─────────────────┘           │
│                                       │
│   ← Swipe Left    Swipe Right →       │
│     (Wrong)         (Correct)         │
└───────────────────────────────────────┘
```

**Game Logic:**

- 50% of cards show CORRECT word-definition pairs
- 50% show WRONG pairs (definition from a different word)
- User must identify if the pair matches

**Key Implementation Details:**

```javascript
// Generate cards (mix correct and incorrect pairs)
const generateCards = (words) => {
  return words.map((word, i) => {
    const isCorrectPair = Math.random() > 0.5;
    return {
      word: word.word,
      shownDefinition: isCorrectPair
        ? word.definition
        : words[(i + 1) % words.length].definition, // Swap with next
      correctAnswer: isCorrectPair, // true = swipe right
      sourceWord: word,
    };
  });
};

// Scoring
const handleSwipe = (direction) => {
  const card = cards[currentIndex];
  const userSaidCorrect = direction === "right";
  const isCorrect = userSaidCorrect === card.correctAnswer;

  onAnswer(card.sourceWord.word, isCorrect, responseTimeMs);
};
```

**Estimated Dev Time:** 4 hours
**Mobile UX:** Drag gesture with spring physics

---

#### 2. Bubble Pop

**Concept:** Word definition shown at top. Bubbles float up with words. Tap the correct word bubble before it escapes!

```
┌───────────────────────────────────────┐
│                                       │
│   "Extremely cold, below 0°C"         │
│   ───────────────────────────         │
│                                       │
│        🟢 humid                       │
│                    🟡 freezing ← TAP! │
│    🔵 steam                           │
│                 🟣 melting            │
│                                       │
│   ↑ Bubbles float up and escape ↑    │
│                                       │
│   ⏱️ 0:42    Score: 7/10             │
└───────────────────────────────────────┘
```

**Game Logic:**

- Display definition at top (static)
- 4 bubbles with word options float upward
- Bubbles have different speeds (difficulty)
- Miss = timeout = wrong answer
- Tap wrong bubble = wrong answer

**Key Implementation Details:**

```javascript
// Bubble physics
const Bubble = ({ word, onTap, speed }) => {
  const [position, setPosition] = useState({ x: randomX(), y: 100 });

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => ({
        x: prev.x + Math.sin(Date.now() / 500) * 2, // Wobble
        y: prev.y - speed, // Float up
      }));
    }, 16);
    return () => clearInterval(interval);
  }, [speed]);

  if (position.y < -50) {
    return null; // Escaped!
  }

  return (
    <button
      className="bubble"
      style={{ left: position.x, bottom: position.y }}
      onClick={() => onTap(word)}
    >
      {word}
    </button>
  );
};
```

**Estimated Dev Time:** 3 hours
**Mobile UX:** Simple tap, no drag needed

---

#### 3. Word Search Matrix

**Concept:** Find hidden vocabulary words in a letter grid. Drag to select.

```
┌───────────────────────────────────────┐
│   Find: freezing, humid, steam        │
│                                       │
│   ┌─────────────────────────────┐     │
│   │ F  R  E  E  Z  I  N  G  X  │     │
│   │ A  B  H  U  M  I  D  K  L  │     │
│   │ M  S  T  E  A  M  P  Q  R  │     │
│   │ X  Y  Z  A  B  C  D  E  F  │     │
│   │ G  H  I  J  K  L  M  N  O  │     │
│   └─────────────────────────────┘     │
│                                       │
│   Found: 1/3  ⏱️ 1:23                │
│   ══════════════════════════════      │
│   ✓ FREEZING                          │
└───────────────────────────────────────┘
```

**Game Logic:**

- Grid size adapts to word count (8x8 to 12x12)
- Words placed horizontally, vertically, or diagonally
- User drags to highlight letters
- Found words show definition briefly (learning moment!)
- All words found = correct, timeout = wrong for unfound words

**Scoring Integration:**

```javascript
// When word is found
const handleWordFound = (word) => {
  const timeToFind = Date.now() - wordStartTimes[word.word];
  onAnswer(word.word, true, timeToFind);

  // Show definition for 2 seconds (learning reinforcement)
  showDefinitionPopup(word);
};

// When time expires
const handleTimeout = () => {
  unfoundWords.forEach((word) => {
    onAnswer(word.word, false, TIMEOUT_MS);
  });
  onComplete(results);
};
```

**Estimated Dev Time:** 5-6 hours
**Mobile UX:** Drag gesture for selection

---

#### 4. Typing Quiz (Active Recall)

**Concept:** Type the word based on definition hints. Progressive difficulty from partial hints to full recall.

```
┌───────────────────────────────────────────────────────────────┐
│   Definition: "Extremely cold, at or below 0°C"               │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│   ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐           │
│   │ F │ │ R │ │ ▌ │ │   │ │ Z │ │ I │ │   │ │ G │           │
│   └───┘ └───┘ └─┬─┘ └───┘ └───┘ └───┘ └───┘ └───┘           │
│                 ↑                                             │
│           AUTO-FOCUSED (pulsing cyan glow)                    │
│                                                               │
│             ← Clear │ ✓ Submit                                │
└───────────────────────────────────────────────────────────────┘
```

**Difficulty Levels:**

| Level      | Visual Hint              | Input Required           |
| ---------- | ------------------------ | ------------------------ |
| **Easy**   | ~67% letters shown       | Fill 1/3 missing letters |
| **Medium** | 50% shown (start OR end) | Type full word           |
| **Hard**   | Word length only         | Type entire word         |

**UX Features:**

- **Zero-click start**: First empty box auto-focuses on question load
- **Special characters**: Apostrophes/hyphens pre-filled and auto-skipped
- **Typing time tracking**: Fast+correct → word shown less; Slow/backspaces → more practice
- **Retry mechanism**: Wrong answers can be retried for 50% points

**Typing Time → Learning Algorithm:**

| Behavior              | Weight Effect  | Result                 |
| --------------------- | -------------- | ---------------------- |
| Fast + Correct (< 3s) | `weight × 0.6` | Word appears much less |
| Slow + Correct (≥ 3s) | `weight × 0.8` | Word appears less      |
| Many backspaces       | Smaller bonus  | Needs more practice    |
| Wrong answer          | `weight × 2.0` | Word appears often     |

**Files:**

- `src/components/TypingQuiz.js`
- `src/components/TypingQuiz.css`

---

### 📋 Backlog Games

| Game              | Description                                  | Complexity | Notes                   |
| ----------------- | -------------------------------------------- | ---------- | ----------------------- |
| **Hangman**       | Classic letter guessing                      | Medium     | Good for spelling       |
| **Word Scramble** | Unscramble letters                           | Easy       | Single words only       |
| **Speed Match**   | Match word to definition under time pressure | Medium     | Pair matching           |
| **Fill in Blank** | Complete the sentence                        | Hard       | Needs example sentences |

---

### 🔮 Future (Requires Additional Infrastructure)

| Game                 | Description                            | Dependency                |
| -------------------- | -------------------------------------- | ------------------------- |
| **Voice Input**      | Say the word to practice pronunciation | Speech-to-text API        |
| **Photo Hunt**       | Find words in AR environment           | Camera access, AR library |
| **Multiplayer Race** | Compete with friends                   | WebSocket server          |

---

## 📊 Content Data Quality

### Current Status

| Metric                 | Value    | Status               |
| ---------------------- | -------- | -------------------- |
| Total Words            | 173      | ⚠️ Moderate          |
| Units Covered          | 5        | ⚠️ Missing Unit 4    |
| Words Missing Examples | 25 (14%) | ⚠️                   |
| Multi-word Phrases     | 45 (26%) | ⚠️ Limits some games |

### Known Issues

1. **Missing Unit 4** - Gap in curriculum sequence
2. **Inconsistent unit naming** - Mix of "1.1" and "Unit 6" formats
3. **Multi-word phrases** - ~26% are phrases, not single words (limits Word Search)
4. **Some data swaps** - A few entries have definition in word field

### Data Schema

```json
{
  "unit": "2.1",
  "word": "Freezing",
  "definition": "Extremely cold, at or below 0°C",
  "example": "It was freezing outside",
  "vietnamese": "Lạnh cóng"
}
```

### Recommended Enhancements

```json
{
  "wordType": "single", // single | phrase
  "partOfSpeech": "adjective",
  "difficulty": "medium",
  "imageUrl": null,
  "audioUrl": null
}
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
git clone https://github.com/your-repo/wordlist-quiz.git
cd wordlist-quiz
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker

```bash
docker-compose up
```

---

## 📁 Project Structure

```
src/
├── App.js                  # Main app component
├── learningAlgorithm.js    # Spaced repetition engine
├── components/
│   ├── Quiz.js             # Multiple choice quiz
│   ├── StartScreen.js      # Wordlist/unit selection
│   └── Results.js          # Score display
public/
└── db/
    ├── tense_sentences_esl.toon # Centralized Grammar Database
    ├── wordlist_esl.json   # ESL vocabulary
    ├── wordlist_math.json  # Math vocabulary
    └── wordlist_science.json
```

---

## 🤝 Contributing

### Adding New Games

All games should integrate with the learning algorithm:

```javascript
import { updateWordLearning, getWordsForReview } from "./learningAlgorithm";

// When user answers
const updated = updateWordLearning(wordData, isCorrect, responseTimeMs);

// To select words for the game
const words = getWordsForReview(wordPool, learningData, count);
```

### Adding Content

1. Edit `public/db/wordlist_*.json`
2. Follow the existing schema
3. Ensure consistent unit naming
4. Prefer single words over phrases for game compatibility

---

## 📖 Research & References

### Spaced Repetition

- [SM-2 Algorithm](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2) - SuperMemo's original algorithm
- [FSRS](https://github.com/open-spaced-repetition/fsrs4anki) - Modern ML-based approach

### Vocabulary Acquisition

- Children need ~1,000-2,000 words for functional literacy
- Active recall > passive review (testing effect)
- Interleaving improves long-term retention

### Mobile UX for Kids

- Large touch targets (minimum 44px)
- Gesture-based interactions preferred over typing
- Immediate visual/audio feedback essential
- Session length: 5-10 minutes optimal

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- Moana Study Projects initiative
- Open-source spaced repetition research community
