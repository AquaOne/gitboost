# GitBoost 发布与盈利指南

## 📋 前置准备

| 项目 | 费用 | 说明 |
|------|------|------|
| GitHub 账号 | 免费 | 存放源码、GitHub Pages 托管官网 |
| Chrome 开发者账号 | $5（一次性） | 发布到 Chrome Web Store 必需 |
| 爱发电账号 | 免费 | 中国用户最方便的赞助渠道 |
| GitHub Sponsors | 免费 | 国际赞助渠道 |

## 🚀 发布步骤

### 1. 创建 GitHub 仓库

```bash
# 将 your-github-username 替换为你的 GitHub 用户名
# 创建一个名为 gitboost 的仓库（不要勾选初始化 README）

cd D:\Claude\gitboost
git init
git add .
git commit -m "Initial commit: GitBoost v1.0.0"
git remote add origin https://github.com/你的用户名/gitboost.git
git branch -M main
git push -u origin main
```

### 2. 修改配置中的占位信息

需要替换以下文件中的占位内容：

| 文件 | 需要替换的内容 |
|------|--------------|
| `docs/index.html` | `your-github-username` → 你的 GitHub 用户名 |
| `README.md` | `your-github-username` → 你的 GitHub 用户名 |
| `README_EN.md` | `your-github-username` → 你的 GitHub 用户名 |
| `manifest.json` | `your-extension-id` → Chrome 扩展 ID |
| `src/popup/popup.html` | `your-username` → 爱发电用户名 |
| `src/popup/popup.html` | `your-github-username` → GitHub 用户名 |
| `src/options/options.html` | 同上 |
| `src/popup/popup.js` | 无需要（已用 chrome.i18n） |

### 3. 启用 GitHub Pages

1. 进入仓库 Settings → Pages
2. Source 选择 "GitHub Actions"
3. 推送 `docs/` 目录的修改后，Actions 会自动部署到 Pages

### 4. 发布到 Chrome Web Store

```bash
# 打包扩展
node scripts/package.js
# 生成 gitboost.zip
```

然后：
1. 访问 https://chrome.google.com/webstore/devconsole
2. 支付 $5 注册费（一次性）
3. 点击 "New Item" → 上传 `gitboost.zip`
4. 填写：
   - **Store listing**: 使用 `docs/index.html` 的内容
   - **Screenshots**: 截图展示功能介绍
   - **Promotional images**: 可用 Canva 制作
5. 提交审核

> **注意**：首次审核通常需要 1-3 个工作日。

### 5. 设置盈利渠道

#### 爱发电（中国用户首选）
1. 注册 https://afdian.com
2. 创建主页
3. 将链接更新到扩展中

#### GitHub Sponsors
1. 访问 https://github.com/sponsors
2. 关联 Stripe 或 PayPal
3. 启用 Sponsorship

## 💰 盈利策略

### 阶段一：获取用户（第 1-2 月）
- **目标**：1000+ 用户
- **方法**：
  - 在掘金、知乎发布介绍文章
  - 在 V2EX、开源中国发帖推荐
  - 在 GitHub Trending 争取曝光
  - Reddit r/SideProject 分享

### 阶段二：建立社区（第 2-3 月）
- **目标**：5000+ 用户，100+ Star
- **方法**：
  - 收集用户反馈，快速迭代
  - GitHub Issues 积极回复
  - 发布使用教程视频（B站）

### 阶段三：变现（第 3 月+）
- **赞助收入**：500-2000 元/月
- **高级功能**（未来可选项）：
  - AI 驱动的 PR 摘要（需 API Key）
  - 代码变更可视化
  - 个人使用报告

## 📈 增长策略

### SEO 优化
在 docs/index.html 中已经内置了 SEO meta 标签，确保：
- `title` 包含关键词 "GitHub 增强"
- `description` 说明核心功能
- 提交 sitemap 到 Google Search Console

### 内容营销
| 平台 | 内容类型 | 频率 |
|------|---------|------|
| 掘金 | 技术文章 | 1-2 篇/月 |
| 知乎 | 工具推荐 | 1 篇/月 |
| B站 | 使用教程 | 1 个/月 |
| GitHub | 发布 Release | 每次更新 |

### 病毒传播
- 在扩展中加入"推荐给朋友"按钮（未来版本）
- 每个功能都附带 GitHub Star 引导
- 在 README 中加入"用过的都说好"的真实评价

## 🔄 迭代路线图

| 版本 | 功能 | 时间 |
|------|------|------|
| v1.0 | README 目录 + 仓库洞察 + 快捷键 | ✅ 已发布 |
| v1.1 | 文件树增强 + 快速跳转 | 第 2 周 |
| v1.2 | 代码预览 + 差异对比增强 | 第 3 周 |
| v1.3 | 用户反馈收集 + 性能优化 | 第 4 周 |
| v2.0 | AI 功能（需付费） | 第 2-3 月 |

## ⚠️ 注意事项

1. **隐私合规**：已在 PRIVACY.md 中说明，Chrome Web Store 审核时会检查
2. **API 限流**：GitHub API 未认证时每小时 60 次，建议用户使用时已登录 GitHub（自动使用已认证的请求）
3. **版权声明**：项目使用 MIT 协议
4. **税务**：爱发电和 GitHub Sponsors 收入需按中国税法申报

---

> 🎯 **核心原则**：先提供价值，再谈变现。做对用户有用的产品，钱自然来。
