// Background script for Rubis Snip extension

// Default settings
const DEFAULT_SETTINGS = {
  privacy: 'private',    // 'public' or 'private'
  accessKey: '',         // Custom access key for private scraps
  ownerKey: '',          // Custom owner key for managing scraps
  rememberKeys: false,   // Whether to remember accessKey and ownerKey
  title: 'Untitled Scrap' // Default title for scraps
};

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  // Set default settings
  chrome.storage.sync.get('settings', (data) => {
    if (!data.settings) {
      chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
    }
  });

  // Create context menu
  chrome.contextMenus.create({
    id: 'saveToRubis',
    title: 'Save to Rubis',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'saveToRubis' && info.selectionText) {
    // Get current settings
    chrome.storage.sync.get('settings', (data) => {
      const settings = data.settings || DEFAULT_SETTINGS;
      
      // Save the selected text to Rubis
      saveToRubis(info.selectionText, settings, tab);
    });
  }
});

// Function to save text to Rubis API
async function saveToRubis(text, settings, tab) {
  try {
    // Ensure we're working with an active tab that has a valid ID
    if (!tab || !tab.id || tab.id < 0) {
      throw new Error('No active tab found');
    }

    // Send notification that we're processing the request
    await sendTabMessage(tab.id, { 
      action: 'showNotification', 
      message: 'Saving to Rubis...',
      type: 'info'
    });

    // API endpoint URL for Rubis v2
    const apiUrl = 'https://api.rubis.app/v2/scrap';
    
    // Prepare the URL with query parameters
    const url = new URL(apiUrl);
    url.searchParams.append('public', settings.privacy === 'public');
    
    // Add optional parameters if they exist
    if (settings.privacy !== 'public' && settings.accessKey) {
      url.searchParams.append('accessKey', settings.accessKey);
    }
    
    if (settings.ownerKey) {
      url.searchParams.append('ownerKey', settings.ownerKey);
    }
    
    if (settings.title) {
      url.searchParams.append('title', settings.title);
    }
    
    // Make the API request
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: text
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error('API returned unsuccessfully');
    }
    
    // Determine which URL to copy based on privacy setting
    const urlToCopy = settings.privacy === 'public' ? 
      data.view : 
      data.view_with_key;
    
    // Copy the URL to clipboard using content script
    await copyToClipboardInTab(tab.id, urlToCopy);
    
    // Store the owner key for future reference if rememberKeys is enabled
    if (settings.rememberKeys && data.ownerKey) {
      const updatedSettings = { ...settings };
      updatedSettings.lastOwnerKey = data.ownerKey;
      chrome.storage.sync.set({ settings: updatedSettings });
    }
    
    // Show success notification with tick icon
    await sendTabMessage(tab.id, { 
      action: 'showNotification', 
      message: 'Copied link to clipboard!',
      type: 'success'
    });
  } catch (error) {
    console.error('Error saving to Rubis:', error);
    
    // Show error notification if possible
    try {
      if (tab && tab.id) {
        await sendTabMessage(tab.id, { 
          action: 'showNotification', 
          message: `Error: ${error.message}`,
          type: 'error'
        });
      }
    } catch (notificationError) {
      console.error('Failed to show error notification:', notificationError);
    }
  }
}

// Helper function to copy text to clipboard via content script
function copyToClipboardInTab(tabId, text) {
  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.sendMessage(tabId, { 
        action: 'copyToClipboard', 
        text: text
      }, (response) => {
        // Check for runtime errors first
        if (chrome.runtime.lastError) {
          console.error('Runtime error:', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        
        // Check if we got a valid response
        if (!response) {
          reject(new Error('No response received from content script'));
          return;
        }
        
        // Check if the operation was successful
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error || 'Failed to copy to clipboard'));
        }
      });
    } catch (err) {
      console.error('Error sending message:', err);
      reject(err);
    }
  });
}

// Helper function to send messages to tabs with proper error handling
function sendTabMessage(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        // If the content script isn't ready, inject it now
        if (chrome.runtime.lastError.message.includes('Receiving end does not exist')) {
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['src/js/content.js']
          }, () => {
            // Try sending the message again after a short delay
            setTimeout(() => {
              chrome.tabs.sendMessage(tabId, message, (response) => {
                if (chrome.runtime.lastError) {
                  reject(new Error(chrome.runtime.lastError.message));
                } else {
                  resolve(response);
                }
              });
            }, 100);
          });
        } else {
          reject(new Error(chrome.runtime.lastError.message));
        }
      } else {
        resolve(response);
      }
    });
  });
}