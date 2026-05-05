# Sprint 005: Grammar Quest — Mystery Mix Review

<!-- unid-meta
unid: plan:sprint-005:mystery-mix-review
fulfills:
  - plan:sprint-002:grammar-detective-games
  - plan:sprint-003:modal-detective-deepening
  - plan:sprint-004:robust-grammar-detective-question-bank
  - research:grade3-esl:vn-cambridge-app-blueprint
  - research:grade3-esl:gamification-grammar-retention
-->

## Summary

Sprint 005 adds one mixed grammar review game named **Grammar Quest — Mystery Mix Review**.

The game acts like a kid-friendly mixed grammar test, but it should still feel like a playful detective quest. Instead of creating new question banks, it reuses and mixes the existing banks from:

1. Inspector Tail / `InspectorTailGame`
2. Modal Detective / `modalDetective`
3. Relative Detective / `RelativeDetectiveGame`
4. Action Freeze Detective / `actionFreezeDetective`
5. Future Forecast Detective / `futureForecastDetective`

The learner chooses `5`, `10`, `20`, or `All` questions. The game must respect that selection exactly, with `All` meaning every available adapted question from the reused banks.

The key Sprint 005 learning feature is **adaptive weighted review**: when the child answers a question incorrectly, that exact question and its grammar tags gain more selection weight, so missed material appears more often in future mixed review sessions.

## Why This Sprint Matters

<!-- unid-meta
unid: plan:sprint-005:pedagogical-purpose
fulfills:
  - research:grade3-esl:vietnamese-esl-interference
  - research:grade3-esl:mall-grammar-design
  - research:grade3-esl:gamification-grammar-retention
-->

The previous grammar sprints teach specific skills in focused modes. The child now needs an integrated review loop that checks whether they can switch between grammar ideas without being told the topic first.

This matters because real reading and school tests do not say: `Now use a modal` or `Now use past continuous`. The learner must notice the clue, identify the grammar job, and choose the form.

For Vietnamese primary ESL learners, this mixed mode should especially reinforce:

- auxiliaries that are easy to omit: `was`, `were`, `am/is/are going to`
- tense and aspect markers that Vietnamese does not inflect on the verb
- pronoun and relative-clause choices that Vietnamese may omit or handle differently
- tag-question agreement and polarity reversal
- scenario-based modal and future choices instead of word memorization

The adaptive weighting keeps review low-anxiety and useful: mistakes are treated as clues for what to practice next, not as punishment.

## Product Concept

<!-- unid-meta
unid: plan:sprint-005:product-concept
fulfills:
  - plan:sprint-005:mystery-mix-review
-->

### Game Name

**Grammar Quest — Mystery Mix Review**

Child-facing subtitle options:

- `Crack the mixed grammar case!`
- `Every question is a new mystery.`
- `Find the clue. Choose the grammar. Beat the mix.`

Recommended game ID:

```text
grammarQuestMysteryMix
```

Short display name where space is limited:

```text
Mystery Mix
```

### Game Promise

The game tells the child:

> You will not know which grammar case is coming next. Find the clue first, then solve it.

### Question Sources

No new question bank should be created. Sprint 005 should only create an adapter layer that normalizes existing question sources into one mixed review item shape.

| Source game | Source data | Existing count | Mixed review role |
| --- | --- | ---: | --- |
| Modal Detective | `modalData` through `grammarDetectiveData` | 60 | Modal meaning and form choice |
| Action Freeze Detective | `actionFreezeData` through `grammarDetectiveData` | 42 | Past continuous and `was/were + V-ing` |
| Future Forecast Detective | `futureForecastData` through `grammarDetectiveData` | 48 | `will` vs. `be going to` |
| Relative Detective | `RELATIVE_DETECTIVE_QUESTIONS` | 10 | Relative pronoun discrimination |
| Inspector Tail | `public/db/tag_questions_esl.toon` or parsed runtime rows | 40 | Tag question polarity and agreement |

Expected total for `All`: about **200 questions**, depending on available parsed Inspector Tail rows.

## Scope

<!-- unid-meta
unid: plan:sprint-005:scope
fulfills:
  - plan:sprint-005:mystery-mix-review
-->

### In Scope

- New mixed review game registration
- New reusable mixed-review component or a thin wrapper around existing interactions
- Adapter functions that normalize existing game data into one review item format
- Mixing questions from Modal Detective, Action Freeze, Future Forecast, Relative Detective, and Inspector Tail
- Respecting `5`, `10`, `20`, and `All` question-count selections
- Adaptive weighted random selection based on wrong answers
- Per-question source labels so the child knows what grammar family was reviewed after answering
- Attempt tracking by question ID, source game, tags, and correctness
- Local persistence of weakness weights with `localStorage`
- Child-friendly review summary showing strongest and weakest grammar families
- Manual QA checklist for mixed sessions and adaptive selection

### Out of Scope

- Creating new grammar questions
- AI-generated question creation
- Backend analytics or accounts
- Parent dashboard implementation
- Full calendar-based spaced repetition scheduling
- Rewriting the existing source games
- Changing existing question bank content unless an adapter exposes a source-data bug
- Competitive leaderboard or timed test pressure

## Learning Design Principles

<!-- unid-meta
unid: plan:sprint-005:learning-design
fulfills:
  - research:grade3-esl:primary-language-acquisition
  - research:grade3-esl:grammar-mastery-methodologies
  - research:grade3-esl:mall-grammar-design
-->

### 1. Mixed Practice After Focused Practice

The focused detective games teach the child the grammar family. The mixed review game checks transfer: can the learner identify the grammar problem without being told the category?

### 2. Clue First, Answer Second

Where possible, keep the existing Grammar Detective habit:

1. find the clue
2. identify the grammar job
3. choose the answer
4. read the short explanation

For source games with different mechanics, the adapter should still expose a `clueText`, `prompt`, `answer`, `options`, and `explanation` when possible.

### 3. Adaptive Review Without Anxiety

Wrong answers should increase practice weight, not lower confidence. The child should see encouraging feedback like:

```text
Good detective work. This case will come back later so your brain can catch it next time.
```

### 4. Visual Family Labels After the Answer

Do not reveal the grammar family before the question, because that weakens mixed review. After the child answers, show a small badge:

- `Modal case`
- `Action Freeze case`
- `Future Forecast case`
- `Relative clue case`
- `Inspector Tail case`

### 5. Vietnamese L1 Error Tracing

Use source tags where available. When tags are missing, the adapter should add lightweight family tags:

- `auxiliary_omission_risk`
- `tense_aspect_risk`
- `relative_pronoun_risk`
- `tag_polarity_risk`
- `future_overgeneralized_will`
- `modal_meaning_confusion`

These tags drive review summaries and weighted selection.

## Architecture Plan

<!-- unid-meta
unid: plan:sprint-005:architecture
fulfills:
  - plan:sprint-005:product-concept
  - plan:sprint-005:scope
-->

### Existing Touchpoints

Expected integration points:

- `src/App.js`
  - add render case for `grammarQuestMysteryMix`
  - pass `numQuestions` and `isAllQuestions`
- `src/constants/gameConfig.js`
  - register `Grammar Quest — Mystery Mix Review`
- `src/components/GameJourney.js`
  - include the mixed review game after focused grammar modes
- `src/components/GameSelector.js`
  - show the new game card if selector requires explicit icon/color mapping
- `src/components/games/GrammarDetectiveGame.js`
  - reuse patterns for clue-first multiple choice
- `src/components/games/RelativeDetectiveGame.js`
  - reuse data and interaction ideas for relative-pronoun items
- `src/components/games/InspectorTailGame.js`
  - reuse data parsing rules for tag questions

### Proposed Files

```text
src/components/games/
  GrammarQuestMysteryMixGame.js
  GrammarQuestMysteryMixGame.css
  grammarQuestMysteryMixAdapters.js
  grammarQuestMysteryMixSelection.js
  grammarQuestMysteryMixProgress.js
```

If the implementation is small, the helpers may be colocated in fewer files. The important rule is that source banks remain separate and unchanged.

### Normalized Mixed Review Item

<!-- unid-meta
unid: plan:sprint-005:normalized-review-item
fulfills:
  - plan:sprint-005:architecture
-->

Every adapted item should become:

```js
{
  id: 'modalDetective:modal-ability-001',
  sourceGameId: 'modalDetective',
  sourceGameName: 'Modal Detective',
  reviewType: 'multiple_choice',
  prompt: 'I ___ play the piano.',
  clueText: 'play the piano',
  answer: 'can',
  acceptedAnswers: ['can'],
  options: ['can', 'could', 'may', 'might'],
  explanation: 'Playing the piano is a skill. For ability now, use can.',
  tags: ['modal', 'ability_now', 'modal_meaning_confusion'],
  difficulty: 1,
  original: sourceQuestion
}
```

The `id` must include the source game ID to prevent collisions across banks.

### Adapter Rules

<!-- unid-meta
unid: plan:sprint-005:adapter-rules
fulfills:
  - plan:sprint-005:normalized-review-item
-->

#### Grammar Detective Adapter

For Modal Detective, Action Freeze, and Future Forecast:

- use `question.id` with `sourceGameId` prefix
- map `sentence` to `prompt`
- keep `clueText`, `answer`, `acceptedAnswers`, `options`, `explanation`, `tags`, and `difficulty`
- keep `scenario`, `scenarioLabel`, `meaningHint`, `formHint`, and `distractorRationale` when available

#### Relative Detective Adapter

For `RELATIVE_DETECTIVE_QUESTIONS`:

- create ID as `relativeDetective:${id}`
- map `sentence` to `prompt`
- map `targetNoun` to `clueText`
- map `correctPronoun` to `answer`
- build `options` from `[correctPronoun, ...distractors]`
- map `hint` to `meaningHint`
- create explanation using the target noun and pronoun
- add tags such as `relative_pronoun`, `relative_pronoun_risk`

Example explanation:

```text
Dog is the clue. For this sentence, that connects the noun to the description.
```

#### Inspector Tail Adapter

For Inspector Tail rows:

- create ID as `inspectorTail:${id}`
- map `sentence_prompt` to `prompt`
- map the main statement before the blank to `clueText` when possible
- map `correct_tag` to `answer`
- build `options` from `correct_tag`, `wrong_tag_1`, and `wrong_tag_2`
- add `polarity` and `difficulty`
- add tags such as `tag_question`, `tag_polarity_risk`, `auxiliary_agreement`

Example explanation:

```text
The sentence is positive, so the tag becomes negative: isn't she.
```

### Question Count Behavior

<!-- unid-meta
unid: plan:sprint-005:question-count-selection
fulfills:
  - plan:sprint-005:scope
-->

The mixed review game must respect the selected count:

| Selection | Behavior |
| --- | --- |
| `5` | select exactly 5 adapted questions if at least 5 exist |
| `10` | select exactly 10 adapted questions if at least 10 exist |
| `20` | select exactly 20 adapted questions if at least 20 exist |
| `All` / `999` | include every adapted question once |

If fewer than the requested number exist because a source fails to load, use all available questions and show a non-blocking developer-visible warning.

`All` should not duplicate questions through weighting. It should include every adapted question once, then shuffle the full list.

## Adaptive Weighted Selection Algorithm

<!-- unid-meta
unid: plan:sprint-005:adaptive-weighting
fulfills:
  - plan:sprint-005:pedagogical-purpose
  - research:grade3-esl:vn-cambridge-app-blueprint
  - research:grade3-esl:gamification-grammar-retention
-->

### Goal

Questions the child misses should become more likely to appear in later `5`, `10`, or `20` question sessions. Related grammar families should also become slightly more likely.

### Data Stored Locally

Use `localStorage` with a versioned key:

```text
grammarQuestMysteryMix:v1:weights
```

Recommended shape:

```js
{
  questionWeights: {
    'modalDetective:modal-ability-001': 2.5
  },
  tagWeights: {
    modal_meaning_confusion: 1.4,
    auxiliary_agreement: 1.2
  },
  attempts: {
    'modalDetective:modal-ability-001': {
      seen: 3,
      wrong: 2,
      lastSeenAt: 1777939200000
    }
  }
}
```

### Base Weight Formula

For each adapted question:

```js
weight = 1
weight += questionMistakeBoost
weight += tagMistakeBoost
weight += recencyBoost
weight = clamp(weight, 0.5, 6)
```

Recommended starting values:

| Factor | Rule |
| --- | --- |
| base | every question starts at `1` |
| wrong answer | add `+1.5` to that question |
| wrong clue if tracked | add `+0.75` to that question |
| correct answer first try | subtract `0.25`, minimum `0.5` |
| wrong answer tag boost | add `+0.2` to each tag |
| repeated correct for a question | gradually decay toward `1` |
| max question weight | `6` |
| max tag weight contribution | `2` |

### Weighted Sampling Without Replacement

For `5`, `10`, and `20`, use weighted sampling without replacement:

1. compute each question weight
2. randomly choose one item proportionally to weight
3. remove it from the candidate pool
4. repeat until the selected count is reached

This prevents duplicate questions inside one short session while still favoring weak items.

### Source-Balance Guardrail

Without guardrails, one weak family could dominate every session. Use a soft source balance:

- target at least 3 source games in a 10-question session when enough source games are available
- target at least 4 source games in a 20-question session when enough source games are available
- allow 5-question sessions to be more adaptive and less balanced
- never override `All`; it already includes every item

If a question has very high weight, it can still appear, but the session should not become only one source family unless the available pool is very small.

### Weight Updates After a Session

At the end of each question:

- if correct on first answer attempt: slightly reduce question weight
- if wrong answer occurred: increase question and tag weights
- if wrong clue occurred: increase question weight lightly
- always update `seen`, `wrong`, and `lastSeenAt`

At the end of the session:

- persist updated weights to `localStorage`
- include the session weakness summary in `onComplete`

### Reset Option

Add a small developer/user-safe reset path later if needed:

```text
Reset Mystery Mix practice memory
```

This is optional for Sprint 005 unless testing needs it.

## Game Flow

<!-- unid-meta
unid: plan:sprint-005:game-flow
fulfills:
  - plan:sprint-005:product-concept
  - plan:sprint-005:adaptive-weighting
-->

Recommended flow:

1. Build adapted question pool from existing banks.
2. Load stored weakness weights.
3. Select `5`, `10`, `20`, or `All` questions.
4. Show one mixed item without announcing its source family first.
5. Ask the child to find the clue when `clueText` is available.
6. Show answer options.
7. On wrong answer, give supportive feedback and keep the child in the question.
8. On correct answer, show explanation and source-family badge.
9. Update adaptive weights.
10. Continue until session complete.
11. Show score plus strongest and weakest grammar families.

### Child-Facing Summary

At the end, show friendly messages such as:

```text
Strong cases: Future Forecast, Modal Detective
Needs more detective practice: Inspector Tail tags
```

Avoid adult-heavy analytics. Keep detailed tag data in metrics for future parent/teacher views.

## Completion Metrics

<!-- unid-meta
unid: plan:sprint-005:completion-metrics
fulfills:
  - plan:sprint-005:adaptive-weighting
-->

Recommended `onComplete` payload:

```js
onComplete({
  gameId: 'grammarQuestMysteryMix',
  totalQuestions: questions.length,
  correctAnswers: score,
  averageResponseTime,
  sourceBreakdown: {
    modalDetective: { seen: 3, correct: 2, wrong: 1 }
  },
  tagBreakdown: {
    modal_meaning_confusion: { seen: 3, wrong: 1 }
  },
  attempts: [
    {
      questionId: 'modalDetective:modal-ability-001',
      sourceGameId: 'modalDetective',
      correct: false,
      selectedAnswer: 'could',
      finalAnswer: 'can',
      wrongClueTaps: 0,
      wrongAnswerTaps: 1,
      tags: ['modal', 'ability_now'],
      responseTimeMs: 6500
    }
  ]
});
```

If the existing result system cannot store all fields, still compute them internally and pass the standard score fields.

## Development Plan

<!-- unid-meta
unid: plan:sprint-005:development
fulfills:
  - plan:sprint-005:architecture
  - plan:sprint-005:question-count-selection
  - plan:sprint-005:adaptive-weighting
-->

### Milestone 1: Register the Mixed Review Game

#### Tasks

1. Add `grammarQuestMysteryMix` to game configuration.
2. Add it to the game selector with a playful mixed-review icon and color.
3. Add it to the journey after the focused grammar games.
4. Add an `App.js` render branch.

#### Acceptance Criteria

- The game appears as **Grammar Quest — Mystery Mix Review**.
- It can be launched from the selector.
- It can be launched from the review quiz/journey path.
- It receives `numQuestions` and `isAllQuestions` correctly.

### Milestone 2: Build Source Adapters

#### Tasks

1. Create adapter for `grammarDetectiveData` items.
2. Create adapter for `RELATIVE_DETECTIVE_QUESTIONS`.
3. Reuse or extract Inspector Tail TOON parsing so tag questions can be adapted.
4. Prefix IDs by source game.
5. Add source labels and fallback tags.
6. Validate that every adapted item has prompt, answer, options, and explanation.

#### Acceptance Criteria

- No new question bank is created.
- Modal, Action Freeze, Future Forecast, Relative Detective, and Inspector Tail items all appear in the adapted pool.
- Adapted question IDs are unique.
- Source data remains unchanged.

### Milestone 3: Implement Weighted Selection

#### Tasks

1. Add local progress loader and saver.
2. Compute weights from question-level and tag-level weakness data.
3. Implement weighted sampling without replacement.
4. Implement `All` as full-pool shuffle without duplicate weighting.
5. Add source-balance guardrails for 10- and 20-question sessions.

#### Acceptance Criteria

- Wrongly answered questions become more likely in future short sessions.
- No question repeats inside a `5`, `10`, or `20` session.
- `All` includes every adapted question once.
- Selection still works if `localStorage` is unavailable.

### Milestone 4: Build Mixed Review UI

#### Tasks

1. Create `GrammarQuestMysteryMixGame.js`.
2. Use a clue-first flow when the item has `clueText`.
3. Render multiple-choice answers for normalized items.
4. Show source-family badge only after answer or explanation.
5. Show short feedback and explanation.
6. Add mobile-first styling in `GrammarQuestMysteryMixGame.css`.

#### Acceptance Criteria

- The child can complete a 5-question session.
- The child can complete a 10-question session.
- The child can complete a 20-question session.
- The child can complete an All-question session.
- Wrong answers allow retry and update weights.
- Correct answers show explanation and source family.

### Milestone 5: Track Attempts and Update Weakness Memory

#### Tasks

1. Track answer attempts per question.
2. Track clue attempts where applicable.
3. Update question and tag weights after each item.
4. Persist progress after each question or at session end.
5. Include source and tag breakdown in completion metrics.

#### Acceptance Criteria

- Refreshing after a completed session preserves adaptive weights.
- A missed item has higher stored weight than before the session.
- Correct-first-try items gradually reduce toward normal weight.
- Completion metrics identify weak source families.

### Milestone 6: Review Summary Screen

#### Tasks

1. Show total score.
2. Show strongest source families.
3. Show practice-again source families.
4. Keep the summary child-friendly and short.
5. Avoid exposing raw weights to the child.

#### Acceptance Criteria

- The child understands what to practice next.
- The screen does not feel punitive.
- The summary works for very short sessions.

### Milestone 7: QA and Tuning

#### Tasks

1. Verify all question count choices.
2. Verify all source games appear across repeated sessions.
3. Verify wrong answers increase future selection probability.
4. Verify `All` has no duplicates.
5. Tune weight constants if repeated misses appear too often or not often enough.
6. Run build and manual browser QA.

#### Acceptance Criteria

- Adaptive behavior is visible after a wrong-answer test.
- Mixed sessions remain varied.
- Source-game adapters do not break existing source games.
- Build succeeds.

## QA Plan

<!-- unid-meta
unid: plan:sprint-005:qa
fulfills:
  - plan:sprint-005:development
-->

### Automated Checks

Run existing checks:

```bash
npm run build
```

If test scripts are available and stable, also run:

```bash
npm test -- --watchAll=false
```

### Data Adapter QA Checklist

- [ ] Every adapted item has a unique ID.
- [ ] Every adapted item has `sourceGameId`.
- [ ] Every adapted item has `prompt`.
- [ ] Every adapted item has `answer`.
- [ ] Every adapted item has at least two options.
- [ ] Every adapted item includes the answer in `options` or `acceptedAnswers`.
- [ ] Every adapted item has an explanation.
- [ ] Every adapted item has tags.
- [ ] Existing source question banks are not duplicated or rewritten.

### Count Selection QA Checklist

- [ ] Selecting `5` produces 5 questions.
- [ ] Selecting `10` produces 10 questions.
- [ ] Selecting `20` produces 20 questions.
- [ ] Selecting `All` includes all adapted questions once.
- [ ] `All` does not duplicate high-weight missed questions.
- [ ] Sessions handle missing Inspector Tail fetch data gracefully.

### Adaptive Algorithm QA Checklist

- [ ] A wrong answer increases that question's stored weight.
- [ ] A wrong clue tap lightly increases that question's stored weight.
- [ ] Wrong-answer tags increase related tag weights.
- [ ] Correct-first-try answers decay question weight toward normal.
- [ ] A high-weight question appears more often across repeated short sessions.
- [ ] Weighted selection does not repeat the same question within one session.
- [ ] The selection still includes multiple source games in 10- and 20-question sessions.
- [ ] Clearing `localStorage` resets adaptation safely.

### Functional QA Checklist

- [ ] Game opens from selector.
- [ ] Game opens from journey/review quiz path.
- [ ] Home/back navigation works.
- [ ] Question prompt renders correctly for every source family.
- [ ] Clue-first flow works for Grammar Detective sources.
- [ ] Relative Detective adapted items render and complete.
- [ ] Inspector Tail adapted items render and complete.
- [ ] Wrong answer feedback appears immediately.
- [ ] Correct answer explanation appears.
- [ ] Source-family badge appears after answering, not before.
- [ ] Completion callback fires once.
- [ ] No console errors appear during normal play.

### Pedagogical QA Checklist

Ask after a mixed session:

1. Did the child look for clues instead of guessing by topic?
2. Could the child explain why the answer matched the sentence?
3. Did the mixed order reveal weak transfer between topics?
4. Did repeated weak items feel helpful rather than annoying?
5. Did the summary point to a useful next practice area?

### Manual Adaptive Test Script

1. Clear `localStorage` for `grammarQuestMysteryMix:v1:weights`.
2. Start a 5-question Mystery Mix session.
3. Intentionally answer one Modal Detective item incorrectly.
4. Finish the session.
5. Start several more 5-question sessions.
6. Confirm the missed item or related modal-tag items appear more often than a neutral item.
7. Answer that item correctly several times.
8. Confirm its weight decays toward normal.

## Risks and Mitigations

<!-- unid-meta
unid: plan:sprint-005:risks
fulfills:
  - plan:sprint-005:development
-->

| Risk | Mitigation |
| --- | --- |
| Mixed review becomes confusing because the child does not know the grammar family. | Hide the family before answering but keep clue-first scaffolding and show the family afterward. |
| One weak question appears too often and annoys the child. | Clamp max weight and use sampling without replacement per session. |
| One source game dominates short sessions. | Add soft source-balance guardrails for 10 and 20 questions. |
| Inspector Tail data is async while other banks are static imports. | Build pool after tag data loads; show loading state; continue with static banks if fetch fails. |
| Different source games have different data shapes. | Use explicit adapter functions and a normalized item shape. |
| Existing games break due to shared changes. | Keep source banks unchanged; add mixed-review adapters separately. |
| The child memorizes answers after repeated exposure. | Weight related tags as well as exact questions, so similar grammar families return too. |

## Definition of Done

<!-- unid-meta
unid: plan:sprint-005:definition-of-done
fulfills:
  - plan:sprint-005:mystery-mix-review
-->

Sprint 005 is done when:

- [ ] **Grammar Quest — Mystery Mix Review** is registered and launchable.
- [ ] The game reuses existing question banks only.
- [ ] Modal Detective, Action Freeze, Future Forecast, Relative Detective, and Inspector Tail items are included.
- [ ] `5`, `10`, `20`, and `All` question-count selections work.
- [ ] `All` includes every adapted question once.
- [ ] Wrong answers increase future selection weight.
- [ ] Correct answers decay weight toward normal over time.
- [ ] Weighted short sessions remain varied across grammar families.
- [ ] Completion metrics include source and tag breakdowns.
- [ ] Child-facing feedback stays short, visual-first, and retry-friendly.
- [ ] Build succeeds.
- [ ] Manual browser QA confirms the game can be completed from the UI.
- [ ] Manual adaptive QA confirms missed questions return more frequently.

## Next Sprint Candidates

- Parent/teacher weakness report by grammar family and L1-risk tag
- Full spaced repetition scheduling by time interval
- Audio narration for mixed review explanations
- Shape-coding review cards for missed auxiliary questions
- Mixed review difficulty levels: gentle mix, normal mix, challenge mix
- Take-home practice prompts based on the child’s weakest grammar family
