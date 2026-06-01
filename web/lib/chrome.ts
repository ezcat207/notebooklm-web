// Chrome API wrapper for communicating with the extension

import type {
  ChromeMessage,
  ChromeResponse,
  Notebook,
  NotebookSummary,
  BatchImportResult,
  BatchStudioResult,
  ShareStatus,
  StudioOptions,
  ProgressUpdate,
} from "./types";

/**
 * Actively ping the extension to check if it's available
 */
export function waitForExtension(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    console.log('[NotebookLM Web] Pinging extension...');

    const pingId = `ping_${Date.now()}`;
    let resolved = false;

    // Listen for pong response
    const pongListener = (event: MessageEvent) => {
      if (event.data.type !== "NOTEBOOKLM_EXTENSION_PONG") return;
      if (event.data.pingId !== pingId) return;

      if (!resolved) {
        resolved = true;
        window.removeEventListener("message", pongListener);
        console.log('[NotebookLM Web] Extension responded!');
        resolve(true);
      }
    };

    window.addEventListener("message", pongListener);

    // Send ping
    window.postMessage({
      type: "NOTEBOOKLM_PING",
      pingId: pingId,
    }, "*");

    // Timeout after 2 seconds
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        window.removeEventListener("message", pongListener);
        console.log('[NotebookLM Web] Extension ping timeout');
        resolve(false);
      }
    }, 2000);
  });
}

/**
 * Check if Chrome extension is available (legacy method, now uses ping)
 */
export function isExtensionAvailable(): boolean {
  // This is now just for backwards compatibility
  // The real check happens in waitForExtension()
  return typeof window !== "undefined";
}

let messageIdCounter = 0;

/**
 * Send message to Chrome extension via content script bridge
 */
export function sendMessage<T = any>(
  message: ChromeMessage
): Promise<ChromeResponse<T>> {
  return new Promise((resolve, reject) => {
    if (!isExtensionAvailable()) {
      reject(new Error("Chrome extension not detected"));
      return;
    }

    const messageId = `msg_${Date.now()}_${messageIdCounter++}`;

    // Listen for response
    const responseListener = (event: MessageEvent) => {
      if (event.data.type !== "NOTEBOOKLM_EXTENSION_TO_WEB") return;
      if (event.data.payload.messageId !== messageId) return;

      window.removeEventListener("message", responseListener);

      const response = event.data.payload.response;
      if (!response) {
        reject(new Error("No response from extension"));
      } else {
        resolve(response as ChromeResponse<T>);
      }
    };

    window.addEventListener("message", responseListener);

    // Send message to content script
    window.postMessage({
      type: "NOTEBOOKLM_WEB_TO_EXTENSION",
      payload: {
        messageId,
        action: message.action,
        data: message.data,
      },
    }, "*");

    // Timeout after 30 seconds
    setTimeout(() => {
      window.removeEventListener("message", responseListener);
      reject(new Error("Extension request timeout"));
    }, 30000);
  });
}

/**
 * Listen for progress updates from extension
 */
export function onProgressUpdate(
  callback: (update: ProgressUpdate) => void
): () => void {
  if (!isExtensionAvailable()) {
    return () => {};
  }

  const listener = (event: MessageEvent) => {
    if (event.data.type === "NOTEBOOKLM_PROGRESS_UPDATE") {
      callback(event.data.payload);
    }
  };

  window.addEventListener("message", listener);

  // Return cleanup function
  return () => {
    window.removeEventListener("message", listener);
  };
}

// ========== Auth ==========

/**
 * Check authentication status
 */
export async function checkAuth(): Promise<boolean> {
  try {
    const response = await sendMessage<{ authenticated: boolean }>({
      action: "CHECK_AUTH",
    });
    return response.data?.authenticated || false;
  } catch (error) {
    console.error("Failed to check auth:", error);
    return false;
  }
}

// ========== Notebook Operations ==========

/**
 * List all notebooks
 */
export async function listNotebooks(): Promise<Notebook[]> {
  const response = await sendMessage<{ notebooks: Notebook[] }>({
    action: "LIST_NOTEBOOKS",
  });
  return response.data?.notebooks || [];
}

/**
 * Create a new notebook
 */
export async function createNotebook(
  title: string,
  description?: string
): Promise<Notebook> {
  const response = await sendMessage<{ notebook: Notebook }>({
    action: "CREATE_NOTEBOOK",
    data: { title, description },
  });

  if (!response.success || !response.data?.notebook) {
    throw new Error(response.error || "Failed to create notebook");
  }

  return response.data.notebook;
}

/**
 * Delete a notebook
 */
export async function deleteNotebook(notebookId: string): Promise<void> {
  const response = await sendMessage({
    action: "DELETE_NOTEBOOK",
    data: { notebookId },
  });

  if (!response.success) {
    throw new Error(response.error || "Failed to delete notebook");
  }
}

/**
 * Rename a notebook
 */
export async function renameNotebook(
  notebookId: string,
  newTitle: string
): Promise<void> {
  const response = await sendMessage({
    action: "RENAME_NOTEBOOK",
    data: { notebookId, newTitle },
  });

  if (!response.success) {
    throw new Error(response.error || "Failed to rename notebook");
  }
}

/**
 * Get notebook summary
 */
export async function getNotebookSummary(
  notebookId: string
): Promise<NotebookSummary> {
  const response = await sendMessage<NotebookSummary>({
    action: "GET_SUMMARY",
    data: { notebookId },
  });

  if (!response.success) {
    throw new Error(response.error || "Failed to get summary");
  }

  return response.data || { summary: "", suggestedTopics: [] };
}

// ========== Source Operations ==========

/**
 * Add URL source to notebook
 */
export async function addUrlSource(
  notebookId: string,
  url: string
): Promise<{ sourceId: string }> {
  const response = await sendMessage<{ sourceId: string }>({
    action: "ADD_URL_SOURCE",
    data: { notebookId, url },
  });

  if (!response.success) {
    throw new Error(response.error || "Failed to add URL source");
  }

  return response.data!;
}

/**
 * Add text source to notebook
 */
export async function addTextSource(
  notebookId: string,
  text: string,
  title?: string
): Promise<{ sourceId: string }> {
  const response = await sendMessage<{ sourceId: string }>({
    action: "ADD_TEXT_SOURCE",
    data: { notebookId, text, title },
  });

  if (!response.success) {
    throw new Error(response.error || "Failed to add text source");
  }

  return response.data!;
}

/**
 * Delete source from notebook
 */
export async function deleteSource(
  notebookId: string,
  sourceId: string
): Promise<void> {
  const response = await sendMessage({
    action: "DELETE_SOURCE",
    data: { notebookId, sourceId },
  });

  if (!response.success) {
    throw new Error(response.error || "Failed to delete source");
  }
}

/**
 * Batch import URLs
 */
export async function batchImport(
  notebookId: string,
  urls: string[]
): Promise<BatchImportResult> {
  const response = await sendMessage<BatchImportResult>({
    action: "BATCH_IMPORT",
    data: { notebookId, urls },
  });

  if (!response.success) {
    throw new Error(response.error || "Failed to batch import");
  }

  return response.data!;
}

// ========== Studio Operations ==========

/**
 * Create studio content
 */
export async function createStudio(
  notebookId: string,
  options: StudioOptions
): Promise<{ artifactId: string }> {
  const response = await sendMessage<{ artifactId: string }>({
    action: "CREATE_STUDIO",
    data: { notebookId, options },
  });

  if (!response.success) {
    throw new Error(response.error || "Failed to create studio content");
  }

  return response.data!;
}

/**
 * Poll studio status
 */
export async function pollStudioStatus(
  notebookId: string,
  artifactId: string
): Promise<{ status: string; progress: number }> {
  const response = await sendMessage<{ status: string; progress: number }>({
    action: "POLL_STUDIO",
    data: { notebookId, artifactId },
  });

  if (!response.success) {
    throw new Error(response.error || "Failed to poll studio status");
  }

  return response.data!;
}

/**
 * Wait for studio completion
 */
export async function waitForStudioCompletion(
  notebookId: string,
  artifactId: string
): Promise<{ artifactId: string }> {
  const response = await sendMessage<{ artifactId: string }>({
    action: "WAIT_STUDIO",
    data: { notebookId, artifactId },
  });

  if (!response.success) {
    throw new Error(response.error || "Failed to wait for studio completion");
  }

  return response.data!;
}

/**
 * Batch create studio content
 */
export async function batchCreateStudio(
  notebookIds: string[],
  options: StudioOptions
): Promise<BatchStudioResult> {
  const response = await sendMessage<BatchStudioResult>({
    action: "BATCH_CREATE_STUDIO",
    data: { notebookIds, options },
  });

  if (!response.success) {
    throw new Error(response.error || "Failed to batch create studio content");
  }

  return response.data!;
}

/**
 * Download artifact
 */
export async function downloadArtifact(
  notebookId: string,
  artifactId: string,
  filename?: string
): Promise<{ downloadId: number }> {
  const response = await sendMessage<{ downloadId: number }>({
    action: "DOWNLOAD_ARTIFACT",
    data: { notebookId, artifactId, filename },
  });

  if (!response.success) {
    throw new Error(response.error || "Failed to download artifact");
  }

  return response.data!;
}

// ========== Sharing Operations ==========

/**
 * Get share status
 */
export async function getShareStatus(
  notebookId: string
): Promise<ShareStatus> {
  const response = await sendMessage<ShareStatus>({
    action: "GET_SHARE_STATUS",
    data: { notebookId },
  });

  if (!response.success) {
    throw new Error(response.error || "Failed to get share status");
  }

  return response.data || { isPublic: false, publicUrl: "", collaborators: [] };
}

/**
 * Set public sharing
 */
export async function setPublicSharing(
  notebookId: string,
  enabled: boolean
): Promise<{ publicUrl: string }> {
  const response = await sendMessage<{ publicUrl: string }>({
    action: "SET_PUBLIC_SHARING",
    data: { notebookId, enabled },
  });

  if (!response.success) {
    throw new Error(response.error || "Failed to set public sharing");
  }

  return response.data || { publicUrl: "" };
}
