# NotebookLM API 研究文档

> 基于 `notebooklm-mcp-cli` 项目的完整 API 分析
>
> **研究日期**: 2026-05-31
> **数据来源**: [notebooklm-mcp-cli](https://github.com/jacob-bd/notebooklm-mcp-cli)

---

## 目录

- [认证机制](#认证机制)
- [API 端点](#api-端点)
- [RPC 调用协议](#rpc-调用协议)
- [完整 RPC ID 列表](#完整-rpc-id-列表)
- [数据结构](#数据结构)
- [错误处理](#错误处理)
- [功能分类](#功能分类)

---

## 认证机制

### Cookie 认证

NotebookLM 使用 Google 账号 Cookie 进行认证，需要以下 Cookie：

| Cookie 名称 | 必需性 | 说明 |
|------------|--------|------|
| `SAPSID` | ✅ 必需 | 主要认证 Cookie |
| `__Secure-1PSID` | ✅ 必需 | 安全 Cookie (第一方) |
| `__Secure-3PSID` | ✅ 必需 | 安全 Cookie (第三方) |
| `HSID` | 可选 | HTTP 会话 ID |
| `SSID` | 可选 | 安全会话 ID |
| `SID` | 可选 | 会话 ID |

**Cookie 域名**:
- `.google.com` - 主域名
- `.googleusercontent.com` - 文件下载域名（需要复制 Cookie）

### CSRF Token

从 NotebookLM 页面提取，每次页面加载时刷新：

```javascript
// 从 HTML 中提取
const csrfMatch = html.match(/"SNlM0e":"([^"]+)"/);
const csrfToken = csrfMatch[1];
```

### Session ID

从页面提取，用于请求参数：

```javascript
const sessionMatch = html.match(/"FdrFJe":"([^"]+)"/);
const sessionId = sessionMatch[1];
```

### Build Label

前端构建版本标识，用于请求参数：

```javascript
const buildMatch = html.match(/"cfb2h":"([^"]+)"/);
const buildLabel = buildMatch[1];  // 例如: "boq_labs-tailwind-frontend_20260108.06_p0"
```

---

## API 端点

### 主要端点

| 端点 | 用途 | 方法 |
|------|------|------|
| `/_/LabsTailwindUi/data/batchexecute` | RPC 调用 | POST |
| `/upload/_/` | 文件上传 | POST |
| `/_/LabsTailwindUi/data/google.internal.labs.tailwind.orchestration.v1.LabsTailwindOrchestrationService/GenerateFreeFormStreamed` | AI 查询（流式） | POST |

### Base URL

```
https://notebooklm.google.com
```

---

## RPC 调用协议

### 请求格式

**URL 参数**:
```
?rpcids={RPC_ID}&source-path={PATH}&f.sid={SESSION_ID}&bl={BUILD_LABEL}&hl=en&_reqid={COUNTER}&rt=c
```

**请求体**:
```
f.req=[["rpcId", "jsonEncodedParams", null, "generic"]]
```

**完整示例**:
```javascript
const url = "https://notebooklm.google.com/_/LabsTailwindUi/data/batchexecute?rpcids=wXbhsf&source-path=/&f.sid=abc123&bl=boq_labs...&hl=en&_reqid=100001&rt=c";

const body = `f.req=${encodeURIComponent(
  JSON.stringify([["wXbhsf", JSON.stringify([null, 1, null, [2]]), null, "generic"]])
)}`;

fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    "X-Same-Domain": "1",
    "X-Goog-AuthUser": "0",
  },
  body: body,
  credentials: "include",
});
```

### 响应格式

**Anti-XSSI 前缀**:
```
)]}'
```

**分块响应**:
```
)]}'
123
[["wrb.fr","rpcId","jsonResult"]]
456
[["wrb.fr","rpcId2","jsonResult2"]]
```

**解析逻辑**:
1. 移除 `)]}'` 前缀
2. 按行分割
3. 奇数行是字节数（可忽略）
4. 偶数行是 JSON 数据
5. 提取 `["wrb.fr", rpcId, result]` 结构

### 错误响应

```javascript
["wrb.fr", "rpcId", null, ..., [errorCode, null, [[detailType, detailData]]], "generic"]
```

**常见错误码**:
| 错误码 | 说明 |
|--------|------|
| 3 | INVALID_ARGUMENT |
| 5 | NOT_FOUND |
| 7 | PERMISSION_DENIED |
| 8 | RESOURCE_EXHAUSTED (配额超限) |
| 16 | UNAUTHENTICATED (认证过期) |

---

## 完整 RPC ID 列表

### 笔记本操作 (Notebook Operations)

| RPC ID | 功能 | 参数 |
|--------|------|------|
| `wXbhsf` | 列出笔记本 | `[null, 1, null, [2]]` |
| `CCqFvf` | 创建笔记本 | `[title, description]` |
| `s0tc2d` | 重命名笔记本 | `[notebook_id, new_title]` |
| `WWINqb` | 删除笔记本 | `[notebook_id]` |
| `rLM1Ne` | 获取笔记本详情 | `[notebook_id, null, [2], null, 0]` |
| `VfAZjd` | 获取笔记本摘要 | `[notebook_id, [2]]` |

### 来源操作 (Source Operations)

| RPC ID | 功能 | 参数 |
|--------|------|------|
| `izAoDd` | 添加来源 (旧版) | `[notebook_id, [[url, 1], null, null]]` |
| `ozz5Z` | 添加 URL 来源 (新版) | `[notebook_id, [[url, 1], null, null]]` |
| `o4cbdc` | 注册文件上传 | `[notebook_id, file_metadata]` |
| `hizoJc` | 获取来源详情 | `[source_id]` |
| `yR9Yof` | 检查 Drive 来源新鲜度 | `[notebook_id, source_id]` |
| `FLmJqe` | 同步 Drive 来源 | `[notebook_id, source_id]` |
| `tGMBJ` | 删除来源 | `[notebook_id, source_id]` |
| `b7Wfje` | 重命名来源 | `[notebook_id, source_id, new_title]` |
| `tr032e` | 获取来源指南 | `[notebook_id, source_id]` |

### Studio 内容生成 (Studio Content)

| RPC ID | 功能 | 参数 |
|--------|------|------|
| `R7cb6c` | 创建 Studio 内容 | `[notebook_id, artifact_type, options]` |
| `gArtLc` | 轮询 Studio 状态 | `[notebook_id, artifact_id]` |
| `V5N4be` | 删除 Studio 内容 | `[notebook_id, artifact_id]` |
| `rc3d8d` | 重命名 Artifact | `[notebook_id, artifact_id, new_title]` |
| `v9rmvd` | 获取交互式 HTML | `[notebook_id, artifact_id]` |
| `KmcKPe` | 修订幻灯片 | `[notebook_id, artifact_id, instructions]` |

**Artifact 类型**:
- `1` = Audio Overview
- `2` = Video Overview
- `3` = Report (Briefing Doc)
- `4` = Quiz
- `5` = Flashcards
- `6` = Mind Map
- `7` = Slide Deck
- `8` = Infographic
- `9` = Data Table

### 研究功能 (Research)

| RPC ID | 功能 | 参数 |
|--------|------|------|
| `Ljjv0c` | 启动快速研究 | `[notebook_id, query, source_type]` |
| `QA9ei` | 启动深度研究 | `[notebook_id, query]` |
| `e3bVqc` | 轮询研究进度 | `[notebook_id, task_id]` |
| `LBwxtb` | 导入研究结果 | `[notebook_id, task_id, sources]` |

### 查询和对话 (Query & Chat)

| RPC ID | 功能 | 说明 |
|--------|------|------|
| `hPTbtc` | 获取对话历史 | |
| `J7Gthc` | 删除聊天历史 | |
| `hT54vc` | 偏好设置 | |
| `ZwVcOc` | 聊天配置 | 设置聊天目标和响应长度 |

**查询端点** (非 batchexecute):
```
POST /_/LabsTailwindUi/data/google.internal.labs.tailwind.orchestration.v1.LabsTailwindOrchestrationService/GenerateFreeFormStreamed
```

### 思维导图 (Mind Map)

| RPC ID | 功能 | 参数 |
|--------|------|------|
| `yyryJe` | 生成思维导图 | `[notebook_id]` |
| `CYK0Xb` | 保存思维导图 | `[notebook_id, mind_map_json]` |
| `cFji9` | 列出思维导图 | `[notebook_id]` |
| `AH0mwd` | 删除思维导图 | `[notebook_id, mind_map_id]` |

### 笔记 (Notes)

| RPC ID | 功能 | 参数 |
|--------|------|------|
| `CYK0Xb` | 创建笔记 | `[notebook_id, content, title]` |
| `cFji9` | 列出笔记 | `[notebook_id]` |
| `cYAfTb` | 更新笔记 | `[notebook_id, note_id, content]` |
| `AH0mwd` | 删除笔记 | `[notebook_id, note_id]` |

**注意**: 笔记和思维导图共享部分 RPC ID，通过参数区分

### 标签 (Labels)

| RPC ID | 功能 | 参数 |
|--------|------|------|
| `agX4Bc` | 管理标签 | 自动标记/创建/列出 |
| `le8sX` | 修改标签 | 重命名/设置 emoji/移动来源 |
| `GyzE7e` | 删除标签 | `[notebook_id, label_ids]` |

### 分享 (Sharing)

| RPC ID | 功能 | 参数 |
|--------|------|------|
| `QDyure` | 设置分享权限 | `[notebook_id, visibility, collaborators]` |
| `JFMDGd` | 获取分享状态 | `[notebook_id]` |

### 导出 (Export)

| RPC ID | 功能 | 参数 |
|--------|------|------|
| `Krh3pd` | 导出到 Google Docs/Sheets | `[notebook_id, artifact_id, export_type]` |

---

## 数据结构

### Notebook 对象

```javascript
{
  id: "notebook-uuid",
  title: "Notebook Title",
  source_count: 10,
  sources: [
    {
      id: "source-uuid",
      title: "Source Title"
    }
  ],
  is_owned: true,
  is_shared: false,
  created_at: "2026-05-31T12:00:00Z",
  modified_at: "2026-05-31T14:30:00Z"
}
```

**原始响应结构**:
```javascript
[
  [
    // 笔记本列表
    [
      "Title",           // [0] 标题
      [sources],         // [1] 来源列表
      "notebook-uuid",   // [2] ID
      "emoji",           // [3] emoji 或 null
      null,              // [4]
      [                  // [5] 元数据
        1,               // [0] 所有权 (1=mine, 2=shared_with_me)
        false,           // [1] 是否分享
        true,            // [2]
        null,            // [3]
        null,            // [4]
        [seconds, nanos], // [5] 修改时间
        null,            // [6]
        null,            // [7]
        [seconds, nanos]  // [8] 创建时间
      ]
    ]
  ]
]
```

### Source 对象

```javascript
{
  id: "source-uuid",
  title: "Source Title",
  type: 1,  // 1=URL, 2=Text, 3=Drive, 4=File
  url: "https://...",
  status: "ready"  // ready, processing, failed
}
```

### Studio Artifact 对象

```javascript
{
  id: "artifact-uuid",
  type: 1,  // 见上方 Artifact 类型表
  status: "completed",  // processing, completed, failed
  title: "Generated Content",
  download_url: "https://..."
}
```

---

## 错误处理

### 认证错误

```javascript
if (errorCode === 16) {
  throw new Error("Authentication expired - need to re-login");
}
```

**处理策略**:
1. 刷新 CSRF Token 和 Session ID
2. 重新读取 Cookie
3. 如果仍然失败，引导用户重新登录

### 配额限制

```javascript
if (errorCode === 8) {
  // RESOURCE_EXHAUSTED
  // 等待一段时间后重试
  await new Promise(resolve => setTimeout(resolve, 60000));
}
```

### 重试策略

```javascript
async function callRpcWithRetry(rpcId, params, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await callRpc(rpcId, params);
    } catch (error) {
      if (error.code === 16 && attempt === 0) {
        // 认证错误，刷新 token
        await refreshAuthTokens();
        continue;
      }

      if (error.code === 8) {
        // 配额限制，等待后重试
        await new Promise(resolve => setTimeout(resolve, 30000 * (attempt + 1)));
        continue;
      }

      if (attempt === maxRetries - 1) {
        throw error;
      }
    }
  }
}
```

---

## 功能分类

### 核心功能 (35 个工具)

#### 1. 笔记本管理 (6)
- ✅ 列出笔记本
- ✅ 创建笔记本
- ✅ 获取详情
- ✅ 获取 AI 摘要
- ✅ 重命名
- ✅ 删除

#### 2. 来源管理 (6)
- ✅ 添加来源 (URL/文本/Drive/文件)
- ✅ 列出 Drive 来源
- ✅ 同步 Drive 来源
- ✅ 删除来源
- ✅ 获取来源摘要
- ✅ 获取来源全文

#### 3. 查询 (2)
- ✅ 笔记本查询
- ✅ 配置聊天

#### 4. Studio 内容 (4)
- ✅ 创建内容 (9 种类型)
- ✅ 查询状态
- ✅ 删除内容
- ✅ 修订幻灯片

#### 5. 下载 (1)
- ✅ 下载 Artifact

#### 6. 导出 (1)
- ✅ 导出到 Google Docs/Sheets

#### 7. 研究 (3)
- ✅ 启动研究 (Web/Drive)
- ✅ 查询进度
- ✅ 导入结果

#### 8. 笔记 (1)
- ✅ 统一笔记管理 (CRUD)

#### 9. 分享 (3)
- ✅ 获取分享状态
- ✅ 公开分享
- ✅ 邀请协作者

#### 10. 批量操作 (2)
- ✅ 批量操作
- ✅ 跨笔记本查询

#### 11. 工作流 (1)
- ✅ 管道执行

#### 12. 标签 (1)
- ✅ 标签管理

#### 13. 认证 (2)
- ✅ 刷新认证
- ✅ 保存 Token

#### 14. 服务器 (1)
- ✅ 服务器信息

---

## Studio 内容详细参数

### Audio Overview

```javascript
{
  artifact_type: "audio",
  format: "deep_dive",  // deep_dive, brief, critique, debate
  length: "long",       // short, default, long
}
```

### Video Overview

```javascript
{
  artifact_type: "video",
  format: "explainer",  // explainer, brief
  style: "auto_select", // auto_select, classic, whiteboard, kawaii, anime, watercolor, retro_print, heritage, paper_craft
}
```

### Report

```javascript
{
  artifact_type: "report",
  format: "briefing_doc", // briefing_doc, study_guide, blog_post, custom
  custom_instructions: "..."  // 仅当 format=custom 时
}
```

### Quiz

```javascript
{
  artifact_type: "quiz",
  question_count: 10,
  difficulty: "medium"  // easy, medium, hard
}
```

### Flashcards

```javascript
{
  artifact_type: "flashcards",
  count: 20,
  difficulty: "medium"  // easy, medium, hard
}
```

### Infographic

```javascript
{
  artifact_type: "infographic",
  orientation: "landscape", // landscape, portrait, square
  detail_level: "standard"  // concise, standard, detailed
}
```

### Slide Deck

```javascript
{
  artifact_type: "slide_deck",
  format: "detailed",   // detailed, presenter
  length: "default",    // short, default
}
```

---

## 实现优先级建议

### P0 (必须实现)
- ✅ 认证和 Cookie 管理
- ✅ 笔记本列表/创建
- ✅ URL 来源添加
- ✅ 批量导入
- ✅ Audio 生成
- ✅ 文件下载

### P1 (重要功能)
- ⏭️ 文本来源添加
- ⏭️ 文件上传
- ⏭️ Video/Infographic/Slide 生成
- ⏭️ 笔记本查询
- ⏭️ 分享功能

### P2 (增强功能)
- ⏭️ 研究功能
- ⏭️ Drive 来源同步
- ⏭️ 批量操作
- ⏭️ 跨笔记本查询
- ⏭️ 标签管理

### P3 (高级功能)
- ⏭️ 工作流管道
- ⏭️ 笔记管理
- ⏭️ 导出到 Google Docs

---

## 测试建议

### 1. 认证测试
```javascript
// 检查 Cookie
chrome.cookies.getAll({ url: "https://notebooklm.google.com" }, (cookies) => {
  console.log("Cookies:", cookies);
});

// 测试 Token 刷新
await refreshAuthTokens();
```

### 2. API 调用测试
```javascript
// 列出笔记本
const notebooks = await callRpc("wXbhsf", [null, 1, null, [2]]);

// 创建笔记本
const result = await callRpc("CCqFvf", ["Test Notebook", "Description"]);
```

### 3. 批量操作测试
```javascript
// 批量导入 10 个 URL
const urls = Array.from({ length: 10 }, (_, i) => `https://example.com/${i}`);
await batchImport(notebookId, urls);
```

---

## 参考链接

- [notebooklm-mcp-cli GitHub](https://github.com/jacob-bd/notebooklm-mcp-cli)
- [MCP Guide](https://github.com/jacob-bd/notebooklm-mcp-cli/blob/main/docs/MCP_GUIDE.md)
- [CLI Guide](https://github.com/jacob-bd/notebooklm-mcp-cli/blob/main/docs/CLI_GUIDE.md)
- [API Reference](https://github.com/jacob-bd/notebooklm-mcp-cli/blob/main/docs/API_REFERENCE.md)

---

**最后更新**: 2026-05-31
**版本**: 1.0.0
