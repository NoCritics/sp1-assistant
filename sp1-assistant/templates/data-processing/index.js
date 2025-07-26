const SP1Template = require('../baseTemplate');

class DataProcessingTemplate extends SP1Template {
  constructor() {
    super(
      'data-processing',
      'Prove correct data computation with zero-knowledge proofs'
    );
  }

  parseInput(userCode) {
    // Extract computation patterns
    const patterns = {
      computation: /compute|calculate|process|transform|aggregate/i,
      dataType: /array|list|vector|data|values|numbers/i,
      operation: /sum|average|mean|median|max|min|filter|map|reduce/i,
      validation: /validate|check|verify|assert|ensure/i
    };

    const parsed = {
      hasComputation: patterns.computation.test(userCode),
      hasData: patterns.dataType.test(userCode),
      operation: this.detectOperation(userCode),
      inputs: []
    };

    // Determine inputs based on detected patterns
    if (parsed.hasData) parsed.inputs.push('data');
    if (parsed.operation) parsed.inputs.push('expected_result');
    
    return parsed;
  }

  detectOperation(code) {
    const operations = {
      sum: /sum|total|add/i,
      average: /average|mean|avg/i,
      median: /median/i,
      max: /max|maximum|largest/i,
      min: /min|minimum|smallest/i,
      count: /count|length|size/i,
      filter: /filter|where|select/i
    };

    for (const [op, pattern] of Object.entries(operations)) {
      if (pattern.test(code)) return op;
    }
    return 'sum'; // default
  }

  generateProgram(parsedData) {
    const operation = parsedData.operation || 'sum';
    
    const operations = {
      sum: this.generateSumProgram(),
      average: this.generateAverageProgram(),
      median: this.generateMedianProgram(),
      max: this.generateMaxProgram(),
      min: this.generateMinProgram(),
      count: this.generateCountProgram(),
      filter: this.generateFilterProgram()
    };

    return operations[operation] || operations.sum;
  }

  generateSumProgram() {
    return `#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    // Read input data and expected result
    let data = sp1_zkvm::io::read::<Vec<u32>>();
    let expected_sum = sp1_zkvm::io::read::<u64>();
    
    // Compute sum with overflow protection
    let mut sum = 0u64;
    for value in data.iter() {
        sum = sum.saturating_add(*value as u64);
    }
    
    // Verify computation
    let is_valid = sum == expected_sum;
    
    // Commit public values
    sp1_zkvm::io::commit(&data.len() as u32);
    sp1_zkvm::io::commit(&expected_sum);
    sp1_zkvm::io::commit(&is_valid);
}`;
  }

  generateAverageProgram() {
    return `#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    // Read input data and expected average
    let data = sp1_zkvm::io::read::<Vec<u32>>();
    let expected_avg = sp1_zkvm::io::read::<u32>();
    
    // Compute average
    let sum: u64 = data.iter().map(|&x| x as u64).sum();
    let count = data.len() as u64;
    let average = if count > 0 { (sum / count) as u32 } else { 0 };
    
    // Verify computation
    let is_valid = average == expected_avg && count > 0;
    
    // Commit public values
    sp1_zkvm::io::commit(&count as u32);
    sp1_zkvm::io::commit(&expected_avg);
    sp1_zkvm::io::commit(&is_valid);
}`;
  }

  generateMedianProgram() {
    return `#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    // Read input data and expected median
    let mut data = sp1_zkvm::io::read::<Vec<u32>>();
    let expected_median = sp1_zkvm::io::read::<u32>();
    
    // Sort data for median calculation
    data.sort_unstable();
    
    // Calculate median
    let len = data.len();
    let median = if len == 0 {
        0
    } else if len % 2 == 0 {
        // Even length: average of two middle elements
        (data[len/2 - 1] + data[len/2]) / 2
    } else {
        // Odd length: middle element
        data[len/2]
    };
    
    // Verify computation
    let is_valid = median == expected_median && len > 0;
    
    // Commit public values
    sp1_zkvm::io::commit(&len as u32);
    sp1_zkvm::io::commit(&expected_median);
    sp1_zkvm::io::commit(&is_valid);
}`;
  }

  generateMaxProgram() {
    return `#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    // Read input data and expected maximum
    let data = sp1_zkvm::io::read::<Vec<u32>>();
    let expected_max = sp1_zkvm::io::read::<u32>();
    
    // Find maximum value
    let max_value = data.iter().max().copied().unwrap_or(0);
    
    // Verify computation
    let is_valid = max_value == expected_max && !data.is_empty();
    
    // Commit public values
    sp1_zkvm::io::commit(&data.len() as u32);
    sp1_zkvm::io::commit(&expected_max);
    sp1_zkvm::io::commit(&is_valid);
}`;
  }

  generateMinProgram() {
    return `#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    // Read input data and expected minimum
    let data = sp1_zkvm::io::read::<Vec<u32>>();
    let expected_min = sp1_zkvm::io::read::<u32>();
    
    // Find minimum value
    let min_value = data.iter().min().copied().unwrap_or(0);
    
    // Verify computation
    let is_valid = min_value == expected_min && !data.is_empty();
    
    // Commit public values
    sp1_zkvm::io::commit(&data.len() as u32);
    sp1_zkvm::io::commit(&expected_min);
    sp1_zkvm::io::commit(&is_valid);
}`;
  }

  generateCountProgram() {
    return `#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    // Read input data and filter threshold
    let data = sp1_zkvm::io::read::<Vec<u32>>();
    let threshold = sp1_zkvm::io::read::<u32>();
    let expected_count = sp1_zkvm::io::read::<u32>();
    
    // Count values above threshold
    let count = data.iter()
        .filter(|&&value| value > threshold)
        .count() as u32;
    
    // Verify computation
    let is_valid = count == expected_count;
    
    // Commit public values
    sp1_zkvm::io::commit(&threshold);
    sp1_zkvm::io::commit(&expected_count);
    sp1_zkvm::io::commit(&is_valid);
}`;
  }

  generateFilterProgram() {
    return `#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    // Read input data and filter criteria
    let data = sp1_zkvm::io::read::<Vec<u32>>();
    let min_value = sp1_zkvm::io::read::<u32>();
    let max_value = sp1_zkvm::io::read::<u32>();
    let expected_count = sp1_zkvm::io::read::<u32>();
    
    // Filter data within range
    let filtered_count = data.iter()
        .filter(|&&value| value >= min_value && value <= max_value)
        .count() as u32;
    
    // Verify computation
    let is_valid = filtered_count == expected_count;
    
    // Commit public values
    sp1_zkvm::io::commit(&min_value);
    sp1_zkvm::io::commit(&max_value);
    sp1_zkvm::io::commit(&expected_count);
    sp1_zkvm::io::commit(&is_valid);
}`;
  }
}

module.exports = DataProcessingTemplate;