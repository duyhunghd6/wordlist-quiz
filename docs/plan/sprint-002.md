# Sprint 002: Grammar Detective Games

<!-- unid-meta
unid: plan:sprint-002:grammar-detective-games
fulfills: [research:grade3-esl:grammar-detective-games-plan]
-->

## Summary

Sprint 002 delivers the first production version of the Grammar Detective learning track. The goal is to help a Vietnamese primary-school ESL learner build the habit of finding sentence clues before choosing grammar forms.

The sprint focuses on three weak areas observed from worksheet performance:

1. Modal obligation vs. possibility: `must`, `have to`, `had to`, `may`, `might`, `could`
2. Past continuous completion: `was/were + V-ing`
3. Future choice: `will` vs. `be going to`

The planned games are:

1. Modal Detective: Rule or Maybe?
2. Action Freeze Detective: What Was Happening?
3. Future Forecast Detective: Plan, Evidence, or Decision?

Reference design document:

- `docs/research/ideation/grammar_detective_games_plan.md`

## Sprint Objectives

### Learning Objectives

- Train the child to identify grammar clues before answering.
- Make invisible English auxiliaries visible through game mechanics.
- Separate meaning classification from form selection.
- Reduce random guessing in modal, past continuous, and future-form exercises.
- Capture enough attempt data to explain why the learner is failing.

### Product Objectives

- Add a reusable Grammar Detective engine.
- Ship three game modes using one shared engine.
- Add a 54-question starter bank with explanations.
- Register the games in the app journey and game selector.
- Emit completion metrics compatible with existing game result handling.

### Engineering Objectives

- Reuse current game architecture and `Relative Detective` interaction patterns.
- Avoid one-off implementations for each grammar topic.
- Keep the question data structured enough for future SRS and parent reports.
- Keep the UI child-safe: large targets, no timers, retry-friendly feedback.

## Scope

### In Scope

- Shared grammar detective data model
- Shared two-step game component
- Three configured game modes
- Dedicated visual treatment per game mode
- Question bank with 18 questions per mode
- Per-question explanations
- Clue tapping before answer selection
- Correct and incorrect feedback states
- Score and completion callback
- Basic adaptive hints inside the session
- Journey and selector registration
- Manual QA checklist

### Out of Scope

- Full persistent spaced repetition scheduling
- Parent dashboard implementation
- Voice recognition
- AI-generated question creation
- Backend storage
- User accounts
- Multiplayer or leaderboard features
- Advanced mixed-review mode across all grammar topics

These can be planned for a later sprint after the core mechanics are validated with the child.

## Architecture Plan

<!-- unid-meta
unid: plan:sprint-002:architecture
fulfills: [plan:sprint-002:grammar-detective-games]
-->

### Existing Architecture Touchpoints

The implementation should fit the current React game architecture.

Expected integration points:

- `src/App.js`
  - imports game components
  - switches by selected game ID
  - passes shared `gameProps`
  - receives `onComplete` metrics
- `src/constants/gameConfig.js`
  - registers game IDs, display names, colors, and icons
- `src/components/GameJourney.js`
  - places games into ESL learning journey nodes
- `src/components/GameSelector.js`
  - displays available games and icons
- `src/components/games/RelativeDetectiveGame.js`
  - reference pattern for clue spotting then grammar selection
- `src/components/games/RelativeDetectiveGame.css`
  - reference visual style for detective-themed UI

### Proposed File Structure

```text
src/components/games/
  GrammarDetectiveGame.js
  GrammarDetectiveGame.css
  grammarDetectiveData.js
  grammarDetectiveModes.js
```

Optional later split if the data grows:

```text
src/components/games/grammar-detective/
  GrammarDetectiveGame.js
  GrammarDetectiveGame.css
  grammarDetectiveData.js
  grammarDetectiveModes.js
  grammarDetectiveUtils.js
```

For sprint 002, prefer the flatter structure unless the component becomes too large.

### Game IDs

| Game | ID | Purpose |
| --- | --- | --- |
| Modal Detective | `modalDetective` | Train obligation vs. possibility modals. |
| Action Freeze Detective | `actionFreezeDetective` | Train past continuous clue recognition and form building. |
| Future Forecast Detective | `futureForecastDetective` | Train `will` vs. `be going to`. |

### Shared Engine Concept

Build one reusable component:

```jsx
<GrammarDetectiveGame
  mode="modalDetective"
  onHome={onHome}
  onComplete={onComplete}
/>
```

The component loads a mode config and filters the question bank by `game` or `mode`.

The shared engine owns:

1. session question selection
2. current question state
3. clue selection phase
4. answer selection phase
5. retry feedback
6. score tracking
7. completion metrics

The mode config owns:

1. title
2. theme colors
3. instruction text
4. option labels
5. visual metaphor
6. feedback wording
7. hint strategy

### Shared Game State

Recommended state shape:

```js
const [questions, setQuestions] = useState([]);
const [currentIndex, setCurrentIndex] = useState(0);
const [score, setScore] = useState(0);
const [phase, setPhase] = useState('clue');
const [selectedClue, setSelectedClue] = useState(null);
const [selectedAnswer, setSelectedAnswer] = useState(null);
const [feedback, setFeedback] = useState(null);
const [attempts, setAttempts] = useState([]);
const [startTime, setStartTime] = useState(0);
```

Recommended phases:

| Phase | Meaning |
| --- | --- |
| `clue` | Learner must tap the clue first. |
| `answer` | Learner chooses or builds the grammar answer. |
| `explain` | Game shows short explanation before next question. |
| `finished` | Completion screen and result callback. |

### Question Data Model

Use one normalized question shape across all three games.

```js
{
  id: 'modal-001',
  game: 'modalDetective',
  sentence: 'Students ___ wear uniforms at school every day.',
  clueText: 'every day',
  clueStartToken: 7,
  clueEndToken: 8,
  answer: 'have to',
  acceptedAnswers: ['have to', 'must'],
  options: ['have to', 'had to', 'must', 'may', 'might', 'could'],
  explanation: 'This is a regular school duty. Use have to or must + base verb.',
  concept: 'obligation',
  tags: ['modal', 'obligation', 'routine', 'base_verb_after_modal'],
  difficulty: 1
}
```

For past continuous, add optional structure fields:

```js
{
  subject: 'I',
  baseVerb: 'watch',
  longAction: 'watch TV',
  interruptingAction: 'called me',
  auxiliary: 'was'
}
```

For future forms, add optional meaning fields:

```js
{
  futureUse: 'visible_evidence',
  subject: 'It',
  auxiliary: 'is'
}
```

### Token and Clue Rendering

The sentence should be tokenized into clickable spans. The clue can be identified by one of two methods:

1. exact text match using `clueText`
2. token range using `clueStartToken` and `clueEndToken`

Use exact text match for sprint 002 because it is faster to implement. Add token ranges later if punctuation or repeated phrases cause ambiguity.

### Answer Handling

The engine should compare the selected answer against `acceptedAnswers` when present, otherwise against `answer`.

Rules:

- correct clue tap unlocks answer options
- wrong clue tap shakes the tapped token and gives a hint
- correct answer increases score and enters explanation phase
- wrong answer marks the option red and allows retry
- answer options should not be visible before the clue is found

### Attempt Metrics

Each question attempt should record both clue and answer behavior.

```js
{
  questionId: 'modal-001',
  game: 'modalDetective',
  clueCorrect: true,
  answerCorrect: false,
  selectedAnswer: 'must',
  finalAnswer: 'have to',
  wrongClueTaps: 1,
  wrongAnswerTaps: 1,
  tags: ['modal', 'obligation'],
  responseTimeMs: 8200
}
```

For sprint 002, keep this data in memory and include summary metrics in `onComplete`. Persistent analytics can come later.

### Completion Callback

Use the existing style already used by games such as Relative Detective.

```js
onComplete({
  gameId: mode.id,
  totalQuestions: questions.length,
  correctAnswers: score,
  averageResponseTime: Date.now() - startTime,
  attempts
});
```

If the existing result system cannot store `attempts`, still compute them locally and pass the standard fields.

### Mode Configuration

Create `grammarDetectiveModes.js`.

```js
export const GRAMMAR_DETECTIVE_MODES = {
  modalDetective: {
    id: 'modalDetective',
    title: 'Modal Detective',
    subtitle: 'Rule or Maybe?',
    clueInstruction: 'Find the clue that tells rule, past duty, or maybe.',
    answerInstruction: 'Choose the best modal.',
    themeClass: 'gdd-modal',
    optionGroups: ['Rule Folder', 'Maybe Folder']
  }
};
```

Each mode should define only behavior and labels. The shared engine should not hardcode modal-specific strings.

### Visual Architecture

The component should have shared layout classes plus mode-specific theme classes.

Shared classes:

- `.gdd-game`
- `.gdd-hud`
- `.gdd-stage`
- `.gdd-case-card`
- `.gdd-sentence`
- `.gdd-token`
- `.gdd-token-clue`
- `.gdd-options`
- `.gdd-option-button`
- `.gdd-feedback`

Mode classes:

- `.gdd-modal`
- `.gdd-action-freeze`
- `.gdd-future-forecast`

### Dynamic Difficulty Architecture

Sprint 002 should implement lightweight in-session scaffolding, not a full DDA engine.

| Trigger | Behavior |
| --- | --- |
| two wrong clue taps | pulse the correct clue after a delay |
| one wrong answer | show concept hint |
| two wrong answers | reduce visual noise and highlight the answer family |
| three correct in a row | stop showing extra hints |

Future sprint DDA can use tag-level performance to choose new questions.

### Accessibility and Child UX

- Minimum touch target: 60 px high for answer buttons.
- No time limit.
- Wrong answers allow retry.
- Use readable sentence font size.
- Use color and shape, not color alone.
- Keep feedback to one or two short sentences.
- Avoid dense grammar terminology on the child-facing screen.

## Development Plan

<!-- unid-meta
unid: plan:sprint-002:development
fulfills: [plan:sprint-002:grammar-detective-games]
-->

### Milestone 1: Data Foundation

#### Tasks

1. Create `src/components/games/grammarDetectiveData.js`.
2. Add all 54 starter questions from the research plan.
3. Normalize every item to the shared data model.
4. Add `acceptedAnswers` only where multiple answers are genuinely acceptable.
5. Add tags for diagnostics and future review.

#### Acceptance Criteria

- Each game has at least 18 questions.
- Each question has `id`, `game`, `sentence`, `clueText`, `answer`, `options`, `explanation`, `tags`, and `difficulty`.
- Question IDs are unique.
- No question depends on free typing.
- No question has an explanation longer than two child-facing sentences.

### Milestone 2: Mode Configuration

#### Tasks

1. Create `src/components/games/grammarDetectiveModes.js`.
2. Define configs for all three game IDs.
3. Add child-facing instructions for clue and answer phases.
4. Add mode-specific completion titles.
5. Add mode-specific hint copy.

#### Acceptance Criteria

- No mode-specific strings are hardcoded inside the shared engine unless they are generic.
- Adding a fourth detective mode would require a new mode config and data, not a new component.

### Milestone 3: Shared Grammar Detective Component

#### Tasks

1. Create `src/components/games/GrammarDetectiveGame.js`.
2. Implement session initialization and question shuffling.
3. Implement clue phase.
4. Implement answer phase.
5. Implement explanation phase.
6. Implement finished phase.
7. Add audio feedback using the current lightweight Web Audio pattern.
8. Track score and attempts.
9. Call `onComplete` at session end.

#### Acceptance Criteria

- The learner cannot choose an answer before tapping the correct clue.
- Correct clue tap visibly highlights the clue.
- Wrong clue tap gives immediate feedback.
- Wrong answer gives immediate feedback and allows retry.
- Correct answer shows the completed sentence and explanation.
- The game advances without page reload.
- Completion reports the correct game ID.

### Milestone 4: Styling and Theming

#### Tasks

1. Create `src/components/games/GrammarDetectiveGame.css`.
2. Implement the shared detective card layout.
3. Add mode-specific visual treatments.
4. Ensure mobile-friendly button sizes.
5. Add simple feedback animations.

#### Acceptance Criteria

- The game is usable on a phone-width viewport.
- Answer buttons are large enough for a child.
- The clue highlight is visually obvious.
- Error feedback is clear but not punitive.
- Mode themes are distinct enough for the child to recognize the grammar family.

### Milestone 5: App Registration

#### Tasks

1. Import `GrammarDetectiveGame` in `src/App.js`.
2. Add render cases for `modalDetective`, `actionFreezeDetective`, and `futureForecastDetective`.
3. Add game config entries in `src/constants/gameConfig.js`.
4. Add icons and colors in `src/components/GameSelector.js` if required by the selector map.
5. Add the games into `src/components/GameJourney.js`.

#### Recommended Journey Placement

| Journey node | Game | Reason |
| --- | --- | --- |
| ESL 3: Grammar Noticing | Modal Detective | Starts with clue spotting and meaning classification. |
| ESL 4: Grammar Building | Action Freeze Detective | Builds full past continuous forms. |
| ESL 4 or ESL 5 | Future Forecast Detective | Requires subtler future meaning distinctions. |

#### Acceptance Criteria

- All three games are selectable through the app UI.
- Navigation back to home/menu works.
- Each game can complete a 10-question session.
- Existing games still render.

### Milestone 6: Session Adaptation

#### Tasks

1. Count wrong clue taps per question.
2. Count wrong answer taps per question.
3. Show stronger hints after repeated misses.
4. Reduce option noise after repeated misses if simple to implement.
5. Include attempt summary in completion metrics where possible.

#### Acceptance Criteria

- Repeated wrong clue taps produce stronger guidance.
- Repeated wrong answers do not trap the learner.
- The game remains retry-friendly.

### Milestone 7: Content Review

#### Tasks

1. Review each item for one clear clue.
2. Review modal items for ambiguous accepted answers.
3. Review future items for plan/evidence vs. opinion clarity.
4. Review past continuous items for correct subject agreement.
5. Remove or rewrite ambiguous questions.

#### Acceptance Criteria

- Every question has a defensible answer.
- If multiple answers are acceptable, this is represented in `acceptedAnswers`.
- The preferred answer matches the teaching point.
- Explanations are suitable for a primary-school learner.

## QA Plan

<!-- unid-meta
unid: plan:sprint-002:qa
fulfills: [plan:sprint-002:grammar-detective-games]
-->

### QA Goals

QA should verify learning behavior, not only technical rendering.

The core question is:

> Does the game train the child to identify the clue, understand the meaning, and choose the correct form?

### Automated Checks

Run the existing project checks available in the repo.

Recommended commands:

```bash
npm test -- --watchAll=false
npm run build
```

If the project has lint commands available, also run the relevant lint command. Do not add new tooling during this sprint unless the project already supports it.

### Data QA Checklist

- [ ] All question IDs are unique.
- [ ] Every item has a valid `game` ID.
- [ ] Every `game` ID has a matching mode config.
- [ ] Every item has a non-empty `clueText`.
- [ ] Every `clueText` appears in the sentence.
- [ ] Every item has at least two answer options.
- [ ] Every correct answer appears in options or accepted answers.
- [ ] Every item has a child-readable explanation.
- [ ] Every item has diagnostic tags.
- [ ] Past continuous items use `was` or `were` correctly.
- [ ] Future items distinguish `will` from `be going to` by clue type.
- [ ] Modal items distinguish obligation, past obligation, and possibility.

### Functional QA Checklist

- [ ] Game opens from selector.
- [ ] Game opens from journey node.
- [ ] Back button returns to menu/home.
- [ ] Score starts at zero.
- [ ] A session loads expected number of questions.
- [ ] Answer options are hidden during clue phase.
- [ ] Wrong clue tap shows error feedback.
- [ ] Correct clue tap unlocks answer options.
- [ ] Wrong answer tap shows error feedback.
- [ ] Wrong answer does not advance the question.
- [ ] Correct answer shows explanation.
- [ ] Next question resets clue and answer state.
- [ ] Final question triggers completion screen.
- [ ] `onComplete` includes correct game ID and score.
- [ ] No console error appears during normal play.

### Pedagogical QA Checklist

#### Modal Detective

- [ ] The child must identify rule, duty, past time, or uncertainty clue.
- [ ] `Yesterday`, `last night`, and similar clues lead to `had to`.
- [ ] `not sure`, `maybe`, `if`, and evidence-based uncertainty lead to possibility modals.
- [ ] Rule and safety contexts lead to `must` or `have to`.
- [ ] Explanations reinforce `modal + base verb`.

#### Action Freeze Detective

- [ ] The child sees the long action as the past continuous action.
- [ ] `when` questions distinguish long background action from short interruption.
- [ ] `while` questions support two simultaneous long actions.
- [ ] The UI makes `was/were` visible.
- [ ] The game catches `was/were` subject agreement errors through answer choices.

#### Future Forecast Detective

- [ ] Plan clues such as tickets, booking, packing, or decided lead to `be going to`.
- [ ] Visible evidence clues such as clouds or danger lead to `be going to`.
- [ ] Instant decisions, offers, promises, and opinions lead to `will`.
- [ ] The UI shows `am/is/are going to` agreement where relevant.

### UX QA Checklist

- [ ] Touch targets are large enough for a child.
- [ ] Text is readable on mobile.
- [ ] Feedback appears in less than one second.
- [ ] The game has no timer or speed pressure.
- [ ] Wrong answers feel safe and retryable.
- [ ] Correct answers feel rewarding.
- [ ] Color is not the only signal for correctness.
- [ ] Audio feedback does not block gameplay if browser audio is unavailable.

### Regression QA Checklist

- [ ] Existing `RelativeDetectiveGame` still works.
- [ ] Existing `TimelineDetectiveGame` still works.
- [ ] Existing vocabulary games still open.
- [ ] Existing score/result review does not break.
- [ ] App build succeeds.
- [ ] No unrelated files are modified.

### Manual Child Testing Script

Use this with the learner after implementation.

1. Start Modal Detective with two-choice mode if available.
2. Watch whether the child taps the clue or randomly taps words.
3. Ask the child: `Why did you choose that answer?`
4. Repeat for Action Freeze Detective.
5. Ask the child to point to the action that was happening first.
6. Repeat for Future Forecast Detective.
7. Ask whether the sentence is a plan, evidence, decision, promise, or opinion.
8. Record which explanation the child repeats correctly.

Success is not just a high score. Success means the child can explain the clue.

### Bug Severity Guide

| Severity | Example | Release decision |
| --- | --- | --- |
| Blocker | Game cannot open or complete. | Do not release. |
| High | Correct answer marked wrong. | Do not release. |
| High | Clue cannot be selected. | Do not release. |
| Medium | Explanation is unclear or too long. | Fix before child testing if possible. |
| Medium | Visual layout cramped on mobile. | Fix before release. |
| Low | Theme color needs polish. | Can release if learning flow works. |

## Sprint Execution Order

1. Implement data and mode config.
2. Implement shared engine with one mode only.
3. Finish Modal Detective end to end.
4. Add Action Freeze Detective using the same engine.
5. Add Future Forecast Detective using the same engine.
6. Register all games in app navigation.
7. Run automated checks.
8. Run manual QA with all three game modes.
9. Fix content ambiguity and UI issues.
10. Prepare next-sprint notes for SRS and parent reporting.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| Questions have more than one valid answer. | Use `acceptedAnswers` and keep a `preferredAnswer` for teaching. |
| Shared engine becomes too generic and hard to read. | Keep only the two-step loop shared; put mode behavior in config. |
| Past continuous needs form building, not simple choice. | Start with multiple choice in sprint 002; add drag-and-build later. |
| `will` vs. `going to` is too subtle. | Use strong visual clues first: tickets, clouds, edge of table, promise. |
| Child guesses without reading. | Do not reveal answer options until the clue is tapped. |
| Feedback becomes text-heavy. | Keep explanation short and use visual clue highlighting. |

## Definition of Done

Sprint 002 is done when:

- [ ] The 54-question data bank exists in code.
- [ ] All three game IDs are registered.
- [ ] Each game opens from the UI.
- [ ] Each game enforces clue spotting before answer selection.
- [ ] Each game can complete a session and report score.
- [ ] Each wrong answer provides immediate retry feedback.
- [ ] Each correct answer provides a short explanation.
- [ ] Automated build succeeds.
- [ ] Manual QA has been completed for all three games.
- [ ] The implementation remains scoped to the sprint goals.

## Next Sprint Candidates

- Mixed Grammar Detective Review mode
- Persistent spaced repetition scheduling
- Parent weakness report by diagnostic tag
- Drag-and-drop sentence building for `was/were + V-ing`
- Audio narration for instructions and explanations
- More questions generated from the learner’s school materials
