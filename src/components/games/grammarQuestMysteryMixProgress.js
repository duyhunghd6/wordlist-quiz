const STORAGE_KEY = 'grammarQuestMysteryMix:v1:weights';

export function loadMysteryMixWeights() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn("Failed to load Mystery Mix weights", e);
  }
  
  return {
    questionWeights: {},
    tagWeights: {},
    attempts: {}
  };
}

export function saveMysteryMixWeights(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save Mystery Mix weights", e);
  }
}

export function updateWeightsAfterQuestion(weights, questionId, tags, isFirstTryCorrect, wrongClueOccurred) {
  const updated = {
    questionWeights: { ...weights.questionWeights },
    tagWeights: { ...weights.tagWeights },
    attempts: { ...weights.attempts }
  };

  // Initialize or get current attempts tracking
  if (!updated.attempts[questionId]) {
    updated.attempts[questionId] = { seen: 0, wrong: 0, lastSeenAt: 0 };
  }
  
  const attemptData = updated.attempts[questionId];
  attemptData.seen += 1;
  attemptData.lastSeenAt = Date.now();
  if (!isFirstTryCorrect) {
    attemptData.wrong += 1;
  }

  // Question Weight Update
  let qWeight = updated.questionWeights[questionId] || 1.0;
  
  if (isFirstTryCorrect && !wrongClueOccurred) {
    qWeight -= 0.25;
  } else {
    if (!isFirstTryCorrect) {
      qWeight += 1.5;
    }
    if (wrongClueOccurred) {
      qWeight += 0.75;
    }
  }
  
  // Clamp question weight
  updated.questionWeights[questionId] = Math.max(0.5, Math.min(qWeight, 6.0));

  // Tag Weight Update
  if (!isFirstTryCorrect && tags && tags.length > 0) {
    tags.forEach(tag => {
      let tWeight = updated.tagWeights[tag] || 1.0;
      tWeight += 0.2;
      updated.tagWeights[tag] = Math.min(tWeight, 3.0); // Cap tag contribution
    });
  }

  return updated;
}
