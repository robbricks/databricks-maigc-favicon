let topBar = null;
let currentFavicon = null;

// Function to create a colored favicon
async function createColoredFavicon(color) {
  // Create a canvas element
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  
  // Get the current favicon style
  const result = await chrome.storage.sync.get(['faviconStyle']);
  const style = result.faviconStyle || 'color-bar';
  
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
        case 'colored-circle':
          // Draw a colored circle
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(16, 16, 16, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'color-bar':
        default:
          // Draw the original favicon with colored bar
          ctx.drawImage(img, 0, 0, 32, 28); // Draw favicon slightly higher
          ctx.fillStyle = color;
          ctx.fillRect(0, 28, 32, 4); // Smaller 4px height bar at the bottom
          break;
      }
    } catch (error) {
      console.error('Error loading original favicon:', error);
      // If loading fails, draw a default icon
      ctx.fillStyle = '#CCCCCC';
      ctx.fillRect(8, 8, 16, 16);
      
      // Add colored bar for 'color-bar' style even if original fails
      if (style === 'color-bar') {
        ctx.fillStyle = color;
        ctx.fillRect(0, 28, 32, 4); // Smaller 4px height bar
      }
    }
  } else {
    // If no original favicon, draw a default icon
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(8, 8, 16, 16);
    
    // Add colored bar for 'color-bar' style even if no original
    if (style === 'color-bar') {
      ctx.fillStyle = color;
      ctx.fillRect(0, 28, 32, 4); // Smaller 4px height bar
    }
  }
  
  // Convert canvas to data URL
  return canvas.toDataURL('image/png');
}

// Function to create a colored favicon with a color bar
function createColoredFaviconWithBar(color, callback) {
  // Try multiple common favicon paths
  const faviconPaths = [
    window.location.origin + '/favicon.ico',
    window.location.origin + '/favicon.png',
    window.location.origin + '/images/favicon.ico',
    window.location.origin + '/images/favicon.png',
    window.location.origin + '/assets/favicon.ico',
    window.location.origin + '/assets/favicon.png'
  ];

  // For Power BI specifically
  if (window.location.hostname.includes('powerbi.com')) {
    faviconPaths.unshift('https://app.powerbi.com/favicon.ico');
  }

  let currentPathIndex = 0;

  function tryNextFavicon() {
    if (currentPathIndex >= faviconPaths.length) {
      // If all paths failed, create a colored circle with bar
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      
      // Draw colored circle
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(16, 16, 14, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw color bar
      ctx.fillStyle = color;
      ctx.fillRect(0, 28, 32, 4);
      
      callback(canvas.toDataURL('image/png'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = faviconPaths[currentPathIndex];
    
    img.onload = function() {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 32, 28); // Draw original favicon
      ctx.fillStyle = color;
      ctx.fillRect(0, 28, 32, 4); // Draw color bar
      callback(canvas.toDataURL('image/png'));
    };
    
    img.onerror = function() {
      currentPathIndex++;
      tryNextFavicon();
    };
  }

  tryNextFavicon();
}

// Function to change the favicon
async function changeFavicon(color, style) {
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

function setFavicon(dataUrl) {
  const link = document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'icon';
  link.href = dataUrl;
  // Remove existing favicon
  const existingFavicon = document.querySelector('link[rel="icon"]');
  if (existingFavicon) existingFavicon.remove();
  document.head.appendChild(link);
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

// Function to create or update the environment watermark
function updateEnvWatermark(env, color) {
  let watermark = document.getElementById('env-watermark');
  
  if (!watermark) {
    watermark = document.createElement('div');
    watermark.id = 'env-watermark';
    watermark.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 28px;
      font-weight: bold;
      z-index: 9999;
      opacity: 0.7;
      cursor: move;
      user-select: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      transition: opacity 0.2s ease;
    `;

    // Make the watermark draggable
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    watermark.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;

      if (e.target === watermark) {
        isDragging = true;
        watermark.style.opacity = '0.9';
      }
    }

    function drag(e) {
      if (isDragging) {
        e.preventDefault();
        
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, watermark);
      }
    }

    function setTranslate(xPos, yPos, el) {
      el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    function dragEnd(e) {
      initialX = currentX;
      initialY = currentY;
      isDragging = false;
      watermark.style.opacity = '0.7';
    }

    document.body.appendChild(watermark);
  }
  
  watermark.textContent = env;
  watermark.style.backgroundColor = color;
  watermark.style.color = '#FFFFFF';
}

// Check if the URL contains any of the stored keywords
chrome.storage.sync.get(['keywords', 'showBar', 'faviconStyle'], function(result) {
  if (result.keywords) {
    const currentUrl = window.location.href.toLowerCase();
    for (const { keyword, color, env } of result.keywords) {
      // Handle string, array, and comma-separated string of keywords
      let keywords;
      if (Array.isArray(keyword)) {
        keywords = keyword;
      } else if (typeof keyword === 'string') {
        // Split by comma and handle both with and without spaces
        keywords = keyword.split(',').map(k => k.trim()).filter(k => k.length > 0);
      } else {
        keywords = [keyword];
      }
      
      console.log('Checking keywords:', keywords);
      
      // Check if any of the keywords match
      if (keywords.some(k => currentUrl.includes(k.toLowerCase()))) {
        console.log('Match found for keywords:', keywords);
        if (result.faviconStyle) {
          changeFavicon(color, result.faviconStyle);
        }
        if (result.showBar) {
          updateTopBar(color);
        }
        updateEnvWatermark(env, color);
        break; // Use the first matching keyword's color
      }
    }
  }
});

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

// Function to check URL and update favicon/top bar
function checkAndUpdate() {
  chrome.storage.sync.get(['keywords', 'showBar', 'faviconStyle'], function(result) {
    if (result.keywords) {
      const currentUrl = window.location.href.toLowerCase();
      console.log('Checking URL:', currentUrl);
      let matched = false;
      
      for (const { keyword, color } of result.keywords) {
        // Handle string, array, and comma-separated string of keywords
        let keywords;
        if (Array.isArray(keyword)) {
          keywords = keyword;
        } else if (typeof keyword === 'string') {
          // Split by comma and handle both with and without spaces
          keywords = keyword.split(',').map(k => k.trim()).filter(k => k.length > 0);
        } else {
          keywords = [keyword];
        }
        
        console.log('Checking keywords:', keywords);
        
        // Check if any of the keywords match
        if (keywords.some(k => currentUrl.includes(k.toLowerCase()))) {
          console.log('Match found for keywords:', keywords);
          
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
          if (result.faviconStyle) {
            changeFavicon(color, result.faviconStyle);
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
        if (result.faviconStyle) {
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

// Create and inject the top bar
function createTopBar(color, env) {
  if (topBar) {
    topBar.remove();
  }

  topBar = document.createElement('div');
  topBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background-color: ${color};
    z-index: 999999;
    transition: background-color 0.3s ease;
  `;

  // Add tooltip
  topBar.title = `Environment: ${env.toUpperCase()}`;
  
  document.body.appendChild(topBar);
}

// Update favicon
function updateFavicon(color) {
  if (!currentFavicon) {
    currentFavicon = document.querySelector("link[rel*='icon']") || document.createElement('link');
    currentFavicon.type = 'image/x-icon';
    currentFavicon.rel = 'shortcut icon';
    document.getElementsByTagName('head')[0].appendChild(currentFavicon);
  }

  // Create a canvas to draw the colored favicon
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');

  // Draw colored circle
  ctx.beginPath();
  ctx.arc(16, 16, 14, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();

  // Add border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Convert to data URL and update favicon
  currentFavicon.href = canvas.toDataURL();
}

// Check URL against keywords and update UI
function checkUrlAndUpdate() {
  chrome.storage.sync.get(['keywords', 'showBar', 'faviconStyle', 'showWatermark'], function(result) {
    const url = window.location.href;
    const keywords = result.keywords || [];
    const showBar = result.showBar !== false; // Default to true
    const faviconStyle = result.faviconStyle || 'original'; // Default to 'original'
    const showWatermark = result.showWatermark !== false; // Default to true

    // Find matching keyword
    const match = keywords.find(k => url.includes(k.text));
    
    if (match) {
      if (showBar) {
        createTopBar(match.color, match.env);
      } else if (topBar) {
        topBar.remove();
        topBar = null;
      }

      if (faviconStyle) {
        changeFavicon(match.color, faviconStyle);
      }

      if (showWatermark) {
        updateEnvWatermark(match.env, match.color);
      } else {
        const watermark = document.getElementById('env-watermark');
        if (watermark) {
          watermark.remove();
        }
      }
    } else {
      // Remove top bar and reset favicon if no match
      if (topBar) {
        topBar.remove();
        topBar = null;
      }
      if (currentFavicon) {
        currentFavicon.href = '/favicon.ico';
        currentFavicon = null;
      }
      const watermark = document.getElementById('env-watermark');
      if (watermark) {
        watermark.remove();
      }
    }
  });
}

// Listen for URL changes
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    checkUrlAndUpdate();
  }
}).observe(document, { subtree: true, childList: true });

// Listen for settings updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'settingsUpdated') {
    checkUrlAndUpdate();
  }
});

// Initial check
checkUrlAndUpdate(); 