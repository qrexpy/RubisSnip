// Settings popup script for Rubis Snip

// Default settings
const DEFAULT_SETTINGS = {
  privacy: 'private',
  accessKey: '',
  ownerKey: '',
  rememberKeys: false,
  title: 'Untitled Scrap',
  lastOwnerKey: '' // To store the last created scrap's owner key
};

// Load settings when popup opens
document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements after document is loaded
  const titleInput = document.getElementById('title');
  const privacySelect = document.getElementById('privacy');
  const accessKeyInput = document.getElementById('accessKey');
  const ownerKeyInput = document.getElementById('ownerKey');
  const rememberKeysCheckbox = document.getElementById('rememberKeys');
  const saveButton = document.getElementById('save');
  const resetButton = document.getElementById('reset');
  const privateOnlyElements = document.querySelectorAll('.private-only');

  // Load initial settings
  loadSettings();

  // Add event listeners
  privacySelect.addEventListener('change', updatePrivacyUI);
  saveButton.addEventListener('click', saveSettings);
  resetButton.addEventListener('click', resetSettings);

  // Function to load settings from storage
  function loadSettings() {
    chrome.storage.sync.get('settings', (data) => {
      const settings = data.settings || DEFAULT_SETTINGS;
      
      // Populate form with saved settings
      titleInput.value = settings.title || '';
      privacySelect.value = settings.privacy || 'private';
      accessKeyInput.value = settings.accessKey || '';
      ownerKeyInput.value = settings.ownerKey || '';
      rememberKeysCheckbox.checked = settings.rememberKeys || false;
      
      // Update UI based on privacy setting
      updatePrivacyUI();
    });
  }

  // Function to update UI based on privacy selection
  function updatePrivacyUI() {
    const isPrivate = privacySelect.value === 'private';
    
    // Show/hide elements based on privacy setting
    privateOnlyElements.forEach(element => {
      element.style.display = isPrivate ? 'block' : 'none';
    });
  }

  // Function to save settings
  function saveSettings() {
    const settings = {
      title: titleInput.value.trim() || 'Untitled Scrap',
      privacy: privacySelect.value,
      accessKey: accessKeyInput.value.trim(),
      ownerKey: ownerKeyInput.value.trim(),
      rememberKeys: rememberKeysCheckbox.checked,
      lastOwnerKey: DEFAULT_SETTINGS.lastOwnerKey // Preserve the last owner key
    };
    
    // Validate settings
    if (settings.accessKey && settings.accessKey.length > 64) {
      showStatusMessage('Access key must not exceed 64 characters', 'error');
      return;
    }
    
    if (settings.ownerKey && settings.ownerKey.length > 64) {
      showStatusMessage('Owner key must not exceed 64 characters', 'error');
      return;
    }
    
    if (settings.title.length > 64) {
      showStatusMessage('Title must not exceed 64 characters', 'error');
      return;
    }
    
    // Save to Chrome storage
    chrome.storage.sync.set({ settings }, () => {
      // Show save confirmation
      showStatusMessage('Settings saved!', 'success');
    });
  }

  // Function to reset settings to defaults
  function resetSettings() {
    // Reset form values
    titleInput.value = DEFAULT_SETTINGS.title;
    privacySelect.value = DEFAULT_SETTINGS.privacy;
    accessKeyInput.value = DEFAULT_SETTINGS.accessKey;
    ownerKeyInput.value = DEFAULT_SETTINGS.ownerKey;
    rememberKeysCheckbox.checked = DEFAULT_SETTINGS.rememberKeys;
    
    // Update UI based on privacy setting
    updatePrivacyUI();
    
    // Save default settings (but preserve the last owner key if exists)
    chrome.storage.sync.get('settings', (data) => {
      const lastOwnerKey = data.settings?.lastOwnerKey || '';
      const resetSettings = { ...DEFAULT_SETTINGS, lastOwnerKey };
      
      chrome.storage.sync.set({ settings: resetSettings }, () => {
        // Show reset confirmation
        showStatusMessage('Settings reset to defaults', 'info');
      });
    });
  }
  
  // Function to show status messages
  function showStatusMessage(message, type = 'info') {
    // Remove any existing status message
    const existingStatus = document.querySelector('.status-message');
    if (existingStatus) {
      existingStatus.parentNode.removeChild(existingStatus);
    }
    
    // Create new status message
    const status = document.createElement('div');
    status.className = `status-message ${type}`;
    status.textContent = message;
    document.querySelector('.form-actions').appendChild(status);
    
    // Remove after 2 seconds
    setTimeout(() => {
      if (status.parentNode) {
        status.parentNode.removeChild(status);
      }
    }, 2000);
  }
});