// Listen for tab updates
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    // Tab has finished loading
    console.log('Tab updated:', tab.url);
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  if (request.type === 'getSettings') {
    chrome.storage.sync.get(null, (items) => {
      sendResponse(items);
    });
    return true; // Required for async sendResponse
  }
  
  if (request.type === 'saveSettings') {
    chrome.storage.sync.set(request.settings, () => {
      sendResponse({ success: true });
    });
    return true; // Required for async sendResponse
  }
}); 