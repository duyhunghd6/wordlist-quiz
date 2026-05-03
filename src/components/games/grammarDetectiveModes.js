export const GRAMMAR_DETECTIVE_MODES = {
  modalDetective: {
    id: 'modalDetective',
    title: 'Modal Detective',
    subtitle: 'Rule or Maybe?',
    clueInstruction: 'Find the clue that tells rule, past duty, or maybe.',
    answerInstruction: 'Choose the best modal.',
    themeClass: 'gdd-modal',
    optionGroups: ['Rule Folder', 'Maybe Folder']
  },
  actionFreezeDetective: {
    id: 'actionFreezeDetective',
    title: 'Action Freeze Detective',
    subtitle: 'What Was Happening?',
    clueInstruction: 'Find the clue that shows the time or interruption in the past.',
    answerInstruction: 'Choose the correct action that was happening.',
    themeClass: 'gdd-action-freeze',
    optionGroups: ['Long Action Folder']
  },
  futureForecastDetective: {
    id: 'futureForecastDetective',
    title: 'Future Forecast Detective',
    subtitle: 'Plan, Evidence, or Decision?',
    clueInstruction: 'Find the clue that shows a plan, evidence, or quick decision.',
    answerInstruction: 'Choose the best future form.',
    themeClass: 'gdd-future-forecast',
    optionGroups: ['Going To Folder', 'Will Folder']
  }
};
