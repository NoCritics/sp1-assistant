Introduction
Documentation for SP1 users and developers.



SP1 is a zero‑knowledge virtual machine (zkVM) that proves the correct execution of programs compiled for the RISC-V architecture. This means it can run and prove programs written in Rust, C++, C, or any language that compiles to RISC-V.

SP1 is feature-complete, consistently delivers state-of-the-art performance on industry-standard benchmarks, and has been rigorously audited by top security firms. It's trusted in production by leading teams across blockchains, cryptography, and beyond.

Prove the World's Software
At Succinct, our mission is to prove the world’s software. We believe zero-knowledge proofs (ZKPs) are a foundational upgrade to computing: one that brings cryptographic verifiability to everything from blockchains and AI to real-world data and digital media.

Historically, however, ZK has been difficult to adopt. Developers needed to learn specialized languages, build custom circuits, and deeply understand cryptographic systems, barriers that made ZKPs accessible only to experts working on narrow, application-specific use cases.

SP1 changes that. With SP1, developers can write provable programs using ordinary code in familiar languages like Rust. There's no need for custom circuit design or cryptography expertise, just write your logic, compile it, and generate a proof. It’s ZK as intuitive and programmable as traditional computing.

Why Use SP1
If you're building with zero-knowledge proofs today, SP1 gives you the fastest path to production, without compromising on performance, flexibility, or developer experience. Here are three reasons why teams are choosing SP1:

Maintainability. Write ZK programs in standard Rust without custom DSLs or complex circuits. SP1 makes your codebase easier to understand, audit, and evolve over time.

Faster Development. Skip months of low-level ZK engineering. SP1 drastically shortens timelines, helping you go from idea to mainnet faster.

Performance. SP1 delivers state-of-the-art proving speed and efficiency, benchmarked and battle-tested in real-world production environments.

Open Source
SP1 includes open-source implementations of both the prover and verifier, released under the MIT and Apache 2.0 licenses.

What is a zkVM?
A zero-knowledge virtual machine (zkVM) is a system that allows developers to generate zero-knowledge proofs (ZKPs) for the correct execution of arbitrary programs.

Think of a zkVM as a way to prove that a program evaluated a function f(x) and produced an output y, without revealing how it did so. The typical zkVM flow looks like this:

Define your function f.
Setup a proving key pk and a verifying key vk for the program based on the ELF.
Prove the output of your program using prove(pk, x) to produce a proof π that f(x) = y.
Verify the proof with verify(vk, x, y, π).
For example, f could be a simple Fibonacci sequence computation. In blockchain contexts, the proof is often verified on-chain via a smart contract.

How Does SP1 Work?
SP1 is a zkVM built to prove the execution of arbitrary programs compiled to the RISC-V instruction set. Here's how it works:

Define your function f in Rust and compile it to a RISC-V ELF file.
Setup a proving key pk and a verifying key vk for the program based on the ELF.
Prove the execution of your program using SP1.
Verify the proof using SP1.
Behind the scenes, SP1 is powered by a zero-knowledge proof system known as STARKs (Scalable Transparent ARguments of Knowledge), which enable fast, transparent, and post-quantum-secure proof generation. STARKs work by encoding a computation as a series of algebraic constraints and using a cryptographic commitment scheme known as FRI (Fast Reed-Solomon Interactive Oracle Proofs of Proximity) to prove that these constraints are satisfied. SP1 operates over the Baby Bear field, a finite field optimized for efficient arithmetic in STARK-based systems.

To ensure scalability, SP1 supports recursive STARKs, allowing it to break long computations into smaller chunks and prove each recursively. Additionally, SP1 includes a STARK-to-SNARK wrapping layer that compresses large STARK proofs into small SNARK proofs, enabling efficient verification on-chain (especially in EVM environments). This hybrid design strikes a balance between performance, proof size, and compatibility with existing blockchain infrastructure.

Usecases
Zero-knowledge proofs (ZKPs) are a powerful primitive that enable verifiable computation. With ZKPs, anyone can verify a cryptographic proof that a program has executed correctly, without needing to trust the prover, re-execute the program or even know the inputs to the program.

Historically, building ZKP systems has been extremely complicated, requiring large teams with specialized cryptography expertise and taking years to go to production. SP1 is a performant, general-purpose zkVM that solves this problem and creates a future where all blockchain infrastructure, including rollups, bridges, coprocessors, and more, utilize ZKPs via maintainable software written in Rust.

Below are some of the most common use cases for SP1, along with real-world applications.

Categories
Category	Description
Coprocessors	Outsource onchain computation to offchain provers for use cases like large-scale computation over historical state and onchain machine learning, reducing gas costs.
Light Clients	Build light clients that verify the state of other chains, enabling trustless interoperability across blockchains.
Oracles	Perform large-scale computations on onchain data, including consensus and storage state.
Privacy	Enable onchain privacy features such as private transactions and private state.
Examples
Project	Description
OP Succinct	Succinct's production-grade proving engine for the OP Stack.
SP1 Tendermint	ZK Tendermint light client on Ethereum powered by SP1.
RSP	A performant, type-1 zkEVM built with Rust and SP1 using Reth.
SP1 Contract Call	Lightweight library for generating ZKPs of Ethereum smart contract execution.
SP1 Blobstream	Verifies Celestia data roots on Ethereum and other EVM chains.
SP1 Vector	Relays Avail Merkle root to Ethereum and functions as a token bridge.

Installation
SP1 can currently be run natively on Linux and macOS.

You can either use prebuilt binaries through sp1up, the official SP1 installer, or build the Succinct Rust toolchain and SP1 CLI from source.

Requirements
Git
Rust
Docker
Option 1: Prebuilt Binaries (Recommended)
sp1up is the SP1 toolchain installer. Open your terminal and run the following command and follow the instructions:

curl -L https://sp1up.succinct.xyz | bash

Then simply follow the instructions on-screen, which will make the sp1up command available in your CLI.

After following the instructions, you can run sp1up to install the toolchain and the cargo prove CLI:

sp1up

This will install two things:

The succinct Rust toolchain which has support for the riscv32im-succinct-zkvm-elf compilation target.
cargo prove CLI tool that provides convenient commands for compiling SP1 programs and other helper functionality.
You can verify the installation of the CLI by running cargo prove --version:

cargo prove --version

You can check the version of the Succinct Rust toolchain by running:

RUSTUP_TOOLCHAIN=succinct cargo --version

or equivalently:

cargo +succinct --version

If this works, go to the next section to compile and prove a simple zkVM program.

Troubleshooting
Rate-limiting
If you experience rate-limiting when using the sp1up command, you can resolve this by using the --token flag and providing your GitHub token. To create a Github token, follow the instructions here.

sp1up --token ghp_YOUR_GITHUB_TOKEN_HERE

Unsupported OS Architectures
Currently our prebuilt binaries are built on Ubuntu 20.04 (22.04 on ARM) and macOS. If your OS uses an older GLIBC version, it's possible these may not work and you will need to build the toolchain from source.

Conflicting cargo-prove installations
If you have installed cargo-prove from source, it may conflict with sp1up's cargo-prove installation or vice versa.

To remove the cargo-prove that was installed from source, run the following command:

rm ~/.cargo/bin/cargo-prove

To remove the cargo-prove that was installed through sp1up, run the following command:

rm ~/.sp1/bin/cargo-prove

Option 2: Building from Source
Warning: This option will take a long time to build and is only recommended for advanced users.

Make sure you have installed the dependencies needed to build the Rust toolchain from source.

Clone the sp1 repository and navigate to the root directory.

git clone git@github.com:succinctlabs/sp1.git
cd sp1
cd crates
cd cli
cargo install --locked --force --path .
cd ~
cargo prove build-toolchain

Building the Succinct Rust toolchain can take a while, ranging from 30 mins to an hour depending on your machine.

If you're on a machine that sp1up has prebuilt binaries for (ARM Mac or x86 or ARM Linux), you can use the following to download a prebuilt version.

cargo prove install-toolchain

To verify the installation of the toolchain, run the following command and make sure you see succinct:

rustup toolchain list

You can delete your existing installation of the toolchain with the following command:

rustup toolchain remove succinct

Quickstart
In this section, we will show you how to get started with SP1 by compiling, executing and proving a simple Fibonacci program.

Create an SP1 Project
After installing the cargo-prove CLI, you can create and navigate to a new project with the following commands:

cargo prove new --bare fibonacci
cd fibonacci

This command will create a new folder in your current directory which includes a basic SP1 project for zkVM programs.

note
If you use the --evm option instead of --bare, you will need to install Foundry to compile the Solidity contracts for on-chain verification. Please follow the instructions on the official Foundry docs.

After installation, run forge install in the contracts directory to install the necessary dependencies.

Project Overview
Your new project will have the following structure:

.
├── program
│   ├── Cargo.lock
│   ├── Cargo.toml
│   └── src
│       └── main.rs
├── rust-toolchain
└── script
    ├── Cargo.lock
    ├── Cargo.toml
    ├── build.rs
    └── src
        └── bin
            ├── prove.rs
            └── vkey.rs

6 directories, 4 files

There are 2 directories (each a crate) in the project:

program: the source code that will be proven inside the zkVM.
script: code that contains proof generation and verification code.
We recommend you install the rust-analyzer extension. Note that if you use cargo prove new inside a monorepo, you will need to add the manifest file to rust-analyzer.linkedProjects to get full IDE support.

Build
Before we can run the program inside the zkVM, it must be compiled to a RISC-V executable using the succinct Rust toolchain. This is called an ELF (Executable and Linkable Format). To compile the program, you can run the following command:

cd program && cargo prove build

This will generate an ELF file in the target/elf-compilation directory.

note
The build.rs file in the script directory will use run the above command automatically to build the ELF, so you won't need to manually run cargo prove build every time you make a change to the program.

Execute
To test your program, you can first execute it without generating a proof. Executing the program is helpful for verifying your program's correctness without generating a proof, which is helpful for debugging and speeds up development.

cd ../script
RUST_LOG=info cargo run --release -- --execute

The output should show something like this:

n: 20
Program executed successfully.
n: 20
a: 6765
b: 10946
Values are correct!
Number of cycles: 9198

note
For larger programs (>1M cycles), skip proof generation during development. Instead, just execute the program with the RISC-V runtime to verify the public_values match the expected output. This is much faster for testing.

Prove
tip
We recommend teams to use the Succinct Prover Network to generate proofs, rather than generating proofs locally, as it's more reliable, efficient and scalable.

When you are ready to generate a proof, you should run the script with the --prove flag that will generate a proof.

cd ../script
RUST_LOG=info cargo run --release -- --prove

The output should show something like this:

2025-04-03T00:42:32.165860Z  WARN SP1_PROVER environment variable not set, defaulting to 'cpu'
n: 20
2025-04-03T00:42:35.634237Z  INFO prove_core: clk = 0 pc = 0x2013c4
2025-04-03T00:42:35.637007Z  INFO prove_core: clk = 0 pc = 0x2013c4
2025-04-03T00:42:35.760049Z  INFO prove_core:generate main traces: close time.busy=112ms time.idle=1.50µs index=0
2025-04-03T00:42:41.208307Z  INFO prove_core: close time.busy=5.45s time.idle=126ms
Successfully generated proof!
2025-04-03T00:42:41.360538Z  INFO verify: close time.busy=151ms time.idle=1.29µs
Successfully verified proof!


The Fibonacci program is quite small by default, so proof generation will only take a few seconds locally. After proof generation, the proof is verified for correctness.

Note: When benchmarking proof generation times locally, it is important to note that there is a fixed overhead for proving. Concretely, proof generation time for small programs is not representative of the performance on larger programs. Larger programs will have better performance characteristics as the fixed overhead is amortized across more work.

Project Template
Alternatively, you can start by cloning the SP1 Project Template. This template contains an SP1 program, a script to generate proofs, and a Solidity contract that can verify SP1 proofs on any EVM chain.

Recommended Workflow
Please see the Recommended Workflow section for more details on how to develop your SP1 program and generate proofs.

We strongly recommend that developers who want to use SP1 for non-trivial programs generate proofs on the Succinct Prover Network. The Succinct Prover Network generates SP1 proofs across multiple machines, reducing latency and also runs SP1 on optimized hardware instances for better proof generation performance and cheaper proofs.

Hardware Requirements
tip
For non-trivial programs using SP1 or production benchmarking, we highly recommend generating proofs on the Succinct Prover Network, which distributes proof generation across optimized hardware instances for faster and cheaper results.

Local Proving
The hardware requirements for local proof generation are listed below. These requirements depend on which types of proofs you want to generate and can also change over time as the design of SP1 evolves.

CPU is critical for performance/latency and enough memory is required to prevent out-of-memory errors.

Mock / Network	Core / Compress	Groth16 and PLONK (EVM)
CPU	1+, single-core perf matters	16+, more is better	16+, more is better
Memory	8GB+, more is better	16GB+, more if you have more cores	16GB+, more is better
Disk	10GB+	10GB+	10GB+
EVM Compatible	✅	❌	✅
CPU
The execution & trace generation of the zkVM is mostly CPU bound, so high single-core performance is recommended for the best performance on these steps. The rest of the prover is mostly bound by hashing/field operations which can be parallelized with multiple cores.

Memory
The SP1 prover requires keeping large matrices (i.e., traces) in memory to generate proofs. Certain steps of the prover have a minimum memory requirement, so the process will OOM if you have less than this amount of memory.

This effect is most noticeable when using the Groth16 or PLONK provers. If you're running the Groth16 or PLONK provers locally using Docker, you might need to increase the memory limit for Docker desktop.

If to want to use proof aggregation with Groth16 or PLONK provers, it's recommended to increase the memory limit for Docker desktop to at least 32GB.

Disk
Disk is required to install the SP1 zkVM toolchain and circuit artifacts, if you plan to locally generate Groth16 or PLONK proofs.

Furthermore, disk is used to checkpoint the state of the program execution, which is required to generate the proofs.

Basics
The easiest way to understand how to write programs for the SP1 zkVM is to look at some examples.

Fibonacci Example
This program is from the examples directory in the SP1 repo which contains several example programs of varying complexity.

Source
#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    // Read an input to the program.
    //
    // Behind the scenes, this compiles down to a system call which handles reading inputs
    // from the prover.
    let n = sp1_zkvm::io::read::<u32>();

    // Write n to public input
    sp1_zkvm::io::commit(&n);

    // Compute the n'th fibonacci number, using normal Rust code.
    let mut a = 0;
    let mut b = 1;
    for _ in 0..n {
        let mut c = a + b;
        c %= 7919; // Modulus to prevent overflow.
        a = b;
        b = c;
    }

    // Write the output of the program.
    //
    // Behind the scenes, this also compiles down to a system call which handles writing
    // outputs to the prover.
    sp1_zkvm::io::commit(&a);
    sp1_zkvm::io::commit(&b);
}

Setup
In this section, we will teach you how to setup a self-contained crate which can be compiled as a program that can be executed inside the zkVM.

Create Project with CLI (Recommended)
The recommended way to setup your first program to prove inside the zkVM is using the method described in Quickstart which will create a program folder.

cargo prove new --bare <name>
cd <name>/program

Manual Project Setup
You can also manually setup a project. First create a new Rust project using cargo:

cargo new program
cd program

Cargo Manifest
Inside this crate, add the sp1-zkvm crate as a dependency. Your Cargo.toml should look like the following:

[workspace]
[package]
version = "0.1.0"
name = "program"
edition = "2021"

[dependencies]
sp1-zkvm = "4.0.0"

The sp1-zkvm crate includes necessary utilities for your program, including handling inputs and outputs, precompiles, patches, and more.

main.rs
Inside the src/main.rs file, you must make sure to include these two lines to ensure that your program properly compiles to a valid SP1 program.

Source
#![no_main]
sp1_zkvm::entrypoint!(main);
These two lines of code wrap your main function with some additional logic to ensure that your program compiles correctly with the RISC-V target.

Compiling Programs
Once you have written an SP1 program, you must compile it to an ELF file that can be executed in the zkVM. The cargo prove CLI tool (downloaded during installation) provides convenient commands for compiling SP1 programs.

Development Builds
WARNING: Running cargo prove build may not generate a reproducible ELF which is necessary for verifying that your binary corresponds to given source code.

Use SP1's reproducible build system for production builds.

To build a program while developing, simply run the following command in the crate that contains your SP1 program:

# Enter the directory containing your SP1 program.
cd path/to/your/program

# Build the program.
cargo prove build

This will compile the ELF that can be executed in the zkVM. The output from the command will look similar to this:

[sp1]     Compiling version_check v0.9.4
[sp1]     Compiling proc-macro2 v1.0.86
[sp1]     Compiling unicode-ident v1.0.12
[sp1]     Compiling cfg-if v1.0.0
...
[sp1]     Compiling sp1-lib v1.0.1
[sp1]     Compiling sp1-zkvm v1.0.1
[sp1]     Compiling fibonacci-program v0.1.0 (/Users/username/Documents/fibonacci/program)
[sp1]      Finished `release` profile [optimized] target(s) in 8.33s

Under the hood, this CLI command calls cargo build with the riscv32im-succinct-zkvm-elf target and other required environment variables and flags. The logic for this command is defined in the sp1-build crate.

Advanced Build Options
The cargo prove build command supports several configuration options to customize the build process for your program:

--docker: Use Docker to build the ELF
--tag: Specify the Docker image tag
--features: Enable specific features
--output-directory: Specify a custom output location for the ELF
--elf-name: Set a custom name for the output ELF file
--no-default-features: Disable default features
--locked: Ensure Cargo.lock remains unchanged
--packages: Build only specified packages
--binaries: Build only specified binaries
--output-directory: Specify a custom output location for the ELF
Run cargo prove build --help to see the complete list of options. Some options mirror those available in the standard cargo build command.

Production Builds
For production builds, use Docker to generate a reproducible ELF that will be identical across all platforms. Simply add the --docker flag to your build command.

cargo prove build --docker

You can also specify a release version using --tag, otherwise the tag defaults to the latest release. For example:

cargo prove build --docker --tag v4.0.0

To verify that your build is truly reproducible across different platforms and systems, compute the SHA-512 hash of the generated ELF file. The hash should be identical regardless of where you build it:

$ shasum -a 512 elf/riscv32im-succinct-zkvm-elf
f9afb8caaef10de9a8aad484c4dd3bfa54ba7218f3fc245a20e8a03ed40b38c617e175328515968aecbd3c38c47b2ca034a99e6dbc928512894f20105b03a203


Build Script
If you want your program crate to be built automatically whenever you build/run your script crate, you can add a build.rs file inside of script/ (at the same level as Cargo.toml of your script crate) that utilizes the sp1-build crate:

Source
fn main() {
    sp1_build::build_program("../program");
}
The path passed in to build_program should point to the directory containing the Cargo.toml file for your program. Make sure to also add sp1-build as a build dependency in script/Cargo.toml:

[build-dependencies]
sp1-build = "4.0.0"

You will see output like the following from the build script if the program has changed, indicating that the program was rebuilt:

[fibonacci-script 0.1.0] cargo:rerun-if-changed=../program/src
[fibonacci-script 0.1.0] cargo:rerun-if-changed=../program/Cargo.toml
[fibonacci-script 0.1.0] cargo:rerun-if-changed=../program/Cargo.lock
[fibonacci-script 0.1.0] cargo:warning=fibonacci-program built at 2024-03-02 22:01:26
[fibonacci-script 0.1.0] [sp1]    Compiling fibonacci-program v0.1.0 (/Users/umaroy/Documents/fibonacci/program)
[fibonacci-script 0.1.0] [sp1]     Finished release [optimized] target(s) in 0.15s
warning: fibonacci-script@0.1.0: fibonacci-program built at 2024-03-02 22:01:26


The above output was generated by running RUST_LOG=info cargo run --release -vv for the script folder of the Fibonacci example.

Advanced Build Options
To configure the build process when using the sp1-build crate, you can pass a BuildArgs struct to to the build_program_with_args function. The build arguments are the same as the ones available from the cargo prove build command.

As an example, you could use the following code to build the Fibonacci example with the docker flag set to true and a custom name for the generated ELF. This will generate a reproducible ELF file (with Docker) with the name fibonacci-elf:

use sp1_build::{build_program_with_args, BuildArgs};

fn main() {
    let args = BuildArgs {
        docker: true,
        elf_name: "fibonacci-elf".to_string(),
        ..Default::default()
    };
    build_program_with_args("../program", &args);
}

Proof Aggregation
Overview
SP1 supports proof aggregation and recursion, which allows you to verify an SP1 proof within SP1. Use cases include:

Reducing on-chain verification costs by aggregating multiple SP1 proofs into a single SP1 proof.
Proving logic that is split into multiple proofs, such as proving a statement about a rollup's state transition function by proving each block individually and aggregating these proofs to produce a final proof of a range of blocks.
For an example of how to use proof aggregation and recursion in SP1, refer to the aggregation example.

Note that to verify an SP1 proof inside SP1, you must generate a "compressed" SP1 proof (see Proof Types for more details).

When should SP1 proof aggregation be used?
Note that by itself, SP1 can already prove arbitrarily large programs by chunking the program's execution into multiple "shards" (contiguous batches of cycles) and generating proofs for each shard in parallel, and then recursively aggregating the proofs. Thus, aggregation is generally not necessary for most use-cases, as SP1's proving for large programs is already parallelized.

However, aggregation can be useful in two specific cases:

When your computation requires more than the zkVM's limited (~2GB) memory.
When you want to combine multiple SP1 proofs from different parties into a single proof to reduce on-chain verification costs.
Verifying Proofs inside the zkVM
To verify a proof inside the zkVM, you can use the sp1_zkvm::lib::verify::verify_sp1_proof function.

sp1_zkvm::lib::verify::verify_sp1_proof(vkey, public_values_digest);

You do not need to pass in the proof as input into the syscall, as the proof will automatically be read for the proof input stream by the prover.

Note that you must include the verify feature in your Cargo.toml for sp1-zkvm to be able to use the verify_proof function (like this).

Generating Proofs with Aggregation
To provide an existing proof as input to the SP1 zkVM, you can write a proof and verifying key to an SP1Stdin object, which is already used for all inputs to the zkVM.

// Generating proving key and verifying key.
let (input_pk, input_vk) = client.setup(PROOF_INPUT_ELF);
let (aggregation_pk, aggregation_vk) = client.setup(AGGREGATION_ELF);

// Generate a proof that will be recursively verified / aggregated. Note that we use the "compressed"
// proof type, which is necessary for aggregation.
let mut stdin = SP1Stdin::new();
let input_proof = client
    .prove(&input_pk, stdin)
    .compressed()
    .run()
    .expect("proving failed");

// Create a new stdin object to write the proof and the corresponding verifying key to.
let mut stdin = SP1Stdin::new();
stdin.write_proof(input_proof, input_vk);

// Generate a proof that will recursively verify / aggregate the input proof.
let aggregation_proof = client
    .prove(&aggregation_pk, stdin)
    .compressed()
    .run()
    .expect("proving failed");


Proof Aggregation in Mock Mode
By default in mock mode, SP1 will still verify "recursive" proofs inside of your program to check that they're valid.

If you wish to disable "recursive" proof verification in mock mode (ex. if your "recursive" proofs are also generated in mock mode), you can set the deferred_proof_verification flag to false on the ProverClient.

let client = ProverClient::builder().mock().build();

let (pk, vk) = client.setup(ELF);

let stdin = SP1Stdin::new();

let proof = client.prove(&pk, stdin).deferred_proof_verification(false).run().expect("proving failed");

Basics
All the methods needed for generating proofs are included in the sp1_sdk crate. Most importantly, you’ll use the ProverClient to set up the proving and verifying keys for your program. You can then use the execute, prove, and verify methods to run your program and generate and verify proofs.

Example: Fibonacci
To make this more concrete, let's walk through a simple example of generating a proof for a Fibonacci program inside the zkVM. The complete source code for the example is available here.

Embedding the Program's ELF File
First, specify the ELF file of the program for which you are generating the proof.

const ELF: &[u8] = include_elf!("fibonacci-program");
Setting Up the Logger
The sp1-sdk logger displays useful information such as program execution time as your script is running.

utils::setup_logger();
Providing Input for the Program
The input for the Fibonacci program is n, which specifies which Fibonacci number to calculate.

The program reads this input from SP1Stdin.

let n = 1000u32;

// The input stream that the program will read from using `sp1_zkvm::io::read`. Note that the
// types of the elements in the input stream must match the types being read in the program.
let mut stdin = SP1Stdin::new();
stdin.write(&n);
Initializing the ProverClient
Next, initialize the ProverClient, which is the interface for executing programs and generating and verifying proofs.

let client = ProverClient::from_env();
Executing the Program
First, we want to "execute" the Fibonacci program. Execution gives the estimated "proving cost" for generating a proof for the program as well as the "output" with the specified inputs, without needing to generate a computationally-intensive proof.

Using ProverClient.execute(), we pass the program (ELF) and the input to the program. Executing the program takes a fraction of the time of generating a proof of the program.

let (_, report) = client.execute(ELF, &stdin).run().unwrap();
println!("executed program with {} cycles", report.total_instruction_count());
Generating the Proof
Next, we'll generate a proof with the ProverClient.

Obtain the proving and verification key by calling ProverClient.setup() with the executable. These keys encode information about the program that the SP1 prover requires.

Then, call ProverClient::prove with the SP1ProvingKey and the input.

In this example, we are using a compressed proof type; more information on proof types can be found here.

let (pk, vk) = client.setup(ELF);
let mut proof = client.prove(&pk, &stdin).plonk().run().unwrap();
Reading the Public Values
After the proof generation is complete, you can read the public values from the proof. The public values bind a proof to a sub-set of the inputs of the program.

These values are read in the same order in which they are committed within the program with sp1_zkvm::io::commit or sp1_zkvm::io::commit_slice.

let _ = proof.public_values.read::<u32>();
let a = proof.public_values.read::<u32>();
let b = proof.public_values.read::<u32>();
Verifying the Proof
To verify a proof, use client.verify, providing the proof (which includes the public values) and the verification key as arguments.

client.verify(&proof, &vk).expect("verification failed");
This example can be run from the script directory with RUST_LOG=info cargo run --release.

Running the script will generate a proof locally.

Proof Types
There are a few different types of proofs that can be generated by the SP1 zkVM. Each proof type has its own tradeoffs in terms of proof generation time, verification cost, and proof size.

The ProverClient follows a "builder" pattern that allows you to configure the proof type and other options after creating a ProverClient and calling prove on it.

Core (Default)
The default prover mode generates a list of STARK proofs that in aggregate have size proportional to the size of the execution. Use this in settings where you don't care about verification cost / proof size.

let client = ProverClient::from_env();
client.prove(&pk, &stdin).run().unwrap();

Compressed
The compressed prover mode generates STARK proofs that have constant size. Use this in settings where you care about verification cost / proof size, but not onchain verification. Compressed proofs are also useful because they can be cheaply recursively verified within SP1 itself (see the proof aggregation section).

let client = ProverClient::from_env();
client.prove(&pk, &stdin).compressed().run().unwrap();

Groth16 (Recommended)
The Groth16 prover mode generates a SNARK proof that is ~260 bytes large and can be verified onchain for around ~270k gas.

The trusted setup for the Groth16 circuit keys uses the Aztec Ignition ceremony + entropy contributions from members of the Succinct team. If you are uncomfortable with the security assumptions of the ceremony, you can use the PLONK proof type instead.

let client = ProverClient::from_env();
client.prove(&pk, &stdin).groth16().run().unwrap();

PLONK
The PLONK prover mode generates a SNARK proof that is ~868 bytes large and can also be verified onchain for around ~300k gas. Plonk proofs take about ~1m30s longer to generate over a compressed proof.

PLONK does not require a trusted setup and reuses contributions from the Aztec Ignition ceremony.

let client = ProverClient::from_env();
client.prove(&pk, &stdin).plonk().run().unwrap();


Recommended Workflow
We recommend the following workflow for developing with SP1.

tip
For fast and parallelized proof generation, use the Succinct Prover Network.

Step 1: Iterate on your program with execution only
While iterating on your SP1 program, you should only execute it with the RISC-V runtime. This allows you to verify the correctness of your program and test the SP1Stdin and the SP1PublicValues returned, without having to generate a proof (which can be slow or expensive). If execution succeeds, then proof generation should succeed as well!

Source
let client = ProverClient::from_env();
let (mut public_values, execution_report) = client.execute(ELF, &stdin).run().unwrap();

// Print the total number of cycles executed and the full execution report with a breakdown of
// the RISC-V opcode and syscall counts.
println!(
    "Executed program with {} cycles",
    execution_report.total_instruction_count() + execution_report.total_syscall_count()
);
println!("Full execution report:\n{:?}", execution_report);
Note that printing the total number of executed cycles and the full execution report provides helpful insight into proof generation latency and cost—whether for local proving or when using the prover network.

Crate Setup: We recommend keeping the crate that defines the main function (wrapped with the sp1_zkvm::entrypoint! macro) minimal. Most of your business logic should reside in a separate crate (within the same repo/workspace), which can be tested independently and isn't tied to the SP1 zkVM. This allows you to unit test your logic without worrying about the zkvm compilation target and efficiently reuse types between your program crate and the crate responsible for proof generation.

Note: The ProverClient should be initialized once and reused for subsequent proving operations, rather than creating new instances each time. Initialization can be slow, as it involves loading proving parameters and setting up the environment. To share it across tasks, wrap the ProverClient in an Arc.

Step 2: Generate proofs
Once you’ve verified your program works correctly, you can generate proofs for end-to-end testing or production use.

Generate Proofs on the Prover Network [Recommended]
Using the Succinct Prover Network is generally faster, cheaper, and more scalable than local proving, as it parallelizes proof generation across many GPUs. Follow the network docs to get started. Using the prover network only requires adding one environment variable to a standard SP1 proof generation script with the ProverClient.

Local Proof Generation
To generate proofs locally, you can use the sp1_sdk crate, as outlined in the Basics section. By default, the ProverClient generates proofs locally using your CPU. See the hardware requirements for local proving here.


Hardware Acceleration
SP1 supports hardware acceleration through CUDA on Nvidia GPUs and AVX256/AVX512 on Intel x86 CPUs.

GPU Acceleration
SP1 supports GPU acceleration with CUDA, which can provide dramatically better latency and cost performance compared to using the CPU prover, even with AVX acceleration.

Software Requirements
Please make sure you have the following installed before using the CUDA prover:

CUDA 12
CUDA Container Toolkit
Hardware Requirements
CPU: We recommend having at least 4 CPU cores with 16GB of RAM available to fully utilize the GPU.
GPU: 24GB or more VRAM.
warning
SP1 supports GPUs with Compute Capability 8.6 or higher. You can find the compute capability for your GPU on this table in the NVIDIA documentation.

Usage
To use the CUDA prover, you have two options:

Use ProverClient::from_env to build the client and set the SP1_PROVER environment variable to cuda.
Use ProverClient::builder().cuda().build() to build the client.
Then, use your standard methods on the ProverClient to generate proofs.

Recommended Workflow
Currently, the CUDA prover relies on a Docker image that contains state, and only utilizes the 0th GPU.

In general, the best practice is to keep an instance of a ProverClient in an Arc as they have initialization overhead. However, as the CUDA prover is "single threaded", attempting to call the methods on the CUDA prover concurrently will cause unexpected behavior and attempting to initialize a CUDA prover twice in the same process (even if the previous one was dropped) will panic.

It is recommended to store an instance of a CUDA prover in an Arc<Mutex<_>> in order to avoid any issues.

CPU Acceleration
SP1 can achieve significant CPU performance improvements through AVX vector instruction extensions. Support for both AVX256 and AVX512 acceleration on Intel x86 CPUs is provided via Plonky3. For optimal performance, we recommend using AVX512 acceleration when your hardware supports it.

Checking for AVX Support
To verify if your CPU supports AVX, run:

grep avx /proc/cpuinfo

Look for the flags avx2 and avx512 in the output.

Enabling AVX256 Acceleration
To enable AVX256 acceleration, set the RUSTFLAGS environment variable:

RUSTFLAGS="-C target-cpu=native" cargo run --release

Enabling AVX512 Acceleration
For even better performance with AVX512, use:

RUSTFLAGS="-C target-cpu=native -C target-feature=+avx512f" cargo run --release

Note that the +avx512f flag is required to enable AVX512 acceleration.

Advanced
Embedded Allocator
SP1 programs use a simple bump allocator by default, which just increments a pointer to allocate memory. Although this works for many cases, some programs can still run out of memory in the SP1 zkVM. To address this, you can enable the embedded allocator feature on the SP1 zkVM.

The embedded allocator uses the embedded-alloc crate and offers more flexible memory management, albeit with extra cycle overhead.

To enable it, add the following to your sp1-zkvm dependency in Cargo.toml:

sp1-zkvm = { version = "...", features = ["embedded"] }

Once enabled, the embedded allocator replaces the default bump allocator.

Blake3 Public Values Hashing
important
This feature is supported on SP1 versions >= 4.2.0.

In certain verification contexts (e.g. Bitcoin script), verifying public values hashed with Blake3 is more efficient than verifying public values hashed with SHA-256.

To enable blake3 public values hashing for your program, enable the blake3 feature on the sp1-zkvm dependency in Cargo.toml:

sp1-zkvm = { version = "...", features = ["blake3"] }

The committed hash of the public values for your proof will be hashed with Blake3 instead of SHA-256.

warning
The official SP1 Solidity verifier does not yet support Blake3 public values, as it currently hardcodes the use of SHA-256.

Requesting Multiple Proofs in Parallel
If you're building an application that generates many proofs, you may want to parallelize proof generation for performance gains. There are two recommended approaches:

1. Using Threads and .prove
You can spawn multiple threads (or async tasks) and invoke .prove() on the NetworkProver in each. Each call will wait until the corresponding proof is available.

This approach is simple and doesn't require tracking proof state manually.

2. Using request_async and get_proof_status
Alternatively, you can use request_async() to fire off proof requests without blocking. This returns a proof_id immediately, which you can use to track the status of each request via get_proof_status(proof_id).

Example:

// Request a proof asynchronously and get the proof ID
let proof_id = network_prover
    .prove(&program_key, &stdin)
    .mode(proving_mode)
    .strategy(proving_strategy)
    .request_async()
    .await?;

// Later, poll for the status of the proof
let (status, proof) = network_prover
    .get_proof_status(&proof_id)
    .await?;

This method is more flexible and may be preferable if you're working with large proofs or want more control over request timing and batching.


Offchain Verification
Rust no_std Verification
You can verify SP1 Groth16 and Plonk proofs in no_std environments with sp1-verifier.

sp1-verifier is also patched to verify Groth16 and Plonk proofs within the SP1 zkVM, using bn254 precompiles. For an example of this, see the Groth16 Example.

Installation
Import the following dependency in your Cargo.toml:

sp1-verifier = {version = "4.0.0", default-features = false}

Usage
sp1-verifier's interface is very similar to the solidity verifier's. It exposes two public functions: Groth16Verifier::verify_proof and PlonkVerifier::verify_proof.

sp1-verifier also exposes the Groth16 and Plonk verifying keys as constants, GROTH16_VK_BYTES and PLONK_VK_BYTES. These keys correspond to the current SP1 version's official Groth16 and Plonk verifying keys, which are used for verifying proofs generated using docker or the prover network.

First, generate your Groth16 or PLONK proof with the SP1 SDK. See here for more information -- sp1-verifier and the solidity verifier expect inputs in the same format.

Next, verify the proof with sp1-verifier.

Source
#![no_main]
sp1_zkvm::entrypoint!(main);

use sp1_verifier::Groth16Verifier;

pub fn main() {
    // Read the proof, public values, and vkey hash from the input stream.
    let proof = sp1_zkvm::io::read_vec();
    let sp1_public_values = sp1_zkvm::io::read_vec();
    let sp1_vkey_hash: String = sp1_zkvm::io::read();

    // Verify the groth16 proof.
    let groth16_vk = *sp1_verifier::GROTH16_VK_BYTES;
    println!("cycle-tracker-start: verify");
    let result = Groth16Verifier::verify(&proof, &sp1_public_values, &sp1_vkey_hash, groth16_vk);
    println!("cycle-tracker-end: verify");

    match result {
        Ok(()) => {
            println!("Proof is valid");
        }
        Err(e) => {
            println!("Error verifying proof: {:?}", e);
        }
    }
}
Here, the proof, public inputs, and vkey hash are read from stdin. See the following snippet to see how these values are generated.

Source
//! A script that generates a Groth16 proof for the Fibonacci program, and verifies the
//! Groth16 proof in SP1.

use sp1_sdk::{include_elf, utils, HashableKey, ProverClient, SP1Stdin};

/// The ELF for the Groth16 verifier program.
const GROTH16_ELF: &[u8] = include_elf!("groth16-verifier-program");

/// The ELF for the Fibonacci program.
const FIBONACCI_ELF: &[u8] = include_elf!("fibonacci-program");

/// Generates the proof, public values, and vkey hash for the Fibonacci program in a format that
/// can be read by `sp1-verifier`.
///
/// Returns the proof bytes, public values, and vkey hash.
fn generate_fibonacci_proof() -> (Vec<u8>, Vec<u8>, String) {
    // Create an input stream and write '20' to it.
    let n = 20u32;

    // The input stream that the program will read from using `sp1_zkvm::io::read`. Note that the
    // types of the elements in the input stream must match the types being read in the program.
    let mut stdin = SP1Stdin::new();
    stdin.write(&n);

    // Create a `ProverClient`.
    let client = ProverClient::from_env();

    // Generate the groth16 proof for the Fibonacci program.
    let (pk, vk) = client.setup(FIBONACCI_ELF);
    println!("vk: {:?}", vk.bytes32());
    let proof = client.prove(&pk, &stdin).groth16().run().unwrap();
    (proof.bytes(), proof.public_values.to_vec(), vk.bytes32())
}

fn main() {
    // Setup logging.
    utils::setup_logger();

    // Generate the Fibonacci proof, public values, and vkey hash.
    let (fibonacci_proof, fibonacci_public_values, vk) = generate_fibonacci_proof();

    // Write the proof, public values, and vkey hash to the input stream.
    let mut stdin = SP1Stdin::new();
    stdin.write_vec(fibonacci_proof);
    stdin.write_vec(fibonacci_public_values);
    stdin.write(&vk);

    // Create a `ProverClient`.
    let client = ProverClient::from_env();

    // Execute the program using the `ProverClient.execute` method, without generating a proof.
    let (_, report) = client.execute(GROTH16_ELF, &stdin).run().unwrap();
    println!("executed groth16 program with {} cycles", report.total_instruction_count());
    println!("{}", report);
}
Note that the SP1 SDK itself is not no_std compatible.

Wasm Verification
The example-sp1-wasm-verifier demonstrates how to verify SP1 proofs in wasm. For a more detailed explanation of the process, please see the README.


Basics
In this section, we'll cover some of the basics of optimizing the performance of your SP1 programs, with a focus on improving the end to end costs.

Program Optimization
The first step to optimizing your program is to identify the performance bottlenecks. You can do this by profiling your application or using cycle tracking.
Compiling your program with different settings can yield better performance characteristics.
Set lto to thin, true, or fat to enable link-time optimization. This can yield significant performance improvements.
Set codegen-units to 1 to disable parallel codegen.
Avoid copying or de(serializing) data unnecessarily.
Cryptographic Acceleration
If your program makes heavy use of cryptographic primitives (SHA-256, Keccak, etc.), SP1 supports accelerated "precompiles" for these operations.

Follow the instructions here to use them.

Prover Acceleration
SP1 supports both GPU (with CUDA) and CPU (with AVX on Intel and ARM) hardware acceleration for proving.

I/O Optimizations
If your program makes heavy use of (de)serializing data, you can make use of the following techniques to optimize performance of input reading and output writing.

Zero-Copy (De)serialization
Rather than using write and read to serialize and deserialize data in the zkVM context (which invokes bincode serialization by default), you can use write_vec and read_slice to serialize and deserialize data in the zkVM context.

bincode is a popular serialization library for Rust, but it is not optimized for the zkVM context and can be CPU intensive. Generally, we recommend using write_vec and read_slice in combination with zero-copy deserialization libraries like rkyv.

For rkyv, you can use the #[derive(Archive, Serialize, Deserialize)] macro to automatically derive the Archive, Serialize, and Deserialize traits for your structs.

use rkyv::{Archive, Serialize, Deserialize};

#[derive(Archive, Serialize, Deserialize)]
struct MyStruct {
    field: u64,
}

You can then use rkyv::to_bytes to serialize your structs in your script and rkyv::from_bytes to deserialize them in your program.

use rkyv::rancor::Error;

let mut stdin = SP1Stdin::new();
let my_struct = MyStruct { field: 42 };
let bytes = rkyv::to_bytes::<Error>(&my_struct);

stdin.write_slice(&bytes);

use rkyv::rancor::Error;

let input = sp1_zkvm::io::read_vec();
let deserialized_struct = rkyv::from_bytes::<MyStruct, Error>(&input).unwrap();

Alternative Serialization Libraries
If rkyv is difficult to integrate with your codebase, you can benchmark alternative serialization libraries or derive your own de(serialization) logic for better I/O performance.


Precompiles
SP1's zkVM includes built-in precompiles for various cryptographic operations that dramatically reduce execution time and proving costs. These precompiles are specialized, highly-optimized circuits that execute directly within the zkVM.

To make these optimizations accessible, we provide "patched" versions of popular cryptography libraries. These patches automatically route operations through our precompiles, delivering significant performance improvements without requiring changes to your code besides adding the patched crate to your dependencies.

Patched Crates
If you know of a library or library version that you think should be patched, please open an SP1 issue!

Crate Name	Repository	Versions
sha2	sha2-v0-10-9 = { git = "https://github.com/sp1-patches/RustCrypto-hashes", package = "sha2", tag = "patch-sha2-0.10.9-sp1-4.0.0" }	0.9.9, 0.10.6, 0.10.8, 0.10.9
sha3	sha3-v0-10-8 = { git = "https://github.com/sp1-patches/RustCrypto-hashes", package = "sha3", tag = "patch-sha3-0.10.8-sp1-4.0.0" }	0.10.8
bigint	crypto-bigint = { git = "https://github.com/sp1-patches/RustCrypto-bigint", tag = "patch-0.5.5-sp1-4.0.0" }	0.5.5
tiny-keccak	tiny-keccak = { git = "https://github.com/sp1-patches/tiny-keccak", tag = "patch-2.0.2-sp1-4.0.0" }	2.0.2
curve25519-dalek	curve25519-dalek = { git = "https://github.com/sp1-patches/curve25519-dalek", tag = "patch-4.1.3-sp1-5.0.0" }	4.1.3
curve25519-dalek-ng	curve25519-dalek-ng = { git = "https://github.com/sp1-patches/curve25519-dalek-ng", tag = "patch-4.1.1-sp1-5.0.0" }	4.1.1
k256	k256 = { git = "https://github.com/sp1-patches/elliptic-curves", tag = "patch-k256-13.4-sp1-5.0.0" }	13.4
p256	p256 = { git = "https://github.com/sp1-patches/elliptic-curves", tag = "patch-p256-13.2-sp1-5.0.0" }	13.2
secp256k1	secp256k1 = { git = "https://github.com/sp1-patches/rust-secp256k1", tag = "patch-0.29.1-sp1-5.0.0" }	0.29.1, 0.30.0
substrate-bn	substrate-bn = { git = "https://github.com/sp1-patches/bn", tag = "patch-0.6.0-sp1-5.0.0" }	0.6.0
bls12_381	bls12_381 = { git = "https://github.com/sp1-patches/bls12_381", tag = "patch-0.8.0-sp1-5.0.0" }	0.8.0
rsa	rsa = { git = "https://github.com/sp1-patches/RustCrypto-RSA", tag = "patch-0.9.6-sp1-5.0.0" }	0.9.6
ecdsa	ecdsa = { git = "https://github.com/sp1-patches/signatures", tag = "patch-16.9-sp1-4.1.0" }	16.9
Using Patched Crates
To use the patched libraries, you can use corresponding patch entries in your program's Cargo.toml.

Ensure that you are using the correct patched version for your crate. For example, if you are using sha2 0.10.8, you should use the patch-sha2-0.10.8-sp1-4.0.0 tag. If you are using sha2 0.10.6, you should use the patch-sha2-0.10.6-sp1-4.0.0 tag.

The numbers following the sp1 in the patch tag refer to the minimum supported version of SP1 for this patch.

Caveats
K256/P256
K256 and P256 patches use a niche optimization in a patched version of ecsda that, in some cases, may require also patching the ecdsa crate yourself. Specifically it is required to patch ecdsa if you're depending on ecdsa directly from crates-io, and trying to use types from that dependency with the patched versions of k256 or p256.

ecdsa is reexported in both k256 and p256 normally, so it's recommended to use the reexport instead to avoid the extra patch when possible.

BLS12_381
In practice, some teams use the "latest" BLS12_381 on GitHub, and some use the one on crates.io. These versions are incompatible due to the them relying on different versions of the Digest crate.

For now we maintain two patches for bls12_381: The crates-io version with tag: patch-bls12_381-0.8.0-sp1-5.0.0, and the GitHub version with tag: patch-bls12_381-0.8.0-sp1-5.0.0-v2.

The latter has the newer Digest version.

Patching crates.io Dependencies
To patch p256 13.2, you can add the following to your Cargo.toml:

[dependencies]
p256 = "=13.2"

[patch.crates-io]
p256 = { git = "https://github.com/sp1-patches/elliptic-curves", package = "p256", tag = "patch-p256-13.2-sp1-4.1.0"  }


Patching GitHub Dependencies
To patch p256 from GitHub, you need to specify the repository in the patch section. For example:

[dependencies]
p256 = { git = "https://github.com/sp1-patches/elliptic-curves", package = "p256" }

[patch."https://github.com/sp1-patches/elliptic-curves"]
p256 = { git = "https://github.com/sp1-patches/elliptic-curves", package = "p256", tag = "patch-p256-13.2-sp1-4.1.0"  }


Confirming Patch Usage
To confirm that the patch is being applied, you can use the following command:

cargo tree -p p256

Next to the package name, it should have a link to the Github repository that you patched with:

p256 v13.2 (https://github.com/sp1-patches/elliptic-curves?tag=patch-p256-13.2-sp1-4.1.0)
├── ...

If you see multiple versions of the same crate or the patch has not applied, you can try updating the crate manually to use the version matching the patch tag:

cargo update -p p256 --precise 13.2

Example Usage in Programs
SP1 Blobstream and OP Succinct demonstrate how to use the patched crates in a program.

KZG Acceleration
We built an pure Rust alternative to c-kzg: kzg-rs, that relies on our patched bls12_381 crate to significantly improves the performance of KZG operations.

You can enable it on revm with the kzg-rs feature.

Troubleshooting
Verifying Patch Application: Cargo
You can check if the patch was applied by using cargo's tree command to print the dependencies of the crate you patched.

cargo tree -p sha2@0.10.8

Next to the package name, it should have a link to the Github repository that you patched with.

Ex.

sha2 v0.10.8 (https://github.com/sp1-patches/RustCrypto-hashes?tag=patch-sha2-0.10.8-sp1-4.0.0)
├── ...

Verifying Patch Usage during Program Execution
To check if a precompile is used during the execution of your program with specific inputs, you can view SP1's ExecutionReport, which is returned when executing a program with execute. In ExecutionReport you can view the syscall_counts map to view if a specific syscall was used.

For example, if you wanted to check sha256 was used, you would look for SHA_EXTEND and SHA_COMPRESS in syscall_counts.

An example of this is available in our Patch Testing Example.

Cargo Version Issues
If you encounter issues with version commits on your patches, you should try updating the patched crate manually.

cargo update -p <patch-crate-name>

If you encounter issues relating to cargo / git, you can try setting CARGO_NET_GIT_FETCH_WITH_CLI:

CARGO_NET_GIT_FETCH_WITH_CLI=true cargo update -p <patch-crate-name>

You can permanently set this value in ~/.cargo/config:

[net]
git-fetch-with-cli = true


Precompile Specification
Precompiles are built into the SP1 zkVM and accelerate commonly used operations such as elliptic curve arithmetic and hashing. Under the hood, precompiles are implemented as custom STARK tables dedicated to proving one or few operations. They typically improve the performance of executing expensive operations in SP1 by a few orders of magnitude.

Inside the zkVM, precompiles are exposed as system calls executed through the ecall RISC-V instruction. Each precompile has a unique system call number and implements an interface for the computation.

SP1 also has been designed specifically to make it easy for external contributors to create and extend the zkVM with their own precompiles. To learn more about this, you can look at implementations of existing precompiles in the precompiles folder. More documentation on this will be coming soon.

To use precompiles, we typically recommend you interact with them through patches, which are crates modified to use these precompiles under the hood, without requiring you to call system calls directly.

System Calls
If you are an advanced user you can interact with the precompiles directly using external system calls.

Here is a list of all available system calls & precompiles.

Source
//! Syscalls for the SP1 zkVM.
//!
//! Documentation for these syscalls can be found in the zkVM entrypoint
//! `sp1_zkvm::syscalls` module.

pub mod bls12381;
pub mod bn254;

#[cfg(feature = "ecdsa")]
pub mod ecdsa;

pub mod ed25519;
pub mod io;
pub mod secp256k1;
pub mod secp256r1;
pub mod unconstrained;
pub mod utils;

#[cfg(feature = "verify")]
pub mod verify;

extern "C" {
    /// Halts the program with the given exit code.
    pub fn syscall_halt(exit_code: u8) -> !;

    /// Writes the bytes in the given buffer to the given file descriptor.
    pub fn syscall_write(fd: u32, write_buf: *const u8, nbytes: usize);

    /// Reads the bytes from the given file descriptor into the given buffer.
    pub fn syscall_read(fd: u32, read_buf: *mut u8, nbytes: usize);

    /// Executes the SHA-256 extend operation on the given word array.
    pub fn syscall_sha256_extend(w: *mut [u32; 64]);

    /// Executes the SHA-256 compress operation on the given word array and a given state.
    pub fn syscall_sha256_compress(w: *mut [u32; 64], state: *mut [u32; 8]);

    /// Executes an Ed25519 curve addition on the given points.
    pub fn syscall_ed_add(p: *mut [u32; 16], q: *const [u32; 16]);

    /// Executes an Ed25519 curve decompression on the given point.
    pub fn syscall_ed_decompress(point: &mut [u8; 64]);

    /// Executes an Sepc256k1 curve addition on the given points.
    pub fn syscall_secp256k1_add(p: *mut [u32; 16], q: *const [u32; 16]);

    /// Executes an Secp256k1 curve doubling on the given point.
    pub fn syscall_secp256k1_double(p: *mut [u32; 16]);

    /// Executes an Secp256k1 curve decompression on the given point.
    pub fn syscall_secp256k1_decompress(point: &mut [u8; 64], is_odd: bool);

    /// Executes an Secp256r1 curve addition on the given points.
    pub fn syscall_secp256r1_add(p: *mut [u32; 16], q: *const [u32; 16]);

    /// Executes an Secp256r1 curve doubling on the given point.
    pub fn syscall_secp256r1_double(p: *mut [u32; 16]);

    /// Executes an Secp256r1 curve decompression on the given point.
    pub fn syscall_secp256r1_decompress(point: &mut [u8; 64], is_odd: bool);

    /// Executes a Bn254 curve addition on the given points.
    pub fn syscall_bn254_add(p: *mut [u32; 16], q: *const [u32; 16]);

    /// Executes a Bn254 curve doubling on the given point.
    pub fn syscall_bn254_double(p: *mut [u32; 16]);

    /// Executes a BLS12-381 curve addition on the given points.
    pub fn syscall_bls12381_add(p: *mut [u32; 24], q: *const [u32; 24]);

    /// Executes a BLS12-381 curve doubling on the given point.
    pub fn syscall_bls12381_double(p: *mut [u32; 24]);

    /// Executes the Keccak-256 permutation on the given state.
    pub fn syscall_keccak_permute(state: *mut [u64; 25]);

    /// Executes an uint256 multiplication on the given inputs.
    pub fn syscall_uint256_mulmod(x: *mut [u32; 8], y: *const [u32; 8]);

    /// Executes a 256-bit by 2048-bit multiplication on the given inputs.
    pub fn syscall_u256x2048_mul(
        x: *const [u32; 8],
        y: *const [u32; 64],
        lo: *mut [u32; 64],
        hi: *mut [u32; 8],
    );
    /// Enters unconstrained mode.
    pub fn syscall_enter_unconstrained() -> bool;

    /// Exits unconstrained mode.
    pub fn syscall_exit_unconstrained();

    /// Defers the verification of a valid SP1 zkVM proof.
    pub fn syscall_verify_sp1_proof(vk_digest: &[u32; 8], pv_digest: &[u8; 32]);

    /// Returns the length of the next element in the hint stream.
    pub fn syscall_hint_len() -> usize;

    /// Reads the next element in the hint stream into the given buffer.
    pub fn syscall_hint_read(ptr: *mut u8, len: usize);

    /// Allocates a buffer aligned to the given alignment.
    pub fn sys_alloc_aligned(bytes: usize, align: usize) -> *mut u8;

    /// Decompresses a BLS12-381 point.
    pub fn syscall_bls12381_decompress(point: &mut [u8; 96], is_odd: bool);

    /// Computes a big integer operation with a modulus.
    pub fn sys_bigint(
        result: *mut [u32; 8],
        op: u32,
        x: *const [u32; 8],
        y: *const [u32; 8],
        modulus: *const [u32; 8],
    );

    /// Executes a BLS12-381 field addition on the given inputs.
    pub fn syscall_bls12381_fp_addmod(p: *mut u32, q: *const u32);

    /// Executes a BLS12-381 field subtraction on the given inputs.
    pub fn syscall_bls12381_fp_submod(p: *mut u32, q: *const u32);

    /// Executes a BLS12-381 field multiplication on the given inputs.
    pub fn syscall_bls12381_fp_mulmod(p: *mut u32, q: *const u32);

    /// Executes a BLS12-381 Fp2 addition on the given inputs.
    pub fn syscall_bls12381_fp2_addmod(p: *mut u32, q: *const u32);

    /// Executes a BLS12-381 Fp2 subtraction on the given inputs.
    pub fn syscall_bls12381_fp2_submod(p: *mut u32, q: *const u32);

    /// Executes a BLS12-381 Fp2 multiplication on the given inputs.
    pub fn syscall_bls12381_fp2_mulmod(p: *mut u32, q: *const u32);

    /// Executes a BN254 field addition on the given inputs.
    pub fn syscall_bn254_fp_addmod(p: *mut u32, q: *const u32);

    /// Executes a BN254 field subtraction on the given inputs.
    pub fn syscall_bn254_fp_submod(p: *mut u32, q: *const u32);

    /// Executes a BN254 field multiplication on the given inputs.
    pub fn syscall_bn254_fp_mulmod(p: *mut u32, q: *const u32);

    /// Executes a BN254 Fp2 addition on the given inputs.
    pub fn syscall_bn254_fp2_addmod(p: *mut u32, q: *const u32);

    /// Executes a BN254 Fp2 subtraction on the given inputs.
    pub fn syscall_bn254_fp2_submod(p: *mut u32, q: *const u32);

    /// Executes a BN254 Fp2 multiplication on the given inputs.
    pub fn syscall_bn254_fp2_mulmod(p: *mut u32, q: *const u32);

    /// Reads a buffer from the input stream.
    pub fn read_vec_raw() -> ReadVecResult;
}

#[repr(C)]
pub struct ReadVecResult {
    pub ptr: *mut u8,
    pub len: usize,
    pub capacity: usize,
}


Prover Gas
Overview
Prover gas is a more accurate metric for estimating the real proving "costs" of an SP1 program introduced in versions >= 4.1.4. The metric incorporates RISC-V cycle count and the different cost profiles of precompiles to help developers profile estimated proving cost with much greater accuracy when executing programs.

Usage
When calling ProverClient::execute(), the executor will track the prover gas used for the program. The ExecutionReport returned by the ProverClient::execute() method contains the prover gas used for the execution of the program.

Prover gas has been roughly calibrated to be of a similar magnitude to RISC-V cycle count.

let client = ProverClient::from_env();
let (_, report) = client.execute(ELF, &stdin).run().unwrap();
let prover_gas = report.gas.unwrap_or(0);

note
Cycle tracking is the best way to profile components of your program for their proving cost. Prover gas is a more accurate metric for estimating the proving cost of a program, but is only availableonce the full program has been executed.

Methodology
Existing Metric: RISC-V Cycle Count
Historically, developers have used the RISC-V cycle count of a program as a proxy for its work. Cycle counts have several benefits: the cycle count is easily computable during the execution step of the zkVM, which runs through the program’s RISC-V instructions in sequence. SP1 already allows developers to easily measure cycle counts during development.

However, cycle counts are not a perfect proxy for the work required to generate a proof.

For example, consider the following figure comparing prover gas to cycle count across a variety of programs, from simple programs like Loop and Fibonacci to more complex ones like ECDSA recovery and Tendermint consensus verification:

Prover Time vs RISC-V Cycles

This analysis shows several interesting features. Two programs of the same cycle counts may require significantly different proving times. For example, although keccak256-300kb constitutes more cycles (at approximately 5.6 million cycles) than ECDSA recovery (at approximately 4.4 million cycles), ECDSA recovery takes more than twice the amount of proving time. Further, we observe “clusters” of programs have their own scaling laws in proving time; Keccak and Reth, for example, require increased proving time for their cycle counts than other programs of similar size. These examples illustrate the need for a more reliable measure of work for developers that better predicts proving costs.

New Metric: Prover Gas
Prover gas effectively predicts real GPU proving time across a range of programs, giving developers a single, reliable metric which they can use to profile their programs end to end. The below figure shows the efficacy of this metric for the previously considered programs. Importantly, there are no clustering effects and programs of similar prover gas do not have dramatically different proving times. This fit allows developers to use prover gas as a proxy for real costs they face while proving.

Prover Time vs Prover Gas

Technical Implementation
In SP1, proving a program’s execution is done in several stages. There is a core stage where the program’s execution is broken up into sections called shards each of which are proven alone. In the recursion stage, pairs of shards have their proofs and initial and final program states verified. This procedure itself is a program that is proved, and the process continues until we finally have one proof for the whole program execution.

Prover gas is based around a model to predict the proving time for each core shard. The model uses linear regression to predict core GPU time given the shape of the core shard. The shape consists of two values for each chip: the padded height of its trace and the base 2 logarithm of this quantity. While proving, these shapes are determined by the traces by padding each chip’s trace so the collection of trace heights for each chip is “allowed.” For cryptographic reasons, SP1 V4 comes with a large collection of “allowed” shapes, which each shard must match to proceed to the next proving stage.

The predictions for each core shard are summed up and transformed with a scaling factor to compute the prover gas. The model is fit to a dataset composed of a wide range of shards and their core GPU times.


Cycle Tracking
When writing a program, it is useful to know how many RISC-V cycles a portion of the program takes to identify potential performance bottlenecks. SP1 provides a way to track the number of cycles spent in a portion of the program.

Tracking Cycles
Using Print Annotations
For simple debugging, use these annotations to log cycle counts to stdout:

#![no_main]
sp1_zkvm::entrypoint!(main);

fn main() {
     let mut nums = vec![1, 1];

     // Compute the sum of the numbers.
     println!("cycle-tracker-start: compute");
     let sum: u64 = nums.iter().sum();
     println!("cycle-tracker-end: compute");
}

With this code, you will see output like the following in your logs:

[INFO] compute: 1234 cycles

Using Report Annotations
To store cycle counts across multiple invocations in the ExecutionReport, use the report annotations:

#![no_main]
sp1_zkvm::entrypoint!(main);

fn main() {
    // Track cycles across multiple computations
    for i in 0..10 {
        println!("cycle-tracker-report-start: compute");
        expensive_computation(i);
        println!("cycle-tracker-report-end: compute");
    }
}


Access total cycles from all invocations:

let report = client.execute(ELF, &stdin).run().unwrap();
let total_compute_cycles = report.cycle_tracker.get("compute").unwrap();

Access the number of invocations for cycle-tracker-report-* in the program:

let compute_invocation_count = report.invocation_tracker.get("compute").unwrap();

Using the Cycle Tracker Macro
Add sp1-derive to your dependencies:

sp1-derive = "4.0.0"

Then annotate your functions:

#[sp1_derive::cycle_tracker]
pub fn expensive_function(x: usize) -> usize {
    let mut y = 1;
    for _ in 0..100 {
        y *= x;
        y %= 7919;
    }
    y
}


Profiling
Profiling a zkVM program produces a useful visualization (example profile) which makes it easy to examine program performance and see exactly where VM cycles are being spent without needing to modify the program at all.

To profile a program, you need to:

Enable the profiling feature for sp1-sdk in script/Cargo.toml
Set the env variable TRACE_FILE=trace.json and then call ProverClient::execute() in your script.
If you're executing a larger program (>100M cycles), you should set TRACE_SAMPLE_RATE to reduce the size of the trace file. A sample rate of 1000 means that 1 in every 1000 VM cycles is sampled. By default, every cycle is sampled.

Many examples can be found in the repo, such as this 'fibonacci' script.

Once you have your script it should look like the following:

    // Execute the program using the `ProverClient.execute` method, without generating a proof.
    let (_, report) = client.execute(ELF, &stdin).run().unwrap();

As well you must enable the profiling feature on the SDK:

    sp1-sdk = { version = "4.0.0", features = ["profiling"] }

The TRACE_FILE env var tells the executor where to save the profile, and the TRACE_SAMPLE_RATE env var tells the executor how often to sample the program. A larger sample rate will give you a smaller profile, it is the number of instructions in between each sample.

The full command to profile should look something like this

    TRACE_FILE=output.json TRACE_SAMPLE_RATE=100 cargo run ...

To view these profiles, we recommend Samply.

    cargo install --locked samply
    samply load output.json

Samply uses the Firefox profiler to create a nice visualization of your programs execution. An example screenshot of the Firefox Profiler

Interpreting the Profile
The "time" measurement in the profiler is actually the number of cycles spent, in general the less cycles for a given callframe the better.

The CPU usage of the program will always be constant, as its running in the VM which is single threaded.


Developers
This is a step-by-step guide to help you get started with the Succinct Prover Network, an open, permissionless protocol composed of a distributed network of provers that can generate proofs of any size quickly and reliably.

warning
There are currently two deployments of the Succinct Prover Network:

Hosted Testnet: Ideal for developers seeking stable, production-ready uptime.
Sepolia Testnet: Best suited for experimental users exploring a decentralized version of the network.
This section focuses on using the Hosted Testnet. Documentation for the Sepolia Testnet will be available soon.

Why Use the Succinct Prover Network?
The Succinct Prover Network offers a powerful way to generate proofs without managing complex proving infrastructure yourself. For most developers, we strongly recommend using the prover network over local proving.

Minimal Setup: No need to set up high-performance instances, configure GPU drivers, or manage complex CUDA environments—all hardware requirements are handled for you
Cost Efficiency: Benefit from economies of scale by utilizing our existing fleet of optimized proving instances
Enhanced Latency: Experience faster proving times through our architecture that parallelizes work across dozens of GPUs
Dynamic Scalability: Scale effortlessly as our network automatically provisions additional resources based on your demand
Advanced Hardware Access: Use cutting-edge GPU hardware that's typically unavailable on local machines or standard cloud providers
Before you begin
Before diving into the Succinct Prover Network, make sure you have a basic understanding of zero-knowledge proofs and have installed the necessary dependencies. The following resources will help you get started:


Key Setup
The Succinct Network uses Secp256k1 keypairs for authentication, similar to Ethereum wallets. You may generate a new keypair explicitly for use with the prover network, or use an existing keypair.

Foundry
Generate a Public Key
Prover network keypair credentials can be generated using the cast CLI tool.

First install Foundry:

curl -L https://foundry.paradigm.xyz | bash

Upon running this command, you will be prompted to source your shell profile and run foundryup. Afterwards you should have access to the cast command. Then, use cast to generate a new keypair:

cast wallet new

which will give you an output similar to this:

Successfully created new keypair.
Address:     0x7594cF2161dC345B300A5Ac87e2473c7bF25D9fe
Private key: <PRIVATE_KEY>

When interacting with the network, you will set your NETWORK_PRIVATE_KEY environment variable to this value.

Retrieve an Existing Key
If you already have an existing key you would like to use, you can also use cast retrieve your address:

cast wallet address --private-key $PRIVATE_KEY

Metamask
These instructions will guide you through the process of creating a new wallet in Metamask and exporting the private key. This process should work for also any other Ethereum wallet.

Create a New Wallet
Install the Metamask browser extension and follow the setup process
Click on the Metamask extension icon, select the top arrow bar, and select "Add account or hardware wallet" and "Add a new Ethereum account". Name the account to your liking.
Export Private Key
To export your private key from Metamask:

Click on the Metamask extension icon
Click the three vertical dots menu (⋮)
Select "Account details"
Click "Show private key"
Enter your Metamask password when prompted
Copy the displayed private key
When interacting with the network, you will set your NETWORK_PRIVATE_KEY environment variable to this exported private key.


Deposit USDC
Learn how to pay for proofs on the prover network using USDC.

warning
There are currently two deployments of the Succinct Prover Network:

Hosted Testnet: Ideal for developers seeking stable, production-ready uptime.
Sepolia Testnet: Best suited for experimental users exploring a decentralized version of the network.
This section focuses on using the Hosted Testnet which uses USDC for payments.

tip
Complete this form to receive free development credits for SP1. This is for developers only, and is unrelated to the testnet.

The depsoit contract acts as a secure and permissionless way to deposit USDC into the Succinct Prover Network. To make a deposit, follow these steps:

Visit the Succinct Prover Network explorer, connect your wallet, and switch to the right network.
Navigate to the Account page and click "Deposit".
Enter the amount of USDC you would like to deposit, and sign two transactions. The first transaction is a Permit signature (EIP-2612) to approve USDC spending. The second is a deposit transaction to complete the deposit.
Once the transfer is complete, the amount will be deducted from your wallet and will appear in your balance in the network. This process should only take a few seconds.
The network currently does not support withdrawals. If you have any questions or run into any issues, please reach out to us.

Getting USDC on Ethereum Mainnet
If you do not have USDC on Ethereum Mainnet, choose from several options to acquire some:

🔄 Bridge from L2s
Get USDC on Ethereum Mainnet by bridging from a Layer 2:

Across Protocol
💱 Swap on Uniswap
Exchange other tokens for USDC directly on Ethereum Mainnet:

Uniswap
🏦 CEX Direct Transfer
Withdraw USDC directly to Ethereum Mainnet from exchanges:

Coinbase
Binance
OKX


Request Proofs
This guide will walk you through requesting proofs on the Succinct Network, from setup to execution.

warning
There are currently two deployments of the Succinct Prover Network:

Hosted Testnet: Ideal for developers seeking stable, production-ready uptime.
Sepolia Testnet: Best suited for experimental users exploring a decentralized version of the network.
This section focuses on using the Hosted Testnet, which is well-supported across all versions of SP1.

tip
Complete this form to receive free development credits for SP1. This is for developers only, and is unrelated to the testnet.

Prerequisites
Before you begin, ensure you have:

Installed SP1 (Installation Guide)
Created an SP1 Project (Quickstart Guide)
USDC tokens for paying proof fees (from Step 2)
Quickstart
Want to generate your first proof ASAP? Follow these steps:

Create a new project
cargo prove new --bare fibonacci

Set up your environment
export SP1_PROVER=network
export NETWORK_PRIVATE_KEY=<YOUR_PRIVATE_KEY>
export NETWORK_RPC_URL=https://rpc.production.succinct.xyz

Request your proof
cd fibonacci/script
RUST_LOG=info cargo run --release --bin main

Using the SP1 SDK
1. Setup
The first step to requesting the generation of SP1 proofs on the network is creating a properly configured ProverClient. This client is used to construct a proof request and submit it to the network.

Option A: ProverClient::from_env. Creating the client is as simple as calling ProverClient::from_env(). This function will automatically load the following environment variables:

SP1_PROVER: The prover to use. This should be set to network.
NETWORK_PRIVATE_KEY: The private key of the account that will be used to pay for the proof request.
NETWORK_RPC_URL: The RPC URL of the network to use. This should be set to https://rpc.production.succinct.xyz.
use sp1_prover::ProverClient;

let client = ProverClient::from_env().expect("failed to create client");

SP1_PROVER=network NETWORK_PRIVATE_KEY=... RUST_LOG=info cargo run --release

Option B: ProverClient::network. You can also create a client by calling ProverClient::network. This function will also automatically load the same environment variables as ProverClient::from_env. However, it will also expose additional methods for configuring these options directly on the client.

use sp1_sdk::{ProverClient};

let prover = ProverClient::builder().network()
    .private_key("<YOUR_PRIVATE_KEY>")
    .build();

2. Request
Requesting proofs is as simple calling client.prove and configuring the proof request.

use sp1_sdk::{ProverClient, SP1Stdin, Prover};

let elf = include_elf!("fibonacci");
let stdin = SP1Stdin::new();

let client = ProverClient::builder().network().build();
let (pk, vk) = client.setup(elf);
let builder = client.prove(&pk, &stdin)
    .core()
    .run();

Invoke the binary using cargo and set the environment variables:

export SP1_PROVER=network
export NETWORK_PRIVATE_KEY=<YOUR_PRIVATE_KEY>
export NETWORK_RPC_URL=https://rpc.production.succinct.xyz
cargo run --release --bin main

The output will look like this:

2025-01-08T01:43:40.903816Z  INFO vk verification: true
n: 20
2025-01-08T01:43:45.520140Z  INFO Registered program 0x0063663599d710a4f0b5cf9c426677e02c6b4492f9e6f7b2f64044c39759faa6    
2025-01-08T01:43:45.522999Z  INFO execute: clk = 0 pc = 0x2016e0    
2025-01-08T01:43:45.524025Z  INFO execute: close time.busy=3.81ms time.idle=5.88µs
2025-01-08T01:43:45.524114Z  INFO Requesting proof:    
2025-01-08T01:43:45.524127Z  INFO ├─ Cycle limit: 9221    
2025-01-08T01:43:45.524132Z  INFO ├─ Proof mode: Core    
2025-01-08T01:43:45.524138Z  INFO ├─ Strategy: Hosted    
2025-01-08T01:43:45.524143Z  INFO ├─ Timeout: 14400 seconds    
2025-01-08T01:43:45.524149Z  INFO └─ Circuit version: v4.0.0-rc.3    
2025-01-08T01:43:47.105244Z  INFO Created request 0x7647102964f2c8116637472379dc8d427a4b267089fe961074bc223a7c4833dd in transaction 0x07e846999adf6edcfa885638d23c35b54c3caa2c40be51223ee7d1faef6b1543    
2025-01-08T01:43:47.503440Z  INFO Proof request assigned, proving...    
Successfully generated proof!
2025-01-08T01:44:00.448830Z  INFO verify: close time.busy=200ms time.idle=4.04µs
Successfully verified proof!


3. View Status
You can view your proof and other running proofs on the explorer. The page for your proof will show details such as the stage of your proof, the cycles used and the verification key associated with your program.

Screenshot from testnet.succinct.xyz/explorer showing the details of a proof.

Common Issues
Insufficient Funds
When requesting proofs, you may encounter errors related to insufficient funds. This happens when your account doesn't have enough USDC to pay for the proof generation.

Error: Insufficient funds for proof request

To resolve this:

Check your balance on the Succinct Network using the Explorer
Deposit more funds to your account using the Account UI
Wait for the deposit transaction to complete before retrying
Invalid Private Key
If you see an error about an invalid private key, ensure that:

Your private key is properly formatted (starts with "0x" and is 64 characters long)
The environment variable is correctly set: export NETWORK_PRIVATE_KEY=0x...
The account associated with this private key has funds
Network Connection Issues
If you encounter RPC connection errors:

Error: Failed to connect to RPC endpoint

Try the following:

Verify your internet connection
Ensure the NETWORK_RPC_URL is correct
Check if the Succinct Network status page reports any outages
Try using a different RPC endpoint if available
Program Registration Failures
When registering your program, you might see:

Error: Failed to register program

Common causes include:

Invalid ELF binary format
Program size exceeds limits
Network connectivity issues
Insufficient funds for registration
Try rebuilding your project with cargo clean && cargo build --release before retrying.


Contract Addresses
warning
There are currently two deployments of the Succinct Prover Network:

Hosted Testnet: Ideal for developers seeking stable, production-ready uptime.
Sepolia Testnet: Best suited for experimental users exploring a decentralized version of the network.
This section focuses on contract addresses for the Hosted Testnet.

Bridge Contracts
Network	Contract	Address
Mainnet	Bridge Contract	0x4F3B8E16A5BF2E5A4c6622B1e0A77C4B912dD69
Sepolia	Staking Contract	0x8F1B4633630b90C273E834C14924298ab6D1DA02
Sepolia	PROVE Contract	0x42B70A4b8987dF89f363EF7357fB9950f065899F
Verifiers
The contract addresses for the on-chain verifier contracts are listed here.


TEE Two-Factor Authentication
The Succinct Prover Network supports a two-factor authentication feature known as SP1-2FA that provides a second layer of verification for SP1 proofs through Trusted Execution Environments (TEEs). It is currently powered by the AWS Nitro enclave system.

How It Works
SP1-2FA leverages two independent verification paths to ensure maximal safety for users of SP1:

Standard ZK Path: The SP1 RISC-V zkVM generates zero-knowledge proofs of the given bytecode and inputs.
TEE Execution Path: The same program and inputs run in "execution mode" inside the SP1 RISC-V emulator within a secure hardware enclave, which produces a verifiable attestation over the outputs.
These two paths produce public outputs that are cross-referenced. The onchain verifier checks both the ZK proof and the TEE attestation, ensuring they match. This provides protection against potential vulnerabilities in SP1 itself.

Usage
Adding SP1-2FA powered by TEEs to your application requires minimal changes:

use sp1_sdk::{Prover, ProverClient, TEEProof};

// Initialize the prover using the network.
let prover = ProverClient::builder().network().build();

// Setup your program.
let (pk, vk) = prover.setup(ELF);

// Generate a proof with TEE attestation.
let proof = prover
    .prove(&pk, &stdin)
    .tee_2fa()  // Enable SP1-2FA.
    .plonk()
    .await
    .unwrap();

// Make sure the proof with the TEE signature + ZK proof verifies.
assert!(prover.verify(&proof, &vk).is_ok());

For a more comprehensive end-to-end example of generating and verifying TEE-protected proofs, see the Fibonacci example in the canonical SP1 TEE repository.

Onchain Verification
To verify SP1-2FA proofs onchain, you need to use the SP1TEEVerifier contract that verifies both the Groth16/PLONK proof and TEE signatures. The SP1TEEVerifier follows the ISP1Verifier interface, so existing users just need to point their verifier address to a new contract to switch to SP1-2FA.

This change enforces TEE 2FA on all proofs to your contract.

To simplify contract management, we've deployed new canonical verifier gateways for SP1-2FA for TEE + Groth16 and TEE + PLONK. Each canonical verifier gateway has different security properties, which is why they're maintained as separate addresses.

You can find the contract addresses and supported chains for the canonical SP1-2FA verifier gateways here.

Verifying Attestations
SP1-2FA TEEs produce attestations that commit to both the signing key and the source code used in the enclave. While it would be ideal to verify these attestations directly onchain, they are too large and expensive to validate in that context.

Instead, SP1-2FA relies on a trusted admin to verify attestations and whitelist signing keys onchain. Anyone can independently verify attestations after the fact to gain confidence that the keys are truly secure in the TEE, as attestations bind to the "program" being run inside of the TEE. Users can see that the signing key for the attestation is generated as a part of the program, and can't be extracted. You can find the verification script here.

To run the verify script, clone the sp1-tee repository and rebuild the enclave image locally to get the "program measurement", which is a commitment to the source code running inside the TEE.

Building the image requires you to install the nitro-cli. It is recommended to do this on an Amazon Linux 2023 EC2 instance to avoid having to install AWS dependencies manually.

cd sp1-tee
docker build -t sp1-tee .
nitro-cli build-enclave --docker-uri sp1-tee:latest --output-file sp1-tee.eif
nitro-cli describe-eif --eif-path sp1-tee.eif

The above will output the measurments in a JSON like object:

{
    "Measurements": {
        "HashAlgorithm": "Sha384 { ... }",
        "PCR0": "...",
        "PCR1": "...",
        "PCR2": "..."
      },
}

To validate all the signers on some given verifier contract, run this command:

$ cargo run --bin validate_signers --features production -- contract \
    <contract_address> --pcr0 <...> --rpc-url <...> --version <...>

To verify an individual signer:

$ cargo --bin validate_signers --features production -- signer \
    <address> --pcr0 <...> --version <...>

The version may be found in the sp1_sdk:

use sp1_sdk::network::tee::SP1_TEE_VERSION;

The validation code can be used as a library as well by importing the functionality from here.

Security Model
The TEE 2FA protocol relies on a trusted admin to honestly verify attestations and correctly whitelist signers.

When using the SP1 proving system alone, if someone had the ability to generate a malicious proof, then they could lie about any statement. Compared to the TEE 2FA model, they must also compromise the admin.

The assumption goes both ways, if only the admin were to be compromised, as long as you're using the SP1TeeVerifier they cannot verify a "false proof" without also compromising the SP1 proof system.

In future iterations, verifying attestations on-chain can remove the trust assumptions from the admin.

Further Resources
SP1-2FA Security Audit by Zellic
SP1-2FA Repository


FAQ
tip
For organizations prioritizing security, minimum latency, and proving at scale, please get in touch. In other words if you're interested in volume-based discounts, latency-optimized proving, and uptime / latency SLAs, let's talk.

Latency-Optimized Proving
The prover network currently parallelizes proof generation across multiple machines. As a result, proof latency does not scale linearly with prover gas units. Proving times are a function of both the prover gas units, and the number of machines utilized for proof generation.

Benchmarking latency-sensitive apps on the default prover endpoint is suboptimal for various reasons. For accurate results or production use, contract us to set up a latency-optimized environment.

Note: if you are currently using GPU acceleration, keep in mind it operates on a single GPU. The only way to have distributed and parallelized proof generation is through the prover network.

Succinct Prover Network Costs
Proof generation costs are currently tied to the amount of resources your proof consumes, which is a function of prover gas units (PGUs) and proof type (Groth16 and PLONK each have a small fixed cost).

If you are planning to use the Succinct Prover Network regularly for an application, please reach out to us. For applications above a certain scale, we offer volume based discounts.

Benchmarking on Small vs. Large programs
In SP1, there is a fixed overhead for proving that is independent of your program's prover gas usage. This means that benchmarking on small programs is not representative of the performance of larger programs. To get an idea of the scale of programs for real-world workloads, you can refer to our benchmarking blog post and also some numbers below:

An average Ethereum block ranges between 300-500M PGUs (including Merkle proof verification for storage and execution of transactions) with our keccak and secp256k1 precompiles.
For a Tendermint light client, the average resource consumption is ~100M PGUs (including our ed25519 precompiles).
We consider programs with <2M PGUs to be "small" and by default, the fixed overhead of proving will dominate the proof latency. If latency is incredibly important for your use-case, we can specialize the prover network for your program if you reach out to us.
Note that if you generate Groth16 or PLONK proofs on the prover network, you will encounter a fixed overhead for the STARK -> SNARK wrapping step (~6s and ~70s respectively). We are working on optimizing the wrapping latencies


Setup
The best way to get started with verifying SP1 proofs on-chain is to refer to the SP1 Project Template.

You can initialize a new project with the template by running:

cargo prove new --evm <name>

This will create a new project with the following structure:

The template program shows how to write outputs that can be decoded in Solidity.
The template script shows how to generate the proof using the SP1 SDK.
The template contract shows how to verify the proof onchain using Solidity.
Refer to the section on Contract Addresses for the addresses of the deployed verifiers.

Generating SP1 Proofs for Onchain Verification
By default, the proofs generated by SP1 are not verifiable onchain, as they are non-constant size and STARK verification on Ethereum is very expensive. To generate a proof that can be verified onchain, we use performant STARK recursion to combine SP1 shard proofs into a single STARK proof and then wrap that in a SNARK proof. Our ProverClient has a prover option for this called plonk. Behind the scenes, this function will first generate a normal SP1 proof, then recursively combine all of them into a single proof using the STARK recursion protocol. Finally, the proof is wrapped in a SNARK proof using PLONK.

WARNING: The Groth16 and PLONK provers are only guaranteed to work on official releases of SP1. To use Groth16 or PLONK proving & verification locally, ensure that you have Docker installed and have at least 16GB of RAM (refer to hardware requirements for more details). Note that you might need to increase the memory limit for docker desktop if you're running on Mac.

Example
Source
use sp1_sdk::{include_elf, utils, HashableKey, ProverClient, SP1Stdin};

/// The ELF we want to execute inside the zkVM.
const ELF: &[u8] = include_elf!("fibonacci-program");

fn main() {
    // Setup logging.
    utils::setup_logger();

    // Create an input stream and write '500' to it.
    let n = 500u32;

    let mut stdin = SP1Stdin::new();
    stdin.write(&n);

    // Set up the pk and vk.
    let client = ProverClient::from_env();
    let (pk, vk) = client.setup(ELF);
    println!("vk: {:?}", vk.bytes32());

    // Generate the Groth16 proof.
    let proof = client.prove(&pk, &stdin).groth16().run().unwrap();
    println!("generated proof");

    // Get the public values as bytes.
    let public_values = proof.public_values.as_slice();
    println!("public values: 0x{}", hex::encode(public_values));

    // Get the proof as bytes.
    let solidity_proof = proof.bytes();
    println!("proof: 0x{}", hex::encode(solidity_proof));

    // Verify proof and public values
    client.verify(&proof, &vk).expect("verification failed");

    // Save the proof.
    proof.save("fibonacci-groth16.bin").expect("saving proof failed");

    println!("successfully generated and verified proof for the program!")
}
You can run the above script with RUST_LOG=info cargo run --bin groth16_bn254 --release in examples/fibonacci/script.


Contract Addresses
The current officially supported version of SP1 is V4.0.0.

All previous versions are deprecated and may not work as expected on the gateways.

To verify SP1 proofs on-chain, we recommend using our deployed canonical verifier gateways. The SP1VerifierGateway will automatically route your SP1 proof to the correct verifier based on the SP1 version used.

Canonical Verifier Gateways
There are different verifier gateway for each proof system: Groth16 and PLONK. This means that you must use the correct verifier gateway depending on if you are verifying a Groth16 or PLONK proof.

Groth16
Chain ID	Chain	Gateway
1	Mainnet	0x397A5f7f3dBd538f23DE225B51f532c34448dA9B
11155111	Sepolia	0x397A5f7f3dBd538f23DE225B51f532c34448dA9B
17000	Holesky	0x397A5f7f3dBd538f23DE225B51f532c34448dA9B
42161	Arbitrum One	0x397A5f7f3dBd538f23DE225B51f532c34448dA9B
421614	Arbitrum Sepolia	0x397A5f7f3dBd538f23DE225B51f532c34448dA9B
8453	Base	0x397A5f7f3dBd538f23DE225B51f532c34448dA9B
84532	Base Sepolia	0x397A5f7f3dBd538f23DE225B51f532c34448dA9B
10	Optimism	0x397A5f7f3dBd538f23DE225B51f532c34448dA9B
11155420	Optimism Sepolia	0x397A5f7f3dBd538f23DE225B51f532c34448dA9B
534351	Scroll Sepolia	0x397A5f7f3dBd538f23DE225B51f532c34448dA9B
534352	Scroll	0x397A5f7f3dBd538f23DE225B51f532c34448dA9B
56	BNB Chain (BSC)	0x940467b232cAD6A44FF36F2FBBe98CBd6509EFf2
PLONK
Chain ID	Chain	Gateway
1	Mainnet	0x3B6041173B80E77f038f3F2C0f9744f04837185e
11155111	Sepolia	0x3B6041173B80E77f038f3F2C0f9744f04837185e
17000	Holesky	0x3B6041173B80E77f038f3F2C0f9744f04837185e
42161	Arbitrum One	0x3B6041173B80E77f038f3F2C0f9744f04837185e
421614	Arbitrum Sepolia	0x3B6041173B80E77f038f3F2C0f9744f04837185e
8453	Base	0x3B6041173B80E77f038f3F2C0f9744f04837185e
84532	Base Sepolia	0x3B6041173B80E77f038f3F2C0f9744f04837185e
10	Optimism	0x3B6041173B80E77f038f3F2C0f9744f04837185e
11155420	Optimism Sepolia	0x3B6041173B80E77f038f3F2C0f9744f04837185e
534351	Scroll Sepolia	0x3B6041173B80E77f038f3F2C0f9744f04837185e
534352	Scroll	0x3B6041173B80E77f038f3F2C0f9744f04837185e
56	BNB Chain (BSC)	0xfff6601146031815a84890aCBf0d926609a40249
TEE Plonk
Chain ID	Chain	Gateway
11155111	Sepolia	0x857364919fD97a1aF7d9C5E8F905C7d222af3D02
The most up-to-date reference on each chain can be found in the deployments directory in the SP1 contracts repository, where each chain has a dedicated JSON file with each verifier's address.

Versioning Policy
Whenever a verifier for a new SP1 version is deployed, the gateway contract will be updated to support it with addRoute(). If a verifier for an SP1 version has an issue, the route will be frozen with freezeRoute().

On mainnets, only official versioned releases are deployed and added to the gateway. Testnets have rc versions of the verifier deployed supported in addition to the official versions.

Deploying to other Chains
In the case that you need to use a chain that is not listed above, you can deploy your own verifier contract by following the instructions in the SP1 Contracts Repo.

Since both the SP1VerifierGateway and each SP1Verifier implement the ISP1Verifier interface, you can choose to either:

Deploy the SP1VerifierGateway and add SP1Verifier contracts to it. Then point to the SP1VerifierGateway address in your contracts.
Deploy just the SP1Verifier contract that you want to use. Then point to the SP1Verifier address in your contracts.
If you want support for a canonical verifier on your chain, contact us here. We often deploy canonical verifiers on new chains if there's enough demand.

ISP1Verifier Interface
All verifiers (including the gateway) implement the ISP1Verifier interface.

Source
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title SP1 Verifier Interface
/// @author Succinct Labs
/// @notice This contract is the interface for the SP1 Verifier.
interface ISP1Verifier {
    /// @notice Verifies a proof with given public values and vkey.
    /// @dev It is expected that the first 4 bytes of proofBytes must match the first 4 bytes of
    /// target verifier's VERIFIER_HASH.
    /// @param programVKey The verification key for the RISC-V program.
    /// @param publicValues The public values encoded as bytes.
    /// @param proofBytes The proof of the program execution the SP1 zkVM encoded as bytes.
    function verifyProof(
        bytes32 programVKey,
        bytes calldata publicValues,
        bytes calldata proofBytes
    ) external view;
}

interface ISP1VerifierWithHash is ISP1Verifier {
    /// @notice Returns the hash of the verifier.
    function VERIFIER_HASH() external pure returns (bytes32);
}


Solidity Verifier
We maintain a suite of contracts used for verifying SP1 proofs onchain. We highly recommend using Foundry.

Installation
To install the latest release version:

forge install succinctlabs/sp1-contracts

To install a specific version:

forge install succinctlabs/sp1-contracts@<version>

Finally, add @sp1-contracts/=lib/sp1-contracts/contracts/src/ in remappings.txt.

Usage
Once installed, you can use the contracts in the library by importing them:

Source
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ISP1Verifier} from "@sp1-contracts/ISP1Verifier.sol";

struct PublicValuesStruct {
    uint32 n;
    uint32 a;
    uint32 b;
}

/// @title Fibonacci.
/// @author Succinct Labs
/// @notice This contract implements a simple example of verifying the proof of a computing a
///         fibonacci number.
contract Fibonacci {
    /// @notice The address of the SP1 verifier contract.
    /// @dev This can either be a specific SP1Verifier for a specific version, or the
    ///      SP1VerifierGateway which can be used to verify proofs for any version of SP1.
    ///      For the list of supported verifiers on each chain, see:
    ///      https://github.com/succinctlabs/sp1-contracts/tree/main/contracts/deployments
    address public verifier;

    /// @notice The verification key for the fibonacci program.
    bytes32 public fibonacciProgramVKey;

    constructor(address _verifier, bytes32 _fibonacciProgramVKey) {
        verifier = _verifier;
        fibonacciProgramVKey = _fibonacciProgramVKey;
    }

    /// @notice The entrypoint for verifying the proof of a fibonacci number.
    /// @param _proofBytes The encoded proof.
    /// @param _publicValues The encoded public values.
    function verifyFibonacciProof(bytes calldata _publicValues, bytes calldata _proofBytes)
        public
        view
        returns (uint32, uint32, uint32)
    {
        ISP1Verifier(verifier).verifyProof(fibonacciProgramVKey, _publicValues, _proofBytes);
        PublicValuesStruct memory publicValues = abi.decode(_publicValues, (PublicValuesStruct));
        return (publicValues.n, publicValues.a, publicValues.b);
    }
}
The recommended on-chain SP1 proof verification workflow is to use the ISP1Verifier interface on the SP1VerifierGateway, so the SP1VerifierGateway automatically routes your proof to the correct verifier.

Your program’s verification key should be upgradeable within your contract, in case you want to upgrade to a newer version of SP1 or modify your program.

Succinct maintains the ability to freeze verifiers on the canonical verifier gateway in the event of a security issue to prevent abuse. Note that verifier contract deployment is permissionless to enable customizable security configurations.

Finding your program vkey
The program vkey (fibonacciProgramVKey in the example above) is passed into the ISP1Verifier along with the public values and proof bytes. You can find your program vkey by going through the following steps:

Find what version of SP1 crates you are using.
Use the version from step to run this command: sp1up --version <version>
Use the vkey command to get the program vkey: cargo prove vkey -elf <path/to/elf>
Alternatively, you can set up a simple script to do this using the sp1-sdk crate:

fn main() {
    // Setup the logger.
    sp1_sdk::utils::setup_logger();

    // Setup the prover client.
    let client = ProverClient::from_env();

    // Setup the program.
    let (_, vk) = client.setup(FIBONACCI_ELF);

    // Print the verification key.
    println!("Program Verification Key: {}", vk.bytes32());
}

Testing
To test the contract, we recommend setting up Foundry Tests. We have an example of such a test in the SP1 Project Template.

Solidity Versions
The officially deployed contracts are built using Solidity 0.8.20 and exist on the sp1-contracts main branch.

If you need to use different versions that are compatible with your contracts, there are also other branches you can install that contain different versions. For example for branch main-0.8.15 contains the contracts with:

pragma solidity ^0.8.15;

and you can install it with:

forge install succinctlabs/sp1-contracts@main-0.8.15

If there is different versions that you need but there aren't branches for them yet, please ask in the SP1 Telegram.


Common Issues
Rust Version Errors
If you are using a library that has an MSRV specified, you may encounter an error like this when building your program.

package `alloy cannot be built because it requires rustc 1.83 or newer, while the currently active rustc version is 1.82.0`


This is due to the fact that your current Succinct Rust toolchain has been built with a lower version than the MSRV of the crates you are using.

You can check the version of your local Succinct Rust toolchain by running cargo +succinct --version. The latest release of the Succinct Rust toolchain is 1.82. You can update to the latest version by running sp1up.

% sp1up
% cargo +succinct --version
cargo 1.82.0-dev (8f40fc59f 2024-08-21)

A Succinct Rust toolchain with version 1.82 should work for all crates that have an MSRV of 1.82 or lower.

If the MSRV of your crate is higher than 1.82, try the following:

If using cargo prove build directly, pass the --ignore-rust-version flag:

cargo prove build --ignore-rust-version

If using build_program in an build.rs file with the sp1-build crate, set ignore_rust_version to true inside the BuildArgs struct and use build_program_with_args:

let args = BuildArgs {
    ignore_rust_version: true,
    ..Default::default()
};
build_program_with_args("path/to/program", args);

alloy_sol_types Errors
If you are using a library that depends on alloy_sol_types, and encounter an error like this:

perhaps two different versions of crate `alloy_sol_types` are being used?

This is likely due to two different versions of alloy_sol_types being used. To fix this, you can set default-features to false for the sp1-sdk dependency in your Cargo.toml.

[dependencies]
sp1-sdk = { version = "4.0.0", default-features = false }

This will configure out the network feature which will remove the dependency on alloy_sol_types and configure out the NetworkProver.

Stack Overflow Errors + Bus Errors
If you encounter any of the following errors in a script using sp1-sdk:

# Stack Overflow Error
thread 'main' has overflowed its stack
fatal runtime error: stack overflow

# Bus Error
zsh: bus error

# Segmentation Fault
Segmentation fault (core dumped)

Run your script with the --release flag. SP1 currently only supports release builds. This is because the sp1-core library and sp1-recursion require being compiled with the release profile.

Failed to run docker run in proof aggregation on macOS
If you encounter the following error when using proof aggregation on macOS:

 INFO aggregate the proofs:wrap_plonk_bn254: Running prove in docker
ERROR aggregate the proofs:wrap_plonk_bn254: Failed to run `docker run`
  "docker" "run" "--rm" "-v" "~/.sp1/circuits/plonk/v4.0.0-rc.3:/circuit" 
  "-v" "/tmp/.tmph1gBYN:/witness" "-v" "/tmp/.tmpIkyurM:/output" 
  "ghcr.io/succinctlabs/sp1-gnark:v4.0.0-rc.3" "prove" "--system" "plonk" "/circuit" "/witness" "/output"
ERROR aggregate the proofs:wrap_plonk_bn254: status: ExitStatus(unix_wait_status(35072))
ERROR aggregate the proofs:wrap_plonk_bn254: stderr: ""

You might need to increase the memory limit for Docker desktop to at least 32GB.

C Binding Errors
If you are building a program that uses C bindings or has dependencies that use C bindings, you may encounter the following errors:

cc did not execute successfully

Failed to find tool. Is `riscv32-unknown-elf-gcc` installed?

To resolve this, re-install sp1 with the --c-toolchain flag:

sp1up --c-toolchain

This will install the C++ toolchain for RISC-V and set the CC_riscv32im_succinct_zkvm_elf environment variable to the path of the installed riscv32-unknown-elf-gcc binary. You can also use your own C++ toolchain be setting this variable manually:

export CC_riscv32im_succinct_zkvm_elf=/path/to/toolchain

Compilation Errors with sp1-lib::syscall_verify_sp1_proof
If you are using the sp1-lib::syscall_verify_sp1_proof function, you may encounter compilation errors when building your program.

  [sp1]    = note: rust-lld: error: undefined symbol: syscall_verify_sp1_proof
  [sp1]            >>> referenced by sp1_lib.b593533d149f0f6e-cgu.0
  [sp1]            >>>               sp1_lib-8f5deb4c47d01871.sp1_lib.b593533d149f0f6e-cgu.0.rcgu.o:(sp1_lib::verify::verify_sp1_proof::h5c1bb38f11b3fe71) in ...
  [sp1]
  [sp1]
  [sp1]  error: could not compile `package-name` (bin "package-name") due to 1 previous error


To resolve this, ensure that you're importing both sp1-lib and sp1-zkvm with the verify feature enabled.

[dependencies]
sp1-lib = { version = "<VERSION>", features = ["verify"] }
sp1-zkvm = { version = "<VERSION>", features = ["verify"] }

Failed to run LLVM passes: unknown pass name 'loweratomic'
The Rust compiler had breaking changes to its names of available options between 1.81 and 1.82.

  [sp1]     Compiling proc-macro2 v1.0.93
  [sp1]     Compiling unicode-ident v1.0.14
  [sp1]     Compiling quote v1.0.38
  [sp1]     Compiling syn v2.0.96
  [sp1]     Compiling serde_derive v1.0.217
  [sp1]     Compiling serde v1.0.217
  [sp1]  error: failed to run LLVM passes: unknown pass name 'loweratomic'

This message indicates that you're trying to use sp1-build < 4.0.0 with the 1.82 toolchain, sp1-build versions >= 4.0.0 have support for the 1.82 and 1.81 toolchains.

Slow ProverClient Initialization
You may encounter slow ProverClient initialization times as it loads necessary proving parameters and sets up the environment. It is recommended to initialize the ProverClient once and reuse it for subsequent proving operations. You can wrap the ProverClient in an Arc to share it across tasks.



Usage in CI
Getting started
You may want to use SP1 in your Github Actions CI workflow.

You first need to have Rust installed, and you can use actions-rs/toolchain for this:

- name: Install Rust Toolchain
  uses: actions-rs/toolchain@v1
  with:
    toolchain: 1.81.0
    profile: default
    override: true
    default: true
    components: llvm-tools, rustc-dev

And then you can install the SP1 toolchain:

- name: Install SP1 toolchain
  run: |
    curl -L https://sp1up.succinct.xyz | bash
    ~/.sp1/bin/sp1up 
    ~/.sp1/bin/cargo-prove prove --version

You might experience rate limiting from sp1up. Using a Github Personal Access Token (PAT) will help.

Try setting a github actions secret to your PAT, and then passing it into the sp1up command:

- name: Install SP1 toolchain
  run: |
    curl -L https://sp1up.succinct.xyz | bash
    ~/.sp1/bin/sp1up --token "${{ secrets.GH_PAT }}"
    ~/.sp1/bin/cargo-prove prove --version

Note: Installing via sp1up always installs the latest version, its recommended to use a release commit via sp1up -C <commit>.

Speeding up your CI workflow
Caching
To speed up your CI workflow, you can cache the Rust toolchain and Succinct toolchain. See this example from SP1's CI workflow, which caches the ~/.cargo and parts of the ~/.sp1 directories.

- name: rust-cache
  uses: actions/cache@v3
  with:
    path: |
      ~/.cargo/bin/
      ~/.cargo/registry/index/
      ~/.cargo/registry/cache/
      ~/.cargo/git/db/
      target/
      ~/.rustup/
      ~/.sp1/circuits/plonk/ # Cache these if you're generating plonk proofs with docker in CI.
      ~/.sp1/circuits/groth16/ # Cache these if you're generating groth16 proofs with docker in CI.
    key: rust-1.81.0-${{ hashFiles('**/Cargo.toml') }}
        restore-keys: rust-1.81.0-

runs-on for bigger instances
Since SP1 is a fairly large repository, it might be useful to use runs-on to specify a larger instance type.


Upgrade Guides
5.0.0
The V5 upgrade includes important security fixes and performance improvements, it is strongly recommended to upgrade to this version as soon as possible.

First you should run sp1up, this will install the lastest compiler for the zkVM.

After upgrading the SP1 dependencies to 5.0.0, ensure you delete ALL target directories in your project, as the V5 upgrade includes a new sp1-zkvm version that is not compatible with previous versions.

If you're using a separate workspace for your program, you must ensure that target directory is deleted.

From the root of your project, you can run rm -rf **/**/target/ to delete all target directories.

Patches
In order to upgrade to V5, some patches must be upgraded, you can find the up to date list of patches here and any caveats associated with them.

The following patches are required to be upgraded:

P256
K256
BLS12_381
Dalek(-ng)
Secp256k1
BN
RSA
Common Issues
RustCrypto Provider
The current version of the sp1-sdk relies on an RPC client that defaults to enabling the ring TLS feature on Rustls, which means any dependcies that enable the aws-lc-tls feature will cause the TLS provider to become ambigious to Rustls.

Unfortunately, the only way to solve this at the moment is to install RustCrypto::Provider at runtime in your main function.

This problem most commonly occurs when using any aws-sdk-* crates, as they enable the aws-lc-tls feature by default.

For example, to install the aws-lc-tls provider, you can add the following to your main.rs:


fn main() {
    rustls::crypto::aws_lc_rs::default_provider().install_default()
        .expect("Failed to set default crypto provider");

    ...
}

You are using reserved file descriptor X ...
This message occurs for a few reasons:

You are using old patches
Ensure you are using the latest patches for your dependencies, as listed in the precompiles documentation.
You are using an old ELF by accident, and not a newly built one.
Ensure your build system is functioning correctly and that you are not using an old ELF file.
You are using an old sp1-zkvm or sp1-lib version.
Ensure, when in the programs workspace, that cargo tree | grep sp1 shows all >=5.0.0 crates.


Security Model
The goal of SP1 zkVM is to transform an arbitrary program written in an LLVM-compiled language into a sound zero-knowledge proof, proving the program's correct execution. SP1's security model outlines the necessary cryptographic assumptions and program safety requirements to ensure secure proof generation and verification. It also addresses our trusted setup process and additional practical measures to enhance the security of using SP1.

Cryptographic Security Model
Hash Functions and the Random Oracle Model
SP1 utilizes the Poseidon2 hash function over the BabyBear field with a width of 16, rate of 8, capacity of 8, SBOX degree of 7, and 8 external rounds with 13 internal rounds. These parameters were used in Plonky3. Readers are referred to the Plonky3 documentation above for more details and theoretical background on the parameter selection for Poseidon2.

Using the Random Oracle Model, we assume our system remains as secure as if Poseidon2 was replaced with a random oracle. This assumption establishes the security of the Fiat-Shamir transform, which converts an interactive protocol into a non-interactive one. This is a common cryptographic assumption used by many teams in the domain; see also the Poseidon Initiative.

Conjectures for FRI's Security
SP1 uses Conjecture 8.4 from the paper "Proximity Gaps for Reed-Solomon Codes". Based on this conjecture, section 3.9.2 of ethSTARK documentation describes the number of FRI queries required to achieve a certain level of security, depending on the blowup factor. Additionally, proof of work is used to reduce the required number of FRI queries, as explained in section 3.11.3 of the ethSTARK documentation.

SP1's FRI parameters have num_queries = 100 / log_blowup with proof_of_work_bits = 16, providing at least 100 bits of security based on these conjectures.

Recursion's Overhead in Security
We assume that recursive proofs do not incur a loss in security as the number of recursive steps increases. This assumption is widely accepted for recursion-based approaches.

Security of Elliptic Curves over Extension Fields
SP1 assumes that the discrete logarithm problem on the elliptic curve over the degree-7 extension of BabyBear is computationally hard. The selected instantiation of the elliptic curve satisfies the criteria outlined in SafeCurves, including high embedding degree, prime group order, and a large CM discriminant.

An analysis based on Thomas Pornin's paper "EcGFp5: a Specialized Elliptic Curve", confirmed that the selected elliptic curve provides at least 100 bits of security against known attacks.

This assumption is used in our new memory argument. For more details, see our notes explaining how it works.

Groth16, PLONK, and the Zero-Knowledgeness of SP1
SP1 utilizes Gnark's implementation of Groth16 or PLONK over the BN254 curve to compress a STARK proof into a SNARK proof, which is then used for on-chain verification. SP1 assumes all cryptographic assumptions required for the security of Groth16 and PLONK. While our implementations of Groth16 and PLONK are zero-knowledge, individual STARK proofs in SP1 do not currently satisfy the zero-knowledge property.

Program Safety Requirements
Since SP1 only aims to provide proof of correct execution for the user-provided program, it is crucial for users to make sure that their programs are secure.

SP1 assumes that the program compiled into SP1 is non-malicious. This includes that the program is memory-safe and the compiled ELF binary has not been tampered with. Compiling unsafe programs with undefined behavior into SP1 could result in undefined or even malicious behavior being provable and verifiable within SP1. Therefore, developers must ensure the safety of their code and the correctness of their SP1 usage through the appropriate toolchain. Similarly, users using SP1's patched crates must ensure that their code is secure when compiled with the original crates. SP1 also has requirements for safe usage of SP1 Precompiles, which must be ensured by the developers.

Additionally, SP1 assumes that 0 is not a valid program counter in the compiled program.

Trusted Setup
The Groth16 and PLONK protocols require a trusted setup to securely setup the proof systems. For PLONK, SP1 relies on the trusted setup ceremony conducted by Aztec Ignition. For Groth16, SP1 conducted a trusted setup among several contributors to enable its use in the zero-knowledge proof generation pipeline.

Purpose
A trusted setup ceremony generates cryptographic parameters essential for systems like Groth16 and PLONK. These parameters ensure the validity of proofs and prevent adversaries from creating malicious or invalid proofs. However, the security of the trusted setup process relies on the critical assumption that at least one participant in the ceremony securely discards their intermediary data (commonly referred to as "toxic waste"). If this assumption is violated, the security of the proof system can be compromised.

Options
SP1 provides two trusted setup options, depending on user preferences and security requirements:

PLONK’s Universal Trusted Setup:

For PLONK, SP1 uses the Aztec Ignition ceremony, which is a universal trusted setup designed for reuse across multiple circuits. This approach eliminates the need for circuit-specific ceremonies and minimizes trust assumptions, making it a robust and widely trusted solution.

The details of SP1's usage of this trusted setup can be found in our repository here using Gnark's ignition verifier.

The only downside of using PLONK is that it's proving time is slower than Groth16 by 3-4x.

Groth16 Circuit-Specific Trusted Setup:

For Groth16, Succinct conducted a circuit-specific trusted setup ceremony among several contributors to the project. While every effort was made to securely generate and discard intermediary parameters following best practices, circuit-specific ceremonies inherently carry higher trust assumptions. The contributors are the following:

John Guibas
Uma Roy
Tamir Hemo
Chris Tian
Eli Yang
Kaylee George
Ratan Kaliani
The trusted setup artifacts along with the individual contributions can be downloaded from this following archive and were generate by Semaphore which was originally developed by Worldcoin.

Users uncomfortable with these security assumptions are strongly encouraged to use PLONK instead.

Approved Prover
Zero-knowledge proof (ZKP) systems are highly advanced and complex pieces of software that push the boundaries of cryptographic innovation. As with any complex system, the possibility of bugs or vulnerabilities cannot be entirely eliminated. In particular, issues in the prover implementation may lead to incorrect proofs or security vulnerabilities that could compromise the integrity of the entire proof system.

To mitigate these risks, we officially recommend the use of an approved prover for any application handling critical or sensitive amounts of value. An approved prover refers to an implementation where there is a list of whitelisted provers or oracles who provide an additional sanity check that the proof's claimed outputs are correct.

Over time, as the ecosystem matures and the understanding of ZKP systems improves, we expect to relax these restrictions. Advances in formal verification, fuzz testing, and cryptographic research may provide new tools and methods to achieve high levels of security and confidence of prover implementations.

We strongly advise users to:

Use only Succinct approved versions of the prover software for critical applications.
Follow updates and recommendations from the SP1 team regarding approved provers.
Regularly apply security patches and updates to the prover software.
This careful approach ensures that applications using SP1 maintain the highest possible level of security, while still leaving room for innovation and growth in the ZKP ecosystem.


RV32IM Standards Compliance
SP1 is a specialized implementation of the RISC-V RV32IM standard and aligns with the fundamental philosophy of RISC-V, which emphasizes customization and flexibility over rigid adherence to a fixed set of instructions.

Notably, RISC-V is designed as a modular ISA framework that encourages implementers to adapt and specialize its base specifications to meet unique application requirements. SP1, which is tailored for zero-knowledge proving workloads, embodies this philosophy by introducing minor adjustments that enhance proving efficiency while adhering to the core RV32IM requirements. These design choices reflect the intent of RISC-V to act as a “skeleton” rather than an immutable standard as outlined in the RISC-V specification:

RISC-V has been designed to support extensive customization and specialization. The base integer ISA can be extended with one or more optional instruction-set extensions, but the base integer instructions cannot be redefined. ... The base is carefully restricted to a minimal set of instructions sufficient to provide a reasonable target for compilers, assemblers, linkers, and operating systems (with additional supervisor-level operations), and so provides a convenient ISA and software toolchain “skeleton” around which more customized processor ISAs can be built.

SP1’s primary customizations, such as requiring aligned memory access and reserving specific memory regions, are implementation details optimized for zkVMs. These modifications are consistent with RISC-V’s allowance for customization, as the specification explicitly permits implementers to define legal address spaces and undefined behaviors.

This topic was thoroughly investigated by external auditors, including rkm0959, Zellic, samczsun, and others. The audit report by Zellic on this subject can be found here.

Implementation Details
In this section, we outline the specific customizations made to SP1's implementation of the RISC-V RV32IM standard to simplify constraints and improve proving time.

Reserved Memory Regions
SP1 reserves the following memory regions:

0x0 to 0x1F inclusive are reserved for registers. Writing to these addresses will modify register state and cause undefined behavior. SP1's AIRs also constrain that memory opcodes do not access these addresses.
0x20 to 0x78000000 inclusive are reserved for the heap allocator. Writing to addresses outside this region will cause undefined behavior.
The RISC-V standard permits implementers to define which portions of the address space are legal to access and does not prohibit the specification of undefined behavior. SP1 adheres to this flexibility by defining valid memory regions from 0x20 to 0x78000000, with accesses outside this range constituting undefined behavior. This design choice aligns with common practices in hardware platforms, where reserved or invalid memory regions serve specific purposes, such as DMA or MMIO, and accessing them can result in unpredictable behavior. Compared to real-world systems like x86 and ARM, SP1's memory map is neither that unusual nor complex.

In practical terms, undefined behavior caused by accessing illegal memory regions reflects faults in the program rather than the platform. Such behavior is consistent with other hardware environments.

Aligned Memory Access
Memory access must be "aligned". The alignment is automatically enforced by all programs compiled through the official SP1 RISC-V toolchain. SP1's AIRs also constrain that these alignment rules are followed:

LW/SW memory access must be word aligned.
LH/LHU/SH memory access must be half-word aligned.
The RISC-V standard does not explicitly prohibit implementers from requiring aligned memory access, leaving room for such decisions based on specific implementation needs. SP1 enforces memory alignment as part of its design, an approach that aligns with practices in many hardware systems where alignment is standard to optimize performance and simplify implementation. This design choice is well-documented and does not conflict with RISC-V’s flexibility for implementation-specific optimizations.

In practice, SP1’s memory alignment requirement does not impose a significant burden on developers since it is clearly documented that programs should be compiled with the SP1 toolchain.

ECALL Instruction
The ECALL instruction in SP1 is used for system calls and precompiles, adhering to a specific convention for its proper use. Syscall IDs must be valid and loaded into register T0, with arguments placed in registers A0 and A1. If these arguments are memory addresses, they are required to be word-aligned. This convention ensures clarity and consistency in how system calls are handled. Failure to follow these conventions can result in undefined behavior.

FENCE, WFI, MRET, and CSR related instructions
SP1 marks the FENCE, WFI, MRET, and CSR-related instructions as not implemented and disallowed within the SP1 zkVM. This decision reflects the unique requirements and constraints of SP1's zkVM environment, where these instructions are unnecessary or irrelevant to its intended functionality. By omitting these instructions, SP1 simplifies its implementation, focusing on the subset of RISC-V instructions that are directly applicable to the application.

Security Considerations
While SP1's customization of RISC-V could theoretically be exploited to cause undefined behavior or divergent execution from other platforms, such scenarios require a deliberately malicious program. The SP1 security model assumes that programs are honestly compiled, as malicious bytecode could otherwise exploit program execution and I/O. Programs which trigger undefined behavior are considered improperly designed for the environment, not evidence of noncompliance in SP1.

In practice, developers are proving their own applications and must be fully aware of the behavior of their source code and the environment they are running in. If an attacker can insert malicious code into a program, there are several trivial ways to control the program's behavior beyond relying on these undefined behaviors to trigger divergent execution. The customizations described in this document do not meaningfully change the attack surface of the SP1 zkVM.


Safe Usage of SP1 Precompiles
This section outlines the key assumptions and properties of each precompile. As explained in precompile specification, we recommend you to interact with precompiles through patches. Advanced users interacting directly with the precompiles are expected to ensure these assumptions are met.

Do not use direct ECALL
If you need to interact with the precompiles directly, you must use the API described in Precompiles instead of making the ecall directly using unsafe Rust. As some of our syscalls have critical functionalities and complex security properties around them, we highly recommend not calling the syscalls directly with ecall. For example, directly calling HALT to stop the program execution leads to security vulnerabilities. As in our security model, it is critical for safe usage that the program compiled into SP1 is correct.

Alignment of Pointers
For all precompiles, any pointer with associated data must be a valid pointer aligned to a four-byte boundary. This requirement applies to all precompiles related to hashing, field operations, and elliptic curve operations.

Canonical Field Inputs
Certain precompiles handle non-native field arithmetic, such as field operation and elliptic curve precompiles. These precompiles take field inputs as arrays of u32 values. In such cases, the u32 values must represent the field element in its canonical form. For example, in a finite field Fp, the value 1 must be represented by u32 limbs that encode 1, rather than p + 1 or 2 * p + 1. Using non-canonical representations may result in unverifiable SP1 proofs. Note that our field operation and elliptic curve operation precompiles are constrained to return field elements in their canonical representations.

Elliptic Curve Precompiles
The elliptic curve precompiles assume that inputs are valid elliptic curve points. Since this validity is not enforced within the precompile circuits, it is the responsibility of the user program to verify that the points lie on the curve. Given valid elliptic curve points as inputs, the precompile will perform point addition or doubling as expected.

For Weierstrass curves, the add precompile additionally constrains that the two elliptic curve points have different x-coordinates over the base field. Attempting to double a point by sending two equal curve points to the add precompile will result in unverifiable proofs. Additionally, cases where an input or output point is a point at infinity cannot be handled by the add or double precompile. It is the responsibility of the user program to handle such edge cases of Weierstrass addition correctly when invoking these precompiles.

U256 Precompile
The sys_bigint precompile efficiently constrains the computation of (x * y) % modulus, where x, y, modulus are all uint256. Here, the precompile requires that x * y < 2^256 * modulus for the resulting SP1 proof to be verifiable. This condition is satisfied, for example, when at least one of x or y is canonical, (i.e., less than the modulus). It is the responsibility of the user program to ensure that this requirement is met.