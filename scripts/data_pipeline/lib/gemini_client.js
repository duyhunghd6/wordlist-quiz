const https = require('https');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });

const API_KEY = process.env.GEMINI_API_KEY;
const DEFAULT_MODEL = process.env.GEMINI_TEXT_MODEL || 'models/gemini-3.1-pro-preview';

function normalizeModel(model) {
  const value = model || DEFAULT_MODEL;
  return value.startsWith('models/') ? value : `models/${value}`;
}

function extractJsonText(responseBody) {
  const json = JSON.parse(responseBody);
  const parts = json.candidates?.[0]?.content?.parts || [];
  const text = parts.map((part) => part.text || '').join('').trim();
  if (!text) {
    throw new Error(`Gemini response did not include text: ${responseBody.slice(0, 500)}`);
  }
  return JSON.parse(text);
}

async function generateJson({ model, prompt, temperature = 0.2, maxOutputTokens } = {}) {
  if (!API_KEY) {
    throw new Error('Missing GEMINI_API_KEY in .env');
  }
  if (!prompt) {
    throw new Error('generateJson requires a prompt');
  }

  const generationConfig = {
    temperature,
    responseMimeType: 'application/json',
  };
  if (maxOutputTokens) {
    generationConfig.maxOutputTokens = maxOutputTokens;
  }

  const payload = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig,
  });

  const urlObj = new URL(`https://generativelanguage.googleapis.com/v1beta/${normalizeModel(model)}:generateContent?key=${API_KEY}`);

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`Gemini API error ${res.statusCode}: ${body.slice(0, 1000)}`));
          return;
        }
        try {
          resolve(extractJsonText(body));
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

module.exports = { generateJson, DEFAULT_MODEL };
