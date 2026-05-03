# Sprint 003: Modal Detective Deepening

<!-- unid-meta
unid: plan:sprint-003:modal-detective-deepening
fulfills: [plan:sprint-002:grammar-detective-games]
-->

## Summary

Sprint 003 improves one of the Sprint 002 games: Modal Detective. The focus is robust discrimination of `can`, `could`, `may`, and `might`.

The goal is to stop children from memorizing modal words as isolated answers. Instead, the game should train them to ask:

> What job is the modal doing in this sentence?

The game board and question bank should teach this explicitly through meaning families, clue spotting, and short explanations after every attempt.

## Target Skill

Children should learn to discriminate these modal meanings:

| Meaning family | Main forms | Child-facing idea |
| --- | --- | --- |
| Ability now | `can` | I know how to do it now. |
| Ability in the past | `could` | I knew how to do it before. |
| Permission | `can`, `may` | Is it allowed? |
| Polite request | `could` | I am asking politely for help. |
| Possibility | `may`, `might`, `could` | Maybe yes, maybe no. |
| Suggestion | `could` | This is one possible idea. |

## Why This Sprint Matters

`Could` is especially difficult because it has several jobs:

1. past ability: `I could swim when I was six.`
2. polite request: `Could you help me, please?`
3. possibility: `It could rain later.`
4. suggestion: `We could play chess.`

If the child only memorizes `could = past of can`, they will fail many real sentences. If the child only memorizes `may/might = maybe`, they may miss permission uses like `May I come in?`.

The game should therefore teach a decision process:

1. Find the clue.
2. Choose the modal job.
3. Choose the modal form.
4. Read the explanation.

## Product Changes

### Game Board Guidance

Modal Detective should display a compact guide board during play. The guide should be visible near the sentence or below the instruction, not hidden in a separate help screen.

Recommended guide board copy:

| Job | Clue question | Modal |
| --- | --- | --- |
| Skill now | Can someone do it now? | `can` |
| Skill before | Could someone do it in the past? | `could` |
| Allowed? | Is someone asking permission? | `can / may` |
| Polite help? | Is someone asking politely? | `could` |
| Maybe? | Are we not sure? | `may / might / could` |
| One idea? | Is it a suggestion? | `could` |

The board should use short labels and not overload the child. It should act as a thinking checklist.

### Question Bank Guidance

Every modal question should include:

- `modalFamily`
- `clueQuestion`
- `meaningHint`
- `explanation`

Example:

```js
{
  id: 'modal-can-001',
  game: 'modalDetective',
  sentence: 'I ___ play the piano.',
  clueText: 'play the piano',
  answer: 'can',
  options: ['can', 'could', 'may', 'might'],
  modalFamily: 'ability_now',
  clueQuestion: 'Is this a skill someone has now?',
  meaningHint: 'This is ability now.',
  explanation: 'Playing the piano is a skill. For ability now, use can.'
}
```

### Game Flow Enhancement

Sprint 002 already has clue spotting and answer selection. Sprint 003 keeps that flow but improves the teaching layer.

Recommended flow:

1. The board shows the modal job checklist.
2. The child taps the clue in the sentence.
3. The game shows the meaning hint.
4. The child chooses `can`, `could`, `may`, or `might`.
5. The game shows the explanation.

## Content Plan

The Modal Detective question bank should include at least 24 questions for this sprint, distributed across modal jobs.

| Modal job | Minimum questions |
| --- | ---: |
| ability now with `can` | 4 |
| past ability with `could` | 4 |
| permission with `can/may` | 4 |
| polite request with `could` | 4 |
| possibility with `may/might/could` | 6 |
| suggestion with `could` | 2 |

The bank can still include Sprint 002 obligation items, but the Sprint 003 child-facing Modal Detective session should focus on `can/could/may/might` discrimination first.

## Development Plan

### Milestone 1: Extend Modal Data

Add modal-specific metadata to modal questions:

- `modalFamily`
- `clueQuestion`
- `meaningHint`

Acceptance criteria:

- Every modal question has a clear meaning family.
- Every modal question has one primary clue.
- Every explanation names the modal job.

### Milestone 2: Add Guide Board to Modal Detective

Add a mode-level guide board in `grammarDetectiveModes.js` and render it in `GrammarDetectiveGame.js`.

Acceptance criteria:

- Modal Detective shows the guide board during play.
- Other detective games are unaffected.
- The guide board is compact and readable on mobile.

### Milestone 3: Improve Wrong-Answer Guidance

Use question metadata to show better hints after wrong answers.

Acceptance criteria:

- Wrong answer feedback shows `meaningHint` when available.
- Explanation remains visible after correct answer.
- The game does not rely only on generic `Try again` feedback.

### Milestone 4: Validate Question Bank

Run a lightweight data validation.

Acceptance criteria:

- All modal `clueText` values appear in their sentence.
- All answers appear in options or accepted answers.
- No modal question has multiple blanks unless the renderer supports multiple blanks.

## QA Plan

### Functional QA

- [ ] Modal Detective opens from the journey.
- [ ] Modal Detective opens from the selector.
- [ ] Guide board appears only for Modal Detective.
- [ ] Clue tapping still works.
- [ ] Answer selection still works.
- [ ] Correct answer shows explanation.
- [ ] Wrong answer shows the meaning hint.
- [ ] Game completion still reports score.

### Pedagogical QA

- [ ] `can` questions clearly teach ability now.
- [ ] `could` past-ability questions include past clues.
- [ ] `may` permission questions use formal/polite contexts.
- [ ] `could` request questions include polite request clues.
- [ ] possibility questions include uncertainty clues.
- [ ] suggestion questions clearly show one possible idea.
- [ ] Explanations are short enough for a child.

### Child Testing Script

Ask the child after each item:

1. What is the clue?
2. What job is the modal doing?
3. Why did you choose that modal?

A successful answer sounds like:

> `When I was five` means before, so this is ability in the past. I choose `could`.

## Definition of Done

Sprint 003 is done when:

- [ ] Modal Detective has a visible meaning-family guide board.
- [ ] Modal Detective includes robust `can/could/may/might` questions.
- [ ] Every new modal question has an explanation.
- [ ] Wrong-answer guidance uses meaning hints.
- [ ] Build succeeds.
- [ ] The child can explain at least three modal jobs without looking at the answer options.
