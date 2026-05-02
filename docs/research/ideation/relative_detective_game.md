# Relative Clauses Game: "Relative Detective"

## Objective
A game for Grade 3 ESL students to teach defining relative clauses: who, which, whose, that, where.

## Pedagogical Context
Based on `docs/requirements/study-materials/grade3/esl/ESL-Review.md` (Section 9):
- **who**: people
- **which**: things
- **that**: people/things
- **where**: places
- **whose**: possession

**Structure**: Noun + who/which/that/where/whose + clause
**Example**: The boy who is running is my brother.

## Game Mechanics: The 2-Step Loop
The game uses a two-step mechanic combining "Tense Signal" (spotting the signal) and "Review Quiz" (vertical scrolling selection).

### Step 1: Signal Spotting (The Clue)
- **UI**: A sentence is displayed with a blank for the relative pronoun. Example: `Find the dog ___ has spots.`
- **Action**: The player must tap the noun immediately preceding the blank (the "signal word" that dictates which pronoun to use).
- **Feedback**:
  - Correct tap (on "dog"): The word is highlighted, playing a success sound, and the game moves to Step 2.
  - Incorrect tap: Shake animation and a hint (e.g., "Look at the word right before the blank! Is it a person, thing, or place?").

### Step 2: Pronoun Selection (The Scroll)
- **UI**: A vertical scrolling list of options (who, which, whose, that, where) appears below or over the blank.
- **Action**: The player scrolls to select the correct relative pronoun.
- **Feedback**:
  - Correct choice: The sentence is completed, a "case solved" animation plays, and they move to the next clue.
  - Incorrect choice: The option turns red, shakes, and the player can try another option.

## Sample Data (Clues)
1. `Find the dog ___ has spots.` -> Signal: `dog`, Answer: `which` (or `that`)
2. `Question the suspect ___ is wearing a red hat.` -> Signal: `suspect`, Answer: `who` (or `that`)
3. `Go to the room ___ the treasure is hidden.` -> Signal: `room`, Answer: `where`
4. `I met a girl ___ cat was lost.` -> Signal: `girl`, Answer: `whose`
5. `This is the book ___ I read yesterday.` -> Signal: `book`, Answer: `which` (or `that`)

## UI / UX
- **Theme**: Detective, magnifying glass, clues, folders.
- **Colors**: Mysterous but kid-friendly. Deep blues, magnifying glass icons, "top secret" stamps for correct answers.
- **Layout**: Follows the standard `game-journey.css` full-screen container with a back button.