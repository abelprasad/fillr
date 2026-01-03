// Background service worker for Fillr extension
// Minimal implementation for v1

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Fillr extension installed successfully');

    // Open welcome page or show notification
    // For v1, we'll just log it
  } else if (details.reason === 'update') {
    console.log('Fillr extension updated');
  }
});

// Keep service worker alive if needed
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle any background messages here if needed in future
  // For v1, we primarily use content script to popup communication
  return true;
});

console.log('Fillr background service worker loaded');
