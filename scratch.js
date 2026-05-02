const fs = require('fs');
const banks = require('./docs/requirements/study-materials/grade3/esl/esl_review_tenses_grammar_completion_questions.json');
const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
const simpleGrammar = (banks || [])
  .filter((item) => !item.answer.includes(';'))
  .map((item, _, arr) => {
    const distractors = arr
      .filter(a => a.answer !== item.answer)
      .map(a => a.answer)
      .slice(0, 3);
    return { ...item, options: shuffle([...new Set([item.answer, ...distractors])]).slice(0, 4) };
  });

const workQ = simpleGrammar.find(q => q.answer === 'work');
console.log("Work Question:", workQ);
