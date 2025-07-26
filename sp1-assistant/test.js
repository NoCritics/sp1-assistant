const TemplateEngine = require('./src/templateEngine');

async function test() {
  const engine = new TemplateEngine();
  
  // Test game score template
  const gameCode = `
    function checkScore(score) {
      const MAX_SCORE = 1000000;
      return score <= MAX_SCORE;
    }
  `;
  
  try {
    const result = await engine.generateSP1Integration(
      'game-score',
      gameCode,
      'direct' // No LLM enhancement for testing
    );
    
    console.log('Generated SP1 Program:');
    console.log(result.program);
    console.log('\n---\n');
    console.log('Prove Script:');
    console.log(result.proveScript);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
