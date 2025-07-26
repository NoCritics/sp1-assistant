const SP1Template = require('../baseTemplate');

class DocumentVerifyTemplate extends SP1Template {
  constructor() {
    super(
      'document-verify',
      'Verify document authenticity with zero-knowledge proofs'
    );
  }

  parseInput(userCode) {
    const patterns = {
      hash: /hash|digest|checksum|sha256|sha3|keccak/i,
      signature: /signature|sign|verify|authenticate/i,
      timestamp: /timestamp|time|date|created|modified/i,
      merkle: /merkle|tree|root|proof|branch/i,
      batch: /batch|multiple|array|list|documents/i,
      metadata: /metadata|properties|attributes|info/i
    };

    const parsed = {
      features: [],
      inputs: [],
      hashType: 'sha256' // default
    };

    // Detect features
    for (const [feature, pattern] of Object.entries(patterns)) {
      if (pattern.test(userCode)) {
        parsed.features.push(feature);
      }
    }

    // Detect hash type
    if (/sha3|keccak/i.test(userCode)) {
      parsed.hashType = 'keccak256';
    }

    // Map features to inputs
    if (parsed.features.includes('batch')) {
      parsed.inputs = ['doc_count', 'merkle_root'];
    } else if (parsed.features.includes('merkle')) {
      parsed.inputs = ['leaf', 'proof_path', 'root'];
    } else {
      parsed.inputs = ['document_hash', 'expected_hash'];
      if (parsed.features.includes('timestamp')) {
        parsed.inputs.push('timestamp');
      }
    }

    return parsed;
  }

  generateProgram(parsedData) {
    const features = parsedData.features || [];
    
    if (features.includes('batch')) {
      return this.generateBatchProgram(parsedData);
    } else if (features.includes('merkle')) {
      return this.generateMerkleProgram(parsedData);
    } else {
      return this.generateSingleDocProgram(parsedData);
    }
  }

  generateSingleDocProgram(parsedData) {
    const hasTimestamp = parsedData.inputs.includes('timestamp');
    
    return `#![no_main]
sp1_zkvm::entrypoint!(main);

${parsedData.hashType === 'keccak256' ? 'use tiny_keccak::{Hasher, Keccak};' : ''}

pub fn main() {
    // Read document hash and expected hash
    let document_hash = sp1_zkvm::io::read::<[u8; 32]>();
    let expected_hash = sp1_zkvm::io::read::<[u8; 32]>();
    ${hasTimestamp ? 'let timestamp = sp1_zkvm::io::read::<u64>();' : ''}
    
    // Verify document authenticity
    let hash_valid = document_hash == expected_hash;
    ${hasTimestamp ? `
    // Verify timestamp is reasonable (2024-2025 range)
    let time_valid = timestamp >= 1_704_067_200 && timestamp <= 1_767_225_600;
    let is_valid = hash_valid && time_valid;` : 'let is_valid = hash_valid;'}
    
    // Commit public values
    sp1_zkvm::io::commit(&document_hash);
    ${hasTimestamp ? 'sp1_zkvm::io::commit(&timestamp);' : ''}
    sp1_zkvm::io::commit(&is_valid);
}`;
  }

  generateBatchProgram(parsedData) {
    const useKeccak = parsedData.hashType === 'keccak256';
    
    return `#![no_main]
sp1_zkvm::entrypoint!(main);

${useKeccak ? 'use tiny_keccak::{Hasher, Keccak};' : 'use sha2::{Sha256, Digest};'}

pub fn main() {
    // Read batch parameters
    let doc_count = sp1_zkvm::io::read::<u32>();
    let expected_root = sp1_zkvm::io::read::<[u8; 32]>();
    
    // Initialize hasher
    ${useKeccak ? 
    'let mut hasher = Keccak::v256();' : 
    'let mut hasher = Sha256::new();'}
    let mut all_valid = true;
    
    // Process each document
    for i in 0..doc_count {
        let doc_hash = sp1_zkvm::io::read::<[u8; 32]>();
        let timestamp = sp1_zkvm::io::read::<u64>();
        
        // Verify timestamp
        if timestamp < 1_704_067_200 || timestamp > 1_767_225_600 {
            all_valid = false;
        }
        
        // Add to combined hash
        hasher.update(&doc_hash);
        hasher.update(&timestamp.to_le_bytes());
    }
    
    // Compute final root
    let mut computed_root = [0u8; 32];
    ${useKeccak ? 
    'hasher.finalize(&mut computed_root);' : 
    'computed_root = hasher.finalize().into();'}
    
    let is_valid = all_valid && computed_root == expected_root;
    
    // Commit public values
    sp1_zkvm::io::commit(&doc_count);
    sp1_zkvm::io::commit(&expected_root);
    sp1_zkvm::io::commit(&is_valid);
}`;
  }

  generateMerkleProgram(parsedData) {
    return `#![no_main]
sp1_zkvm::entrypoint!(main);

use sha2::{Sha256, Digest};

pub fn main() {
    // Read Merkle proof components
    let leaf = sp1_zkvm::io::read::<[u8; 32]>();
    let proof_path = sp1_zkvm::io::read::<Vec<[u8; 32]>>();
    let expected_root = sp1_zkvm::io::read::<[u8; 32]>();
    let leaf_index = sp1_zkvm::io::read::<u32>();
    
    // Verify Merkle proof
    let mut current_hash = leaf;
    let mut index = leaf_index;
    
    for sibling in proof_path.iter() {
        let mut hasher = Sha256::new();
        
        // Order based on index bit
        if index & 1 == 0 {
            hasher.update(&current_hash);
            hasher.update(sibling);
        } else {
            hasher.update(sibling);
            hasher.update(&current_hash);
        }
        
        current_hash = hasher.finalize().into();
        index >>= 1;
    }
    
    let is_valid = current_hash == expected_root;
    
    // Commit public values
    sp1_zkvm::io::commit(&leaf);
    sp1_zkvm::io::commit(&leaf_index);
    sp1_zkvm::io::commit(&is_valid);
}`;
  }
}

module.exports = DocumentVerifyTemplate;