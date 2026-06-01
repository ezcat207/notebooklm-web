// popup.js - UI logic for the extension popup

const statusDiv = document.getElementById("status");
const checkAuthBtn = document.getElementById("checkAuth");
const listNotebooksBtn = document.getElementById("listNotebooks");
const openWebAppBtn = document.getElementById("openWebApp");
const exportLogsBtn = document.getElementById("exportLogs");
const copyLogsBtn = document.getElementById("copyLogs");
const notebookCountDiv = document.getElementById("notebookCount");
const loginLink = document.getElementById("loginLink");

let isAuthenticated = false;

// Check authentication status on popup open
checkAuthStatus();

// Event listeners
checkAuthBtn.addEventListener("click", checkAuthStatus);
listNotebooksBtn.addEventListener("click", listNotebooks);
openWebAppBtn.addEventListener("click", openWebApp);
exportLogsBtn.addEventListener("click", exportLogs);
copyLogsBtn.addEventListener("click", copyLogs);
loginLink.addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: "https://notebooklm.google.com" });
  window.close();
});

/**
 * Check authentication status
 */
async function checkAuthStatus() {
  try {
    statusDiv.className = "status loading";
    statusDiv.textContent = "正在检查认证状态...";
    checkAuthBtn.disabled = true;
    listNotebooksBtn.disabled = true;

    const response = await sendMessage({ action: "CHECK_AUTH" });

    if (response.success && response.data.authenticated) {
      isAuthenticated = true;
      statusDiv.className = "status authenticated";
      statusDiv.textContent = `✓ 已认证 (Cookies: ${response.data.cookies.join(", ")})`;
      checkAuthBtn.disabled = false;
      listNotebooksBtn.disabled = false;
      loginLink.style.display = "none";
    } else {
      isAuthenticated = false;
      statusDiv.className = "status not-authenticated";
      statusDiv.textContent = "✗ 未认证，请先登录 NotebookLM";
      checkAuthBtn.disabled = false;
      listNotebooksBtn.disabled = true;
      loginLink.style.display = "block";
    }
  } catch (error) {
    console.error("Failed to check auth:", error);
    statusDiv.className = "status not-authenticated";
    statusDiv.textContent = `✗ 检查失败: ${error.message}`;
    checkAuthBtn.disabled = false;
    listNotebooksBtn.disabled = true;
    loginLink.style.display = "block";
  }
}

/**
 * List notebooks
 */
async function listNotebooks() {
  try {
    listNotebooksBtn.disabled = true;
    listNotebooksBtn.textContent = "加载中...";

    const response = await sendMessage({ action: "LIST_NOTEBOOKS" });

    if (response.success) {
      const notebooks = response.data.notebooks;
      notebookCountDiv.style.display = "block";
      notebookCountDiv.textContent = `找到 ${notebooks.length} 个笔记本`;
      console.log("Notebooks:", notebooks);

      // Show first few notebooks
      if (notebooks.length > 0) {
        const summary = notebooks.slice(0, 3).map(nb => `• ${nb.title} (${nb.source_count} 来源)`).join("\n");
        alert(`笔记本列表:\n\n${summary}\n\n查看完整列表请打开开发者工具 Console`);
      }
    } else {
      alert(`获取笔记本列表失败: ${response.error}`);
    }
  } catch (error) {
    console.error("Failed to list notebooks:", error);
    alert(`获取笔记本列表失败: ${error.message}`);
  } finally {
    listNotebooksBtn.disabled = false;
    listNotebooksBtn.textContent = "列出笔记本";
  }
}

/**
 * Open web app
 */
function openWebApp() {
  // TODO: Replace with actual web app URL
  chrome.tabs.create({ url: "http://localhost:3000" });
  window.close();
}

/**
 * Export debug logs
 */
async function exportLogs() {
  try {
    exportLogsBtn.disabled = true;
    exportLogsBtn.textContent = "正在导出...";

    const response = await sendMessage({ action: "EXPORT_LOGS" });

    if (response.success) {
      exportLogsBtn.textContent = "✓ 导出成功";
      setTimeout(() => {
        exportLogsBtn.textContent = "导出调试日志";
        exportLogsBtn.disabled = false;
      }, 2000);
    } else {
      alert(`导出失败: ${response.error}`);
      exportLogsBtn.disabled = false;
      exportLogsBtn.textContent = "导出调试日志";
    }
  } catch (error) {
    console.error("Failed to export logs:", error);
    alert(`导出失败: ${error.message}`);
    exportLogsBtn.disabled = false;
    exportLogsBtn.textContent = "导出调试日志";
  }
}

/**
 * Copy debug logs to clipboard
 */
async function copyLogs() {
  try {
    copyLogsBtn.disabled = true;
    copyLogsBtn.textContent = "正在获取...";

    const response = await sendMessage({ action: "GET_LOGS" });

    if (response.success) {
      const logsJson = JSON.stringify(response.data.logs, null, 2);

      // Copy to clipboard
      await navigator.clipboard.writeText(logsJson);

      copyLogsBtn.textContent = "✓ 已复制到剪贴板";
      alert(`成功复制 ${response.data.logs.length} 条日志到剪贴板！\n\n请粘贴到文本编辑器并发送给开发者。`);

      setTimeout(() => {
        copyLogsBtn.textContent = "复制日志到剪贴板";
        copyLogsBtn.disabled = false;
      }, 2000);
    } else {
      alert(`获取日志失败: ${response.error}`);
      copyLogsBtn.disabled = false;
      copyLogsBtn.textContent = "复制日志到剪贴板";
    }
  } catch (error) {
    console.error("Failed to copy logs:", error);
    alert(`复制失败: ${error.message}`);
    copyLogsBtn.disabled = false;
    copyLogsBtn.textContent = "复制日志到剪贴板";
  }
}

/**
 * Send message to background script
 */
function sendMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}
