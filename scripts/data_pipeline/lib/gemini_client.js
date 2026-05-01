const http = require('http');
const https = require('https');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });

function decodeEnv(key) {
  const encoded = process.env[`${key}_BASE64`];
  if (encoded) {
    return Buffer.from(encoded, 'base64').toString('utf8').trim();
  }
  return process.env[key];
}

const OPENAI_BASE_URL = decodeEnv('OPENAI_API_COMPATIBLE');
const OPENAI_API_KEY = decodeEnv('API_KEY');
const OPENAI_MODEL = decodeEnv('MODEL');
const GEMINI_API_KEY = decodeEnv('GEMINI_API_KEY');
const DEFAULT_MODEL = OPENAI_MODEL || process.env.GEMINI_TEXT_MODEL || 'models/gemini-3.1-pro-preview';

function normalizeGeminiModel(model) {
  const value = model || DEFAULT_MODEL;
  return value.startsWith('models/') ? value : `models/${value}`;
}

function requestJson(urlObj, payload, headers) {
  const transport = urlObj.protocol === 'http:' ? http : https;
  const body = JSON.stringify(payload);

  return new Promise((resolve, reject) => {
    const req = transport.request({
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...headers,
      },
    }, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(new Error(`LLM API error ${res.statusCode}: ${responseBody.slice(0, 1000)}`));
          return;
        }
        try {
          resolve(JSON.parse(responseBody));
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function parseJsonText(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) {
    throw new Error('LLM response did not include text');
  }
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenced) {
      return JSON.parse(fenced[1]);
    }
    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
    }
    throw error;
  }
}

async function generateOpenAICompatibleJson({ model, prompt, temperature = 0.2, maxOutputTokens }) {
  if (!OPENAI_BASE_URL || !OPENAI_API_KEY || !OPENAI_MODEL) {
    throw new Error('Missing OPENAI_API_COMPATIBLE_BASE64, API_KEY_BASE64, or MODEL_BASE64 in .env');
  }

  const urlObj = new URL(`${OPENAI_BASE_URL.replace(/\/$/, '')}/chat/completions`);
  const json = await requestJson(urlObj, {
    model: model || OPENAI_MODEL,
    messages: [
      { role: 'system', content: 'Return valid JSON only. Do not include markdown.' },
      { role: 'user', content: prompt },
    ],
    temperature,
    max_tokens: maxOutputTokens,
    response_format: { type: 'json_object' },
  }, {
    Authorization: `Bearer ${OPENAI_API_KEY}`,
  });

  const text = json.choices?.[0]?.message?.content;
  return parseJsonText(text);
}

async function generateGeminiJson({ model, prompt, temperature = 0.2, maxOutputTokens }) {
  if (!GEMINI_API_KEY) {
    throw new Error('Missing GEMINI_API_KEY_BASE64 or GEMINI_API_KEY in .env');
  }

  const generationConfig = {
    temperature,
    responseMimeType: 'application/json',
  };
  if (maxOutputTokens) {
    generationConfig.maxOutputTokens = maxOutputTokens;
  }

  const urlObj = new URL(`https://generativelanguage.googleapis.com/v1beta/${normalizeGeminiModel(model)}:generateContent?key=${GEMINI_API_KEY}`);
  const json = await requestJson(urlObj, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig,
  });
  const parts = json.candidates?.[0]?.content?.parts || [];
  return parseJsonText(parts.map((part) => part.text || '').join('').trim());
}

async function generateJson(options = {}) {
  if (!options.prompt) {
    throw new Error('generateJson requires a prompt');
  }
  if (OPENAI_BASE_URL) {
    return generateOpenAICompatibleJson(options);
  }
  return generateGeminiJson(options);
}

module.exports = { generateJson, DEFAULT_MODEL };
