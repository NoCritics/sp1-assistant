const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const TemplateEngine = require('./templateEngine');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Initialize template engine
const templateEngine = new TemplateEngine();

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'sp1-assistant',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// List available templates
app.get('/api/templates', (req, res) => {
  const templates = [
    {
      id: 'game-score',
      name: 'Game Score Verification',
      description: 'Verify game scores with zero-knowledge proofs',
      example: 'Prove that a player achieved a specific score without revealing game details'
    },
    {
      id: 'document-verify',
      name: 'Document Verification',
      description: 'Verify document authenticity and integrity',
      example: 'Prove document hasn\'t been tampered with using cryptographic hashes'
    },
    {
      id: 'data-processing',
      name: 'Data Processing Proof',
      description: 'Prove correct computation over private data',
      example: 'Prove statistical computations without revealing underlying data'
    }
  ];
  res.json(templates);
});

// List available models
app.get('/api/models', (req, res) => {
  const models = [
    // Direct generation
    { 
      id: 'direct', 
      name: 'Direct Generation', 
      provider: 'none',
      description: 'Use template without AI enhancement',
      requiresKey: false,
      recommended: false
    },
    
    // Anthropic
    { 
      id: 'claude-4-opus', 
      name: 'Claude 4 Opus', 
      provider: 'anthropic',
      description: 'Most capable model, best for complex code',
      contextWindow: 200000,
      requiresKey: true,
      recommended: true
    },
    { 
      id: 'claude-4-sonnet', 
      name: 'Claude 4 Sonnet', 
      provider: 'anthropic',
      description: 'Balanced performance and cost',
      contextWindow: 200000,
      requiresKey: true,
      recommended: true
    },
    { 
      id: 'claude-3.7-sonnet', 
      name: 'Claude 3.7 Sonnet', 
      provider: 'anthropic',
      description: 'Extended thinking capabilities',
      contextWindow: 200000,
      requiresKey: true,
      recommended: false
    },
    
    // OpenAI
    { 
      id: 'gpt-4.1', 
      name: 'GPT-4.1 Turbo', 
      provider: 'openai',
      description: 'Latest GPT-4 with improved reasoning',
      contextWindow: 128000,
      requiresKey: true,
      recommended: true
    },
    { 
      id: 'gpt-4-turbo', 
      name: 'GPT-4 Turbo', 
      provider: 'openai',
      description: 'Fast and capable',
      contextWindow: 128000,
      requiresKey: true,
      recommended: false
    },
    { 
      id: 'gpt-4o', 
      name: 'GPT-4o', 
      provider: 'openai',
      description: 'Multimodal GPT-4',
      contextWindow: 128000,
      requiresKey: true,
      recommended: false
    },
    
    // Google
    { 
      id: 'gemini-2.5-pro', 
      name: 'Gemini 2.5 Pro', 
      provider: 'google',
      description: 'Best value, huge context window',
      contextWindow: 1000000,
      requiresKey: true,
      recommended: true
    },
    { 
      id: 'gemini-2.5-flash', 
      name: 'Gemini 2.5 Flash', 
      provider: 'google',
      description: 'Fast and affordable',
      contextWindow: 1000000,
      requiresKey: true,
      recommended: false
    }
  ];
  res.json(models);
});

// Get context size options
app.get('/api/context-sizes', (req, res) => {
  const sizes = [
    {
      id: 'pattern',
      name: 'Pattern-Based (Recommended)',
      description: 'Optimized SP1 patterns and examples',
      tokens: '~8k tokens'
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Essential SP1 functions only',
      tokens: '~2k tokens'
    },
    {
      id: 'full',
      name: 'Full Documentation',
      description: 'Complete SP1 reference (if model supports)',
      tokens: '~14k tokens'
    }
  ];
  res.json(sizes);
});

// Generate SP1 integration
app.post('/api/generate', async (req, res) => {
  try {
    const { 
      template, 
      code, 
      model, 
      apiKey,
      contextSize = 'pattern'
    } = req.body;
    
    if (!template || !code) {
      return res.status(400).json({ 
        error: 'Template and code are required' 
      });
    }

    console.log(`Generating ${template} with model ${model || 'direct'}`);
    
    // Validate API key requirement
    if (model !== 'direct' && !apiKey) {
      return res.status(400).json({ 
        error: 'API key required for AI-enhanced generation' 
      });
    }
    
    // Generate the integration
    const result = await templateEngine.generateSP1Integration(
      template,
      code,
      model || 'direct',
      apiKey,
      contextSize
    );
    
    res.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Generation error:', error);
    
    // Provide user-friendly error messages
    let userMessage = 'Failed to generate SP1 integration';
    
    if (error.message.includes('Invalid API key')) {
      userMessage = 'Invalid API key. Please check your key and try again.';
    } else if (error.message.includes('Rate limit')) {
      userMessage = 'Rate limit exceeded. Please try again later.';
    } else if (error.message.includes('overloaded')) {
      userMessage = 'Model is currently overloaded. Please try again in a few moments.';
    }
    
    res.status(500).json({ 
      error: userMessage,
      details: error.message 
    });
  }
});

// Estimate cost endpoint
app.post('/api/estimate-cost', async (req, res) => {
  try {
    const { model, template, code, contextSize = 'pattern' } = req.body;
    
    // Rough token estimation
    const contextTokens = {
      minimal: 2000,
      pattern: 8000,
      full: 14000
    };
    
    const promptTokens = contextTokens[contextSize] + Math.ceil(code.length / 4);
    const estimatedCompletion = 2000; // Typical SP1 program size
    
    const response = await fetch('http://localhost:3000/v1/estimate-cost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: templateEngine.modelConfigs[model]?.model,
        promptTokens,
        completionTokens: estimatedCompletion
      })
    });
    
    const estimate = await response.json();
    res.json(estimate);
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to estimate cost' });
  }
});

// Cache stats endpoint
app.get('/api/cache-stats', (req, res) => {
  res.json({
    size: templateEngine.cache.size(),
    ttl: '60 minutes'
  });
});

// Clear cache endpoint
app.post('/api/cache-clear', (req, res) => {
  templateEngine.cache.clear();
  res.json({ success: true, message: 'Cache cleared' });
});

// Start server
app.listen(PORT, () => {
  console.log(`SP1 Assistant API running on port ${PORT}`);
  console.log(`Cloud LLM providers: Anthropic, OpenAI, Google`);
  console.log(`API keys must be provided by users`);
  console.log(`Docs: https://decompositionfacility.xyz`);
});