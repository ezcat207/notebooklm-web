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

你应该看到：
```
✅ RPC Tests loaded. Run: testAllRPC()
```

### 步骤 3: 运行测试

```javascript
testAllRPC();
```

### 步骤 3: 查看测试结果

测试会自动运行，查看 Console 输出。

## 📝 完整流程示例

```javascript
// 1. 加载测试
importScripts(chrome.runtime.getURL('test-rpc.js'));
// 输出: ✅ RPC Tests loaded. Run: testAllRPC()

// 2. 运行所有测试
testAllRPC();
// 输出: 测试结果...

// 3. 或单独运行某个测试
testGetNotebook();
testCreateStudioAudio({ sources: [...] });
```

## ❌ 不要用这些方法（会报错）

```javascript
// ❌ 错误：会报 CSP 错误（eval 被禁止）
fetch(chrome.runtime.getURL('test-rpc.js'))
  .then(r => r.text())
  .then(code => eval(code));

// ❌ 错误：会报 CSP 错误
eval('console.log("test")');

// ❌ 错误：new Function 也被禁止
new Function('console.log("test")')();

// ❌ 错误：import() 在 Service Worker 中被禁止
await import(chrome.runtime.getURL('test-rpc.js'));
// TypeError: import() is disallowed on ServiceWorkerGlobalScope
```

## ✅ 为什么用 importScripts()？

**Service Worker 的限制：**
- ❌ `eval()` - CSP 策略禁止
- ❌ `import()` - HTML 规范禁止（Service Worker 不支持）
- ✅ `importScripts()` - **唯一可用的方法**

**我们的配置（已修复）：**
```json
{
  "background": {
    "service_worker": "background.js"
    // 不使用 "type": "module" - 那会禁止 importScripts()
  }
}
```

**正确方法：**
```javascript
// ✅ 使用 importScripts (标准 Service Worker API)
importScripts(chrome.runtime.getURL('test-rpc.js'));
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
