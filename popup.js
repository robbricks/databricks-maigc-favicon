document.addEventListener('DOMContentLoaded', function() {
  // Get the current tab's URL
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentUrl = tabs[0].url;
    document.getElementById('url-display').textContent = currentUrl;
  });
}); 