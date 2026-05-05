export function computeQuestionWeight(question, weights) {
  let baseWeight = 1.0;
  
  if (weights.questionWeights && weights.questionWeights[question.id]) {
    baseWeight = weights.questionWeights[question.id];
  }
  
  let tagBonus = 0;
  if (question.tags && weights.tagWeights) {
    question.tags.forEach(tag => {
      if (weights.tagWeights[tag]) {
        tagBonus += (weights.tagWeights[tag] - 1.0); // Only add the bonus part
      }
    });
  }
  
  // Cap tag bonus contribution
  tagBonus = Math.min(tagBonus, 2.0);
  
  let totalWeight = baseWeight + tagBonus;
  return Math.max(0.5, Math.min(totalWeight, 6.0));
}

export function selectMysteryMixQuestions(allQuestions, numQuestions, weights) {
  if (numQuestions === 999 || allQuestions.length <= numQuestions) {
    // Return all shuffled
    return [...allQuestions].sort(() => 0.5 - Math.random());
  }

  const selected = [];
  const pool = [...allQuestions];
  const sourceGameCounts = {};

  // Soft guardrails for source balance
  let maxSources = Infinity;
  if (numQuestions === 10) maxSources = 3; // Try to get at least 3 sources
  if (numQuestions === 20) maxSources = 4; // Try to get at least 4 sources

  for (let i = 0; i < numQuestions; i++) {
    if (pool.length === 0) break;

    // Calculate weights for current pool
    const poolWithWeights = pool.map(q => {
      let weight = computeQuestionWeight(q, weights);
      
      // Soft guardrail: penalize sources that have been selected too much
      // If we have selected many from one source, and we need more sources,
      // reduce the weight of items from that over-represented source.
      if (numQuestions >= 10) {
        const selectedFromThisSource = sourceGameCounts[q.sourceGameId] || 0;
        const currentSources = Object.keys(sourceGameCounts).length;
        const remainingSelections = numQuestions - i;
        
        // If we haven't hit our target number of unique sources, and this is from an already used source
        // and we have few selections left, heavily penalize it.
        if (currentSources < maxSources && selectedFromThisSource > 0 && remainingSelections <= (maxSources - currentSources)) {
           weight *= 0.1; 
        } else if (selectedFromThisSource >= (numQuestions / maxSources) + 1) {
           // Standard penalty for a single source dominating
           weight *= 0.5;
        }
      }

      return { q, weight };
    });

    // Sum weights
    const totalWeight = poolWithWeights.reduce((sum, item) => sum + item.weight, 0);
    
    // Random selection based on weight
    let randomVal = Math.random() * totalWeight;
    let selectedItem = null;
    let selectedIndex = -1;

    for (let j = 0; j < poolWithWeights.length; j++) {
      randomVal -= poolWithWeights[j].weight;
      if (randomVal <= 0) {
        selectedItem = poolWithWeights[j].q;
        selectedIndex = j;
        break;
      }
    }

    // Fallback if float math gets weird
    if (!selectedItem && pool.length > 0) {
      selectedIndex = pool.length - 1;
      selectedItem = pool[selectedIndex];
    }

    // Add to selected list and update tracking
    selected.push(selectedItem);
    sourceGameCounts[selectedItem.sourceGameId] = (sourceGameCounts[selectedItem.sourceGameId] || 0) + 1;
    
    // Remove from pool (sampling without replacement)
    pool.splice(selectedIndex, 1);
  }

  return selected;
}
