SP1 Essential Reference for Code Generation
Core Program Structure
Every SP1 program MUST follow this exact structure:
rust#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    // Your program logic here
}
Critical Rules:

Always include #![no_main] at the top
Always use sp1_zkvm::entrypoint!(main); before your main function
Main function must be pub fn main() with no parameters
Never use std, only sp1_zkvm and sp1_lib

Input/Output Operations
Reading Inputs
rust// Read a single value
let n: u32 = sp1_zkvm::io::read();
let data: MyStruct = sp1_zkvm::io::read();

// Read a vector
let vec_data: Vec<u8> = sp1_zkvm::io::read_vec();

// Read raw bytes into a slice
let mut buffer = vec![0u8; 32];
sp1_zkvm::io::read_slice(&mut buffer);
Writing Outputs (Public Values)
rust// Commit single values (become public outputs)
sp1_zkvm::io::commit(&result);
sp1_zkvm::io::commit(&hash);

// Commit slices
sp1_zkvm::io::commit_slice(&data_array);
Dependencies
Your Cargo.toml must include:
toml[dependencies]
sp1-zkvm = "4.0.0"
For features like precompiles or verifying other proofs:
tomlsp1-zkvm = { version = "4.0.0", features = ["verify"] }
Basic Examples
Example 1: Simple Computation
rust#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    let a: u32 = sp1_zkvm::io::read();
    let b: u32 = sp1_zkvm::io::read();
    
    let sum = a + b;
    let product = a * b;
    
    sp1_zkvm::io::commit(&sum);
    sp1_zkvm::io::commit(&product);
}
Example 2: Array Processing
rust#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    let data: Vec<u32> = sp1_zkvm::io::read_vec();
    
    let sum: u32 = data.iter().sum();
    let max = data.iter().max().unwrap_or(&0);
    
    sp1_zkvm::io::commit(&sum);
    sp1_zkvm::io::commit(max);
}
Example 3: Hashing
rust#![no_main]
sp1_zkvm::entrypoint!(main);

use sha2::{Sha256, Digest};

pub fn main() {
    let input: Vec<u8> = sp1_zkvm::io::read_vec();
    
    let mut hasher = Sha256::new();
    hasher.update(&input);
    let hash = hasher.finalize();
    
    sp1_zkvm::io::commit_slice(&hash);
}
Patched Crates for Performance
Always use patched versions for cryptographic operations:
toml[dependencies]
sha2 = "0.10.8"

[patch.crates-io]
sha2 = { git = "https://github.com/sp1-patches/RustCrypto-hashes", tag = "patch-sha2-0.10.8-sp1-4.0.0" }

SP1 Extended Reference (Advanced)
Precompiles (Hardware Acceleration)
SP1 provides precompiles that dramatically reduce cycle counts for common operations. Always use these when available.
SHA-256 Precompile
Purpose: Accelerates SHA-256 hashing from ~50,000 cycles to ~300 cycles
Usage:
rustuse sha2::{Sha256, Digest};

// With patched crate - automatically uses precompile
let mut hasher = Sha256::new();
hasher.update(b"data");
let result = hasher.finalize();
Keccak-256 Precompile
Purpose: Accelerates Ethereum-compatible hashing
Usage:
rustuse tiny_keccak::{Hasher, Keccak};

// With patched crate
let mut hasher = Keccak::v256();
hasher.update(b"data");
let mut output = [0u8; 32];
hasher.finalize(&mut output);
secp256k1 Precompile
Purpose: Accelerates Bitcoin/Ethereum signature verification
Usage:
rustuse k256::ecdsa::{Signature, VerifyingKey};

// Patched crate automatically uses precompile
let signature = Signature::from_bytes(&sig_bytes)?;
let verify_key = VerifyingKey::from_sec1_bytes(&pubkey)?;
verify_key.verify(message_hash, &signature)?;
ed25519 Precompile
Purpose: Accelerates Ed25519 operations for chains like Solana
Direct syscall usage:
rustextern "C" {
    fn syscall_ed_add(p: *mut [u32; 16], q: *const [u32; 16]);
    fn syscall_ed_decompress(point: &mut [u8; 64]);
}
BN254 Precompile
Purpose: Accelerates pairing-friendly curve operations
Usage with patched crate:
rustuse substrate_bn::{Fr, G1, G2, pairing};

let g1_point = G1::one();
let g2_point = G2::one();
let result = pairing(g1_point, g2_point);
BLS12-381 Precompile
Purpose: Accelerates BLS signatures and zero-knowledge proofs
Usage:
rustuse bls12_381::{G1Projective, G2Projective, Scalar};

let g1 = G1Projective::generator();
let scalar = Scalar::from(42u64);
let result = g1 * scalar;
BigInt Operations Precompile
Purpose: Accelerates 256-bit modular arithmetic
Direct usage:
rustextern "C" {
    fn syscall_uint256_mulmod(x: *mut [u32; 8], y: *const [u32; 8]);
}
Performance Comparison Table
OperationWithout PrecompileWith PrecompileSpeedupSHA-256 (1KB)50,000 cycles300 cycles166xKeccak-25645,000 cycles250 cycles180xsecp256k1 verify1,000,000 cycles5,000 cycles200xBN254 pairing5,000,000 cycles10,000 cycles500x
Advanced Examples
Example 1: Merkle Proof Verification
rust#![no_main]
sp1_zkvm::entrypoint!(main);

use sha2::{Sha256, Digest};

pub fn verify_merkle_proof(
    leaf: &[u8; 32],
    proof: &[[u8; 32]],
    root: &[u8; 32],
    index: usize,
) -> bool {
    let mut current_hash = *leaf;
    let mut current_index = index;
    
    for sibling in proof {
        let mut hasher = Sha256::new();
        
        // Order based on index bit
        if current_index & 1 == 0 {
            hasher.update(&current_hash);
            hasher.update(sibling);
        } else {
            hasher.update(sibling);
            hasher.update(&current_hash);
        }
        
        current_hash = hasher.finalize().into();
        current_index >>= 1;
    }
    
    current_hash == *root
}

pub fn main() {
    // Read inputs
    let leaf: [u8; 32] = sp1_zkvm::io::read();
    let proof_len: usize = sp1_zkvm::io::read();
    let mut proof = Vec::with_capacity(proof_len);
    for _ in 0..proof_len {
        proof.push(sp1_zkvm::io::read::<[u8; 32]>());
    }
    let root: [u8; 32] = sp1_zkvm::io::read();
    let index: usize = sp1_zkvm::io::read();
    
    // Verify and commit result
    let is_valid = verify_merkle_proof(&leaf, &proof, &root, index);
    sp1_zkvm::io::commit(&is_valid);
}
Example 2: Batch Transaction Processing
rust#![no_main]
sp1_zkvm::entrypoint!(main);

use k256::ecdsa::{Signature, VerifyingKey, signature::Verifier};
use sha2::{Sha256, Digest};

#[derive(Debug)]
struct Transaction {
    from: [u8; 20],
    to: [u8; 20],
    amount: u64,
    nonce: u64,
}

pub fn main() {
    // Read batch size
    let batch_size: usize = sp1_zkvm::io::read();
    
    let mut valid_count = 0u32;
    let mut total_value = 0u64;
    let mut state_root = [0u8; 32];
    
    for i in 0..batch_size {
        // Read transaction
        let tx = Transaction {
            from: sp1_zkvm::io::read(),
            to: sp1_zkvm::io::read(),
            amount: sp1_zkvm::io::read(),
            nonce: sp1_zkvm::io::read(),
        };
        
        // Read signature
        let sig_bytes: [u8; 64] = sp1_zkvm::io::read();
        let pubkey_bytes: [u8; 33] = sp1_zkvm::io::read();
        
        // Compute transaction hash
        let mut hasher = Sha256::new();
        hasher.update(&tx.from);
        hasher.update(&tx.to);
        hasher.update(&tx.amount.to_le_bytes());
        hasher.update(&tx.nonce.to_le_bytes());
        let tx_hash = hasher.finalize();
        
        // Verify signature
        if let (Ok(sig), Ok(vk)) = (
            Signature::from_slice(&sig_bytes),
            VerifyingKey::from_sec1_bytes(&pubkey_bytes)
        ) {
            if vk.verify(&tx_hash, &sig).is_ok() {
                valid_count += 1;
                total_value += tx.amount;
                
                // Update state root
                let mut state_hasher = Sha256::new();
                state_hasher.update(&state_root);
                state_hasher.update(&tx_hash);
                state_root = state_hasher.finalize().into();
            }
        }
    }
    
    // Commit results
    sp1_zkvm::io::commit(&valid_count);
    sp1_zkvm::io::commit(&total_value);
    sp1_zkvm::io::commit_slice(&state_root);
}
Example 3: Recursive Proof Verification
rust#![no_main]
sp1_zkvm::entrypoint!(main);

use sp1_zkvm::lib::verify::verify_sp1_proof;

pub fn main() {
    // Read the verification key and public values digest
    let vkey_digest: [u32; 8] = sp1_zkvm::io::read();
    let public_values_digest: [u8; 32] = sp1_zkvm::io::read();
    
    // Verify the proof (proof is read automatically from stdin)
    verify_sp1_proof(&vkey_digest, &public_values_digest);
    
    // If verification succeeds, process the proven computation
    let proven_result: u64 = sp1_zkvm::io::read();
    let additional_input: u64 = sp1_zkvm::io::read();
    
    // Perform additional computation on verified result
    let final_result = proven_result * 2 + additional_input;
    
    sp1_zkvm::io::commit(&final_result);
    sp1_zkvm::io::commit(&true); // Verification succeeded
}
Example 4: Complex State Machine
rust#![no_main]
sp1_zkvm::entrypoint!(main);

use sha2::{Sha256, Digest};

#[derive(Clone)]
enum StateTransition {
    Initialize { value: u64 },
    Increment { amount: u64 },
    Transfer { to: [u8; 20], amount: u64 },
    Finalize,
}

struct State {
    value: u64,
    owner: [u8; 20],
    finalized: bool,
    history_hash: [u8; 32],
}

impl State {
    fn apply_transition(&mut self, transition: StateTransition) -> Result<(), &'static str> {
        if self.finalized {
            return Err("State is finalized");
        }
        
        match transition {
            StateTransition::Initialize { value } => {
                if self.value != 0 {
                    return Err("Already initialized");
                }
                self.value = value;
            }
            StateTransition::Increment { amount } => {
                self.value = self.value.saturating_add(amount);
            }
            StateTransition::Transfer { to, amount } => {
                if self.value < amount {
                    return Err("Insufficient balance");
                }
                self.value -= amount;
                self.owner = to;
            }
            StateTransition::Finalize => {
                self.finalized = true;
            }
        }
        
        // Update history hash
        let mut hasher = Sha256::new();
        hasher.update(&self.history_hash);
        hasher.update(&self.value.to_le_bytes());
        hasher.update(&self.owner);
        self.history_hash = hasher.finalize().into();
        
        Ok(())
    }
}

pub fn main() {
    // Initialize state
    let mut state = State {
        value: 0,
        owner: sp1_zkvm::io::read(),
        finalized: false,
        history_hash: [0u8; 32],
    };
    
    // Read and apply transitions
    let num_transitions: usize = sp1_zkvm::io::read();
    let mut errors = 0u32;
    
    for _ in 0..num_transitions {
        let transition_type: u8 = sp1_zkvm::io::read();
        
        let transition = match transition_type {
            0 => StateTransition::Initialize {
                value: sp1_zkvm::io::read(),
            },
            1 => StateTransition::Increment {
                amount: sp1_zkvm::io::read(),
            },
            2 => StateTransition::Transfer {
                to: sp1_zkvm::io::read(),
                amount: sp1_zkvm::io::read(),
            },
            3 => StateTransition::Finalize,
            _ => {
                errors += 1;
                continue;
            }
        };
        
        if state.apply_transition(transition).is_err() {
            errors += 1;
        }
    }
    
    // Commit final state
    sp1_zkvm::io::commit(&state.value);
    sp1_zkvm::io::commit_slice(&state.owner);
    sp1_zkvm::io::commit(&state.finalized);
    sp1_zkvm::io::commit_slice(&state.history_hash);
    sp1_zkvm::io::commit(&errors);
}
Example 5: Zero-Knowledge Set Membership
rust#![no_main]
sp1_zkvm::entrypoint!(main);

use sha2::{Sha256, Digest};

const TREE_DEPTH: usize = 20; // Supports up to 2^20 elements

pub fn compute_leaf_hash(value: &[u8]) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(b"leaf:");
    hasher.update(value);
    hasher.finalize().into()
}

pub fn hash_pair(left: &[u8; 32], right: &[u8; 32]) -> [u8; 32] {
    let mut hasher = Sha256::new();
    hasher.update(b"node:");
    hasher.update(left);
    hasher.update(right);
    hasher.finalize().into()
}

pub fn main() {
    // Private inputs
    let secret_value: Vec<u8> = sp1_zkvm::io::read_vec();
    let merkle_path: [[u8; 32]; TREE_DEPTH] = sp1_zkvm::io::read();
    let path_indices: u32 = sp1_zkvm::io::read(); // Bit vector
    
    // Public inputs
    let merkle_root: [u8; 32] = sp1_zkvm::io::read();
    
    // Compute leaf hash
    let mut current = compute_leaf_hash(&secret_value);
    
    // Traverse up the tree
    for (depth, sibling) in merkle_path.iter().enumerate() {
        let is_right = (path_indices >> depth) & 1;
        current = if is_right == 0 {
            hash_pair(&current, sibling)
        } else {
            hash_pair(sibling, &current)
        };
    }
    
    // Verify membership
    let is_member = current == merkle_root;
    
    // Commit only the membership result (not the secret!)
    sp1_zkvm::io::commit(&is_member);
    sp1_zkvm::io::commit_slice(&merkle_root);
}
Performance Optimization
Understanding Cycle Costs
OperationApproximate Cyclesu32 addition1-2u32 multiplication10-15Memory read/write3-5SHA-256 (no precompile)50,000SHA-256 (precompile)300Vec allocation100-500Function call10-20
Optimization Techniques

Use Precompiles Always

rust// BAD: Manual implementation
let mut hash = [0u8; 32];
for i in 0..data.len() {
    // Manual SHA implementation
}

// GOOD: Use precompile
use sha2::{Sha256, Digest};
let hash = Sha256::digest(&data);

Minimize Allocations

rust// BAD: Multiple allocations
let mut results = Vec::new();
for i in 0..n {
    results.push(compute(i));
}

// GOOD: Pre-allocate
let mut results = Vec::with_capacity(n);
for i in 0..n {
    results.push(compute(i));
}

Batch Operations

rust// BAD: Individual hashing
for item in items {
    let hash = Sha256::digest(&item);
    process(hash);
}

// GOOD: Batch hashing
let mut hasher = Sha256::new();
for item in items {
    hasher.update(&item);
}
let final_hash = hasher.finalize();

Avoid Unnecessary Copying

rust// BAD: Clone data
let data_copy = data.clone();
process(&data_copy);

// GOOD: Pass reference
process(&data);

Use Fixed-Size Arrays When Possible

rust// BAD: Dynamic vector for fixed size
let mut buffer: Vec<u8> = vec![0; 32];

// GOOD: Fixed array
let mut buffer = [0u8; 32];
Estimating Proof Costs
rust// Track cycles in development
println!("cycle-tracker-start: section");
expensive_operation();
println!("cycle-tracker-end: section");

// Estimate costs:
// Base proving cost: ~$0.02
// Additional cost per million cycles: ~$0.001
// Total cost ≈ $0.02 + (cycles / 1_000_000) * $0.001
Error Handling
Safe Patterns Without Panicking
rust// Pattern 1: Return Results
fn safe_divide(a: u32, b: u32) -> Result<u32, &'static str> {
    if b == 0 {
        Err("Division by zero")
    } else {
        Ok(a / b)
    }
}

// Pattern 2: Use Option for optional values
fn find_element(arr: &[u32], target: u32) -> Option<usize> {
    arr.iter().position(|&x| x == target)
}

// Pattern 3: Bounded arithmetic
fn safe_add(a: u32, b: u32) -> u32 {
    a.saturating_add(b) // Won't overflow
}

// Pattern 4: Validation before operations
pub fn main() {
    let index: usize = sp1_zkvm::io::read();
    let array: Vec<u32> = sp1_zkvm::io::read_vec();
    
    // Validate bounds
    let value = if index < array.len() {
        array[index]
    } else {
        0 // Default value
    };
    
    sp1_zkvm::io::commit(&value);
}
Input Validation
rustpub fn main() {
    let amount: u64 = sp1_zkvm::io::read();
    let recipient: [u8; 20] = sp1_zkvm::io::read();
    
    // Validate inputs
    let is_valid = amount > 0 && 
                   amount <= MAX_AMOUNT &&
                   recipient != [0u8; 20];
    
    if !is_valid {
        sp1_zkvm::io::commit(&false);
        return;
    }
    
    // Process valid inputs
    // ...
}
Solidity Integration
Structuring Outputs for On-Chain Verification
rust// Use ABI-compatible types
use alloy_sol_types::sol;

sol! {
    struct ProofOutput {
        address user;
        uint256 balance;
        bytes32 stateRoot;
        bool isValid;
    }
}

pub fn main() {
    let user: [u8; 20] = sp1_zkvm::io::read();
    let balance: u64 = sp1_zkvm::io::read();
    let state_root: [u8; 32] = compute_state_root();
    
    // Create Solidity-compatible output
    let output = ProofOutput {
        user: user.into(),
        balance: balance.into(),
        stateRoot: state_root.into(),
        isValid: true,
    };
    
    // Commit as ABI-encoded bytes
    sp1_zkvm::io::commit_slice(&output.abi_encode());
}
Verifying in Solidity
soliditycontract Verifier {
    function verify(
        bytes calldata proof,
        bytes calldata publicValues
    ) external view {
        // Decode public values
        ProofOutput memory output = abi.decode(
            publicValues, 
            (ProofOutput)
        );
        
        // Verify proof
        ISP1Verifier(verifier).verifyProof(
            programVKey,
            publicValues,
            proof
        );
        
        // Use verified output
        require(output.isValid, "Invalid proof");
        // Process output.user, output.balance, etc.
    }
}
Memory Patterns
Efficient Data Structures

Use Arrays for Fixed-Size Data

rust// GOOD: Fixed size known at compile time
let mut cache: [[u8; 32]; 100] = [[0; 32]; 100];

// AVOID: Dynamic allocation for fixed size
let mut cache: Vec<[u8; 32]> = vec![[0; 32]; 100];

Reuse Buffers

rustpub fn main() {
    let mut buffer = [0u8; 1024];
    let iterations: u32 = sp1_zkvm::io::read();
    
    for _ in 0..iterations {
        // Read into existing buffer
        sp1_zkvm::io::read_slice(&mut buffer);
        process_buffer(&buffer);
        // Buffer is reused, no new allocation
    }
}

Streaming Processing

rust// Process large data in chunks
pub fn hash_large_data() {
    let chunk_count: usize = sp1_zkvm::io::read();
    let mut hasher = Sha256::new();
    
    for _ in 0..chunk_count {
        let chunk: [u8; 1024] = sp1_zkvm::io::read();
        hasher.update(&chunk);
    }
    
    let final_hash = hasher.finalize();
    sp1_zkvm::io::commit_slice(&final_hash);
}

Avoid Intermediate Vectors

rust// BAD: Creating intermediate vector
let values: Vec<u32> = (0..100).map(|i| i * 2).collect();
let sum: u32 = values.iter().sum();

// GOOD: Direct computation
let sum: u32 = (0..100).map(|i| i * 2).sum();

Stack vs Heap Allocation

rust// Stack allocation (fast)
let mut small_data = [0u8; 256];

// Heap allocation (slower)
let mut large_data = vec![0u8; 10000];

// Prefer stack for small, fixed-size data
Memory Optimization Checklist

✓ Use fixed-size arrays when size is known
✓ Pre-allocate vectors with with_capacity
✓ Reuse buffers across iterations
✓ Process data in streams/chunks
✓ Avoid unnecessary cloning
✓ Use references instead of moving data
✓ Clear large vectors when done: vec.clear()
✓ Use mem::take to move without cloning

Advanced Patterns Summary

Always use patched crates for cryptographic operations
Precompiles reduce cycles by 100-500x - use them!
Batch operations when possible to amortize costs
Validate inputs early to avoid wasted computation
Structure outputs for easy Solidity decoding
Minimize allocations - reuse buffers and use fixed arrays
Track cycles during development to identify bottlenecks
Handle errors gracefully without panicking

Remember: The goal is to minimize cycles while maintaining correctness. Every optimization counts when generating proofs!