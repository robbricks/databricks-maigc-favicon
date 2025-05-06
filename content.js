// Function to create a colored favicon
function createColoredFavicon(color) {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  // Draw a colored circle
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(16, 16, 16, 0, Math.PI * 2);
  ctx.fill();
  
  // Convert canvas to data URL
  return canvas.toDataURL('image/png');
}

// Function to change the favicon
function changeFavicon(color) {
  // Create new favicon link
  const link = document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'icon';
  link.href = createColoredFavicon(color);
  
  // Remove all existing favicon links
  const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
  existingFavicons.forEach(favicon => favicon.remove());
  
  // Add new favicon
  document.head.appendChild(link);
  
  // Also set shortcut icon for IE
  const shortcutLink = document.createElement('link');
  shortcutLink.type = 'image/x-icon';
  shortcutLink.rel = 'shortcut icon';
  shortcutLink.href = createColoredFavicon(color);
  document.head.appendChild(shortcutLink);
}

// Function to restore original favicon
function restoreOriginalFavicon() {
  // Remove all existing favicon links
  const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
  existingFavicons.forEach(favicon => favicon.remove());
  
  // Find the original favicon in the document
  const originalFavicon = document.querySelector('link[rel*="icon"]');
  if (originalFavicon) {
    // Clone and re-add the original favicon
    const newFavicon = originalFavicon.cloneNode(true);
    document.head.appendChild(newFavicon);
  }
}

// Function to create or update the top bar
function updateTopBar(color) {
  let bar = document.getElementById('custom-top-bar');
  
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'custom-top-bar';
    bar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      z-index: 9999;
    `;
    document.body.appendChild(bar);
  }
  
  bar.style.backgroundColor = color;
}

// Function to check URL and update favicon/top bar
function checkAndUpdate() {
  chrome.storage.sync.get(['keywords', 'showBar', 'enableFavicon'], function(result) {
    if (result.keywords) {
      const currentUrl = window.location.href.toLowerCase();
      console.log('Checking URL:', currentUrl);
      let matched = false;
      
      for (const { keyword, color } of result.keywords) {
        if (currentUrl.includes(keyword.toLowerCase())) {
          console.log('Keyword matched:', keyword, 'Color:', color);
          
          // Always update top bar if showBar is true
          if (result.showBar) {
            updateTopBar(color);
          } else {
            const bar = document.getElementById('custom-top-bar');
            if (bar) {
              bar.remove();
            }
          }
          
          // Only change favicon if enableFavicon is true
          if (result.enableFavicon) {
            changeFavicon(color);
          } else {
            restoreOriginalFavicon();
          }
          
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        console.log('No keyword matched');
        // Remove top bar if no match
        const bar = document.getElementById('custom-top-bar');
        if (bar) {
          bar.remove();
        }
        
        // Only restore original favicon if enableFavicon is true
        if (result.enableFavicon) {
          restoreOriginalFavicon();
        }
      }
    } else {
      console.log('No keywords configured');
      // Remove top bar if no keywords
      const bar = document.getElementById('custom-top-bar');
      if (bar) {
        bar.remove();
      }
      // Restore original favicon
      restoreOriginalFavicon();
    }
  });
}

// Initial check
checkAndUpdate();

// Set up MutationObserver to detect URL changes
const observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.type === 'attributes' && mutation.attributeName === 'href') {
      console.log('URL attribute changed');
      checkAndUpdate();
    }
  });
});

// Observe the document for URL changes
observer.observe(document, {
  attributes: true,
  attributeFilter: ['href'],
  childList: true,
  subtree: true
});

// Listen for history changes
window.addEventListener('popstate', function() {
  console.log('popstate event triggered');
  checkAndUpdate();
});

// Override history methods to catch URL changes
const originalPushState = history.pushState;
history.pushState = function() {
  console.log('pushState called');
  originalPushState.apply(this, arguments);
  checkAndUpdate();
};

const originalReplaceState = history.replaceState;
history.replaceState = function() {
  console.log('replaceState called');
  originalReplaceState.apply(this, arguments);
  checkAndUpdate();
};

// Also listen for hash changes
window.addEventListener('hashchange', function() {
  console.log('hashchange event triggered');
  checkAndUpdate();
}); 