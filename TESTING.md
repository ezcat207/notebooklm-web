# Testing & Quality Assurance

## 问题与解决方案

### ❌ 之前的问题

1. **Documentation ≠ Verification**
   - RPC_VERIFICATION.md 和 AUDIT.md 只记录了"应该怎么做"
   - 没有自动化测试来验证真的做对了
   - 每次改代码都需要手动测试，效率低且容易漏测

2. **手动测试的局限性**
   - 需要用户手动测试每个功能
   - 发现问题晚，浪费时间
   - 无法系统化地验证所有 RPC 调用

3. **重复犯错**
   - 即使有文档，还是会犯同样的错误
   - 没有强制验证机制

### ✅ 新的解决方案

**Integration Tests (集成测试)** - JavaScript 测试套件直接在 Chrome Extension 中运行

## 如何运行集成测试

### 步骤 1: 加载最新代码

```bash
# 拉取最新代码
cd /Volumes/Lexar/oneweekoneproject/001cli/notebooklm-web
git pull

# 重新加载 Chrome Extension
# 1. 打开 chrome://extensions/
# 2. 点击 "NotebookLM Web" 的刷新按钮 🔄
```

### 步骤 2: 打开 Service Worker Console

```
1. 在 chrome://extensions/ 页面
2. 找到 "NotebookLM Web"
3. 点击 "Service Worker" 下的 "inspect" 链接
4. 打开 DevTools Console
```

### 步骤 3: 加载测试文件

在 Console 中运行：

```javascript
// 方法 1: 直接加载测试脚本
fetch(chrome.runtime.getURL('test-rpc.js'))
  .then(r => r.text())
  .then(code => eval(code))
  .then(() => console.log('✅ Tests loaded'));

// 方法 2: 如果已经配置在 manifest.json，直接运行
testAllRPC();
```

### 步骤 4: 查看测试结果

测试会输出：

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

## 测试覆盖范围

### ✅ 已测试的 RPC 调用

| RPC | Python CLI | 验证内容 |
|-----|-----------|---------|
| LIST_NOTEBOOKS (wXbhsf) | notebooks.py:40 | 参数格式 + 结果解析 |
| GET_NOTEBOOK (rLM1Ne) | notebooks.py:128-134 | 参数格式 + 数据结构解析 |
| CREATE_NOTEBOOK (CCqFvf) | notebooks.py:170-176 | 参数格式 + result[2] 解析 |
| RENAME_NOTEBOOK (s0tc2d) | notebooks.py:191-192 | 嵌套参数格式 |
| DELETE_NOTEBOOK (WWINqb) | notebooks.py:237-238 | 双层嵌套格式 |
| GET_SUMMARY (VfAZjd) | notebooks.py:136-166 | 结果数组解析 |
| DELETE_SOURCE (tGMBJ) | sources.py:252-254 | 三层嵌套格式 |
| CREATE_STUDIO Audio (R7cb6c) | studio.py:197-201 | Content 数组构建 |
| CREATE_STUDIO Infographic (R7cb6c) | studio.py:859-884 | 15 元素数组 |
| POLL_STUDIO (gArtLc) | studio.py:307-327 | 列表所有 artifacts |

### 🔄 待添加的测试

- [ ] CREATE_STUDIO - Video (type 3)
- [ ] CREATE_STUDIO - Report (type 2)
- [ ] CREATE_STUDIO - Quiz (type 4, variant 2)
- [ ] CREATE_STUDIO - Flashcards (type 4, variant 1)
- [ ] CREATE_STUDIO - Slide Deck (type 8)
- [ ] CREATE_STUDIO - Data Table (type 9)
- [ ] ADD_URL_SOURCE (v1/v2 fallback)
- [ ] ADD_TEXT_SOURCE
- [ ] BATCH operations

## 开发工作流程

### ⚠️ 旧流程（不要再用了）

```
1. 写代码
2. git commit
3. 让用户测试 ❌ 太晚发现问题
4. 发现错误
5. 修复
6. 重复...
```

### ✅ 新流程（强制使用）

```
1. 写代码/修改 RPC 调用
2. 运行 testAllRPC() ← 立即验证
3. 如果有测试失败:
   - 修复代码
   - 重新运行测试
   - 直到所有测试通过
4. git commit (只提交通过测试的代码)
5. git push
6. 让用户测试 (信心更高)
```

## 添加新测试

当添加新的 RPC 调用时，必须同时添加测试：

### 模板

```javascript
/**
 * Test: YOUR_FUNCTION_NAME (RPC_CODE)
 * Python CLI: file.py:line_number
 * Format: [exact, params, here]
 * Returns: result structure
 */
async function testYourFunction() {
  try {
    // 1. 准备参数 (从 Python CLI 复制)
    const params = [...];  // EXACT format from Python CLI

    // 2. 调用 RPC
    const result = await callRPC('RPC_CODE', params);

    // 3. 验证结果结构
    if (!Array.isArray(result)) throw new Error('Result is not an array');
    // ... more validations

    // 4. 提取数据 (按 Python CLI 的方式)
    const data = result[0]; // or whatever Python CLI does

    logTest('YOUR_FUNCTION', 'PASS', 'Description of success');
    return data;
  } catch (error) {
    logTest('YOUR_FUNCTION', 'FAIL', error.message);
    return null;
  }
}
```

### 添加到测试套件

在 `testAllRPC()` 中调用你的测试：

```javascript
async function testAllRPC() {
  // ... existing tests

  // Phase N: Your New Feature
  console.log('\n🎯 Phase N: Your New Feature\n');
  await testYourFunction();

  // ...
}
```

## CI/CD 集成（未来）

目标：自动化测试

```yaml
# .github/workflows/test.yml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Chrome
        run: ...
      - name: Load Extension
        run: ...
      - name: Run Tests
        run: node chrome-extension/test-rpc.js
      - name: Upload Results
        run: ...
```

## 调试失败的测试

### 查看详细错误

```javascript
// 在 Console 中
testResults.failed.forEach(f => {
  console.log(`\n❌ ${f.name}`);
  console.log(`   Error: ${f.details}`);
});
```

### 查看 RPC 调用日志

```javascript
// 导出所有 debug logs
chrome.runtime.sendMessage({ action: 'EXPORT_LOGS' });

// 或直接查看
chrome.runtime.sendMessage({ action: 'GET_LOGS' }, response => {
  console.log(response.data.logs);
});
```

### 单独测试某个功能

```javascript
// 只测试某个特定的 RPC
await testGetNotebook();
await testCreateStudioAudio({ sources: [...] });
```

## 测试配置

编辑 `test-rpc.js` 中的配置：

```javascript
const TEST_CONFIG = {
  // 使用现有测试 notebook（推荐）
  testNotebookId: '64ed8fbe-3879-43cf-ae06-635e571dbd12',

  // 或创建新的（每次运行都会创建新 notebook）
  // testNotebookId: null,

  // 测试用的 URLs
  testUrls: [
    'https://en.wikipedia.org/wiki/Artificial_intelligence',
    'https://en.wikipedia.org/wiki/Machine_learning'
  ],

  // 是否清理测试数据（谨慎使用）
  cleanup: false  // true = 删除测试创建的 notebooks
};
```

## 防错清单

### ✅ Before Every Commit

- [ ] 运行 `testAllRPC()`
- [ ] 所有测试通过
- [ ] 查看 debug logs 无 ERROR
- [ ] 如果修改了 RPC 调用，添加了对应的测试

### ✅ Before Every PR

- [ ] 所有集成测试通过
- [ ] 手动测试核心功能
- [ ] 更新 RPC_VERIFICATION.md（如果有新 RPC）
- [ ] 更新 AUDIT.md（如果有新功能）

### ✅ Code Review Checklist

- [ ] RPC 参数格式是否 100% 匹配 Python CLI？
- [ ] 结果解析是否正确（数组索引、嵌套层级）？
- [ ] 是否添加了对应的测试？
- [ ] 是否添加了 debug logging？
- [ ] 错误处理是否完整？

## 性能监控

### 测试运行时间

```javascript
console.time('testAllRPC');
await testAllRPC();
console.timeEnd('testAllRPC');
// Expected: < 10 seconds for all tests
```

### RPC 调用延迟

测试会自动记录每个 RPC 调用的时间。如果某个调用特别慢：

1. 检查网络连接
2. 检查 NotebookLM API 状态
3. 检查参数是否过大

## 常见问题

### Q: 测试失败了，但我确定代码是对的？

A: 检查：
1. Chrome Extension 是否重新加载？
2. 是否登录了 NotebookLM？
3. 测试 notebook 是否还存在？
4. 网络连接是否正常？

### Q: 如何跳过某些测试？

A: 注释掉 `testAllRPC()` 中对应的测试调用

### Q: 测试可以在 CI 环境运行吗？

A: 需要：
1. Headless Chrome 支持
2. NotebookLM 认证
3. 测试 notebook 访问权限

目前建议在本地运行，CI 集成待实现。

### Q: 如何测试 batch 操作？

A: 添加专门的 batch 测试：

```javascript
async function testBatchImport() {
  const urls = TEST_CONFIG.testUrls;
  // ... test batch import
}

async function testBatchStudio() {
  const notebookIds = [...];
  // ... test batch studio creation
}
```

## 总结

### 为什么需要集成测试？

1. **早期发现问题** - 在 commit 之前，不是在用户测试时
2. **系统化验证** - 覆盖所有 RPC 调用，不会遗漏
3. **回归防护** - 改代码时确保没有破坏已有功能
4. **文档即测试** - 测试代码就是最准确的文档
5. **信心** - 提交代码时知道它是工作的

### 下一步

1. ✅ 运行 `testAllRPC()` 验证当前所有功能
2. 🔄 添加剩余 Studio artifact types 的测试
3. 🔄 添加 batch operations 测试
4. 🔄 集成到 CI/CD pipeline
5. 🔄 添加性能基准测试

---

**最重要的规则：Never commit code without running tests first!**
