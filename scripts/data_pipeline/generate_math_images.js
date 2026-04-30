const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const https = require('https');

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=' + API_KEY;

const promptsPath = path.join(__dirname, '..', '..', 'public', 'db', 'math_prompts.json');
const outDir = path.join(__dirname, '..', '..', 'public', 'db', 'math');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Read the generated prompts
let promptsData = [];
if (fs.existsSync(promptsPath)) {
  promptsData = JSON.parse(fs.readFileSync(promptsPath, 'utf8'));
} else {
  console.log('No math_prompts.json found. Please run generate_math_prompts.js first.');
  process.exit(0);
}

// Process all prompts
const targetPrompts = promptsData;

console.log(`Found ${promptsData.length} total prompts, starting full generation.`);

async function generateImage(item) {
  const word = item.word;
  const safeWord = word.replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '_');
  const outFile = path.join(outDir, `${safeWord}.png`);
  
  if (fs.existsSync(outFile)) {
    console.log(`Skipping ${word}, image already exists.`);
    return false; // Return false to indicate skipped
  }
  
  console.log(`Generating image for: ${word}...`);
  
  const payload = JSON.stringify({
    contents: [
      {
        parts: [
          { text: item.image_prompt }
        ]
      }
    ]
  });
  
  const urlObj = new URL(API_URL);
  
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
            if (json.candidates && json.candidates[0] && json.candidates[0].content && json.candidates[0].content.parts) {
              const parts = json.candidates[0].content.parts;
              let base64Data = null;
              for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                  base64Data = part.inlineData.data;
                  break;
                }
              }
              
              if (base64Data) {
                const buffer = Buffer.from(base64Data, 'base64');
                fs.writeFileSync(outFile, buffer);
                console.log(`Saved ${outFile}`);
                resolve(true); // Return true to indicate success/API call made
              } else {
                console.error(`Unexpected API response for ${word}:`, body.substring(0, 200));
                resolve(true); // Don't crash, just skip, but count as API call
              }
            } else {
              console.error(`Unexpected API response for ${word}:`, body.substring(0, 200));
              resolve(true); // Don't crash, just skip, but count as API call
            }
          } catch (e) {
            console.error(`Failed to parse response for ${word}:`, e);
            resolve(true);
          }
        } else {
          console.error(`API Error for ${word}: ${res.statusCode}`, body.substring(0, 200));
          resolve(true);
        }
      });
    });
    
    req.on('error', (e) => {
      console.error(`Request error for ${word}:`, e);
      resolve(true);
    });
    
    req.write(payload);
    req.end();
  });
}

async function run() {
  for (let i = 0; i < targetPrompts.length; i++) {
    const wasGenerated = await generateImage(targetPrompts[i]);
    // Delay to respect rate limits ONLY if we actually made an API call
    if (wasGenerated) {
      await new Promise(r => setTimeout(r, 4000));
    }
  }
  console.log('Finished processing all images!');
}

run();
