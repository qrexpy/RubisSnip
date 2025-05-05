// Content script for Rubis Snip extension

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showNotification') {
    // Create or update notification element
    showNotification(message.message, message.type);
    // Synchronous response is sufficient for notifications
    sendResponse({ success: true });
  } else if (message.action === 'copyToClipboard') {
    // Handle clipboard operations in content script context
    // For asynchronous operations, we need to handle differently
    copyToClipboard(message.text)
      .then(() => {
        try {
          sendResponse({ success: true });
        } catch (err) {
          console.error('Failed to send success response:', err);
        }
      })
      .catch(error => {
        try {
          sendResponse({ success: false, error: error.message });
        } catch (err) {
          console.error('Failed to send error response:', err);
        }
      });
    
    // Keep the message channel open for the async response
    return true;
  }
  
  // Return true if we want to send a response asynchronously
  return message.action === 'copyToClipboard';
});

// Function to copy text to clipboard from content script (has access to document)
function copyToClipboard(text) {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary textarea element
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed'; // Avoid scrolling to bottom
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      
      // Execute copy command
      const success = document.execCommand('copy');
      
      // Clean up
      document.body.removeChild(textarea);
      
      if (success) {
        resolve();
      } else {
        reject(new Error('Unable to copy to clipboard'));
      }
    } catch (error) {
      reject(error);
    }
  });
}

// Function to show a notification to the user
function showNotification(message, type = 'info') {
  // Check if notification already exists
  let notification = document.getElementById('rubis-snip-notification');
  
  // If not, create it
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'rubis-snip-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #ffffff;
      color: #333333;
      padding: 12px 16px;
      border-radius: 6px;
      z-index: 9999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
      display: flex;
      align-items: center;
      gap: 10px;
      transform: translateY(-10px);
      opacity: 0;
    `;
    document.body.appendChild(notification);
  }

  // Create icon element based on notification type
  let iconHtml = '';
  
  if (type === 'success') {
    iconHtml = `
      <div style="
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #4caf50;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    `;
  } else if (type === 'error') {
    iconHtml = `
      <div style="
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #f44336;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </div>
    `;
  } else {
    iconHtml = `
      <div style="
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: #2196f3;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
    `;
  }

  // Set the message with icon
  notification.innerHTML = iconHtml + `<span>${message}</span>`;
  
  // Trigger animation to show notification
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 10);

  // Hide the notification after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}