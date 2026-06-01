# Notebook and Batch - Chrome Extension

Chrome 插件部分，提供与 NotebookLM API 的直接通信能力。

## 功能

- ✅ 认证检查（读取 NotebookLM Cookie）
- ✅ 列出所有笔记本
- ✅ 创建新笔记本
- ✅ 批量导入 URL 来源
- 🚧 批量生成音频（开发中）
- 🚧 文件下载（开发中）

## 开发测试

### 1. 加载未打包的扩展

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `chrome-extension` 文件夹

### 2. 登录 NotebookLM

1. 访问 https://notebooklm.google.com
2. 使用你的 Google 账号登录
3. 确保能看到你的笔记本列表

### 3. 测试插件

1. 点击浏览器工具栏上的插件图标
2. 应该显示"已认证"状态
3. 点击"列出笔记本"按钮
4. 检查开发者工具 Console 中的输出

### 4. 测试批量导入（通过 Console）

打开插件的 Service Worker 控制台：

1. 访问 `chrome://extensions/`
2. 找到 "Notebook and Batch" 扩展
3. 点击 "Service Worker" 链接
4. 在控制台中运行：

```javascript
// 测试认证
chrome.runtime.sendMessage({ action: "CHECK_AUTH" }, (response) => {
  console.log("Auth check:", response);
});

// 列出笔记本
chrome.runtime.sendMessage({ action: "LIST_NOTEBOOKS" }, (response) => {
  console.log("Notebooks:", response);
});

// 批量导入（替换为你的笔记本 ID）
chrome.runtime.sendMessage({
  action: "BATCH_IMPORT",
  data: {
    notebookId: "YOUR_NOTEBOOK_ID",
    urls: [
      "https://example.com/article1",
      "https://example.com/article2"
    ]
  }
}, (response) => {
  console.log("Import result:", response);
});
```

## 文件结构

```
chrome-extension/
├── manifest.json       # 扩展清单
├── background.js       # Service Worker (核心 API 逻辑)
├── popup.html          # 弹出窗口 UI
├── popup.js            # 弹出窗口逻辑
├── icons/              # 图标文件
└── README.md           # 本文件
```

## API 调用方式

### 认证

插件使用 Chrome Cookie API 读取 NotebookLM 的认证 Cookie：

- `SAPSID` - 主要认证 Cookie
- `__Secure-1PSID` / `__Secure-3PSID` - 安全 Cookie
- `HSID` / `SSID` / `SID` - 会话 Cookie

### RPC 调用

所有 API 调用通过 `batchexecute` 端点进行：

```
POST https://notebooklm.google.com/_/LabsTailwindUi/data/batchexecute
```

请求格式：
```
f.req=[["rpcId", "jsonEncodedParams", null, "generic"]]
```

响应格式：
```
)]}'
123
[["wrb.fr","rpcId","jsonResult"]]
```

### 核心 RPC IDs

```javascript
LIST_NOTEBOOKS: "wXbhsf"
CREATE_NOTEBOOK: "CCqFvf"
ADD_SOURCE: "izAoDd"
DELETE_SOURCE: "tGMBJ"
CREATE_STUDIO: "R7cb6c"
POLL_STUDIO: "gArtLc"
```

## 调试技巧

### 查看 Cookie

```javascript
chrome.cookies.getAll({ url: "https://notebooklm.google.com" }, (cookies) => {
  console.log("Cookies:", cookies);
});
```

### 查看网络请求

1. 打开 NotebookLM 网站
2. 打开开发者工具 Network 面板
3. 手动添加一个来源
4. 查找 `batchexecute` 请求
5. 复制请求参数和响应格式

### 错误处理

- **Error 16**: 认证过期，需要重新登录
- **HTTP 4xx**: 检查 Cookie 是否正确
- **HTTP 5xx**: NotebookLM 服务器错误，稍后重试

## 下一步

- [ ] 创建简单的图标文件
- [ ] 实现批量生成音频功能
- [ ] 实现文件下载功能
- [ ] 添加错误重试机制
- [ ] 优化性能（并发请求、缓存等）
- [ ] 准备发布到 Chrome Web Store

## 注意事项

⚠️ **重要**: 这是一个使用 NotebookLM 内部 API 的非官方工具。Google 可能随时更改 API，导致功能失效。仅供个人学习和使用。
