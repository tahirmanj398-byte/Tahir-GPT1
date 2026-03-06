import express from 'express';
import { authenticateToken } from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Simple in-memory cache
const cache = new Map<string, { response: any, timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour
const MAX_CACHE_SIZE = 1000;

// Rate limiter: 50 requests per 15 minutes per IP
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { error: 'Too many requests, please try again later.' }
});

// Fallback chain function
async function generateWithFallback(prompt: string, systemInstruction?: string) {
  const cacheKey = JSON.stringify({ prompt, systemInstruction });
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.response;
  }

  const apis = [
    {
      name: 'Gemini',
      call: async () => {
        if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY missing');
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
          })
        });
        if (!res.ok) throw new Error(`Gemini Error: ${res.statusText}`);
        const data = await res.json();
        return data.candidates[0].content.parts[0].text;
      }
    },
    {
      name: 'OpenAI',
      call: async () => {
        if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY missing');
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
              { role: 'user', content: prompt }
            ]
          })
        });
        if (!res.ok) throw new Error(`OpenAI Error: ${res.statusText}`);
        const data = await res.json();
        return data.choices[0].message.content;
      }
    },
    {
      name: 'Cohere',
      call: async () => {
        if (!process.env.COHERE_API_KEY) throw new Error('COHERE_API_KEY missing');
        const res = await fetch('https://api.cohere.ai/v1/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.COHERE_API_KEY}`
          },
          body: JSON.stringify({
            model: 'command',
            prompt: systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt,
            max_tokens: 1000
          })
        });
        if (!res.ok) throw new Error(`Cohere Error: ${res.statusText}`);
        const data = await res.json();
        return data.generations[0].text;
      }
    },
    {
      name: 'OpenRouter',
      call: async () => {
        if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY missing');
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-free', // Free tier model
            messages: [
              ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
              { role: 'user', content: prompt }
            ]
          })
        });
        if (!res.ok) throw new Error(`OpenRouter Error: ${res.statusText}`);
        const data = await res.json();
        return data.choices[0].message.content;
      }
    },
    {
      name: 'Hugging Face',
      call: async () => {
        if (!process.env.HF_API_KEY) throw new Error('HF_API_KEY missing');
        const res = await fetch('https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.HF_API_KEY}`
          },
          body: JSON.stringify({
            inputs: systemInstruction ? `<s>[INST] ${systemInstruction}\n\n${prompt} [/INST]` : `<s>[INST] ${prompt} [/INST]`,
            parameters: { max_new_tokens: 1000 }
          })
        });
        if (!res.ok) throw new Error(`HF Error: ${res.statusText}`);
        const data = await res.json();
        let text = data[0].generated_text;
        // Remove the prompt from the output
        const splitStr = '[/INST]';
        if (text.includes(splitStr)) {
          text = text.split(splitStr)[1].trim();
        }
        return text;
      }
    }
  ];

  let lastError = null;
  for (const api of apis) {
    try {
      console.log(`Trying ${api.name}...`);
      const response = await api.call();
      if (response) {
        console.log(`${api.name} succeeded.`);
        if (cache.size >= MAX_CACHE_SIZE) {
          // Remove oldest entry
          const firstKey = cache.keys().next().value;
          if (firstKey) cache.delete(firstKey);
        }
        cache.set(cacheKey, { response, timestamp: Date.now() });
        return { text: response, provider: api.name };
      }
    } catch (error: any) {
      console.error(`${api.name} failed:`, error.message);
      lastError = error;
    }
  }

  throw new Error(`All APIs failed. Last error: ${lastError?.message}`);
}

router.post('/generate', authenticateToken, aiLimiter, async (req, res) => {
  try {
    const { prompt, systemInstruction } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const result = await generateWithFallback(prompt, systemInstruction);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
