// GitBoost Background Service Worker

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      enableToc: true,
      enableInsights: true,
      enableShortcuts: true,
    });
    chrome.tabs.create({ url: 'https://github.com' });
  } else if (details.reason === 'update') {
    console.log(`[GitBoost] Updated from ${details.previousVersion} to ${chrome.runtime.getManifest().version}`);
  }
});

// Handle keyboard commands
chrome.commands.onCommand.addListener((command) => {
  if (command === 'open-issues') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab.url && tab.url.match(/^https:\/\/github\.com\/([\w.-]+)\/([\w.-]+)/)) {
        const match = tab.url.match(/^https:\/\/github\.com\/([\w.-]+\/[\w.-]+)/);
        if (match) {
          chrome.tabs.update(tab.id, { url: `https://github.com/${match[1]}/issues` });
        }
      }
    });
  }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'get-version') {
    sendResponse({ version: chrome.runtime.getManifest().version });
  }
  return true;
});
