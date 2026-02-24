/**
 * tenseSignalData.js — Signal word question data for the Tense Signal Spotter game.
 * Each tense world has: id, name, emoji, category, questions[]
 * Each question: { sentence, signalWord, distractors[] }
 */

const TENSE_SIGNAL_WORLDS = [
  {
    id: 'present_simple', name: 'Present Simple', emoji: '🌲', category: 'present',
    questions: [
      { sentence: 'She goes to school every day.', signalWord: 'every day', distractors: ['yesterday', 'right now'] },
      { sentence: 'They always eat breakfast at 7 AM.', signalWord: 'always', distractors: ['tomorrow', 'already'] },
      { sentence: 'He usually speaks English well.', signalWord: 'usually', distractors: ['since', 'at the moment'] },
      { sentence: 'The cat sleeps on the sofa every night.', signalWord: 'every night', distractors: ['last night', 'tonight'] },
      { sentence: 'We often play soccer after school.', signalWord: 'often', distractors: ['right now', 'by tomorrow'] },
      { sentence: 'She never brushes teeth before bed.', signalWord: 'never', distractors: ['already', 'while'] },
      { sentence: 'Birds sometimes fly in the rain.', signalWord: 'sometimes', distractors: ['at that time', 'since morning'] },
      { sentence: 'I drink water every morning.', signalWord: 'every morning', distractors: ['last week', 'next year'] },
    ]
  },
  {
    id: 'present_continuous', name: 'Present Continuous', emoji: '🏖️', category: 'present',
    questions: [
      { sentence: 'She is reading a book right now.', signalWord: 'right now', distractors: ['every day', 'yesterday'] },
      { sentence: 'They are playing in the park now.', signalWord: 'now', distractors: ['always', 'last week'] },
      { sentence: 'He is eating his lunch at the moment.', signalWord: 'at the moment', distractors: ['often', 'ago'] },
      { sentence: 'We are listening to music right now.', signalWord: 'right now', distractors: ['usually', 'before'] },
      { sentence: 'Look! It is raining outside.', signalWord: 'Look!', distractors: ['every day', 'already'] },
      { sentence: 'I am studying for the test today.', signalWord: 'today', distractors: ['last year', 'never'] },
      { sentence: 'Mom is cooking dinner now.', signalWord: 'now', distractors: ['yesterday', 'always'] },
      { sentence: 'The children are watching TV at this moment.', signalWord: 'at this moment', distractors: ['every week', 'ago'] },
    ]
  },
  {
    id: 'past_simple', name: 'Past Simple', emoji: '🏛️', category: 'past',
    questions: [
      { sentence: 'Yesterday, she walked to school.', signalWord: 'Yesterday', distractors: ['tomorrow', 'always'] },
      { sentence: 'He caught a big fish last week.', signalWord: 'last week', distractors: ['right now', 'every day'] },
      { sentence: 'They played soccer two days ago.', signalWord: 'ago', distractors: ['now', 'usually'] },
      { sentence: 'I wrote a letter last night.', signalWord: 'last night', distractors: ['at the moment', 'often'] },
      { sentence: 'We went to the zoo last Sunday.', signalWord: 'last Sunday', distractors: ['next Sunday', 'every Sunday'] },
      { sentence: 'She baked a cake for the party yesterday.', signalWord: 'yesterday', distractors: ['tomorrow', 'right now'] },
      { sentence: 'He closed the door an hour ago.', signalWord: 'ago', distractors: ['always', 'now'] },
      { sentence: 'I finished my homework in the morning.', signalWord: 'in the morning', distractors: ['by tomorrow', 'right now'] },
    ]
  },
  {
    id: 'past_continuous', name: 'Past Continuous', emoji: '🏰', category: 'past',
    questions: [
      { sentence: 'She was sleeping when I called her.', signalWord: 'when', distractors: ['always', 'tomorrow'] },
      { sentence: 'They were eating dinner when it rained.', signalWord: 'when', distractors: ['every day', 'by now'] },
      { sentence: 'He was watching TV at 8 PM last night.', signalWord: 'at 8 PM last night', distractors: ['every night', 'right now'] },
      { sentence: 'We were studying while the bell rang.', signalWord: 'while', distractors: ['always', 'yesterday'] },
      { sentence: 'I was walking to school when I saw him.', signalWord: 'when', distractors: ['every day', 'tomorrow'] },
      { sentence: 'She was singing a song at that time.', signalWord: 'at that time', distractors: ['always', 'now'] },
      { sentence: 'They were working together all morning.', signalWord: 'all morning', distractors: ['always', 'next week'] },
      { sentence: 'He was drawing a picture when Mom came.', signalWord: 'when', distractors: ['every day', 'since'] },
    ]
  },
  {
    id: 'future_simple', name: 'Future Simple', emoji: '🚀', category: 'future',
    questions: [
      { sentence: 'Tomorrow, I will visit my friend.', signalWord: 'Tomorrow', distractors: ['yesterday', 'now'] },
      { sentence: 'She will become a doctor one day.', signalWord: 'one day', distractors: ['ago', 'every day'] },
      { sentence: 'They will play the game next week.', signalWord: 'next week', distractors: ['last week', 'right now'] },
      { sentence: 'It will be sunny this weekend.', signalWord: 'this weekend', distractors: ['yesterday', 'always'] },
      { sentence: 'I will help you with your homework later.', signalWord: 'later', distractors: ['ago', 'now'] },
      { sentence: 'She will bake a cake for us soon.', signalWord: 'soon', distractors: ['yesterday', 'while'] },
      { sentence: 'The train will arrive at 9 AM tomorrow.', signalWord: 'tomorrow', distractors: ['ago', 'every day'] },
      { sentence: 'We will beat you next time!', signalWord: 'next time', distractors: ['last time', 'always'] },
    ]
  },
  {
    id: 'future_continuous', name: 'Future Continuous', emoji: '☁️', category: 'future',
    questions: [
      { sentence: 'At 3 PM tomorrow, I will be sitting in class.', signalWord: 'At 3 PM tomorrow', distractors: ['yesterday', 'always'] },
      { sentence: 'This time tomorrow, she will be flying.', signalWord: 'This time tomorrow', distractors: ['last week', 'every day'] },
      { sentence: 'They will be studying all day Saturday.', signalWord: 'all day Saturday', distractors: ['yesterday', 'now'] },
      { sentence: 'We will be waiting when you arrive.', signalWord: 'when you arrive', distractors: ['last night', 'always'] },
      { sentence: 'At noon tomorrow, she will be eating lunch.', signalWord: 'At noon tomorrow', distractors: ['yesterday', 'every day'] },
      { sentence: 'They will be traveling at this time next week.', signalWord: 'at this time next week', distractors: ['ago', 'always'] },
      { sentence: 'He will be doing homework tonight.', signalWord: 'tonight', distractors: ['yesterday', 'every day'] },
      { sentence: 'She will be meeting her friends later.', signalWord: 'later', distractors: ['ago', 'always'] },
    ]
  },
  {
    id: 'present_perfect', name: 'Present Perfect', emoji: '💎', category: 'present',
    questions: [
      { sentence: 'I have seen this movie before.', signalWord: 'before', distractors: ['tomorrow', 'now'] },
      { sentence: 'She has finished her homework already.', signalWord: 'already', distractors: ['yesterday', 'next week'] },
      { sentence: 'They have been to Paris twice.', signalWord: 'twice', distractors: ['tomorrow', 'always'] },
      { sentence: 'He has read three books this month.', signalWord: 'this month', distractors: ['last month', 'next month'] },
      { sentence: 'I have lost my keys. Help me!', signalWord: 'have lost', distractors: ['yesterday', 'every day'] },
      { sentence: 'She has bought a new phone recently.', signalWord: 'recently', distractors: ['tomorrow', 'ago'] },
      { sentence: 'We have sung that song many times.', signalWord: 'many times', distractors: ['tomorrow', 'now'] },
      { sentence: "They haven't arrived yet.", signalWord: 'yet', distractors: ['ago', 'always'] },
    ]
  },
  {
    id: 'present_perfect_cont', name: 'Present Perfect Continuous', emoji: '🌊', category: 'present',
    questions: [
      { sentence: 'I have been studying for 2 hours.', signalWord: 'for 2 hours', distractors: ['yesterday', 'tomorrow'] },
      { sentence: 'She has been cooking all morning.', signalWord: 'all morning', distractors: ['yesterday', 'next week'] },
      { sentence: 'They have been working since 8 AM.', signalWord: 'since 8 AM', distractors: ['at 8 AM', 'every 8 AM'] },
      { sentence: 'He has been running for an hour.', signalWord: 'for an hour', distractors: ['yesterday', 'tomorrow'] },
      { sentence: 'It has been raining since yesterday.', signalWord: 'since yesterday', distractors: ['tomorrow', 'every day'] },
      { sentence: 'We have been living here for years.', signalWord: 'for years', distractors: ['next year', 'every year'] },
      { sentence: 'She has been playing piano all day.', signalWord: 'all day', distractors: ['yesterday', 'tomorrow'] },
      { sentence: 'He has been learning English for 3 years.', signalWord: 'for 3 years', distractors: ['3 years ago', 'next 3 years'] },
    ]
  },
  {
    id: 'past_perfect', name: 'Past Perfect', emoji: '⏰', category: 'past',
    questions: [
      { sentence: 'She had left before he arrived.', signalWord: 'before', distractors: ['after', 'always'] },
      { sentence: 'They had eaten dinner before 7 PM.', signalWord: 'before', distractors: ['at', 'every'] },
      { sentence: 'I had seen the movie before you told me.', signalWord: 'before', distractors: ['after', 'while'] },
      { sentence: 'He had finished all his homework first.', signalWord: 'had finished', distractors: ['every day', 'tomorrow'] },
      { sentence: 'They had gone home before it rained.', signalWord: 'before', distractors: ['after', 'while'] },
      { sentence: 'We had packed lunch before the trip.', signalWord: 'before', distractors: ['during', 'after'] },
      { sentence: 'He had locked the door before leaving.', signalWord: 'before leaving', distractors: ['always', 'tomorrow'] },
      { sentence: 'She had read the book before class started.', signalWord: 'before', distractors: ['after', 'during'] },
    ]
  },
  {
    id: 'past_perfect_cont', name: 'Past Perfect Continuous', emoji: '🌋', category: 'past',
    questions: [
      { sentence: 'I had been studying for 2 hours when she called.', signalWord: 'for 2 hours when', distractors: ['always', 'every day'] },
      { sentence: 'She had been cooking all day before the party.', signalWord: 'all day before', distractors: ['tomorrow', 'always'] },
      { sentence: 'They had been working since morning.', signalWord: 'since morning', distractors: ['tomorrow morning', 'every morning'] },
      { sentence: 'We had been living there for years before we left.', signalWord: 'for years before', distractors: ['always', 'next year'] },
      { sentence: 'It had been raining for days before the flood.', signalWord: 'for days before', distractors: ['every day', 'tomorrow'] },
      { sentence: 'I had been walking so long I was tired.', signalWord: 'so long', distractors: ['always', 'next time'] },
      { sentence: 'He had been learning English before going abroad.', signalWord: 'before going', distractors: ['always', 'every day'] },
      { sentence: 'They had been watching TV all evening.', signalWord: 'all evening', distractors: ['tomorrow', 'always'] },
    ]
  },
  {
    id: 'future_perfect', name: 'Future Perfect', emoji: '🌈', category: 'future',
    questions: [
      { sentence: 'By tomorrow, I will have finished the work.', signalWord: 'By tomorrow', distractors: ['yesterday', 'always'] },
      { sentence: 'She will have arrived home by 6 PM.', signalWord: 'by 6 PM', distractors: ['at 6 PM', 'every 6 PM'] },
      { sentence: 'We will have learned 100 words by Friday.', signalWord: 'by Friday', distractors: ['last Friday', 'every Friday'] },
      { sentence: 'They will have completed the project by Monday.', signalWord: 'by Monday', distractors: ['last Monday', 'on Monday'] },
      { sentence: 'He will have traveled to 10 countries by 2030.', signalWord: 'by 2030', distractors: ['in 2020', 'every year'] },
      { sentence: 'I will have cleaned my room before you come.', signalWord: 'before you come', distractors: ['yesterday', 'always'] },
      { sentence: 'She will have baked the cake by noon.', signalWord: 'by noon', distractors: ['at noon', 'every noon'] },
      { sentence: 'We will have gotten ready by the time you arrive.', signalWord: 'by the time', distractors: ['yesterday', 'always'] },
    ]
  },
  {
    id: 'future_perfect_cont', name: 'Future Perfect Continuous', emoji: '⭐', category: 'future',
    questions: [
      { sentence: 'By 2030, I will have been working for 10 years.', signalWord: 'By 2030', distractors: ['in 2020', 'always'] },
      { sentence: 'She will have been studying for 5 hours by then.', signalWord: 'by then', distractors: ['ago', 'always'] },
      { sentence: 'They will have been living here for a decade.', signalWord: 'for a decade', distractors: ['yesterday', 'every day'] },
      { sentence: 'We will have been learning English for 6 years.', signalWord: 'for 6 years', distractors: ['6 years ago', 'always'] },
      { sentence: 'She will have been cooking for 2 hours by dinner.', signalWord: 'by dinner', distractors: ['yesterday', 'always'] },
      { sentence: 'He will have been playing piano for 8 years next month.', signalWord: 'next month', distractors: ['last month', 'every month'] },
      { sentence: 'We will have been driving for hours by arrival.', signalWord: 'by arrival', distractors: ['ago', 'always'] },
      { sentence: 'They will have been playing since morning by then.', signalWord: 'since morning', distractors: ['ago', 'every day'] },
    ]
  },
];

export default TENSE_SIGNAL_WORLDS;
