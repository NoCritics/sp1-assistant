const express = require('express');
const axios = require('axios');
const { Anthropic } = require('@anthropic-ai/sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS for frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, X-Provider');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    providers: ['anthropic', 'openai', 'google'],
    timestamp: new Date().toISOString()
  });
});

// Universal completion endpoint
app.post('/v1/completions', async (req, res) => {
  const apiKey = req.headers['x-api-key'];
  const provider = req.headers['x-provider'];
  
  if (!apiKey) {
    return res.status(400).json({ error: 'Missing X-API-Key header' });
  }
  
  if (!provider) {
    return res.status(400).json({ error: 'Missing X-Provider header' });
  }

  const { model, messages, temperature = 0.1, max_tokens = 4096 } = req.body;

  try {
    let response;
    
    switch (provider) {
      case 'anthropic':
        response = await handleAnthropic(apiKey, model, messages, temperature, max_tokens);
        break;
      case 'openai':
        response = await handleOpenAI(apiKey, model, messages, temperature, max_tokens);
        break;
      case 'google':
        response = await handleGoogle(apiKey, model, messages, temperature, max_tokens);
        break;
      default:
        return res.status(400).json({ error: `Unknown provider: ${provider}` });
    }
    
    res.json(response);
  } catch (error) {
    console.error(`Error with ${provider}:`, error.message);
    
    // Provide user-friendly error messages
    if (error.message.includes('401')) {
      return res.status(401).json({ error: 'Invalid API key' });
    } else if (error.message.includes('429')) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    } else if (error.message.includes('overloaded')) {
      return res.status(503).json({ error: 'Model overloaded, please try again' });
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Anthropic handler
async function handleAnthropic(apiKey, model, messages, temperature, maxTokens) {
  const anthropic = new Anthropic({ apiKey });
  
  // Convert messages to Anthropic format
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const userMessages = messages.filter(m => m.role !== 'system');
  
  const response = await anthropic.messages.create({
    model: model,
    system: systemMessage,
    messages: userMessages,
    temperature: temperature,
    max_tokens: maxTokens
  });
  
  return {
    id: response.id,
    choices: [{
      message: {
        role: 'assistant',
        content: response.content[0].text
      },
      finish_reason: response.stop_reason
    }],
    usage: {
      prompt_tokens: response.usage.input_tokens,
      completion_tokens: response.usage.output_tokens,
      total_tokens: response.usage.input_tokens + response.usage.output_tokens
    }
  };
}

// OpenAI handler
async function handleOpenAI(apiKey, model, messages, temperature, maxTokens) {
  const openai = new OpenAI({ apiKey });
  
  const response = await openai.chat.completions.create({
    model: model,
    messages: messages,
    temperature: temperature,
    max_tokens: maxTokens
  });
  
  return response;
}

// Google handler
async function handleGoogle(apiKey, model, messages, temperature, maxTokens) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const genModel = genAI.getGenerativeModel({ model: model });
  
  // Convert messages to Google format
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const userMessage = messages[messages.length - 1].content;
  
  const prompt = systemMessage ? `${systemMessage}\n\n${userMessage}` : userMessage;
  
  const result = await genModel.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: temperature,
      maxOutputTokens: maxTokens,
    }
  });
  
  const response = await result.response;
  
  return {
    id: Date.now().toString(),
    choices: [{
      message: {
        role: 'assistant',
        content: response.text()
      },
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: Math.ceil(prompt.length / 4),
      completion_tokens: Math.ceil(response.text().length / 4),
      total_tokens: Math.ceil((prompt.length + response.text().length) / 4)
    }
  };
}

// Cost estimation endpoint
app.post('/v1/estimate-cost', (req, res) => {
  const { model, promptTokens, completionTokens } = req.body;
  
  const pricing = {
    // Anthropic
    'claude-4-opus-20250514': { input: 0.015, output: 0.075 },
    'claude-4-sonnet-20250514': { input: 0.003, output: 0.015 },
    'claude-3-7-sonnet-20250219': { input: 0.003, output: 0.015 },
    
    // OpenAI
    'gpt-4-turbo-preview': { input: 0.01, output: 0.03 },
    'gpt-4o': { input: 0.0025, output: 0.01 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    
    // Google
    'gemini-2.5-pro': { input: 0.00125, output: 0.01 },
    'gemini-2.5-flash': { input: 0.00015, output: 0.0006 }
  };
  
  const modelPricing = pricing[model];
  if (!modelPricing) {
    return res.status(400).json({ error: 'Unknown model' });
  }
  
  const cost = (promptTokens / 1000 * modelPricing.input) + 
               (completionTokens / 1000 * modelPricing.output);
  
  res.json({
    model,
    promptTokens,
    completionTokens,
    estimatedCost: cost.toFixed(4),
    pricing: modelPricing
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Cloud LLM API proxy running on port ${PORT}`);
  console.log('Providers: Anthropic, OpenAI, Google');
  console.log('API keys must be provided by users');
});