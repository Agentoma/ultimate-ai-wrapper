# Ultimate AI Wrapper 🚀

**The Universal AI Browser Extension** - HARPA-style multi-model access reimagined. Your ultimate coding buddy for life automation.

## 🌟 What Is This?

Ultimate AI Wrapper is a reverse-engineered, open-source browser extension inspired by HARPA.AI that gives you **in-session access to ALL major AI models** without tab switching:

- **ChatGPT** (GPT-4, GPT-4o, o1)
- **Claude** (Claude 3.7 Sonnet, Opus)
- **Google Gemini** (Gemini 2.5)
- **Perplexity AI**
- **Grok** (X.AI)

### Key Innovation: In-Session Browser Windows

Unlike traditional AI tools that require you to visit separate websites, Ultimate AI Wrapper **embeds AI directly into your browsing experience** through:

1. **Sidebar Interface**: Press `Alt+A` to toggle AI sidebar on ANY webpage
2. **Context Awareness**: AI can read and interact with the current page
3. **Multi-Model Chat**: Send prompts to multiple AIs simultaneously
4. **Session Persistence**: Keep AI conversations active while browsing
5. **Browser Automation**: AI can click, extract data, and interact with pages

## 🏗️ Architecture (Reverse-Engineered from HARPA)

### How HARPA Works (And How We Replicate It)

HARPA uses a clever architecture that we've reverse-engineered:

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser Extension Layer                   │
├─────────────────────────────────────────────────────────────┤
│  Service Worker          │    Content Scripts                │
│  - Command routing       │    - Page injection               │
│  - Tab management        │    - Sidebar rendering            │
│  - State management      │    - DOM manipulation             │
├─────────────────────────────────────────────────────────────┤
│                  AI Provider Adapters                        │
├────────────┬──────────────┬────────────────┬────────────────┤
│  ChatGPT   │   Claude     │    Gemini      │   Perplexity   │
│  Adapter   │   Adapter    │    Adapter     │   & Grok       │
└────────────┴──────────────┴────────────────┴────────────────┘
```

### Core Components

#### 1. **Service Worker** (`background/service-worker.js`)
Manages extension lifecycle, command routing, and tab coordination

#### 2. **Universal Sidebar** (`content/sidebar.js` + `sidebar.html`)
The draggable AI panel that appears on every webpage

#### 3. **AI Provider Adapters**
Individual scripts that "wrap" each AI platform:
- Detect input fields on AI websites
- Auto-fill prompts
- Extract responses
- Handle authentication

#### 4. **Page Context Injector** (`content/ai-injector.js`)
Reads current page content and passes it to AI models

## ✨ Features

### 🎯 Core Functionality

- **Alt+A Activation**: Toggle AI sidebar on any webpage (HARPA-style)
- **Multi-Model Prompting**: Send same prompt to all AIs simultaneously
- **Page-Aware AI**: AI understands current page content
- **Browser Automation**: AI can interact with web pages
- **Session Memory**: Conversations persist across tabs
- **No API Keys Required**: Uses your existing AI platform logins

### 🔧 Advanced Features

- **Custom Commands**: Create reusable automation workflows
- **Data Extraction**: Pull structured data from any website
- **Form Automation**: AI-powered form filling
- **Content Generation**: Write emails, code, articles in-context
- **Web Scraping**: Extract and process page data
- **Workflow Chains**: Multi-step automation sequences

## 🚀 Installation

### Prerequisites

1. Google Chrome or Chromium-based browser
2. Active accounts on AI platforms you want to use:
   - ChatGPT (chat.openai.com)
   - Claude (claude.ai)
   - Gemini (gemini.google.com)
   - Perplexity (perplexity.ai)
   - Grok (x.ai/grok)

### Setup

```bash
# Clone the repository
git clone https://github.com/Agentoma/ultimate-ai-wrapper.git
cd ultimate-ai-wrapper

# Load in Chrome
# 1. Go to chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the ultimate-ai-wrapper folder
```

### First Run Configuration

1. **Login to AI Platforms**: Visit each AI platform and log in
2. **Pin Extension**: Click the extension icon and pin it to toolbar
3. **Test Sidebar**: Press `Alt+A` on any webpage to verify

## 📖 Usage Guide

### Basic Usage

#### Open AI Sidebar
```
Press: Alt+A (anywhere on the web)
```

The sidebar appears with:
- Model selector (choose which AI to use)
- Prompt input field
- Page context toggle
- Response area

#### Send Prompt to Single AI

1. Press `Alt+A` to open sidebar
2. Select AI model from dropdown
3. Type your prompt
4. Press Enter

#### Send to All AIs Simultaneously

```
Press: Alt+Shift+A
```

This sends your prompt to ALL AI models and displays responses side-by-side for comparison.

### Advanced Usage

#### Page-Aware Prompting

```javascript
// The extension automatically passes page context
"Summarize this article"
"Extract all product prices from this page"
"Find the contact email on this website"
```

#### Browser Automation

```javascript
// AI can interact with the page
"Fill out this form with sample data"
"Click all checkboxes on this page"
"Extract this table to CSV"
```

#### Custom Workflows

Create reusable automation sequences:

```javascript
// Example: Research workflow
1. "Find the main email on this page"
2. "Draft a professional outreach email"
3. "Save to clipboard"
```

## 🔍 How It Works: Deep Dive

### The Adapter Pattern

Each AI platform has unique DOM structure. We create "adapters" that:

1. **Detect the platform**: Check URL and page structure
2. **Find input elements**: Locate text areas, buttons
3. **Inject prompts**: Fill in user's question
4. **Trigger submission**: Click send button
5. **Monitor responses**: Watch for AI's answer
6. **Extract text**: Pull response back to sidebar

### Example: ChatGPT Adapter

```javascript
// content/providers/chatgpt-adapter.js
class ChatGPTAdapter {
  async sendPrompt(prompt) {
    // Find the input textarea
    const input = document.querySelector('[data-id="root"]');
    
    // Set the value
    input.value = prompt;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Find and click send button
    const sendBtn = document.querySelector('[data-testid="send-button"]');
    sendBtn.click();
    
    // Wait for and extract response
    return await this.waitForResponse();
  }
}
```

### Session Management

The extension maintains "virtual sessions" for each AI:

1. Opens AI platform in hidden iframe or background tab
2. Keeps session alive
3. Sends prompts via adapter
4. Returns responses to main interface

### Context Passing

```javascript
// Page content is automatically included
const pageContext = {
  url: window.location.href,
  title: document.title,
  content: document.body.innerText.slice(0, 10000),
  selectedText: window.getSelection().toString()
};
```

## 🎨 Customization

### Adding New AI Models

1. Create adapter in `content/providers/`
2. Implement standard interface:
   - `detectPlatform()`
   - `sendPrompt(prompt)`
   - `getResponse()`
3. Register in `manifest.json`

### Creating Custom Commands

Edit `background/commands.js`:

```javascript
const CUSTOM_COMMANDS = {
  '/summarize': {
    prompt: "Summarize this page in 3 bullet points",
    includeContext: true
  },
  '/extract-emails': {
    prompt: "Extract all email addresses from this page",
    format: 'json'
  }
};
```

### Styling the Sidebar

Edit `content/sidebar.css` to customize appearance.

## 🔐 Privacy & Security

### Data Handling

- **No External Servers**: All processing happens in your browser
- **No Data Collection**: Extension doesn't log or transmit data
- **Uses Your Sessions**: Leverages your existing AI platform logins
- **Local Storage Only**: Settings stored in Chrome's local storage

### Permissions Explained

- `<all_urls>`: Required to inject sidebar on any page
- `tabs`: Manage AI platform tabs
- `storage`: Save settings and command history
- `scripting`: Inject content scripts
- `clipboardWrite`: Copy AI responses

## 🆚 Comparison

| Feature | Ultimate AI Wrapper | HARPA.AI | TeamAI |
|---------|---------------------|----------|--------|
| Open Source | ✅ Yes | ❌ No | ❌ No |
| Free | ✅ Yes | 💰 Freemium | 💰 Paid |
| Multi-Model | ✅ 5+ Models | ✅ 5+ Models | ✅ 20+ Models |
| No API Keys | ✅ Uses Sessions | 💰 Requires Plan | ❌ Requires APIs |
| Browser Automation | ✅ Full | ✅ Full | ⚠️ Limited |
| Customizable | ✅ Fully | ⚠️ Limited | ⚠️ Limited |
| Alt+A Shortcut | ✅ Yes | ✅ Yes | ❌ No |

## 🛠️ Development

### Project Structure

```
ultimate-ai-wrapper/
├── manifest.json                 # Extension config
├── background/
│   ├── service-worker.js         # Background service
│   └── commands.js               # Custom command definitions
├── content/
│   ├── ai-injector.js            # Main content script
│   ├── sidebar.js                # Sidebar logic
│   ├── sidebar.html              # Sidebar UI
│   ├── sidebar.css               # Sidebar styles
│   └── providers/
│       ├── chatgpt-adapter.js    # ChatGPT wrapper
│       ├── claude-adapter.js     # Claude wrapper
│       ├── gemini-adapter.js     # Gemini wrapper
│       ├── perplexity-adapter.js # Perplexity wrapper
│       └── grok-adapter.js       # Grok wrapper
├── popup/
│   ├── popup.html                # Extension popup
│   ├── popup.js                  # Popup logic
│   └── popup.css                 # Popup styles
└── icons/                        # Extension icons
```

### Building from Source

```bash
# Install development dependencies (none required - vanilla JS!)
# This is intentionally dependency-free

# Make changes
# Test by reloading extension in chrome://extensions/
```

### Testing

1. Load extension in Chrome
2. Open DevTools Console
3. Navigate to any webpage
4. Press `Alt+A` to test sidebar
5. Check console for logs

## 📝 Roadmap

- [ ] **Voice Input**: Speak to AI models
- [ ] **Screenshot Analysis**: Visual AI integration
- [ ] **Workflow Builder**: Visual automation designer
- [ ] **Team Collaboration**: Share commands and workflows
- [ ] **Mobile Support**: Port to mobile browsers
- [ ] **Local AI**: Integrate Ollama for offline use
- [ ] **API Integration**: Optional API key support
- [ ] **Chrome Web Store**: Official distribution

## 🤝 Contributing

Contributions welcome! Areas needing help:

1. **AI Adapter Improvements**: Better DOM selectors
2. **New AI Platforms**: Add more providers
3. **UI/UX**: Improve sidebar design
4. **Documentation**: Expand guides
5. **Testing**: Cross-browser compatibility

## 📄 License

MIT License - See LICENSE file

## 🙏 Acknowledgments

- **HARPA.AI**: Inspiration for architecture
- **ChatGPT, Claude, Gemini, Perplexity, Grok**: AI platforms
- **Open Source Community**: For feedback and contributions

## 🐛 Troubleshooting

### Sidebar Not Appearing

1. Check extension is enabled
2. Try reloading the page
3. Check console for errors
4. Verify `Alt+A` shortcut isn't conflicting

### AI Not Responding

1. Ensure you're logged into the AI platform
2. Open AI platform directly to verify access
3. Check adapter DOM selectors (may need updates)
4. Clear extension storage and retry

### Performance Issues

1. Close unused AI tabs
2. Disable adapters you don't use
3. Reduce context size in settings
4. Check Chrome Task Manager

## 📧 Support

- **Issues**: https://github.com/Agentoma/ultimate-ai-wrapper/issues
- **Discussions**: GitHub Discussions
- **Email**: Not provided (use Issues)

---

**Built with ❤️ for the automation community**

**Reverse-engineered from HARPA.AI's brilliant architecture**

*"The best AI tools are the ones you build yourself"*
