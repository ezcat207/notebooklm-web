# 如何测试 RPC 集成测试

## RPC 测试在哪里运行？

**在 Chrome Extension 的 Service Worker Console 里**，不是在网站上！

## 详细步骤（有截图说明）

### Step 1: 打开 Chrome Extensions 页面

在 Chrome 地址栏输入并回车：
```
chrome://extensions/
```

### Step 2: 找到 NotebookLM Web Extension

1. 确保 "Developer mode" 开关打开（右上角）
2. 找到 "NotebookLM Web" 或 "Notebook and Batch" extension
3. 如果刚更新了代码，点击刷新按钮 🔄

### Step 3: 打开 Service Worker Console

在 Extension 卡片上，找到 "Service Worker" 这一行：

```
Service Worker    [inspect]
```

点击蓝色的 **"inspect"** 链接

### Step 4: DevTools 会打开

这会打开一个 Chrome DevTools 窗口，标题类似：
```
DevTools - chrome-extension://abcdefghijk...
```

切换到 **Console** 标签页

### Step 5: 加载测试文件

在 Console 中粘贴并执行：

```javascript
fetch(chrome.runtime.getURL('test-rpc.js'))
  .then(r => r.text())
  .then(code => eval(code))
  .then(() => console.log('✅ Tests loaded, run: testAllRPC()'));
```

你应该看到：
```
✅ Tests loaded, run: testAllRPC()
```

### Step 6: 运行测试

在 Console 中输入并执行：

```javascript
testAllRPC()
```

### Step 7: 查看结果

测试会自动运行，输出类似：

```
🧪 Starting RPC Integration Tests...

📝 Test Notebook: 64ed8fbe-3879-43cf-ae06-635e571dbd12

📁 Phase 1: Basic Notebook Operations

✅ LIST_NOTEBOOKS: PASS - Found 15 notebooks
✅ GET_NOTEBOOK: PASS - Title: "TEST-WebUI-Audit-174843", Sources: 2

✏️  Phase 2: Notebook Mutations

✅ CREATE_NOTEBOOK: PASS - Created: abc-123-def-456
✅ RENAME_NOTEBOOK: PASS - Renamed to: "Renamed-1234567890"

📄 Phase 3: Summary

✅ GET_SUMMARY: PASS - Summary length: 1234 chars

🎨 Phase 4: Studio Operations

✅ CREATE_STUDIO_AUDIO: PASS - Created: audio-123
✅ CREATE_STUDIO_INFOGRAPHIC: PASS - Created: infographic-456
✅ POLL_STUDIO: PASS - Found 8 artifacts

============================================================
📊 TEST RESULTS
============================================================
✅ PASSED: 10
❌ FAILED: 0
⚠️  SKIPPED: 0

🎉 ALL TESTS PASSED!
============================================================
```

## 如果看到错误

如果有 ❌ FAILED：

1. 截图整个 Console 输出
2. 发给我
3. 不要继续测试 Web UI

## 常见问题

### Q: 找不到 "Service Worker" 怎么办？

A: Extension 可能还没加载。尝试：
1. 点击 Extension 的刷新按钮 🔄
2. 或者访问 notebooklm.google.com，这会激活 Extension
3. 然后再回到 chrome://extensions/ 查看

### Q: Console 显示 "Failed to fetch"

A: test-rpc.js 文件可能没加载到 Extension 中。检查：
1. Extension 文件夹里是否有 test-rpc.js
2. 是否重新加载了 Extension

### Q: 测试卡住不动

A: 可能是网络问题或需要重新登录。检查：
1. 访问 notebooklm.google.com 确认已登录
2. 检查网络连接
3. 在 Console 查看是否有错误

### Q: 我想单独测试某个功能

A: 可以单独调用测试函数：

```javascript
// 只测试 GET_NOTEBOOK
testGetNotebook()

// 只测试 CREATE_STUDIO
testCreateStudioAudio({ sources: [...] })
```

## 视频教程（建议）

如果上面的文字说明不清楚，我可以：
1. 录制一个视频演示
2. 或者通过 gstack/browse 工具做一个截图教程

请告诉我需不需要。
