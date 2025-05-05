document.addEventListener('DOMContentLoaded', function() {
  const keywordContainer = document.getElementById('keyword-container');
  const addButton = document.getElementById('add-keyword');
  const saveButton = document.getElementById('save');
  const statusDiv = document.getElementById('status');
  const showBarToggle = document.getElementById('show-bar');

  // Color options
  const colorOptions = [
    { value: '#FF0000', name: 'Red' },
    { value: '#00FF00', name: 'Green' },
    { value: '#0000FF', name: 'Blue' },
    { value: '#FFFF00', name: 'Yellow' },
    { value: '#FF00FF', name: 'Magenta' },
    { value: '#00FFFF', name: 'Cyan' },
    { value: '#FFA500', name: 'Orange' },
    { value: '#800080', name: 'Purple' },
    { value: '#008000', name: 'Dark Green' },
    { value: '#000080', name: 'Navy' }
  ];

  // Function to create a new keyword row
  function createKeywordRow(keyword = '', color = '#00FF00') {
    const row = document.createElement('div');
    row.className = 'keyword-row';
    
    const keywordInput = document.createElement('input');
    keywordInput.type = 'text';
    keywordInput.className = 'keyword-input';
    keywordInput.placeholder = 'Enter keyword';
    keywordInput.value = keyword;
    
    const colorSelect = document.createElement('select');
    colorSelect.className = 'color-select';
    colorOptions.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option.value;
      opt.textContent = option.name;
      opt.selected = option.value === color;
      colorSelect.appendChild(opt);
    });
    
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-btn';
    removeButton.textContent = 'X';
    removeButton.onclick = () => row.remove();
    
    row.appendChild(keywordInput);
    row.appendChild(colorSelect);
    row.appendChild(removeButton);
    return row;
  }

  // Add new keyword row
  addButton.addEventListener('click', () => {
    keywordContainer.appendChild(createKeywordRow());
  });

  // Load saved settings
  chrome.storage.sync.get(['keywords', 'showBar'], function(result) {
    // Load keywords
    if (result.keywords && result.keywords.length > 0) {
      result.keywords.forEach(({ keyword, color }) => {
        keywordContainer.appendChild(createKeywordRow(keyword, color));
      });
    } else {
      // Add one default row if no saved keywords
      keywordContainer.appendChild(createKeywordRow());
    }

    // Load bar toggle state
    if (result.showBar !== undefined) {
      showBarToggle.checked = result.showBar;
    }
  });

  // Save settings when button is clicked
  saveButton.addEventListener('click', function() {
    const keywords = [];
    const rows = keywordContainer.querySelectorAll('.keyword-row');
    
    rows.forEach(row => {
      const keyword = row.querySelector('.keyword-input').value.trim();
      const color = row.querySelector('.color-select').value;
      if (keyword) {
        keywords.push({ keyword, color });
      }
    });

    const settings = {
      keywords: keywords,
      showBar: showBarToggle.checked
    };

    chrome.storage.sync.set(settings, function() {
      // Show success message
      statusDiv.textContent = 'Settings saved!';
      statusDiv.className = 'status success';
      statusDiv.style.display = 'block';
      
      // Hide message after 2 seconds
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 2000);
    });
  });
}); 