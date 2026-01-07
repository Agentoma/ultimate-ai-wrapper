/**
 * Ultimate AI Wrapper - Service Worker
 * The brain of the extension - coordinates all AI interactions
 * Reverse-engineered from HARPA.AI architecture
 */

console.log('🚀 Ultimate AI Wrapper Service Worker initialized');

// ============================================================================
// CONFIGURATION & STATE MANAGEMENT
// ============================================================================

const AI_PROVIDERS = {
  chatgpt: {
    name: 'ChatGPT',
    url: 'https://chat.openai.com',
    icon: '🤖',
    enabled: true
  },
  claude: {
    name: 'Claude',
    url: 'https://claude.ai',
    icon: '🎭',
    enabled: true
  },
  gemini: {
    name: 'Gemini',
    url: 'https://gemini.google.com',
    icon: '✨',
    enabled: true
  },
  perplexity: {
    name: 'Perplexity',
    url: 'https://www.perplexity.ai',
    icon: '🔍',
    enabled: true
  },
  grok: {
    name: 'Grok',
    url: 'https://x.ai/grok',
    icon: '🦅',
    enabled: true
  }
};

// Extension state
const state = {
  activeTabs: new Map(), // Track AI provider tabs
  sidebarVisible: false,
  currentProvider: 'chatgpt',
  sessionData: {}
};

// ============================================================================
// EXTENSION LIFECYCLE
// ============================================================================

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('📦 Extension installed/updated:', details.reason);
  
  // Initialize storage
  await chrome.storage.local.set({
    providers: AI_PROVIDERS,
    settings: {
      autoOpen: false,
      defaultProvider: 'chatgpt',
      multiModel: true,
      contextSize: 10000
    },
    history: []
  });
  
  // Create context menu
  chrome.contextMenus.create({
    id: 'send-to-ai',
    title: 'Send to Ultimate AI',
    contexts: ['selection']
  });
  
  console.log('✅ Extension ready');
});

// ============================================================================
// COMMAND HANDLING (Alt+A, Alt+Shift+A)
// ============================================================================

chrome.commands.onCommand.addListener(async (command) => {
  console.log('⌨️ Command received:', command);
  
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  switch (command) {
    case '_execute_action':
      // Toggle sidebar (Alt+A)
      await toggleSidebar(tab.id);
      break;
      
    case 'send-to-all':
      // Send prompt to all AI models (Alt+Shift+A)
      await sendToAllModels(tab.id);
      break;
  }
});

async function toggleSidebar(tabId) {
  state.sidebarVisible = !state.sidebarVisible;
  
  // Send message to content script
  try {
    await chrome.tabs.sendMessage(tabId, {
      action: 'toggleSidebar',
      visible: state.sidebarVisible
    });
    console.log('📱 Sidebar toggled:', state.sidebarVisible);
  } catch (error) {
    console.error('❌ Error toggling sidebar:', error);
  }
}

async function sendToAllModels(tabId) {
  console.log('📤 Sending to all AI models');
  
  // Get current page context
  const pageContext = await getPageContext(tabId);
  
  // Send to each enabled provider
  const promises = [];
  for (const [key, provider] of Object.entries(AI_PROVIDERS)) {
    if (provider.enabled) {
      promises.push(sendToProvider(key, pageContext));
    }
  }
  
  await Promise.all(promises);
  console.log('✅ Sent to all models');
}

// ============================================================================
// AI PROVIDER TAB MANAGEMENT
// ============================================================================

async function getProviderTab(providerId) {
  // Check if we already have a tab for this provider
  if (state.activeTabs.has(providerId)) {
    const tabId = state.activeTabs.get(providerId);
    try {
      const tab = await chrome.tabs.get(tabId);
      if (tab) return tab;
    } catch (error) {
      // Tab no longer exists
      state.activeTabs.delete(providerId);
    }
  }
  
  // Create new tab for provider
  const provider = AI_PROVIDERS[providerId];
  const tab = await chrome.tabs.create({
    url: provider.url,
    active: false // Open in background
  });
  
  state.activeTabs.set(providerId, tab.id);
  console.log(`🔗 Created tab for ${provider.name}:`, tab.id);
  
  return tab;
}

async function sendToProvider(providerId, context) {
  console.log(`📨 Sending to ${providerId}`);
  
  try {
    const tab = await getProviderTab(providerId);
    
    // Wait for tab to load
    await waitForTabLoad(tab.id);
    
    // Send prompt to adapter
    await chrome.tabs.sendMessage(tab.id, {
      action: 'sendPrompt',
      prompt: context.prompt,
      context: context
    });
    
    return { provider: providerId, status: 'sent' };
  } catch (error) {
    console.error(`❌ Error sending to ${providerId}:`, error);
    return { provider: providerId, status: 'error', error };
  }
}

// ============================================================================
// MESSAGE ROUTING
// ============================================================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📬 Message received:', message.action, 'from tab:', sender.tab?.id);
  
  // Handle async responses
  (async () => {
    try {
      let response;
      
      switch (message.action) {
        case 'getProviders':
          response = AI_PROVIDERS;
          break;
          
        case 'getSettings':
          response = await chrome.storage.local.get('settings');
          break;
          
        case 'updateSettings':
          await chrome.storage.local.set({ settings: message.settings });
          response = { success: true };
          break;
          
        case 'sendPrompt':
          response = await sendToProvider(message.provider, message.context);
          break;
          
        case 'sendToAll':
          const results = [];
          for (const [key, provider] of Object.entries(AI_PROVIDERS)) {
            if (provider.enabled) {
              const result = await sendToProvider(key, message.context);
              results.push(result);
            }
          }
          response = { results };
          break;
          
        case 'getPageContext':
          response = await getPageContext(sender.tab.id);
          break;
          
        case 'saveHistory':
          await saveToHistory(message.data);
          response = { success: true };
          break;
          
        case 'getHistory':
          const history = await chrome.storage.local.get('history');
          response = history.history || [];
          break;
          
        default:
          response = { error: 'Unknown action' };
      }
      
      sendResponse(response);
    } catch (error) {
      console.error('❌ Error handling message:', error);
      sendResponse({ error: error.message });
    }
  })();
  
  // Keep message channel open for async response
  return true;
});

// ============================================================================
// CONTEXT MENU
// ============================================================================

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'send-to-ai') {
    console.log('🖱️ Context menu: Send to AI');
    
    const context = {
      prompt: info.selectionText,
      url: tab.url,
      title: tab.title
    };
    
    // Open sidebar with selected text
    await chrome.tabs.sendMessage(tab.id, {
      action: 'openWithPrompt',
      prompt: info.selectionText,
      context: context
    });
  }
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

async function getPageContext(tabId) {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      function: extractPageContext
    });
    
    return result.result;
  } catch (error) {
    console.error('❌ Error getting page context:', error);
    return {};
  }
}

// This function runs in the page context
function extractPageContext() {
  return {
    url: window.location.href,
    title: document.title,
    content: document.body.innerText.slice(0, 10000),
    selectedText: window.getSelection().toString(),
    timestamp: Date.now()
  };
}

async function waitForTabLoad(tabId, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const checkStatus = async () => {
      try {
        const tab = await chrome.tabs.get(tabId);
        
        if (tab.status === 'complete') {
          resolve(tab);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Tab load timeout'));
        } else {
          setTimeout(checkStatus, 100);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    checkStatus();
  });
}

async function saveToHistory(data) {
  const storage = await chrome.storage.local.get('history');
  const history = storage.history || [];
  
  history.unshift({
    ...data,
    timestamp: Date.now()
  });
  
  // Keep only last 100 entries
  if (history.length > 100) {
    history.length = 100;
  }
  
  await chrome.storage.local.set({ history });
}

// ============================================================================
// TAB MONITORING
// ============================================================================

// Track when AI provider tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  // Remove from active tabs
  for (const [provider, id] of state.activeTabs.entries()) {
    if (id === tabId) {
      state.activeTabs.delete(provider);
      console.log(`🗑️ Provider tab closed: ${provider}`);
      break;
    }
  }
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

self.addEventListener('error', (event) => {
  console.error('❌ Service Worker Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled Promise Rejection:', event.reason);
});

console.log('✅ Service Worker ready - Alt+A to activate!');
