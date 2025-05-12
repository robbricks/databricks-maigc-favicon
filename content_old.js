// Function to create a colored favicon
async function createColoredFavicon(color) {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  // Get the current favicon style
  const result = await chrome.storage.sync.get(['faviconStyle']);
  const style = result.faviconStyle || 'bar';
  
  // Draw a default white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 32, 32);
  
  // Find the original favicon
  const originalFavicon = document.querySelector('link[rel*="icon"]');
  if (originalFavicon && originalFavicon.href) {
    try {
      // Load the original favicon
      const img = await new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = originalFavicon.href;
      });
      
      switch (style) {
        case 'original':
          // Just draw the original favicon
          ctx.drawImage(img, 0, 0, 32, 32);
          break;
        case 'circle':
          // Draw a colored circle
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(16, 16, 16, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'bar':
        default:
          // Draw the original favicon with colored bar
          ctx.drawImage(img, 0, 0, 32, 32);
          ctx.fillStyle = color;
          ctx.fillRect(0, 23, 32, 9); // 9px height bar at the bottom
          break;
      }
    } catch (error) {
      console.error('Error loading original favicon:', error);
      // If loading fails, draw a default icon
      ctx.fillStyle = '#CCCCCC';
      ctx.fillRect(8, 8, 16, 16);
      
      // Add colored bar for 'bar' style even if original fails
      if (style === 'bar') {
        ctx.fillStyle = color;
        ctx.fillRect(0, 23, 32, 9);
      }
    }
  } else {
    // If no original favicon, draw a default icon
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(8, 8, 16, 16);
    
    // Add colored bar for 'bar' style even if no original
    if (style === 'bar') {
      ctx.fillStyle = color;
      ctx.fillRect(0, 23, 32, 9);
    }
  }
  
  // Convert canvas to data URL
  return canvas.toDataURL('image/png');
}

// Function to change the favicon
async function changeFavicon(color) {
  try {
    const faviconDataUrl = await createColoredFavicon(color);
    
    // Create new favicon link
    const link = document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'icon';
    link.href = faviconDataUrl;
    
    // Remove all existing favicon links
    const existingFavicons = document.querySelectorAll('link[rel*="icon"]');
    existingFavicons.forEach(favicon => favicon.remove());
    
    // Add new favicon
    document.head.appendChild(link);
    
    // Also set shortcut icon for IE
    const shortcutLink = document.createElement('link');
    shortcutLink.type = 'image/x-icon';
    shortcutLink.rel = 'shortcut icon';
    shortcutLink.href = faviconDataUrl;
    document.head.appendChild(shortcutLink);
  } catch (error) {
    console.error('Error changing favicon:', error);
  }
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
  chrome.storage.sync.get(['keywords', 'showBar'], function(result) {
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
          
          // Change favicon
          changeFavicon(color);
          
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
        
        // Restore original favicon
        restoreOriginalFavicon();
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