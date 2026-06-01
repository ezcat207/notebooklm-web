// background.js - Chrome Extension Service Worker for Notebook and Batch

// ========== Constants ==========
const BASE_URL = "https://notebooklm.google.com";
const BATCHEXECUTE_URL = `${BASE_URL}/_/LabsTailwindUi/data/batchexecute`;

// RPC IDs (from notebooklm-mcp-cli/src/notebooklm_tools/core/base.py)
const RPC_IDS = {
  // Notebook operations
  LIST_NOTEBOOKS: "wXbhsf",
  GET_NOTEBOOK: "rLM1Ne",
  CREATE_NOTEBOOK: "CCqFvf",
  RENAME_NOTEBOOK: "s0tc2d",
  DELETE_NOTEBOOK: "WWINqb",
  GET_SUMMARY: "VfAZjd",

  // Source operations
  ADD_SOURCE: "izAoDd",      // Legacy
  ADD_SOURCE_V2: "ozz5Z",    // New version
  ADD_SOURCE_FILE: "o4cbdc",
  GET_SOURCE: "hizoJc",
  DELETE_SOURCE: "tGMBJ",
  RENAME_SOURCE: "b7Wfje",
  CHECK_FRESHNESS: "yR9Yof",
  SYNC_DRIVE: "FLmJqe",
  GET_SOURCE_GUIDE: "tr032e",

  // Studio operations
  CREATE_STUDIO: "R7cb6c",
  POLL_STUDIO: "gArtLc",
  DELETE_STUDIO: "V5N4be",
  RENAME_ARTIFACT: "rc3d8d",
  GET_INTERACTIVE_HTML: "v9rmvd",
  REVISE_SLIDE_DECK: "KmcKPe",

  // Research operations
  START_FAST_RESEARCH: "Ljjv0c",
  START_DEEP_RESEARCH: "QA9ei",
  POLL_RESEARCH: "e3bVqc",
  IMPORT_RESEARCH: "LBwxtb",

  // Chat operations
  GET_CONVERSATIONS: "hPTbtc",
  DELETE_CHAT_HISTORY: "J7Gthc",
  CHAT_CONFIGURE: "ZwVcOc",

  // Mind map operations
  GENERATE_MIND_MAP: "yyryJe",
  SAVE_MIND_MAP: "CYK0Xb",
  LIST_MIND_MAPS: "cFji9",
  DELETE_MIND_MAP: "AH0mwd",

  // Note operations (share RPC IDs with mind maps)
  CREATE_NOTE: "CYK0Xb",
  GET_NOTES: "cFji9",
  UPDATE_NOTE: "cYAfTb",
  DELETE_NOTE: "AH0mwd",

  // Label operations
  LABEL_MANAGE: "agX4Bc",
  LABEL_MUTATE: "le8sX",
  LABEL_DELETE: "GyzE7e",

  // Sharing operations
  SHARE_NOTEBOOK: "QDyure",
  GET_SHARE_STATUS: "JFMDGd",

  // Export operations
  EXPORT_ARTIFACT: "Krh3pd",
};

// Studio artifact types
const STUDIO_TYPES = {
  AUDIO: 1,
  VIDEO: 2,
  REPORT: 3,
  QUIZ: 4,
  FLASHCARDS: 5,
  MIND_MAP: 6,
  SLIDE_DECK: 7,
  INFOGRAPHIC: 8,
  DATA_TABLE: 9,
};

// Audio formats
const AUDIO_FORMATS = {
  DEEP_DIVE: 1,
  BRIEF: 2,
  CRITIQUE: 3,
  DEBATE: 4,
};

// Audio lengths
const AUDIO_LENGTHS = {
  SHORT: 1,
  DEFAULT: 2,
  LONG: 3,
};

// ========== Auth State ==========
let authState = {
  csrfToken: "",
  sessionId: "",
  buildLabel: "boq_labs-tailwind-frontend_20260108.06_p0",
  reqidCounter: Math.floor(Math.random() * 900000) + 100000,
};

// ========== Debug Logging System ==========
const DEBUG_LOGS = [];
const MAX_LOGS = 1000;

function debugLog(level, category, message, data = null) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    data: data ? JSON.parse(JSON.stringify(data)) : null,
  };

  DEBUG_LOGS.push(logEntry);

  // Keep only last MAX_LOGS entries
  if (DEBUG_LOGS.length > MAX_LOGS) {
    DEBUG_LOGS.shift();
  }

  // Also log to console
  const prefix = `[${level}][${category}]`;
  if (level === "ERROR") {
    console.error(prefix, message, data);
  } else if (level === "WARN") {
    console.warn(prefix, message, data);
  } else {
    console.log(prefix, message, data);
  }
}

function exportLogs() {
  const logsJson = JSON.stringify(DEBUG_LOGS, null, 2);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  // Convert to base64 data URL (works in Service Worker)
  const dataUrl = 'data:application/json;base64,' + btoa(unescape(encodeURIComponent(logsJson)));

  chrome.downloads.download({
    url: dataUrl,
    filename: `notebooklm-debug-${timestamp}.json`,
    saveAs: true,
  }, (downloadId) => {
    if (chrome.runtime.lastError) {
      debugLog("ERROR", "Debug", "Failed to download logs", chrome.runtime.lastError.message);
    } else {
      debugLog("INFO", "Debug", `Logs exported successfully, download ID: ${downloadId}`);
    }
  });
}

// ========== Utility Functions ==========

/**
 * Get NotebookLM cookie by name
 */
async function getCookie(name) {
  return new Promise((resolve, reject) => {
    chrome.cookies.get(
      {
        url: BASE_URL,
        name: name,
      },
      (cookie) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (cookie) {
          resolve(cookie.value);
        } else {
          reject(new Error(`Cookie ${name} not found`));
        }
      }
    );
  });
}

/**
 * Get all NotebookLM auth cookies
 */
async function getAuthCookies() {
  debugLog("INFO", "Auth", "Getting auth cookies...");
  try {
    const cookies = {};
    const cookieNames = ["SAPSID", "__Secure-1PSID", "__Secure-3PSID", "HSID", "SSID", "SID"];

    for (const name of cookieNames) {
      try {
        const value = await getCookie(name);
        if (value) {
          cookies[name] = value;
          debugLog("INFO", "Auth", `Cookie ${name}: ${value.substring(0, 10)}...`);
        }
      } catch (e) {
        debugLog("WARN", "Auth", `Cookie ${name} not found`, e.message);
      }
    }

    if (Object.keys(cookies).length === 0) {
      debugLog("ERROR", "Auth", "No authentication cookies found");
      throw new Error("No authentication cookies found");
    }

    debugLog("INFO", "Auth", `Found ${Object.keys(cookies).length} cookies`, Object.keys(cookies));
    return cookies;
  } catch (error) {
    debugLog("ERROR", "Auth", "Failed to get auth cookies", error.message);
    throw error;
  }
}

/**
 * Refresh CSRF token and session ID from NotebookLM page
 */
async function refreshAuthTokens() {
  debugLog("INFO", "Auth", "Refreshing auth tokens from NotebookLM page...");
  try {
    const response = await fetch(BASE_URL, {
      credentials: "include",
      headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
    });

    debugLog("INFO", "Auth", `Fetch response status: ${response.status}`);

    const html = await response.text();
    debugLog("INFO", "Auth", `HTML length: ${html.length} chars`);

    // Extract CSRF token (SNlM0e)
    const csrfMatch = html.match(/"SNlM0e":"([^"]+)"/);
    if (csrfMatch) {
      authState.csrfToken = csrfMatch[1];
      debugLog("INFO", "Auth", `CSRF Token extracted: ${csrfMatch[1].substring(0, 20)}...`);
    } else {
      debugLog("ERROR", "Auth", "CSRF Token NOT found in HTML");
    }

    // Extract session ID (FdrFJe)
    const sessionMatch = html.match(/"FdrFJe":"([^"]+)"/);
    if (sessionMatch) {
      authState.sessionId = sessionMatch[1];
      debugLog("INFO", "Auth", `Session ID extracted: ${sessionMatch[1].substring(0, 20)}...`);
    } else {
      debugLog("ERROR", "Auth", "Session ID NOT found in HTML");
    }

    // Extract build label (cfb2h)
    const buildMatch = html.match(/"cfb2h":"([^"]+)"/);
    if (buildMatch) {
      authState.buildLabel = buildMatch[1];
      debugLog("INFO", "Auth", `Build label extracted: ${buildMatch[1]}`);
    } else {
      debugLog("WARN", "Auth", "Build label NOT found in HTML, using default");
    }

    const tokenStatus = {
      csrfToken: authState.csrfToken ? "✓" : "✗",
      sessionId: authState.sessionId ? "✓" : "✗",
      buildLabel: authState.buildLabel ? "✓" : "✗",
    };

    debugLog("INFO", "Auth", "Auth tokens refreshed", tokenStatus);

    return true;
  } catch (error) {
    debugLog("ERROR", "Auth", "Failed to refresh auth tokens", error.message);
    return false;
  }
}

/**
 * Build RPC request body
 */
function buildRequestBody(rpcId, params) {
  const wrappedParams = JSON.stringify(params);
  // CRITICAL: Python CLI uses TRIPLE nested array [[[...]]]
  const fReq = JSON.stringify([[[rpcId, wrappedParams, null, "generic"]]]);

  // Build form data with CSRF token
  const bodyParts = [`f.req=${encodeURIComponent(fReq)}`];

  // Add CSRF token if available
  if (authState.csrfToken) {
    bodyParts.push(`at=${encodeURIComponent(authState.csrfToken)}`);
    debugLog("INFO", "RPC", `Request body built with CSRF token`);
  } else {
    debugLog("WARN", "RPC", `Request body built WITHOUT CSRF token!`);
  }

  // Python CLI adds trailing &
  const body = bodyParts.join("&") + "&";
  debugLog("INFO", "RPC", `Body length: ${body.length}`, {
    rpcId,
    params,
    hasCSRF: !!authState.csrfToken,
    trailingAmpersand: true,
  });

  return body;
}

/**
 * Build RPC URL with parameters
 */
function buildRpcUrl(rpcId, path = "/") {
  const params = new URLSearchParams({
    rpcids: rpcId,
    "source-path": path,
    "f.sid": authState.sessionId,
    bl: authState.buildLabel,
    hl: "en",
    _reqid: String(authState.reqidCounter++),
    rt: "c",
  });

  return `${BATCHEXECUTE_URL}?${params.toString()}`;
}

/**
 * Parse batchexecute response
 */
function parseRpcResponse(responseText) {
  // Remove anti-XSSI prefix
  if (responseText.startsWith(")]}'")) {
    responseText = responseText.substring(4);
  }

  const lines = responseText.trim().split("\n");
  const results = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line) {
      i++;
      continue;
    }

    // Check if line is a byte count
    try {
      parseInt(line);
      // Next line should be JSON
      i++;
      if (i < lines.length) {
        try {
          const data = JSON.parse(lines[i]);
          results.push(data);
        } catch (e) {
          console.warn("Failed to parse JSON:", e);
        }
      }
      i++;
    } catch (e) {
      // Not a byte count, try parsing as JSON
      try {
        const data = JSON.parse(line);
        results.push(data);
      } catch (e) {
        console.warn("Failed to parse line:", e);
      }
      i++;
    }
  }

  return results;
}

/**
 * Extract RPC result from parsed response
 */
function extractRpcResult(parsedResponse, rpcId) {
  for (const chunk of parsedResponse) {
    if (Array.isArray(chunk)) {
      for (const item of chunk) {
        if (Array.isArray(item) && item.length >= 3) {
          if (item[0] === "wrb.fr" && item[1] === rpcId) {
            // Check for errors in item[5]
            if (item.length > 5 && Array.isArray(item[5]) && item[5].length > 0) {
              const errorCode = item[5][0];
              if (errorCode === 16) {
                throw new Error("Authentication expired (Error 16)");
              }
              throw new Error(`API Error (code ${errorCode})`);
            }

            // Extract result from item[2]
            const resultStr = item[2];
            if (typeof resultStr === "string") {
              try {
                return JSON.parse(resultStr);
              } catch (e) {
                return resultStr;
              }
            }
            return resultStr;
          }
        }
      }
    }
  }
  return null;
}

/**
 * Call NotebookLM RPC API
 */
async function callRpc(rpcId, params, path = "/") {
  debugLog("INFO", "RPC", `=== Starting RPC Call: ${rpcId} ===`);
  try {
    // Ensure we have auth cookies
    debugLog("INFO", "RPC", "Step 1: Getting auth cookies...");
    const cookies = await getAuthCookies();
    debugLog("INFO", "RPC", "Step 1: ✓ Got auth cookies");

    // Ensure we have CSRF token and session ID
    debugLog("INFO", "RPC", "Step 2: Checking auth tokens...");
    if (!authState.csrfToken || !authState.sessionId) {
      debugLog("WARN", "RPC", "Missing auth tokens, refreshing...");
      await refreshAuthTokens();

      if (!authState.csrfToken || !authState.sessionId) {
        debugLog("ERROR", "RPC", "Failed to get auth tokens after refresh");
        throw new Error("Failed to get auth tokens. Please refresh the NotebookLM page.");
      }
    }
    debugLog("INFO", "RPC", "Step 2: ✓ Auth tokens validated", {
      hasCSRF: !!authState.csrfToken,
      hasSession: !!authState.sessionId,
      csrfLength: authState.csrfToken?.length,
      sessionLength: authState.sessionId?.length,
    });

    debugLog("INFO", "RPC", "Step 3: Building request body...");
    const body = buildRequestBody(rpcId, params);
    debugLog("INFO", "RPC", "Step 3: ✓ Request body built");

    debugLog("INFO", "RPC", "Step 4: Building request URL...");
    const url = buildRpcUrl(rpcId, path);
    debugLog("INFO", "RPC", "Step 4: ✓ Request URL built", { url });

    const requestInfo = {
      rpcId,
      path,
      url,
      hasCSRF: !!authState.csrfToken,
      hasSession: !!authState.sessionId,
      bodyLength: body.length,
    };
    debugLog("INFO", "RPC", "Step 5: Sending fetch request...", requestInfo);

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      "X-Same-Domain": "1",
      "X-Goog-AuthUser": "0",
      "Origin": BASE_URL,
      "Referer": `${BASE_URL}/`,
    };

    // Add CSRF token as header (Python CLI does this)
    if (authState.csrfToken) {
      headers["X-Goog-Csrf-Token"] = authState.csrfToken;
    }

    debugLog("INFO", "RPC", "Request headers", headers);

    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body,
      credentials: "include",
    });

    debugLog("INFO", "RPC", `Step 5: ✓ Got response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      debugLog("ERROR", "RPC", `Response not OK: ${response.status}`, {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText.substring(0, 500),
      });
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    debugLog("INFO", "RPC", "Step 6: Parsing response...");
    const responseText = await response.text();
    debugLog("INFO", "RPC", "Step 6: Response text length:", responseText.length);

    const parsed = parseRpcResponse(responseText);
    debugLog("INFO", "RPC", "Step 6: ✓ Parsed response", { chunks: parsed.length });

    const result = extractRpcResult(parsed, rpcId);
    debugLog("INFO", "RPC", "Step 6: ✓ Extracted result", { result: result ? "exists" : "null" });

    debugLog("INFO", "RPC", `=== RPC Call Complete: ${rpcId} ===`);
    return result;
  } catch (error) {
    debugLog("ERROR", "RPC", `=== RPC Call FAILED: ${rpcId} ===`, {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
}

// ========== Core API Functions ==========

/**
 * List all notebooks
 */
async function listNotebooks() {
  debugLog("INFO", "API", "listNotebooks called");
  const params = [null, 1, null, [2]];
  debugLog("INFO", "API", "listNotebooks params", params);

  const result = await callRpc(RPC_IDS.LIST_NOTEBOOKS, params);
  debugLog("INFO", "API", "listNotebooks RPC result", { result });

  const notebooks = [];
  if (result && Array.isArray(result)) {
    const notebookList = Array.isArray(result[0]) ? result[0] : result;
    debugLog("INFO", "API", `Processing ${notebookList.length} notebooks`);

    for (const nbData of notebookList) {
      if (Array.isArray(nbData) && nbData.length >= 3) {
        const title = nbData[0] || "Untitled";
        const sources = nbData[1] || [];
        const notebookId = nbData[2];

        if (notebookId) {
          notebooks.push({
            id: notebookId,
            title: title,
            source_count: Array.isArray(sources) ? sources.length : 0,
          });
        }
      }
    }
  }

  debugLog("INFO", "API", `listNotebooks returning ${notebooks.length} notebooks`);
  return notebooks;
}

/**
 * Create a new notebook
 */
async function createNotebook(title, description = "") {
  const params = [title, description || null];
  const result = await callRpc(RPC_IDS.CREATE_NOTEBOOK, params);

  // Result should contain notebook ID
  if (result && Array.isArray(result) && result.length > 0) {
    return {
      id: result[0],
      title: title,
    };
  }

  throw new Error("Failed to create notebook");
}

/**
 * Add URL source to notebook
 */
async function addUrlSource(notebookId, url) {
  const params = [
    notebookId,
    [
      [url, 1], // [url, source_type]
      null,
      null,
    ],
  ];

  const result = await callRpc(RPC_IDS.ADD_SOURCE, params, `/notebook/${notebookId}`);

  if (result && Array.isArray(result) && result.length > 0) {
    return {
      success: true,
      sourceId: result[0],
    };
  }

  throw new Error("Failed to add source");
}

/**
 * Batch import URLs
 */
async function batchImport(notebookId, urls, progressCallback) {
  const results = [];
  const total = urls.length;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      const source = await addUrlSource(notebookId, url);
      results.push({ url, success: true, sourceId: source.sourceId });

      if (progressCallback) {
        progressCallback({
          current: i + 1,
          total,
          percentage: Math.round(((i + 1) / total) * 100),
          status: "processing",
          message: `已导入 ${i + 1}/${total}: ${url}`,
        });
      }
    } catch (error) {
      console.error(`Failed to import ${url}:`, error);
      results.push({ url, success: false, error: error.message });
    }

    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return {
    success: true,
    imported_count: results.filter(r => r.success).length,
    failed_count: results.filter(r => !r.success).length,
    results,
  };
}

/**
 * Add text source to notebook
 */
async function addTextSource(notebookId, text, title = "") {
  const params = [
    notebookId,
    [
      [text, 2],  // [text, source_type=2]
      title || null,
      null,
    ],
  ];

  const result = await callRpc(RPC_IDS.ADD_SOURCE, params, `/notebook/${notebookId}`);

  if (result && Array.isArray(result) && result.length > 0) {
    return {
      success: true,
      sourceId: result[0],
    };
  }

  throw new Error("Failed to add text source");
}

/**
 * Delete source from notebook
 */
async function deleteSource(notebookId, sourceId) {
  const params = [notebookId, sourceId];
  await callRpc(RPC_IDS.DELETE_SOURCE, params, `/notebook/${notebookId}`);
  return { success: true };
}

/**
 * Get notebook summary
 */
async function getNotebookSummary(notebookId) {
  const result = await callRpc(RPC_IDS.GET_SUMMARY, [notebookId, [2]], `/notebook/${notebookId}`);

  let summary = "";
  let suggestedTopics = [];

  if (result && Array.isArray(result)) {
    // Summary at result[0][0]
    if (result.length > 0 && Array.isArray(result[0]) && result[0].length > 0) {
      summary = result[0][0];
    }

    // Suggested topics at result[1][0]
    if (result.length > 1 && result[1] && Array.isArray(result[1][0])) {
      suggestedTopics = result[1][0];
    }
  }

  return {
    summary,
    suggestedTopics,
  };
}

/**
 * Get notebook details including sources
 */
async function getNotebook(notebookId) {
  const params = [notebookId, [2]];
  const result = await callRpc(RPC_IDS.GET_NOTEBOOK, params, `/notebook/${notebookId}`);

  if (result && Array.isArray(result) && result.length > 1) {
    return {
      title: result[0] || "Untitled",
      sources: result[1] || [],
    };
  }

  return { title: "Untitled", sources: [] };
}

/**
 * Create Studio content (Audio, Video, Infographic, etc.)
 *
 * CRITICAL: Matches Python CLI format exactly:
 * params = [[2], notebook_id, content]
 * content = [None, None, type, sources_nested, None, None, options, ...]
 */
async function createStudio(notebookId, options = {}) {
  const {
    artifactType = STUDIO_TYPES.AUDIO,
    format = AUDIO_FORMATS.DEEP_DIVE,
    length = AUDIO_LENGTHS.LONG,
  } = options;

  // Get notebook sources
  const notebook = await getNotebook(notebookId);

  if (!notebook.sources || notebook.sources.length === 0) {
    throw new Error("Notebook has no sources. Add sources before creating studio content.");
  }

  // Extract source IDs and build nested format: [[[id1]], [[id2]], ...]
  const sourceIds = notebook.sources.map(s => Array.isArray(s) && s.length > 2 ? s[2] : null).filter(Boolean);
  const sourcesNested = sourceIds.map(id => [[id]]);

  debugLog("INFO", "Studio", `Creating studio content with ${sourceIds.length} sources`, {
    artifactType,
    sourceIds: sourceIds.length
  });

  // Build content array based on artifact type
  let content;

  if (artifactType === STUDIO_TYPES.AUDIO) {
    // Audio format: [None, None, type, sources, None, None, audio_options]
    const audioOptions = [
      null,  // focus_prompt
      [null, length, null, sourcesNested.map(s => s[0]), "en", null, format],  // format options
    ];

    content = [null, null, artifactType, sourcesNested, null, null, audioOptions];
  } else if (artifactType === STUDIO_TYPES.INFOGRAPHIC) {
    // Infographic format: [None, None, type, sources, ...10 nulls..., infographic_options]
    const infographicOptions = [[null, "en", null, 1, 2, 1]];  // Default: landscape, standard, auto-style

    content = [
      null, null, artifactType, sourcesNested,
      null, null, null, null, null, null, null, null, null, null,  // 10 nulls
      infographicOptions
    ];
  } else {
    // Generic format for other types (Video, Quiz, etc.)
    // [None, None, type, sources, None, None, None]
    content = [null, null, artifactType, sourcesNested, null, null, null];
  }

  // Python CLI format: [[2], notebook_id, content]
  const params = [[2], notebookId, content];

  debugLog("INFO", "Studio", "CREATE_STUDIO params", { params });

  const result = await callRpc(RPC_IDS.CREATE_STUDIO, params, `/notebook/${notebookId}`);

  if (result && Array.isArray(result) && result.length > 0) {
    const artifactId = result[0];
    debugLog("INFO", "Studio", `Studio content created: ${artifactId}`);

    return {
      success: true,
      artifactId: artifactId,
    };
  }

  throw new Error("Failed to create studio content");
}

/**
 * Poll Studio status
 */
async function pollStudioStatus(notebookId, artifactId) {
  const params = [notebookId, artifactId];
  const result = await callRpc(RPC_IDS.POLL_STUDIO, params, `/notebook/${notebookId}`);

  if (result && Array.isArray(result)) {
    // Result structure: [status, progress, ...]
    // status: 1=processing, 2=completed, 3=failed
    const status = result[0];
    const progress = result[1] || 0;

    return {
      status: status === 2 ? "completed" : status === 3 ? "failed" : "processing",
      progress: Math.round(progress * 100),
    };
  }

  return {
    status: "unknown",
    progress: 0,
  };
}

/**
 * Wait for Studio content to complete
 */
async function waitForStudioCompletion(notebookId, artifactId, maxAttempts = 60, interval = 5000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await pollStudioStatus(notebookId, artifactId);

    if (status.status === "completed") {
      return { success: true, artifactId };
    }

    if (status.status === "failed") {
      throw new Error("Studio generation failed");
    }

    // Send progress update
    chrome.runtime.sendMessage({
      type: "PROGRESS_UPDATE",
      data: {
        action: "STUDIO_CREATE",
        current: attempt,
        total: maxAttempts,
        percentage: status.progress,
        status: "processing",
        message: `生成中 (${status.progress}%)...`,
      },
    });

    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error("Studio generation timeout");
}

/**
 * Batch create studio content for multiple notebooks
 */
async function batchCreateStudio(notebookIds, options = {}, progressCallback) {
  const results = [];
  const total = notebookIds.length;

  for (let i = 0; i < notebookIds.length; i++) {
    const notebookId = notebookIds[i];
    try {
      // Create studio content
      const { artifactId } = await createStudio(notebookId, options);

      // Wait for completion
      await waitForStudioCompletion(notebookId, artifactId);

      results.push({ notebookId, artifactId, success: true });

      if (progressCallback) {
        progressCallback({
          current: i + 1,
          total,
          percentage: Math.round(((i + 1) / total) * 100),
          status: "processing",
          message: `已生成 ${i + 1}/${total}`,
        });
      }
    } catch (error) {
      console.error(`Failed to create studio for ${notebookId}:`, error);
      results.push({ notebookId, success: false, error: error.message });
    }
  }

  return {
    success: true,
    completed_count: results.filter(r => r.success).length,
    failed_count: results.filter(r => !r.success).length,
    results,
  };
}

/**
 * Download studio artifact
 */
async function downloadArtifact(notebookId, artifactId, filename) {
  // Construct download URL
  const downloadUrl = `${BASE_URL}/_/LabsTailwindUi/data/download?notebook_id=${notebookId}&artifact_id=${artifactId}`;

  try {
    const response = await fetch(downloadUrl, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    return new Promise((resolve, reject) => {
      chrome.downloads.download(
        {
          url: blobUrl,
          filename: filename || `artifact_${artifactId}.mp3`,
          saveAs: false,
        },
        (downloadId) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve({ success: true, downloadId });
          }
        }
      );
    });
  } catch (error) {
    console.error("Download failed:", error);
    throw error;
  }
}

/**
 * Delete notebook
 */
async function deleteNotebook(notebookId) {
  const params = [notebookId];
  await callRpc(RPC_IDS.DELETE_NOTEBOOK, params, `/notebook/${notebookId}`);
  return { success: true };
}

/**
 * Rename notebook
 */
async function renameNotebook(notebookId, newTitle) {
  const params = [notebookId, newTitle];
  await callRpc(RPC_IDS.RENAME_NOTEBOOK, params, `/notebook/${notebookId}`);
  return { success: true };
}

/**
 * Get share status
 */
async function getShareStatus(notebookId) {
  const params = [notebookId];
  const result = await callRpc(RPC_IDS.GET_SHARE_STATUS, params, `/notebook/${notebookId}`);

  if (result && Array.isArray(result)) {
    return {
      isPublic: result[0] || false,
      publicUrl: result[1] || "",
      collaborators: result[2] || [],
    };
  }

  return {
    isPublic: false,
    publicUrl: "",
    collaborators: [],
  };
}

/**
 * Set public sharing
 */
async function setPublicSharing(notebookId, enabled) {
  const params = [notebookId, enabled ? 2 : 1]; // 2=public, 1=restricted
  const result = await callRpc(RPC_IDS.SHARE_NOTEBOOK, params, `/notebook/${notebookId}`);

  if (result && Array.isArray(result) && result.length > 1) {
    return {
      success: true,
      publicUrl: result[1] || "",
    };
  }

  return { success: true };
}

// ========== Message Handlers ==========

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    try {
      switch (message.action) {
        // ========== Auth ==========
        case "CHECK_AUTH": {
          try {
            const cookies = await getAuthCookies();
            await refreshAuthTokens();
            sendResponse({
              success: true,
              data: {
                authenticated: true,
                cookies: Object.keys(cookies),
              },
            });
          } catch (error) {
            sendResponse({
              success: true,
              data: { authenticated: false },
            });
          }
          break;
        }

        // ========== Notebook Operations ==========
        case "LIST_NOTEBOOKS": {
          const notebooks = await listNotebooks();
          sendResponse({ success: true, data: { notebooks } });
          break;
        }

        case "CREATE_NOTEBOOK": {
          const notebook = await createNotebook(
            message.data.title,
            message.data.description
          );
          sendResponse({ success: true, data: { notebook } });
          break;
        }

        case "DELETE_NOTEBOOK": {
          await deleteNotebook(message.data.notebookId);
          sendResponse({ success: true });
          break;
        }

        case "RENAME_NOTEBOOK": {
          await renameNotebook(message.data.notebookId, message.data.newTitle);
          sendResponse({ success: true });
          break;
        }

        case "GET_SUMMARY": {
          const summary = await getNotebookSummary(message.data.notebookId);
          sendResponse({ success: true, data: summary });
          break;
        }

        // ========== Source Operations ==========
        case "ADD_URL_SOURCE": {
          const result = await addUrlSource(
            message.data.notebookId,
            message.data.url
          );
          sendResponse({ success: true, data: result });
          break;
        }

        case "ADD_TEXT_SOURCE": {
          const result = await addTextSource(
            message.data.notebookId,
            message.data.text,
            message.data.title
          );
          sendResponse({ success: true, data: result });
          break;
        }

        case "DELETE_SOURCE": {
          await deleteSource(message.data.notebookId, message.data.sourceId);
          sendResponse({ success: true });
          break;
        }

        case "BATCH_IMPORT": {
          const result = await batchImport(
            message.data.notebookId,
            message.data.urls,
            (progress) => {
              chrome.runtime.sendMessage({
                type: "PROGRESS_UPDATE",
                data: {
                  action: "BATCH_IMPORT",
                  ...progress,
                },
              });
            }
          );
          sendResponse(result);
          break;
        }

        // ========== Studio Operations ==========
        case "CREATE_STUDIO": {
          const result = await createStudio(
            message.data.notebookId,
            message.data.options
          );
          sendResponse({ success: true, data: result });
          break;
        }

        case "POLL_STUDIO": {
          const status = await pollStudioStatus(
            message.data.notebookId,
            message.data.artifactId
          );
          sendResponse({ success: true, data: status });
          break;
        }

        case "WAIT_STUDIO": {
          const result = await waitForStudioCompletion(
            message.data.notebookId,
            message.data.artifactId
          );
          sendResponse({ success: true, data: result });
          break;
        }

        case "BATCH_CREATE_STUDIO": {
          const result = await batchCreateStudio(
            message.data.notebookIds,
            message.data.options,
            (progress) => {
              chrome.runtime.sendMessage({
                type: "PROGRESS_UPDATE",
                data: {
                  action: "BATCH_CREATE_STUDIO",
                  ...progress,
                },
              });
            }
          );
          sendResponse({ success: true, data: result });
          break;
        }

        case "DOWNLOAD_ARTIFACT": {
          const result = await downloadArtifact(
            message.data.notebookId,
            message.data.artifactId,
            message.data.filename
          );
          sendResponse({ success: true, data: result });
          break;
        }

        // ========== Sharing Operations ==========
        case "GET_SHARE_STATUS": {
          const status = await getShareStatus(message.data.notebookId);
          sendResponse({ success: true, data: status });
          break;
        }

        case "SET_PUBLIC_SHARING": {
          const result = await setPublicSharing(
            message.data.notebookId,
            message.data.enabled
          );
          sendResponse({ success: true, data: result });
          break;
        }

        // ========== Debug Operations ==========
        case "EXPORT_LOGS": {
          exportLogs();
          sendResponse({ success: true });
          break;
        }

        case "GET_LOGS": {
          sendResponse({ success: true, data: { logs: DEBUG_LOGS } });
          break;
        }

        case "CLEAR_LOGS": {
          DEBUG_LOGS.length = 0;
          sendResponse({ success: true });
          break;
        }

        default:
          sendResponse({
            success: false,
            error: `Unknown action: ${message.action}`,
          });
      }
    } catch (error) {
      console.error("Message handler error:", error);
      sendResponse({
        success: false,
        error: error.message || "Unknown error",
      });
    }
  })();

  return true; // Keep message channel open for async response
});

// ========== Installation Handler ==========

chrome.runtime.onInstalled.addListener(async () => {
  console.log("Notebook and Batch extension installed");

  // Refresh auth tokens on install
  try {
    await refreshAuthTokens();
  } catch (error) {
    console.error("Failed to initialize auth tokens:", error);
  }
});

console.log("Background script loaded");
