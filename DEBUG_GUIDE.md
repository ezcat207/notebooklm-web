# 调试指南

## 问题概述

当前遇到的问题：调用 LIST_NOTEBOOKS API 时返回 **HTTP 400 错误**。

## 已添加的调试功能

为了帮助完整诊断问题，我在 Chrome 扩展中添加了详细的日志系统：

### 1. 日志功能特性

- ✅ **自动记录所有操作**：从认证到 API 调用的每一步
- ✅ **结构化日志**：包含时间戳、级别、类别、消息、详细数据
- ✅ **持久化存储**：最多保存最近 1000 条日志
- ✅ **可导出**：可以将所有日志导出为 JSON 文件

### 2. 日志类别

日志按以下类别组织：

- **Auth**：认证相关（Cookie 获取、Token 刷新）
- **RPC**：RPC 调用详情（请求构建、发送、响应解析）
- **API**：API 函数调用（listNotebooks、createNotebook 等）

### 3. 日志级别

- **INFO**：正常操作信息
- **WARN**：警告（如缺少某些 Cookie）
- **ERROR**：错误信息

## 操作步骤

### 步骤 1: 重新加载插件

1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 找到 "Notebook and Batch" 扩展
4. 点击刷新图标 🔄

### 步骤 2: 登录 NotebookLM

1. 访问 https://notebooklm.google.com
2. 使用 Google 账号登录
3. 确保能看到你的笔记本列表

### 步骤 3: 测试并导出日志

1. 点击浏览器工具栏中的插件图标
2. 点击 **"列出笔记本"** 按钮
3. 会出现错误（HTTP 400）
4. 点击 **"导出调试日志"** 按钮（红色按钮）
5. 浏览器会提示下载一个 JSON 文件：`notebooklm-debug-YYYY-MM-DD....json`
6. 保存这个文件

### 步骤 4: 发送日志给我

将导出的 JSON 日志文件发送给我，我会分析：

- 所有 Cookie 是否正确获取
- CSRF Token 是否成功提取
- Session ID 是否存在
- 请求 URL 和 Body 的完整内容
- 服务器返回的错误详情

## 日志示例

日志文件的结构类似：

```json
[
  {
    "timestamp": "2026-05-31T10:30:45.123Z",
    "level": "INFO",
    "category": "Auth",
    "message": "Getting auth cookies...",
    "data": null
  },
  {
    "timestamp": "2026-05-31T10:30:45.234Z",
    "level": "INFO",
    "category": "Auth",
    "message": "Cookie SAPSID: AUxxxxxx...",
    "data": null
  },
  {
    "timestamp": "2026-05-31T10:30:45.345Z",
    "level": "INFO",
    "category": "RPC",
    "message": "=== Starting RPC Call: wXbhsf ===",
    "data": null
  },
  {
    "timestamp": "2026-05-31T10:30:45.456Z",
    "level": "ERROR",
    "category": "RPC",
    "message": "Response not OK: 400",
    "data": {
      "status": 400,
      "statusText": "Bad Request",
      "errorText": "..."
    }
  }
]
```

## 可能的问题原因

基于之前的分析，可能的原因包括：

1. **CSRF Token 格式问题**
   - Token 可能未正确提取
   - Token 编码方式不对

2. **请求参数问题**
   - `f.req` 参数格式错误
   - 缺少其他必需参数

3. **Session 问题**
   - Session ID 无效或过期
   - Build Label 版本不匹配

4. **Cookie 问题**
   - 某个关键 Cookie 缺失
   - Cookie Domain 不匹配

## 调试命令（可选）

如果你想在浏览器控制台手动查看日志：

### 打开 Service Worker 控制台

1. 访问 `chrome://extensions/`
2. 找到 "Notebook and Batch" 扩展
3. 点击 "Service Worker" 链接
4. 在打开的开发者工具中，你会看到所有日志

### 手动发送消息查看日志

在 Service Worker 控制台中运行：

```javascript
// 获取所有日志
chrome.runtime.sendMessage({ action: "GET_LOGS" }, (response) => {
  console.log("All logs:", response.data.logs);
});

// 清空日志
chrome.runtime.sendMessage({ action: "CLEAR_LOGS" }, (response) => {
  console.log("Logs cleared");
});

// 导出日志
chrome.runtime.sendMessage({ action: "EXPORT_LOGS" }, (response) => {
  console.log("Logs exported");
});
```

## 日志中需要关注的关键信息

当你将日志发给我时，我会重点查看：

### 1. 认证信息
- 找到了哪些 Cookie？
- CSRF Token 长度是否合理（通常 > 100 字符）？
- Session ID 是否存在？
- Build Label 是什么？

### 2. 请求详情
- 完整的请求 URL
- 请求 Body 的长度
- 是否包含 CSRF Token（`at=` 参数）

### 3. 响应详情
- HTTP 状态码
- 错误响应的文本内容（前 500 字符）

### 4. 错误堆栈
- 在哪一步失败的？
- 完整的错误消息

## 下一步

一旦我收到日志文件，我会：

1. 分析完整的请求/响应流程
2. 识别具体的失败点
3. 对比 Python CLI 的成功请求
4. 修复问题并提供新版本

这次应该能一次性找到并解决问题！
