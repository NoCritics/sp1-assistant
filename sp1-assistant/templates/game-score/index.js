const SP1Template = require('../baseTemplate');

class GameScoreTemplate extends SP1Template {
  constructor() {
    super(
      'game-score',
      'Verify game scores with zero-knowledge proofs'
    );
  }

  parseInput(userCode) {
    // Enhanced parsing with more patterns
    const patterns = {
      scoreVariable: /score|points|finalScore|playerScore|totalScore/i,
      maxScore: /MAX_SCORE|maxPoints|scoreLimit|highScore|maxScore/i,
      gameId: /gameId|levelId|stageId|gameType|modeId/i,
      moves: /moves|actions|steps|turns|commands/i,
      time: /time|duration|elapsed|timestamp/i,
      multiplier: /multiplier|bonus|combo|streak/i,
      validation: /valid|check|verify|isLegal|allowed/i
    };

    const parsed = {
      features: [],
      inputs: []
    };

    // Detect features
    for (const [feature, pattern] of Object.entries(patterns)) {
      if (pattern.test(userCode)) {
        parsed.features.push(feature);
        
        // Map features to inputs
        switch(feature) {
          case 'gameId':
            parsed.inputs.push('game_id');
            break;
          case 'scoreVariable':
            parsed.inputs.push('score');
            break;
          case 'moves':
            parsed.inputs.push('move_count');
            break;
          case 'time':
            parsed.inputs.push('play_time');
            break;
          case 'multiplier':
            parsed.inputs.push('multiplier');
            break;
        }
      }
    }

    // Ensure we always have at least score
    if (!parsed.inputs.includes('score')) {
      parsed.inputs.push('score');
    }

    return parsed;
  }

  generateProgram(parsedData) {
    const features = parsedData.features || [];
    const inputs = parsedData.inputs || ['score'];
    
    // Build program based on detected features
    let program = `#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    // Read inputs\n`;

    // Add input reads
    const inputReads = {
      'game_id': '    let game_id = sp1_zkvm::io::read::<u32>();',
      'score': '    let score = sp1_zkvm::io::read::<u32>();',
      'move_count': '    let move_count = sp1_zkvm::io::read::<u32>();',
      'play_time': '    let play_time = sp1_zkvm::io::read::<u64>();',
      'multiplier': '    let multiplier = sp1_zkvm::io::read::<u8>();'
    };

    for (const input of inputs) {
      if (inputReads[input]) {
        program += inputReads[input] + '\n';
      }
    }

    program += `
    // Verification logic\n`;

    // Generate verification based on features
    if (inputs.includes('game_id')) {
      program += this.generateGameIdValidation();
    } else {
      program += this.generateSimpleValidation();
    }

    // Add multi-factor validation if applicable
    if (inputs.length > 2) {
      program += this.generateMultiFactorValidation(inputs);
    }

    // Add commits
    program += `
    // Commit public values\n`;
    
    for (const input of inputs) {
      program += `    sp1_zkvm::io::commit(&${input});\n`;
    }
    
    program += `    sp1_zkvm::io::commit(&is_valid);\n}`;

    return program;
  }

  generateGameIdValidation() {
    return `    let is_valid = match game_id {
        1 => score <= 1_000_000,  // Classic mode: 1M max
        2 => score <= 500_000,    // Speed mode: 500K max
        3 => score <= 2_000_000,  // Expert mode: 2M max
        4 => score <= 100_000,    // Puzzle mode: 100K max
        _ => false
    };\n`;
  }

  generateSimpleValidation() {
    return `    let is_valid = score <= 1_000_000 && score > 0;\n`;
  }

  generateMultiFactorValidation(inputs) {
    let validation = `
    // Multi-factor validation
    let mut factors_valid = is_valid;\n`;

    if (inputs.includes('move_count')) {
      validation += `    factors_valid = factors_valid && move_count > 0 && move_count < 10_000;\n`;
    }

    if (inputs.includes('play_time')) {
      validation += `    factors_valid = factors_valid && play_time > 0 && play_time < 86_400;\n`;
    }

    if (inputs.includes('multiplier')) {
      validation += `    factors_valid = factors_valid && multiplier > 0 && multiplier <= 10;\n`;
    }

    validation += `    let is_valid = factors_valid;\n`;
    return validation;
  }
}

module.exports = GameScoreTemplate;