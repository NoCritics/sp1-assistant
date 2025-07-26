SP1 Pattern Reference
Core Patterns
Pattern: Basic Input→Process→Output
Structure:
rustlet input = sp1_zkvm::io::read::<T>();
let result = process(input);
sp1_zkvm::io::commit(&result);
Examples:

Fibonacci Example:

rust#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    let n = sp1_zkvm::io::read::<u32>();
    sp1_zkvm::io::commit(&n);
    
    let mut a = 0;
    let mut b = 1;
    for _ in 0..n {
        let mut c = a + b;
        c %= 7919; // Modulus to prevent overflow
        a = b;
        b = c;
    }
    
    sp1_zkvm::io::commit(&a);
    sp1_zkvm::io::commit(&b);
}

Simple Verification:

rust#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    let score = sp1_zkvm::io::read::<u32>();
    let is_valid = score <= MAX_SCORE;
    
    sp1_zkvm::io::commit(&score);
    sp1_zkvm::io::commit(&is_valid);
}

Multi-Input Pattern:

rustpub fn main() {
    let action_log = sp1_zkvm::io::read::<Vec<(u32,u32)>>();
    let claimed_move_count = sp1_zkvm::io::read::<u32>();
    
    sp1_zkvm::io::commit(&claimed_move_count);
    let result = Board::verify_replay(action_log, claimed_move_count);
    sp1_zkvm::io::commit(&result);
}
Variations:

Single input, single output
Multiple inputs, multiple outputs
Read vector data with read::<Vec<T>>()
Commit intermediate values for transparency

Performance Implications:

Each io::read and io::commit has overhead
Group related data into structs when possible
Consider committing only essential values

Pattern: Program Setup and Entry Point
Structure:
rust#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    // Program logic here
}
Examples:

Every SP1 Program Requires:

rust#![no_main]
sp1_zkvm::entrypoint!(main);

With Allocator Feature:

rust#![no_main]
sp1_zkvm::entrypoint!(main);
// When using embedded allocator in Cargo.toml:
// sp1-zkvm = { version = "...", features = ["embedded"] }

With Blake3 Hashing:

rust#![no_main]
sp1_zkvm::entrypoint!(main);
// When using Blake3 in Cargo.toml:
// sp1-zkvm = { version = "...", features = ["blake3"] }
Rules:

ALWAYS include #![no_main]
ALWAYS use sp1_zkvm::entrypoint!(main)
These wrap your main function with SP1 logic

Pattern: Proof Verification Inside zkVM
Structure:
rustsp1_zkvm::lib::verify::verify_sp1_proof(vkey, public_values_digest);
Examples:

Basic Verification:

rustsp1_zkvm::lib::verify::verify_sp1_proof(vkey, public_values_digest);

Groth16 Verification:

rustuse sp1_verifier::Groth16Verifier;

pub fn main() {
    let proof = sp1_zkvm::io::read_vec();
    let sp1_public_values = sp1_zkvm::io::read_vec();
    let sp1_vkey_hash: String = sp1_zkvm::io::read();
    
    let groth16_vk = *sp1_verifier::GROTH16_VK_BYTES;
    println!("cycle-tracker-start: verify");
    let result = Groth16Verifier::verify(&proof, &sp1_public_values, &sp1_vkey_hash, groth16_vk);
    println!("cycle-tracker-end: verify");
}
Requirements:

Must include verify feature in Cargo.toml:

tomlsp1-zkvm = { version = "...", features = ["verify"] }
Pattern: Cycle Tracking for Performance
Structure:
rustprintln!("cycle-tracker-start: <label>");
// Code to measure
println!("cycle-tracker-end: <label>");
Examples:

Simple Tracking:

rustprintln!("cycle-tracker-start: compute");
let sum: u64 = nums.iter().sum();
println!("cycle-tracker-end: compute");

Report Tracking (Aggregates):

rustfor i in 0..10 {
    println!("cycle-tracker-report-start: compute");
    expensive_computation(i);
    println!("cycle-tracker-report-end: compute");
}

Using Macro:

rust#[sp1_derive::cycle_tracker]
pub fn expensive_function(x: usize) -> usize {
    let mut y = 1;
    for _ in 0..100 {
        y *= x;
        y %= 7919;
    }
    y
}
Usage Notes:

Simple tracking logs to stdout
Report tracking accumulates across invocations
Macro requires sp1-derive dependency

Pattern: Zero-Copy I/O Optimization
Structure:
rust// Write
stdin.write_vec(&bytes);
// Read
let input = sp1_zkvm::io::read_vec();
Examples:

With rkyv Serialization:

rust// In script
use rkyv::rancor::Error;
let bytes = rkyv::to_bytes::<Error>(&my_struct);
stdin.write_slice(&bytes);

// In program
use rkyv::rancor::Error;
let input = sp1_zkvm::io::read_vec();
let deserialized_struct = rkyv::from_bytes::<MyStruct, Error>(&input).unwrap();

Raw Vector I/O:

rust// Avoid bincode overhead
stdin.write_vec(&data);
let data = sp1_zkvm::io::read_vec();
Performance Notes:

Avoids bincode serialization overhead
Best with zero-copy libraries like rkyv
Use for large data structures

Pattern: Client Setup and Proof Generation
Structure:
rustlet client = ProverClient::from_env();
let (pk, vk) = client.setup(ELF);
let proof = client.prove(&pk, &stdin).run().unwrap();
Examples:

Basic Proof Generation:

rustconst ELF: &[u8] = include_elf!("fibonacci-program");

let client = ProverClient::from_env();
let (pk, vk) = client.setup(ELF);
let proof = client.prove(&pk, &stdin).plonk().run().unwrap();

Network Proving:

rust// Set environment variables
// SP1_PROVER=network
// NETWORK_PRIVATE_KEY=<key>
let client = ProverClient::from_env();

Compressed Proof:

rustlet proof = client.prove(&pk, &stdin).compressed().run().unwrap();

Groth16 Proof:

rustlet proof = client.prove(&pk, &stdin).groth16().run().unwrap();
Proof Type Options:

.run() - Core/default proof
.compressed() - Constant size STARK
.groth16() - ~260 bytes, ~270k gas
.plonk() - ~868 bytes, ~300k gas

Pattern: Execution Without Proof
Structure:
rustlet (public_values, report) = client.execute(ELF, &stdin).run().unwrap();
Examples:

Development Testing:

rustlet (_, report) = client.execute(ELF, &stdin).run().unwrap();
println!("executed program with {} cycles", report.total_instruction_count());

With Public Values:

rustlet (mut public_values, execution_report) = client.execute(ELF, &stdin).run().unwrap();
println!(
    "Executed program with {} cycles",
    execution_report.total_instruction_count() + execution_report.total_syscall_count()
);
Use Cases:

Fast iteration during development
Verify correctness without proving cost
Check cycle counts and performance

Pattern: Proof Aggregation
Structure:
ruststdin.write_proof(input_proof, input_vk);
sp1_zkvm::lib::verify::verify_sp1_proof(vkey, public_values_digest);
Examples:

Aggregating Proofs:

rust// Generate first proof
let input_proof = client
    .prove(&input_pk, stdin)
    .compressed()
    .run()
    .expect("proving failed");

// Write proof for aggregation
let mut stdin = SP1Stdin::new();
stdin.write_proof(input_proof, input_vk);

// Generate aggregated proof
let aggregation_proof = client
    .prove(&aggregation_pk, stdin)
    .compressed()
    .run()
    .expect("proving failed");

Inside zkVM:

rustsp1_zkvm::lib::verify::verify_sp1_proof(vkey, public_values_digest);
// Proof automatically read from input stream
Requirements:

Must use compressed proofs
Include verify feature for verification

Pattern: Build Script Integration
Structure:
rustfn main() {
    sp1_build::build_program("../program");
}
Examples:

Basic Build Script:

rust// In build.rs
fn main() {
    sp1_build::build_program("../program");
}

Advanced Build Options:

rustuse sp1_build::{build_program_with_args, BuildArgs};

fn main() {
    let args = BuildArgs {
        docker: true,
        elf_name: "fibonacci-elf".to_string(),
        ..Default::default()
    };
    build_program_with_args("../program", &args);
}
Build Dependencies:
toml[build-dependencies]
sp1-build = "4.0.0"
Pattern: Precompile Usage via Syscalls
Structure:
rustextern "C" {
    pub fn syscall_<operation>(args...);
}
Examples:

SHA-256 Operations:

rustextern "C" {
    pub fn syscall_sha256_extend(w: *mut [u32; 64]);
    pub fn syscall_sha256_compress(w: *mut [u32; 64], state: *mut [u32; 8]);
}

Elliptic Curve Operations:

rustextern "C" {
    pub fn syscall_secp256k1_add(p: *mut [u32; 16], q: *const [u32; 16]);
    pub fn syscall_secp256k1_double(p: *mut [u32; 16]);
    pub fn syscall_secp256k1_decompress(point: &mut [u8; 64], is_odd: bool);
}

Keccak Permutation:

rustextern "C" {
    pub fn syscall_keccak_permute(state: *mut [u64; 25]);
}
Important Rules:

Use patched crates instead of direct syscalls
All pointers must be 4-byte aligned
Field elements must be canonical

Pattern: Public Values Reading
Structure:
rustlet value = proof.public_values.read::<T>();
Examples:

Sequential Reading:

rustlet _ = proof.public_values.read::<u32>();
let a = proof.public_values.read::<u32>();
let b = proof.public_values.read::<u32>();

Struct Reading:

rustlet public_values = proof.public_values.as_slice();
// Or decode as struct
let decoded: MyStruct = bincode::deserialize(&public_values).unwrap();
Order Rule:

Values are read in the EXACT order they were committed

Function Inventory
Core I/O Functions
rustsp1_zkvm::io::read::<T>() -> T
sp1_zkvm::io::read_vec() -> Vec<u8>
sp1_zkvm::io::read_slice(buf: &mut [u8])
sp1_zkvm::io::commit<T>(value: &T)
sp1_zkvm::io::commit_slice(slice: &[u8])
Verification Functions
rustsp1_zkvm::lib::verify::verify_sp1_proof(vkey: &[u32; 8], pv_digest: &[u8; 32])
Client Methods
rustProverClient::from_env() -> ProverClient
ProverClient::builder() -> ProverClientBuilder
ProverClient::setup(elf: &[u8]) -> (ProvingKey, VerifyingKey)
ProverClient::prove(pk: &ProvingKey, stdin: &SP1Stdin) -> ProofBuilder
ProverClient::execute(elf: &[u8], stdin: &SP1Stdin) -> ExecutionBuilder
ProverClient::verify(proof: &SP1ProofWithPublicValues, vk: &VerifyingKey) -> Result<()>
ProofBuilder Methods
rust.run() -> Result<SP1ProofWithPublicValues>
.compressed() -> Self
.groth16() -> Self
.plonk() -> Self
.deferred_proof_verification(bool) -> Self
SP1Stdin Methods
rustSP1Stdin::new() -> SP1Stdin
.write<T>(value: &T)
.write_vec(bytes: &[u8])
.write_slice(slice: &[u8])
.write_proof(proof: SP1ProofWithPublicValues, vk: VerifyingKey)
Syscall Functions (via extern "C")
rustsyscall_halt(exit_code: u8) -> !
syscall_write(fd: u32, write_buf: *const u8, nbytes: usize)
syscall_read(fd: u32, read_buf: *mut u8, nbytes: usize)
syscall_sha256_extend(w: *mut [u32; 64])
syscall_sha256_compress(w: *mut [u32; 64], state: *mut [u32; 8])
syscall_ed_add(p: *mut [u32; 16], q: *const [u32; 16])
syscall_ed_decompress(point: &mut [u8; 64])
syscall_secp256k1_add(p: *mut [u32; 16], q: *const [u32; 16])
syscall_secp256k1_double(p: *mut [u32; 16])
syscall_secp256k1_decompress(point: &mut [u8; 64], is_odd: bool)
syscall_secp256r1_add(p: *mut [u32; 16], q: *const [u32; 16])
syscall_secp256r1_double(p: *mut [u32; 16])
syscall_secp256r1_decompress(point: &mut [u8; 64], is_odd: bool)
syscall_bn254_add(p: *mut [u32; 16], q: *const [u32; 16])
syscall_bn254_double(p: *mut [u32; 16])
syscall_bls12381_add(p: *mut [u32; 24], q: *const [u32; 24])
syscall_bls12381_double(p: *mut [u32; 24])
syscall_bls12381_decompress(point: &mut [u8; 96], is_odd: bool)
syscall_keccak_permute(state: *mut [u64; 25])
syscall_uint256_mulmod(x: *mut [u32; 8], y: *const [u32; 8])
syscall_enter_unconstrained() -> bool
syscall_exit_unconstrained()
syscall_verify_sp1_proof(vk_digest: &[u32; 8], pv_digest: &[u8; 32])
syscall_hint_len() -> usize
syscall_hint_read(ptr: *mut u8, len: usize)
sys_alloc_aligned(bytes: usize, align: usize) -> *mut u8
sys_bigint(result: *mut [u32; 8], op: u32, x: *const [u32; 8], y: *const [u32; 8], modulus: *const [u32; 8])
Build Functions
rustsp1_build::build_program(path: &str)
sp1_build::build_program_with_args(path: &str, args: &BuildArgs)
Macros
rustinclude_elf!(path) // Include compiled ELF
sp1_zkvm::entrypoint!(main) // Define entry point
#[sp1_derive::cycle_tracker] // Track function cycles
Common Types
Core Types
rustSP1Stdin
SP1ProofWithPublicValues
ProverClient
ProvingKey (SP1ProvingKey)
VerifyingKey (SP1VerifyingKey)
ExecutionReport
ProofBuilder
ExecutionBuilder
BuildArgs
Public Values Types
rustSP1PublicValues
proof.public_values // Can read values sequentially
proof.bytes() // Get proof as bytes for verification
Anti-Patterns (Never Appear in Examples)
Never Do These

Never use direct ECALL:

rust// WRONG - Never do this
unsafe { ecall(...) }
// RIGHT - Use provided functions
sp1_zkvm::io::read::<T>()

Never omit entry point macros:

rust// WRONG - Missing required setup
pub fn main() { }

// RIGHT - Always include both
#![no_main]
sp1_zkvm::entrypoint!(main);

Never use "0x" prefix for private keys:

rust// WRONG
NETWORK_PRIVATE_KEY=0x1234...

// RIGHT
NETWORK_PRIVATE_KEY=1234...

Never access memory addresses 0x0-0x1F:

rust// WRONG - Reserved for registers
let ptr = 0x10 as *mut u32;

// RIGHT - Use heap allocator range
// 0x20 to 0x78000000

Never use unaligned memory access:

rust// WRONG - Unaligned access
let ptr = 0x21 as *mut u32; // Not 4-byte aligned

// RIGHT - Aligned access
let ptr = 0x20 as *mut u32; // 4-byte aligned

Never create ProverClient repeatedly:

rust// WRONG - Slow initialization
for i in 0..10 {
    let client = ProverClient::from_env();
}

// RIGHT - Reuse client
let client = ProverClient::from_env();
for i in 0..10 {
    // Use same client
}
Environment Variables
Required for Network Proving
bashSP1_PROVER=network
NETWORK_PRIVATE_KEY=<your_key_without_0x>
NETWORK_RPC_URL=https://rpc.production.succinct.xyz
Optional Variables
bashRUST_LOG=info  # Enable logging
SP1_PROVER=cpu # Local CPU proving (default)
SP1_PROVER=cuda # GPU proving
Cargo.toml Patterns
Basic SP1 Program
toml[package]
name = "program"
version = "0.1.0"
edition = "2021"

[dependencies]
sp1-zkvm = "4.0.0"
With Features
toml[dependencies]
sp1-zkvm = { version = "4.0.0", features = ["verify"] }
# Or with embedded allocator
sp1-zkvm = { version = "4.0.0", features = ["embedded"] }
# Or with Blake3
sp1-zkvm = { version = "4.0.0", features = ["blake3"] }
Script Dependencies
toml[dependencies]
sp1-sdk = "4.0.0"

[build-dependencies]
sp1-build = "4.0.0"
Patches for Precompiles
toml[patch.crates-io]
sha2 = { git = "https://github.com/sp1-patches/RustCrypto-hashes", tag = "patch-sha2-0.10.8-sp1-4.0.0" }
Performance Optimization Patterns
Pattern: Batch Operations
rust// Instead of multiple commits
sp1_zkvm::io::commit(&a);
sp1_zkvm::io::commit(&b);
sp1_zkvm::io::commit(&c);

// Consider struct
struct Output { a: u32, b: u32, c: u32 }
sp1_zkvm::io::commit(&output);
Pattern: Early Exit
rustfor (i, move) in moves.iter().enumerate() {
    if !state.is_valid_move(move) {
        return false; // Early exit on invalid
    }
    state.apply_move(move);
    
    // Checkpoint optimization
    if i % 10 == 0 && !state.is_consistent() {
        return false;
    }
}
Pattern: Precompile Usage
rust// Use patched crates in Cargo.toml
[patch.crates-io]
sha2 = { git = "https://github.com/sp1-patches/RustCrypto-hashes", tag = "patch-sha2-0.10.8-sp1-4.0.0" }

// Then use normally - precompiles used automatically
use sha2::{Sha256, Digest};
Critical Rules Extracted from Examples
Always Required

Every program needs:

#![no_main]
sp1_zkvm::entrypoint!(main);
pub fn main() { }


Memory alignment:

LW/SW: 4-byte aligned
LH/LHU/SH: 2-byte aligned
Syscall pointers: 4-byte aligned


Private key format:

NO "0x" prefix
64 hex characters


Proof types:

Compressed: For aggregation
Groth16/PLONK: For on-chain


Reserved memory:

0x0-0x1F: Registers (don't touch)
0x20-0x78000000: Heap (safe to use)



Performance Rules

ProverClient: Initialize once, reuse
Execution first: Test without proving
Cycle tracking: Use for optimization
Precompiles: Use patched crates
I/O optimization: Use read_vec/write_vec

Security Rules

Inputs must be canonical for field operations
Elliptic curve points must be valid
Programs must be non-malicious
No undefined behavior
Use official toolchain

This comprehensive pattern reference provides everything needed to generate valid SP1 programs without inventing functions or syntax. Every pattern shown comes directly from the documentation examples, ensuring accuracy and preventing hallucination of non-existent APIs.