"use client";

import { useEffect, useState } from "react";
import {
  listNotebooks,
  createNotebook,
  deleteNotebook,
  renameNotebook,
  onProgressUpdate,
} from "@/lib/chrome";
import type { Notebook, ProgressUpdate } from "@/lib/types";
import BatchImportModal from "./BatchImportModal";
import StudioGeneratorModal from "./StudioGeneratorModal";
import NotebookCard from "./NotebookCard";

export default function NotebookList() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotebooks, setSelectedNotebooks] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showStudioModal, setShowStudioModal] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState("");
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);

  useEffect(() => {
    loadNotebooks();

    // Listen for progress updates
    const cleanup = onProgressUpdate((update) => {
      setProgress(update);
      if (update.status === "completed") {
        loadNotebooks(); // Reload notebooks after completion
        setTimeout(() => setProgress(null), 3000);
      }
    });

    return cleanup;
  }, []);

  async function loadNotebooks() {
    try {
      setLoading(true);
      const data = await listNotebooks();
      setNotebooks(data);
    } catch (error) {
      console.error("Failed to load notebooks:", error);
      alert("加载笔记本失败: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateNotebook() {
    if (!newNotebookTitle.trim()) {
      alert("请输入笔记本标题");
      return;
    }

    try {
      await createNotebook(newNotebookTitle);
      setNewNotebookTitle("");
      setShowCreateModal(false);
      loadNotebooks();
    } catch (error) {
      console.error("Failed to create notebook:", error);
      alert("创建笔记本失败: " + (error as Error).message);
    }
  }

  async function handleDeleteNotebook(id: string) {
    if (!confirm("确定要删除这个笔记本吗？")) {
      return;
    }

    try {
      await deleteNotebook(id);
      loadNotebooks();
    } catch (error) {
      console.error("Failed to delete notebook:", error);
      alert("删除笔记本失败: " + (error as Error).message);
    }
  }

  async function handleRenameNotebook(id: string, newTitle: string) {
    try {
      await renameNotebook(id, newTitle);
      loadNotebooks();
    } catch (error) {
      console.error("Failed to rename notebook:", error);
      alert("重命名笔记本失败: " + (error as Error).message);
    }
  }

  function toggleNotebookSelection(id: string) {
    setSelectedNotebooks((prev) =>
      prev.includes(id) ? prev.filter((nid) => nid !== id) : [...prev, id]
    );
  }

  function selectAllNotebooks() {
    setSelectedNotebooks(notebooks.map((nb) => nb.id));
  }

  function deselectAllNotebooks() {
    setSelectedNotebooks([]);
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">加载笔记本中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      {progress && (
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-blue-900">{progress.message}</span>
            <span className="text-sm text-blue-700">
              {progress.current}/{progress.total}
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            我的笔记本 ({notebooks.length})
          </h2>
          {selectedNotebooks.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              已选择 {selectedNotebooks.length} 个笔记本
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {selectedNotebooks.length > 0 && (
            <>
              <button
                onClick={() => setShowImportModal(true)}
                className="btn btn-secondary"
              >
                📥 批量导入
              </button>
              <button
                onClick={() => setShowStudioModal(true)}
                className="btn btn-secondary"
              >
                🎧 批量生成
              </button>
              <button onClick={deselectAllNotebooks} className="btn btn-secondary">
                取消选择
              </button>
            </>
          )}

          {selectedNotebooks.length === 0 && notebooks.length > 0 && (
            <button onClick={selectAllNotebooks} className="btn btn-secondary">
              全选
            </button>
          )}

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            + 新建笔记本
          </button>
        </div>
      </div>

      {/* Notebook Grid */}
      {notebooks.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2">还没有笔记本</h3>
          <p className="text-gray-600 mb-4">创建第一个笔记本开始使用</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            + 创建笔记本
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notebooks.map((notebook) => (
            <NotebookCard
              key={notebook.id}
              notebook={notebook}
              selected={selectedNotebooks.includes(notebook.id)}
              onSelect={() => toggleNotebookSelection(notebook.id)}
              onDelete={() => handleDeleteNotebook(notebook.id)}
              onRename={(newTitle) => handleRenameNotebook(notebook.id, newTitle)}
            />
          ))}
        </div>
      )}

      {/* Create Notebook Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">创建新笔记本</h3>
            <input
              type="text"
              value={newNotebookTitle}
              onChange={(e) => setNewNotebookTitle(e.target.value)}
              placeholder="笔记本标题"
              className="input mb-4"
              onKeyPress={(e) => e.key === "Enter" && handleCreateNotebook()}
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewNotebookTitle("");
                }}
                className="btn btn-secondary"
              >
                取消
              </button>
              <button onClick={handleCreateNotebook} className="btn btn-primary">
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Import Modal */}
      {showImportModal && (
        <BatchImportModal
          notebookIds={selectedNotebooks}
          notebooks={notebooks.filter((nb) =>
            selectedNotebooks.includes(nb.id)
          )}
          onClose={() => {
            setShowImportModal(false);
            loadNotebooks();
          }}
        />
      )}

      {/* Studio Generator Modal */}
      {showStudioModal && (
        <StudioGeneratorModal
          notebookIds={selectedNotebooks}
          notebooks={notebooks.filter((nb) =>
            selectedNotebooks.includes(nb.id)
          )}
          onClose={() => {
            setShowStudioModal(false);
            loadNotebooks();
          }}
        />
      )}
    </div>
  );
}
