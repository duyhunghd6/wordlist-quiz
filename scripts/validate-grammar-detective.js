const fs = require('fs');
const path = require('path');

// Read the data and modes files
const dataPath = path.join(__dirname, '../src/components/games/grammarDetectiveData.js');
const modesPath = path.join(__dirname, '../src/components/games/grammarDetectiveModes.js');

const dataFileContent = fs.readFileSync(dataPath, 'utf8');
const modesFileContent = fs.readFileSync(modesPath, 'utf8');

// A very simple extraction of the arrays/objects since we don't have babel setup in the pure node script easily.
// Instead of complex AST, we can try to extract the data using regex or simple evaluation.

let SCENARIO_TAXONOMY;
try {
  // Extract SCENARIO_TAXONOMY object string
  const taxonomyMatch = modesFileContent.match(/export const SCENARIO_TAXONOMY = (\{[\s\S]*?\});/);
  if (taxonomyMatch) {
    SCENARIO_TAXONOMY = eval('(' + taxonomyMatch[1] + ')');
  } else {
    throw new Error("Could not find SCENARIO_TAXONOMY in grammarDetectiveModes.js");
  }
} catch (e) {
  console.error("Error parsing SCENARIO_TAXONOMY:", e);
  process.exit(1);
}

const modalPath = path.join(__dirname, '../src/components/games/grammarDetectiveData/modalData.js');
const actionFreezePath = path.join(__dirname, '../src/components/games/grammarDetectiveData/actionFreezeData.js');
const futureForecastPath = path.join(__dirname, '../src/components/games/grammarDetectiveData/futureForecastData.js');

const modalContent = fs.readFileSync(modalPath, 'utf8');
const freezeContent = fs.readFileSync(actionFreezePath, 'utf8');
const futureContent = fs.readFileSync(futureForecastPath, 'utf8');

let grammarDetectiveData = [];
try {
  const modalMatch = modalContent.match(/export const modalData = (\[[\s\S]*?\]);\s*$/);
  if (modalMatch) grammarDetectiveData.push(...eval('(' + modalMatch[1] + ')'));
  
  const freezeMatch = freezeContent.match(/export const actionFreezeData = (\[[\s\S]*?\]);\s*$/);
  if (freezeMatch) grammarDetectiveData.push(...eval('(' + freezeMatch[1] + ')'));

  const futureMatch = futureContent.match(/export const futureForecastData = (\[[\s\S]*?\]);\s*$/);
  if (futureMatch) grammarDetectiveData.push(...eval('(' + futureMatch[1] + ')'));
} catch (e) {
  console.error("Error parsing data files:", e);
  process.exit(1);
}

console.log(`Loaded ${grammarDetectiveData.length} questions for validation.\n`);

let errorCount = 0;
let validCount = 0;

function reportError(id, message) {
  console.error(`[❌ ERROR] Question ${id}: ${message}`);
  errorCount++;
}

// Validation Logic
grammarDetectiveData.forEach(q => {
  // Required fields
  const requiredFields = ['id', 'game', 'sentence', 'clueText', 'answer', 'options', 'difficulty'];
  // 'scenario', 'scenarioLabel', 'clueQuestion', 'meaningHint', 'formHint', 'explanation' are also required for Sprint 004, but some might be missing in migration.
  
  requiredFields.forEach(field => {
    if (q[field] === undefined || q[field] === '') {
      reportError(q.id, `Missing required field: '${field}'`);
    }
  });

  if (!q.sentence || !q.clueText) return;

  // ClueText must appear in sentence
  if (!q.sentence.includes(q.clueText)) {
    reportError(q.id, `'clueText' ("${q.clueText}") not found in 'sentence' ("${q.sentence}")`);
  }

  // Options must be an array
  if (!Array.isArray(q.options) || q.options.length < 2) {
    reportError(q.id, `'options' must be an array with at least 2 items`);
  } else {
    // Answer must be in options or acceptedAnswers
    const isAnswerInOptions = q.options.includes(q.answer);
    const isAnswerInAccepted = q.acceptedAnswers && q.acceptedAnswers.includes(q.answer);
    if (!isAnswerInOptions && !isAnswerInAccepted) {
      reportError(q.id, `'answer' ("${q.answer}") is not in 'options' and not in 'acceptedAnswers'`);
    }
  }

  // Explanation length (should be short, max ~2 sentences)
  if (q.explanation && q.explanation.split('.').length > 4) { // arbitrary threshold for "short"
    reportError(q.id, `'explanation' might be too long. Keep it short and child-friendly.`);
  }

  // Taxonomy Validation
  if (q.scenario) {
    const gameTaxonomy = SCENARIO_TAXONOMY[q.game];
    if (!gameTaxonomy) {
      reportError(q.id, `Game '${q.game}' has no taxonomy defined.`);
    } else {
      const scenarioDef = gameTaxonomy[q.scenario];
      if (!scenarioDef) {
        reportError(q.id, `Invalid 'scenario' ("${q.scenario}") for game '${q.game}'.`);
      } else {
        if (q.scenarioLabel !== scenarioDef.label) {
          reportError(q.id, `'scenarioLabel' ("${q.scenarioLabel}") doesn't match taxonomy label ("${scenarioDef.label}")`);
        }
      }
    }
  }

  if (errorCount === 0) validCount++;
});

// Check contrast sets
const contrastSets = {};
grammarDetectiveData.forEach(q => {
  if (q.contrastSet) {
    if (!contrastSets[q.contrastSet]) contrastSets[q.contrastSet] = [];
    contrastSets[q.contrastSet].push(q.id);
  }
});

for (const [setName, ids] of Object.entries(contrastSets)) {
  if (ids.length < 2) {
    reportError(`ContrastSet ${setName}`, `Has fewer than 2 items: ${ids.join(', ')}`);
  }
}

console.log(`\nValidation Complete. ${errorCount} errors found.`);
if (errorCount > 0) {
  process.exit(1);
} else {
  console.log("✅ All questions passed validation!");
}
