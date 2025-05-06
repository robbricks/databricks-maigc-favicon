// Listen for tab updates
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete') {
    // Tab has finished loading
    console.log('Tab updated:', tab.url);
  }
}); 