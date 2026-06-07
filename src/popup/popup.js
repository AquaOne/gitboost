// GitBoost Popup Script

document.addEventListener('DOMContentLoaded', () => {
  // i18n
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    const msg = chrome.i18n.getMessage(key);
    if (msg) el.textContent = msg;
  });

  // Version
  const manifest = chrome.runtime.getManifest();
  document.getElementById('version').textContent = `v${manifest.version}`;

  // Load settings
  chrome.storage.sync.get(
    { enableToc: true, enableInsights: true, enableShortcuts: true },
    (settings) => {
      document.getElementById('toc-toggle').checked = settings.enableToc;
      document.getElementById('insights-toggle').checked = settings.enableInsights;
      document.getElementById('shortcuts-toggle').checked = settings.enableShortcuts;
    }
  );

  // Save settings on change
  document.getElementById('toc-toggle').addEventListener('change', (e) => {
    chrome.storage.sync.set({ enableToc: e.target.checked });
    // Reload current GitHub tab to apply changes
    reloadGitHubTabs();
  });

  document.getElementById('insights-toggle').addEventListener('change', (e) => {
    chrome.storage.sync.set({ enableInsights: e.target.checked });
    reloadGitHubTabs();
  });

  document.getElementById('shortcuts-toggle').addEventListener('change', (e) => {
    chrome.storage.sync.set({ enableShortcuts: e.target.checked });
    reloadGitHubTabs();
  });

  // Settings button
  document.getElementById('settings-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  function reloadGitHubTabs() {
    chrome.tabs.query({ url: 'https://github.com/*' }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.reload(tab.id);
      });
    });
  }
});
