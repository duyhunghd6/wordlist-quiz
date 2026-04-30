const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const https = require('https');

const API_KEY = process.env.GEMINI_API_KEY;
const TEXT_MODEL = 'models/gemini-3-flash-preview';

const dataPath = path.join(__dirname, '..', '..', 'public', 'db', 'wordlist_math.json');
const promptsPath = path.join(__dirname, '..', '..', 'public', 'db', 'math_prompts.json');
const imagesDir = path.join(__dirname, '..', '..', 'public', 'db', 'math');

const wordsData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const targetWords = wordsData.filter(item => item.word && item.word.trim() !== '');

// Filter out words that already have generated images
const missingWords = targetWords.filter(item => {
  const safeWord = item.word.replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_');
  const imagePath = path.join(imagesDir, `${safeWord}.png`);
  return !fs.existsSync(imagePath);
});

console.log(`Found ${targetWords.length} total words in math wordlist.`);
console.log(`Found ${missingWords.length} words that need prompts generated.`);

async function generatePromptsBatch(batch) {
  const promptText = `
You are an expert educational game designer. I have a list of Mathematics vocabulary words and their definitions.
Your task is to create an image generation prompt for each word. These images will be used in a "guess the word" quiz.

RULES FOR PEDAGOGICAL VISUAL DISAMBIGUATION (MATH):
1. UNAMBIGUOUS: The image MUST clearly and uniquely represent the specific math concept. 
2. NO TEXT OR NUMBERS: Do not include any words, letters, or numbers in the image itself. You must represent the math visually using geometry, groups of objects, fraction bars, symbols (+, -, =, >), etc.
3. CONTEXT & METAPHORS: Use clear, visual math representations.
   - E.g., for "Difference", show two groups of blocks with an arrow pointing to the extra blocks on one side.
   - E.g., for "Negative", show a thermometer reading below a clearly marked zero line (without numbers).
4. NO ABSTRACT ART: Keep descriptions focused on clear, concrete objects, visual aids, or geometric shapes. Style should be: "Clean, flat vector-style educational flashcard illustration, solid white background."

Output format: A strict JSON array of objects. Each object must have "word" and "image_prompt".
   
Words to process:
${JSON.stringify(batch, null, 2)}
`;

  const payload = JSON.stringify({
    contents: [
      {
        parts: [
          { text: promptText }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      responseMimeType: "application/json"
    }
  });

  const urlObj = new URL(`https://generativelanguage.googleapis.com/v1beta/${TEXT_MODEL}:generateContent?key=${API_KEY}`);

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const json = JSON.parse(body);
            if (json.candidates && json.candidates[0].content.parts[0].text) {
              const text = json.candidates[0].content.parts[0].text;
              resolve(JSON.parse(text));
            } else {
              console.error("No text in response:", body);
              resolve([]);
            }
          } catch (e) {
            console.error("Failed to parse Gemini response:", e);
            resolve([]);
          }
        } else {
          console.error("API Error:", res.statusCode, body);
          resolve([]);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  if (missingWords.length === 0) {
    console.log('No new prompts needed! Exiting.');
    return;
  }

  const batchSize = 30;
  let newPrompts = [];
  
  for (let i = 0; i < missingWords.length; i += batchSize) {
    const batch = missingWords.slice(i, i + batchSize).map(w => ({ word: w.word, definition: w.definition }));
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(missingWords.length / batchSize)}...`);
    const results = await generatePromptsBatch(batch);
    newPrompts = newPrompts.concat(results);
    await new Promise(r => setTimeout(r, 2000));
  }
  
  // Load existing prompts if the file exists
  let existingPrompts = [];
  if (fs.existsSync(promptsPath)) {
    try {
      existingPrompts = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
    } catch(e) {
      console.warn("Could not read existing prompts file, creating new.");
    }
  }

  // Merge them (only add new ones)
  const existingWords = new Set(existingPrompts.map(p => p.word));
  for (const p of newPrompts) {
    if (!existingWords.has(p.word)) {
      existingPrompts.push(p);
    }
  }

  fs.writeFileSync(promptsPath, JSON.stringify(existingPrompts, null, 2));
  console.log(`Successfully appended ${newPrompts.length} new prompts and saved to ${promptsPath}`);
}

run();
