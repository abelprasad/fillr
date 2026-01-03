// Background service worker for Fillr extension

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Fillr extension installed successfully');
  } else if (details.reason === 'update') {
    console.log('Fillr extension updated');
  }

  // Create context menu for AI question answering
  chrome.contextMenus.create({
    id: 'fillr-up',
    title: 'Fillr Up ✨',
    contexts: ['editable']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'fillr-up') {
    console.log('🔵 Context menu clicked, sending message to tab:', tab.id);

    // Send message to content script to generate AI answer
    chrome.tabs.sendMessage(
      tab.id,
      {
        action: 'fillrUp',
        frameId: info.frameId
      },
      (response) => {
        // Check for errors
        if (chrome.runtime.lastError) {
          console.error('❌ Error sending message:', chrome.runtime.lastError.message);
          return;
        }

        console.log('✅ Response from content script:', response);
      }
    );
  }
});

// Keep service worker alive if needed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle any background messages here if needed in future
  return true;
});

console.log('Fillr background service worker loaded');
