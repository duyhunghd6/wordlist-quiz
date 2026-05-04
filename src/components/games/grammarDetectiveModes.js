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
    optionGroups: ['Long Action Folder'],
    guideIntro: {
      title: 'Past Continuous: catch the action in the middle',
      lines: [
        'Use past continuous when an action was already happening at a past time. It is like pressing pause on a movie: the action is not finished yet.',
        'Vietnamese can use đang to show an action in progress. English needs two pieces: was/were + verb-ing.'
      ],
      structures: [
        { label: 'Long action', formula: 'Subject + was/were + verb-ing', example: 'She was riding her bike.' },
        { label: 'Interrupted action', formula: 'Long action + when + short past action', example: 'I was watching TV when the phone rang.' },
        { label: 'Two actions together', formula: 'While + subject + was/were + verb-ing, subject + was/were + verb-ing', example: 'While he was reading, she was listening.' }
      ],
      reminder: 'Detective question: Was the action happening in the middle of a past moment? If yes, use was/were + V-ing.'
    },
    guideBoard: [
      { job: 'Movie pause', clue: 'The action was happening then.', form: 'was/were + V-ing' },
      { job: 'When clue', clue: 'A short action interrupted it.', form: 'was/were + V-ing + when + past verb' },
      { job: 'While clue', clue: 'A long background action.', form: 'while + was/were + V-ing' },
      { job: 'Choose be', clue: 'I/he/she/it = was; you/we/they = were.', form: 'was / were' }
    ]
  },
  futureForecastDetective: {
    id: 'futureForecastDetective',
    title: 'Future Forecast Detective',
    subtitle: 'Plan, Evidence, or Decision?',
    clueInstruction: 'Find the clue that shows a plan, evidence, or quick decision.',
    answerInstruction: 'Choose the best future form.',
    themeClass: 'gdd-future-forecast',
    optionGroups: ['Going To Folder', 'Will Folder'],
    guideIntro: {
      title: 'Future Forms: choose the future tool that matches the clue',
      lines: [
        'English has more than one way to talk about the future. Do not choose only because Vietnamese says sẽ. First, look for the clue: plan, evidence, promise, offer, opinion, or quick decision.',
        'Use be going to when the future is already prepared or easy to see now. Use will when the speaker decides now, promises, offers help, or gives an opinion.'
      ],
      structures: [
        { label: 'Plan or evidence', formula: 'Subject + am/is/are + going to + base verb', example: 'We are going to fly to Japan.' },
        { label: 'Quick decision', formula: 'Subject + will + base verb', example: 'I will answer the phone.' },
        { label: 'Promise or opinion', formula: 'Subject + will + base verb', example: 'I promise I will help.' }
      ],
      reminder: 'Detective question: Is there a plan/evidence already, or is the speaker deciding/speaking now?'
    },
    guideBoard: [
      { job: 'Plan', clue: 'Tickets, bags, booked table, dream.', form: 'am/is/are going to' },
      { job: 'Visible evidence', clue: 'Dark clouds, falling glass, runner ahead.', form: 'am/is/are going to' },
      { job: 'Quick decision', clue: 'The speaker decides now.', form: 'will' },
      { job: 'Promise / offer / opinion', clue: 'promise, help now, I think, I believe.', form: 'will' }
    ]
  }
};

export const SCENARIO_TAXONOMY = {
  modalDetective: {
    ability_now: { label: 'Ability Now', requiredClue: 'present skill/now', confusionTargets: ['could', 'may'] },
    past_ability: { label: 'Past Ability', requiredClue: 'past time marker', confusionTargets: ['can'] },
    permission: { label: 'Permission', requiredClue: 'asking/allowing context', confusionTargets: ['might', 'could'] },
    polite_request: { label: 'Polite Request', requiredClue: 'please/question format', confusionTargets: ['can'] },
    possibility: { label: 'Possibility', requiredClue: 'uncertainty (maybe, not sure)', confusionTargets: ['must', 'can'] },
    suggestion: { label: 'Suggestion', requiredClue: 'idea or advice', confusionTargets: ['must', 'have to'] },
    obligation: { label: 'Obligation / Rule', requiredClue: 'rule or necessity', confusionTargets: ['can', 'might'] },
    past_obligation: { label: 'Past Obligation', requiredClue: 'past time necessity', confusionTargets: ['must', 'had to'] }
  },
  actionFreezeDetective: {
    interruption: { label: 'Interruption', requiredClue: 'when + short action', confusionTargets: ['simple past'] },
    parallel_actions: { label: 'Parallel Actions', requiredClue: 'while + long action', confusionTargets: ['simple past'] },
    exact_time: { label: 'Exact Past Time', requiredClue: 'specific time (e.g. 8 PM)', confusionTargets: ['simple past'] }
  },
  futureForecastDetective: {
    plan: { label: 'Plan', requiredClue: 'preparation/intention', confusionTargets: ['will'] },
    visible_evidence: { label: 'Visible Evidence', requiredClue: 'current sensory evidence', confusionTargets: ['will'] },
    quick_decision: { label: 'Quick Decision', requiredClue: 'immediate context', confusionTargets: ['going to'] },
    promise: { label: 'Promise', requiredClue: 'promise context', confusionTargets: ['going to'] },
    offer: { label: 'Offer', requiredClue: 'help context', confusionTargets: ['going to'] },
    opinion: { label: 'Opinion', requiredClue: 'think/believe', confusionTargets: ['going to'] }
  }
};

