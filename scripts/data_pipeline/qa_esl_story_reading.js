const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const BASE = path.join(ROOT, 'public', 'db', 'esl', 'story_reading');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function countWords(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

function validateQuestion(question, seenIds, context) {
  const errors = [];
  ['id', 'type', 'prompt', 'explanation', 'skill', 'reviewTopic'].forEach((field) => {
    if (!question[field]) errors.push(`${context}: missing ${field}`);
  });

  if (question.id) {
    if (seenIds.has(question.id)) errors.push(`${context}: duplicate question id ${question.id}`);
    seenIds.add(question.id);
  }

  if (question.type === 'true_false') {
    if (typeof question.answer !== 'boolean') errors.push(`${context}: true_false answer must be boolean`);
  } else if (question.type === 'multiple_choice') {
    if (!Array.isArray(question.options) || question.options.length !== 3) {
      errors.push(`${context}: multiple_choice must have exactly 3 options`);
    }
    if (!Number.isInteger(question.answerIndex) || question.answerIndex < 0 || question.answerIndex >= (question.options || []).length) {
      errors.push(`${context}: invalid answerIndex`);
    }
  } else {
    errors.push(`${context}: unsupported question type ${question.type}`);
  }

  return errors;
}

function validate() {
  const errors = [];
  const manifestPath = path.join(BASE, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Missing ${path.relative(ROOT, manifestPath)}`);
  }

  const manifest = readJson(manifestPath);
  const storyEntry = manifest.stories?.find((story) => story.id === 'harrypotter_episode1') || manifest.stories?.[0];
  if (!storyEntry) {
    throw new Error('Manifest has no story entries');
  }

  const storyPath = path.join(BASE, storyEntry.file.replace(/^db\/esl\/story_reading\//, ''));
  if (!fs.existsSync(storyPath)) {
    throw new Error(`Missing ${path.relative(ROOT, storyPath)}`);
  }

  const story = readJson(storyPath);
  if (!Array.isArray(story.chapters) || story.chapters.length !== 17) {
    errors.push(`Story must contain exactly 17 chapters; found ${story.chapters?.length || 0}`);
  }

  const seenIds = new Set();
  let totalPages = 0;
  let totalQuestions = 0;

  for (const chapterEntry of story.chapters || []) {
    const chapterPath = path.join(path.dirname(storyPath), chapterEntry.file);
    if (!fs.existsSync(chapterPath)) {
      errors.push(`Missing chapter file: ${path.relative(ROOT, chapterPath)}`);
      continue;
    }

    const chapter = readJson(chapterPath);
    if (!Array.isArray(chapter.pages) || chapter.pages.length === 0) {
      errors.push(`${chapterEntry.chapterId}: no pages`);
      continue;
    }

    chapter.pages.forEach((page, index) => {
      totalPages++;
      const context = `${chapter.chapterId} page ${page.pageNumber || index + 1}`;
      if (!page.pageId) errors.push(`${context}: missing pageId`);
      if (!page.sourceText) errors.push(`${context}: missing sourceText`);
      if (!page.unlockRule?.mustAnswerAllInlineQuestions) errors.push(`${context}: missing unlock rule`);
      const words = countWords(page.sourceText);
      const isLastPage = index === chapter.pages.length - 1;
      if (!isLastPage && (words < 120 || words > 280)) errors.push(`${context}: sourceText has ${words} words`);
      if (!Array.isArray(page.inlineQuestions) || page.inlineQuestions.length < 2) {
        errors.push(`${context}: must have at least 2 inline questions`);
      } else {
        totalQuestions += page.inlineQuestions.length;
        page.inlineQuestions.forEach((question, questionIndex) => {
          errors.push(...validateQuestion(question, seenIds, `${context} question ${questionIndex + 1}`));
        });
      }
    });
  }

  console.log('=== ESL Story Reading QA ===');
  console.log(`Story: ${story.title || story.id}`);
  console.log(`Chapters: ${story.chapters?.length || 0}`);
  console.log(`Pages: ${totalPages}`);
  console.log(`Questions: ${totalQuestions}`);

  if (errors.length) {
    errors.forEach((error) => console.error(`[Error] ${error}`));
    console.error(`Failed with ${errors.length} errors.`);
    process.exit(1);
  }

  console.log('Passed.');
}

try {
  validate();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
