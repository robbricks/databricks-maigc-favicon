// Create and inject the popup element
function createPopup() {
  const popup = document.createElement('div');
  popup.id = 'url-display-popup';
  popup.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 10000;
    max-width: 300px;
    word-break: break-all;
  `;

  const closeButton = document.createElement('button');
  closeButton.textContent = '×';
  closeButton.style.cssText = `
    position: absolute;
    top: 5px;
    right: 5px;
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
  `;
  closeButton.onclick = () => popup.remove();

  const title = document.createElement('h3');
  title.textContent = 'Current URL:';
  title.style.margin = '0 0 10px 0';

  const urlDisplay = document.createElement('div');
  urlDisplay.textContent = window.location.href;

  popup.appendChild(closeButton);
  popup.appendChild(title);
  popup.appendChild(urlDisplay);
  document.body.appendChild(popup);
}

// Create the popup when the page loads
createPopup(); 