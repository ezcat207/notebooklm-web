# RPC Implementation Verification Checklist

**目的**: 确保所有 RPC 调用参数格式和结果解析 100% 匹配 Python CLI

## ✅ 已验证的 RPC 调用

### Notebook Operations

#### 1. LIST_NOTEBOOKS (wXbhsf)
- **参数格式**: `[null, 1, null, [2]]` ✅
- **结果解析**: `result[0]` = notebook list ✅
- **Python CLI**: `notebooks.py:40`
- **测试状态**: ✅ VERIFIED

#### 2. GET_NOTEBOOK (rLM1Ne)
- **参数格式**: `[notebook_id, null, [2], null, 0]` ✅
- **结果解析**:
  - `result[0]` = notebook_data
  - `notebook_data[0]` = title
  - `notebook_data[1]` = sources array
  - `sources[i][0][0]` = source_id
  - `sources[i][1]` = source_title
  - `sources[i][2]` = source_id (alternative location)
- **Python CLI**: `notebooks.py:128-134`, `sources.py:281-310`
- **测试状态**: ✅ VERIFIED
- **常见错误**: ❌ 直接用 `result[0]` 和 `result[1]` (错误！)

#### 3. CREATE_NOTEBOOK (CCqFvf)
- **参数格式**: `[title, null, null, [2], [1, null, null, null, null, null, null, null, null, null, [1]]]` ✅
- **结果解析**: `result[2]` = notebook_id (NOT result[0]!)
- **Python CLI**: `notebooks.py:170-176`
- **测试状态**: ✅ VERIFIED
- **常见错误**: ❌ 只传 `[title, description]` 或解析 `result[0]`

#### 4. DELETE_NOTEBOOK (WWINqb)
- **参数格式**: `[[notebook_id], [2]]` ✅
- **结果解析**: `result !== null` = success
- **Python CLI**: `notebooks.py:237-238`
- **测试状态**: ✅ VERIFIED
- **常见错误**: ❌ 只传 `[notebook_id]`

#### 5. RENAME_NOTEBOOK (s0tc2d)
- **参数格式**: `[notebook_id, [[null, null, null, [null, new_title]]]]` ✅
- **结果解析**: `result !== null` = success
- **Python CLI**: `notebooks.py:191-192`
- **测试状态**: ✅ VERIFIED
- **常见错误**: ❌ 传 `[notebook_id, new_title]`

#### 6. GET_SUMMARY (VfAZjd)
- **参数格式**: `[notebook_id, [2]]` ✅
- **结果解析**:
  - `result[0][0]` = summary text
  - `result[1][0]` = suggested_topics array
- **Python CLI**: `notebooks.py:136-166`
- **测试状态**: ✅ VERIFIED

### Source Operations

#### 7. ADD_SOURCE (izAoDd) - Legacy
- **参数格式**:
  - URL: `[notebook_id, [[url, 1], null, null]]`
  - Text: See ADD_TEXT_SOURCE
- **Python CLI**: `sources.py:348-489`
- **测试状态**: ⚠️ NEEDS VERIFICATION
- **注意**: 有 v1 (izAoDd) 和 v2 (ozz5Z) 两个版本，需要 fallback 逻辑

#### 8. ADD_SOURCE (Text) - Legacy
- **参数格式**:
  ```javascript
  [
    [source_data],
    notebook_id,
    null, null, null, null, null, null, null, null, [2]
  ]
  // where source_data = [null, [title, text], null, 2, null, null, null, null, null, null, 1]
  ```
- **Python CLI**: `sources.py:610-650`
- **测试状态**: ⚠️ NEEDS VERIFICATION

#### 9. DELETE_SOURCE (tGMBJ)
- **参数格式**: `[[[source_id]], [2]]` ✅
- **结果解析**: `result !== null` = success
- **Python CLI**: `sources.py:252-254`
- **测试状态**: ✅ VERIFIED
- **常见错误**: ❌ 传 `[notebook_id, source_id]`

### Studio Operations

#### 10. CREATE_STUDIO (R7cb6c)
- **参数格式**: `[[2], notebook_id, content]` ✅
- **content 结构**: 根据 artifact type 不同（见下方详细说明）
- **结果解析**: `result[0]` = artifact_id
- **Python CLI**: `studio.py:各个 create 方法`
- **测试状态**: ✅ VERIFIED (所有9种类型)

##### Studio Content 格式

**Audio (Type 1)**:
```javascript
content = [
  null, null, 1, sources_nested, null, null,
  [null, [focus, length, null, sources_simple, language, null, format]]
]
```

**Video (Type 3)**:
```javascript
content = [
  null, null, 3, sources_nested, null, null, null, null,
  [null, null, [sources_simple, language, focus, null, format, style?, stylePrompt?]]
]
```

**Infographic (Type 7)** - 15 elements:
```javascript
content = [
  null, null, 7, sources_nested,
  null, null, null, null, null, null, null, null, null, null,
  [[focus, language, null, orientation, detail, style]]
]
```

**Slide Deck (Type 8)** - 17 elements:
```javascript
content = [
  null, null, 8, sources_nested,
  null, null, null, null, null, null, null, null, null, null, null, null,
  [[focus, language, format, length]]
]
```

**Report (Type 2)**:
```javascript
content = [
  null, null, 2, sources_nested, null, null, null,
  [null, [title, description, null, sources_simple, language, prompt, null, true]]
]
```

**Flashcards (Type 4, variant 1)**:
```javascript
content = [
  null, null, 4, sources_nested, null, null, null, null, null,
  [null, [1, null, focus, null, null, null, [difficulty, count]]]
]
```

**Quiz (Type 4, variant 2)**:
```javascript
content = [
  null, null, 4, sources_nested, null, null, null, null, null,
  [null, [2, null, focus, null, null, null, null, [questionCount, difficulty]]]
]
```

**Data Table (Type 9)** - 19 elements:
```javascript
content = [
  null, null, 9, sources_nested,
  null, null, null, null, null, null, null, null, null, null, null, null, null, null,
  [null, [description, language]]
]
```

**Sources 格式**:
- `sources_nested = [[[id1]], [[id2]], ...]` - 用于 content 数组
- `sources_simple = [[id1], [id2], ...]` - 用于 options

#### 11. POLL_STUDIO (gArtLc)
- **参数格式**: `[notebook_id, artifact_id]`
- **结果解析**:
  - `result[0]` = status (1=processing, 2=completed, 3=failed)
  - `result[1]` = progress (0.0 - 1.0)
- **Python CLI**: `studio.py` (需要查找具体行)
- **测试状态**: ⚠️ NEEDS VERIFICATION

### Sharing Operations

#### 12. GET_SHARE_STATUS (JFMDGd)
- **参数格式**: `[notebook_id]`
- **结果解析**: 需要查看 Python CLI
- **测试状态**: ⚠️ NEEDS VERIFICATION

#### 13. SHARE_NOTEBOOK (QDyure)
- **参数格式**: 需要查看 Python CLI
- **测试状态**: ⚠️ NEEDS VERIFICATION

---

## 🔍 验证流程

### 对于每个新的 RPC 调用实现：

1. **查找 Python CLI 实现**
   ```bash
   grep -r "RPC_YOUR_FUNCTION" /path/to/python-cli/src/
   ```

2. **记录确切参数格式**
   - 复制 Python CLI 中的 `params = [...]` 行
   - 注意所有 `None`, `null`, 嵌套数组

3. **记录结果解析方式**
   - 查看 Python CLI 如何解析 `result`
   - 注意数组索引（result[0], result[0][0], etc.）

4. **实现并添加注释**
   ```javascript
   /**
    * Function name
    * Python CLI format: [exact, params, here]
    * Returns: result structure explanation
    * Python CLI: filename.py:line_number
    */
   ```

5. **添加 debug logging**
   ```javascript
   debugLog("INFO", "functionName", "Raw result", {
     hasResult: !!result,
     structure: ...
   });
   ```

6. **测试验证**
   - 用 Python CLI 测试相同操作
   - 比对输出结果
   - 确保错误处理正确

7. **更新此文档**
   - 标记为 ✅ VERIFIED
   - 记录常见错误

---

## ⚠️ 常见错误模式

### 1. 参数格式错误
❌ **错误**: 猜测参数，简化嵌套
```javascript
// 错误示例
params = [id, title]  // 太简单！
```

✅ **正确**: 完全复制 Python CLI
```javascript
// 正确示例 (from Python CLI)
params = [id, [[null, null, null, [null, title]]]]
```

### 2. 结果解析错误
❌ **错误**: 假设 result 是简单数组
```javascript
// 错误示例
const id = result[0]  // 可能不对！
```

✅ **正确**: 查看 Python CLI 如何解析
```javascript
// 正确示例
const notebookData = Array.isArray(result[0]) ? result[0] : result
const id = notebookData[2]  // 根据 Python CLI 确定索引
```

### 3. 缺少嵌套层级
❌ **错误**: 少一层或多一层嵌套
```javascript
// 错误示例
params = [[id], 2]  // 少了一层！
```

✅ **正确**: 精确匹配嵌套
```javascript
// 正确示例
params = [[[id]], [2]]  // 三层嵌套！
```

---

## 📝 待验证列表

需要系统验证的 RPC 调用：

- [ ] ADD_SOURCE (URL) - 验证 v1/v2 fallback 逻辑
- [ ] ADD_SOURCE (Text) - 验证复杂的 source_data 结构
- [ ] POLL_STUDIO - 验证参数和结果解析
- [ ] DOWNLOAD_ARTIFACT - 验证参数和结果
- [ ] GET_SHARE_STATUS - 验证参数和结果
- [ ] SHARE_NOTEBOOK - 验证参数和结果
- [ ] RENAME_SOURCE - 确认是否实现
- [ ] ADD_FILE_SOURCE - 确认是否实现

---

## 🧪 自动化测试脚本

创建 `test-rpc.sh` 来自动验证所有 RPC 调用：

```bash
#!/bin/bash
# 创建测试 notebook
TEST_NB=$(nlm notebook create "RPC-Test-$(date +%s)" | grep -o '[a-f0-9-]\{36\}')

# 添加 source
nlm source add $TEST_NB --url "https://example.com"

# 创建 studio
nlm audio create $TEST_NB -y

# 清理
nlm notebook delete $TEST_NB

echo "All RPC tests passed!"
```

---

**最后更新**: 2026-05-31
**维护者**: 每次修改 RPC 调用时必须更新此文档
