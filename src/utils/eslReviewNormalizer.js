const OPTION_KEYS = ['option_A', 'option_B', 'option_C', 'option_D', 'option_E', 'option_F', 'option_G', 'option_H', 'option_I', 'option_J'];

const clean = (value) => (value === null || value === undefined ? '' : String(value).trim());

const splitWordBank = (value) => {
  if (Array.isArray(value)) return value.map(clean).filter(Boolean);
  return clean(value)
    .split(',')
    .map((part) => clean(part))
    .filter(Boolean);
};

const getOptions = (raw, limit = OPTION_KEYS.length) => OPTION_KEYS
  .slice(0, limit)
  .map((key) => clean(raw[key]))
  .filter(Boolean);

const baseQuestion = (raw, bank, type) => ({
  id: `${bank}-${raw.question_number || raw.answer || raw.term || raw.question}`,
  type,
  bank,
  source: raw.source || '',
  category: raw.category || '',
  question_number: raw.question_number,
  prompt: raw.question || '',
  question: raw.question || '',
  explanation: raw.category || '',
  raw,
});

export const normalizeMultipleChoice = (raw, bank = 'multiple_choice') => {
  const options = getOptions(raw, 4);
  const answer = clean(raw.answer_text || raw.answer);

  return {
    ...baseQuestion(raw, bank, 'multipleChoice'),
    definition: raw.question || '',
    word: answer,
    correctAnswer: answer,
    answer,
    answer_text: answer,
    options,
    passage: raw.passage || '',
    example: raw.passage || '',
  };
};

export const normalizeMatching = (raw, bank = 'matching') => {
  const answer = clean(raw.answer_text || raw.answer);

  return {
    ...baseQuestion(raw, bank, 'matching'),
    term: clean(raw.term),
    word: clean(raw.term),
    definition: answer,
    correctAnswer: answer,
    answer,
    answer_text: answer,
    options: getOptions(raw),
  };
};

export const normalizeWordBank = (raw, bank) => {
  const answer = clean(raw.answer || raw.answer_text);
  const wordBank = splitWordBank(raw.word_bank);

  return {
    ...baseQuestion(raw, bank, 'wordBank'),
    sentence: raw.question || '',
    passage: raw.passage || '',
    wordBank,
    word_bank: wordBank,
    word: answer,
    correctAnswer: answer,
    answer,
    answer_text: answer,
  };
};

export const normalizeReadingFind = (raw, bank = 'reading_find_words') => {
  const answer = clean(raw.answer || raw.answer_text);

  return {
    ...baseQuestion(raw, bank, 'readingFind'),
    passage: raw.passage || '',
    word: answer,
    correctAnswer: answer,
    answer,
    answer_text: answer,
    options: [answer],
  };
};

export const normalizeShortAnswer = (raw, bank = 'reading_short_answer') => {
  const answer = clean(raw.answer || raw.answer_text);

  return {
    ...baseQuestion(raw, bank, 'shortAnswer'),
    passage: raw.passage || '',
    word: answer,
    correctAnswer: answer,
    answer,
    answer_text: answer,
    options: [answer],
  };
};

export const normalizeEslReviewBank = (bank, items = []) => {
  switch (bank) {
    case 'multiple_choice':
      return items.map((item) => normalizeMultipleChoice(item, bank));
    case 'matching':
      return items.map((item) => normalizeMatching(item, bank));
    case 'fill_given_words':
    case 'fill_passage':
    case 'grammar_completion':
      return items.map((item) => normalizeWordBank(item, bank));
    case 'reading_find_words':
      return items.map((item) => normalizeReadingFind(item, bank));
    case 'reading_short_answer':
      return items.map((item) => normalizeShortAnswer(item, bank));
    default:
      return items.map((item) => baseQuestion(item, bank, 'review'));
  }
};

export const normalizeEslReviewQuestions = (banks = {}) => Object.fromEntries(
  Object.entries(banks).map(([bank, items]) => [bank, normalizeEslReviewBank(bank, items)])
);

export const makeReviewResultQuestion = (question) => ({
  ...question,
  word: question.correctAnswer || question.answer_text || question.answer || question.word,
  definition: question.prompt || question.question || question.definition || '',
  example: question.passage || question.example || '',
  explanation: question.explanation || question.category || '',
  vietnamese: question.source || '',
});
