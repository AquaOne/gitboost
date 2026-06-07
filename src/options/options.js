// GitBoost Options Page Script

document.addEventListener('DOMContentLoaded', () => {
  // i18n
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    const msg = chrome.i18n.getMessage(key);
    if (msg) el.textContent = msg;
  });

  // Load settings
  chrome.storage.sync.get(
    { enableToc: true, enableInsights: true, enableShortcuts: true },
    (settings) => {
      document.getElementById('enableToc').checked = settings.enableToc;
      document.getElementById('enableInsights').checked = settings.enableInsights;
      document.getElementById('enableShortcuts').checked = settings.enableShortcuts;
    }
  );

  // Save settings
  document.getElementById('saveBtn').addEventListener('click', () => {
    const settings = {
      enableToc: document.getElementById('enableToc').checked,
      enableInsights: document.getElementById('enableInsights').checked,
      enableShortcuts: document.getElementById('enableShortcuts').checked,
    };

    chrome.storage.sync.set(settings, () => {
      const status = document.getElementById('saveStatus');
      status.textContent = chrome.i18n.getMessage('settingsTitle') === '设置' ? '✓ 已保存' : '✓ Saved';
      status.classList.add('visible');
      setTimeout(() => status.classList.remove('visible'), 2000);
    });
  });
});
