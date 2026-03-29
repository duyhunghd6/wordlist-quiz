const fs = require('fs');
const path = require('path');

const validateBank = (filePath, isTF) => {
    try {
        const fullPath = path.resolve(__dirname, '..', filePath);
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
        
        console.log(`\n=== QA Report: ${filePath} ===`);
        console.log(`Total questions: ${data.length}`);
        
        let errors = 0;
        let difficulties = { easy: 0, medium: 0, hard: 0 };
        let skills = {};
        
        data.forEach((item, index) => {
            // Check required base fields
            const required = ['id', 'unit', 'topic', 'difficulty', 'explanation', 'thinkingSkill'];
            required.forEach(field => {
                if (!item[field]) {
                    console.error(`[Error] Missing '${field}' at index ${index} (ID: ${item.id})`);
                    errors++;
                }
            });

            // Specific structure
            if (isTF) {
                if (!item.statement) { console.error(`[Error] Missing 'statement' at index ${index}`); errors++; }
                if (typeof item.isTrue !== 'boolean') { console.error(`[Error] Missing 'isTrue' boolean at index ${index}`); errors++; }
            } else {
                if (!item.question) { console.error(`[Error] Missing 'question' at index ${index}`); errors++; }
                if (!Array.isArray(item.options) || item.options.length < 2) { console.error(`[Error] Missing 'options' array at index ${index}`); errors++; }
                if (typeof item.correctIndex !== 'number' || item.correctIndex >= item.options.length) { console.error(`[Error] Invalid 'correctIndex' at index ${index}`); errors++; }
            }

            // Stats
            if (difficulties[item.difficulty] !== undefined) difficulties[item.difficulty]++;
            skills[item.thinkingSkill] = (skills[item.thinkingSkill] || 0) + 1;
        });

        console.log(`Difficulties: ${JSON.stringify(difficulties)}`);
        console.log(`Thinking Skills: ${JSON.stringify(skills)}`);
        
        if (errors === 0) {
            console.log(`✅ Passed perfectly.`);
            return true;
        } else {
            console.log(`❌ Failed with ${errors} errors.`);
            return false;
        }
    } catch (err) {
        console.error(`Failed to read/parse ${filePath}:`, err.message);
        return false;
    }
}

console.log("Starting QA process for Unit 5 Science Knowledge Banks...");
const r1 = validateBank('public/db/science_quiz_unit5.json', false);
const r2 = validateBank('public/db/science_tf_unit5.json', true);

if (!r1 || !r2) process.exit(1);
