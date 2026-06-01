# Bug Backlog - 待修复问题

所有已知问题和技术债务，按优先级排序

---

## 🔴 P0 - 阻塞性问题（影响核心功能）

目前无 P0 级别 bug（核心功能可用）

---

## 🟡 P1 - 重要问题（影响用户体验）

### Bug #1: RPC 测试失败 - 数据解析错误

**问题描述：**
3 个 RPC 集成测试失败，但 RPC 调用本身成功（200 响应），问题在于结果解析逻辑不正确。

**失败的测试：**
```
❌ GET_SUMMARY: Summary is not a string
❌ CREATE_STUDIO_AUDIO: Artifact ID is not a string
❌ CREATE_STUDIO_INFOGRAPHIC: Artifact ID is not a string
```

**影响范围：**
- 不影响实际功能（RPC 调用工作正常）
- 只影响开发时的自动化测试
- 测试覆盖率不完整

**根本原因：**
测试代码期望的数据结构与实际返回的结构不匹配：
- 期望 `result[0]` 是 string
- 实际可能是嵌套数组或不同结构

**修复方案：**
1. 添加 debug 日志查看实际数据结构
2. 修正解析逻辑匹配实际结构
3. 参考 Python CLI 的解析方式

**预计工时：** 2-4 小时

**相关文件：**
- `chrome-extension/test-rpc.js` (行 testGetSummary, testCreateStudioAudio, testCreateStudioInfographic)

**何时修复：**
- MVP 完成后
- 或需要完整测试覆盖时

---

### Bug #2: Vercel 部署需要登录（SSO 保护）

**问题描述：**
Vercel 部署的网站有 SSO/Deployment Protection，非登录用户无法访问。

**影响范围：**
- 无法公开分享网站
- 用户无法直接访问 Web UI

**根本原因：**
Vercel 项目或团队级别启用了默认 SSO 保护

**修复方案：**
去 Vercel Dashboard 关闭 Deployment Protection：
```
https://vercel.com/ezcat207s-projects/web/settings/deployment-protection
→ 选择 "Only Preview Deployments"
→ Production 公开访问
```

**预计工时：** 5 分钟（手动操作）

**何时修复：**
- 需要公开分享时
- 或发布 MVP 之前

**文档：**
- `VERCEL_PUBLIC_ACCESS.md` 有完整步骤

---

## 🟢 P2 - 次要问题（不影响主要功能）

### Bug #3: Cookie SAPSID not found 警告

**问题描述：**
测试运行时显示警告：
```
[WARN][Auth] Cookie SAPSID not found
```

**影响范围：**
- 不影响功能（其他 5 个 cookies 足够）
- 只是警告信息，不是错误

**根本原因：**
`SAPSID` cookie 可能在某些账号配置下不存在

**修复方案：**
修改日志级别或检查逻辑：
```javascript
// 从 WARN 改为 DEBUG
debugLog("DEBUG", "Auth", "Cookie SAPSID not found (optional)");
```

**预计工时：** 10 分钟

**何时修复：**
- 日志清理时
- 或用户反馈日志太多时

---

### Bug #4: 测试代码重复加载警告

**问题描述：**
当用户手动运行 `importScripts()` 时会报错：
```
SyntaxError: Identifier 'TEST_CONFIG' has already been declared
```

**影响范围：**
- 不影响功能（test-rpc.js 已自动加载）
- 只影响不了解使用方式的用户

**根本原因：**
用户不知道测试已自动加载，手动运行导致重复

**修复方案：**
1. 更新 `RUN_TESTS.md` 文档说明
2. 添加检测避免重复加载：
```javascript
if (typeof TEST_CONFIG !== 'undefined') {
  console.warn('Tests already loaded, skipping...');
  return;
}
```

**预计工时：** 30 分钟

**何时修复：**
- 文档更新时
- 或收到用户反馈时

---

## 📝 技术债务

### TD #1: 缺少 TypeScript 类型检查

**问题描述：**
项目使用 JavaScript，缺少类型检查，容易出现函数名错误等低级问题。

**影响范围：**
- 开发效率低（需要运行时才发现错误）
- 容易出现函数名拼写错误（如 `makeRPCCall` vs `callRpc`）

**改进方案：**
迁移到 TypeScript 或添加 JSDoc 类型注释

**预计工时：** 2-3 天（完整迁移）

**何时处理：**
- MVP 完成后
- 团队扩大时

---

### TD #2: 缺少单元测试

**问题描述：**
只有集成测试，没有单元测试覆盖关键函数。

**影响范围：**
- 重构时不敢动代码
- 回归问题难以发现

**改进方案：**
添加 Jest/Vitest 单元测试：
```
tests/
  ├── unit/
  │   ├── rpc.test.js
  │   ├── auth.test.js
  │   └── studio.test.js
  └── integration/
      └── e2e.test.js
```

**预计工时：** 3-5 天

**何时处理：**
- 代码库稳定后
- 或准备开源时

---

### TD #3: 缺少错误监控和日志分析

**问题描述：**
用户遇到问题时无法远程诊断，只能靠用户提供日志文件。

**改进方案：**
1. 集成 Sentry（错误追踪）
2. 添加可选的匿名使用统计
3. 错误自动上报（用户同意后）

**预计工时：** 1-2 天

**何时处理：**
- 用户数 > 100 时
- 或错误报告频繁时

---

### TD #4: 性能优化 - 批量操作并发控制

**问题描述：**
批量操作时可能触发 Google API 限流。

**当前状态：**
未实现并发限制和重试逻辑

**改进方案：**
```javascript
// 使用 p-limit 控制并发
import pLimit from 'p-limit';
const limit = pLimit(3); // 最多 3 个并发

const promises = urls.map(url =>
  limit(() => addUrlSource(notebookId, url))
);
```

**预计工时：** 1 天

**何时处理：**
- MVP 批量功能实现时
- 或收到限流报告时

---

## 📊 问题统计

| 优先级 | 数量 | 总预计工时 |
|--------|------|----------|
| P0 阻塞性 | 0 | 0 小时 |
| P1 重要 | 2 | 2-4 小时 |
| P2 次要 | 2 | 40 分钟 |
| 技术债务 | 4 | 7-11 天 |

---

## 🔄 处理策略

### 立即修复（MVP 阻塞）
目前无 MVP 阻塞问题

### MVP 后修复（1-2 周内）
1. Bug #1: RPC 测试数据解析
2. Bug #2: Vercel SSO 关闭

### 长期优化（3 个月内）
1. TD #1: TypeScript 迁移
2. TD #2: 单元测试覆盖
3. TD #3: 错误监控
4. TD #4: 并发控制

---

## 📝 添加新 Bug 的流程

1. 在此文件添加新 Bug 条目
2. 分配优先级（P0/P1/P2/TD）
3. 估算工时
4. 关联相关文件/代码
5. 定期 review 和更新状态

---

**原则：先做功能，后修 Bug。只修阻塞性 Bug，其他可以等。**

Generated with [Claude Code](https://claude.ai/code)
via [Happy](https://happy.engineering)
