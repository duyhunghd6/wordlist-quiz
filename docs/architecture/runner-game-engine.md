# Endless Runner Game Architecture & Engine Design

The **Endless Runner** game (`Word Runner`) is powered by a procedural pedagogical engine (`RunnerQuestionEngine.js`) designed to keep learners in a "Flow State" while employing cognitive science principles like active recall, interleaved practice, and spaced repetition (SRS).

This document outlines how the game functions to assist future developers in maintaining, balancing, or expanding it.

---

## Core Components

The game is split into two primary layers:

1. **`EndlessRunner.js` (The Shell / UI Level)**
   - Manages the visual rendering, 3-minute game timer, HUD (Score & Level), and CSS animations.
   - Handles the callback from user clicks, triggering UI feedback (Correct/Miss!).
   - Informs the engine when an answer was submitted.

2. **`useRunnerEngine` Hook inside `RunnerQuestionEngine.js` (The Brain)**
   - Calculates the player's current difficulty `level` based purely on their `streak`.
   - Maintains a short-term memory buffer (`recentWords`) to drastically reduce repetitive questions.
   - Maintains a long-term penalty weight matrix (`errorWeights`) to force missed questions to reappear sooner (Spaced Repetition).
   - Dynamically constructs the question text, the correct answer, and **ironclad unique distractors**.

---

## Difficulty Progression (The 6 Tiers)

The engine automatically scales through 6 tiers based on consecutive correct answers. If a user gets a question wrong, their streak drops slightly, ensuring they aren't punished entirely but keeping them at an appropriate challenge level.

| Level      | Condition    | Question Type                | Description                                                                                               |
| :--------- | :----------- | :--------------------------- | :-------------------------------------------------------------------------------------------------------- |
| **Tier 1** | Streak 0-4   | `SPELLING_EASY`              | Short words (≤ 5 chars). Player selects the correctly spelled anagram.                                    |
| **Tier 2** | Streak 5-9   | `SPELLING_HARD` / `TENSE_TF` | Mixed. Long words (> 5 chars) spelling, OR a True/False tense question.                                   |
| **Tier 3** | Streak 10-14 | `DEFINITION` / `TENSE_TF`    | Active Recall. Given a definition, select the matching word. Mixed with Tense TF.                         |
| **Tier 4** | Streak 15-19 | `CONTEXT` / `TENSE_TF`       | Fill in the blank given an example sentence. Mixed with Tense TF.                                         |
| **Tier 5** | Streak 20-24 | `TENSE_TF`                   | Pure Boss level. Evaluates full sentences for grammatical accuracy (Subject/Verb agreement, Tense usage). |
| **Tier 6** | Streak 25+   | `INTERLEAVED`                | "Chaos Mode." Interleaves Spelling, Definition, Context, and Tense questions randomly.                    |

---

## Pedagogical Algorithms

### 1. The Anti-Repetition Buffer (`recentWords`)

To avoid the "Flashcard Loop" issue, the engine maintains an array of the last **25** target IDs (words or sentence IDs) that were generated.

- When building the pool of eligible questions, any ID in this array is strictly filtered out.
- This creates a **Draw Without Replacement** effect, forcing the engine to cycle through the broad database rather than fixating on a subset.

### 2. Spaced Repetition Error Weighting (`errorWeights`)

- Whenever a user gets a target wrong, its ID is logged in `errorWeights` and its value is incremented.
- Furthermore, the ID is instantly **removed** from the `recentWords` buffer.
- During random selection, the engine builds a "Lottery Pool". A normal word gets 1 lottery ticket. A word with an error weight gets `1 + (mistakes * 5)` tickets.
- **Result**: Missed words bypass the repetition filter and are statistically aggressively forced back into the player's session a few questions later to reinforce the learning.

### 3. Ironclad Distractor Uniqueness

The distractor selection algorithms (`createSpellingDistractors` and `pickTwoDistractors`) employ extreme fallback checks.

- **Spelling**: If the anagram algorithm coincidentally outputs the correct spelling due to palindrome-like structures, a manual suffix (`S` or prefix `X`) is appended.
- **Words**: `toLowerCase()` evaluation strictly ensures that the two randomly drawn distractors can never match the correct answer, and can never match each other.

---

## Enterprise Tense Sentence Database (Level 5)

The `TENSE_TF` (Tense True/False) questions do **not** rely on standard regex string scrambling, as that creates low-quality, chaotic English.

Instead, the application ships with an Enterprise-grade pedagogical bank containing 250+ meticulously crafted sentences (50 per tense style).

### The TOON Format (`public/db/tense_sentences_esl.toon`)

To significantly save on bandwidth and context window limits, the sentences are stored in a proprietary `.toon` format (a tabular CSV-like structure for objects) instead of JSON:

```toon
[250]{id,tense,level,correct_sentence,wrong_sentence,pedagogical_focus,vietnamese_translation}:
pc1,Present Continuous,Beginner,She is playing football.,She are playing football.,Subject-verb agreement,...
```

**Loading Pipeline:**

1. `App.js` fires off an async `fetch` to `tense_sentences_esl.toon`.
2. It parses the custom headers `{...}:` and splits the dataset by commas.
3. The resulting array of JSON objects is passed down the component tree into `EndlessRunner` via the `tenseSentences` prop.
4. The engine invokes `pickRandomSentence()` using the exact same SRS and Anti-Repetition logic as the wordlist.

### Adding More Sentences

If you want to add more sentences, you must use the `@toon-format/cli` to re-compile your JSON data into the `.toon` file. Do not edit the `.toon` file directly if you are making large structural changes.

See `generate_toon.py` in the root for the script used to author the sentences.
