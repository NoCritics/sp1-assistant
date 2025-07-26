const TemplateEngine = require('./src/templateEngine');

// Test documentation loading
const engine = new TemplateEngine();

console.log('Testing SP1 documentation loading...\n');

// Check each tier
const tiers = ['tier1', 'tier2', 'full'];
for (const tier of tiers) {
    const docs = engine.sp1Docs[tier];
    if (docs) {
        console.log(`? ${tier} loaded: ${docs.length} characters`);
        console.log(`  First 100 chars: ${docs.substring(0, 100)}...`);
    } else {
        console.log(`? ${tier} failed to load`);
    }
}

// Test model mapping
console.log('\nTesting model-to-documentation mapping:');
const testModels = [
    'mistral-7b',
    'deepseek-coder',
    'claude-3-sonnet',
    'direct'
];

for (const model of testModels) {
    const docs = engine.getDocumentationForModel(model);
    console.log(`${model}: ${docs ? docs.length + ' chars' : 'no docs'}`);
}

console.log('\nDocumentation test complete!');