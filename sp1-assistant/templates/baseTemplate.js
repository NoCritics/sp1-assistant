class SP1Template {
  constructor(name, description) {
    this.name = name;
    this.description = description;
  }

  // Parse user input to extract verification logic
  parseInput(userCode) {
    throw new Error('parseInput must be implemented by subclass');
  }

  // Generate SP1 program
  generateProgram(parsedData) {
    throw new Error('generateProgram must be implemented by subclass');
  }

  // Generate supporting scripts (prove.js, verify.js)
  generateScripts(parsedData) {
    return {
      proveScript: this.generateProveScript(parsedData),
      verifyScript: this.generateVerifyScript(parsedData),
      envExample: this.generateEnvExample(),
      testScript: this.generateTestScript(parsedData)
    };
  }

  generateProveScript(data) {
    const inputs = data.inputs || ['value'];
    
    return `const { ProverClient, SP1Stdin } = require('@sp1/sdk');
const fs = require('fs');

// Load the compiled program
const ELF = fs.readFileSync('../program/target/sp1-program.elf');

async function generateProof(${inputs.join(', ')}) {
  // Initialize prover client from environment
  const client = ProverClient.fromEnv();
  
  // Create input stream
  const stdin = new SP1Stdin();
  
  // Write all inputs in order
${inputs.map(input => `  stdin.write(${input});`).join('\n')}
  
  // Show progress
  console.log('?? Starting proof generation...');
  console.log('? This will take 30-90 seconds on the network');
  
  const startTime = Date.now();
  
  try {
    // Generate proof (compressed for web compatibility)
    const proof = await client.prove(ELF, stdin)
      .compressed()
      .run();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(\`? Proof generated in \${duration} seconds!\`);
    
    // Extract public values
    const publicValues = proof.publicValues;
    console.log('?? Public values:', publicValues);
    
    // Save proof to file
    const proofPath = \`./proof-\${Date.now()}.json\`;
    fs.writeFileSync(proofPath, JSON.stringify({
      proof: proof.bytes(),
      publicValues: publicValues.bytes(),
      timestamp: new Date().toISOString()
    }));
    
    console.log(\`?? Proof saved to: \${proofPath}\`);
    return proof;
    
  } catch (error) {
    console.error('? Proof generation failed:', error.message);
    throw error;
  }
}

// Example usage
async function main() {
  // Example values - replace with your actual data
${this.generateExampleValues(inputs)}
  
  try {
    const proof = await generateProof(${inputs.join(', ')});
    console.log('?? Success! Proof generated and saved.');
  } catch (error) {
    console.error('Failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateProof };`;
  }

  generateVerifyScript(data) {
    return `const { ProverClient } = require('@sp1/sdk');
const fs = require('fs');

async function verifyProof(proofPath) {
  // Load proof from file
  const proofData = JSON.parse(fs.readFileSync(proofPath, 'utf8'));
  
  // Initialize client
  const client = ProverClient.fromEnv();
  
  console.log('?? Verifying proof...');
  
  try {
    // Create proof object from bytes
    const proof = {
      bytes: () => Buffer.from(proofData.proof, 'hex'),
      publicValues: {
        bytes: () => Buffer.from(proofData.publicValues, 'hex')
      }
    };
    
    // Verify the proof
    const isValid = await client.verify(proof);
    
    if (isValid) {
      console.log('? Proof is VALID!');
      console.log('?? Public values:', proofData.publicValues);
    } else {
      console.log('? Proof is INVALID!');
    }
    
    return isValid;
    
  } catch (error) {
    console.error('? Verification failed:', error.message);
    return false;
  }
}

// Example usage
async function main() {
  const proofFile = process.argv[2];
  
  if (!proofFile) {
    console.error('Usage: node verify.js <proof.json>');
    process.exit(1);
  }
  
  const isValid = await verifyProof(proofFile);
  process.exit(isValid ? 0 : 1);
}

if (require.main === module) {
  main();
}

module.exports = { verifyProof };`;
  }

  generateTestScript(data) {
    const inputs = data.inputs || ['value'];
    
    return `const { ProverClient, SP1Stdin } = require('@sp1/sdk');
const fs = require('fs');

// Load the compiled program
const ELF = fs.readFileSync('../program/target/sp1-program.elf');

async function testExecution(${inputs.join(', ')}) {
  const client = ProverClient.fromEnv();
  const stdin = new SP1Stdin();
  
  // Write inputs
${inputs.map(input => `  stdin.write(${input});`).join('\n')}
  
  console.log('?? Testing program execution (no proof)...');
  
  try {
    // Execute without proving (fast)
    const { publicValues, cycles } = await client.execute(ELF, stdin);
    
    console.log('? Execution successful!');
    console.log(\`? Cycles used: \${cycles.toLocaleString()}\`);
    console.log(\`?? Estimated cost: $\${(cycles * 0.000001).toFixed(4)}\`);
    console.log('?? Public values:', publicValues);
    
    return { publicValues, cycles };
    
  } catch (error) {
    console.error('? Execution failed:', error.message);
    throw error;
  }
}

// Test cases
async function runTests() {
  console.log('Running SP1 program tests...\\n');
  
  const testCases = [
${this.generateTestCases(inputs)}
  ];
  
  for (const [index, testCase] of testCases.entries()) {
    console.log(\`Test Case #\${index + 1}: \${testCase.name}\`);
    console.log('Inputs:', testCase.inputs);
    
    try {
      const result = await testExecution(...testCase.inputs);
      console.log('? PASSED\\n');
    } catch (error) {
      console.log('? FAILED:', error.message, '\\n');
    }
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { testExecution };`;
  }

  generateEnvExample() {
    return `# SP1 Configuration - CRITICAL: No "0x" prefix on private key!
NETWORK_PRIVATE_KEY=your_private_key_here_without_0x_prefix
SP1_PROVER=network
NETWORK_RPC_URL=https://rpc.production.succinct.xyz

# Optional: For development
RUST_LOG=info

# Example private key (DO NOT USE IN PRODUCTION):
# NETWORK_PRIVATE_KEY=r5bhu8y06065fh89gwerg4813gbb27134bk724g45h5a0pp985381211b366f0f2b

# Common errors:
# - "Invalid hex character" ? Remove "0x" from private key
# - "Out of memory" ? You're using local proving, switch to network
# - "Connection refused" ? Check NETWORK_RPC_URL is correct`;
  }

  generateExampleValues(inputs) {
    const examples = {
      'game_id': '  const game_id = 1; // Game mode ID',
      'score': '  const score = 50000; // Player score',
      'move_count': '  const move_count = 150; // Number of moves',
      'play_time': '  const play_time = 3600; // Play time in seconds',
      'multiplier': '  const multiplier = 2; // Score multiplier',
      'document_hash': '  const document_hash = new Uint8Array(32).fill(0); // 32-byte hash',
      'expected_hash': '  const expected_hash = new Uint8Array(32).fill(0); // Expected hash',
      'timestamp': '  const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp',
      'data': '  const data = [10, 20, 30, 40, 50]; // Data array',
      'expected_result': '  const expected_result = 150; // Expected computation result',
      'threshold': '  const threshold = 25; // Filter threshold',
      'doc_count': '  const doc_count = 3; // Number of documents',
      'merkle_root': '  const merkle_root = new Uint8Array(32).fill(0); // Merkle root'
    };
    
    return inputs.map(input => examples[input] || `  const ${input} = 0; // TODO: Set value`).join('\n');
  }

  generateTestCases(inputs) {
    // Generate appropriate test cases based on template type
    if (this.name === 'game-score') {
      return `    { name: 'Valid score', inputs: [1, 50000] },
    { name: 'Maximum score', inputs: [1, 1000000] },
    { name: 'Invalid score', inputs: [1, 1000001] },
    { name: 'Different game mode', inputs: [2, 300000] }`;
    } else if (this.name === 'document-verify') {
      return `    { name: 'Valid document', inputs: [new Uint8Array(32).fill(1), new Uint8Array(32).fill(1)] },
    { name: 'Invalid document', inputs: [new Uint8Array(32).fill(1), new Uint8Array(32).fill(2)] },
    { name: 'With timestamp', inputs: [new Uint8Array(32).fill(1), new Uint8Array(32).fill(1), Date.now()/1000] }`;
    } else {
      return `    { name: 'Test case 1', inputs: [${inputs.map(() => '0').join(', ')}] },
    { name: 'Test case 2', inputs: [${inputs.map(() => '1').join(', ')}] }`;
    }
  }
}

module.exports = SP1Template;