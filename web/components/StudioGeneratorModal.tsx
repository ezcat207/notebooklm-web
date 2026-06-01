"use client";

import { useState } from "react";
import { batchCreateStudio } from "@/lib/chrome";
import type { Notebook, StudioOptions } from "@/lib/types";

interface StudioGeneratorModalProps {
  notebookIds: string[];
  notebooks: Notebook[];
  onClose: () => void;
}

type ArtifactType =
  | "audio"
  | "video"
  | "infographic"
  | "slide_deck"
  | "report"
  | "quiz"
  | "flashcards";

export default function StudioGeneratorModal({
  notebookIds,
  notebooks,
  onClose,
}: StudioGeneratorModalProps) {
  const [artifactType, setArtifactType] = useState<ArtifactType>("audio");
  const [audioFormat, setAudioFormat] = useState<"deep_dive" | "brief" | "critique" | "debate">("deep_dive");
  const [audioLength, setAudioLength] = useState<"short" | "default" | "long">("long");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const artifactTypes = [
    { value: "audio", label: "🎧 音频 Overview", type: 1 },
    { value: "video", label: "🎬 视频 Overview", type: 2 },
    { value: "infographic", label: "📊 信息图", type: 8 },
    { value: "slide_deck", label: "📽️ 幻灯片", type: 7 },
    { value: "report", label: "📄 报告", type: 3 },
    { value: "quiz", label: "❓ 测验", type: 4 },
    { value: "flashcards", label: "🃏 闪卡", type: 5 },
  ];

  async function handleGenerate() {
    setLoading(true);
    setProgress({ current: 0, total: notebookIds.length });

    try {
      const selectedType = artifactTypes.find((t) => t.value === artifactType);
      if (!selectedType) {
        throw new Error("Invalid artifact type");
      }

      const options: StudioOptions = {
        artifactType: selectedType.type,
      };

      // Add audio-specific options
      if (artifactType === "audio") {
        const formatMap = { deep_dive: 1, brief: 2, critique: 3, debate: 4 };
        const lengthMap = { short: 1, default: 2, long: 3 };
        options.format = formatMap[audioFormat];
        options.length = lengthMap[audioLength];
      }

      const result = await batchCreateStudio(notebookIds, options);

      alert(
        `成功生成 ${result.completed_count} 个，失败 ${result.failed_count} 个`
      );

      if (result.completed_count > 0) {
        onClose();
      }
    } catch (error) {
      console.error("Failed to generate:", error);
      alert("生成失败: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">批量生成 Studio 内容</h3>
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
            将为以下 {notebooks.length} 个笔记本生成内容：
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

        {/* Artifact Type Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            内容类型
          </label>
          <div className="grid grid-cols-2 gap-2">
            {artifactTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setArtifactType(type.value as ArtifactType)}
                className={`py-3 px-4 rounded-lg border text-left ${
                  artifactType === type.value
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-700 border-gray-300 hover:border-primary"
                }`}
                disabled={loading}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Options */}
        {artifactType === "audio" && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                格式
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "deep_dive", label: "深度对话" },
                  { value: "brief", label: "简要概述" },
                  { value: "critique", label: "批判分析" },
                  { value: "debate", label: "辩论" },
                ].map((format) => (
                  <button
                    key={format.value}
                    onClick={() => setAudioFormat(format.value as any)}
                    className={`py-2 px-4 rounded-lg border ${
                      audioFormat === format.value
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-700 border-gray-300 hover:border-primary"
                    }`}
                    disabled={loading}
                  >
                    {format.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                长度
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "short", label: "短" },
                  { value: "default", label: "中" },
                  { value: "long", label: "长" },
                ].map((length) => (
                  <button
                    key={length.value}
                    onClick={() => setAudioLength(length.value as any)}
                    className={`py-2 px-4 rounded-lg border ${
                      audioLength === length.value
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-700 border-gray-300 hover:border-primary"
                    }`}
                    disabled={loading}
                  >
                    {length.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-yellow-800">
            ⏱️ 生成可能需要几分钟时间，请耐心等待。生成完成后可以在笔记本详情页下载文件。
          </p>
        </div>

        {/* Progress */}
        {loading && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">生成中...</span>
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
            onClick={handleGenerate}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "生成中..." : "开始生成"}
          </button>
        </div>
      </div>
    </div>
  );
}
