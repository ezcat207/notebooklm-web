# NotebookLM Web UI - Implementation Audit

**Test Notebook**: `TEST-WebUI-Audit-174843`
**Notebook ID**: `64ed8fbe-3879-43cf-ae06-635e571dbd12`
**Test Date**: 2026-05-31
**Auditor**: Claude Code

---

## Executive Summary

This document provides a comprehensive audit comparing the NotebookLM Web UI implementation against the reference Python CLI (`notebooklm-mcp-cli`). All tests are conducted using the dedicated test notebook to avoid modifying user data.

### Status Legend
- ✅ **Verified**: CLI tested successfully, implementation matches
- ⚠️ **Partial**: CLI tested, implementation needs updates
- ❌ **Missing**: Not implemented in Web UI
- 🧪 **Testing**: Currently under verification

---

## 1. Studio Artifact Creation

### RPC Format Reference
All studio creation calls use the same base RPC ID (`R7cb6c`) with format:
```
params = [[2], notebook_id, content]
```

Where `content` structure varies by artifact type. All artifact types require:
- Triple-nested source arrays: `sources_nested = [[[source_id_1]], [[source_id_2]], ...]`
- Simple source arrays (for options): `sources_simple = [[source_id_1], [source_id_2], ...]`

### 1.1 Audio Overview (Type 1)

**CLI Command**:
```bash
nlm audio create NOTEBOOK_ID --format FORMAT --length LENGTH --language LANG --focus FOCUS -y
```

**CLI Parameters**:
- `--format`: `brief` (1), `deep_dive` (2), `critique` (3), `debate` (4) — default: `deep_dive`
- `--length`: `short` (1), `default` (2), `long` (3) — default: `default`
- `--language`: BCP-47 code (default: `en`)
- `--focus`: Optional focus topic
- `--source-ids`: Comma-separated source IDs

**RPC Parameters** (Python CLI `studio.py:197-201`):
```python
audio_options = [
    None,
    [focus_prompt, length_code, None, sources_simple, language, None, format_code],
]

params = [
    [2],
    notebook_id,
    [None, None, 1, sources_nested, None, None, audio_options],  # Type 1 = Audio
]
```

**Test Results**:
```bash
✅ CLI Test: nlm audio create 64ed8fbe-3879-43cf-ae06-635e571dbd12 --format deep_dive --length long -y
   Result: Artifact ID 3a0c107f-1d9e-41fa-af47-50a2e2a5d4bc created, status: in_progress
```

**Web UI Status**: ⚠️ **NEEDS UPDATE**
- Current implementation in `background.js:createStudio()` was fixed for basic audio creation
- ✅ Has `[[2]]` prefix
- ✅ Has sources_nested
- ❌ Missing format parameter support (currently hardcoded to deep_dive)
- ❌ Missing length parameter support (currently hardcoded to long)
- ❌ Missing language parameter support
- ❌ Missing focus parameter support

---

### 1.2 Video Overview (Type 3)

**CLI Command**:
```bash
nlm video create NOTEBOOK_ID --format FORMAT --style STYLE --style-prompt PROMPT --language LANG --focus FOCUS -y
```

**CLI Parameters**:
- `--format`: `explainer` (1), `brief` (2), `cinematic` (3) — default: `explainer`
- `--style`: `auto_select` (1), `custom`, `classic`, `whiteboard`, `kawaii`, `anime`, `watercolor`, `retro_print`, `heritage`, `paper_craft`
- `--style-prompt`: Custom visual style description
- `--language`: BCP-47 code (default: `en`)
- `--focus`: Optional focus topic

**RPC Parameters** (Python CLI `studio.py:266-280`):
```python
# Cinematic format (3) omits visual_style_code
inner_options = [sources_simple, language, focus_prompt, None, format_code]
if format_code != 3:  # Not cinematic
    inner_options.append(visual_style_code)
    if visual_style_prompt:
        inner_options.append(visual_style_prompt)

video_options = [None, None, inner_options]

params = [
    [2],
    notebook_id,
    [
        None, None, 3, sources_nested,  # Type 3 = Video
        None, None, None, None,
        video_options,  # Position 8
    ],
]
```

**Test Results**:
```bash
✅ CLI Test: nlm video create 64ed8fbe-3879-43cf-ae06-635e571dbd12 --format explainer --style classic -y
   Result: Artifact ID fe1accd4-fbaf-4ba7-831d-39c4fbdb25b3 created, status: in_progress
```

**Web UI Status**: ❌ **NOT IMPLEMENTED**

---

### 1.3 Infographic (Type 7)

**CLI Command**:
```bash
nlm infographic create NOTEBOOK_ID --orientation ORIENT --detail DETAIL --style STYLE --language LANG --focus FOCUS -y
```

**CLI Parameters**:
- `--orientation`: `landscape` (1), `portrait` (2), `square` (3) — default: `landscape`
- `--detail`: `concise` (1), `standard` (2), `detailed` (3) — default: `standard`
- `--style`: `auto_select` (1), `sketch_note` (2), `professional` (3), `bento_grid`, `editorial`, `instructional`, `bricks`, `clay`, `anime`, `kawaii`, `scientific`
- `--language`: BCP-47 code (default: `en`)
- `--focus`: Optional focus topic

**RPC Parameters** (Python CLI `studio.py:677-695`):
```python
infographic_options = [
    [
        focus_prompt or None,
        language,
        None,
        orientation_code,
        detail_level_code,
        visual_style_code,
    ]
]

content = [
    None, None, 7, sources_nested,  # Type 7 = Infographic
    None, None, None, None, None, None, None, None, None, None,  # 10 nulls (positions 4-13)
    infographic_options,  # Position 14
]

params = [[2], notebook_id, content]
```

**Test Results**:
```bash
✅ CLI Test: nlm infographic create 64ed8fbe-3879-43cf-ae06-635e571dbd12 --orientation landscape --detail standard --style professional -y
   Result: Artifact ID 3373415b-56e4-42b5-b0dc-9708074b7d0e created, status: in_progress
```

**Web UI Status**: ⚠️ **NEEDS UPDATE**
- Current implementation has infographic support but with wrong structure
- ✅ Has `[[2]]` prefix
- ✅ Has sources_nested
- ❌ Wrong content array length (should have 15 elements with options at position 14)
- ❌ Missing orientation parameter support
- ❌ Missing detail parameter support
- ❌ Missing style parameter support

---

### 1.4 Quiz (Type 4, variant 2)

**CLI Command**:
```bash
nlm quiz create NOTEBOOK_ID --question-count COUNT --difficulty DIFF --focus FOCUS -y
```

**CLI Parameters**:
- `--question-count`: Number of questions (default: 2)
- `--difficulty`: Difficulty level (default: 2)
- `--focus`: Optional focus prompt

**RPC Parameters** (Python CLI `studio.py:1007-1035`):
```python
quiz_options = [
    None,
    [
        2,  # Format/variant code (distinguishes from flashcards)
        None,
        focus_prompt or None,
        None, None, None, None,
        [question_count, difficulty],
    ],
]

content = [
    None, None, 4, sources_nested,  # Type 4 = Flashcards/Quiz
    None, None, None, None, None,  # 5 nulls (positions 4-8)
    quiz_options,  # Position 9
]

params = [[2], notebook_id, content]
```

**Test Results**:
```bash
✅ CLI Test: nlm quiz create 64ed8fbe-3879-43cf-ae06-635e571dbd12 -y
   Result: Artifact ID bf607aad-2fc7-4a02-b774-141a331fb762 created, status: completed
```

**Web UI Status**: ❌ **NOT IMPLEMENTED**

---

### 1.5 Flashcards (Type 4, variant 1)

**CLI Command**:
```bash
nlm flashcards create NOTEBOOK_ID --difficulty DIFF --focus FOCUS -y
```

**CLI Parameters**:
- `--difficulty`: `easy` (1), `medium` (2), `hard` (3) — default: `medium`
- `--focus`: Optional focus prompt

**RPC Parameters** (Python CLI `studio.py:931-957`):
```python
flashcard_options = [
    None,
    [
        1,  # Format/variant code (distinguishes from quiz)
        None,
        focus_prompt or None,
        None, None, None,
        [difficulty_code, count_code],
    ],
]

content = [
    None, None, 4, sources_nested,  # Type 4 = Flashcards/Quiz
    None, None, None, None, None,  # 5 nulls (positions 4-8)
    flashcard_options,  # Position 9
]

params = [[2], notebook_id, content]
```

**Test Results**:
```bash
✅ CLI Test: nlm flashcards create 64ed8fbe-3879-43cf-ae06-635e571dbd12 -y
   Result: Artifact ID bd57a5a8-1962-4e6c-b623-45e34fa171d1 created, status: completed
```

**Web UI Status**: ❌ **NOT IMPLEMENTED**

---

### 1.6 Slide Deck (Type 8)

**CLI Command**:
```bash
nlm slides create NOTEBOOK_ID --format FORMAT --length LENGTH --language LANG --focus FOCUS -y
```

**CLI Parameters**:
- `--format`: `detailed` (1), `concise` (2) — default: `detailed`
- `--length`: `short` (1), `medium` (2), `default` (3), `long` (4) — default: `default`
- `--language`: BCP-47 code (default: `en`)
- `--focus`: Optional focus topic

**RPC Parameters** (Python CLI `studio.py:743-765`):
```python
slide_deck_options = [[focus_prompt or None, language, format_code, length_code]]

content = [
    None, None, 8, sources_nested,  # Type 8 = Slide Deck
    None, None, None, None, None, None, None, None, None, None, None, None,  # 12 nulls (positions 4-15)
    slide_deck_options,  # Position 16
]

params = [[2], notebook_id, content]
```

**Test Results**:
```bash
✅ CLI Test: nlm slides create 64ed8fbe-3879-43cf-ae06-635e571dbd12 -y
   Result: Artifact ID 822c7473-8618-4584-a448-bcecbd781d76 created, status: in_progress
```

**Web UI Status**: ❌ **NOT IMPLEMENTED**

---

### 1.7 Report (Type 2)

**CLI Command**:
```bash
nlm report create NOTEBOOK_ID --format FORMAT --custom-prompt PROMPT --language LANG -y
```

**CLI Parameters**:
- `--format`: `briefing-doc`, `study-guide`, `blog-post`, `custom` — default: `briefing-doc`
- `--custom-prompt`: Required for `custom` format
- `--language`: BCP-47 code (default: `en`)

**RPC Parameters** (Python CLI `studio.py:859-884`):
```python
# Format configs define title, description, and prompt
report_options = [
    None,
    [
        config["title"],
        config["description"],
        None,
        sources_simple,
        language,
        config["prompt"],
        None,
        True,
    ],
]

content = [
    None, None, 2, sources_nested,  # Type 2 = Report
    None, None, None,
    report_options,  # Position 7
]

params = [[2], notebook_id, content]
```

**Test Results**:
```bash
✅ CLI Test: nlm report create 64ed8fbe-3879-43cf-ae06-635e571dbd12 -y
   Result: Artifact ID 6f90d1b3-2b4b-4387-868d-a1a0cfdc8a87 created, status: completed
```

**Web UI Status**: ❌ **NOT IMPLEMENTED**

---

### 1.8 Data Table (Type 9)

**CLI Command**:
```bash
nlm data-table create NOTEBOOK_ID DESCRIPTION --language LANG -y
```

**CLI Parameters**:
- `DESCRIPTION`: Required description of the data table (positional argument)
- `--language`: BCP-47 code (default: `en`)

**RPC Parameters** (Python CLI `studio.py:1085-1109`):
```python
datatable_options = [None, [description, language]]

content = [
    None, None, 9, sources_nested,  # Type 9 = Data Table
    None, None, None, None, None, None, None, None, None, None, None, None, None, None,  # 14 nulls (positions 4-17)
    datatable_options,  # Position 18
]

params = [[2], notebook_id, content]
```

**Test Results**:
```bash
✅ CLI Test: nlm data-table create 64ed8fbe-3879-43cf-ae06-635e571dbd12 "Comparison of AI and ML key concepts" -y
   Result: Artifact ID 8700dcb2-6c7e-4587-aedc-46e9847efcf7 created, status: completed
```

**Web UI Status**: ❌ **NOT IMPLEMENTED**

---

### 1.9 Mind Map

**CLI Command**:
```bash
nlm mindmap create NOTEBOOK_ID --title TITLE -y
```

**CLI Parameters**:
- `--title`: Mind map title (default: "Mind Map")

**Test Results**:
```bash
✅ CLI Test: nlm mindmap create 64ed8fbe-3879-43cf-ae06-635e571dbd12 -t "AI and ML Concepts" -y
   Result: ID 1ef5f30f-9660-442c-8c7e-037a5167b879 created
   Note: Returns as type "flashcards" in status, might be internal representation
```

**Web UI Status**: ❌ **NOT IMPLEMENTED**
**Note**: Mind map RPC format not documented in Python CLI studio.py - may use different endpoint

---

## 2. Studio Status and Management

### 2.1 Studio Status

**CLI Command**:
```bash
nlm studio status NOTEBOOK_ID
```

**Test Results**:
```bash
✅ CLI Test: nlm studio status 64ed8fbe-3879-43cf-ae06-635e571dbd12
   Returns JSON array with all artifacts and their status
```

**Web UI Status**: 🧪 **TESTING REQUIRED**

---

## 3. Notebook Operations

### 3.1 Create Notebook

**CLI Command**:
```bash
nlm notebook create TITLE -y
```

**Test Results**:
```bash
✅ CLI Test: nlm notebook create "TEST-WebUI-Audit-174843" -y
   Result: Created notebook with ID 64ed8fbe-3879-43cf-ae06-635e571dbd12
```

**Web UI Status**: 🧪 **TESTING REQUIRED**

---

### 3.2 List Notebooks

**CLI Command**:
```bash
nlm notebook list
```

**Web UI Status**: ✅ **VERIFIED**
- Implemented in `background.js:listNotebooks()`
- Used in popup UI

---

### 3.3 Get Notebook

**CLI Command**:
```bash
nlm notebook get NOTEBOOK_ID
```

**Web UI Status**: ✅ **VERIFIED**
- Implemented in `background.js:getNotebook()`
- Used for fetching sources before studio creation

---

## 4. Source Operations

### 4.1 Add URL Source

**CLI Command**:
```bash
nlm source add NOTEBOOK_ID --url URL -y
```

**Test Results**:
```bash
✅ CLI Test: nlm source add 64ed8fbe-3879-43cf-ae06-635e571dbd12 --url "https://en.wikipedia.org/wiki/Artificial_intelligence" -y
   Result: Source added successfully
✅ CLI Test: nlm source add 64ed8fbe-3879-43cf-ae06-635e571dbd12 --url "https://en.wikipedia.org/wiki/Machine_learning" -y
   Result: Source added successfully
```

**Web UI Status**: 🧪 **TESTING REQUIRED**

---

### 4.2 Add Text Source

**CLI Command**:
```bash
nlm source add NOTEBOOK_ID --text "Text content" --title "Title" -y
```

**Web UI Status**: 🧪 **TESTING REQUIRED**

---

### 4.3 Add File Source

**CLI Command**:
```bash
nlm source add NOTEBOOK_ID --file PATH -y
```

**Web UI Status**: 🧪 **TESTING REQUIRED**

---

## 5. Batch Operations

### 5.1 Batch Studio Creation

**CLI Command**:
```bash
nlm batch studio ARTIFACT_TYPE --notebooks NAMES -y
```

**CLI Parameters**:
- `ARTIFACT_TYPE`: `audio`, `video`, `report`, `quiz`, `flashcards`, `infographic`, `slides`, `data-table` — default: `audio`
- `--notebooks`: Comma-separated notebook names
- `--tags`: Comma-separated tags
- `--all`: Generate for ALL notebooks

**Web UI Status**: ❌ **BROKEN**
- This was the original bug that prompted the audit
- Implementation needs complete RPC format fix
- See Python CLI for reference implementation

---

## 6. Critical Findings

### 6.1 Root Cause of Batch Creation Failure

**Original Error**: "API Error (code 3)" from RPC R7cb6c (CREATE_STUDIO)

**Original Parameters** (from debug log):
```javascript
params: ["notebookId", [8, null, null]]  // WRONG
```

**Problems Identified**:
1. ❌ Missing `[[2]]` first parameter
2. ❌ Missing sources array (CRITICAL - cannot create without sources!)
3. ❌ Wrong content structure
4. ❌ Direct artifact type instead of full content array

**Fixed Parameters** (current `background.js:createStudio()`):
```javascript
params = [[2], notebookId, content]
content = [null, null, artifactType, sourcesNested, null, null, audioOptions]
sourcesNested = [[[id1]], [[id2]], ...]
```

**Remaining Issues**:
- ⚠️ Only audio and basic infographic implemented
- ⚠️ Missing parameter support (format, length, style, etc.)
- ⚠️ Missing 7 other artifact types

---

## 7. Implementation Priority

Based on user needs and CLI capabilities:

### High Priority (Core Functionality)
1. ✅ Audio creation (basic) - DONE but needs parameter support
2. ❌ Video creation
3. ❌ Slide deck creation
4. ❌ Report creation
5. ⚠️ Infographic creation - needs fix

### Medium Priority (Interactive Content)
6. ❌ Quiz creation
7. ❌ Flashcards creation
8. ❌ Data table creation

### Low Priority (Advanced)
9. ❌ Mind map creation
10. ❌ Batch operations

---

## 8. Testing Methodology

All tests follow this pattern:
1. Use dedicated test notebook: `64ed8fbe-3879-43cf-ae06-635e571dbd12`
2. Add test sources (Wikipedia articles on AI and ML)
3. Run Python CLI command with `-y` flag (skip confirmation)
4. Verify artifact creation and status
5. Document RPC parameters from Python CLI source code
6. Compare with Web UI implementation
7. Identify discrepancies and needed fixes

---

## 9. Next Steps

1. **Fix Audio Implementation**: Add support for format, length, language, focus parameters
2. **Fix Infographic Implementation**: Correct content array structure (15 elements with options at position 14)
3. **Implement Video Creation**: Add full video support with format, style, style-prompt parameters
4. **Implement Remaining Artifact Types**: Quiz, Flashcards, Slides, Report, Data Table
5. **Test Batch Operations**: Once individual operations are verified
6. **Update Web UI**: Add parameter controls for all supported options
7. **Integration Testing**: Test through web interface with extension

---

## 10. Reference Files

- **Python CLI**: `/Volumes/Lexar/oneweekoneproject/001cli/notebooklm-mcp-cli/src/notebooklm_tools/core/studio.py`
- **Web UI Implementation**: `/Volumes/Lexar/oneweekoneproject/001cli/notebooklm-web/chrome-extension/background.js`
- **Constants**: `/Volumes/Lexar/oneweekoneproject/001cli/notebooklm-mcp-cli/src/notebooklm_tools/core/constants.py`
- **Test Notebook**: https://notebooklm.google.com/notebook/64ed8fbe-3879-43cf-ae06-635e571dbd12

---

**Document Version**: 1.0
**Last Updated**: 2026-05-31
**Status**: Initial audit complete, fixes in progress
