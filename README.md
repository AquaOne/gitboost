# ⚡ GitBoost - GitHub Enhancement Suite

[![Chrome Web Store](https://img.shields.io/badge/Chrome-Add%20to%20Store-6e40c9)](https://chrome.google.com/webstore/detail/your-extension-id)
[![GitHub](https://img.shields.io/badge/GitHub-Open%20Source-6e40c9)](https://github.com/your-github-username/gitboost)
[![License MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**GitBoost** 是一款 Chrome 扩展，为 GitHub 添加 README 目录导航、仓库洞察面板、快捷键等功能，提升你的代码浏览体验。

[English](./README_EN.md) | 中文

---

## ✨ 功能

| 功能 | 说明 |
|------|------|
| 📑 **README 目录** | 长文档自动生成可折叠目录，滚动时高亮当前章节 |
| 📊 **仓库洞察** | 侧边栏显示 Stars、活跃度、Issue/PR 数量、最近提交 |
| ⌨️ **快捷键导航** | 按 `G` 键弹出快速导航菜单 |
| 🌙 **深色模式** | 完美适配 GitHub 深色/浅色主题 |
| 🌐 **双语支持** | 完整支持中文和英文 |

## 🚀 安装

### 方法一：Chrome Web Store
访问 Chrome Web Store 页面，点击"添加到 Chrome"。

### 方法二：开发者模式
1. 下载本仓库源码
2. 打开 `chrome://extensions/`
3. 开启"开发者模式"（Developer mode）
4. 点击"加载已解压的扩展程序"（Load unpacked）
5. 选择本项目文件夹

## 🛠 开发

```bash
# 克隆仓库
git clone https://github.com/your-github-username/gitboost.git

# 安装依赖（仅用于图标生成）
cd gitboost && npm install

# 生成图标
node icons/generate-icons.js
```

### 项目结构

```
gitboost/
├── manifest.json          # 扩展配置
├── src/
│   ├── content/           # 内容脚本（注入 GitHub 页面）
│   ├── popup/             # 弹窗页面
│   ├── options/           # 设置页面
│   └── background/        # 后台 Service Worker
├── _locales/              # 多语言文件
│   ├── zh_CN/             # 中文
│   └── en/                # 英文
├── icons/                 # 图标
├── docs/                  # 产品官网
└── .github/workflows/     # CI/CD
```

## 🧩 技术栈

- **Manifest V3** — 最新的 Chrome 扩展标准
- **Vanilla JS** — 零框架依赖，轻量高效
- **GitHub REST API** — 获取仓库公开数据
- **IntersectionObserver** — 智能滚动监听

## ❤️ 赞助

GitBoost 是免费开源项目。如果它帮到了你，欢迎赞助：

- [爱发电](https://afdian.com/a/your-username)
- [GitHub Sponsors](https://github.com/sponsors/your-github-username)

## 📄 许可

MIT License
