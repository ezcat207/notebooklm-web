https://notebooklm-tools.userjot.com/roadmap


https://www.perplexity.ai/search/10ffda02-4cec-42da-aea7-ab3181013bf2


## 全面调查：NLMTools.com (NotebookLM Tools)

### 1. 网站实现了哪些功能

**NLMTools.com** 是一个为 Google NotebookLM 设计的 Chrome/Firefox 浏览器扩展程序，核心定位是**增强 NotebookLM 的缺失功能**。网站本身是产品落地页，实际功能通过扩展程序实现。

该扩展提供 **35+ 项功能**，主要包括 ： [chromewebstore.google](https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn)

| 功能类别 | 具体功能 |
|---------|---------|
| **批量导入** | 一次性导入 50+ 来源：YouTube 播放列表、RSS 订阅、网页标签页、ZIP 文件、多条 URL/文本  [chromewebstore.google](https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn) |
| **组织管理** | 文件夹分组（每笔记本最多 50 个）、颜色标签、跨笔记本搜索、重复源检测、来源合并  [chromewebstore.google](https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn) |
| **Studio 内容** | 内嵌查看/交互：测验、闪卡、思维导图、幻灯片、音频概览、视频、数据表等 10+ 类型  [chromewebstore.google](https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn) |
| **内容生成** | 直接在扩展侧边栏生成 9 种 Studio 项目（音频/测验/闪卡/报告/幻灯片等） [chromewebstore.google](https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn) |
| **提示词库** | 保存最多 100 个自定义提示词，通过 `/slash 命令` 快速调用  [chromewebstore.google](https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn) |
| **播客管理** | 音频概览播放器：创建播放列表、下载 MP3、跟踪收听进度、离线收听  [chromewebstore.google](https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn) |
| **多账户支持** | 连接多个 Google 账户，一键切换，彩色头像标识  [chromewebstore.google](https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn) |
| **语言切换** | 支持 70-80+ 种语言：界面语言 + AI 输出语言独立设置，悬浮小部件快速切换  [chromewebstore.google](https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn) |
| **其他工具** | 暗色模式、备份/恢复（JSON/ZIP）、来源新鲜度检测、右键菜单快速添加来源  [chromewebstore.google](https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn) |

***

### 2. 核心功能有哪些

**Pro 付费版独有的核心功能**（免费版可用全部 35+ 功能，但 Pro 解锁高级特性）： [nlmtools](https://www.nlmtools.com/pricing)

| 核心功能 | 说明 |
|---------|------|
| **批量 Studio 生成** | 一键同时生成测验 + 闪卡 + 幻灯片 + 报告，带实时进度（Pro 独占） [chromewebstore.google](https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn) |
| **无干扰工作区** | 移除所有升级提示横幅，干净专注界面  [nlmtools](https://www.nlmtools.com/pricing) |
| **新功能抢先体验** | 每周新功能提前访问，反馈影响开发方向  [nlmtools](https://www.nlmtools.com/pricing) |
| **多设备同步** | 最多 5 台设备激活同一许可证  [nlmtools](https://www.nlmtools.com/pricing) |

**用户最依赖的免费核心功能** ： [nlmtools](https://www.nlmtools.com/features)
- 批量导入（YouTube 播放列表/RSS/多 URL）
- 跨笔记本搜索（全局搜索所有笔记本和来源）
- 文件夹组织（拖拽分组来源）
- 内嵌 Studio 查看器（测验答题/闪卡学习模式）
- 提示词库（/命令快速调用）

***

### 3. 这些功能是如何实现的

根据扩展程序的隐私声明和技术特性 ： [chromewebstore.google](https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn?hl=en-US)

| 技术实现方式 | 说明 |
|-------------|------|
| **本地浏览器运行** | 所有数据在浏览器本地运行，不上传第三方服务器  [chromewebstore.google](https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn?hl=en-US) |
| **Chrome/Firefox 扩展架构** | 使用 Manifest V3 扩展 API，集成到 NotebookLM 网页界面  [chromewebstore.google](https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn) |
| **NotebookLM API 交互** | 通过注入脚本与 NotebookLM 原生 UI 交互，调用其 AI 生成功能  [chromewebstore.google](https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn) |
| **右键菜单集成** | 使用 `chrome.contextMenus` API 实现网页右键添加来源  [nlmtools](https://www.nlmtools.com/zh/blog/notebooklm-right-click-import) |
| **本地存储** | 提示词/标签/文件夹数据存储在浏览器 `localStorage`/`IndexedDB`  [chromewebstore.google](https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn) |
| **支付系统** | 通过 **Polar.sh** 处理订阅支付和许可证管理  [polar](https://polar.sh/nlmtools/portal) |
| **跨设备同步** | Pro 用户通过 Polar 客户门户实现许可证同步  [polar](https://polar.sh/nlmtools/portal) |

**技术栈推测**（基于扩展大小 849KiB 和 55 种语言支持）： [chromewebstore.google](https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn?hl=en-US)
- JavaScript/TypeScript 前端
- Chrome Extension API + Firefox WebExtension API
- 可能使用 React/Vue 构建侧边栏 UI
- 通过 Content Script 注入 NotebookLM 页面

***

### 4. 收入预估

**已知数据** ： [nlmtools](https://www.nlmtools.com/about)

| 指标 | 数值 |
|------|------|
| 用户总数 | 80,000+ 用户 |
| Chrome 商店评分 | 4.7/5（100 条评价，86 条付费评价） [nlmtools](https://www.nlmtools.com/pricing) |
| 定价方案 | 月付 $7/月，年付 $29/年（$2.42/月），终身 $59 一次性  [nlmtools](https://www.nlmtools.com/pricing) |
| 开发者 | 独立开发者（单人团队，无 VC 融资） [nlmtools](https://www.nlmtools.com/about) |

**收入估算模型**：

假设转化率参考 SaaS 扩展行业基准（2%-5%）：

| 转化率假设 | 付费用户数 | 年均 ARPU（假设 70% 选年付，20% 终身，10% 月付） | 年收入估算 |
|-----------|-----------|---------------------------------------------|-----------|
| 保守 2% | 1,600 人 | ~$25/年 | **~$40,000/年** |
| 中性 3.5% | 2,800 人 | ~$25/年 | **~$70,000/年** |
| 乐观 5% | 4,000 人 | ~$25/年 | **~$100,000/年** |

**更精确计算**（假设 3% 转化率，70% 年付+$29，20% 终身+$59 摊销，10% 月付+$7）：

$$\text{年收入} = 80,000 \times 3\% \times (0.7 \times 29 + 0.2 \times 59 + 0.1 \times 7 \times 12) \approx \mathbf{\$75,000-85,000/年}$$

**关键因素**：
- 免费版占绝大多数（网站明确说"所有功能免费"）
- Pro 主要卖点是"无干扰界面 +抢先体验 + 支持独立开发者" [nlmtools](https://www.nlmtools.com/pricing)
- 终身版 $59 会稀释长期收入，但提供一次性现金流
- Chrome Web Store 100 条评价相对于 8 万用户转化率较低（约 0.125%），推测付费转化率可能偏保守（2%-3%）

**最终预估**：
> **年收入约 $50,000 - $80,000 美元**（单独立开发者项目，属于"微 SaaS"规模）

***

### 总结

| 维度 | 关键点 |
|------|--------|
| **产品定位** | NotebookLM 的增强扩展，填补 Google 缺失的功能（文件夹/批量导入/跨笔记本搜索） [chromewebstore.google](https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn) |
| **商业模式** | 免费增值（Freemium），Pro $29/年  [nlmtools](https://www.nlmtools.com/pricing) |
| **竞争优势** | 8 万用户 + 4.7 分评分 + 每周更新 + 独立开发者快速响应  [chromewebstore.google](https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn) |
| **风险** | 依赖 Google NotebookLM（若 Google 原生实现相同功能会被替代） [nlmtools](https://www.nlmtools.com/about) |

需要我深入分析某个具体功能的技术实现细节或竞争对比吗？



根据我获取到的信息，**NLMTools 使用的是 UserJot 平台作为公开反馈和路线图工具**。让我整理从反馈页面和路线图中看到的功能信息：

***

## NotebookLM Tools Roadmap 功能概览

### 📍 UserJot 平台的作用
NLMTools 使用 **UserJot** 作为公开反馈板，让用户：
- 提交功能请求
- 投票决定优先级
- 查看开发路线图
- 接收功能上线通知 [notebooklm-tools.userjot](https://notebooklm-tools.userjot.com)

***

### 📋 已收集的用户反馈（投票排序）

从反馈页面看到的主要功能请求（按投票数排序）： [notebooklm-tools.userjot](https://notebooklm-tools.userjot.com/?cursor=1&order=top&limit=10)

| 投票数 | 功能请求 | 用户描述 |
|--------|---------|---------|
| **2 票** | **Folders in NotebookLM** | 用户 Troses 和 CSÁNYI Sándor 请求在 NotebookLM 中创建文件夹功能  [notebooklm-tools.userjot](https://notebooklm-tools.userjot.com) |
| **1 票** | **Prompt Archive（提示词库）** | Andrea D 请求管理提示词，像提示词存档一样存储并轻松重用  [notebooklm-tools.userjot](https://notebooklm-tools.userjot.com) |
| **1 票** | **iOS 移动端支持** | 用户请求扩展到 iOS 设备，类似 Orion 浏览器的功能  [notebooklm-tools.userjot](https://notebooklm-tools.userjot.com/board/p/nice-extension-tools-it-will-be-amazing-if-it-can-be) |
| **0 票** | **仅加载页面（不重复 Markdown）** | Bart Van den Bosch 请求可选只加载页面而非同时获取页面+Markdown 版本  [notebooklm-tools.userjot](https://notebooklm-tools.userjot.com) |
| **0 票** | **批量下载播客 MP3** | 天天 向上 请求批量选择下载播客 MP3 文件的功能  [notebooklm-tools.userjot](https://notebooklm-tools.userjot.com) |
| **0 票** | **Playlists 修复** | Alexander Schwarz 报告 YouTube 播放列表导入失败的问题  [notebooklm-tools.userjot](https://notebooklm-tools.userjot.com) |

***

### ✅ 已实现的核心功能（从官网确认）

根据官网信息，以下功能**已实现**，可能来自早期用户反馈：

| 功能类别 | 已实现功能 |
|---------|-----------|
| **组织管理** | 文件夹（每笔记本最多 50 个）、颜色标签、跨笔记本搜索、重复源检测、来源合并  [chromewebstore.google](https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn) |
| **提示词库** | 保存最多 100 个自定义提示词，通过 `/slash 命令` 快速调用  [chromewebstore.google](https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn) |
| **批量导入** | 50+ 来源一次性导入（YouTube 播放列表/RSS/多 URL/标签页/ZIP） [chromewebstore.google](https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn) |
| **多账户** | 多 Google 账户支持，一键切换  [chromewebstore.google](https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn) |
| **语言切换** | 70-80+ 种语言支持，悬浮小部件快速切换  [chromewebstore.google](https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn) |
| **播客管理** | 音频概览播放器、播放列表、MP3 下载、收听进度跟踪  [chromewebstore.google](https://chromewebstore.google.com/detail/notebooklm-tools/hiibkpjljigehlnnecbgehkhfibmahjn) |

> **有趣发现**：用户请求的 **Folders（文件夹）** 和 **Prompts（提示词库）** 已经在扩展中实现了！说明开发者确实在响应用户反馈 。 [nlmtools](https://www.nlmtools.com/about)

***

### 🚧 正在开发/计划中的功能（推测）

从 Roadmap 页面标题和 UserJot 平台特性来看：

| 状态 | 说明 |
|------|------|
| **Now（正在构建）** | 每周新功能抢先体验（Pro 用户独占） [nlmtools](https://www.nlmtools.com/pricing) |
| **Next（计划中）** | 根据投票排序的功能请求  [notebooklm-tools.userjot](https://notebooklm-tools.userjot.com/roadmap) |
| **Consideration（考虑中）** | 用户提交但投票较低的功能  [notebooklm-tools.userjot](https://notebooklm-tools.userjot.com/roadmap) |

**可能的未来方向**（基于用户反馈和行业趋势）： [scribd](https://www.scribd.com/document/954350769/Most-Requested-NotebookLM-Features)

1. **iOS APP** - 移动端支持（Orion 浏览器兼容）
2. **更智能的重复检测** - Dupe Finder 问题正在修复中 [notebooklm-tools.userjot](https://notebooklm-tools.userjot.com/board/p/dupe-finder-problem)
3. **API 集成** - 与其他工具（Obsidian/Zotero）集成 [scribd](https://www.scribd.com/document/954350769/Most-Requested-NotebookLM-Features)
4. **多语言音频** - 非英语音频概览生成 [scribd](https://www.scribd.com/document/954350769/Most-Requested-NotebookLM-Features)
5. **API 访问** - 开发者接口 [scribd](https://www.scribd.com/document/954350769/Most-Requested-NotebookLM-Features)

***

### 🔗 如何查看完整 Roadmap

访问地址：
- **反馈板 + 路线图**：https://notebooklm-tools.userjot.com/roadmap [notebooklm-tools.userjot](https://notebooklm-tools.userjot.com/roadmap)
- **所有反馈**：https://notebooklm-tools.userjot.com [notebooklm-tools.userjot](https://notebooklm-tools.userjot.com)

用户可以在这里：
- 投票给想要的功能
- 查看哪些功能正在开发
- 收到功能上线通知 [userjot](https://userjot.com/blog/top-10-feedback-tools-public-voting)

***

### 总结

NLMTools 的 Roadmap 特点是：
1. **透明化** - 公开所有用户反馈和投票
2. **社区驱动** - 功能优先级由用户投票决定
3. **快速迭代** - 开发者已实现多个用户请求的功能（文件夹、提示词库）
4. **Pro 抢先体验** - 付费用户每周提前使用新功能 [nlmtools](https://www.nlmtools.com/pricing)

需要我帮你分析具体的某个功能请求或对比竞品吗？