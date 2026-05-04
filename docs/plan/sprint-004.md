# Sprint 004: Robust Grammar Detective Question Bank

<!-- unid-meta
unid: plan:sprint-004:robust-grammar-detective-question-bank
fulfills: [plan:sprint-002:grammar-detective-games, plan:sprint-003:modal-detective-deepening]
-->

## Summary

Sprint 004 strengthens the Grammar Detective question bank so the learner can clearly decide which grammar structure belongs in each scenario.

The goal is not only to add more questions. The goal is to make the bank pedagogically robust: every question should teach a clear scenario, every wrong option should represent a meaningful confusion, and every explanation should help the child say:

> I use this word or structure because this clue tells me this meaning.

This sprint focuses on three Grammar Detective areas:

1. Modal discrimination: `can`, `could`, `may`, `might`, `must`, `have to`, `had to`
2. Past continuous discrimination: `was/were + V-ing` vs. short past actions and subject agreement
3. Future discrimination: `will` vs. `am/is/are going to`

The learner is a Vietnamese primary-school ESL learner, so the question design must directly fight common L1 transfer patterns: missing auxiliaries, weak tense marking, over-reliance on time words without grammar form changes, and memorizing words without their job in the sentence.

Reference documents:

- `docs/plan/sprint-002.md`
- `docs/plan/sprint-003.md`
- `docs/research/Building Grammar Skills for Vietnamese Kids.md`

## Sprint Objectives

### Learning Objectives

- Make grammar choice scenario-based, not word-memorization-based.
- Train the learner to separate meaning, clue, and form.
- Build contrastive discrimination between commonly confused answers.
- Reduce confusion caused by Vietnamese-to-English transfer.
- Teach the child to explain grammar choices in simple language.
- Make auxiliaries visible as required sentence parts.
- Give enough repeated, varied examples for each grammar job.

### Product Objectives

- Expand and rebalance the Grammar Detective question bank.
- Add clearer scenario metadata to each question.
- Add contrast sets so the app can present near-miss choices intentionally.
- Improve child-facing explanations and hints.
- Add data validation rules that catch ambiguous or weak questions.
- Prepare the bank for future adaptive review by weakness tag.

### Engineering Objectives

- Keep the existing shared Grammar Detective engine.
- Avoid creating separate one-off game components.
- Extend question data in a way that remains readable and maintainable.
- Keep the sprint focused on data quality, validation, and small rendering support for stronger hints.
- Do not add backend storage or full SRS in this sprint.

## Scope

### In Scope

- Question-bank expansion for all three Grammar Detective modes
- Scenario taxonomy for modal, past continuous, and future forms
- Contrast-set metadata for common confusions
- Clear child-facing clue questions and meaning hints
- Stronger explanations that name the clue, meaning, and form
- Distractor rationale for wrong options
- L1 interference tags for Vietnamese learner risks
- Lightweight shape-coding metadata for auxiliaries and verb phrases
- Data validation script or validation test for question quality
- Manual QA checklist focused on ambiguity and discrimination
- Parent/teacher prompt suggestions for oral explanation practice

### Out of Scope

- Full spaced repetition scheduling
- Parent dashboard implementation
- AI-generated live question creation
- Backend analytics
- Voice recognition
- Drag-and-drop sentence building as a new game mechanic
- Mixed review mode across all grammar topics
- Full CEFR/Cambridge reporting UI

These are good later-sprint candidates after the content bank is reliable.

## Pedagogical Design Principles

<!-- unid-meta
unid: plan:sprint-004:pedagogical-design-principles
fulfills: [research:grade3-esl:vietnamese-esl-interference, research:grade3-esl:mall-grammar-design]
-->

### 1. Meaning Before Form

Children process meaning before grammar form. Each question must therefore start from a meaningful scenario:

- Can someone do it now?
- Did someone know how to do it before?
- Is someone asking permission?
- Is someone asking politely?
- Are we not sure?
- Is something a rule or duty?
- Was an action happening in the past?
- Is this a plan, visible evidence, instant decision, promise, offer, or opinion?

The answer is only correct if it matches the scenario.

### 2. One Primary Clue Per Question

Every question must have one primary clue that the child can point to. Extra context is allowed only if it supports the same meaning.

Weak item:

```text
Maybe I ___ go to the party tomorrow.
```

Better item:

```text
I am not sure. I ___ go to the party tomorrow.
```

Why: `not sure` is a clearer uncertainty clue than `tomorrow`, which only marks future time.

### 3. Contrastive Practice

The bank must include pairs or sets of similar-looking questions where the correct answer changes because the scenario changes.

Example future contrast:

| Scenario | Sentence | Answer | Reason |
| --- | --- | --- | --- |
| Plan | We bought tickets. We ___ watch a movie tonight. | are going to | The tickets show a plan. |
| Instant decision | The movie starts soon. I think I ___ watch it with you. | will | The speaker decides now. |
| Visible evidence | Look at the dark clouds. It ___ rain. | is going to | The clouds are evidence now. |
| Opinion | I think it ___ be sunny tomorrow. | will | `I think` shows an opinion or prediction. |

The child should learn that `tomorrow` is not enough. The deciding clue is plan, evidence, decision, promise, offer, or opinion.

### 4. L1 Transfer Interception

Vietnamese does not require English-style auxiliaries, articles, or verb inflections. For these games, the main risks are:

| Risk | Common learner behavior | Question-bank response |
| --- | --- | --- |
| Missing auxiliary | `He playing` instead of `He was playing` | Treat `was/were` as visible required pieces. |
| Weak tense marking | Choosing base verb after past clue | Include past-continuous vs. simple-past contrasts. |
| Modal word memorization | `could = past only` | Show `could` as past ability, polite request, possibility, and suggestion. |
| Future overgeneralization | Using `will` for every future sentence | Contrast plan/evidence with instant decision/opinion. |
| Permission confusion | Treating `may` only as maybe | Include `May I...?` permission questions. |

### 5. Visual-First Scaffolding

The content should support short visual and verbal scaffolds rather than long rule text.

Use simple labels:

- Skill now
- Skill before
- Allowed
- Polite ask
- Maybe
- Rule
- Past duty
- Happening then
- Plan
- Evidence
- Decision now
- Promise
- Offer
- Opinion

Avoid dense grammar terminology on the child-facing screen unless it is paired with a plain-language label.

## Target Question Bank

<!-- unid-meta
unid: plan:sprint-004:target-question-bank
fulfills: [plan:sprint-004:robust-grammar-detective-question-bank]
-->

Sprint 004 should produce a stronger bank, not just a larger bank.

### Recommended Minimum Counts

| Game | Current direction | Sprint 004 target | Purpose |
| --- | --- | ---: | --- |
| Modal Detective | Deepened in Sprint 003 | 60 modal items | Cover every modal job with contrast pairs. |
| Action Freeze Detective | Sprint 002 starter bank | 42 past-continuous items | Train `was/were + V-ing`, interruption, and simultaneous actions. |
| Future Forecast Detective | Sprint 002 starter bank | 48 future items | Separate plan, evidence, decision, promise, offer, and opinion. |

Total target: 150 robust questions.

This target can be phased if implementation time is limited, but the content architecture should support it.

### Modal Detective Distribution

| Modal job | Forms | Minimum items | Required contrast |
| --- | --- | ---: | --- |
| Ability now | `can` | 8 | Contrast with past ability `could`. |
| Ability before | `could` | 8 | Include clear past clues: `when I was five`, `before`, `last year`. |
| Permission | `can`, `may` | 8 | Contrast `May I...?` permission with `may` possibility. |
| Polite request | `could` | 8 | Include `please`, question form, asking another person. |
| Possibility | `may`, `might`, `could` | 12 | Include uncertainty clues: `not sure`, `maybe`, `I don't know`, `perhaps`. |
| Suggestion | `could` | 6 | Include group problem-solving: `We could...`, `You could...`. |
| Rule or strong duty | `must`, `have to` | 6 | Contrast rules with uncertainty and ability. |
| Past duty | `had to` | 4 | Include past duty clues: `yesterday`, `last night`, `when the bus was late`. |

### Action Freeze Detective Distribution

| Past-continuous job | Structure | Minimum items | Required contrast |
| --- | --- | ---: | --- |
| Singular subject | `was + V-ing` | 8 | Contrast `was` vs. `were`. |
| Plural or `you` subject | `were + V-ing` | 8 | Contrast `were` vs. `was`. |
| Background action interrupted by short action | `was/were + V-ing ... when ... V-ed` | 10 | Child identifies the long action. |
| Two long actions at the same time | `was/were + V-ing ... while ... was/were + V-ing` | 8 | Child sees both actions are happening. |
| Negative past continuous | `wasn't/weren't + V-ing` | 4 | Contrast with affirmative. |
| Question form | `Was/Were ... V-ing?` | 4 | Make auxiliary position visible. |

### Future Forecast Detective Distribution

| Future job | Structure | Minimum items | Required contrast |
| --- | --- | ---: | --- |
| Plan or intention | `am/is/are going to` | 10 | Tickets, booking, packed bag, decided plan. |
| Visible evidence | `am/is/are going to` | 10 | Clouds, broken glass, wobbling cup, sick-looking person. |
| Instant decision | `will` | 8 | Decision made at speaking time. |
| Offer | `will` | 6 | `I will help`, `I will carry it`. |
| Promise | `will` | 6 | `I promise`, `Don't worry`. |
| Opinion or prediction | `will` | 8 | `I think`, `I believe`, `probably`. |

## Expanded Data Model

<!-- unid-meta
unid: plan:sprint-004:expanded-data-model
fulfills: [plan:sprint-004:target-question-bank]
-->

Sprint 004 should extend question data with scenario and discrimination metadata.

Recommended normalized shape:

```js
{
  id: 'future-plan-001',
  game: 'futureForecastDetective',
  sentence: 'We bought tickets. We ___ watch a movie tonight.',
  clueText: 'bought tickets',
  answer: 'are going to',
  acceptedAnswers: ['are going to'],
  options: ['are going to', 'will', 'is going to', 'were going to'],
  scenario: 'plan',
  scenarioLabel: 'Plan',
  clueQuestion: 'Did they already decide or prepare?',
  meaningHint: 'The tickets show a plan before now.',
  formHint: 'Use are going to because the subject is We.',
  explanation: 'Bought tickets is the clue. This is a plan, so use are going to.',
  contrastSet: 'future-plan-vs-decision-001',
  confusionTargets: ['will', 'is going to'],
  distractorRationale: {
    will: 'Will is for a decision now, promise, offer, or opinion, not a prepared plan.',
    'is going to': 'We needs are going to, not is going to.'
  },
  l1RiskTags: ['future_overgeneralized_will', 'auxiliary_agreement'],
  shapeCode: {
    subject: 'We',
    auxiliary: 'are going to',
    verbPhrase: 'watch a movie'
  },
  tags: ['future', 'plan', 'be_going_to', 'subject_agreement'],
  difficulty: 2
}
```

### Required Fields

Every question should have:

- `id`
- `game`
- `sentence`
- `clueText`
- `answer`
- `options`
- `scenario`
- `scenarioLabel`
- `clueQuestion`
- `meaningHint`
- `formHint`
- `explanation`
- `tags`
- `difficulty`

### Recommended Fields

Use these where helpful:

- `acceptedAnswers`
- `contrastSet`
- `confusionTargets`
- `distractorRationale`
- `l1RiskTags`
- `shapeCode`
- `modalFamily`
- `futureUse`
- `auxiliary`
- `subject`
- `baseVerb`

### Explanation Formula

Every explanation should follow this short pattern:

```text
[Clue] is the clue. This means [scenario], so use [answer].
```

Examples:

```text
Not sure is the clue. This means maybe, so use might.
```

```text
When I was six is the clue. This means skill before, so use could.
```

```text
Was sleeping is the long action. It was happening when the phone rang.
```

Keep explanations to one or two child-facing sentences.

## Contrast Set Design

<!-- unid-meta
unid: plan:sprint-004:contrast-set-design
fulfills: [plan:sprint-004:robust-grammar-detective-question-bank]
-->

Contrast sets are groups of questions that look similar but require different answers because the scenario changes. They are the main tool for building discrimination ability.

### Modal Contrast Sets

#### `can` vs. `could`: Ability Now vs. Ability Before

| Sentence | Clue | Answer | Teaching point |
| --- | --- | --- | --- |
| I ___ ride a bike now. | now | can | Skill now. |
| I ___ ride a bike when I was six. | when I was six | could | Skill before. |

#### `may` Permission vs. `may/might` Possibility

| Sentence | Clue | Answer | Teaching point |
| --- | --- | --- | --- |
| ___ I come in, please? | come in, please | May | Asking permission. |
| It ___ rain later. I am not sure. | not sure | might | Maybe. |

#### Four Jobs of `could`

| Job | Sentence pattern | Clue |
| --- | --- | --- |
| Past ability | I could swim when I was five. | when I was five |
| Polite request | Could you help me, please? | you + please |
| Possibility | It could be in my bag. | maybe/not sure context |
| Suggestion | We could make a card for Mum. | one possible idea |

The bank must intentionally include all four jobs so the learner does not memorize `could = past` only.

### Past Continuous Contrast Sets

#### Long Action vs. Short Interruption

| Sentence | Target | Teaching point |
| --- | --- | --- |
| I was reading when Dad called. | was reading | Reading was happening first and longer. |
| Dad called when I was reading. | was reading | Word order changes, but the long action stays the same. |

#### `was` vs. `were`

| Subject | Correct auxiliary |
| --- | --- |
| I / he / she / it | was |
| you / we / they | were |

The bank should include near-identical pairs with only the subject changed.

### Future Contrast Sets

#### `going to` Plan vs. `will` Decision

| Sentence | Clue | Answer |
| --- | --- | --- |
| I packed my swimsuit. I ___ swim after school. | packed my swimsuit | am going to |
| The pool is open! I ___ swim now. | decision now | will |

#### `going to` Evidence vs. `will` Opinion

| Sentence | Clue | Answer |
| --- | --- | --- |
| Look at the dark clouds. It ___ rain. | dark clouds | is going to |
| I think it ___ rain tomorrow. | I think | will |

The child must learn that both can talk about the future, but the clue decides the form.

## Development Plan

<!-- unid-meta
unid: plan:sprint-004:development
fulfills: [plan:sprint-004:robust-grammar-detective-question-bank]
-->

### Milestone 1: Define Scenario Taxonomy

#### Tasks

1. Define allowed `scenario` values for each game.
2. Add a child-facing `scenarioLabel` for every scenario.
3. Define required clue types for each scenario.
4. Define common confusion targets for each scenario.
5. Document the taxonomy in or near `grammarDetectiveModes.js` or data validation code.

#### Acceptance Criteria

- Every scenario maps to one clear grammar decision.
- Scenario names are stable enough for future analytics.
- Child-facing labels are short and readable.
- No scenario overlaps so much that the answer becomes ambiguous.

### Milestone 2: Expand Modal Detective Bank

#### Tasks

1. Add or revise modal questions to reach the Sprint 004 distribution.
2. Ensure `can`, `could`, `may`, and `might` questions still meet Sprint 003 goals.
3. Add obligation and past-duty items without diluting the can/could/may/might focus.
4. Add contrast sets for `could` jobs.
5. Add `modalFamily`, `clueQuestion`, `meaningHint`, `formHint`, and `distractorRationale`.

#### Acceptance Criteria

- Modal Detective has at least 60 robust items.
- Every `could` question identifies which job `could` is doing.
- Every permission item is clearly different from possibility.
- Every possibility item includes an uncertainty clue.
- Every obligation item includes a rule, duty, or safety clue.
- Every past-duty item includes a past-time duty clue.

### Milestone 3: Expand Action Freeze Detective Bank

#### Tasks

1. Add more past-continuous items across singular, plural, interruption, simultaneous action, negative, and question forms.
2. Add subject-agreement contrast pairs.
3. Add long-action vs. short-action contrast pairs.
4. Add `shapeCode` metadata for subject, auxiliary, and verb phrase.
5. Add hints that make `was/were` visible as required auxiliaries.

#### Acceptance Criteria

- Action Freeze Detective has at least 42 robust items.
- Every item has exactly one clear long action or simultaneous-action target.
- Subject agreement is represented across `I`, `he`, `she`, `it`, `you`, `we`, and `they`.
- Wrong options include realistic errors like missing `was/were`, wrong auxiliary, or wrong verb form.
- The bank explicitly prevents the Vietnamese-pattern error of omitting the auxiliary.

### Milestone 4: Expand Future Forecast Detective Bank

#### Tasks

1. Add future questions across plan, visible evidence, instant decision, offer, promise, and opinion.
2. Add contrast sets for plan vs. decision and evidence vs. opinion.
3. Add subject-agreement coverage for `am/is/are going to`.
4. Add `futureUse`, `clueQuestion`, `meaningHint`, `formHint`, and `distractorRationale`.
5. Remove weak items where only a future time word decides the answer.

#### Acceptance Criteria

- Future Forecast Detective has at least 48 robust items.
- `Tomorrow`, `tonight`, and `next week` are never the only deciding clues.
- Every `going to` item has either a plan/preparation clue or visible evidence clue.
- Every `will` item has an instant decision, offer, promise, or opinion clue.
- `am/is/are going to` agreement is tested with realistic distractors.

### Milestone 5: Add Data Validation

#### Tasks

1. Add a lightweight validation script or test for Grammar Detective data.
2. Check that every `clueText` appears in `sentence`.
3. Check that required metadata exists for every question.
4. Check that `answer` is present in `options` or `acceptedAnswers`.
5. Check that every `scenario` is valid for the game.
6. Check that every `contrastSet` has at least two items when used.
7. Check that no explanation exceeds two child-facing sentences.
8. Check that no sentence has unsupported multiple blanks.

#### Acceptance Criteria

- Validation fails clearly when a question is ambiguous or incomplete.
- The validation output identifies the question ID and missing or invalid field.
- Build or test workflow includes the validation if simple to integrate.
- No new heavy tooling is added.

### Milestone 6: Improve Hint Rendering

#### Tasks

1. Show `meaningHint` after a correct clue tap when available.
2. Show `formHint` or `distractorRationale` after a wrong answer when available.
3. Keep generic fallback hints for older data.
4. Keep hints short enough for a child.
5. Ensure other game modes remain unaffected by missing optional metadata.

#### Acceptance Criteria

- Wrong-answer feedback is specific enough to teach the confusion.
- Feedback explains why the selected answer is wrong when possible.
- Correct-answer explanation still remains visible.
- The UI does not become text-heavy on mobile.

### Milestone 7: Content Review and Ambiguity Pass

#### Tasks

1. Review every item for one clear clue.
2. Review every distractor for pedagogical purpose.
3. Remove or rewrite items with multiple defensible answers.
4. Check that accepted answers are used only when the teaching point genuinely allows them.
5. Read explanations aloud to ensure they sound child-friendly.
6. Confirm each contrast set teaches the intended difference.

#### Acceptance Criteria

- Every question has a defensible preferred answer.
- Every wrong option is wrong for a teachable reason.
- The child can explain the clue after seeing the explanation.
- No explanation depends on adult-only grammar terminology.

## QA Plan

<!-- unid-meta
unid: plan:sprint-004:qa
fulfills: [plan:sprint-004:robust-grammar-detective-question-bank]
-->

### Automated Checks

Run existing project checks:

```bash
npm test -- --watchAll=false
npm run build
```

Also run the new Grammar Detective data validation if implemented.

### Data QA Checklist

- [ ] Every question ID is unique.
- [ ] Every question has a valid game ID.
- [ ] Every game ID has a matching mode config.
- [ ] Every question has one non-empty `clueText`.
- [ ] Every `clueText` appears in the sentence.
- [ ] Every question has `scenario`, `scenarioLabel`, `clueQuestion`, `meaningHint`, `formHint`, and `explanation`.
- [ ] Every answer appears in options or accepted answers.
- [ ] Every accepted answer is genuinely acceptable for the scenario.
- [ ] Every distractor has a rationale when it targets a known confusion.
- [ ] Every explanation is one or two child-facing sentences.
- [ ] Every contrast set has at least two items.
- [ ] No item relies only on a time word when meaning is needed.
- [ ] No item has unsupported multiple blanks.
- [ ] L1 risk tags are present for questions targeting Vietnamese transfer errors.

### Modal QA Checklist

- [ ] `can` ability-now items include present skill clues.
- [ ] `could` past-ability items include clear past clues.
- [ ] `could` polite-request items include question form and polite context.
- [ ] `could` possibility items include uncertainty context.
- [ ] `could` suggestion items clearly show one possible idea.
- [ ] `may` permission items are not confused with possibility.
- [ ] `might` items include uncertainty, not permission.
- [ ] `must` and `have to` items show rule, duty, or safety context.
- [ ] `had to` items include past duty context.

### Action Freeze QA Checklist

- [ ] Every item makes the long action clear.
- [ ] Interruption items distinguish long background action from short event.
- [ ] `while` items clearly support simultaneous long actions.
- [ ] `was` items use singular subjects.
- [ ] `were` items use plural subjects or `you`.
- [ ] Wrong options test missing auxiliary, wrong auxiliary, and wrong verb form.
- [ ] Shape-coding metadata identifies subject, auxiliary, and verb phrase where applicable.

### Future Forecast QA Checklist

- [ ] Plan items have preparation clues: tickets, booking, packing, decision already made.
- [ ] Evidence items have visible clues: clouds, danger, falling object, current symptoms.
- [ ] Instant-decision items make the decision happen now.
- [ ] Offer items show helping or volunteering.
- [ ] Promise items include promise or reassurance context.
- [ ] Opinion items include `I think`, `I believe`, or similar prediction framing.
- [ ] `am/is/are going to` agreement is correct.
- [ ] `will` is not used merely because the sentence is future time.

### Pedagogical QA Checklist

Ask after each tested item:

1. What is the clue?
2. What scenario is this?
3. Which word or structure matches that scenario?
4. Why is the other answer not right?

The expected child answer should be simple:

```text
Dark clouds are the clue. I can see evidence now, so I use is going to.
```

```text
When I was five means before. This is skill before, so I use could.
```

```text
She was reading is the long action. It was happening when Mum came in.
```

### Parent/Teacher Testing Prompt

After a short session, ask the adult to choose three missed items and ask:

- Point to the clue.
- Say the scenario in Vietnamese if needed, then in simple English.
- Say the correct English structure.
- Make one new sentence with the same scenario.

This keeps the app connected to real-world parent-child explanation without requiring the parent to know advanced grammar terminology.

## Manual Child Testing Script

Use this script after implementation.

1. Start Modal Detective.
2. Give the child one ability-now item and one past-ability item.
3. Ask: `Is this skill now or skill before?`
4. Give the child one permission item and one possibility item.
5. Ask: `Is this allowed, or maybe?`
6. Start Action Freeze Detective.
7. Ask the child to point to the action that was happening for a long time.
8. Ask: `Do we need was or were? Why?`
9. Start Future Forecast Detective.
10. Give one plan item, one evidence item, one decision item, and one opinion item.
11. Ask: `What clue tells you this?`
12. Record whether the child can explain the grammar without looking at the answer buttons.

Success means the child can discriminate scenarios, not only get a high score.

## Bug Severity Guide

| Severity | Example | Release decision |
| --- | --- | --- |
| Blocker | Data validation fails for required fields. | Do not release. |
| High | Correct answer is ambiguous or marked wrong. | Do not release. |
| High | A contrast set teaches the wrong distinction. | Do not release. |
| High | Future item uses only `tomorrow` or `next week` to decide `will` vs. `going to`. | Do not release. |
| Medium | Explanation is correct but too hard for a child. | Fix before child testing. |
| Medium | Wrong-answer feedback is generic for a known confusion. | Fix before release if possible. |
| Low | Scenario label needs friendlier wording. | Can release if learning flow is clear. |

## Sprint Execution Order

1. Define the scenario taxonomy for all three games.
2. Add metadata requirements to the existing data model.
3. Expand Modal Detective with robust contrast sets.
4. Expand Action Freeze Detective with auxiliary and long-action contrast sets.
5. Expand Future Forecast Detective with plan/evidence/decision/promise/offer/opinion contrast sets.
6. Add or update validation checks.
7. Update feedback rendering to use metadata.
8. Run data QA and automated checks.
9. Run manual child testing with scenario explanation prompts.
10. Rewrite ambiguous items discovered during testing.

## Risks and Mitigations

| Risk | Mitigation |
| --- | --- |
| More questions create more ambiguity. | Require scenario, clue question, distractor rationale, and validation checks. |
| The child memorizes labels instead of meaning. | Use contrast sets with similar sentences but different clues. |
| Explanations become too long. | Enforce the clue-meaning-form explanation formula. |
| `could` remains confusing. | Include all four `could` jobs repeatedly and label the job after clue selection. |
| `will` vs. `going to` remains subtle. | Use strong visual scenarios first: tickets, clouds, promises, offers, decisions now. |
| Past continuous feels like simple memorization. | Require the child to identify the long action before choosing the form. |
| Vietnamese L1 transfer causes auxiliary omission. | Use shape-code metadata and distractors that expose missing or wrong auxiliaries. |

## Definition of Done

Sprint 004 is done when:

- [ ] The Grammar Detective bank has the target robust coverage or an explicitly accepted phased subset.
- [ ] Every question has scenario metadata and child-facing hints.
- [ ] Every question has one clear clue.
- [ ] Every major grammar confusion has contrast-set coverage.
- [ ] Modal Detective clearly separates all modal jobs.
- [ ] Action Freeze Detective clearly teaches `was/were + V-ing` and long-action meaning.
- [ ] Future Forecast Detective clearly separates `will` and `going to` scenarios.
- [ ] Data validation passes.
- [ ] Build succeeds.
- [ ] Manual child testing shows the learner can explain at least five scenario-to-form choices.

## Next Sprint Candidates

- Mixed Grammar Detective Review mode using contrast sets
- Adaptive review by `l1RiskTags` and missed scenario
- Drag-and-drop shape-coding sentence builder
- Parent weakness report by scenario family
- Audio narration for clue questions and explanations
- Mini production tasks where the child creates a sentence for each scenario
