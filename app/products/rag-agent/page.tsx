"use client";

import Link from "next/link";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import ParticleField from "../../components/ParticleField";
import { ragApiBaseUrl } from "../../config/api";

type Source = {
  title: string;
  content: string;
  document_id?: string;
  chunk_id?: string;
  score?: number | null;
  page_start?: number | null;
  page_end?: number | null;
  section_path?: string[];
};

type ChatResponse = {
  session_id: string;
  rewritten_question: string;
  answer: string;
  sources: Source[];
  mode: "langgraph_deepseek" | "langchain_deepseek" | "deepseek" | "retrieval_template" | "knowledge_overview";
  retrieval_mode?: "chroma" | "local_hash_embedding";
  score_threshold?: number;
  workflow?: "langgraph" | "manual";
  graph_path?: string[];
  messages?: ChatMessage[];
  overview?: KnowledgeOverview | null;
};

type ChatMessage = {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

type DocumentRecord = {
  id: string;
  filename: string;
  file_type: string;
  stored_path: string;
  parsed_path: string;
  chunks_path: string;
  content_hash: string;
  summary: string;
  tags: string[];
  char_count: number;
  chunk_count: number;
  created_at: string;
};

type KnowledgeOverviewDocument = {
  document_id: string;
  filename: string;
  file_type: string;
  char_count: number;
  chunk_count: number;
  created_at: string;
  preview: string;
};

type KnowledgeOverview = {
  document_count: number;
  total_chunks: number;
  total_char_count: number;
  documents: KnowledgeOverviewDocument[];
  truncated: boolean;
};

type DocumentListResponse = {
  items: DocumentRecord[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  total_chunks: number;
};

type UploadQueueItem = {
  file_id?: string;
  filename: string;
  status: "queued" | "uploading" | "running" | "indexed" | "failed" | "duplicate";
  stage: string;
  document_id?: string;
  document?: DocumentRecord | null;
  duplicate_document?: DocumentRecord | null;
  char_count?: number;
  chunk_count?: number;
  error?: string;
};

type IngestTaskResponse = {
  task_id: string;
  status: "queued" | "running" | "completed" | "failed" | "partial_failed";
  total: number;
  succeeded: number;
  failed: number;
  created_at: string;
  updated_at: string;
  completed_at: string;
  items: UploadQueueItem[];
};

type ChunkStrategy =
  | "semantic"
  | "semantic_split"
  | "length_fallback"
  | "structure"
  | "structure_split"
  | "section_semantic"
  | "section_semantic_split";

type DocumentChunk = {
  id: string;
  document_id: string;
  index: number;
  content: string;
  char_count: number;
  title: string;
  heading_level: number | null;
  strategy: ChunkStrategy;
  semantic_break_score: number | null;
  section_path: string[];
  token_estimate: number;
  page_start: number | null;
  page_end: number | null;
  overlap_previous: string;
  overlap_next: string;
};

type DocumentDetail = {
  document: DocumentRecord;
  text_preview: string;
  preview_char_count: number;
  chunks: DocumentChunk[];
  returned_chunk_count: number;
};

type SearchResult = {
  document_id: string;
  document_filename: string;
  chunk_id: string;
  chunk_index: number;
  title: string;
  score: number;
  vector_score: number;
  lexical_score: number;
  rerank_score: number;
  content: string;
  char_count: number;
  strategy: ChunkStrategy;
  section_path: string[];
  token_estimate: number;
  page_start: number | null;
  page_end: number | null;
};

type SearchResponse = {
  question: string;
  top_k: number;
  score_threshold: number;
  total_chunks: number;
  results: SearchResult[];
  mode: "chroma" | "local_hash_embedding";
  retrieval_strategy?: "hybrid_rerank";
  query_terms?: string[];
};

type VectorStoreStatus = {
  provider: "chroma";
  available: boolean;
  persist_path: string;
  collection: string;
  chunk_count: number;
  embedding_provider: string;
};

const apiBaseUrl = ragApiBaseUrl;
const sampleQuestion = "这份文档里和 RAG 项目经验、技术能力最相关的内容是什么？";
const documentsPerPage = 10;
const suggestedDocumentTags = ["简历", "项目文档", "面试资料"];

const ingestStageLabels: Record<string, string> = {
  uploaded: "上传",
  queued: "排队",
  parsing: "解析",
  chunking: "切分",
  embedding: "向量化",
  indexing: "入库",
  indexed: "完成",
  duplicate: "重复",
  failed: "失败",
};

const ingestStageOrder = ["uploaded", "parsing", "chunking", "embedding", "indexing", "indexed"];

const strategyLabel: Record<string, string> = {
  semantic: "语义切分",
  semantic_split: "语义切分 + 长度兜底",
  length_fallback: "长度兜底",
  structure: "结构切分",
  structure_split: "结构切分 + 长度兜底",
  section_semantic: "章节语义切分",
  section_semantic_split: "章节语义切分 + 长度兜底",
};

function pageLabel(start?: number | null, end?: number | null) {
  if (!start) return "";
  return end && end !== start ? `第 ${start}-${end} 页` : `第 ${start} 页`;
}

function modeLabel(mode?: string) {
  if (mode === "langgraph_deepseek") return "LangGraph + DeepSeek";
  if (mode === "langchain_deepseek") return "LangChain + DeepSeek";
  if (mode === "deepseek") return "DeepSeek";
  if (mode === "knowledge_overview") return "Knowledge Overview";
  if (mode === "chroma") return "Chroma";
  if (mode === "local_hash_embedding") return "JSON Fallback";
  if (mode === "hybrid_rerank") return "Hybrid Rerank";
  return mode || "Waiting";
}

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function parseTagInput(input: string) {
  return input
    .split(/[,，\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function uploadStageIndex(item: UploadQueueItem) {
  if (item.status === "indexed") return ingestStageOrder.length - 1;
  if (item.status === "failed" || item.status === "duplicate") return -1;
  const index = ingestStageOrder.indexOf(item.stage);
  return index >= 0 ? index : 0;
}

export default function RagAgentProductPage() {
  const [question, setQuestion] = useState(sampleQuestion);
  const [topK, setTopK] = useState(5);
  const [scoreThreshold, setScoreThreshold] = useState(0.2);
  const [chatSessionId, setChatSessionId] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatResult, setChatResult] = useState<ChatResponse | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [documentPage, setDocumentPage] = useState(1);
  const [documentTotal, setDocumentTotal] = useState(0);
  const [documentTotalPages, setDocumentTotalPages] = useState(1);
  const [totalDocumentChunks, setTotalDocumentChunks] = useState(0);
  const [documentDetail, setDocumentDetail] = useState<DocumentDetail | null>(null);
  const [vectorStoreStatus, setVectorStoreStatus] = useState<VectorStoreStatus | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadInputKey, setUploadInputKey] = useState(0);
  const [uploadProgress, setUploadProgress] = useState<UploadQueueItem[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [tagSaving, setTagSaving] = useState(false);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rebuildLoading, setRebuildLoading] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [latency, setLatency] = useState<number | null>(null);
  const [adminApiKey, setAdminApiKey] = useState("");

  const isAdminMode = adminApiKey.trim().length > 0;
  const adminHeaders = useCallback(
    (headers: HeadersInit = {}) => ({
      ...headers,
      "X-Admin-API-Key": adminApiKey.trim(),
    }),
    [adminApiKey],
  );

  const loadDocuments = useCallback(async (page: number) => {
    const response = await fetch(`${apiBaseUrl}/api/documents?page=${page}&page_size=${documentsPerPage}`);
    if (!response.ok) throw new Error("文档列表加载失败");
    const data = (await response.json()) as DocumentListResponse;
    setDocuments(data.items);
    setDocumentPage(data.page);
    setDocumentTotal(data.total);
    setDocumentTotalPages(data.total_pages);
    setTotalDocumentChunks(data.total_chunks);
  }, []);

  const loadVectorStoreStatus = useCallback(async () => {
    const response = await fetch(`${apiBaseUrl}/api/vector-store/status`);
    if (response.ok) {
      setVectorStoreStatus((await response.json()) as VectorStoreStatus);
    }
  }, []);

  const refreshWorkspace = useCallback(async (page = documentPage) => {
    await loadDocuments(page);
    await loadVectorStoreStatus();
  }, [documentPage, loadDocuments, loadVectorStoreStatus]);

  const loadDocumentDetail = async (documentId: string) => {
    setDetailLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/documents/${documentId}`);
      if (!response.ok) throw new Error(`文档详情加载失败：${response.status}`);
      const data = (await response.json()) as DocumentDetail;
      setDocumentDetail(data);
      setTagDraft(data.document.tags?.join(", ") ?? "");
      setApiOnline(true);
    } catch (detailError) {
      setApiOnline(false);
      setError(detailError instanceof Error ? detailError.message : "无法加载文档详情。");
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/health`);
        setApiOnline(response.ok);
        if (response.ok) {
          await loadDocuments(1);
          await loadVectorStoreStatus();
        }
      } catch {
        setApiOnline(false);
      }
    };
    bootstrap();
  }, [loadDocuments, loadVectorStoreStatus]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setSelectedFiles(files);
    setUploadProgress(
      files.map((file) => ({
        filename: file.name,
        status: "queued",
        stage: "等待上传",
      })),
    );
    setUploadMessage("");
    setError("");
  };

  const pollIngestTask = async (taskId: string) => {
    let latestTask: IngestTaskResponse | null = null;

    for (let attempt = 0; attempt < 600; attempt += 1) {
      const response = await fetch(`${apiBaseUrl}/api/ingest-tasks/${taskId}`);
      if (!response.ok) throw new Error(`任务状态查询失败：${response.status}`);

      latestTask = (await response.json()) as IngestTaskResponse;
      setUploadProgress(latestTask.items);
      setUploadMessage(
        `入库任务 ${latestTask.status}：成功 ${latestTask.succeeded} / ${latestTask.total}，失败 ${latestTask.failed}。`,
      );

      if (["completed", "failed", "partial_failed"].includes(latestTask.status)) {
        return latestTask;
      }

      await delay(1000);
    }

    throw new Error("入库任务仍在执行，请稍后刷新文档库查看结果。");
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    if (!isAdminMode) {
      setError("需要管理员密钥才能上传文档。");
      return;
    }

    setUploadLoading(true);
    setUploadMessage("");
    setError("");
    setUploadProgress((items) =>
      items.map((item) => ({
        ...item,
        status: "uploading",
        stage: "上传中",
      })),
    );

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));
      const response = await fetch(`${apiBaseUrl}/api/documents/upload/batch`, {
        method: "POST",
        headers: adminHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.detail ?? `上传失败：${response.status}`);
      }

      const createdTask = (await response.json()) as IngestTaskResponse;
      setUploadProgress(createdTask.items);
      setUploadMessage(`入库任务已创建：${createdTask.task_id}`);
      setSelectedFiles([]);
      setUploadInputKey((key) => key + 1);
      setApiOnline(true);
      setDocumentPage(1);

      const result = await pollIngestTask(createdTask.task_id);
      await refreshWorkspace(1);

      const firstDocument = result.items.find((item) => item.document)?.document;
      if (firstDocument) {
        await loadDocumentDetail(firstDocument.id);
      }
    } catch (uploadError) {
      setApiOnline(false);
      setUploadProgress((items) =>
        items.map((item) => ({
          ...item,
          status: "failed",
          stage: "上传失败",
          error: uploadError instanceof Error ? uploadError.message : "无法上传文件。",
        })),
      );
      setError(uploadError instanceof Error ? uploadError.message : "无法上传文件。");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!isAdminMode) {
      setError("需要管理员密钥才能删除文档。");
      return;
    }
    if (
      !window.confirm(
        "确定删除这个文档吗？系统会同步删除 SQLite 元数据、Chroma 向量索引、原始文件、解析文本和 chunks 文件。",
      )
    ) {
      return;
    }

    setDeletingDocumentId(documentId);
    setError("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/documents/${documentId}`, {
        method: "DELETE",
        headers: adminHeaders(),
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.detail ?? `删除失败：${response.status}`);
      }

      if (documentDetail?.document.id === documentId) {
        setDocumentDetail(null);
        setTagDraft("");
      }
      setSearchResult(null);
      setChatResult(null);
      await refreshWorkspace();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "无法删除文档。");
    } finally {
      setDeletingDocumentId(null);
    }
  };

  const handleUpdateDocumentTags = async (documentId: string, tags: string[]) => {
    if (!isAdminMode) {
      setError("需要管理员密钥才能保存文档标签。");
      return;
    }
    setTagSaving(true);
    setError("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/documents/${documentId}/tags`, {
        method: "PATCH",
        headers: adminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ tags }),
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.detail ?? `标签保存失败：${response.status}`);
      }

      const updatedDocument = (await response.json()) as DocumentRecord;
      setDocuments((items) =>
        items.map((item) => (item.id === updatedDocument.id ? updatedDocument : item)),
      );
      setDocumentDetail((detail) =>
        detail && detail.document.id === updatedDocument.id
          ? { ...detail, document: updatedDocument }
          : detail,
      );
      setTagDraft(updatedDocument.tags.join(", "));
      setApiOnline(true);
    } catch (tagError) {
      setApiOnline(false);
      setError(tagError instanceof Error ? tagError.message : "无法保存文档标签。");
    } finally {
      setTagSaving(false);
    }
  };

  const handleRebuildVectorStore = async () => {
    if (!isAdminMode) {
      setError("需要管理员密钥才能重建向量索引。");
      return;
    }
    setRebuildLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/vector-store/rebuild`, {
        method: "POST",
        headers: adminHeaders(),
      });
      if (!response.ok) throw new Error(`索引重建失败：${response.status}`);
      await loadVectorStoreStatus();
    } catch (rebuildError) {
      setError(rebuildError instanceof Error ? rebuildError.message : "无法重建向量索引。");
    } finally {
      setRebuildLoading(false);
    }
  };

  const handleSearch = async () => {
    setSearchLoading(true);
    setError("");
    setSearchResult(null);
    setChatResult(null);
    setLatency(null);
    const startedAt = performance.now();

    try {
      const response = await fetch(`${apiBaseUrl}/api/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          top_k: topK,
          score_threshold: scoreThreshold,
        }),
      });

      if (!response.ok) throw new Error(`检索请求失败：${response.status}`);
      setSearchResult((await response.json()) as SearchResponse);
      setApiOnline(true);
      setLatency(Math.round(performance.now() - startedAt));
    } catch (searchError) {
      setApiOnline(false);
      setError(searchError instanceof Error ? searchError.message : "无法连接 RAG 后端。");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleChat = async () => {
    setChatLoading(true);
    setError("");
    setChatResult(null);
    setLatency(null);
    const startedAt = performance.now();

    try {
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          top_k: topK,
          score_threshold: scoreThreshold,
          session_id: chatSessionId || undefined,
        }),
      });

      if (!response.ok) throw new Error(`问答请求失败：${response.status}`);
      const data = (await response.json()) as ChatResponse;
      setChatResult(data);
      setChatSessionId(data.session_id);
      setChatMessages(data.messages ?? []);
      setApiOnline(true);
      setLatency(Math.round(performance.now() - startedAt));
    } catch (chatError) {
      setApiOnline(false);
      setError(chatError instanceof Error ? chatError.message : "无法连接 RAG 后端。");
    } finally {
      setChatLoading(false);
    }
  };

  const startNewChatSession = () => {
    setChatSessionId("");
    setChatMessages([]);
    setChatResult(null);
    setQuestion("");
    setError("");
    setLatency(null);
  };

  const currentDocumentPage = documentPage;
  const totalDocumentPages = documentTotalPages;
  const visibleDocuments = documents;

  return (
    <main className="lab-product-theme min-h-screen overflow-hidden bg-[#05070b] text-zinc-100">
      <ParticleField />
      <div className="pointer-events-none fixed inset-0 z-0 opacity-40 [background-image:linear-gradient(rgba(103,232,249,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.12)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="pointer-events-none fixed inset-0 z-0 [background-image:radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_78%_12%,rgba(163,230,53,0.12),transparent_28%),linear-gradient(180deg,transparent,rgba(5,7,11,0.92))]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-1 bg-cyan-300" />

      <header className="sticky top-0 z-30 border-b border-cyan-300/20 bg-[#05070b]/86 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.22em]">
            曾见云霞满天 AI Lab
          </Link>
          <div className="flex gap-5 text-xs font-medium uppercase tracking-[0.16em] text-zinc-600">
            <Link href="/#projects">Projects</Link>
            <Link href="/projects/rag-agent">Detail</Link>
            <a href="https://github.com/huaixu0909/rag-agent-system" target="_blank">
              GitHub
            </a>
          </div>
        </nav>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-8">
        <div className="grid gap-5 border-b border-zinc-950 pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
              RAG Knowledge Console / Chroma / Qwen Embedding / DeepSeek
            </p>
            <h1 className="font-display mt-4 text-4xl font-black sm:text-6xl">
              知识库问答工作台
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-700">
              首屏聚焦两个动作：添加资料、提出问题。下方文档库用于管理知识范围，右侧工作区展示回答、检索证据和文档细节。
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            <div className="border border-zinc-950 bg-white px-4 py-3 text-sm">
              <span className="text-zinc-500">API</span>
              <span
                className={`ml-3 font-black ${
                  apiOnline ? "text-lime-600" : apiOnline === false ? "text-red-600" : "text-zinc-500"
                }`}
              >
                {apiOnline ? "ONLINE" : apiOnline === false ? "OFFLINE" : "CHECKING"}
              </span>
              {latency !== null ? <span className="ml-3 text-zinc-500">{latency}ms</span> : null}
            </div>
            <div className="border border-zinc-950 bg-white px-4 py-3 text-sm">
              <span className="text-zinc-500">Vector</span>
              <span className="ml-3 font-black text-blue-700">
                {vectorStoreStatus?.available ? "CHROMA" : "JSON FALLBACK"}
              </span>
              <span className="ml-3 text-zinc-500">
                {vectorStoreStatus ? `${vectorStoreStatus.chunk_count} chunks` : "checking"}
              </span>
              {vectorStoreStatus ? (
                <span className="ml-3 text-zinc-500">{vectorStoreStatus.embedding_provider}</span>
              ) : null}
            </div>
          </div>
        </div>

        <section className="mt-5 border border-zinc-950 bg-white p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <label className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
              Admin Mode
              <input
                type="password"
                value={adminApiKey}
                onChange={(event) => setAdminApiKey(event.target.value)}
                placeholder="ADMIN_API_KEY"
                className="mt-2 w-full border border-zinc-950 bg-[#f6f3ec] px-3 py-2 text-sm normal-case tracking-normal text-zinc-950"
              />
            </label>
            <span
              className={`border px-3 py-2 text-xs font-black ${
                isAdminMode
                  ? "border-lime-500 bg-lime-100 text-lime-800"
                  : "border-zinc-300 bg-zinc-100 text-zinc-500"
              }`}
            >
              {isAdminMode ? "ADMIN ENABLED" : "READ ONLY"}
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            上传、删除、标签保存和重建索引需要管理员密钥；检索和问答对普通访客开放，但后端会按 IP 限流。
          </p>
        </section>

        <div className="mt-6 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <section className="border border-zinc-950 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                      Step 01
                    </p>
                    <h2 className="mt-2 font-black">添加文档</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => refreshWorkspace()}
                    className="text-sm font-bold text-blue-700"
                  >
                    刷新
                  </button>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  上传 PDF、Markdown 或 TXT。后端会解析文本、切分 chunks，并写入 Chroma。
                </p>
                {isAdminMode ? (
                  <>
                    <input
                      key={uploadInputKey}
                      type="file"
                      accept=".txt,.md,.pdf"
                      multiple
                      onChange={handleFileChange}
                      className="mt-5 w-full border border-zinc-950 bg-[#f6f3ec] p-3 text-sm"
                    />
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={handleUpload}
                        disabled={selectedFiles.length === 0 || uploadLoading}
                        className="border border-zinc-950 bg-zinc-950 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
                      >
                        {uploadLoading ? "上传中..." : "上传文档"}
                      </button>
                      {selectedFiles.length > 0 ? (
                        <span className="min-w-0 flex-1 truncate text-sm text-zinc-500">
                          已选择 {selectedFiles.length} 个文件
                        </span>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <p className="mt-5 border border-dashed border-zinc-300 bg-[#f6f3ec] p-4 text-sm text-zinc-500">
                    当前为只读模式。输入管理员密钥后可上传文档。
                  </p>
                )}
                {uploadProgress.length > 0 ? (
                  <div className="mt-4 grid gap-2">
                    {uploadProgress.map((item, index) => (
                      <div
                        key={`${item.filename}-${index}`}
                        className="flex items-center justify-between gap-3 border border-zinc-950/20 bg-[#f6f3ec] px-3 py-2 text-xs"
                      >
                        <span className="min-w-0 flex-1 truncate font-bold">{item.filename}</span>
                        <span
                          className={`shrink-0 font-black ${
                            item.status === "indexed"
                              ? "text-lime-700"
                              : item.status === "failed" || item.status === "duplicate"
                                ? "text-red-700"
                                : "text-blue-700"
                          }`}
                        >
                          {item.status === "indexed"
                            ? "已入库"
                            : item.status === "failed"
                              ? "失败"
                              : item.status === "duplicate"
                                ? "重复"
                              : item.stage}
                        </span>
                        <div className="hidden shrink-0 gap-1 md:flex">
                          {ingestStageOrder.map((stage, stageIndex) => {
                            const activeIndex = uploadStageIndex(item);
                            const isDone = activeIndex >= stageIndex;
                            return (
                              <span
                                key={stage}
                                className={`border px-2 py-0.5 text-[10px] font-black ${
                                  isDone
                                    ? "border-lime-500 text-lime-600"
                                    : "border-zinc-700 text-zinc-500"
                                }`}
                              >
                                {ingestStageLabels[stage]}
                              </span>
                            );
                          })}
                        </div>
                        {item.error ? <span className="max-w-40 truncate text-red-700">{item.error}</span> : null}
                      </div>
                    ))}
                  </div>
                ) : null}
                {uploadMessage ? (
                  <p className="mt-4 border border-lime-500 bg-lime-100 p-3 text-sm text-zinc-800">
                    {uploadMessage}
                  </p>
                ) : null}
              </section>

              <section className="border border-zinc-950 bg-zinc-950 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                      Step 02
                    </p>
                    <h2 className="mt-2 font-black">提出问题</h2>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setQuestion(sampleQuestion)}
                      className="text-sm font-bold text-lime-300"
                    >
                      示例
                    </button>
                    <button
                      type="button"
                      onClick={startNewChatSession}
                      className="text-sm font-bold text-cyan-200"
                    >
                      新会话
                    </button>
                  </div>
                </div>
                {chatSessionId ? (
                  <p className="mt-3 truncate border border-white/15 bg-black/30 px-3 py-2 text-xs font-bold text-zinc-400">
                    Session: {chatSessionId}
                  </p>
                ) : null}
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  className="mt-5 min-h-36 w-full resize-none border border-white/20 bg-black p-4 text-sm leading-6 text-white outline-none focus:border-lime-300"
                />
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                    Top K
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={topK}
                      onChange={(event) =>
                        setTopK(Math.max(1, Math.min(20, Number(event.target.value) || 1)))
                      }
                      className="mt-2 w-full border border-white/20 bg-black p-2 text-sm text-white"
                    />
                  </label>
                  <label className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                    Threshold {scoreThreshold.toFixed(2)}
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={scoreThreshold}
                      onChange={(event) => setScoreThreshold(Number(event.target.value))}
                      className="mt-3 w-full"
                    />
                  </label>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleChat}
                    disabled={chatLoading || question.trim().length === 0}
                    className="bg-lime-300 px-5 py-3 text-sm font-black text-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-500"
                  >
                    {chatLoading ? "生成中..." : "生成回答"}
                  </button>
                  <button
                    type="button"
                    onClick={handleSearch}
                    disabled={searchLoading || question.trim().length === 0}
                    className="border border-white/30 px-5 py-3 text-sm font-bold hover:border-lime-300"
                  >
                    {searchLoading ? "检索中..." : "只看检索"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setQuestion("");
                      setSearchResult(null);
                      setChatResult(null);
                      setError("");
                      setLatency(null);
                    }}
                    className="border border-white/30 px-5 py-3 text-sm font-bold"
                  >
                    清空
                  </button>
                </div>
              </section>
            </div>

            {error ? (
              <p className="border border-red-400 bg-red-50 p-3 text-sm text-red-700">{error}</p>
            ) : null}

            <section className="border border-zinc-950 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                    Knowledge Scope
                  </p>
                  <h2 className="mt-2 font-black">文档库</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="border border-zinc-950 bg-[#f6f3ec] px-3 py-1 text-xs font-bold">
                    {documentTotal} docs
                  </span>
                  <span className="border border-zinc-950 bg-[#f6f3ec] px-3 py-1 text-xs font-bold">
                    {totalDocumentChunks} chunks
                  </span>
                  {isAdminMode ? (
                    <button
                      type="button"
                      onClick={handleRebuildVectorStore}
                      disabled={rebuildLoading}
                      className="border border-zinc-950 px-3 py-1 text-xs font-bold text-blue-700 disabled:text-zinc-400"
                    >
                      {rebuildLoading ? "重建中" : "重建索引"}
                    </button>
                  ) : null}
                </div>
              </div>

              {documents.length > 0 ? (
                <>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {visibleDocuments.map((document) => (
                      <div
                        key={document.id}
                        className={`border p-4 transition ${
                          documentDetail?.document.id === document.id
                            ? "border-blue-700 bg-blue-50"
                            : "border-zinc-950 bg-[#f6f3ec] hover:bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => loadDocumentDetail(document.id)}
                            className="min-w-0 flex-1 text-left"
                          >
                            <h3 className="truncate font-bold">{document.filename}</h3>
                            <p className="mt-1 text-xs text-zinc-500">
                              {document.file_type} / {document.char_count} 字符 / {document.chunk_count} chunks
                            </p>
                            <p className="mt-2 text-xs text-zinc-400">
                              {new Date(document.created_at).toLocaleString()}
                            </p>
                            {document.summary ? (
                              <p className="mt-3 line-clamp-3 text-xs leading-5 text-zinc-600">
                                {document.summary}
                              </p>
                            ) : null}
                            {document.tags?.length ? (
                              <div className="mt-3 flex flex-wrap gap-1">
                                {document.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="border border-cyan-300/30 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-black text-blue-700"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </button>
                          {isAdminMode ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteDocument(document.id)}
                              disabled={deletingDocumentId === document.id}
                              className="border border-red-300 px-3 py-1 text-xs font-bold text-red-700 hover:bg-red-50 disabled:text-zinc-400"
                            >
                              {deletingDocumentId === document.id ? "删除中" : "删除"}
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-950 pt-4">
                    <p className="text-xs font-bold text-zinc-500">
                      第 {currentDocumentPage} / {totalDocumentPages} 页，每页 {documentsPerPage} 份
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => refreshWorkspace(Math.max(1, currentDocumentPage - 1))}
                        disabled={currentDocumentPage <= 1}
                        className="border border-zinc-950 px-3 py-2 text-xs font-bold disabled:border-zinc-300 disabled:text-zinc-400"
                      >
                        上一页
                      </button>
                      <button
                        type="button"
                        onClick={() => refreshWorkspace(Math.min(totalDocumentPages, currentDocumentPage + 1))}
                        disabled={currentDocumentPage >= totalDocumentPages}
                        className="border border-zinc-950 px-3 py-2 text-xs font-bold disabled:border-zinc-300 disabled:text-zinc-400"
                      >
                        下一页
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-4 border border-dashed border-zinc-500 p-6 text-sm text-zinc-500">
                  暂无文档。先上传一份 PDF、Markdown 或 TXT。
                </div>
              )}
            </section>
          </div>

          <div className="space-y-5">
            <section className="border border-zinc-950 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                    Primary Output
                  </p>
                  <h2 className="mt-2 font-black">LLM 回答</h2>
                </div>
                {chatResult ? (
                  <span
                    className={`border px-3 py-1 text-xs font-black ${
                      chatResult.mode === "langgraph_deepseek" || chatResult.mode === "langchain_deepseek"
                        ? "border-lime-500 bg-lime-100 text-zinc-950"
                        : "border-zinc-300 text-zinc-500"
                    }`}
                  >
                    {modeLabel(chatResult.mode)}
                  </span>
                ) : null}
              </div>

              {chatMessages.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  {chatMessages.map((message) => (
                    <article
                      key={message.id}
                      className={`border p-3 ${
                        message.role === "user"
                          ? "border-cyan-300/30 bg-black/30"
                          : "border-lime-300/30 bg-[#f6f3ec]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
                          {message.role === "user" ? "User" : "Assistant"}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-zinc-700">
                        {message.content}
                      </p>
                    </article>
                  ))}
                </div>
              ) : null}

              {chatResult ? (
                <div className="mt-4 space-y-5">
                  <p className="whitespace-pre-wrap border-l-4 border-blue-600 pl-4 leading-8 text-zinc-800">
                    {chatResult.answer}
                  </p>
                  {chatResult.overview ? (
                    <div className="grid gap-3 border border-zinc-950/20 bg-[#f6f3ec] p-4 text-sm sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Documents</p>
                        <p className="mt-1 text-2xl font-black text-zinc-950">
                          {chatResult.overview.document_count}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Chunks</p>
                        <p className="mt-1 text-2xl font-black text-zinc-950">
                          {chatResult.overview.total_chunks}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Characters</p>
                        <p className="mt-1 text-2xl font-black text-zinc-950">
                          {chatResult.overview.total_char_count.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ) : null}
                  {chatResult.rewritten_question && chatResult.rewritten_question !== question ? (
                    <p className="border border-zinc-950/20 bg-[#f6f3ec] px-3 py-2 text-xs leading-5 text-zinc-500">
                      Context Query：{chatResult.rewritten_question}
                    </p>
                  ) : null}
                  <div className="grid gap-2 text-xs text-zinc-500 sm:grid-cols-3">
                    <span>流程：{chatResult.workflow ?? "manual"}</span>
                    <span>检索：{modeLabel(chatResult.retrieval_mode)}</span>
                    <span>阈值：{chatResult.score_threshold?.toFixed(2) ?? scoreThreshold.toFixed(2)}</span>
                  </div>
                  {chatResult.graph_path?.length ? (
                    <p className="border border-zinc-950/20 bg-[#f6f3ec] px-3 py-2 text-xs font-bold text-zinc-500">
                      Graph Path：{chatResult.graph_path.join(" -> ")}
                    </p>
                  ) : null}
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Sources</p>
                    <div className="mt-3 grid gap-3">
                      {chatResult.sources.map((source, index) => (
                        <article
                          key={`${source.title}-${index}`}
                          className="border border-zinc-950/20 bg-[#f6f3ec] p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <h3 className="font-bold">
                              [{index + 1}] {source.title}
                            </h3>
                            {typeof source.score === "number" ? (
                              <span className="text-xs font-bold text-blue-700">
                                {source.score.toFixed(3)}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-xs text-zinc-500">
                            {pageLabel(source.page_start, source.page_end)}
                            {source.section_path?.length ? ` / ${source.section_path.join(" / ")}` : ""}
                          </p>
                          <p className="mt-2 line-clamp-4 text-sm leading-6 text-zinc-600">
                            {source.content}
                          </p>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 border border-dashed border-zinc-500 p-8 text-sm text-zinc-500">
                  点击“生成回答”后，这里会展示基于知识库资料生成的回答和引用来源。
                </div>
              )}
            </section>

            <section className="border border-zinc-950 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                    Evidence Debugger
                  </p>
                  <h2 className="mt-2 font-black">检索结果</h2>
                </div>
                {searchResult ? (
                  <span className="border border-zinc-950 bg-[#f6f3ec] px-3 py-1 text-xs font-bold">
                    {modeLabel(searchResult.mode)} / {searchResult.results.length}
                  </span>
                ) : null}
              </div>

              {searchResult ? (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-zinc-500">
                    扫描 {searchResult.total_chunks} 个 chunks，阈值 {searchResult.score_threshold.toFixed(2)}，
                    策略 {modeLabel(searchResult.retrieval_strategy)}。
                  </p>
                  {searchResult.query_terms?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {searchResult.query_terms.slice(0, 12).map((term) => (
                        <span
                          key={term}
                          className="border border-zinc-950/20 bg-[#f6f3ec] px-2 py-1 text-xs font-bold text-zinc-500"
                        >
                          {term}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {searchResult.results.map((item, index) => (
                    <article key={item.chunk_id} className="border border-zinc-950 bg-[#f6f3ec] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold">
                            {String(index + 1).padStart(2, "0")} / {item.document_filename} / chunk {item.chunk_index}
                          </h3>
                          <p className="mt-1 text-xs leading-5 text-zinc-500">
                            score {item.score.toFixed(3)} / {strategyLabel[item.strategy] ?? item.strategy} / {item.char_count} 字符
                            {item.token_estimate ? ` / 约 ${item.token_estimate} tokens` : ""}
                            {pageLabel(item.page_start, item.page_end) ? ` / ${pageLabel(item.page_start, item.page_end)}` : ""}
                            {item.section_path?.length ? ` / ${item.section_path.join(" / ")}` : ""}
                          </p>
                          <p className="mt-1 text-xs text-zinc-400">
                            vector {item.vector_score.toFixed(3)} / lexical {item.lexical_score.toFixed(3)} / rerank{" "}
                            {item.rerank_score.toFixed(3)}
                          </p>
                        </div>
                        <div className="h-2 w-28 border border-zinc-950 bg-white">
                          <div
                            className="h-full bg-blue-600"
                            style={{ width: `${Math.min(100, Math.max(0, item.score * 100))}%` }}
                          />
                        </div>
                      </div>
                      <p className="mt-3 line-clamp-5 text-sm leading-6 text-zinc-700">
                        {item.content}
                      </p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-4 border border-dashed border-zinc-500 p-8 text-sm text-zinc-500">
                  点击“只看检索”后，这里会展示相似度排名和命中文本。
                </div>
              )}
            </section>

            <section className="border border-zinc-950 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                    Document Inspector
                  </p>
                  <h2 className="mt-2 font-black">文档详情</h2>
                </div>
                {documentDetail ? (
                  <span className="border border-zinc-950 bg-[#f6f3ec] px-3 py-1 text-xs font-bold">
                    {documentDetail.returned_chunk_count} chunks preview
                  </span>
                ) : null}
              </div>

              {detailLoading ? (
                <div className="mt-4 border border-dashed border-zinc-500 p-8 text-sm text-zinc-500">
                  正在加载...
                </div>
              ) : documentDetail ? (
                <div className="mt-4 space-y-5">
                  <div className="grid gap-2 border border-zinc-950 bg-[#f6f3ec] p-4 text-sm text-zinc-600 md:grid-cols-2">
                    <p>文件：{documentDetail.document.filename}</p>
                    <p>类型：{documentDetail.document.file_type}</p>
                    <p>字符数：{documentDetail.document.char_count}</p>
                    <p>Chunks：{documentDetail.document.chunk_count}</p>
                    <p className="md:col-span-2">
                      Hash：{documentDetail.document.content_hash?.slice(0, 16) || "N/A"}
                    </p>
                  </div>
                  <div className="border border-zinc-950 bg-[#f6f3ec] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
                      Summary
                    </p>
                    <p className="mt-2 text-sm leading-7 text-zinc-600">
                      {documentDetail.document.summary || "暂无摘要。新上传文档会在入库时自动生成摘要。"}
                    </p>
                    <div className="mt-4">
                      <label className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">
                        Tags
                        <input
                          value={tagDraft}
                          onChange={(event) => setTagDraft(event.target.value)}
                          placeholder="简历, 项目文档, 面试资料"
                          className="mt-2 w-full border border-zinc-950 bg-black/30 px-3 py-2 text-sm"
                        />
                      </label>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {suggestedDocumentTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              const nextTags = Array.from(new Set([...parseTagInput(tagDraft), tag]));
                              setTagDraft(nextTags.join(", "));
                            }}
                            className="border border-cyan-300/30 px-3 py-1 text-xs font-bold text-blue-700"
                          >
                            {tag}
                          </button>
                        ))}
                        {isAdminMode ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateDocumentTags(documentDetail.document.id, parseTagInput(tagDraft))
                            }
                            disabled={tagSaving}
                            className="border border-lime-400 bg-lime-100 px-3 py-1 text-xs font-black text-zinc-950 disabled:opacity-50"
                          >
                            {tagSaving ? "保存中..." : "保存标签"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <pre className="max-h-56 overflow-auto whitespace-pre-wrap border border-zinc-950 bg-zinc-950 p-4 text-sm leading-6 text-zinc-100">
                    {documentDetail.text_preview || "暂无可预览文本。"}
                  </pre>
                  <div className="grid gap-3">
                    {documentDetail.chunks.map((chunk) => (
                      <article key={chunk.id} className="border border-zinc-950 bg-[#f6f3ec] p-4">
                        <h3 className="font-bold">
                          Chunk {chunk.index}
                          {chunk.title ? ` / ${chunk.title}` : ""}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                          {strategyLabel[chunk.strategy] ?? chunk.strategy} / {chunk.char_count} 字符
                          {chunk.token_estimate ? ` / 约 ${chunk.token_estimate} tokens` : ""}
                          {pageLabel(chunk.page_start, chunk.page_end) ? ` / ${pageLabel(chunk.page_start, chunk.page_end)}` : ""}
                          {chunk.section_path?.length ? ` / ${chunk.section_path.join(" / ")}` : ""}
                        </p>
                        <p className="mt-3 line-clamp-5 text-sm leading-6 text-zinc-700">
                          {chunk.content}
                        </p>
                        {chunk.overlap_previous || chunk.overlap_next ? (
                          <div className="mt-3 grid gap-2 border-t border-zinc-950/20 pt-3 text-xs leading-5 text-zinc-500">
                            {chunk.overlap_previous ? <p>上文 overlap：{chunk.overlap_previous}</p> : null}
                            {chunk.overlap_next ? <p>下文 overlap：{chunk.overlap_next}</p> : null}
                          </div>
                        ) : null}
                      </article>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 border border-dashed border-zinc-500 p-8 text-sm text-zinc-500">
                  点击左侧文档后，这里会展示解析文本、chunk metadata 和 overlap。
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
