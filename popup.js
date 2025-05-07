document.addEventListener('DOMContentLoaded', function() {
  const keywordContainer = document.getElementById('keyword-container');
  const addKeywordBtn = document.getElementById('add-keyword');
  const saveBtn = document.getElementById('save');
  const statusDiv = document.getElementById('status');
  const showBarToggle = document.getElementById('show-bar');
  const enableFaviconToggle = document.getElementById('enable-favicon');
  const showWatermarkToggle = document.getElementById('show-watermark');
  const darkModeBtn = document.querySelector('.dark-mode-btn');

  // Load saved settings
  chrome.storage.sync.get(['keywords', 'showBar', 'enableFavicon', 'showWatermark', 'darkMode'], function(result) {
    if (result.keywords) {
      result.keywords.forEach(keyword => addKeywordRow(keyword));
    }
    showBarToggle.checked = result.showBar !== false; // Default to true
    enableFaviconToggle.checked = result.enableFavicon !== false; // Default to true
    showWatermarkToggle.checked = result.showWatermark !== false; // Default to true
    
    // Apply dark mode if saved
    if (result.darkMode) {
      document.body.classList.add('dark-mode');
    }
  });

  // Dark mode toggle
  darkModeBtn.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    chrome.storage.sync.set({ darkMode: isDarkMode });
  });

  // Add keyword row
  function addKeywordRow(keyword = { text: '', color: '#FF0000', env: 'prod' }) {
    const row = document.createElement('div');
    row.className = 'keyword-row';
    
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.className = 'keyword-input';
    textInput.placeholder = 'Enter keyword';
    textInput.value = keyword.text;

    const colorSelect = document.createElement('select');
    colorSelect.className = 'color-select';
    const colors = [
      { value: '#FF0000', label: 'Red' },
      { value: '#00FF00', label: 'Green' },
      { value: '#0000FF', label: 'Blue' },
      { value: '#FFFF00', label: 'Yellow' },
      { value: '#FF00FF', label: 'Purple' },
      { value: '#00FFFF', label: 'Cyan' },
      { value: '#FFA500', label: 'Orange' }
    ];
    colors.forEach(color => {
      const option = document.createElement('option');
      option.value = color.value;
      option.textContent = color.label;
      option.selected = color.value === keyword.color;
      colorSelect.appendChild(option);
    });

    const envSelect = document.createElement('select');
    envSelect.className = 'env-select';
    const environments = ['prod', 'staging', 'dev', 'test'];
    environments.forEach(env => {
      const option = document.createElement('option');
      option.value = env;
      option.textContent = env.charAt(0).toUpperCase() + env.slice(1);
      option.selected = env === keyword.env;
      envSelect.appendChild(option);
    });

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = 'X';
    removeBtn.onclick = function() {
      row.remove();
    };

    row.appendChild(textInput);
    row.appendChild(colorSelect);
    row.appendChild(envSelect);
    row.appendChild(removeBtn);
    keywordContainer.appendChild(row);
  }

  // Add new keyword row
  addKeywordBtn.addEventListener('click', () => addKeywordRow());

  // Save settings
  saveBtn.addEventListener('click', function() {
    const keywords = [];
    document.querySelectorAll('.keyword-row').forEach(row => {
      const text = row.querySelector('.keyword-input').value.trim();
      if (text) {
        keywords.push({
          text: text,
          color: row.querySelector('.color-select').value,
          env: row.querySelector('.env-select').value
        });
      }
    });

    chrome.storage.sync.set({
      keywords: keywords,
      showBar: showBarToggle.checked,
      enableFavicon: enableFaviconToggle.checked,
      showWatermark: showWatermarkToggle.checked,
      darkMode: document.body.classList.contains('dark-mode')
    }, function() {
      statusDiv.textContent = 'Settings saved!';
      statusDiv.className = 'status success';
      statusDiv.style.display = 'block';
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 2000);

      // Notify content script about settings change
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'settingsUpdated',
          settings: {
            keywords: keywords,
            showBar: showBarToggle.checked,
            enableFavicon: enableFaviconToggle.checked,
            showWatermark: showWatermarkToggle.checked
          }
        });
      });
    });
  });
}); 