SP1 Reference Documentation - Tiered System
Tier 1: Essential SP1 (3k tokens) - Programs 1-5
Core Program Structure
Every SP1 program MUST have this exact structure:
rust#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    // Your program logic here
}
Reading Inputs
rust// Read single value
let value = sp1_zkvm::io::read::<u32>();

// Read vector/array
let data = sp1_zkvm::io::read::<Vec<u32>>();

// Read custom struct (must derive Clone)
#[derive(Clone)]
struct Input {
    user_id: u32,
    score: u32,
}
let input = sp1_zkvm::io::read::<Input>();
Committing Outputs (Public Values)
rust// Commit single value
sp1_zkvm::io::commit(&result);

// Commit multiple values (order matters!)
sp1_zkvm::io::commit(&is_valid);
sp1_zkvm::io::commit(&score);
Example 1: Score Verification
rust#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    let score = sp1_zkvm::io::read::<u32>();
    let max_score = sp1_zkvm::io::read::<u32>();
    
    let is_valid = score <= max_score;
    
    sp1_zkvm::io::commit(&score);
    sp1_zkvm::io::commit(&is_valid);
}
Example 2: Multi-Factor Validation
rust#![no_main]
sp1_zkvm::entrypoint!(main);

#[derive(Clone)]
struct AuthRequest {
    user_id: u32,
    action: u32,
    timestamp: u64,
}

pub fn main() {
    let request = sp1_zkvm::io::read::<AuthRequest>();
    let current_time = sp1_zkvm::io::read::<u64>();
    
    let time_valid = request.timestamp <= current_time && 
                     current_time - request.timestamp < 3600;
    let user_valid = request.user_id > 0 && request.user_id < 10000;
    let action_valid = request.action == 1 || request.action == 2;
    
    let is_valid = time_valid && user_valid && action_valid;
    
    sp1_zkvm::io::commit(&request.user_id);
    sp1_zkvm::io::commit(&is_valid);
}
Example 3: Array Sum Verification
rust#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    let numbers = sp1_zkvm::io::read::<Vec<u32>>();
    let expected_sum = sp1_zkvm::io::read::<u32>();
    
    let mut sum = 0u32;
    for num in &numbers {
        sum = sum.wrapping_add(*num);
    }
    
    let is_valid = sum == expected_sum;
    
    sp1_zkvm::io::commit(&sum);
    sp1_zkvm::io::commit(&is_valid);
}
SHA256 Hashing
rustuse sp1_zkvm::syscalls::{syscall_sha256_extend, syscall_sha256_compress};

// Hash bytes using SHA256
fn sha256_hash(data: &[u8]) -> [u8; 32] {
    let mut state = [
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
        0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
    ];
    
    let mut buffer = [0u8; 64];
    let mut w = [0u32; 64];
    
    // Process complete blocks
    for chunk in data.chunks(64) {
        if chunk.len() == 64 {
            buffer.copy_from_slice(chunk);
            for i in 0..16 {
                w[i] = u32::from_be_bytes([
                    buffer[i*4], buffer[i*4+1], 
                    buffer[i*4+2], buffer[i*4+3]
                ]);
            }
            unsafe {
                syscall_sha256_extend(&mut w);
                syscall_sha256_compress(&mut w, &mut state);
            }
        }
    }
    
    // Handle final block with padding
    let remaining = data.len() % 64;
    buffer[..remaining].copy_from_slice(&data[data.len() - remaining..]);
    buffer[remaining] = 0x80;
    buffer[remaining+1..].fill(0);
    
    if remaining >= 56 {
        // Need two blocks
        for i in 0..16 {
            w[i] = u32::from_be_bytes([
                buffer[i*4], buffer[i*4+1],
                buffer[i*4+2], buffer[i*4+3]
            ]);
        }
        unsafe {
            syscall_sha256_extend(&mut w);
            syscall_sha256_compress(&mut w, &mut state);
        }
        buffer.fill(0);
    }
    
    // Length in bits as big-endian
    let bit_len = (data.len() as u64) * 8;
    buffer[56..64].copy_from_slice(&bit_len.to_be_bytes());
    
    for i in 0..16 {
        w[i] = u32::from_be_bytes([
            buffer[i*4], buffer[i*4+1],
            buffer[i*4+2], buffer[i*4+3]
        ]);
    }
    unsafe {
        syscall_sha256_extend(&mut w);
        syscall_sha256_compress(&mut w, &mut state);
    }
    
    // Convert state to bytes
    let mut result = [0u8; 32];
    for i in 0..8 {
        result[i*4..i*4+4].copy_from_slice(&state[i].to_be_bytes());
    }
    result
}
Example 4: Document Hash Verification
rust#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    let document = sp1_zkvm::io::read::<Vec<u8>>();
    let expected_hash = sp1_zkvm::io::read::<[u8; 32]>();
    
    let computed_hash = sha256_hash(&document);
    let is_valid = computed_hash == expected_hash;
    
    sp1_zkvm::io::commit(&computed_hash);
    sp1_zkvm::io::commit(&is_valid);
}
Critical Rules

No println! in production - Use only for debugging
Fixed-size types preferred - Use [u8; 32] over Vec<u8> when possible
Wrapping arithmetic - Use wrapping_add, wrapping_mul to prevent overflow
Order matters - Commits must match the exact order expected by verifier


Tier 2: Advanced SP1 (8k tokens) - Programs 1-9
Includes everything from Tier 1 plus:
Merkle Tree Verification
rust#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn verify_merkle_proof(
    leaf: [u8; 32],
    proof: &[[u8; 32]],
    path: u32,
    root: [u8; 32]
) -> bool {
    let mut current = leaf;
    
    for (i, sibling) in proof.iter().enumerate() {
        let mut combined = [0u8; 64];
        
        if (path >> i) & 1 == 0 {
            combined[..32].copy_from_slice(&current);
            combined[32..].copy_from_slice(sibling);
        } else {
            combined[..32].copy_from_slice(sibling);
            combined[32..].copy_from_slice(&current);
        }
        
        current = sha256_hash(&combined);
    }
    
    current == root
}

pub fn main() {
    let leaf_data = sp1_zkvm::io::read::<Vec<u8>>();
    let proof = sp1_zkvm::io::read::<Vec<[u8; 32]>>();
    let path = sp1_zkvm::io::read::<u32>();
    let root = sp1_zkvm::io::read::<[u8; 32]>();
    
    let leaf_hash = sha256_hash(&leaf_data);
    let is_valid = verify_merkle_proof(leaf_hash, &proof, path, root);
    
    sp1_zkvm::io::commit(&leaf_hash);
    sp1_zkvm::io::commit(&is_valid);
}
Batch Processing Pattern
rust#![no_main]
sp1_zkvm::entrypoint!(main);

const BATCH_SIZE: usize = 100;

pub fn main() {
    let items = sp1_zkvm::io::read::<Vec<u32>>();
    let threshold = sp1_zkvm::io::read::<u32>();
    
    let mut sum = 0u64;
    let mut count = 0u32;
    let mut max_value = 0u32;
    
    // Process in batches for memory efficiency
    for chunk in items.chunks(BATCH_SIZE) {
        for &item in chunk {
            if item > threshold {
                sum += item as u64;
                count += 1;
                max_value = max_value.max(item);
            }
        }
    }
    
    let average = if count > 0 { sum / count as u64 } else { 0 };
    
    sp1_zkvm::io::commit(&count);
    sp1_zkvm::io::commit(&average);
    sp1_zkvm::io::commit(&max_value);
}
State Machine Verification
rust#![no_main]
sp1_zkvm::entrypoint!(main);

#[derive(Clone, Copy, PartialEq)]
enum State {
    Init = 0,
    Active = 1,
    Paused = 2,
    Complete = 3,
}

#[derive(Clone)]
struct Transition {
    from: u8,
    to: u8,
    condition: u32,
}

pub fn main() {
    let transitions = sp1_zkvm::io::read::<Vec<Transition>>();
    let initial_state = sp1_zkvm::io::read::<u8>();
    let expected_final = sp1_zkvm::io::read::<u8>();
    
    let mut current = State::Init;
    
    // Validate initial state
    if initial_state != current as u8 {
        sp1_zkvm::io::commit(&false);
        return;
    }
    
    for transition in &transitions {
        // Validate transition is allowed
        let valid = match (current, transition.to) {
            (State::Init, 1) => transition.condition > 0,
            (State::Active, 2) => true,
            (State::Active, 3) => transition.condition >= 100,
            (State::Paused, 1) => true,
            _ => false,
        };
        
        if !valid || transition.from != current as u8 {
            sp1_zkvm::io::commit(&false);
            return;
        }
        
        current = match transition.to {
            1 => State::Active,
            2 => State::Paused,
            3 => State::Complete,
            _ => {
                sp1_zkvm::io::commit(&false);
                return;
            }
        };
    }
    
    let is_valid = current as u8 == expected_final;
    sp1_zkvm::io::commit(&is_valid);
}
Elliptic Curve Precompiles (Secp256k1)
rustuse sp1_zkvm::syscalls::{syscall_secp256k1_add, syscall_secp256k1_decompress};

// Decompress a public key
fn decompress_pubkey(compressed: &[u8; 33]) -> Option<[u8; 64]> {
    let mut point = [0u8; 64];
    point[..32].copy_from_slice(&compressed[1..]);
    
    let is_odd = compressed[0] == 0x03;
    unsafe {
        syscall_secp256k1_decompress(&mut point, is_odd);
    }
    
    Some(point)
}

// Add two points
fn add_points(p1: &[u8; 64], p2: &[u8; 64]) -> [u8; 64] {
    let mut p1_words = [0u32; 16];
    let mut p2_words = [0u32; 16];
    
    for i in 0..16 {
        p1_words[i] = u32::from_le_bytes([
            p1[i*4], p1[i*4+1], p1[i*4+2], p1[i*4+3]
        ]);
        p2_words[i] = u32::from_le_bytes([
            p2[i*4], p2[i*4+1], p2[i*4+2], p2[i*4+3]
        ]);
    }
    
    unsafe {
        syscall_secp256k1_add(&mut p1_words, &p2_words);
    }
    
    let mut result = [0u8; 64];
    for i in 0..16 {
        result[i*4..i*4+4].copy_from_slice(&p1_words[i].to_le_bytes());
    }
    result
}
Data Filtering Example
rust#![no_main]
sp1_zkvm::entrypoint!(main);

#[derive(Clone)]
struct Record {
    id: u32,
    value: u64,
    category: u8,
}

pub fn main() {
    let records = sp1_zkvm::io::read::<Vec<Record>>();
    let target_category = sp1_zkvm::io::read::<u8>();
    let min_value = sp1_zkvm::io::read::<u64>();
    
    let mut matching_count = 0u32;
    let mut total_value = 0u64;
    let mut max_id = 0u32;
    
    for record in &records {
        if record.category == target_category && record.value >= min_value {
            matching_count += 1;
            total_value = total_value.wrapping_add(record.value);
            max_id = max_id.max(record.id);
        }
    }
    
    sp1_zkvm::io::commit(&matching_count);
    sp1_zkvm::io::commit(&total_value);
    sp1_zkvm::io::commit(&max_id);
}
Memory-Efficient Patterns
rust// Process large datasets without loading all into memory
pub fn process_streaming() {
    let chunk_size = sp1_zkvm::io::read::<usize>();
    let total_chunks = sp1_zkvm::io::read::<u32>();
    
    let mut global_sum = 0u64;
    
    for _ in 0..total_chunks {
        let chunk = sp1_zkvm::io::read::<Vec<u32>>();
        for value in chunk {
            global_sum = global_sum.wrapping_add(value as u64);
        }
    }
    
    sp1_zkvm::io::commit(&global_sum);
}
Advanced Rules

Precompile alignment - All precompile inputs must be 4-byte aligned
Canonical field elements - Field arithmetic inputs must be in canonical form
Batch for efficiency - Process in chunks to avoid memory issues
State validation - Always validate state transitions explicitly


Tier 3: Complete SP1 (14k tokens) - All Programs + Variations
Includes everything from Tiers 1 & 2 plus:
Complex Game Move Verification
rust#![no_main]
sp1_zkvm::entrypoint!(main);

#[derive(Clone, Copy, PartialEq)]
enum Piece {
    Empty = 0,
    Pawn = 1,
    Knight = 2,
    Bishop = 3,
    Rook = 4,
    Queen = 5,
    King = 6,
}

#[derive(Clone)]
struct Board {
    cells: [[u8; 8]; 8],  // 8x8 board
    white_to_move: bool,
}

#[derive(Clone)]
struct Move {
    from_x: u8,
    from_y: u8,
    to_x: u8,
    to_y: u8,
}

impl Board {
    fn get_piece(&self, x: u8, y: u8) -> Piece {
        match self.cells[y as usize][x as usize] & 0x07 {
            1 => Piece::Pawn,
            2 => Piece::Knight,
            3 => Piece::Bishop,
            4 => Piece::Rook,
            5 => Piece::Queen,
            6 => Piece::King,
            _ => Piece::Empty,
        }
    }
    
    fn is_white(&self, x: u8, y: u8) -> bool {
        (self.cells[y as usize][x as usize] & 0x80) != 0
    }
    
    fn validate_pawn_move(&self, m: &Move) -> bool {
        let is_white = self.is_white(m.from_x, m.from_y);
        let direction = if is_white { -1i8 } else { 1i8 };
        let start_row = if is_white { 6 } else { 1 };
        
        let dy = (m.to_y as i8) - (m.from_y as i8);
        let dx = (m.to_x as i8).abs_diff(m.from_x as i8);
        
        // Forward move
        if dx == 0 {
            if dy == direction && self.get_piece(m.to_x, m.to_y) == Piece::Empty {
                return true;
            }
            if m.from_y == start_row && dy == 2 * direction && 
               self.get_piece(m.to_x, m.to_y) == Piece::Empty &&
               self.get_piece(m.to_x, (m.from_y as i8 + direction) as u8) == Piece::Empty {
                return true;
            }
        }
        
        // Capture
        if dx == 1 && dy == direction && self.get_piece(m.to_x, m.to_y) != Piece::Empty {
            return self.is_white(m.to_x, m.to_y) != is_white;
        }
        
        false
    }
    
    fn validate_knight_move(&self, m: &Move) -> bool {
        let dx = (m.to_x as i8).abs_diff(m.from_x as i8);
        let dy = (m.to_y as i8).abs_diff(m.from_y as i8);
        
        (dx == 2 && dy == 1) || (dx == 1 && dy == 2)
    }
    
    fn validate_move(&self, m: &Move) -> bool {
        // Basic bounds check
        if m.from_x >= 8 || m.from_y >= 8 || m.to_x >= 8 || m.to_y >= 8 {
            return false;
        }
        
        // Can't capture own piece
        if self.get_piece(m.to_x, m.to_y) != Piece::Empty {
            if self.is_white(m.from_x, m.from_y) == self.is_white(m.to_x, m.to_y) {
                return false;
            }
        }
        
        // Check piece-specific rules
        match self.get_piece(m.from_x, m.from_y) {
            Piece::Pawn => self.validate_pawn_move(m),
            Piece::Knight => self.validate_knight_move(m),
            _ => false,  // Other pieces not implemented
        }
    }
    
    fn apply_move(&mut self, m: &Move) {
        self.cells[m.to_y as usize][m.to_x as usize] = 
            self.cells[m.from_y as usize][m.from_x as usize];
        self.cells[m.from_y as usize][m.from_x as usize] = 0;
        self.white_to_move = !self.white_to_move;
    }
}

pub fn main() {
    let initial_board = sp1_zkvm::io::read::<Board>();
    let moves = sp1_zkvm::io::read::<Vec<Move>>();
    let expected_final_hash = sp1_zkvm::io::read::<[u8; 32]>();
    
    let mut board = initial_board;
    
    for (i, m) in moves.iter().enumerate() {
        if !board.validate_move(m) {
            sp1_zkvm::io::commit(&i);
            sp1_zkvm::io::commit(&false);
            return;
        }
        board.apply_move(m);
    }
    
    // Hash final board state
    let board_bytes = unsafe {
        std::slice::from_raw_parts(
            &board as *const Board as *const u8,
            std::mem::size_of::<Board>()
        )
    };
    let final_hash = sha256_hash(board_bytes);
    
    let is_valid = final_hash == expected_final_hash;
    sp1_zkvm::io::commit(&moves.len());
    sp1_zkvm::io::commit(&is_valid);
}
Advanced Signature Verification
rust#![no_main]
sp1_zkvm::entrypoint!(main);

use sp1_zkvm::syscalls::{syscall_secp256k1_add, syscall_secp256k1_double};

// Scalar multiplication for signature verification
fn scalar_mult(point: &[u8; 64], scalar: &[u8; 32]) -> [u8; 64] {
    let mut result = [0u8; 64];  // Point at infinity
    let mut temp = *point;
    
    for byte in scalar.iter().rev() {
        for i in (0..8).rev() {
            // Double
            let mut temp_words = [0u32; 16];
            for j in 0..16 {
                temp_words[j] = u32::from_le_bytes([
                    temp[j*4], temp[j*4+1], temp[j*4+2], temp[j*4+3]
                ]);
            }
            unsafe {
                syscall_secp256k1_double(&mut temp_words);
            }
            for j in 0..16 {
                temp[j*4..j*4+4].copy_from_slice(&temp_words[j].to_le_bytes());
            }
            
            // Add if bit is set
            if (byte >> i) & 1 == 1 {
                result = add_points(&result, &temp);
            }
        }
    }
    
    result
}

pub fn main() {
    let message_hash = sp1_zkvm::io::read::<[u8; 32]>();
    let signature_r = sp1_zkvm::io::read::<[u8; 32]>();
    let signature_s = sp1_zkvm::io::read::<[u8; 32]>();
    let pubkey = sp1_zkvm::io::read::<[u8; 64]>();
    
    // Simplified ECDSA verification (not production ready)
    // In practice, use proper signature verification libraries
    
    sp1_zkvm::io::commit(&true);  // Placeholder
}
Keccak256 Hashing
rustuse sp1_zkvm::syscalls::syscall_keccak_permute;

fn keccak256(data: &[u8]) -> [u8; 32] {
    let mut state = [0u64; 25];
    let mut buffer = [0u8; 136];  // Rate for Keccak256
    let mut buffer_pos = 0;
    
    for &byte in data {
        buffer[buffer_pos] = byte;
        buffer_pos += 1;
        
        if buffer_pos == 136 {
            // Absorb block
            for i in 0..17 {
                let mut word = 0u64;
                for j in 0..8 {
                    word |= (buffer[i*8 + j] as u64) << (j * 8);
                }
                state[i] ^= word;
            }
            
            unsafe {
                syscall_keccak_permute(&mut state);
            }
            buffer_pos = 0;
        }
    }
    
    // Padding
    buffer[buffer_pos] = 0x01;
    buffer[135] ^= 0x80;
    
    // Final block
    for i in 0..17 {
        let mut word = 0u64;
        for j in 0..8 {
            if i*8 + j < 136 {
                word |= (buffer[i*8 + j] as u64) << (j * 8);
            }
        }
        state[i] ^= word;
    }
    
    unsafe {
        syscall_keccak_permute(&mut state);
    }
    
    // Extract hash
    let mut result = [0u8; 32];
    for i in 0..4 {
        for j in 0..8 {
            result[i*8 + j] = (state[i] >> (j * 8)) as u8;
        }
    }
    result
}
BN254 Pairing Operations
rustuse sp1_zkvm::syscalls::{syscall_bn254_add, syscall_bn254_double};

// BN254 operations for pairing-based cryptography
fn bn254_scalar_mult(point: &[u8; 64], scalar: &[u8; 32]) -> [u8; 64] {
    let mut result = [0u8; 64];
    let mut temp = *point;
    
    for byte in scalar.iter().rev() {
        for i in (0..8).rev() {
            // Double
            let mut temp_words = [0u32; 16];
            for j in 0..16 {
                temp_words[j] = u32::from_le_bytes([
                    temp[j*4], temp[j*4+1], temp[j*4+2], temp[j*4+3]
                ]);
            }
            unsafe {
                syscall_bn254_double(&mut temp_words);
            }
            
            // Add if bit set
            if (byte >> i) & 1 == 1 {
                let mut result_words = [0u32; 16];
                for j in 0..16 {
                    result_words[j] = u32::from_le_bytes([
                        result[j*4], result[j*4+1], 
                        result[j*4+2], result[j*4+3]
                    ]);
                }
                unsafe {
                    syscall_bn254_add(&mut result_words, &temp_words);
                }
                for j in 0..16 {
                    result[j*4..j*4+4].copy_from_slice(&result_words[j].to_le_bytes());
                }
            }
        }
    }
    
    result
}
BigInt Operations
rustuse sp1_zkvm::syscalls::sys_bigint;

fn bigint_modmul(a: &[u8; 32], b: &[u8; 32], modulus: &[u8; 32]) -> [u8; 32] {
    let mut result = [0u32; 8];
    let a_words: [u32; 8] = unsafe { std::mem::transmute(*a) };
    let b_words: [u32; 8] = unsafe { std::mem::transmute(*b) };
    let mod_words: [u32; 8] = unsafe { std::mem::transmute(*modulus) };
    
    unsafe {
        sys_bigint(&mut result, 0, &a_words, &b_words, &mod_words);
    }
    
    unsafe { std::mem::transmute(result) }
}
Recursive Proof Verification
rustuse sp1_zkvm::lib::verify::verify_sp1_proof;

pub fn verify_recursive() {
    let vkey = sp1_zkvm::io::read::<[u32; 8]>();
    let public_values_digest = sp1_zkvm::io::read::<[u8; 32]>();
    
    verify_sp1_proof(&vkey, &public_values_digest);
    
    sp1_zkvm::io::commit(&true);
}
Expert Patterns
Zero-Copy Optimization
rust// Avoid expensive serialization
let data = sp1_zkvm::io::read_vec();  // Raw bytes
let parsed: &MyStruct = unsafe { 
    &*(data.as_ptr() as *const MyStruct) 
};
Streaming Large Data
rustpub fn process_gigabyte_file() {
    let total_chunks = sp1_zkvm::io::read::<u32>();
    let mut hasher = Sha256State::new();
    
    for _ in 0..total_chunks {
        let chunk = sp1_zkvm::io::read_vec();
        hasher.update(&chunk);
    }
    
    let final_hash = hasher.finalize();
    sp1_zkvm::io::commit(&final_hash);
}
Field Element Operations
rustuse sp1_zkvm::syscalls::{syscall_bn254_fp_addmod, syscall_bn254_fp_mulmod};

fn field_arithmetic() {
    let mut a = [0u32; 8];  // BN254 field element
    let b = [1u32; 8];
    
    unsafe {
        syscall_bn254_fp_addmod(&mut a, &b);
        syscall_bn254_fp_mulmod(&mut a, &b);
    }
}
Complete Rules & Best Practices

Memory Alignment: All syscall pointers must be 4-byte aligned
Canonical Inputs: Field elements must be reduced modulo field prime
No String Formatting: Avoid format!, println! in production
Proof Size: Minimize public commitments (each adds ~32 bytes)
Precompile Efficiency:

SHA256: ~100x faster than software
Secp256k1: ~1000x faster than software
BN254: ~500x faster than software


Memory Limits: ~2GB available, plan accordingly
Recursion Depth: Each level adds ~10% overhead
Input Validation: Always validate curve points lie on curve
Error Handling: No panics - use early returns with false commits
Cycle Optimization: Profile with cycle tracking for bottlenecks

Anti-Patterns to Avoid
rust// BAD: Dynamic allocation in hot loops
for i in 0..1000000 {
    let v = vec![i; 100];  // Allocates every iteration
}

// GOOD: Reuse buffers
let mut buffer = vec![0; 100];
for i in 0..1000000 {
    buffer.fill(i);
}

// BAD: Unnecessary serialization
let data = sp1_zkvm::io::read::<MyLargeStruct>();

// GOOD: Read raw bytes when possible
let data = sp1_zkvm::io::read_vec();

// BAD: Not checking precompile requirements
syscall_secp256k1_add(&mut p1, &p2);  // May fail if not on curve

// GOOD: Validate inputs first
if !is_on_curve(&p1) || !is_on_curve(&p2) {
    sp1_zkvm::io::commit(&false);
    return;
}