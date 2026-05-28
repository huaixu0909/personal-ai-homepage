import { ragApiBaseUrl } from "../../config/api";

export type Source = {
  title: string;
  content: string;
  document_id?: string;
  chunk_id?: string;
  score?: number | null;
  page_start?: number | null;
  page_end?: number | null;
  section_path?: string[];
};

export type ChatResponse = {
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

export type ChatMessage = {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type DocumentRecord = {
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

export type KnowledgeOverviewDocument = {
  document_id: string;
  filename: string;
  file_type: string;
  char_count: number;
  chunk_count: number;
  created_at: string;
  preview: string;
};

export type KnowledgeOverview = {
  document_count: number;
  total_chunks: number;
  total_char_count: number;
  documents: KnowledgeOverviewDocument[];
  truncated: boolean;
};

export type DocumentListResponse = {
  items: DocumentRecord[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  total_chunks: number;
};

export type UploadQueueItem = {
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

export type IngestTaskResponse = {
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

export type ChunkStrategy =
  | "semantic"
  | "semantic_split"
  | "length_fallback"
  | "structure"
  | "structure_split"
  | "section_semantic"
  | "section_semantic_split";

export type DocumentChunk = {
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

export type DocumentDetail = {
  document: DocumentRecord;
  text_preview: string;
  preview_char_count: number;
  chunks: DocumentChunk[];
  returned_chunk_count: number;
};

export type SearchResult = {
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

export type SearchResponse = {
  question: string;
  top_k: number;
  score_threshold: number;
  total_chunks: number;
  results: SearchResult[];
  mode: "chroma" | "local_hash_embedding";
  retrieval_strategy?: "hybrid_rerank";
  query_terms?: string[];
  fallback_reason?: string;
};

export type VectorStoreStatus = {
  provider: "chroma";
  available: boolean;
  persist_path: string;
  collection: string;
  chunk_count: number;
  embedding_provider: string;
  error?: string;
};

export const apiBaseUrl = ragApiBaseUrl;
export const sampleQuestion = "这份文档里和 RAG 项目经验、技术能力最相关的内容是什么？";
export const documentsPerPage = 10;
export const suggestedDocumentTags = ["简历", "项目文档", "面试资料"];

export const ingestStageLabels: Record<string, string> = {
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

export const ingestStageOrder = ["uploaded", "parsing", "chunking", "embedding", "indexing", "indexed"];

export const strategyLabel: Record<string, string> = {
  semantic: "语义切分",
  semantic_split: "语义切分 + 长度兜底",
  length_fallback: "长度兜底",
  structure: "结构切分",
  structure_split: "结构切分 + 长度兜底",
  section_semantic: "章节语义切分",
  section_semantic_split: "章节语义切分 + 长度兜底",
};

export function pageLabel(start?: number | null, end?: number | null) {
  if (!start) return "";
  return end && end !== start ? `第 ${start}-${end} 页` : `第 ${start} 页`;
}

export function modeLabel(mode?: string) {
  if (mode === "langgraph_deepseek") return "LangGraph + DeepSeek";
  if (mode === "langchain_deepseek") return "LangChain + DeepSeek";
  if (mode === "deepseek") return "DeepSeek";
  if (mode === "knowledge_overview") return "Knowledge Overview";
  if (mode === "chroma") return "Chroma";
  if (mode === "local_hash_embedding") return "JSON Fallback";
  if (mode === "hybrid_rerank") return "Hybrid Rerank";
  return mode || "Waiting";
}

export function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function parseTagInput(input: string) {
  return input
    .split(/[,，\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function uploadStageIndex(item: UploadQueueItem) {
  if (item.status === "indexed") return ingestStageOrder.length - 1;
  if (item.status === "failed" || item.status === "duplicate") return -1;
  const index = ingestStageOrder.indexOf(item.stage);
  return index >= 0 ? index : 0;
}
