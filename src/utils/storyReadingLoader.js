const STORY_BASE_PATH = 'db/esl/story_reading';

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

export async function loadStoryReadingManifest() {
  return fetchJson(`${STORY_BASE_PATH}/manifest.json`);
}

export async function loadStoryIndex(manifest, storyId = 'harrypotter_episode1') {
  const storyEntry = (manifest.stories || []).find((story) => story.id === storyId) || manifest.stories?.[0];
  if (!storyEntry) {
    throw new Error('No story reading entries found.');
  }
  const basePath = manifest.basePath || STORY_BASE_PATH;
  const story = await fetchJson(`${basePath}/${storyEntry.file}`);
  return { storyEntry, story, storyBasePath: `${basePath}/${storyEntry.file.replace(/\/story\.json$/, '')}` };
}

export async function loadStoryChapter(storyBasePath, chapter) {
  return fetchJson(`${storyBasePath}/${chapter.file}`);
}
