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

**注意：因为 Service Worker 是 module 类型，用 `import()` 而不是 `importScripts()`**

在 Console 中运行：

```javascript
import(chrome.runtime.getURL('test-rpc.js')).then(() => {
  console.log('✅ Tests loaded!');
  testAllRPC();
});
```

或者分步运行：

```javascript
// 1. 先加载
await import(chrome.runtime.getURL('test-rpc.js'));

// 2. 再运行
testAllRPC();
```

### 步骤 3: 查看测试结果

测试会自动运行，查看 Console 输出。

## 📝 完整流程示例

```javascript
// 1. 加载测试 (Module Service Worker)
await import(chrome.runtime.getURL('test-rpc.js'));
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

// ❌ 错误：importScripts 不支持 module 类型
importScripts(chrome.runtime.getURL('test-rpc.js'));
// TypeError: Module scripts don't support importScripts()
```

## ✅ 为什么要用 import()？

我们的 Service Worker 配置是：
```json
{
  "background": {
    "service_worker": "background.js",
    "type": "module"    ← 这个导致不能用 importScripts()
  }
}
```

**Module 类型的 Service Worker：**
- ✅ 支持 `import()` (动态导入)
- ✅ 支持 `import ... from` (静态导入)
- ❌ **不支持** `importScripts()` (旧 API)
- ❌ **不支持** `eval()` (CSP 限制)

**正确方法：**
```javascript
// ✅ 动态 import (异步)
await import(chrome.runtime.getURL('test-rpc.js'));

// ✅ 或带回调
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
