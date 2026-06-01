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
  // Core options
  artifactType?: number;  // 1=Audio, 2=Report, 3=Video, 4=Flashcards/Quiz, 7=Infographic, 8=Slide Deck, 9=Data Table
  language?: string;      // BCP-47 language code (default: "en")
  focus?: string;         // Optional focus topic/prompt
  sourceIds?: string[];   // Optional specific source IDs (defaults to all)

  // Audio options (artifactType = 1)
  audioFormat?: number;   // 1=Brief, 2=Deep Dive, 3=Critique, 4=Debate
  audioLength?: number;   // 1=Short, 2=Default, 3=Long

  // Video options (artifactType = 3)
  videoFormat?: number;       // 1=Explainer, 2=Brief, 3=Cinematic
  videoStyle?: number;        // 1=Auto Select, 2=Custom, 3=Classic, 4=Whiteboard, 5=Kawaii, 6=Anime, 7=Watercolor, 8=Retro Print, 9=Heritage, 10=Paper Craft
  videoStylePrompt?: string;  // Custom visual style description (for videoStyle=2)

  // Infographic options (artifactType = 7)
  infographicOrientation?: number;  // 1=Landscape, 2=Portrait, 3=Square
  infographicDetail?: number;       // 1=Concise, 2=Standard, 3=Detailed
  infographicStyle?: number;        // 1=Auto Select, 2=Sketch Note, 3=Professional, 4=Bento Grid, 5=Editorial, 6=Instructional, 7=Bricks, 8=Clay, 9=Anime, 10=Kawaii, 11=Scientific

  // Slide Deck options (artifactType = 8)
  slideDeckFormat?: number;  // 1=Detailed, 2=Concise
  slideDeckLength?: number;  // 1=Short, 2=Medium, 3=Default, 4=Long

  // Report options (artifactType = 2)
  reportFormat?: string;        // "Briefing Doc", "Study Guide", "Blog Post", "Create Your Own"
  reportCustomPrompt?: string;  // Custom prompt for "Create Your Own" format

  // Quiz options (artifactType = 4, isQuiz = true)
  isQuiz?: boolean;          // Set to true for quiz, false/undefined for flashcards
  quizQuestionCount?: number;  // Number of quiz questions (default: 2)
  quizDifficulty?: number;     // Quiz difficulty level (default: 2)

  // Flashcard options (artifactType = 4, isQuiz = false/undefined)
  flashcardDifficulty?: number;  // 1=Easy, 2=Medium, 3=Hard

  // Data Table options (artifactType = 9)
  dataTableDescription?: string;  // Required: description of the data table to create

  // Legacy/deprecated (kept for backwards compatibility)
  format?: number;
  length?: number;
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
        params: { artifactType: 1, audioFormat: 2, audioLength: 3 },
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
        params: { artifactType: 2, reportFormat: "Blog Post" },
        enabled: true,
      },
      {
        id: "infographic",
        name: "生成信息图",
        type: "studio",
        params: { artifactType: 7, infographicStyle: 3 },
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
        params: { artifactType: 4, isQuiz: true, quizQuestionCount: 2, quizDifficulty: 2 },
        enabled: true,
      },
      {
        id: "flashcards",
        name: "生成闪卡",
        type: "studio",
        params: { artifactType: 4, flashcardDifficulty: 2 },
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
