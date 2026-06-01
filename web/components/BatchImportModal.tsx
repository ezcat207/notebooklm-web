"use client";

import { useState } from "react";
import { batchImport, addTextSource } from "@/lib/chrome";
import type { Notebook } from "@/lib/types";

interface BatchImportModalProps {
  notebookIds: string[];
  notebooks: Notebook[];
  onClose: () => void;
}

export default function BatchImportModal({
  notebookIds,
  notebooks,
  onClose,
}: BatchImportModalProps) {
  const [urls, setUrls] = useState("");
  const [textContent, setTextContent] = useState("");
  const [textTitle, setTextTitle] = useState("");
  const [sourceType, setSourceType] = useState<"url" | "text">("url");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  async function handleImport() {
    if (sourceType === "url") {
      await handleUrlImport();
    } else {
      await handleTextImport();
    }
  }

  async function handleUrlImport() {
    const urlList = urls
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u);

    if (urlList.length === 0) {
      alert("请输入至少一个 URL");
      return;
    }

    setLoading(true);
    setProgress({ current: 0, total: urlList.length * notebookIds.length });

    try {
      for (const notebookId of notebookIds) {
        const result = await batchImport(notebookId, urlList);
        console.log(`Imported to ${notebookId}:`, result);
      }

      alert(
        `成功导入 ${urlList.length} 个 URL 到 ${notebookIds.length} 个笔记本`
      );
      onClose();
    } catch (error) {
      console.error("Failed to import:", error);
      alert("导入失败: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleTextImport() {
    if (!textContent.trim()) {
      alert("请输入文本内容");
      return;
    }

    setLoading(true);
    setProgress({ current: 0, total: notebookIds.length });

    try {
      for (let i = 0; i < notebookIds.length; i++) {
        await addTextSource(notebookIds[i], textContent, textTitle);
        setProgress({ current: i + 1, total: notebookIds.length });
      }

      alert(`成功添加文本到 ${notebookIds.length} 个笔记本`);
      onClose();
    } catch (error) {
      console.error("Failed to add text:", error);
      alert("添加文本失败: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">批量导入</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {/* Selected Notebooks */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-blue-900 mb-2">
            将导入到以下 {notebooks.length} 个笔记本：
          </p>
          <div className="flex flex-wrap gap-2">
            {notebooks.map((nb) => (
              <span
                key={nb.id}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded"
              >
                {nb.title}
              </span>
            ))}
          </div>
        </div>

        {/* Source Type Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            来源类型
          </label>
          <div className="flex space-x-4">
            <button
              onClick={() => setSourceType("url")}
              className={`flex-1 py-2 px-4 rounded-lg border ${
                sourceType === "url"
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
              disabled={loading}
            >
              📎 URL
            </button>
            <button
              onClick={() => setSourceType("text")}
              className={`flex-1 py-2 px-4 rounded-lg border ${
                sourceType === "text"
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-700 border-gray-300"
              }`}
              disabled={loading}
            >
              📝 文本
            </button>
          </div>
        </div>

        {/* URL Input */}
        {sourceType === "url" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URLs (每行一个)
            </label>
            <textarea
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              placeholder={`https://example.com/article1\nhttps://youtube.com/watch?v=abc123\nhttps://example.com/article2`}
              className="textarea"
              rows={8}
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">
              支持: URL, YouTube, Google Drive 链接
            </p>
          </div>
        )}

        {/* Text Input */}
        {sourceType === "text" && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标题 (可选)
              </label>
              <input
                type="text"
                value={textTitle}
                onChange={(e) => setTextTitle(e.target.value)}
                placeholder="输入文本标题"
                className="input"
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文本内容
              </label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="粘贴或输入文本内容..."
                className="textarea"
                rows={12}
                disabled={loading}
              />
            </div>
          </>
        )}

        {/* Progress */}
        {loading && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">导入中...</span>
              <span className="text-sm text-gray-600">
                {progress.current}/{progress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    progress.total > 0
                      ? (progress.current / progress.total) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="btn btn-secondary" disabled={loading}>
            取消
          </button>
          <button
            onClick={handleImport}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "导入中..." : "开始导入"}
          </button>
        </div>
      </div>
    </div>
  );
}
