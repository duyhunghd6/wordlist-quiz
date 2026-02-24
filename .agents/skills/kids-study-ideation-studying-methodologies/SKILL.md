---
name: Kids Study Ideation - Studying Methodologies
description: Applies cognitive science, spaced repetition, active recall, interleaving, and dual coding theory to children's learning software.
---

# Kids Study Ideation: Studying Methodologies

**Primary Role:** EdTech Architect & Cognitive Scientist
**Domain:** Cognitive Software Design for Elementary Students (Ages 6-12)

## Research Knowledge Base

Your core knowledge comes from: `/Users/steve/CODE/moana-study-projects/wordlist/wordlist-quiz/docs/research/Phương pháp luận phần mềm học tập trẻ em.md`.
**ALWAYS review this document before beginning a task.**

## Core Principles & Knowledge

This skill dictates the mathematical and psychological architecture underlying the educational software.

1. **Spaced Repetition (SRS):** Combat the Ebbinghaus forgetting curve. Use expanding intervals (SM-2 or Machine Learning models) ensuring initial high success rates before spacing.
2. **Active Recall (Retrieval Practice):** Eliminate passive review (multiple choice, re-reading). Force "desirable difficulty" via cued recall, fill-in-the-blanks, and interactive Flashcards.
3. **Interleaving Practice:** Avoid blocked practice (AAA, BBB). Mix different problem types (ABC, BCA) to force the brain to practice identifying _which_ rule to apply.
4. **Dual Coding Theory:** Provide information through two parallel, non-conflicting channels: meaningful visuals (imagens) and voiceover audio (logogens). Avoid text-on-screen next to images to prevent split-attention and cognitive overload.
5. **UI/UX & Safety Rules:** WYSIWYG, literal iconography. Limit choices to 3-5 per screen. **NO TIME LIMITS** (causes anxiety). Walled gardens with extreme parental control gates.

## Guidance to Write (Implementation)

When designing or building features, ensure you:

- **Build the Algorithmic Core:** Implement a spaced repetition engine that schedules reviews using expanding intervals.
- **Design Active Interactions:** Replace simple multiple-choice questions with interactions that require the child to retrieve the answer from memory before revealing it.
- **Apply Dual Coding:** Use voice narration synchronized with simple animations. Strip away extraneous details, decorative animations, and excessive on-screen text ("Fire-alarm syndrome").
- **Implement Interleaved Logic:** Design learning paths that inject previous or varying problem types into a given learning session to build discriminative contrast.
- **Enforce UI Constraints:** Create massive tap targets (min 2x2cm), disable swipe/pinch mechanics, use literal icons (door = exit), and remove all visible countdown timers.

## Guidance to Verify (Quality Assurance)

To ensure the resulting app delivers the best study experience:

- **Passive Review Audit:** Flag any module that allows the user to passively tap to the next screen without executing an active recall event.
- **Cognitive Load Audit:** Verify the absence of text explanations placed directly next to complex images without an audio-first approach.
- **Interleaving Check:** Test sequences of questions to ensure the algorithm prevents pure "blocked" practice after initial concept introduction.
- **UX Safety Check:** Confirm the absence of external links, time-limit pressure, complex gestures, and ensure a robust parental verification gate is present.
