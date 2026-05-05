import { grammarDetectiveData } from './grammarDetectiveData';
import { RELATIVE_DETECTIVE_QUESTIONS } from './relativeDetectiveData';

export async function fetchAndAdaptInspectorTailData() {
  try {
    const res = await fetch('db/tag_questions_esl.toon');
    if (!res.ok) {
      console.warn("Mystery Mix: Failed to load tag_questions_esl.toon");
      return [];
    }
    const text = await res.text();
    const lines = text.trim().split('\n');
    const headers = lines[0].split('|').map(h => h.trim());
    
    const adapted = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split('|').map(v => v.trim());
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = values[idx]; });
      
      const clueTextMatch = obj.sentence_prompt.split('_______')[0].trim();
      const clueText = clueTextMatch.endsWith(',') ? clueTextMatch.slice(0, -1) : clueTextMatch;

      adapted.push({
        id: `inspectorTail:${obj.id}`,
        sourceGameId: 'inspectorTail',
        sourceGameName: 'Inspector Tail',
        reviewType: 'multiple_choice',
        prompt: obj.sentence_prompt,
        clueText: clueText || obj.sentence_prompt,
        answer: obj.correct_tag,
        acceptedAnswers: [obj.correct_tag],
        options: [obj.correct_tag, obj.wrong_tag_1, obj.wrong_tag_2].sort(() => 0.5 - Math.random()),
        explanation: obj.polarity === 'pos' 
          ? `The sentence is positive, so the tag becomes negative: ${obj.correct_tag}.`
          : `The sentence is negative, so the tag becomes positive: ${obj.correct_tag}.`,
        tags: ['tag_question', 'tag_polarity_risk', 'auxiliary_agreement'],
        difficulty: parseInt(obj.difficulty, 10) || 1,
        original: obj
      });
    }
    return adapted;
  } catch (e) {
    console.warn("Mystery Mix: Error parsing tag_questions_esl.toon", e);
    return [];
  }
}

export function getAdaptedGrammarDetectiveData() {
  const allowedGames = ['modalDetective', 'actionFreezeDetective', 'futureForecastDetective'];
  
  return grammarDetectiveData
    .filter(q => allowedGames.includes(q.game))
    .map(q => {
      let sourceGameName = 'Grammar Detective';
      if (q.game === 'modalDetective') sourceGameName = 'Modal Detective';
      if (q.game === 'actionFreezeDetective') sourceGameName = 'Action Freeze';
      if (q.game === 'futureForecastDetective') sourceGameName = 'Future Forecast';

      return {
        id: `${q.game}:${q.id}`,
        sourceGameId: q.game,
        sourceGameName,
        reviewType: 'multiple_choice',
        prompt: q.sentence,
        clueText: q.clueText,
        answer: q.answer,
        acceptedAnswers: q.acceptedAnswers || [q.answer],
        options: q.options || [],
        explanation: q.explanation,
        tags: q.tags || [],
        difficulty: q.difficulty || 1,
        meaningHint: q.meaningHint,
        formHint: q.formHint,
        distractorRationale: q.distractorRationale,
        original: q
      };
    });
}

export function getAdaptedRelativeDetectiveData() {
  return RELATIVE_DETECTIVE_QUESTIONS.map(q => {
    return {
      id: `relativeDetective:${q.id}`,
      sourceGameId: 'relativeDetective',
      sourceGameName: 'Relative Detective',
      reviewType: 'multiple_choice',
      prompt: q.sentence,
      clueText: q.targetNoun,
      answer: q.correctPronoun,
      acceptedAnswers: [q.correctPronoun],
      options: [q.correctPronoun, ...(q.distractors || [])].sort(() => 0.5 - Math.random()),
      explanation: q.hint || `"${q.targetNoun}" is the clue. The correct pronoun is ${q.correctPronoun}.`,
      tags: ['relative_pronoun', 'relative_pronoun_risk'],
      difficulty: 1,
      meaningHint: `A ${q.targetNoun} is a ${q.correctPronoun === 'who' ? 'person' : q.correctPronoun === 'where' ? 'place' : 'thing'}.`,
      original: q
    };
  });
}

export async function loadAllMysteryMixQuestions() {
  const gdData = getAdaptedGrammarDetectiveData();
  const rdData = getAdaptedRelativeDetectiveData();
  const itData = await fetchAndAdaptInspectorTailData();
  
  return [...gdData, ...rdData, ...itData];
}
