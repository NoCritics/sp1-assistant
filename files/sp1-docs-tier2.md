# SP1 Essential Reference for Code Generation

This is a condensed reference. Use ONLY the functions and patterns shown here.

## Program Structure (MEMORIZE THIS)
```rust
#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    // 1. Read inputs
    let input = sp1_zkvm::io::read::<TYPE>();
    
    // 2. Perform verification
    let is_valid = /* your logic */;
    
    // 3. Commit outputs
    sp1_zkvm::io::commit(&value);
}
```

## Available Functions
- `sp1_zkvm::io::read::<T>()` - Read input of type T
- `sp1_zkvm::io::commit(&value)` - Commit value to public output
- `sp1_zkvm::entrypoint!(main)` - Required macro (not a function!)

**NO OTHER sp1_zkvm:: functions exist!**

## Type Guidelines
- Use fixed-size types: `u32`, `u64`, `[u8; 32]`
- Avoid: `String`, unbounded `Vec` when possible
- For arrays: prefer `[T; N]` over `Vec<T>`

## Working Examples

### Example 1: Simple Score Verification
```rust
#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    let score = sp1_zkvm::io::read::<u32>();
    let max_score = sp1_zkvm::io::read::<u32>();
    
    let is_valid = score <= max_score;
    
    sp1_zkvm::io::commit(&score);
    sp1_zkvm::io::commit(&is_valid);
}
```

### Example 2: Multi-Factor Validation
```rust
#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    let user_id = sp1_zkvm::io::read::<u32>();
    let action = sp1_zkvm::io::read::<u8>();
    let timestamp = sp1_zkvm::io::read::<u64>();
    
    let valid_user = user_id > 0 && user_id < 1_000_000;
    let valid_action = action <= 10;
    let valid_time = timestamp > 1_700_000_000;
    
    let is_valid = valid_user && valid_action && valid_time;
    
    sp1_zkvm::io::commit(&user_id);
    sp1_zkvm::io::commit(&is_valid);
}
```

### Example 3: Array Processing
```rust
#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    let data = sp1_zkvm::io::read::<Vec<u32>>();
    let threshold = sp1_zkvm::io::read::<u32>();
    
    let mut count = 0u32;
    for value in data.iter() {
        if *value > threshold {
            count += 1;
        }
    }
    
    sp1_zkvm::io::commit(&count);
    sp1_zkvm::io::commit(&(count > 0));
}
```

## Common Patterns

### Early Exit (Saves Cycles)
```rust
for item in items.iter() {
    if !is_valid(item) {
        valid = false;
        break; // Stop early
    }
}
```

### Overflow Protection
```rust
sum = sum.saturating_add(value);
product = product.saturating_mul(factor);
```

## Critical Rules
1. ALWAYS start with `#![no_main]`
2. ALWAYS use `sp1_zkvm::entrypoint!(main);`
3. Read ALL inputs before processing
4. Commit ALL public values at the end
5. Keep logic simple - complexity costs money
6. Each proof costs $0.02-0.05
7. Proofs take 30-90 seconds

## What NOT to Do
- ? `sp1_zkvm::io::write()` - Does not exist
- ? `println!()` - Not available in zkVM
- ? `async/await` - Not supported
- ? Complex nested loops - Too expensive
- ? String manipulation - Use hashes instead

---

# SP1 Extended Reference (Advanced)

## Precompiles (Hardware Acceleration)

SP1 includes optimized precompiles for common operations:

### SHA256 Hashing
```rust
use sha2::{Sha256, Digest};

let mut hasher = Sha256::new();
hasher.update(&data);
let result: [u8; 32] = hasher.finalize().into();
```

### Keccak256 Hashing
```rust
use tiny_keccak::{Hasher, Keccak};

let mut hasher = Keccak::v256();
hasher.update(&data);
let mut result = [0u8; 32];
hasher.finalize(&mut result);
```

## Advanced Examples

### Fibonacci Verification
```rust
#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    let n = sp1_zkvm::io::read::<u32>();
    
    let mut a = 0;
    let mut b = 1;
    for _ in 0..n {
        let mut c = a + b;
        c %= 7919; // Prevent overflow
        a = b;
        b = c;
    }
    
    sp1_zkvm::io::commit(&n);
    sp1_zkvm::io::commit(&a);
    sp1_zkvm::io::commit(&b);
}
```

### Merkle Proof Verification
```rust
#![no_main]
sp1_zkvm::entrypoint!(main);

use sha2::{Sha256, Digest};

pub fn main() {
    let leaf = sp1_zkvm::io::read::<[u8; 32]>();
    let proof = sp1_zkvm::io::read::<Vec<[u8; 32]>>();
    let root = sp1_zkvm::io::read::<[u8; 32]>();
    let mut index = sp1_zkvm::io::read::<u32>();
    
    let mut current = leaf;
    
    for sibling in proof.iter() {
        let mut hasher = Sha256::new();
        if index & 1 == 0 {
            hasher.update(&current);
            hasher.update(sibling);
        } else {
            hasher.update(sibling);
            hasher.update(&current);
        }
        current = hasher.finalize().into();
        index >>= 1;
    }
    
    let is_valid = current == root;
    
    sp1_zkvm::io::commit(&leaf);
    sp1_zkvm::io::commit(&is_valid);
}
```

## Performance Optimization

### Cycle Costs
- Basic arithmetic: ~1-10 cycles
- Memory access: ~10-50 cycles
- Loops: multiply by iteration count
- Precompiles: 10-100x faster than manual

### Cost Estimation
- Base cost: ~$0.02
- Per million cycles: ~$0.001
- Complex verification: $0.02-0.10
- Keep cycles under 50M for reasonable cost

## Solidity Compatibility

For on-chain verification, encode outputs for Solidity:
```rust
use alloy_sol_types::sol;

sol! {
    struct PublicValues {
        uint32 value1;
        uint32 value2;
        bool isValid;
    }
}
```

### Batch Processing
```rust
pub fn main() {
    let batch_size = sp1_zkvm::io::read::<u32>();
    let mut results = Vec::with_capacity(batch_size as usize);
    
    for i in 0..batch_size {
        let item = sp1_zkvm::io::read::<u32>();
        let valid = process_item(item);
        results.push(valid);
    }
    
    let valid_count = results.iter().filter(|&&x| x).count();
    sp1_zkvm::io::commit(&(valid_count as u32));
}
```

## Error Handling
Since zkVM cannot panic, use validation patterns:
```rust
let is_valid = if data.len() == 0 {
    false  // Invalid: empty data
} else if data.len() > MAX_SIZE {
    false  // Invalid: too large
} else {
    process_data(&data)
};
```

## Memory Management
- Preallocate with capacity: `Vec::with_capacity(size)`
- Reuse buffers when possible
- Avoid cloning large data structures
- Use references: `&[u8]` instead of `Vec<u8>`
