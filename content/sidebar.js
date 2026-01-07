/**
 * Ultimate AI Wrapper - Sidebar Manager
 * Injects and controls the sidebar interface on all pages
 * HARPA-style implementation
 */

console.log('🎨 Sidebar script loaded');

let sidebarIframe = null;
let isVisible = false;
let currentProvider = 'chatgpt';
let includeContext = false;

// ============================================================================
// SIDEBAR INJECTION
// ============================================================================

function createSidebar() {
  if (sidebarIframe) return;
  
  console.log('✨ Creating sidebar');
  
  // Create iframe container
  sidebarIframe = document.createElement('iframe');
  sidebarIframe.id = 'ultimate-ai-sidebar';
  sidebarIframe.src = chrome.runtime.getURL('content/sidebar.html');
  
  // Styling
  Object.assign(sidebarIframe.style, {
    position: 'fixed',
    top: '0',
    right: '-420px', // Hidden initially
    width: '420px',
    height: '100vh',
    border: 'none',
    zIndex: '2147483647',
    boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.3)',
    transition: 'right 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
    background: 'transparent'
  });
  
  document.body.appendChild(sidebarIframe);
  
  // Setup message listener for iframe communication
  window.addEventListener('message', handleSidebarMessage);
  
  console.log('✅ Sidebar created');
}

function toggleSidebar() {
  if (!sidebarIframe) {
    createSidebar();
  }
  
  isVisible = !isVisible;
  
  if (isVisible) {
    sidebarIframe.style.right = '0';
    console.log('👁️ Sidebar shown');
  } else {
    sidebarIframe.style.right = '-420px';
    console.log('🙈 Sidebar hidden');
  }
}

function removeSidebar() {
  if (sidebarIframe) {
    sidebarIframe.remove();
    sidebarIframe = null;
    isVisible = false;
    console.log('🗑️ Sidebar removed');
  }
}

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

function handleSidebarMessage(event) {
  // Verify message is from our sidebar
  if (event.source !== sidebarIframe?.contentWindow) return;
  
  const { action, data } = event.data;
  
  console.log('📨 Sidebar message:', action, data);
  
  switch (action) {
    case 'close':
      toggleSidebar();
      break;
      
    case 'sendPrompt':
      sendPromptToAI(data);
      break;
      
    case 'sendToAll':
      sendToAllProviders(data);
      break;
      
    case 'selectProvider':
      currentProvider = data.provider;
      break;
      
    case 'toggleContext':
      includeContext = data.enabled;
      break;
  }
}

async function sendPromptToAI(data) {
  const { prompt, provider } = data;
  
  console.log(`📤 Sending to ${provider}:`, prompt);
  
  // Get page context if enabled
  let context = {};
  if (includeContext) {
    context = await getPageContext();
  }
  
  // Send to service worker
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'sendPrompt',
      provider: provider || currentProvider,
      context: {
        prompt,
        ...context
      }
    });
    
    // Send response back to sidebar
    sidebarIframe.contentWindow.postMessage({
      action: 'response',
      data: response
    }, '*');
    
    console.log('✅ Prompt sent');
  } catch (error) {
    console.error('❌ Error sending prompt:', error);
    sidebarIframe.contentWindow.postMessage({
      action: 'error',
      data: { message: error.message }
    }, '*');
  }
}

async function sendToAllProviders(data) {
  const { prompt } = data;
  
  console.log('📤 Sending to ALL models:', prompt);
  
  // Get page context if enabled
  let context = {};
  if (includeContext) {
    context = await getPageContext();
  }
  
  // Send to service worker
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'sendToAll',
      context: {
        prompt,
        ...context
      }
    });
    
    // Send responses back to sidebar
    sidebarIframe.contentWindow.postMessage({
      action: 'multiResponse',
      data: response
    }, '*');
    
    console.log('✅ Sent to all models');
  } catch (error) {
    console.error('❌ Error sending to all:', error);
  }
}

// ============================================================================
// CONTEXT EXTRACTION
// ============================================================================

function getPageContext() {
  return {
    url: window.location.href,
    title: document.title,
    content: document.body.innerText.slice(0, 10000),
    selectedText: window.getSelection().toString(),
    timestamp: Date.now()
  };
}

// ============================================================================
// MESSAGE LISTENER (from service worker)
// ============================================================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📬 Message from background:', message.action);
  
  switch (message.action) {
    case 'toggleSidebar':
      toggleSidebar();
      sendResponse({ success: true });
      break;
      
    case 'openWithPrompt':
      if (!isVisible) {
        toggleSidebar();
      }
      // Wait for sidebar to load, then send prompt
      setTimeout(() => {
        sidebarIframe?.contentWindow.postMessage({
          action: 'setPrompt',
          data: { prompt: message.prompt }
        }, '*');
      }, 300);
      sendResponse({ success: true });
      break;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
  
  return true; // Keep message channel open
});

// ============================================================================
// KEYBOARD SHORTCUTS
// ============================================================================

document.addEventListener('keydown', (e) => {
  // Alt+A - Toggle sidebar
  if (e.altKey && e.key === 'a') {
    e.preventDefault();
    toggleSidebar();
  }
  
  // Alt+Shift+A - Send to all models
  if (e.altKey && e.shiftKey && e.key === 'A') {
    e.preventDefault();
    if (!isVisible) {
      toggleSidebar();
    }
    // Trigger send to all from sidebar
    sidebarIframe?.contentWindow.postMessage({
      action: 'triggerSendAll'
    }, '*');
  }
  
  // Escape - Close sidebar
  if (e.key === 'Escape' && isVisible) {
    toggleSidebar();
  }
});

// ============================================================================
// AUTO-INITIALIZATION
// ============================================================================

// Create sidebar on load (hidden)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createSidebar);
} else {
  createSidebar();
}

console.log('✅ Sidebar manager ready - Press Alt+A to activate!');
