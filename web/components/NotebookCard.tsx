"use client";

import { useState } from "react";
import type { Notebook } from "@/lib/types";

interface NotebookCardProps {
  notebook: Notebook;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
}

export default function NotebookCard({
  notebook,
  selected,
  onSelect,
  onDelete,
  onRename,
}: NotebookCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(notebook.title);

  function handleRename() {
    if (editTitle.trim() && editTitle !== notebook.title) {
      onRename(editTitle);
    }
    setIsEditing(false);
  }

  return (
    <div
      className={`card cursor-pointer transition-all ${
        selected
          ? "ring-2 ring-primary bg-blue-50"
          : "hover:shadow-md"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleRename}
              onKeyPress={(e) => e.key === "Enter" && handleRename()}
              onClick={(e) => e.stopPropagation()}
              className="input text-lg font-semibold"
              autoFocus
            />
          ) : (
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {notebook.title}
            </h3>
          )}
        </div>

        <div className="flex items-center space-x-1 ml-2">
          {selected && (
            <span className="flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-xs">
              ✓
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center text-sm text-gray-600 mb-4">
        <span className="flex items-center">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {notebook.source_count} 来源
        </span>

        {notebook.modified_at && (
          <span className="ml-4">
            {new Date(notebook.modified_at).toLocaleDateString("zh-CN")}
          </span>
        )}
      </div>

      <div
        className="flex items-center space-x-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsEditing(true)}
          className="text-sm text-gray-600 hover:text-primary"
        >
          重命名
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={onDelete}
          className="text-sm text-gray-600 hover:text-danger"
        >
          删除
        </button>
        {notebook.is_shared && (
          <>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-green-600">已分享</span>
          </>
        )}
      </div>
    </div>
  );
}
