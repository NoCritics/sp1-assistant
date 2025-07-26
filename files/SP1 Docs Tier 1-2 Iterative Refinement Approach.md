PHASE 1: Initial Extraction (10,000 tokens)
SP1 Complete Reference
SP1 is a zero-knowledge virtual machine (zkVM) that proves correct execution of RISC-V programs. It enables developers to write provable programs in Rust without cryptography expertise.
Core Program Structure
Every SP1 program must include:
rust#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    // Program logic here
}
Dependencies
toml[dependencies]
sp1-zkvm = "4.0.0"
Input/Output Operations
Reading inputs:
rustlet n = sp1_zkvm::io::read::<u32>();
let data = sp1_zkvm::io::read::<MyStruct>();
let vec_data = sp1_zkvm::io::read_vec(); // For variable-length data
let slice_data = sp1_zkvm::io::read_slice(&mut buffer); // Zero-copy read
Committing outputs (public values):
rustsp1_zkvm::io::commit(&value); // Single value
sp1_zkvm::io::commit_slice(&array); // Array/slice
Complete Fibonacci Example
rust#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    let n = sp1_zkvm::io::read::<u32>();
    sp1_zkvm::io::commit(&n);
    
    let mut a = 0;
    let mut b = 1;
    for _ in 0..n {
        let c = a + b;
        a = b;
        b = c % 7919; // Prevent overflow
    }
    
    sp1_zkvm::io::commit(&a);
    sp1_zkvm::io::commit(&b);
}
Building Programs
bashcd program && cargo prove build
Or with Docker for reproducible builds:
bashcargo prove build --docker
ProverClient SDK
Setup:
rustuse sp1_sdk::{ProverClient, SP1Stdin, SP1ProofWithPublicValues};

const ELF: &[u8] = include_elf!("program-name");

let client = ProverClient::from_env(); // Reads SP1_PROVER env var
// OR
let client = ProverClient::builder().network().build(); // Explicit network
Creating inputs:
rustlet mut stdin = SP1Stdin::new();
stdin.write(&value);
stdin.write(&struct_data);
stdin.write_slice(&array);
stdin.write_vec(vec_data);
Executing (no proof):
rustlet (output, report) = client.execute(ELF, &stdin).run().unwrap();
println!("Cycles: {}", report.total_instruction_count());
Generating proofs:
rustlet (pk, vk) = client.setup(ELF);

// Core proof (default, not for onchain)
let proof = client.prove(&pk, &stdin).run().unwrap();

// Compressed proof (constant size, for recursion)
let proof = client.prove(&pk, &stdin).compressed().run().unwrap();

// Groth16 proof (for EVM verification, ~260 bytes)
let proof = client.prove(&pk, &stdin).groth16().run().unwrap();

// PLONK proof (for EVM verification, ~868 bytes)
let proof = client.prove(&pk, &stdin).plonk().run().unwrap();
Reading public values:
rustlet n = proof.public_values.read::<u32>();
let data = proof.public_values.read::<MyStruct>();
Verification:
rustclient.verify(&proof, &vk).expect("verification failed");
Network Proving
Environment setup:
bashexport SP1_PROVER=network
export NETWORK_PRIVATE_KEY=<your_key_without_0x>
export NETWORK_RPC_URL=https://rpc.production.succinct.xyz
Key generation:
bashcast wallet new  # Generates Secp256k1 keypair
Precompiles (Accelerated Operations)
Available through patched crates:
toml[patch.crates-io]
sha2 = { git = "https://github.com/sp1-patches/RustCrypto-hashes", tag = "patch-sha2-0.10.8-sp1-4.0.0" }
sha3 = { git = "https://github.com/sp1-patches/RustCrypto-hashes", tag = "patch-sha3-0.10.8-sp1-4.0.0" }
crypto-bigint = { git = "https://github.com/sp1-patches/RustCrypto-bigint", tag = "patch-0.5.5-sp1-4.0.0" }
tiny-keccak = { git = "https://github.com/sp1-patches/tiny-keccak", tag = "patch-2.0.2-sp1-4.0.0" }
k256 = { git = "https://github.com/sp1-patches/elliptic-curves", tag = "patch-k256-13.4-sp1-5.0.0" }
Proof Aggregation
Verify SP1 proofs inside SP1:
rustsp1_zkvm::lib::verify::verify_sp1_proof(vkey, public_values_digest);
Aggregation example:
rust// Generate first proof
let input_proof = client.prove(&input_pk, &stdin).compressed().run().unwrap();

// Aggregate it
let mut agg_stdin = SP1Stdin::new();
agg_stdin.write_proof(input_proof, input_vk);
let agg_proof = client.prove(&agg_pk, &agg_stdin).compressed().run().unwrap();
Onchain Verification
Solidity interface:
solidityinterface ISP1Verifier {
    function verifyProof(
        bytes32 programVKey,
        bytes calldata publicValues,
        bytes calldata proofBytes
    ) external view;
}
Contract example:
soliditycontract MyContract {
    address public verifier = 0x397A5f7f3dBd538f23DE225B51f532c34448dA9B; // Groth16 gateway
    bytes32 public programVKey;
    
    function verifyComputation(
        bytes calldata publicValues,
        bytes calldata proofBytes
    ) external view {
        ISP1Verifier(verifier).verifyProof(programVKey, publicValues, proofBytes);
        // Decode and use public values
    }
}
Build Script
rust// build.rs
fn main() {
    sp1_build::build_program("../program");
}
toml[build-dependencies]
sp1-build = "4.0.0"
Advanced I/O Patterns
Hints (private inputs):
rustlet hint_bytes = sp1_zkvm::io::hint_slice();
Variable-length outputs:
rustlet data = sp1_zkvm::io::read_vec();
sp1_zkvm::io::commit_slice(&results);
Cycle Tracking
rustprintln!("cycle-tracker-start: compute");
expensive_computation();
println!("cycle-tracker-end: compute");
Common Patterns
Game score verification:
rust#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    let game_id = sp1_zkvm::io::read::<u32>();
    let score = sp1_zkvm::io::read::<u32>();
    let moves = sp1_zkvm::io::read_vec::<Move>();
    
    let is_valid = verify_game_logic(game_id, score, &moves);
    
    sp1_zkvm::io::commit(&game_id);
    sp1_zkvm::io::commit(&score);
    sp1_zkvm::io::commit(&is_valid);
}
Document verification:
rustpub fn main() {
    let document_hash = sp1_zkvm::io::read::<[u8; 32]>();
    let timestamp = sp1_zkvm::io::read::<u64>();
    
    sp1_zkvm::io::commit(&document_hash);
    sp1_zkvm::io::commit(&timestamp);
    sp1_zkvm::io::commit(&true);
}
Critical Constraints

No std library - Use sp1_zkvm alternatives
No heap allocation in performance-critical sections
Fixed memory layout - No dynamic dispatch
Alignment requirements - 4-byte boundaries for all operations
No string operations - Use fixed-size arrays or hashes

Error Handling
rust// Programs can panic - this creates an invalid proof
assert!(condition, "Invalid input");

// Or return early
if !valid {
    sp1_zkvm::io::commit(&false);
    return;
}
System Calls (Advanced)
rustextern "C" {
    pub fn syscall_sha256_extend(w: *mut [u32; 64]);
    pub fn syscall_sha256_compress(w: *mut [u32; 64], state: *mut [u32; 8]);
    pub fn syscall_verify_sp1_proof(vk_digest: &[u32; 8], pv_digest: &[u8; 32]);
}

PHASE 2: Compression to 8,000 tokens
Analysis of Critical vs Helpful vs Redundant
CRITICAL (Must Keep):

Program structure (#![no_main], entrypoint!)
Basic I/O operations (read, commit)
ProverClient setup and basic usage
Proof types and when to use them
At least one complete example
Build commands
Environment variables for network proving

HELPFUL (Keep if space):

Multiple examples
Advanced I/O patterns
Precompile references
Detailed error messages
Build script setup
Cycle tracking

REDUNDANT (Remove):

Duplicate examples
Verbose descriptions
System call details
Implementation details
Multiple ways to do the same thing

SP1 Extended Reference (8,000 tokens)
SP1 is a zkVM that proves RISC-V program execution. Write programs in Rust, generate proofs without cryptography knowledge.
Program Structure
rust#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    // Your logic here
}
Cargo.toml:
toml[dependencies]
sp1-zkvm = "4.0.0"
I/O Operations
Reading:
rustlet n = sp1_zkvm::io::read::<u32>();
let vec = sp1_zkvm::io::read_vec(); // Variable length
sp1_zkvm::io::read_slice(&mut buffer); // Zero-copy
Committing (public outputs):
rustsp1_zkvm::io::commit(&value);
sp1_zkvm::io::commit_slice(&array);
Complete Example
rust#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    let n = sp1_zkvm::io::read::<u32>();
    sp1_zkvm::io::commit(&n);
    
    let mut a = 0u32;
    let mut b = 1u32;
    for _ in 0..n {
        let c = a + b;
        a = b;
        b = c % 7919;
    }
    
    sp1_zkvm::io::commit(&a);
    sp1_zkvm::io::commit(&b);
}
Building
bashcargo prove build
cargo prove build --docker  # Reproducible
ProverClient Usage
Setup:
rustuse sp1_sdk::{ProverClient, SP1Stdin};

const ELF: &[u8] = include_elf!("program");
let client = ProverClient::from_env();
Input:
rustlet mut stdin = SP1Stdin::new();
stdin.write(&value);
stdin.write_slice(&array);
Execute (no proof):
rustlet (output, report) = client.execute(ELF, &stdin).run().unwrap();
// Check cycles: report.total_instruction_count()
Generate Proofs:
rustlet (pk, vk) = client.setup(ELF);

// Core (default, not for onchain)
let proof = client.prove(&pk, &stdin).run().unwrap();

// Compressed (for recursion)
let proof = client.prove(&pk, &stdin).compressed().run().unwrap();

// Groth16 (EVM, ~260 bytes)
let proof = client.prove(&pk, &stdin).groth16().run().unwrap();

// PLONK (EVM, ~868 bytes)
let proof = client.prove(&pk, &stdin).plonk().run().unwrap();
Read outputs:
rustlet a = proof.public_values.read::<u32>();
Verify:
rustclient.verify(&proof, &vk).expect("failed");
Network Proving
bashexport SP1_PROVER=network
export NETWORK_PRIVATE_KEY=<key_without_0x>
export NETWORK_RPC_URL=https://rpc.production.succinct.xyz
Generate key: cast wallet new
Precompiles
Use patched crates for acceleration:
toml[patch.crates-io]
sha2 = { git = "https://github.com/sp1-patches/RustCrypto-hashes", tag = "patch-sha2-0.10.8-sp1-4.0.0" }
Onchain Verification
Interface:
solidityinterface ISP1Verifier {
    function verifyProof(
        bytes32 programVKey,
        bytes calldata publicValues,
        bytes calldata proofBytes
    ) external view;
}
Verifiers:

Groth16: 0x397A5f7f3dBd538f23DE225B51f532c34448dA9B
PLONK: 0x3B6041173B80E77f038f3F2C0f9744f04837185e

Common Patterns
Score Verification:
rustpub fn main() {
    let game_id = sp1_zkvm::io::read::<u32>();
    let score = sp1_zkvm::io::read::<u32>();
    let moves = sp1_zkvm::io::read_vec::<Move>();
    
    let valid = verify_moves(&moves, score);
    
    sp1_zkvm::io::commit(&game_id);
    sp1_zkvm::io::commit(&score);
    sp1_zkvm::io::commit(&valid);
}
Aggregation:
rust// In program:
sp1_zkvm::lib::verify::verify_sp1_proof(vkey, pv_digest);

// In script:
stdin.write_proof(input_proof, input_vk);
let agg_proof = client.prove(&pk, &stdin).compressed().run().unwrap();
Build Script
rust// build.rs
fn main() {
    sp1_build::build_program("../program");
}
Constraints

No std library
4-byte alignment required
No dynamic dispatch
Fixed memory layout

Quick Reference
Functions that exist:

sp1_zkvm::io::read::<T>()
sp1_zkvm::io::read_vec()
sp1_zkvm::io::read_slice(&mut buf)
sp1_zkvm::io::commit(&val)
sp1_zkvm::io::commit_slice(&arr)
sp1_zkvm::lib::verify::verify_sp1_proof(vk, pv)

Functions that DON'T exist:

sp1_zkvm::io::write() (use commit)
sp1_zkvm::io::print() (use println!)
sp1_zkvm::prove() (use ProverClient)
read_public_values() (use proof.public_values.read())


PHASE 3: Compression to 3,000 tokens
SP1 Essential Reference (3,000 tokens)
SP1 proves RISC-V program execution with zero-knowledge proofs.
Program Template
rust#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    // Read inputs
    let input = sp1_zkvm::io::read::<u32>();
    
    // Compute
    let result = input * 2;
    
    // Commit outputs (public)
    sp1_zkvm::io::commit(&result);
}
Cargo.toml:
toml[dependencies]
sp1-zkvm = "4.0.0"
I/O Functions
rust// Read inputs
let val = sp1_zkvm::io::read::<T>();
let vec = sp1_zkvm::io::read_vec();

// Write outputs (public)
sp1_zkvm::io::commit(&value);
sp1_zkvm::io::commit_slice(&array);
Build
bashcargo prove build
Generate Proofs
rustuse sp1_sdk::{ProverClient, SP1Stdin};

const ELF: &[u8] = include_elf!("program");

// Setup
let client = ProverClient::from_env();
let (pk, vk) = client.setup(ELF);

// Input
let mut stdin = SP1Stdin::new();
stdin.write(&input_value);

// Execute only
let (_, report) = client.execute(ELF, &stdin).run().unwrap();

// Generate proof
let proof = client.prove(&pk, &stdin).groth16().run().unwrap();

// Read outputs
let output = proof.public_values.read::<u32>();

// Verify
client.verify(&proof, &vk).unwrap();
Proof Types

.run() - Core (not for onchain)
.compressed() - For recursion
.groth16() - EVM verification (recommended)
.plonk() - EVM verification (alternative)

Network Proving
bashexport SP1_PROVER=network
export NETWORK_PRIVATE_KEY=<key_no_0x>
export NETWORK_RPC_URL=https://rpc.production.succinct.xyz
Example: Score Verification
rust#![no_main]
sp1_zkvm::entrypoint!(main);

struct Move { x: u32, y: u32 }

pub fn main() {
    let score = sp1_zkvm::io::read::<u32>();
    let moves = sp1_zkvm::io::read_vec::<Move>();
    
    let mut current_score = 0;
    for move in moves {
        current_score += move.x + move.y;
    }
    
    let valid = current_score == score;
    
    sp1_zkvm::io::commit(&score);
    sp1_zkvm::io::commit(&valid);
}
Onchain Verification
solidityISP1Verifier(0x397A5f7f3dBd538f23DE225B51f532c34448dA9B).verifyProof(
    programVKey,
    publicValues,
    proofBytes
);
Valid Functions
✅ EXISTS:

sp1_zkvm::io::read::<T>()
sp1_zkvm::io::read_vec()
sp1_zkvm::io::commit(&val)
sp1_zkvm::io::commit_slice(&arr)

❌ DON'T USE:

write() → use commit()
sp1_zkvm::prove() → use ProverClient
read_public_values() → use proof.public_values.read()

Rules

Always use #![no_main] and entrypoint!(main)
Read ALL inputs before ANY commits
Use network proving for production
Groth16 for EVM verification


PHASE 4: Validation
Essential (3k) Validation
✅ Can generate basic score verification? Yes - has complete example
✅ Can handle multi-input programs? Yes - shows read + read_vec
✅ Knows valid functions? Yes - explicit list of exists/doesn't exist
✅ Enough examples to prevent hallucination? Yes - template + score example
Extended (8k) Validation
✅ All of Essential +
✅ Can generate aggregation proofs? Yes - shows verify_sp1_proof
✅ Can use precompiles? Yes - patch examples
✅ Can do onchain verification? Yes - contract interface + addresses
✅ Build scripts? Yes - sp1_build example
Complete (14k) Validation
✅ All of Extended +
✅ Advanced I/O patterns? Yes - hints, variable outputs
✅ System calls? Yes - raw syscall signatures
✅ Error handling patterns? Yes - assert and early return
✅ Cycle tracking? Yes - println! patterns

PHASE 5: Final Output
Quick Test Examples
Essential (3k) can generate:
rust// ✅ Basic computation proof
let input = sp1_zkvm::io::read::<u32>();
let result = compute(input);
sp1_zkvm::io::commit(&result);
Extended (8k) can also generate:
rust// ✅ Aggregated proofs
sp1_zkvm::lib::verify::verify_sp1_proof(vk, pv);

// ✅ Optimized with precompiles
use sha2::Sha256; // Patched for acceleration
Complete (14k) can also generate:
rust// ✅ Custom syscalls
extern "C" {
    fn syscall_sha256_compress(...);
}

// ✅ Advanced patterns
println!("cycle-tracker-start: critical");
Each tier provides the minimum viable documentation for its target use case, preventing function hallucination while enabling valid SP1 program generation.