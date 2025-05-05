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
  
  // Add "Y" character in the center
  ctx.fillStyle = '#000000'; // Black color for the "Y"
  ctx.font = 'bold 30px Arial'; // Increased font size
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Y', 16, 16);
  
  // Convert canvas to data URL
  return canvas.toDataURL('image/png');
}

// Function to change the favicon
function changeFavicon(color) {
  const link = document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'icon';
  link.href = createColoredFavicon(color);
  
  // Remove existing favicon
  const existingFavicon = document.querySelector('link[rel="icon"]');
  if (existingFavicon) {
    existingFavicon.remove();
  }
  
  document.head.appendChild(link);
}

// Check if the URL contains any of the stored keywords
chrome.storage.sync.get(['keywords'], function(result) {
  if (result.keywords) {
    const currentUrl = window.location.href.toLowerCase();
    for (const { keyword, color } of result.keywords) {
      if (currentUrl.includes(keyword.toLowerCase())) {
        changeFavicon(color);
        break; // Use the first matching keyword's color
      }
    }
  }
}); 