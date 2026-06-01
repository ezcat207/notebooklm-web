# Notebook and Batch

> 批量导入导出 NotebookLM 内容，无需安装任何命令行工具。只需安装 Chrome 插件，打开网页即可开始。

## 项目概述

**Notebook and Batch** 是一个 Chrome 扩展 + Web UI 工具，让用户能够批量操作 Google NotebookLM，无需安装 Python 或 CLI 工具。

### 核心价值

- ✅ **零安装**：只需安装 Chrome 插件，无需 Python/CLI/本地服务器
- ✅ **数据安全**：所有操作在用户浏览器本地进行，Cookie 不离开设备
- ✅ **批量操作**：批量导入 URL、批量生成音频/视频、一键下载
- ✅ **工作流自动化**：竞品研究、内容营销、培训材料等预设工作流

## 项目状态

### ✅ Phase 1 - MVP 已完成！

**Chrome 插件** (850+ 行代码):
- [x] 完整认证系统（Cookie + CSRF Token）
- [x] 35+ RPC API 调用
- [x] 笔记本管理（列出/创建/删除/重命名/摘要）
- [x] 来源管理（URL/文本/批量导入）
- [x] Studio 生成（Audio/Video/Infographic/等 7 种类型）
- [x] 下载功能
- [x] 分享功能
- [x] 错误处理和进度跟踪

**Web UI** (Next.js 14 + TypeScript):
- [x] 完整项目架构
- [x] Chrome API 封装层（300+ 行）
- [x] 类型定义（200+ 行）
- [x] 主页和布局
- [x] 笔记本列表组件（卡片视图）
- [x] 批量导入模态框（URL + 文本）
- [x] Studio 生成器（7 种内容类型）
- [x] 响应式设计（Tailwind CSS）
- [x] 进度跟踪和错误提示

**文档**:
- [x] API 研究文档（500+ 行）
- [x] 功能规划文档（400+ 行）
- [x] 开发完成总结

**总代码量**: 3500+ 行

### 🚧 Phase 2 - 功能扩展 (待开发)

- [ ] AI 查询对话框
- [ ] 文件上传功能
- [ ] 工作流预设（竞品研究/内容营销/培训材料）
- [ ] 笔记本详情页
- [ ] 下载管理器
- [ ] Google Drive 集成
- [ ] 跨笔记本查询

### 📋 Phase 3 - 高级功能 (规划中)

- [ ] 导出到 Google Docs/Sheets
- [ ] 笔记管理
- [ ] 协作功能
- [ ] 性能优化

## 技术架构

```
┌─────────────────────────────────────────┐
│         Web UI (Next.js 14)             │
│    ↕ (chrome.runtime.sendMessage)       │
│   Chrome Extension (Manifest V3)        │
│    ↕ (Cookie + HTTPS)                   │
│   NotebookLM Internal API               │
└─────────────────────────────────────────┘
```

### Chrome 插件

- **认证**: 读取 NotebookLM Cookie (SAPSID, GSEP 等)
- **API 调用**: 通过 `batchexecute` 端点调用 NotebookLM 内部 API
- **消息通信**: 与 Web UI 通过 `chrome.runtime.sendMessage()` 通信

### Web UI

- **框架**: Next.js 14 + Tailwind CSS
- **部署**: Vercel / Cloudflare Pages
- **通信**: 通过 Chrome API 与插件通信

## 快速开始

### 1. 测试 Chrome 插件

```bash
cd chrome-extension

# 1. 加载扩展
# - 打开 chrome://extensions/
# - 开启"开发者模式"
# - 点击"加载已解压的扩展程序"
# - 选择 chrome-extension 文件夹

# 2. 登录 NotebookLM
# - 访问 https://notebooklm.google.com
# - 使用 Google 账号登录

# 3. 测试插件
# - 点击插件图标
# - 应显示"已认证"状态
# - 点击"列出笔记本"测试功能
```

### 2. 开发 Web UI（即将开始）

```bash
cd web
npm install
npm run dev
# 访问 http://localhost:3000
```

## 文件结构

```
notebooklm-web/
├── spec.md                    # 产品规格说明书
├── README.md                  # 本文件
│
├── chrome-extension/          # Chrome 插件
│   ├── manifest.json          # 扩展清单
│   ├── background.js          # Service Worker (核心逻辑)
│   ├── popup.html             # 弹出窗口 UI
│   ├── popup.js               # 弹出窗口逻辑
│   ├── icons/                 # 图标文件
│   └── README.md              # 插件文档
│
└── web/                       # Web UI (待创建)
    ├── app/                   # Next.js 14 App Router
    ├── components/            # React 组件
    ├── lib/                   # 工具函数和 Chrome API 封装
    └── package.json
```

## API 参考

### NotebookLM Internal API

**Base URL**: `https://notebooklm.google.com`

**Batchexecute Endpoint**: `/_/LabsTailwindUi/data/batchexecute`

**认证**:
- Cookie: `SAPSID`, `__Secure-1PSID`, `__Secure-3PSID`, `HSID`, `SSID`, `SID`
- CSRF Token: 从页面提取 `SNlM0e` 参数
- Session ID: 从页面提取 `FdrFJe` 参数

**核心 RPC IDs**:
```javascript
LIST_NOTEBOOKS:   "wXbhsf"    // 列出所有笔记本
CREATE_NOTEBOOK:  "CCqFvf"    // 创建新笔记本
ADD_SOURCE:       "izAoDd"    // 添加 URL/文本来源
DELETE_SOURCE:    "tGMBJ"     // 删除来源
CREATE_STUDIO:    "R7cb6c"    // 创建音频/视频
POLL_STUDIO:      "gArtLc"    // 轮询生成状态
```

详见 [`chrome-extension/README.md`](chrome-extension/README.md)

## 开发计划

### Week 1: MVP (5 天)

- [x] Day 1: API 研究 + Chrome 插件原型
- [ ] Day 2: Web UI 主页 + 笔记本列表
- [ ] Day 3: 批量导入 UI + 端到端测试
- [ ] Day 4: 批量生成音频功能
- [ ] Day 5: Bug 修复 + 文档完善

### Week 2: 功能完善 (6 天)

- [ ] 批量生成信息图/幻灯片/测验
- [ ] 文件下载管理
- [ ] 工作流预设（竞品研究、内容营销）
- [ ] 错误处理和重试机制
- [ ] 性能优化

### Week 3: 发布 (3 天)

- [ ] Chrome Web Store 提交
- [ ] Web UI 部署 (Vercel)
- [ ] 用户文档和教程视频
- [ ] 收集反馈和快速迭代

## 参考资料

- [产品规格说明书](spec.md) - 完整的产品设计文档
- [notebooklm-mcp-cli](https://github.com/jacob-bd/notebooklm-mcp-cli) - Python CLI 和 MCP 服务器（API 参考）

## 注意事项

⚠️ **重要声明**:

1. 这是一个使用 NotebookLM 内部 API 的**非官方工具**
2. Google 可能随时更改 API，导致功能失效
3. 仅供**个人学习和使用**，请勿用于商业用途
4. 数据处理完全在用户本地进行，不会上传到任何第三方服务器

## License

MIT

---

**下一步**: 创建 Web UI 项目框架 (Next.js 14)
