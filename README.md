# SP1 Integration Assistant

An AI-powered tool that helps developers integrate SP1 zero-knowledge proofs into their applications without requiring cryptographic expertise. Transform your verification logic into production-ready SP1 programs with the help of advanced language models.

🌐 **Live Demo**: [https://decompositionfacility.xyz](https://decompositionfacility.xyz)

## 🚀 Features

### Smart Code Generation
- **Three Verification Templates**:
  - 🎮 **Game Score Verification** - Prove game scores and achievements
  - 📄 **Document Verification** - Verify document authenticity with hashes
  - 📊 **Data Processing** - Prove correct computation over data

### Multi-Tier AI Support
- **Cloud LLM Integration** (API keys provided by users):
  - OpenAI (GPT-4, GPT-3.5)
  - Google AI (Gemini Pro)
  - Anthropic (Claude 3 Opus, Sonnet, Haiku)
- **Direct Generation** - Template-based generation without AI
- **Smart Routing** - Automatically selects appropriate model based on complexity

### SP1 Best Practices Built-In
- Network proving configuration (no local proving headaches)
- Proper key formatting (no "0x" prefix issues)
- Cost estimation ($0.02-0.05 per proof)
- Progress indication for 30-90 second proof generation
- Cycle optimization suggestions

## 🔒 Security & Privacy

**Your API keys are never stored!** 
- API keys are passed through request headers only
- No server-side storage or logging of credentials
- Keys remain in your browser's session
- Complete user control over API access

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- SP1 toolchain (for running generated programs)

## 🛠️ Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/NoCritics/sp1-assistant.git
   cd sp1-assistant
   ```

2. **Install dependencies**:
   ```bash
   cd sp1-assistant
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Access the application**:
   ```
   http://localhost:4000
   ```

## 💻 Usage

### Basic Workflow

1. **Select a Template**: Choose from Game Score, Document Verification, or Data Processing

2. **Provide Your Code**: Paste your verification logic or requirements

3. **Choose AI Model**: 
   - Direct (no AI, template only)
   - OpenAI models
   - Google AI models
   - Anthropic models

4. **Add API Key** (if using AI):
   - Click "Add API Key" in the UI
   - Enter your API key for the selected provider
   - Keys are only stored in your browser session

5. **Generate**: Click generate to create your SP1 integration

### Generated Output Includes:
- Complete SP1 program (`main.rs`)
- Proof generation script
- Verification script
- Environment setup guide (`.env` example)
- Step-by-step deployment instructions

### Example Input
```javascript
// Game score verification
function verifyScore(gameId, score) {
  if (gameId === 1) return score <= 1000000;
  if (gameId === 2) return score <= 500000;
  return false;
}
```

### Example Output
```rust
#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
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
}
```

## 🏗️ Architecture

```
sp1-assistant/
├── src/
│   ├── server.js           # Express server
│   ├── templateEngine.js   # Template processing
│   ├── sp1Generator.js     # SP1 code generation
│   └── promptRouter.js     # LLM prompt routing
├── templates/
│   ├── game-score/         # Game verification template
│   ├── document-verify/    # Document verification template
│   └── data-processing/    # Data computation template
├── prompts/
│   └── systemPrompts.js    # AI model prompts
├── public/
│   └── index.html          # Web interface
└── docs/
    └── context/            # SP1 documentation tiers
```

## 🤝 API Providers

To use AI-enhanced generation, you'll need API keys from:

- **OpenAI**: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Google AI**: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
- **Anthropic**: [https://console.anthropic.com/api-keys](https://console.anthropic.com/api-keys)

## 🚀 Deployment

The application is designed to run on a standard VPS with:
- 4GB+ RAM
- Node.js 18+
- PM2 for process management
- Nginx for reverse proxy (optional)

### PM2 Deployment
```bash
pm2 start src/server.js --name sp1-assistant
pm2 save
pm2 startup
```

## 📚 Resources

- [SP1 Documentation](https://docs.succinct.xyz/docs/getting-started/install)
- [SP1 GitHub](https://github.com/succinctlabs/sp1)
- [Succinct Network](https://alpha.succinct.xyz/)

## ⚠️ Important Notes

1. **Proof Generation Costs**: Each proof costs approximately $0.02-0.05 on the Succinct Network
2. **Generation Time**: Proofs take 30-90 seconds to generate
3. **Network Only**: Local proving requires 32GB+ RAM and is not recommended
4. **Private Keys**: Never include "0x" prefix in your SP1 private keys

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid hex character" error**
   - Remove "0x" prefix from your private key

2. **"Out of memory" error**
   - You're using local proving; switch to network proving

3. **API Key errors**
   - Ensure you've added your API key in the UI
   - Check that your API key has sufficient credits
   - Verify you're using the correct provider

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Built with [SP1](https://github.com/succinctlabs/sp1) by Succinct Labs
- Powered by OpenAI, Google AI, and Anthropic APIs
- Inspired by the growing need for accessible ZK proof generation

---

**Note**: This tool is for educational and development purposes. Always review generated code before using in production.
