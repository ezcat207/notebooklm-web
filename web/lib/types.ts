// Type definitions for Notebook and Batch

export interface Notebook {
  id: string;
  title: string;
  source_count: number;
  sources?: Source[];
  is_owned?: boolean;
  is_shared?: boolean;
  created_at?: string;
  modified_at?: string;
}

export interface Source {
  id: string;
  title: string;
  type?: number; // 1=URL, 2=Text, 3=Drive, 4=File
  url?: string;
  status?: string; // ready, processing, failed
}

export interface NotebookSummary {
  summary: string;
  suggestedTopics: string[];
}

export interface StudioOptions {
  artifactType?: number;
  format?: number;
  length?: number;
  // Audio specific
  audioFormat?: "deep_dive" | "brief" | "critique" | "debate";
  audioLength?: "short" | "default" | "long";
  // Video specific
  videoFormat?: "explainer" | "brief";
  videoStyle?: string;
  // Other options
  customInstructions?: string;
}

export interface StudioArtifact {
  id: string;
  type: number;
  status: "processing" | "completed" | "failed";
  progress: number;
  title?: string;
  downloadUrl?: string;
}

export interface ShareStatus {
  isPublic: boolean;
  publicUrl: string;
  collaborators: Collaborator[];
}

export interface Collaborator {
  email: string;
  role: "owner" | "editor" | "viewer";
}

export interface BatchImportResult {
  success: boolean;
  imported_count: number;
  failed_count: number;
  results: {
    url: string;
    success: boolean;
    sourceId?: string;
    error?: string;
  }[];
}

export interface BatchStudioResult {
  success: boolean;
  completed_count: number;
  failed_count: number;
  results: {
    notebookId: string;
    artifactId?: string;
    success: boolean;
    error?: string;
  }[];
}

export interface ProgressUpdate {
  current: number;
  total: number;
  percentage: number;
  status: "processing" | "completed" | "error";
  message: string;
}

export interface ChromeMessage {
  action: string;
  data?: any;
}

export interface ChromeResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Workflow types
export interface WorkflowStep {
  id: string;
  name: string;
  type: "import" | "query" | "studio" | "download" | "share";
  params: any;
  enabled: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
}

export const PRESET_WORKFLOWS: Workflow[] = [
  {
    id: "competitor-research",
    name: "竞品研究",
    description: "导入 → 查询 → 生成音频 → 下载",
    steps: [
      {
        id: "import",
        name: "批量导入 URLs",
        type: "import",
        params: { sourceType: "url" },
        enabled: true,
      },
      {
        id: "query",
        name: "AI 查询关键点",
        type: "query",
        params: { prompt: "总结所有竞品的核心功能和差异点" },
        enabled: true,
      },
      {
        id: "audio",
        name: "生成音频 Overview",
        type: "studio",
        params: { artifactType: 1, format: 1, length: 3 },
        enabled: true,
      },
      {
        id: "download",
        name: "下载文件",
        type: "download",
        params: {},
        enabled: true,
      },
    ],
  },
  {
    id: "content-marketing",
    name: "内容营销",
    description: "导入 → 博客 → 信息图 → 下载",
    steps: [
      {
        id: "import",
        name: "批量导入 URLs",
        type: "import",
        params: { sourceType: "url" },
        enabled: true,
      },
      {
        id: "report",
        name: "生成博客文章",
        type: "studio",
        params: { artifactType: 3 },
        enabled: true,
      },
      {
        id: "infographic",
        name: "生成信息图",
        type: "studio",
        params: { artifactType: 8 },
        enabled: true,
      },
      {
        id: "download",
        name: "批量下载",
        type: "download",
        params: {},
        enabled: true,
      },
    ],
  },
  {
    id: "training-materials",
    name: "培训材料",
    description: "导入 SOP → 测验 → 闪卡 → 下载",
    steps: [
      {
        id: "import",
        name: "导入培训文档",
        type: "import",
        params: { sourceType: "file" },
        enabled: true,
      },
      {
        id: "quiz",
        name: "生成测验",
        type: "studio",
        params: { artifactType: 4 },
        enabled: true,
      },
      {
        id: "flashcards",
        name: "生成闪卡",
        type: "studio",
        params: { artifactType: 5 },
        enabled: true,
      },
      {
        id: "download",
        name: "下载学习材料",
        type: "download",
        params: {},
        enabled: true,
      },
    ],
  },
];
