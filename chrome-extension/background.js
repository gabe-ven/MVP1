// Background service worker for Load Insights Gmail Scanner

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Load Insights Gmail Scanner installed!');

    // Set default API URL
    chrome.storage.sync.set({
      apiUrl: 'http://localhost:3000/api/extract'
    });

    // Show welcome notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Load Insights - Welcome!',
      message: 'Click the extension icon to scan Gmail for rate confirmations.'
    });
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scanComplete') {
    // Handle scan completion
    console.log('Scan completed:', request.data);
    sendResponse({ success: true });
  }
  return true;
});

// Optional: Set up alarm for auto-scanning (can be enabled later)
// Uncomment to enable auto-scan every 30 minutes
/*
chrome.alarms.create('autoScan', {
  periodInMinutes: 30
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'autoScan') {
    console.log('Running auto-scan...');
    // Trigger scan logic here
  }
});
*/

console.log('Load Insights Gmail Scanner background service worker loaded');

