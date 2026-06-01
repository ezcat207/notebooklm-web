# Lessons Learned - 避免低级错误

## 🤦 案例：函数名错误（makeRPCCall vs callRpc）

### 错误

```javascript
// 我写的代码
if (typeof makeRPCCall === 'function') {  // ❌ 这个函数不存在！
  await makeRPCCall(rpcName, params);
}
```

实际函数名是 `callRpc` 而不是 `makeRPCCall`。

### 为什么会犯这个错误？

1. **没有验证就假设** - 我猜测了函数名而不是去查
2. **跳过检查步骤** - 没有先 grep/搜索确认
3. **过度自信** - 觉得"应该叫这个名字"就直接用了

---

## 💡 预防措施

### 1. **永远先验证，再编码**

#### ❌ 错误流程

```
想法 → 假设 → 写代码 → 测试失败 → 调试
```

#### ✅ 正确流程

```
想法 → 搜索确认 → 验证存在 → 写代码 → 测试成功
```

#### 实际操作

```bash
# 在写代码之前，先确认函数存在
grep -r "function callRpc\|const callRpc" background.js

# 或者用 Read tool 查看文件
# 或者搜索相关代码
```

---

### 2. **添加运行时验证**

现在 test-rpc.js 启动时会检查：

```javascript
// 启动时验证环境
if (typeof callRpc !== 'function') {
  console.error('❌ callRpc function not found!');
  console.log('Available functions:', Object.keys(self));
}
```

**好处**：
- 立即发现问题
- 明确告诉你缺少什么
- 列出可用的函数

---

### 3. **更好的错误信息**

#### ❌ 之前的错误信息

```
Could not establish connection. Receiving end does not exist.
```

很模糊，不知道哪里错了。

#### ✅ 现在的错误信息

```
Running in Service Worker but callRpc function not found!
Make sure test-rpc.js is loaded AFTER background.js defines callRpc.
Available functions: addEventListener, fetch, importScripts, ...
```

清楚说明：
- 什么出错了
- 为什么出错
- 如何修复
- 可用的替代方案

---

### 4. **系统化的验证清单**

每次写依赖其他代码的功能时：

```markdown
[ ] 1. 搜索确认函数/变量真实存在
[ ] 2. 检查函数签名（参数、返回值）
[ ] 3. 添加运行时验证（typeof 检查）
[ ] 4. 写清晰的错误信息
[ ] 5. 测试错误场景（函数不存在时会怎样？）
```

---

### 5. **自动化检测**

#### A. 静态检查（可以添加）

```javascript
// 在开发时运行的检查脚本
const requiredFunctions = ['callRpc', 'getAuthCookies', 'debugLog'];
requiredFunctions.forEach(fn => {
  if (typeof self[fn] !== 'function') {
    throw new Error(`Required function ${fn} not found!`);
  }
});
```

#### B. 类型检查（TypeScript）

```typescript
// 如果用 TypeScript，这个错误会在编译时被发现
declare function callRpc(rpcId: string, params: any[]): Promise<any>;

// 调用不存在的函数 → 编译错误
makeRPCCall(...)  // ❌ Cannot find name 'makeRPCCall'
```

#### C. 单元测试

```javascript
// 测试依赖是否存在
test('callRpc function exists', () => {
  expect(typeof callRpc).toBe('function');
});
```

---

## 🎯 具体改进措施

### 已实施 ✅

1. **环境验证** - test-rpc.js 启动时检查 callRpc 存在
2. **更好的错误信息** - 明确说明缺少什么、如何修复
3. **列出可用函数** - 出错时显示所有可用的函数

### 建议添加 🔄

1. **开发环境检查脚本**
   ```bash
   # scripts/check-deps.js
   # 运行时检查所有依赖函数是否存在
   ```

2. **Pre-commit hook**
   ```bash
   # .git/hooks/pre-commit
   # 提交前运行基本检查
   npm run check-deps
   ```

3. **集成测试**
   ```javascript
   // tests/integration/rpc.test.js
   // 自动化测试所有 RPC 调用
   ```

4. **迁移到 TypeScript**
   - 类型检查会自动捕获这类错误
   - 编译时就能发现，不用等到运行时

---

## 📊 错误分类与预防

| 错误类型 | 例子 | 预防方法 |
|---------|------|---------|
| **函数名错误** | makeRPCCall vs callRpc | grep 搜索 + 运行时验证 |
| **参数格式错误** | RPC 参数不匹配 Python CLI | 对比文档 + 集成测试 |
| **环境假设错误** | 以为可以用 import() | 查官方文档 + 搜索限制 |
| **异步处理错误** | 没有 await | ESLint + TypeScript |
| **权限错误** | CSP, manifest 配置 | 测试每个功能 |

---

## 🔄 工作流程改进

### 之前的流程 ❌

```
需求 → 写代码 → 提交 → 用户测试 → 发现问题 → 修复 → 重复
          ↑                                          ↓
          └──────────────────────────────────────────┘
                    浪费大量时间
```

### 改进后的流程 ✅

```
需求 → 查文档 → 验证假设 → 写代码 → 自测 → 集成测试 → 提交 → 用户验收
       ↑                    ↓
       └────────────────────┘
         早期发现问题
```

---

## 💭 思考题

当你想调用一个函数时，问自己：

1. **这个函数真的存在吗？**
   - 我看到过它的定义吗？
   - 还是我在假设？

2. **它的签名是什么？**
   - 参数顺序对吗？
   - 返回值类型对吗？

3. **在当前上下文可用吗？**
   - Service Worker 能用吗？
   - 需要特殊权限吗？

4. **如果它不存在会怎样？**
   - 错误信息清楚吗？
   - 用户知道怎么修复吗？

---

## 🎓 核心原则

### **"Trust but Verify"（相信但验证）**

- 可以基于经验假设
- 但**必须验证**假设是对的
- 验证成本很低（一个 grep），但不验证的代价很高（多次往返调试）

### **"Fail Fast, Fail Clear"（快速失败，清晰失败）**

- 问题越早发现越好
- 错误信息越清楚越好
- 宁可启动时报错，不要运行时才报

### **"Make Errors Impossible"（让错误不可能发生）**

- 用类型系统防止错误（TypeScript）
- 用自动化测试捕获错误
- 用运行时验证兜底

---

## 📝 记忆口诀

```
写代码前先搜索
假设必须要验证
错误信息要清楚
防御编程早发现
```

---

**最重要的教训：永远不要假设，永远要验证！**

**如果我在写 `callRpc` 之前花 10 秒 grep 一下，就不会有这个问题。**
