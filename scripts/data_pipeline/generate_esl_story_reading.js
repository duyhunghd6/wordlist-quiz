const fs = require('fs');
const path = require('path');
const { generateJson, DEFAULT_MODEL } = require('./lib/gemini_client');
const { loadSourceText, splitIntoChapters, splitChapterIntoPages } = require('./lib/story_source');
const chapterTable = require('./story_chapters/harrypotter_episode1_chapters');

const ROOT = path.join(__dirname, '..', '..');
const DEFAULT_SOURCE = path.join(ROOT, 'docs', 'requirements', 'study-materials', 'grade3', 'esl', 'stories', 'harrypotter-episode1.txt');
const DEFAULT_REVIEW = path.join(ROOT, 'docs', 'requirements', 'study-materials', 'grade3', 'esl', 'ESL-Review.md');
const DEFAULT_OUT = path.join(ROOT, 'public', 'db', 'esl', 'story_reading');
const STORY_ID = 'harrypotter_episode1';
const STORY_TITLE = 'Harry Potter Episode 1 ESL Reading';

function parseArgs(argv) {
  const args = {
    source: DEFAULT_SOURCE,
    review: DEFAULT_REVIEW,
    out: DEFAULT_OUT,
    model: DEFAULT_MODEL,
    pageWords: 200,
    chapter: null,
    dryRun: false,
    force: false,
    includeSourceText: false,
    ownsRights: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--source') args.source = path.resolve(argv[++i]);
    else if (arg === '--review') args.review = path.resolve(argv[++i]);
    else if (arg === '--out') args.out = path.resolve(argv[++i]);
    else if (arg === '--model') args.model = argv[++i];
    else if (arg === '--page-words') args.pageWords = Number(argv[++i]);
    else if (arg === '--chapter') args.chapter = argv[++i];
    else if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--force') args.force = true;
    else if (arg === '--include-source-text') args.includeSourceText = true;
    else if (arg === '--i-own-rights-to-source-text') args.ownsRights = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  if (!Number.isFinite(args.pageWords) || args.pageWords < 80) {
    throw new Error('--page-words must be a number >= 80');
  }
  if (args.includeSourceText && !args.ownsRights) {
    throw new Error('--include-source-text requires --i-own-rights-to-source-text');
  }
  return args;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeQuestion(pageId, question, index) {
  const base = {
    id: question.id || `${pageId}_q${String(index + 1).padStart(2, '0')}`,
    type: question.type,
    prompt: String(question.prompt || '').trim(),
    explanation: String(question.explanation || '').trim(),
    skill: String(question.skill || 'Reading comprehension').trim(),
    reviewTopic: String(question.reviewTopic || 'Reading comprehension').trim(),
  };

  if (base.type === 'true_false') {
    return { ...base, answer: Boolean(question.answer) };
  }

  if (base.type === 'multiple_choice') {
    const options = (question.options || []).map((option) => String(option).trim()).filter(Boolean).slice(0, 3);
    return { ...base, options, answerIndex: Number(question.answerIndex) };
  }

  return base;
}

function validateQuestions(pageId, questions) {
  if (!Array.isArray(questions) || questions.length < 2) {
    throw new Error(`${pageId} must have at least 2 inline questions`);
  }

  questions.forEach((question, index) => {
    if (!question.id || !question.prompt || !question.explanation || !question.skill || !question.reviewTopic) {
      throw new Error(`${pageId} question ${index + 1} is missing required fields`);
    }
    if (question.type === 'true_false') {
      if (typeof question.answer !== 'boolean') {
        throw new Error(`${question.id} true_false answer must be boolean`);
      }
    } else if (question.type === 'multiple_choice') {
      if (!Array.isArray(question.options) || question.options.length !== 3) {
        throw new Error(`${question.id} must have exactly 3 options`);
      }
      if (!Number.isInteger(question.answerIndex) || question.answerIndex < 0 || question.answerIndex >= question.options.length) {
        throw new Error(`${question.id} has invalid answerIndex`);
      }
    } else {
      throw new Error(`${question.id} has unsupported type: ${question.type}`);
    }
  });
}

function buildQuestionPrompt({ page, chapter, reviewText }) {
  return `You are creating inline questions for a Grade 3 ESL reading app.

Curriculum reference:
${reviewText}

Chapter: ${chapter.chapterNumber}. ${chapter.title}
Chapter date label: ${chapter.dateLabel}
Page id: ${page.pageId}

Story page text:
"""
${page.sourceText}
"""

Create 2 to 4 inline questions for this page. Use only these types:
1. true_false with a boolean answer field.
2. multiple_choice with exactly 3 options and answerIndex 0, 1, or 2.

Rules:
- Questions must be answerable from this page.
- Keep prompts short and clear for Grade 3 ESL learners.
- Use a mix of literal reading comprehension, vocabulary in context, and grammar noticing.
- Align each question to one topic from the curriculum reference.
- Prefer topics such as Present Simple, Past Continuous, Present Perfect, Future Forms, Obligation & Possibility, Defining Relative Clauses, Like & About, or Prepositions of Direction when the page supports them.
- Do not create trick questions.
- Do not include markdown.

Return strict JSON in this shape:
{
  "questions": [
    {
      "type": "true_false",
      "prompt": "Short statement.",
      "answer": true,
      "explanation": "One short child-friendly explanation.",
      "skill": "Reading comprehension",
      "reviewTopic": "Present Simple"
    },
    {
      "type": "multiple_choice",
      "prompt": "Short question?",
      "options": ["A. first", "B. second", "C. third"],
      "answerIndex": 1,
      "explanation": "One short child-friendly explanation.",
      "skill": "Vocabulary in context",
      "reviewTopic": "Prepositions of Direction"
    }
  ]
}`;
}

async function generatePageQuestions({ page, chapter, reviewText, model }) {
  const result = await generateJson({
    model,
    prompt: buildQuestionPrompt({ page, chapter, reviewText }),
    temperature: 0.25,
    maxOutputTokens: 2048,
  });
  const questions = (result.questions || []).map((question, index) => normalizeQuestion(page.pageId, question, index));
  validateQuestions(page.pageId, questions);
  return questions;
}

function buildStoryIndex({ storyDirName, chapters, args }) {
  return {
    id: STORY_ID,
    title: STORY_TITLE,
    version: 1,
    sourceTextIncluded: args.includeSourceText,
    source: {
      privateSourcePath: path.relative(ROOT, args.source),
      sourceTextIncluded: args.includeSourceText,
    },
    alignment: {
      reviewDoc: path.relative(ROOT, args.review),
      topics: [
        'Tag Questions',
        'Would You Like',
        'Present Simple',
        'Present Continuous',
        'Past Continuous',
        'Present Perfect',
        'Future Forms',
        'Obligation & Possibility',
        'Defining Relative Clauses',
        'Like & About',
        'Prepositions of Direction',
      ],
    },
    chapters: chapters.map((chapter) => ({
      chapterId: chapter.chapterId,
      chapterNumber: chapter.chapterNumber,
      title: chapter.title,
      dateLabel: chapter.dateLabel,
      file: `chapters/${chapter.chapterId}.json`,
      pageCount: chapter.pages.length,
      questionCount: chapter.questionCount || 0,
    })),
    storyDirName,
  };
}

function buildManifest({ args, storyIndex }) {
  return {
    name: 'ESL Story Reading',
    version: 1,
    basePath: 'db/esl/story_reading',
    stories: [
      {
        id: STORY_ID,
        title: STORY_TITLE,
        file: `${STORY_ID}/story.json`,
        chapterCount: storyIndex.chapters.length,
        approxWordsPerPage: args.pageWords,
        sourceTextIncluded: args.includeSourceText,
        rights: {
          sourceTextIncluded: args.includeSourceText,
          confirmationRequired: true,
          confirmedByFlag: args.includeSourceText && args.ownsRights,
        },
      },
    ],
  };
}

async function run() {
  const args = parseArgs(process.argv.slice(2));
  const sourceText = loadSourceText(args.source);
  const reviewText = fs.readFileSync(args.review, 'utf8');
  const chapters = splitIntoChapters(sourceText, chapterTable).map((chapter) => ({
    ...chapter,
    pages: splitChapterIntoPages(chapter, { pageWords: args.pageWords }),
  }));

  const selectedChapters = args.chapter
    ? chapters.filter((chapter) => chapter.chapterId === args.chapter || String(chapter.chapterNumber) === args.chapter)
    : chapters;

  if (args.chapter && selectedChapters.length === 0) {
    throw new Error(`No chapter matched ${args.chapter}`);
  }

  console.log(`Story split into ${chapters.length} chapters.`);
  chapters.forEach((chapter) => {
    const selected = selectedChapters.includes(chapter) ? '*' : ' ';
    console.log(`${selected} ${chapter.chapterId}: ${chapter.title} (${chapter.pages.length} pages, ${chapter.pages.reduce((sum, page) => sum + page.approxWordCount, 0)} words)`);
  });

  if (args.dryRun) {
    return;
  }
  if (!args.includeSourceText) {
    throw new Error('This implementation writes readable pages and requires --include-source-text --i-own-rights-to-source-text.');
  }

  const storyDir = path.join(args.out, STORY_ID);
  const chaptersDir = path.join(storyDir, 'chapters');
  ensureDir(chaptersDir);

  const completedChapters = [];
  for (const chapter of chapters) {
    const chapterPath = path.join(chaptersDir, `${chapter.chapterId}.json`);
    const shouldGenerate = selectedChapters.includes(chapter);

    if (!shouldGenerate && fs.existsSync(chapterPath)) {
      const existing = JSON.parse(fs.readFileSync(chapterPath, 'utf8'));
      completedChapters.push({ ...chapter, questionCount: existing.pages.reduce((sum, page) => sum + page.inlineQuestions.length, 0) });
      continue;
    }

    if (!shouldGenerate) {
      completedChapters.push({ ...chapter, questionCount: 0 });
      continue;
    }

    console.log(`Generating ${chapter.chapterId}: ${chapter.title}`);
    let pages = [];
    if (fs.existsSync(chapterPath) && !args.force) {
      const existing = JSON.parse(fs.readFileSync(chapterPath, 'utf8'));
      const firstIncomplete = (existing.pages || []).findIndex((page) => !Array.isArray(page.inlineQuestions) || page.inlineQuestions.length < 2);
      const resumeIndex = firstIncomplete === -1 ? (existing.pages || []).length : firstIncomplete;
      pages = (existing.pages || []).slice(0, resumeIndex);
      if (pages.length >= chapter.pages.length) {
        console.log(`Skipping completed ${chapter.chapterId}. Use --force to regenerate.`);
        completedChapters.push({ ...chapter, questionCount: pages.reduce((sum, page) => sum + page.inlineQuestions.length, 0) });
        continue;
      }
      console.log(`  Resuming at page ${pages.length + 1} of ${chapter.pages.length}.`);
    }

    for (let pageIndex = pages.length; pageIndex < chapter.pages.length; pageIndex++) {
      const page = chapter.pages[pageIndex];
      console.log(`  ${page.pageId} (${page.approxWordCount} words)`);
      const inlineQuestions = await generatePageQuestions({ page, chapter, reviewText, model: args.model });
      pages.push({
        pageId: page.pageId,
        pageNumber: page.pageNumber,
        sourceText: page.sourceText,
        approxWordCount: page.approxWordCount,
        sourceRef: page.sourceRef,
        inlineQuestions,
        unlockRule: { mustAnswerAllInlineQuestions: true },
      });

      writeJson(chapterPath, {
        storyId: STORY_ID,
        chapterId: chapter.chapterId,
        chapterNumber: chapter.chapterNumber,
        title: chapter.title,
        dateLabel: chapter.dateLabel,
        sourceTextIncluded: true,
        pages,
      });
      await sleep(1200);
    }

    completedChapters.push({ ...chapter, questionCount: pages.reduce((sum, page) => sum + page.inlineQuestions.length, 0) });
  }

  const storyIndex = buildStoryIndex({ storyDirName: STORY_ID, chapters: completedChapters, args });
  writeJson(path.join(storyDir, 'story.json'), storyIndex);
  writeJson(path.join(args.out, 'manifest.json'), buildManifest({ args, storyIndex }));
  console.log(`Generated story reading data in ${path.relative(ROOT, storyDir)}`);
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
