// Content script - Bridge between web page and extension background
console.log('[NotebookLM Extension] Content script loaded');

// Listen for messages from the web page
window.addEventListener("message", (event) => {
  // Only accept messages from same origin
  if (event.source !== window) return;

  // Handle PING messages - respond immediately
  if (event.data.type === "NOTEBOOKLM_PING") {
    console.log('[NotebookLM Extension] Received ping, sending pong');
    window.postMessage({
      type: "NOTEBOOKLM_EXTENSION_PONG",
      pingId: event.data.pingId,
    }, "*");
    return;
  }

  // Handle regular messages
  if (event.data.type !== "NOTEBOOKLM_WEB_TO_EXTENSION") return;

  console.log('[NotebookLM Extension] Message from web page:', event.data);

  const { action, data, messageId } = event.data.payload;

  // Forward to background script
  chrome.runtime.sendMessage(
    { action, data },
    (response) => {
      console.log('[NotebookLM Extension] Response from background:', response);

      // Send response back to web page
      window.postMessage({
        type: "NOTEBOOKLM_EXTENSION_TO_WEB",
        payload: {
          messageId,
          response,
        },
      }, "*");
    }
  );
});

// Listen for messages from background script (e.g., progress updates)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Forward progress updates to web page
  if (message.type === "PROGRESS_UPDATE") {
    window.postMessage({
      type: "NOTEBOOKLM_PROGRESS_UPDATE",
      payload: message.data,
    }, "*");
  }
});
