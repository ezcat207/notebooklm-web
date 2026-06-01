# 快速启动指南

> 5 分钟内启动并测试 Notebook and Batch

---

## 前置要求

- ✅ Google Chrome 浏览器
- ✅ Google 账号（已登录 NotebookLM）
- ✅ Node.js 18+ (用于 Web UI)

---

## 步骤 1: 安装 Chrome 插件

### 1.1 加载插件

```bash
1. 打开 Chrome 浏览器
2. 访问 chrome://extensions/
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目中的 chrome-extension 文件夹
6. 确认安装
```

### 1.2 验证安装

- 浏览器工具栏应出现插件图标
- 点击图标，应该打开弹出窗口

### 1.3 登录 NotebookLM

```bash
1. 访问 https://notebooklm.google.com
2. 使用 Google 账号登录
3. 确保能看到你的笔记本列表
```

### 1.4 测试插件

```bash
1. 点击插件图标
2. 应显示"已认证"状态和 Cookie 列表
3. 点击"列出笔记本"按钮
4. 应弹出笔记本列表

✅ 如果看到以上内容，插件安装成功！
```

---

## 步骤 2: 启动 Web UI

### 2.1 安装依赖

```bash
cd web
npm install
```

### 2.2 启动开发服务器

```bash
npm run dev
```

应看到输出：
```
▲ Next.js 14.2.0
- Local:        http://localhost:3000
- Ready in 2.3s
```

### 2.3 访问应用

```bash
打开浏览器访问: http://localhost:3000
```

---

## 步骤 3: 测试核心功能

### 3.1 认证检查

✅ 应自动检测到 Chrome 插件
✅ 应显示"已认证"状态
✅ 应看到笔记本列表

如果未登录：
```bash
1. 点击"打开 NotebookLM"
2. 登录 Google 账号
3. 点击"刷新页面"
```

### 3.2 创建笔记本

```bash
1. 点击"+ 新建笔记本"
2. 输入标题: "测试笔记本"
3. 点击"创建"
4. 应看到新笔记本出现在列表中
```

### 3.3 批量导入 URLs

```bash
1. 选中刚创建的笔记本（点击卡片）
2. 点击"📥 批量导入"
3. 输入以下测试 URLs:

https://example.com/article1
https://example.com/article2
https://example.com/article3

4. 点击"开始导入"
5. 等待导入完成（应显示进度条）
6. 导入成功后，笔记本的来源数量会更新
```

### 3.4 批量生成音频

```bash
1. 选中笔记本
2. 点击"🎧 批量生成"
3. 选择"音频 Overview"
4. 选择格式: "深度对话"
5. 选择长度: "长"
6. 点击"开始生成"
7. 等待生成完成（可能需要几分钟）

⏱️ 音频生成需要时间，请耐心等待
```

---

## 常见问题

### Q1: 插件显示"未认证"

**解决方法**:
```bash
1. 打开 https://notebooklm.google.com
2. 确保已登录
3. 回到插件，点击"检查认证"
4. 如果仍未认证，刷新 NotebookLM 页面
```

### Q2: Web UI 显示"未检测到 Chrome 插件"

**解决方法**:
```bash
1. 确认插件已安装（chrome://extensions/）
2. 确认插件已启用
3. 刷新 Web UI 页面
4. 检查浏览器控制台是否有错误
```

### Q3: 批量导入失败

**可能原因**:
- URL 格式不正确
- 网络问题
- NotebookLM API 限流

**解决方法**:
```bash
1. 检查 URL 格式是否正确
2. 减少单次导入的 URL 数量
3. 等待几分钟后重试
4. 查看浏览器控制台错误信息
```

### Q4: 音频生成一直在"生成中"

**解决方法**:
```bash
1. 音频生成通常需要 3-5 分钟
2. 打开 NotebookLM 网站检查是否真的在生成
3. 如果超过 10 分钟，可能失败了
4. 检查笔记本是否有足够的来源（建议 3+ 个）
```

---

## 功能测试清单

### 基础功能 ✅

- [ ] Chrome 插件安装成功
- [ ] 认证状态正常
- [ ] 可以列出笔记本
- [ ] 可以创建笔记本
- [ ] 可以删除笔记本
- [ ] 可以重命名笔记本

### 批量操作 ✅

- [ ] 可以批量导入 URLs
- [ ] 可以添加文本来源
- [ ] 进度条正常显示
- [ ] 错误提示清晰

### Studio 生成 ✅

- [ ] 可以选择内容类型
- [ ] 可以配置音频参数
- [ ] 生成进度可追踪
- [ ] 生成成功有提示

### UI/UX ✅

- [ ] 响应式布局正常
- [ ] 按钮和交互流畅
- [ ] 加载状态明确
- [ ] 错误提示友好

---

## 高级测试

### 测试多笔记本批量操作

```bash
1. 创建 3 个测试笔记本:
   - "竞品研究"
   - "内容营销"
   - "培训材料"

2. 全选 3 个笔记本

3. 批量导入相同的 URLs

4. 批量生成音频

5. 验证所有笔记本都成功更新
```

### 压力测试

```bash
1. 一次导入 20 个 URLs
2. 同时为 5 个笔记本生成内容
3. 观察性能和错误处理
```

---

## 调试技巧

### 查看插件日志

```bash
1. 访问 chrome://extensions/
2. 找到 "Notebook and Batch" 插件
3. 点击"Service Worker"
4. 在控制台查看日志
```

### 查看 Web UI 日志

```bash
1. 在 Web UI 页面按 F12
2. 打开开发者工具
3. 切换到 Console 标签
4. 查看错误信息和日志
```

### 手动测试 RPC 调用

在插件 Service Worker 控制台运行：

```javascript
// 测试列出笔记本
chrome.runtime.sendMessage({ action: "LIST_NOTEBOOKS" }, (response) => {
  console.log("Notebooks:", response);
});

// 测试创建笔记本
chrome.runtime.sendMessage({
  action: "CREATE_NOTEBOOK",
  data: { title: "Test Notebook" }
}, (response) => {
  console.log("Created:", response);
});
```

---

## 下一步

### 继续探索

- 📖 阅读 [`DEVELOPMENT_COMPLETE.md`](DEVELOPMENT_COMPLETE.md) 了解完整功能
- 📚 查看 [`docs/API_RESEARCH.md`](docs/API_RESEARCH.md) 了解 API 细节
- 🎯 查看 [`docs/FEATURES.md`](docs/FEATURES.md) 了解功能规划

### 贡献

- 🐛 发现 Bug? 在项目仓库提 Issue
- 💡 有建议? 欢迎讨论新功能
- 🔧 想贡献代码? 查看 Contributing 指南

---

## 需要帮助？

- 📧 Email: [项目维护者邮箱]
- 💬 Discord: [社区链接]
- 📖 文档: [完整文档链接]

---

**祝你使用愉快！** 🎉

如果遇到问题，请查看 [常见问题](#常见问题) 或联系项目维护者。
