document.addEventListener('DOMContentLoaded', function() {
  const keywordContainer = document.getElementById('keyword-container');
  const addKeywordBtn = document.getElementById('add-keyword');
  const saveBtn = document.getElementById('save');
  const statusDiv = document.getElementById('status');
  const showBarToggle = document.getElementById('show-bar');
  const faviconStyleSelect = document.getElementById('favicon-style');
  const showWatermarkToggle = document.getElementById('show-watermark');
  const darkModeBtn = document.querySelector('.dark-mode-btn');
  const saveConfirm = document.getElementById('save-confirm');

  // Add example environments if none exist
  function addExampleEnvironments() {
    addKeywordRow({ text: 'dev.example.com', color: '#00FF00', env: 'dev', isExample: true });
    addKeywordRow({ text: 'test.example.com', color: '#FFA500', env: 'test', isExample: true });
    addKeywordRow({ text: 'prod.example.com', color: '#FF0000', env: 'prod', isExample: true });
  }

  // Load saved settings
  chrome.storage.sync.get(['keywords', 'showBar', 'faviconStyle', 'showWatermark', 'darkMode'], function(result) {
    if (result.keywords && result.keywords.length > 0) {
      result.keywords.forEach(keyword => addKeywordRow(keyword));
    } else {
      addExampleEnvironments();
    }
    showBarToggle.checked = result.showBar !== false; // Default to true
    faviconStyleSelect.value = result.faviconStyle || 'original'; // Default to original
    showWatermarkToggle.checked = result.showWatermark !== false; // Default to true
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

  // Add keyword row with inline labels
  function addKeywordRow(keyword = { text: '', color: '#FF0000', env: 'prod' }) {
    const row = document.createElement('div');
    row.className = 'keyword-row';
    // All fields editable, even for example rows

    // Keyword input
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.className = 'keyword-input';
    textInput.value = keyword.text;
    textInput.placeholder = 'e.g. dev.example.com';
    textInput.disabled = false;

    // Color select
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
    colorSelect.disabled = false;

    // Env select
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
    envSelect.disabled = false;

    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = 'X';
    removeBtn.onclick = function() {
      row.remove();
    };

    // Assemble row (no inline labels)
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
    // Remove example rows before saving
    document.querySelectorAll('.keyword-row').forEach(row => {
      if (row.style.opacity === '0.7') row.remove();
    });
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
      faviconStyle: faviconStyleSelect.value,
      showWatermark: showWatermarkToggle.checked,
      darkMode: document.body.classList.contains('dark-mode')
    }, function() {
      // Animated confirmation
      saveConfirm.style.display = 'block';
      setTimeout(() => { saveConfirm.style.opacity = 1; }, 10);
      setTimeout(() => { saveConfirm.style.opacity = 0; }, 1800);
      setTimeout(() => { saveConfirm.style.display = 'none'; }, 2300);
      
      // Notify content script about settings change
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'settingsUpdated',
            settings: {
              keywords: keywords,
              showBar: showBarToggle.checked,
              faviconStyle: faviconStyleSelect.value,
              showWatermark: showWatermarkToggle.checked
            }
          }).catch(error => {
            // Ignore the error - it's expected if the content script isn't ready
            console.log('Content script not ready:', error);
          });
        }
      });
    });
  });
}); 