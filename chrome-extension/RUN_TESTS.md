# 如何运行 RPC 集成测试

## ⚠️ 重要：不能用 eval()

Manifest V3 的 CSP 策略禁止 `eval()`，所以不能用之前的方法。

## ✅ 正确方法

### 步骤 1: 打开 Service Worker Console

1. 访问 `chrome://extensions/`
2. 找到 "NotebookLM Web" 扩展
3. 点击 "Service Worker" 下的 "inspect"
4. 打开 Console 标签

### 步骤 2: 加载测试文件

在 Console 中运行：

```javascript
importScripts(chrome.runtime.getURL('test-rpc.js'));
```

### 步骤 3: 运行测试

```javascript
testAllRPC();
```

## 📝 完整流程示例

```javascript
// 1. 加载测试
importScripts(chrome.runtime.getURL('test-rpc.js'));
// 输出: ✅ RPC Tests loaded in Service Worker. Run: testAllRPC()

// 2. 运行所有测试
testAllRPC();
// 输出: 测试结果...

// 3. 或单独运行某个测试
testGetNotebook();
testCreateStudioAudio({ sources: [...] });
```

## ❌ 不要用这些方法（会报错）

```javascript
// ❌ 错误：会报 CSP 错误
fetch(chrome.runtime.getURL('test-rpc.js'))
  .then(r => r.text())
  .then(code => eval(code));

// ❌ 错误：会报 CSP 错误
eval('console.log("test")');

// ❌ 错误：new Function 也被禁止
new Function('console.log("test")')();
```

## ✅ 为什么 importScripts() 可以？

- `importScripts()` 是 Service Worker 的标准 API
- 不违反 CSP 策略
- 专门用来加载额外的脚本文件

## 🔍 如果 importScripts() 也不行

那说明 Service Worker 类型是 "module"。改用动态 import：

```javascript
// 动态 import (适用于 module 类型的 Service Worker)
import(chrome.runtime.getURL('test-rpc.js')).then(() => {
  testAllRPC();
});
```

## 📊 预期输出

成功加载后应该看到：

```
✅ RPC Tests loaded in Service Worker. Run: testAllRPC()

🧪 Starting RPC Integration Tests...

📝 Test Notebook: 64ed8fbe-3879-43cf-ae06-635e571dbd12

📁 Phase 1: Basic Notebook Operations

✅ LIST_NOTEBOOKS: PASS - Found 15 notebooks
✅ GET_NOTEBOOK: PASS - Title: "TEST-WebUI-Audit-174843", Sources: 2
...

============================================================
📊 TEST RESULTS
============================================================
✅ PASSED: 10
❌ FAILED: 0

🎉 ALL TESTS PASSED!
============================================================
```

## 🆘 如果还是报错

1. **检查 test-rpc.js 是否存在**
   ```javascript
   fetch(chrome.runtime.getURL('test-rpc.js'))
     .then(r => console.log('File exists:', r.ok));
   ```

2. **检查 Service Worker 类型**
   ```javascript
   console.log('Service Worker context:', self);
   ```

3. **重新加载扩展**
   - 去 chrome://extensions/
   - 点击刷新按钮 🔄
   - 重新打开 Service Worker Console

---

**简单记忆：用 `importScripts()` 代替 `eval()`**
