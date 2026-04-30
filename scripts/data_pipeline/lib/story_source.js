const fs = require('fs');

function loadSourceText(sourcePath) {
  return fs.readFileSync(sourcePath, 'utf8').replace(/\r\n/g, '\n');
}

function normalizeForMatch(value) {
  return value.replace(/\s+/g, ' ').trim().toUpperCase();
}

function findHeading(sourceText, chapter) {
  const lines = sourceText.split('\n');
  let offset = 0;
  for (const line of lines) {
    const normalizedLine = normalizeForMatch(line);
    if (chapter.sourceHeadings.some((heading) => normalizedLine === normalizeForMatch(heading))) {
      return { index: offset, heading: line.trim() };
    }
    offset += line.length + 1;
  }
  return null;
}

function splitIntoChapters(sourceText, chapterTable) {
  const markers = chapterTable.map((chapter) => {
    const marker = findHeading(sourceText, chapter);
    if (!marker) {
      throw new Error(`Could not find source heading for ${chapter.chapterId}: ${chapter.title}`);
    }
    return { ...chapter, sourceStart: marker.index, matchedHeading: marker.heading };
  }).sort((a, b) => a.sourceStart - b.sourceStart);

  const order = markers.map((marker) => marker.chapterId).join(', ');
  const expectedOrder = chapterTable.map((chapter) => chapter.chapterId).join(', ');
  if (order !== expectedOrder) {
    throw new Error(`Chapter headings were not found in expected order. Found: ${order}. Expected: ${expectedOrder}`);
  }

  return markers.map((marker, index) => {
    const next = markers[index + 1];
    const chapterText = sourceText.slice(marker.sourceStart, next ? next.sourceStart : sourceText.length).trim();
    return {
      chapterId: marker.chapterId,
      chapterNumber: marker.chapterNumber,
      title: marker.title,
      dateLabel: marker.dateLabel,
      matchedHeading: marker.matchedHeading,
      sourceStart: marker.sourceStart,
      sourceEnd: next ? next.sourceStart : sourceText.length,
      text: chapterText,
    };
  });
}

function tokenizeWithOffsets(text) {
  const tokens = [];
  const regex = /\S+/g;
  let match;
  while ((match = regex.exec(text))) {
    tokens.push({ word: match[0], start: match.index, end: match.index + match[0].length });
  }
  return tokens;
}

function findSplitToken(tokens, start, targetEnd, minEnd, maxEnd, text) {
  const boundedMax = Math.min(maxEnd, tokens.length);
  for (let i = boundedMax; i >= minEnd; i--) {
    const charEnd = tokens[i - 1]?.end;
    if (charEnd && /[.!?]["')\]]?\s/.test(text.slice(charEnd - 2, charEnd + 2))) {
      return i;
    }
  }

  for (let i = boundedMax; i >= minEnd; i--) {
    const charEnd = tokens[i - 1]?.end;
    if (charEnd && /\n\s*\n/.test(text.slice(charEnd, Math.min(text.length, charEnd + 8)))) {
      return i;
    }
  }

  return Math.min(targetEnd, tokens.length);
}

function splitChapterIntoPages(chapter, { pageWords = 200 } = {}) {
  const tokens = tokenizeWithOffsets(chapter.text);
  const pages = [];
  let start = 0;

  while (start < tokens.length) {
    const remaining = tokens.length - start;
    const minEnd = start + Math.min(remaining, Math.max(80, Math.floor(pageWords * 0.75)));
    const targetEnd = start + Math.min(remaining, pageWords);
    const maxEnd = start + Math.min(remaining, Math.ceil(pageWords * 1.25));
    const end = remaining <= Math.ceil(pageWords * 1.25) ? tokens.length : findSplitToken(tokens, start, targetEnd, minEnd, maxEnd, chapter.text);
    const first = tokens[start];
    const last = tokens[end - 1];
    const sourceText = chapter.text.slice(first.start, last.end).replace(/\n{3,}/g, '\n\n').trim();
    const pageNumber = pages.length + 1;
    const paddedChapter = String(chapter.chapterNumber).padStart(2, '0');
    const paddedPage = String(pageNumber).padStart(3, '0');

    pages.push({
      pageId: `hp_ep1_ch${paddedChapter}_p${paddedPage}`,
      pageNumber,
      sourceText,
      approxWordCount: end - start,
      sourceRef: {
        sourceTextIncluded: true,
        sourceWordStart: start + 1,
        sourceWordEnd: end,
        sourceCharStart: chapter.sourceStart + first.start,
        sourceCharEnd: chapter.sourceStart + last.end,
      },
    });

    start = end;
  }

  return pages;
}

function wordCount(text) {
  return tokenizeWithOffsets(text).length;
}

module.exports = {
  loadSourceText,
  splitIntoChapters,
  splitChapterIntoPages,
  wordCount,
};
