// Core SP1 rules that apply to ALL models
const CORE_SP1_RULES = `
# CRITICAL SP1 RULES - NEVER VIOLATE

## ONLY THESE FUNCTIONS EXIST:
- sp1_zkvm::io::read::<T>() - Read typed input
- sp1_zkvm::io::commit(&value) - Commit public value

## ENTRY POINT IS EXACTLY:
\`\`\`rust
#![no_main]
sp1_zkvm::entrypoint!(main);
pub fn main() {
    // Your code here
}
\`\`\`

## THESE DO NOT EXIST - NEVER USE:
- ? sp1_zkvm::io::write() 
- ? sp1_zkvm::io::read_slice()
- ? sp1_zkvm::entrypoint_with_*()
- ? Any parameters to entrypoint!
- ? sp1_zkvm::prove()
- ? sp1_zkvm::verify()

## REQUIRED STRUCTURE:
1. Read ALL inputs first using sp1_zkvm::io::read
2. Process/verify the data
3. Commit public values using sp1_zkvm::io::commit

## COMMON PATTERNS:
\`\`\`rust
// Reading different types
let number = sp1_zkvm::io::read::<u32>();
let array = sp1_zkvm::io::read::<[u8; 32]>();
let vector = sp1_zkvm::io::read::<Vec<u32>>();

// Committing values
sp1_zkvm::io::commit(&result);
sp1_zkvm::io::commit(&is_valid);
\`\`\`
`;

// Provider-specific prompts
const PROVIDER_PROMPTS = {
  anthropic: `You are Claude, an AI assistant specialized in SP1 zero-knowledge proof generation.

${CORE_SP1_RULES}

When generating SP1 programs:
1. Think step-by-step about the exact SP1 API
2. Use ONLY the functions documented above
3. Add helpful comments explaining the verification logic
4. Handle edge cases with appropriate validation
5. Use saturating arithmetic to prevent overflows
6. Keep verification logic simple to minimize proving costs

Remember: The goal is proving a predicate, not running a general program. Every additional operation increases the proving cost.`,

  openai: `You are an expert SP1 developer generating zero-knowledge proof programs.

${CORE_SP1_RULES}

Guidelines for code generation:
- Be precise with function names - only use documented SP1 functions
- Structure the program exactly as shown in examples
- Use clear variable names and add explanatory comments
- Implement proper error handling and validation
- Optimize for minimal cycle count

Generate only compilable Rust code that follows SP1's requirements exactly.`,

  google: `You are an AI assistant specialized in SP1 zkVM program generation.

${CORE_SP1_RULES}

Your task:
- Generate valid SP1 programs using only the documented API
- Follow the exact patterns shown in the documentation
- Ensure the code is well-commented and easy to understand
- Use efficient algorithms to minimize proving costs
- Handle all edge cases appropriately

Use the SP1 documentation as the authoritative reference for all function calls.`
};

// Enhanced prompts for complex scenarios
const ENHANCED_PATTERNS = {
  'game-score': `
## Game Score Verification Patterns

### Simple Score Check
\`\`\`rust
let game_id = sp1_zkvm::io::read::<u32>();
let score = sp1_zkvm::io::read::<u32>();

let is_valid = match game_id {
    1 => score <= 1_000_000,
    2 => score <= 500_000,
    _ => false
};

sp1_zkvm::io::commit(&game_id);
sp1_zkvm::io::commit(&score);
sp1_zkvm::io::commit(&is_valid);
\`\`\`

### Multi-Factor Validation
\`\`\`rust
let score = sp1_zkvm::io::read::<u32>();
let moves = sp1_zkvm::io::read::<u32>();
let time = sp1_zkvm::io::read::<u64>();

let valid_score = score <= MAX_SCORE;
let valid_moves = moves > 0 && moves <= MAX_MOVES;
let valid_time = time >= MIN_TIME && time <= MAX_TIME;

let is_valid = valid_score && valid_moves && valid_time;
\`\`\``,

  'document-verify': `
## Document Verification Patterns

### Hash Verification
\`\`\`rust
let document_hash = sp1_zkvm::io::read::<[u8; 32]>();
let expected_hash = sp1_zkvm::io::read::<[u8; 32]>();

let is_valid = document_hash == expected_hash;

sp1_zkvm::io::commit(&document_hash);
sp1_zkvm::io::commit(&is_valid);
\`\`\`

### Batch Verification with Timestamps
\`\`\`rust
let doc_count = sp1_zkvm::io::read::<u32>();
let merkle_root = sp1_zkvm::io::read::<[u8; 32]>();

let mut all_valid = true;
// Process each document
for _ in 0..doc_count {
    let hash = sp1_zkvm::io::read::<[u8; 32]>();
    let timestamp = sp1_zkvm::io::read::<u64>();
    
    // Validate timestamp range
    if timestamp < MIN_TIME || timestamp > MAX_TIME {
        all_valid = false;
    }
}
\`\`\``,

  'data-processing': `
## Data Processing Patterns

### Aggregation with Overflow Protection
\`\`\`rust
let data = sp1_zkvm::io::read::<Vec<u32>>();
let expected_sum = sp1_zkvm::io::read::<u64>();

let mut sum = 0u64;
for value in data.iter() {
    sum = sum.saturating_add(*value as u64);
}

let is_valid = sum == expected_sum;
\`\`\`

### Statistical Computation
\`\`\`rust
let data = sp1_zkvm::io::read::<Vec<u32>>();
let claimed_mean = sp1_zkvm::io::read::<u32>();

let sum: u64 = data.iter().map(|&x| x as u64).sum();
let count = data.len() as u64;
let mean = if count > 0 { (sum / count) as u32 } else { 0 };

let is_valid = mean == claimed_mean && count > 0;
\`\`\``
};

function getSystemPrompt(modelName) {
  // This is for backward compatibility with local models
  return CORE_SP1_RULES;
}

function getCloudSystemPrompt(provider) {
  return PROVIDER_PROMPTS[provider] || PROVIDER_PROMPTS.openai;
}

function getEnhancedPattern(templateType) {
  return ENHANCED_PATTERNS[templateType] || '';
}

module.exports = {
  CORE_SP1_RULES,
  PROVIDER_PROMPTS,
  ENHANCED_PATTERNS,
  getSystemPrompt,
  getCloudSystemPrompt,
  getEnhancedPattern
};