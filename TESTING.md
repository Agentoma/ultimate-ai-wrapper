# Testing Guide - Ultimate AI Wrapper

## Quick Test - Load Extension in Chrome

### Step 1: Download the Extension

```bash
git clone https://github.com/Agentoma/ultimate-ai-wrapper.git
cd ultimate-ai-wrapper
```

### Step 2: Load in Chrome

1. Open Chrome
2. Navigate to `chrome://extensions/`
3. Enable **"Developer mode"** (toggle in top-right corner)
4. Click **"Load unpacked"**
5. Select the `ultimate-ai-wrapper` folder
6. Extension should load with no errors

### Step 3: Verify Installation

**Check for these indicators:**
- ✅ Extension appears in `chrome://extensions/`
- ✅ No red error messages
- ✅ Service worker shows as "active"
- ✅ Extension icon appears in Chrome toolbar (may need to pin it)

### Step 4: Test Basic Functionality

#### Test 1: Sidebar Toggle
1. Open any webpage (e.g., `https://google.com`)
2. Press `Alt+A`
3. **Expected**: Sidebar slides in from the right with purple gradient background
4. Press `Alt+A` again
5. **Expected**: Sidebar slides out

#### Test 2: Console Logging
1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Reload the page
4. **Expected console messages:**
   ```
   🚀 Ultimate AI Wrapper Service Worker initialized
   ✅ Extension ready
   🎨 Sidebar script loaded
   ✨ Creating sidebar
   ✅ Sidebar created
   ✅ Sidebar manager ready - Press Alt+A to activate!
   ```

#### Test 3: Service Worker Status
1. Go to `chrome://extensions/`
2. Find "Ultimate AI Wrapper"
3. Click "Service worker" link
4. DevTools opens for service worker
5. **Expected**: No errors, logs show initialization

#### Test 4: Provider Selection
1. Press `Alt+A` to open sidebar
2. Click on different AI provider buttons:
   - 🤖 ChatGPT
   - 🎭 Claude
   - ✨ Gemini
   - 🔍 Perplexity
   - 🦅 Grok
3. **Expected**: Clicked button highlights with glow effect

#### Test 5: Input Area
1. Open sidebar (`Alt+A`)
2. Click in the "Ask anything..." textarea
3. Type some text
4. **Expected**: 
   - Text appears in input
   - Textarea expands as needed
   - Send button becomes active

## Current Limitations

### ⚠️ Known Issues

**Missing AI Adapters**: The extension currently lacks provider-specific adapters, so:
- ❌ Sending prompts won't work yet (no AI connection)
- ❌ "Send to all" button won't function
- ✅ UI and controls work perfectly
- ✅ Sidebar displays correctly
- ✅ Keyboard shortcuts work
- ✅ Message passing infrastructure is ready

### What Works Right Now:

✅ **Service Worker**
- Loads and initializes
- Registers keyboard shortcuts
- Sets up message listeners
- Manages extension state

✅ **Sidebar UI**
- Slides in/out smoothly
- Beautiful gradient design
- Provider buttons clickable
- Input area responsive
- Keyboard shortcuts (Alt+A, Escape)

✅ **Content Script**
- Injects on all pages
- Creates iframe for sidebar
- Handles message passing
- Context extraction ready

### What Needs Implementation:

❌ **AI Provider Adapters** (Coming Next)
- `content/providers/chatgpt-adapter.js`
- `content/providers/claude-adapter.js`
- `content/providers/gemini-adapter.js`
- `content/providers/perplexity-adapter.js`
- `content/providers/grok-adapter.js`

## Expected Test Results

### ✅ Success Criteria

**Installation:**
- Extension loads without errors
- All files parse correctly (no syntax errors)
- Service worker shows as "active"

**UI Tests:**
- Sidebar appears on Alt+A
- Sidebar has gradient purple/blue background
- 5 AI provider buttons visible
- Input field accepts text
- Close button (×) works
- Escape key closes sidebar

**Console Tests:**
- Service worker logs initialization
- Sidebar script logs "ready" message
- No error messages in red

### ❌ Known Failures (Expected)

**These will fail until adapters are implemented:**
- Clicking "Send" button → No response (adapters not built)
- "Send to all" button → No action (adapters not built)
- Responses area stays empty (no AI connection)

## Debugging

### If Extension Won't Load:

1. **Check manifest.json syntax**
   ```bash
   # Verify JSON is valid
   cat manifest.json | python -m json.tool
   ```

2. **Check file structure**
   ```
   ultimate-ai-wrapper/
   ├── manifest.json
   ├── README.md
   ├── background/
   │   └── service-worker.js
   └── content/
       ├── sidebar.html
       └── sidebar.js
   ```

3. **Check for syntax errors**
   - Look at Chrome DevTools console
   - Check service worker console
   - Fix any red error messages

### If Sidebar Doesn't Appear:

1. **Check content script injection**
   - Open DevTools Console
   - Look for "Sidebar script loaded" message
   - If missing, content script didn't inject

2. **Check keyboard shortcut**
   - Go to `chrome://extensions/shortcuts`
   - Verify Alt+A is assigned to extension
   - No conflicts with other extensions

3. **Check iframe creation**
   - Open DevTools
   - Inspect page elements
   - Look for `<iframe id="ultimate-ai-sidebar">`
   - Check iframe styles (right position)

### If Provider Buttons Don't Work:

1. **Check click handlers**
   - Open sidebar.html directly (right-click iframe → Inspect)
   - Check for JavaScript errors
   - Verify buttons have `data-provider` attributes

2. **Check message passing**
   - Console should show "Sidebar message" logs
   - Verify window.postMessage is working

## Performance Tests

### Memory Usage
1. Open Chrome Task Manager (Shift+Esc)
2. Find "Ultimate AI Wrapper"
3. **Expected**: < 50MB memory usage

### CPU Usage
1. Open sidebar
2. Check Task Manager
3. **Expected**: Minimal CPU when idle

## Next Steps

Once basic tests pass:

1. **Create AI Adapters** (Priority)
   - Start with ChatGPT adapter
   - Test with actual ChatGPT website
   - Implement remaining 4 adapters

2. **Test Full Workflow**
   - Open ChatGPT in tab
   - Send prompt via sidebar
   - Verify adapter fills ChatGPT input
   - Verify response extraction

3. **Test Multi-Model**
   - Send to all 5 AIs
   - Verify tabs open correctly
   - Verify parallel processing

## Test Checklist

- [ ] Extension loads without errors
- [ ] Service worker initializes
- [ ] Alt+A opens sidebar
- [ ] Sidebar displays correctly
- [ ] Provider buttons clickable
- [ ] Input field works
- [ ] Close button works
- [ ] Escape key closes sidebar
- [ ] No console errors
- [ ] Memory usage acceptable
- [ ] Keyboard shortcuts registered

## Reporting Issues

If you find bugs:

1. Check DevTools Console for errors
2. Check Service Worker console
3. Note which test failed
4. Report with:
   - Chrome version
   - Error messages
   - Steps to reproduce

---

**Status**: ✅ Core infrastructure ready for testing
**Next**: Implement AI provider adapters for full functionality
