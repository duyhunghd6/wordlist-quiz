export const GRAMMAR_DETECTIVE_MODES = {
  modalDetective: {
    id: 'modalDetective',
    title: 'Modal Detective',
    subtitle: 'What Is the Modal Job?',
    clueInstruction: 'Find the clue that shows the modal job.',
    answerInstruction: 'Choose the modal that matches the job.',
    themeClass: 'gdd-modal',
    optionGroups: ['Ability', 'Permission', 'Possibility', 'Suggestion'],
    guideBoard: [
      { job: 'Skill now', clue: 'Can someone do it now?', modal: 'can' },
      { job: 'Skill before', clue: 'Could someone do it in the past?', modal: 'could' },
      { job: 'Allowed?', clue: 'Is someone asking permission?', modal: 'can / may' },
      { job: 'Polite help?', clue: 'Is someone asking politely?', modal: 'could' },
      { job: 'Maybe?', clue: 'Are we not sure?', modal: 'may / might / could' },
      { job: 'One idea?', clue: 'Is it a suggestion?', modal: 'could' }
    ]
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
