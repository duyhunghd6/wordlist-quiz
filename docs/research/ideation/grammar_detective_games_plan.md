# Grammar Detective Games: Research and Implementation Plan

<!-- unid-meta
unid: research:grade3-esl:grammar-detective-games-plan
fulfills: []
-->

## Purpose

This document defines three detective-style grammar games for a Vietnamese primary-school ESL learner who is currently weak in:

1. obligation vs. possibility modals: `must`, `have to`, `had to`, `may`, `might`, `could`
2. past continuous completion: `was/were + V-ing`
3. future choice: `will` vs. `be going to`

The games reuse the proven `Relative Detective` learning loop: the learner first identifies the clue in the sentence, then chooses the grammar form. This prevents random guessing and trains the underlying diagnostic habit: find the signal, decide the meaning, then choose the form.

## Research Basis

The design is grounded in the existing ESL game research in this repository:

- `docs/research/Interactive ESL Tense App Design.md`
- `docs/research/ideation/relative_detective_game.md`
- `docs/research/ideation/tenses_game_ideation.md`

Key principles applied:

1. Presentation-Practice-Production: each game begins with highly scaffolded clue spotting, moves into controlled grammar selection, then later supports mixed review.
2. Test-Teach-Test: the first session can diagnose whether the learner fails at clue detection, meaning classification, or form selection.
3. Active recall: the learner must choose, not just read, the grammar clue and the answer.
4. Dual coding: clues should be supported by icons, color, timelines, and sound effects.
5. Dynamic Difficulty Adjustment: wrong answers reduce option count and increase clue highlighting; correct streaks increase distractor similarity.
6. Spaced Repetition: failed grammar concepts reappear sooner than mastered ones.
7. Child-safe UX: no time pressure, large touch targets, immediate feedback, and a friendly mascot/mentor.

## Why These Games Are Robust

These games are robust because they do not only drill answers. They isolate the exact subskill that causes failure.

A normal worksheet asks:

> Students ___ wear uniforms at school every day.

The child may guess from memory. The app should instead ask in stages:

1. Which word tells you the meaning? `every day`, `school`, or `students`?
2. Is this a rule/duty or a maybe idea?
3. Which form matches that meaning?

This makes the system diagnostically robust. If the child gets the final answer wrong, the app can know why:

- wrong clue: the child does not know what to look at
- right clue, wrong meaning: the child sees the clue but misclassifies it
- right meaning, wrong form: the child knows the idea but not the grammar form

The games also handle Vietnamese learner risks. Vietnamese does not require the same auxiliary system as English, so children often omit `be` in continuous forms or treat `will` as a general future marker. The mechanics force auxiliaries to become visible pieces of meaning, not invisible grammar rules.

## Shared Game Architecture

All three games should use the same two-step detective loop.

### Step 1: Clue Spotting

The sentence appears with a blank. The learner taps the clue word or clue phrase.

Examples:

- `not completely sure` signals possibility
- `Yesterday` signals past obligation
- `when my mother called` signals past continuous background action
- `Look at those black clouds` signals `be going to` because there is visible evidence

### Step 2: Grammar Selection

Only after the clue is found do answer options appear.

The options should start small and become harder:

- beginner: two choices
- developing: three or four choices
- mastery: full mixed set

### Step 3: Feedback and Retry

Wrong answers should not immediately end the question. The learner retries with a short explanation.

Good feedback format:

1. Name the clue.
2. Name the meaning.
3. Show the grammar form.
4. Show the completed sentence.

Example:

> Clue: `not completely sure`. Meaning: maybe. Form: `might + base verb`. Answer: `She might be at home now.`

### Step 4: Mastery Tracking

Each item should track separate skill tags:

- `clue_detection`
- `meaning_classification`
- `form_selection`
- `subject_aux_agreement`
- `base_verb_after_modal`
- `was_were_agreement`
- `future_plan_vs_prediction`

This allows targeted review instead of repeating random questions.

## Game 1: Modal Detective — Rule or Maybe?

<!-- unid-meta
unid: research:grade3-esl:modal-detective-plan
fulfills: [research:grade3-esl:grammar-detective-games-plan]
-->

### Learning Goal

The child learns to distinguish obligation/necessity from possibility/uncertainty.

### Target Forms

| Meaning | Form | Child-facing explanation |
|---|---|---|
| strong rule | `must + V` | The rule says yes. |
| duty/need | `have to + V` | I need to do it. |
| past duty/need | `had to + V` | I needed to do it before. |
| possibility | `may + V` | Maybe yes. |
| possibility | `might + V` | Maybe yes, but not sure. |
| possibility/possible choice | `could + V` | It is possible. |

### Core Misconceptions Addressed

1. Treating all modals as interchangeable.
2. Choosing `must` for possible events because it feels strong.
3. Missing past time clues and choosing `have to` instead of `had to`.
4. Forgetting that modal verbs are followed by the base verb.

### Visual Design

The screen shows two detective folders:

- Rule Folder: `must`, `have to`, `had to`
- Maybe Folder: `may`, `might`, `could`

The clue phrase glows after the learner taps it. The folder then opens and presents answer choices.

### Robustness Features

- If the learner taps a subject instead of a clue, the game says: `Look for the reason word: rule, time, or maybe clue.`
- If the learner chooses `have to` for a past sentence, the game highlights `Yesterday` and asks: `Is this now or before?`
- If the learner chooses `must` for uncertainty, the game highlights `not sure`, `maybe`, or `if`.
- If the learner repeatedly confuses `may/might/could`, accept one target answer but show that all three belong to the Maybe family where context allows.

## Game 2: Action Freeze Detective — What Was Happening?

<!-- unid-meta
unid: research:grade3-esl:action-freeze-detective-plan
fulfills: [research:grade3-esl:grammar-detective-games-plan]
-->

### Learning Goal

The child learns that past continuous describes an action that was happening at a past time, often interrupted by a short past action.

### Target Form

| Subject | Form |
|---|---|
| I / he / she / it | `was + V-ing` |
| you / we / they | `were + V-ing` |

### Core Misconceptions Addressed

1. Using only `V-ing` without `was/were`.
2. Choosing simple past for the long background action.
3. Not using subject agreement: `he were`, `they was`.
4. Not recognizing `when` and `while` as time relationship clues.

### Visual Design

The game shows a frozen scene:

- a long action bar for the background action
- a lightning flash or camera flash for the short interrupting action

Example:

`I ___ TV when my mother called me.`

The learner taps the background action `watch TV`, then builds `was watching`.

### Robustness Features

- The `be` auxiliary is a required puzzle piece, not hidden in the answer.
- The game separates subject choice from verb-ing choice.
- `when` questions show a long bar plus a short point.
- `while` questions show two long bars happening together.
- If the learner selects `watched`, the game animates it as a finished dot and contrasts it with the long action bar.

## Game 3: Future Forecast Detective — Plan, Evidence, or Decision?

<!-- unid-meta
unid: research:grade3-esl:future-forecast-detective-plan
fulfills: [research:grade3-esl:grammar-detective-games-plan]
-->

### Learning Goal

The child learns when to choose `will` and when to choose `be going to`.

### Target Forms

| Meaning | Form | Child-facing explanation |
|---|---|---|
| instant decision | `will + V` | I decide now. |
| promise/offer | `will + V` | I promise or offer now. |
| opinion/prediction | `will + V` | I think this future is true. |
| plan/intention | `am/is/are going to + V` | I already planned it. |
| visible evidence | `am/is/are going to + V` | I can see it coming. |

### Core Misconceptions Addressed

1. Using `will` for every future sentence.
2. Missing evidence clues like dark clouds, a glass near the edge, or someone running too fast.
3. Missing plan clues like bought tickets, booked a hotel, packed bags, or decided.
4. Choosing the wrong `be` form in `be going to`.

### Visual Design

The learner sorts the clue into one of three forecast lenses:

- Decision Now: `will`
- Promise/Opinion: `will`
- Plan/Evidence: `be going to`

When the answer is `be going to`, the subject agreement piece appears:

- I am going to
- he/she/it is going to
- you/we/they are going to

### Robustness Features

- The game distinguishes plan from prediction before showing forms.
- Evidence questions use pictures: clouds, falling glass, fast runner, prepared ingredients.
- Plan questions use artifacts: tickets, packed bags, calendar marks, booking confirmation.
- Opinion questions highlight `I think`, `I believe`, or `I’m sure`.

## Difficulty Progression

### Level 1: Clue Hunter

Only ask the learner to tap the clue. No grammar answer yet.

Goal: train attention.

### Level 2: Meaning Sorter

After clue spotting, ask whether the sentence means:

- rule/duty or maybe
- happening action or finished action
- decision now, plan, or evidence

Goal: train grammar meaning before grammar form.

### Level 3: Form Builder

The learner chooses or builds the correct form.

Goal: connect meaning to structure.

### Level 4: Mixed Detective Review

Questions from all three games are mixed. The learner must first identify the grammar family.

Goal: prevent pattern memorization by exercise type.

## Dynamic Difficulty Adjustment

The app should adapt after every 3 to 5 questions.

| Learner behavior | Adjustment |
|---|---|
| repeated wrong clue taps | underline or pulse the clue area |
| correct clue, wrong answer | reduce options to two contrastive choices |
| correct 3 times in a row | add closer distractors |
| slow but correct | keep difficulty, give encouraging pacing feedback |
| fast and wrong | require clue tap before options appear |
| repeated `was/were` errors | insert a mini subject-agreement round |
| repeated `will/going to` errors | show plan/evidence icon sorting before form selection |

## Spaced Repetition Plan

Each question should be stored with a concept tag and a performance score.

Suggested review timing:

- wrong item: repeat in the same session after 3 other questions
- correct after hint: repeat tomorrow
- correct without hint: repeat after 3 days
- correct twice across days: repeat after 7 days
- mastered: repeat after 14 to 35 days

The app should avoid cramming. A child who fails `past_continuous_when_interruption` should not receive 20 identical questions in a row. Instead, the app should interleave related patterns:

1. clue spotting
2. subject agreement
3. full sentence completion
4. mixed review

## Parent/Teacher Reporting

A useful report should not only show score. It should show why the child is failing.

Recommended report categories:

| Category | Example report message |
|---|---|
| clue detection | The learner often misses uncertainty clues like `not sure` and `maybe`. |
| modal meaning | The learner confuses obligation with possibility. |
| past continuous structure | The learner knows `V-ing` but often omits `was/were`. |
| subject agreement | The learner confuses `was` and `were`. |
| future meaning | The learner uses `will` for plans and visible evidence. |
| retention | The learner answers correctly in-session but needs next-day review. |

## Data Model Proposal

A question item should be richer than a normal multiple-choice prompt.

```js
{
  id: "modal-001",
  game: "modalDetective",
  sentence: "Students ___ wear uniforms at school every day.",
  blankAnswer: "have to",
  acceptableAnswers: ["have to", "must"],
  preferredAnswer: "have to",
  clueText: "every day",
  clueType: "rule_or_routine_obligation",
  meaning: "obligation",
  options: ["have to", "had to", "must", "may", "might", "could"],
  explanation: "This is a school duty/rule. Use have to or must + base verb.",
  tags: ["modal", "obligation", "routine", "base_verb_after_modal"],
  difficulty: 1
}
```

For past continuous, store the long action and interrupting action separately:

```js
{
  id: "past-cont-001",
  game: "actionFreezeDetective",
  sentence: "I ___ TV when my mother called me.",
  answer: "was watching",
  subject: "I",
  baseVerb: "watch",
  longAction: "watch TV",
  interruptingAction: "called me",
  clueText: "when my mother called me",
  explanation: "Watching was happening before the call, so use was + watching.",
  tags: ["past_continuous", "when_interruption", "was_agreement"],
  difficulty: 1
}
```

## Initial Question Bank

The first release should include at least 54 items: 18 per game. Each item includes a clue and an explanation so the game can teach after every attempt.

### Modal Detective Items

| ID | Sentence | Clue | Preferred answer | Explanation |
|---|---|---|---|---|
| modal-001 | Students ___ wear uniforms at school every day. | every day | have to | This is a regular school duty. Use `have to + base verb`. |
| modal-002 | I ___ finish my homework before I go out with my friends. | before I go out | have to | The homework is necessary before going out. |
| modal-003 | Yesterday, we ___ stay at home because it rained heavily all day. | Yesterday | had to | The obligation happened in the past, so use `had to`. |
| modal-004 | She ___ be at home now, but I’m not completely sure. | not completely sure | might | This is uncertainty. Use `might/may/could + base verb`. |
| modal-005 | They ___ arrive late because the traffic is very heavy today. | traffic is very heavy | may | Heavy traffic makes lateness possible. |
| modal-006 | You ___ bring your books to class every day. | every day | must | This sounds like a strong class rule. |
| modal-007 | He ___ forget to do his homework if he is not careful. | if he is not careful | might | It is possible, not certain. |
| modal-008 | We ___ follow the school rules at all times. | school rules | must | School rules are strong obligations. |
| modal-009 | She ___ feel very tired after working all day. | after working all day | may | Feeling tired is possible after a long day. |
| modal-010 | They ___ go to the park if the weather is nice this afternoon. | if the weather is nice | could | This is a possible plan. |
| modal-011 | I ___ clean my room because my mother told me to. | mother told me | have to | Someone requires it, so it is an obligation. |
| modal-012 | Last night, he ___ study for the test. | Last night | had to | `Last night` marks past necessity. |
| modal-013 | You ___ listen carefully to your teacher. | teacher | must | This is a classroom rule. |
| modal-014 | The baby ___ be hungry because she is crying. | because she is crying | might | Crying is a clue, but we are not completely sure. |
| modal-015 | We ___ wear helmets when we ride bikes. | helmets | must | This is a safety rule. |
| modal-016 | My dad ___ work late yesterday. | yesterday | had to | Past obligation uses `had to`. |
| modal-017 | It ___ rain tonight. The sky is very dark. | sky is very dark | may | The weather clue makes rain possible. |
| modal-018 | You ___ be quiet in the library. | library | must | A library has a quiet rule. |

### Action Freeze Detective Items

| ID | Sentence | Clue | Answer | Explanation |
|---|---|---|---|---|
| past-cont-001 | I ___ TV when my mother called me. | when my mother called me | was watching | Watching was happening before the call. |
| past-cont-002 | While they ___ football, it started to rain. | While | were playing | `While` often introduces an action in progress. |
| past-cont-003 | She ___ a book when the lights went out. | when the lights went out | was reading | Reading was the long action. |
| past-cont-004 | We ___ dinner when the phone rang. | when the phone rang | were having | Dinner was happening; the phone interrupted. |
| past-cont-005 | He ___ when the alarm went off. | when the alarm went off | was sleeping | Sleeping was already happening. |
| past-cont-006 | I ___ home when I saw an old friend. | when I saw an old friend | was walking | Walking was in progress when the meeting happened. |
| past-cont-007 | They ___ in the library all afternoon. | all afternoon | were studying | The action continued for a period of time. |
| past-cont-008 | She ___ to her teacher when I arrived. | when I arrived | was talking | Talking was happening at that moment. |
| past-cont-009 | We ___ for the bus when it began to rain. | when it began to rain | were waiting | Waiting was the background action. |
| past-cont-010 | He ___ to work when the accident happened. | when the accident happened | was driving | Driving was interrupted by the accident. |
| past-cont-011 | My sister ___ music when I entered the room. | when I entered the room | was listening to | Listening was already happening. |
| past-cont-012 | The children ___ loudly while the teacher was writing. | while | were talking | Two long actions were happening at the same time. |
| past-cont-013 | I ___ my teeth when the water stopped. | when the water stopped | was brushing | Brushing was in progress. |
| past-cont-014 | Dad ___ dinner when we came home. | when we came home | was cooking | Cooking was already happening. |
| past-cont-015 | The dog ___ in the garden when it saw a cat. | when it saw a cat | was running | Running was the long action. |
| past-cont-016 | We ___ English at 8 o’clock yesterday morning. | at 8 o’clock yesterday morning | were learning | At a specific past time, the action was happening. |
| past-cont-017 | She ___ a picture while I was doing homework. | while I was doing homework | was drawing | Two long actions happened together. |
| past-cont-018 | They ___ home when the storm started. | when the storm started | were going | Going home was happening before the storm started. |

### Future Forecast Detective Items

| ID | Sentence | Clue | Answer | Explanation |
|---|---|---|---|---|
| future-001 | Look at those black clouds. It ___ rain. | black clouds | is going to | We can see evidence now. |
| future-002 | I think he ___ pass the exam. | I think | will | Opinion or prediction uses `will`. |
| future-003 | She bought a ticket yesterday. She ___ watch a movie tonight. | bought a ticket | is going to | The ticket shows a plan. |
| future-004 | I’m thirsty. I ___ get some water. | I’m thirsty | will | The speaker decides now. |
| future-005 | They have packed their bags. They ___ travel tomorrow. | packed their bags | are going to | Preparation shows a plan. |
| future-006 | Be careful! You ___ fall! | Be careful | are going to | We can see danger now. |
| future-007 | I promise I ___ help you. | I promise | will | Promises use `will`. |
| future-008 | We decided last week. We ___ visit Grandma on Sunday. | decided last week | are going to | A past decision means a plan. |
| future-009 | Maybe she ___ come later. | Maybe | will | This is a simple prediction about the future. |
| future-010 | He is running too fast. He ___ hurt himself. | running too fast | is going to | Present evidence shows a likely result. |
| future-011 | I forgot my pencil. I ___ borrow one from Nam. | forgot my pencil | will | The speaker decides now. |
| future-012 | My mother has vegetables and meat ready. She ___ cook soup. | vegetables and meat ready | is going to | Preparation shows intention. |
| future-013 | I’m sure you ___ like this game. | I’m sure | will | Confidence or opinion about the future uses `will`. |
| future-014 | We booked a hotel. We ___ stay in Da Nang. | booked a hotel | are going to | Booking shows a plan. |
| future-015 | The glass is near the edge. It ___ fall. | near the edge | is going to | Visible evidence shows what is likely to happen. |
| future-016 | Don’t worry. I ___ call the teacher. | Don’t worry | will | This is an offer or decision now. |
| future-017 | She has her sports shoes on. She ___ play basketball. | sports shoes on | is going to | Present evidence shows intention. |
| future-018 | I believe robots ___ help people more in the future. | I believe | will | Belief or prediction uses `will`. |

## Implementation Plan

### Phase 1: Data and Diagnostics

1. Create three data files or one combined grammar detective dataset.
2. Include clue, answer, accepted answers, explanation, tags, and difficulty.
3. Store each attempt with clue correctness and answer correctness separately.

### Phase 2: Shared Detective Engine

Build a reusable two-step component:

1. render sentence with blank
2. allow clue phrase selection
3. highlight correct clue
4. render answer options
5. show explanation
6. emit completion metrics

This should reduce duplication across the three games.

### Phase 3: Game-Specific Visual Layers

Add thematic layers on top of the shared engine:

- Modal Detective: rule folder vs maybe folder
- Action Freeze Detective: long action bar and short interruption flash
- Future Forecast Detective: plan/evidence/decision forecast lens

### Phase 4: Adaptive Review

Use tags to choose review items. Failed tags should reappear in later sessions.

### Phase 5: Parent Report

Report the child’s weakness by skill tag, not just score.

## Success Criteria

A first implementation is successful if:

1. The child cannot answer before tapping the clue.
2. Every wrong answer gives a short explanation.
3. Past continuous questions always make `was/were` visible.
4. Future questions separate plan/evidence from instant decision/opinion.
5. Modal questions separate rule/duty from possibility.
6. The game stores enough data to identify the learner’s exact weakness.
7. The session avoids timers and supports retry.
8. Previously failed tags reappear in spaced review.

## Recommended First Build

Build `Modal Detective` first because it directly matches the observed worksheet failure and has the simplest visual model. Then build `Action Freeze Detective`, because past continuous requires stronger visual support. Build `Future Forecast Detective` third, because `will` vs `be going to` depends on a subtler distinction between decision, plan, opinion, and evidence.

The three games should eventually be combined into a mixed `Grammar Detective Review` mode so the learner must identify the grammar family instead of relying on the exercise title.
