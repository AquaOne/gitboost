// GitBoost - GitHub Enhancement Suite
// Content script that runs on GitHub pages

(function () {
  'use strict';

  const CONFIG = {
    features: {},
  };

  // Load user settings
  async function loadSettings() {
    const defaults = { enableToc: true, enableInsights: true, enableShortcuts: true };
    const result = await chrome.storage.sync.get(defaults);
    CONFIG.features = result;
    return result;
  }

  function isRepoPage() {
    return /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+/.test(location.href);
  }

  function isReadmePage() {
    return isRepoPage() && document.querySelector('article.markdown-body');
  }

  // ====== FEATURE 1: README Table of Contents ======

  function injectToc() {
    if (!CONFIG.features.enableToc) return;

    const article = document.querySelector('article.markdown-body');
    if (!article) return;

    const headings = article.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length < 3) return;

    // Check if TOC already exists
    if (document.getElementById('gitboost-toc')) return;

    const toc = document.createElement('nav');
    toc.id = 'gitboost-toc';
    toc.className = 'gitboost-toc';
    toc.innerHTML = `<div class="gitboost-toc-header">
      <span class="gitboost-toc-title">📑 <span data-i18n="readmeToc">目录</span></span>
      <button class="gitboost-toc-toggle" id="gitboost-toc-toggle" title="Toggle TOC">✕</button>
    </div>`;
    const list = document.createElement('ul');
    list.className = 'gitboost-toc-list';

    let currentList = list;
    let currentLevel = 2;
    const stack = [{ level: 1, list }];

    headings.forEach((heading) => {
      const level = parseInt(heading.tagName[1]);
      // Only include h1-h4
      if (level > 4) return;

      // Ensure heading has an id for linking
      if (!heading.id) {
        heading.id = heading.textContent
          .toLowerCase()
          .replace(/[^\w一-鿿\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }

      const item = document.createElement('li');
      item.className = `gitboost-toc-item gitboost-toc-level-${level}`;
      const link = document.createElement('a');
      link.href = `#${heading.id}`;
      link.textContent = heading.textContent.substring(0, 60);
      item.appendChild(link);

      // Adjust nesting
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      const parent = stack.length > 0 ? stack[stack.length - 1].list : list;
      parent.appendChild(item);

      if (level < 3) {
        const subList = document.createElement('ul');
        subList.className = 'gitboost-toc-sublist';
        item.appendChild(subList);
        stack.push({ level, list: subList });
        currentList = subList;
      }
    });

    toc.appendChild(list);
    article.parentElement.insertBefore(toc, article);

    // Toggle functionality
    const toggleBtn = document.getElementById('gitboost-toc-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        toc.classList.toggle('gitboost-toc-collapsed');
        toggleBtn.textContent = toc.classList.contains('gitboost-toc-collapsed') ? '☰' : '✕';
      });
    }

    // Highlight current section on scroll
    const tocLinks = toc.querySelectorAll('a');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            tocLinks.forEach((l) => l.classList.remove('gitboost-toc-active'));
            const matchingLink = toc.querySelector(`a[href="#${entry.target.id}"]`);
            if (matchingLink) matchingLink.classList.add('gitboost-toc-active');
          }
        });
      },
      { rootMargin: '-80px 0px -60% 0px' }
    );

    headings.forEach((h) => observer.observe(h));
  }

  // ====== FEATURE 2: Repository Insights Panel ======

  async function injectInsights() {
    if (!CONFIG.features.enableInsights) return;
    if (!isRepoPage()) return;

    // Only inject on repo main page or readme page
    const sidebar = document.querySelector('.Layout-sidebar');
    if (!sidebar) return;

    // Check if already injected
    if (document.getElementById('gitboost-insights')) return;

    const match = location.pathname.match(/^\/([\w.-]+)\/([\w.-]+)/);
    if (!match) return;
    const [_, owner, repo] = match;

    const panel = document.createElement('div');
    panel.id = 'gitboost-insights';
    panel.className = 'gitboost-insights';
    panel.innerHTML = `
      <div class="gitboost-insights-header">
        <span class="gitboost-insights-title">📊 <span data-i18n="repoInsights">仓库洞察</span></span>
      </div>
      <div class="gitboost-insights-content">
        <div class="gitboost-insights-row">
          <span class="gitboost-insights-label">⭐ <span data-i18n="starsTrend">Star 趋势</span></span>
          <span class="gitboost-insights-value" id="gitboost-stars">-</span>
        </div>
        <div class="gitboost-insights-row">
          <span class="gitboost-insights-label">🔄 <span data-i18n="recentActivity">近期活跃度</span></span>
          <span class="gitboost-insights-value" id="gitboost-activity">-</span>
        </div>
        <div class="gitboost-insights-row">
          <span class="gitboost-insights-label">📝 <span data-i18n="openIssues">Issues</span></span>
          <span class="gitboost-insights-value" id="gitboost-issues">-</span>
        </div>
        <div class="gitboost-insights-row">
          <span class="gitboost-insights-label">🔀 <span data-i18n="openPRs">PRs</span></span>
          <span class="gitboost-insights-value" id="gitboost-prs">-</span>
        </div>
        <div class="gitboost-insights-row">
          <span class="gitboost-insights-label">📅 <span data-i18n="lastCommit">最近提交</span></span>
          <span class="gitboost-insights-value" id="gitboost-last-commit">-</span>
        </div>
      </div>
    `;

    sidebar.prepend(panel);

    // Fetch data from GitHub API
    try {
      const headers = { Accept: 'application/vnd.github.v3+json' };
      const [repoData, issuesData, prsData, commitsData] = await Promise.all([
        fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }).then((r) => r.ok ? r.json() : null),
        fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=1`, { headers }).then((r) => r.ok ? r.json().then((d) => d.length || 0) : null),
        fetch(`https://api.github.com/repos/${owner}/${repo}/pulls?state=open&per_page=1`, { headers }).then((r) => r.ok ? r.json().then((d) => d.length || 0) : null),
        fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`, { headers }).then((r) => r.ok ? r.json() : null),
      ]);

      if (repoData) {
        document.getElementById('gitboost-stars').textContent = formatNumber(repoData.stargazers_count);
        document.getElementById('gitboost-activity').textContent = repoData.updated_at
          ? timeAgo(new Date(repoData.updated_at))
          : '-';
        if (issuesData !== null) document.getElementById('gitboost-issues').textContent = formatNumber(issuesData);
        if (prsData !== null) document.getElementById('gitboost-prs').textContent = formatNumber(prsData);
      }

      if (commitsData && commitsData.length > 0) {
        document.getElementById('gitboost-last-commit').textContent = timeAgo(new Date(commitsData[0].commit.author.date));
      }
    } catch (err) {
      console.warn('[GitBoost] Insights fetch failed:', err);
      document.querySelectorAll('.gitboost-insights-value').forEach((el) => (el.textContent = 'N/A'));
    }
  }

  // ====== FEATURE 3: Keyboard Navigation ======

  function setupShortcuts() {
    if (!CONFIG.features.enableShortcuts) return;

    document.addEventListener('keydown', (e) => {
      // Only trigger if not in input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.key === 'g') {
        e.preventDefault();
        showQuickMenu();
      }
    });
  }

  function showQuickMenu() {
    // Remove existing menu
    const existingMenu = document.getElementById('gitboost-quick-menu');
    if (existingMenu) existingMenu.remove();

    const menu = document.createElement('div');
    menu.id = 'gitboost-quick-menu';
    menu.className = 'gitboost-quick-menu';
    menu.innerHTML = `
      <div class="gitboost-quick-menu-header">GitBoost Quick Nav</div>
      <div class="gitboost-quick-menu-items">
        <button data-url="issues">📋 Issues</button>
        <button data-url="pulls">🔀 Pull Requests</button>
        <button data-url="wiki">📖 Wiki</button>
        <button data-url="actions">⚡ Actions</button>
        <button data-url="projects">📊 Projects</button>
        <button data-url="security">🔒 Security</button>
        <button data-url="pulse">📈 Insights</button>
      </div>
    `;

    document.body.appendChild(menu);

    menu.querySelectorAll('button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const url = btn.dataset.url;
        const match = location.pathname.match(/^\/([\w.-]+\/[\w.-]+)/);
        if (match) {
          location.href = `/${match[1]}/${url}`;
        }
        menu.remove();
      });
    });

    // Close on click outside
    setTimeout(() => {
      document.addEventListener('click', () => menu.remove(), { once: true });
    }, 100);
  }

  // ====== UTILITY FUNCTIONS ======

  function formatNumber(num) {
    if (!num && num !== 0) return '-';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  function timeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    if (months > 0) return months + 'mo ago';
    if (weeks > 0) return weeks + 'w ago';
    if (days > 0) return days + 'd ago';
    if (hours > 0) return hours + 'h ago';
    if (minutes > 0) return minutes + 'm ago';
    return 'Just now';
  }

  // ====== INITIALIZATION ======

  async function init() {
    await loadSettings();

    // Use i18n for all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.dataset.i18n;
      const msg = chrome.i18n.getMessage(key);
      if (msg) el.textContent = msg;
    });

    if (isReadmePage()) {
      injectToc();
    }

    injectInsights();
    setupShortcuts();
  }

  // Wait for page to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Re-inject on PJAX navigation (GitHub uses Turbo/pjax)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      // Remove old injected elements
      document.getElementById('gitboost-toc')?.remove();
      document.getElementById('gitboost-insights')?.remove();
      setTimeout(init, 500);
    }
  }).observe(document, { subtree: true, childList: true });
})();
