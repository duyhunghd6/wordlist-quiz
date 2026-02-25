const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../public/db/tense_sentences_esl.toon');

const subjects = {
  Beginner: [
    { en: 'I', vi: 'Tôi', kind: '1s' },
    { en: 'She', vi: 'Cô ấy', kind: '3s' },
    { en: 'He', vi: 'Anh ấy', kind: '3s' },
    { en: 'They', vi: 'Họ', kind: '3p' },
    { en: 'We', vi: 'Chúng tôi', kind: '1p' }
  ],
  Intermediate: [
    { en: 'My brother', vi: 'Anh trai tôi', kind: '3s' },
    { en: 'The students', vi: 'Các học sinh', kind: '3p' },
    { en: 'My dog', vi: 'Con chó của tôi', kind: '3s' },
    { en: 'My parents', vi: 'Bố mẹ tôi', kind: '3p' }
  ],
  Advanced: [
    { en: 'The factory workers', vi: 'Các công nhân nhà máy', kind: '3p' },
    { en: 'The old scientist', vi: 'Nhà khoa học già', kind: '3s' },
    { en: 'Nobody', vi: 'Không ai', kind: '3s', isNegative: true }
  ]
};

// verbs dictionary
const verbs = [
  { v0: 'study', v1: 'studies', v2: 'studied', vp: 'studied', ving: 'studying', obj_en: 'English', obj_vi: 'tiếng Anh' },
  { v0: 'play', v1: 'plays', v2: 'played', vp: 'played', ving: 'playing', obj_en: 'football', obj_vi: 'bóng đá' },
  { v0: 'eat', v1: 'eats', v2: 'ate', vp: 'eaten', ving: 'eating', obj_en: 'dinner', obj_vi: 'bữa tối' },
  { v0: 'drink', v1: 'drinks', v2: 'drank', vp: 'drunk', ving: 'drinking', obj_en: 'water', obj_vi: 'nước' },
  { v0: 'finish', v1: 'finishes', v2: 'finished', vp: 'finished', ving: 'finishing', obj_en: 'the homework', obj_vi: 'bài tập về nhà' },
  { v0: 'read', v1: 'reads', v2: 'read', vp: 'read', ving: 'reading', obj_en: 'a book', obj_vi: 'một cuốn sách' },
  { v0: 'watch', v1: 'watches', v2: 'watched', vp: 'watched', ving: 'watching', obj_en: 'a movie', obj_vi: 'một bộ phim' },
  { v0: 'clean', v1: 'cleans', v2: 'cleaned', vp: 'cleaned', ving: 'cleaning', obj_en: 'the room', obj_vi: 'căn phòng' },
  { v0: 'write', v1: 'writes', v2: 'wrote', vp: 'written', ving: 'writing', obj_en: 'a letter', obj_vi: 'một bức thư' },
  { v0: 'fix', v1: 'fixes', v2: 'fixed', vp: 'fixed', ving: 'fixing', obj_en: 'the car', obj_vi: 'chiếc xe' }
];

const getViVerb = (v0) => {
  const map = {
    'study': 'học', 'play': 'chơi', 'eat': 'ăn', 'drink': 'uống',
    'finish': 'làm xong', 'read': 'đọc', 'watch': 'xem',
    'clean': 'dọn dẹp', 'write': 'viết', 'fix': 'sửa'
  };
  return map[v0] || '';
};

const tensesConfig = [
  {
    id: 'ps',
    name: 'Present Simple',
    generate: (subj, verb) => {
      const is3s = subj.kind === '3s';
      const vCorrect = is3s && !subj.isNegative ? verb.v1 : verb.v0;
      const vWrong = is3s && !subj.isNegative ? verb.v0 : verb.v1;
      const prepChoice = ['every day', 'usually', 'often'][Math.floor(Math.random() * 3)];
      const prepChoiceVi = prepChoice === 'every day' ? 'mỗi ngày' : (prepChoice === 'usually' ? 'thường' : 'thường xuyên');
      
      let en = `${subj.en} ${vCorrect} ${verb.obj_en} ${prepChoice}.`;
      let enWrong = `${subj.en} ${vWrong} ${verb.obj_en} ${prepChoice}.`;
      let vi = `${subj.vi} ${prepChoiceVi} ${getViVerb(verb.v0)} ${verb.obj_vi}.`;
      
      const vChoices = [vCorrect, vWrong, verb.ving, verb.v2];
      const pChoices = [prepChoice, 'yesterday', 'tomorrow', 'now'];
      return {  correct: en, wrong: enWrong, vi: vi, focus: 'Verb Agreement', vc: vChoices, pc: pChoices };
    }
  },
  {
    id: 'pc',
    name: 'Present Continuous',
    generate: (subj, verb) => {
      const aux = subj.en === 'I' ? 'am' : (['3p', '1p'].includes(subj.kind) ? 'are' : 'is');
      const auxWrong = aux === 'is' ? 'are' : 'is';
      const prepChoice = ['now', 'right now', 'at the moment'][Math.floor(Math.random() * 3)];
      const prepChoiceVi = prepChoice === 'now' ? 'bây giờ' : (prepChoice === 'right now' ? 'ngay bây giờ' : 'vào lúc này');
      
      let en = `${subj.en} ${aux} ${verb.ving} ${verb.obj_en} ${prepChoice}.`;
      let enWrong = `${subj.en} ${auxWrong} ${verb.ving} ${verb.obj_en} ${prepChoice}.`;
      let vi = `${subj.vi} đang ${getViVerb(verb.v0)} ${verb.obj_vi} ${prepChoiceVi}.`;
      
      const vChoices = [`${aux} ${verb.ving}`, `${auxWrong} ${verb.ving}`, verb.v0, verb.v2];
      const pChoices = [prepChoice, 'every day', 'yesterday', 'tomorrow'];
      return { correct: en, wrong: enWrong, vi: vi, focus: 'Be Verb Agreement', vc: vChoices, pc: pChoices };
    }
  },
  {
    id: 'past',
    name: 'Past Simple',
    generate: (subj, verb) => {
      const vCorrect = verb.v2;
      const vWrong = verb.v0;
      const prepChoice = ['yesterday', 'last week', 'two days ago'][Math.floor(Math.random() * 3)];
      const prepChoiceVi = prepChoice === 'yesterday' ? 'hôm qua' : (prepChoice === 'last week' ? 'tuần trước' : 'hai ngày trước');
      
      let en = `${subj.en} ${vCorrect} ${verb.obj_en} ${prepChoice}.`;
      let enWrong = `${subj.en} ${vWrong} ${verb.obj_en} ${prepChoice}.`;
      let vi = `${subj.vi} đã ${getViVerb(verb.v0)} ${verb.obj_vi} ${prepChoiceVi}.`;
      
      const vChoices = [vCorrect, vWrong, verb.ving, verb.v1];
      const pChoices = [prepChoice, 'tomorrow', 'now', 'always'];
      return { correct: en, wrong: enWrong, vi: vi, focus: 'Past Tense Form', vc: vChoices, pc: pChoices };
    }
  },
  {
    id: 'pastc',
    name: 'Past Continuous',
    generate: (subj, verb) => {
      const aux = (['3p', '1p'].includes(subj.kind)) ? 'were' : 'was';
      const auxWrong = aux === 'was' ? 'were' : 'was';
      const prepChoice = ['at 8 PM yesterday'];
      const prepChoiceVi = 'lúc 8 giờ tối hôm qua';
      
      let en = `${subj.en} ${aux} ${verb.ving} ${verb.obj_en} ${prepChoice[0]}.`;
      let enWrong = `${subj.en} ${auxWrong} ${verb.ving} ${verb.obj_en} ${prepChoice[0]}.`;
      let vi = `${subj.vi} đang ${getViVerb(verb.v0)} ${verb.obj_vi} ${prepChoiceVi}.`;
      
      const vChoices = [`${aux} ${verb.ving}`, `${auxWrong} ${verb.ving}`, verb.v2, verb.v0];
      const pChoices = [prepChoice[0], 'now', 'tomorrow', 'every day'];
      return { correct: en, wrong: enWrong, vi: vi, focus: 'Was/Were Agreement', vc: vChoices, pc: pChoices };
    }
  },
  {
    id: 'fs',
    name: 'Future Simple',
    generate: (subj, verb) => {
      const vCorrect = `will ${verb.v0}`;
      const vWrong = `will ${verb.v1}`;
      const prepChoice = ['tomorrow', 'next week', 'soon'][Math.floor(Math.random() * 3)];
      const prepChoiceVi = prepChoice === 'tomorrow' ? 'ngày mai' : (prepChoice === 'next week' ? 'tuần tới' : 'sớm thôi');
      
      let en = `${subj.en} ${vCorrect} ${verb.obj_en} ${prepChoice}.`;
      let enWrong = `${subj.en} ${vWrong} ${verb.obj_en} ${prepChoice}.`;
      let vi = `${subj.vi} sẽ ${getViVerb(verb.v0)} ${verb.obj_vi} ${prepChoiceVi}.`;
      
      const vChoices = [vCorrect, vWrong, `will ${verb.ving}`, verb.v2];
      const pChoices = [prepChoice, 'yesterday', 'now', 'last week'];
      return { correct: en, wrong: enWrong, vi: vi, focus: 'Will + Bare Infinitive', vc: vChoices, pc: pChoices };
    }
  },
  {
    id: 'fc',
    name: 'Future Continuous',
    generate: (subj, verb) => {
      const vCorrect = `will be ${verb.ving}`;
      const vWrong = `will being ${verb.ving}`;
      const prepChoice = ['at 8 PM tomorrow', 'at this time next week'][Math.floor(Math.random() * 2)];
      const prepChoiceVi = prepChoice === 'at 8 PM tomorrow' ? 'lúc 8 giờ tối mai' : 'vào thời điểm này tuần tới';
      
      let en = `${subj.en} ${vCorrect} ${verb.obj_en} ${prepChoice}.`;
      let enWrong = `${subj.en} ${vWrong} ${verb.obj_en} ${prepChoice}.`;
      let vi = `${subj.vi} sẽ đang ${getViVerb(verb.v0)} ${verb.obj_vi} ${prepChoiceVi}.`;
      
      const vChoices = [vCorrect, vWrong, `will ${verb.ving}`, `will ${verb.v0}`];
      const pChoices = [prepChoice, 'yesterday', 'every day', 'ago'];
      return { correct: en, wrong: enWrong, vi: vi, focus: 'Will be + V-ing', vc: vChoices, pc: pChoices };
    }
  },
  {
    id: 'pp',
    name: 'Present Perfect',
    generate: (subj, verb) => {
      const aux = (subj.en === 'I' || ['3p', '1p'].includes(subj.kind)) ? 'have' : 'has';
      const auxWrong = aux === 'has' ? 'have' : 'has';
      const prepChoice = ['already', 'recently', 'just'][Math.floor(Math.random() * 3)];
      const prepChoiceVi = prepChoice === 'already' ? 'rồi' : (prepChoice === 'recently' ? 'gần đây' : 'vừa mới');
      
      // For Present Perfect, prep choices like 'just' and 'already' often go between aux and verb.
      // But for simplicity of generation, let's put them at the end unless it's just/already. 
      // Actually, "I have eaten dinner already." is fine. "I have just eaten dinner." is better for "just".
      // Let's standardise on end placement: "She has eaten dinner recently."
      // We will avoid "just" to simplify sentence structure at the end. Let's use "three times" instead of "just".
      let safePrepChoice = prepChoice === 'just' ? 'three times' : prepChoice;
      let safePrepChoiceVi = safePrepChoice === 'three times' ? 'ba lần' : prepChoiceVi;
      
      let en = `${subj.en} ${aux} ${verb.vp} ${verb.obj_en} ${safePrepChoice}.`;
      let enWrong = `${subj.en} ${auxWrong} ${verb.vp} ${verb.obj_en} ${safePrepChoice}.`;
      let vi = `${subj.vi} đã ${getViVerb(verb.v0)} xong ${verb.obj_vi} ${safePrepChoiceVi}.`;
      
      const vChoices = [`${aux} ${verb.vp}`, `${auxWrong} ${verb.vp}`, `${aux} ${verb.v2}`, verb.v2];
      const pChoices = [safePrepChoice, 'tomorrow', 'now', 'yesterday'];
      return { correct: en, wrong: enWrong, vi: vi, focus: 'Have/Has Agreement', vc: vChoices, pc: pChoices };
    }
  },
  {
    id: 'ppc',
    name: 'Present Perfect Continuous',
    generate: (subj, verb) => {
      const aux = (subj.en === 'I' || ['3p', '1p'].includes(subj.kind)) ? 'have' : 'has';
      const auxWrong = aux === 'has' ? 'have' : 'has';
      const prepChoice = ['for 2 hours', 'since morning', 'all day'][Math.floor(Math.random() * 3)];
      const prepChoiceVi = prepChoice === 'for 2 hours' ? 'trong 2 giờ' : (prepChoice === 'since morning' ? 'từ sáng' : 'cả ngày');
      
      let en = `${subj.en} ${aux} been ${verb.ving} ${verb.obj_en} ${prepChoice}.`;
      let enWrong = `${subj.en} ${auxWrong} been ${verb.ving} ${verb.obj_en} ${prepChoice}.`;
      let vi = `${subj.vi} đã và đang ${getViVerb(verb.v0)} ${verb.obj_vi} ${prepChoiceVi}.`;
      
      const vChoices = [`${aux} been ${verb.ving}`, `${auxWrong} been ${verb.ving}`, `${aux} ${verb.ving}`, verb.ving];
      const pChoices = [prepChoice, 'tomorrow', 'yesterday', 'next week'];
      return { correct: en, wrong: enWrong, vi: vi, focus: 'Have/Has been + V-ing', vc: vChoices, pc: pChoices };
    }
  },
  {
    id: 'pastp',
    name: 'Past Perfect',
    generate: (subj, verb) => {
      const vCorrect = `had ${verb.vp}`;
      const vWrong = `have ${verb.vp}`;
      const prepChoice = ['before I arrived', 'by the time we came'][Math.floor(Math.random() * 2)];
      const prepChoiceVi = prepChoice === 'before I arrived' ? 'trước khi tôi đến' : 'vào lúc chúng tôi đến';
      
      let en = `${subj.en} ${vCorrect} ${verb.obj_en} ${prepChoice}.`;
      let enWrong = `${subj.en} ${vWrong} ${verb.obj_en} ${prepChoice}.`;
      let vi = `${subj.vi} đã ${getViVerb(verb.v0)} xong ${verb.obj_vi} ${prepChoiceVi}.`;
      
      const vChoices = [vCorrect, vWrong, `had ${verb.ving}`, `has ${verb.vp}`];
      const pChoices = [prepChoice, 'tomorrow', 'always', 'now'];
      return { correct: en, wrong: enWrong, vi: vi, focus: 'Had + Past Participle', vc: vChoices, pc: pChoices };
    }
  }
];

let generatedLines = [];
let idCounter = 1;

tensesConfig.forEach(tenseConf => {
  // Generate 30 sentences per tense (14 Beg, 10 Int, 6 Adv)
  const distribution = [
    { level: 'Beginner', count: 14 },
    { level: 'Intermediate', count: 10 },
    { level: 'Advanced', count: 6 }
  ];

  distribution.forEach(dist => {
    for (let i = 0; i < dist.count; i++) {
      const subjList = subjects[dist.level];
      const subj = subjList[Math.floor(Math.random() * subjList.length)];
      const verb = verbs[Math.floor(Math.random() * verbs.length)];
      
      const genString = tenseConf.generate(subj, verb);
      
      const vChoicesStr = Array.from(new Set(genString.vc)).join('|');
      const pChoicesStr = Array.from(new Set(genString.pc)).join('|');
      
      const id = `${tenseConf.id}_new_${idCounter++}`;
      
      const line = `${id},${tenseConf.name},${dist.level},${genString.correct},${genString.wrong},${genString.focus},${genString.vi},${vChoicesStr},${pChoicesStr}`;
      generatedLines.push(line);
    }
  });
});

console.log(`Generated ${generatedLines.length} sentences across ${tensesConfig.length} tenses.`);

// Process existing TOON
const content = fs.readFileSync(targetFile, 'utf8');
const lines = content.trim().split('\n');

const origHeader = lines[0]; // [250]{id,tense,level,...}:

// Extract fields from old header
const headerMatch = origHeader.match(/\{([^}]+)\}/);
const oldFieldsCount = headerMatch[1].split(',').length; // Should be 7

const newLines = [];
const newCount = (lines.length - 1) + generatedLines.length;
newLines.push(`[${newCount}]{id,tense,level,correct_sentence,wrong_sentence,pedagogical_focus,vietnamese_translation,verb_choices,prep_choices}:`);

for (let i = 1; i < lines.length; i++) {
  let line = lines[i].trim();
  if (!line) continue;
  
  const segments = line.split(',');
  // if older lines don't have 9 fields, pad them smoothly
  if (segments.length < 9) {
     line = line + ',,'; // Append two empty columns
  }
  newLines.push(`  ${line}`); // We are maintaining indent when rewriting the whole file
}

// Append new ones
for (let newL of generatedLines) {
  // Make sure it starts with 2 empty spaces for TOON indent like "  id,..."
  newLines.push(`  ${newL}`);
}

const finalContent = newLines.join('\n') + '\n';
fs.writeFileSync(targetFile, finalContent, 'utf8');
console.log('Successfully updated the database!');
