/**
 * relativeDetectiveData.js
 * Question bank for the Relative Detective game.
 */

export const RELATIVE_DETECTIVE_QUESTIONS = [
  {
    id: 1,
    sentence: "Find the dog that has spots.",
    targetNoun: "dog",
    correctPronoun: "that",
    distractors: ["who", "where", "whose", "which"],
    hint: "It's an animal, but 'which' isn't here? Try another one that works for things!"
  },
  {
    id: 2,
    sentence: "Question the suspect who is wearing a red hat.",
    targetNoun: "suspect",
    correctPronoun: "who",
    distractors: ["which", "where", "whose", "that"],
    hint: "A suspect is a person!"
  },
  {
    id: 3,
    sentence: "Go to the room where the treasure is hidden.",
    targetNoun: "room",
    correctPronoun: "where",
    distractors: ["who", "which", "whose", "that"],
    hint: "A room is a place!"
  },
  {
    id: 4,
    sentence: "I met a girl whose cat was lost.",
    targetNoun: "girl",
    correctPronoun: "whose",
    distractors: ["who", "which", "where", "that"],
    hint: "The cat belongs to the girl (possession)."
  },
  {
    id: 5,
    sentence: "This is the book which I read yesterday.",
    targetNoun: "book",
    correctPronoun: "which",
    distractors: ["who", "where", "whose", "that"],
    hint: "A book is a thing!"
  },
  {
    id: 6,
    sentence: "Look at the boy who is running fast.",
    targetNoun: "boy",
    correctPronoun: "who",
    distractors: ["which", "where", "whose", "that"],
    hint: "A boy is a person!"
  },
  {
    id: 7,
    sentence: "That is the house where I was born.",
    targetNoun: "house",
    correctPronoun: "where",
    distractors: ["who", "which", "whose", "that"],
    hint: "A house is a place!"
  },
  {
    id: 8,
    sentence: "She is the woman whose car was stolen.",
    targetNoun: "woman",
    correctPronoun: "whose",
    distractors: ["who", "which", "where", "that"],
    hint: "The car belongs to the woman."
  },
  {
    id: 9,
    sentence: "He lost the pen that I gave him.",
    targetNoun: "pen",
    correctPronoun: "that",
    distractors: ["who", "where", "whose", "which"],
    hint: "A pen is a thing!"
  },
  {
    id: 10,
    sentence: "The museum which we visited was amazing.",
    targetNoun: "museum",
    correctPronoun: "which",
    distractors: ["who", "where", "whose", "that"],
    hint: "A museum is a thing (or a place, but here it's an object of the visit)."
  }
];
