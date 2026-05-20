"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";

type Source = {
  title: string;
  content: string;
};

type ChatResponse = {
  answer: string;
  sources: Source[];
  mode: "deepseek" | "retrieval_template";
};

type DocumentRecord = {
  id: string;
  filename: string;
  file_type: string;
  stored_path: string;
  parsed_path: string;
  chunks_path: string;
  char_count: number;
  chunk_count: number;
  created_at: string;
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
  total_chunks: number;
  results: SearchResult[];
  mode: "local_hash_embedding";
};

const apiBaseUrl = "http://localhost:8000";
const sampleQuestion = "这份文档里和 RAG 项目经验、技术能力最相关的内容是什么？";

const strategyLabel: Record<string, string> = {
  semantic: "语义切分",
  semantic_split: "语义切分 + 长度兜底",
  length_fallback: "长度兜底",
  structure: "结构切分",
  structure_split: "结构切分 + 长度兜底",
  section_semantic: "章节语义切分",
  section_semantic_split: "章节语义切分 + 长度兜底",
};

function pageLabel(start: number | null, end: number | null) {
  if (!start) return "";
  return end && end !== start ? `第 ${start}-${end} 页` : `第 ${start} 页`;
}

export default function RagAgentDemoPage() {
  const [question, setQuestion] = useState(sampleQuestion);
  const [chatResult, setChatResult] = useState<ChatResponse | null>(null);
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [documentDetail, setDocumentDetail] = useState<DocumentDetail | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [latency, setLatency] = useState<number | null>(null);

  const loadDocuments = async () => {
    const response = await fetch(`${apiBaseUrl}/api/documents`);
    if (!response.ok) throw new Error("文档列表加载失败");
    setDocuments((await response.json()) as DocumentRecord[]);
  };

  const loadDocumentDetail = async (documentId: string) => {
    setDetailLoading(true);
    setError("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/documents/${documentId}`);
      if (!response.ok) throw new Error(`文档详情加载失败：${response.status}`);
      setDocumentDetail((await response.json()) as DocumentDetail);
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
        if (response.ok) await loadDocuments();
      } catch {
        setApiOnline(false);
      }
    };
    bootstrap();
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null);
    setUploadMessage("");
    setError("");
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploadLoading(true);
    setUploadMessage("");
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await fetch(`${apiBaseUrl}/api/documents/upload`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.detail ?? `上传失败：${response.status}`);
      }
      const document = (await response.json()) as DocumentRecord;
      setUploadMessage(
        `上传成功：${document.filename}，解析 ${document.char_count} 字符，切分 ${document.chunk_count} 个 chunks。`,
      );
      setSelectedFile(null);
      setApiOnline(true);
      await loadDocuments();
      await loadDocumentDetail(document.id);
    } catch (uploadError) {
      setApiOnline(false);
      setError(uploadError instanceof Error ? uploadError.message : "无法上传文件。");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm("确定要删除这个文档吗？原始文件、解析文本和 chunks 都会一起删除。")) {
      return;
    }
    setDeletingDocumentId(documentId);
    setError("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/documents/${documentId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.detail ?? `删除失败：${response.status}`);
      }
      if (documentDetail?.document.id === documentId) setDocumentDetail(null);
      setSearchResult(null);
      setChatResult(null);
      await loadDocuments();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "无法删除文档。");
    } finally {
      setDeletingDocumentId(null);
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
        body: JSON.stringify({ question, top_k: 5 }),
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
        body: JSON.stringify({ question, top_k: 5 }),
      });
      if (!response.ok) throw new Error(`问答请求失败：${response.status}`);
      setChatResult((await response.json()) as ChatResponse);
      setApiOnline(true);
      setLatency(Math.round(performance.now() - startedAt));
    } catch (chatError) {
      setApiOnline(false);
      setError(chatError instanceof Error ? chatError.message : "无法连接 RAG 后端。");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f3ec] text-zinc-950">
      <header className="sticky top-0 z-20 border-b border-zinc-950 bg-[#f6f3ec]/90 backdrop-blur">
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

      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="grid gap-5 border-b border-zinc-950 pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
              RAG Agent Demo / DeepSeek Enabled
            </p>
            <h1 className="font-display mt-4 text-4xl font-black sm:text-6xl">
              知识检索仪表盘
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-700">
              上传文档，观察结构增强 chunks、相似度召回、DeepSeek 回答和引用来源。这个页面更像工程控制台，
              用来检查 RAG 链路是否可信。
            </p>
          </div>
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
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
          <div className="space-y-5">
            <section className="border border-zinc-950 bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-black">上传文档</h2>
                <button type="button" onClick={loadDocuments} className="text-sm font-bold text-blue-700">
                  刷新
                </button>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-600">
                支持 .txt、.md、.pdf。后端会保存解析文本、生成结构增强 chunks 和 embedding。
              </p>
              <input
                type="file"
                accept=".txt,.md,.pdf"
                onChange={handleFileChange}
                className="mt-4 w-full border border-zinc-950 bg-[#f6f3ec] p-3 text-sm"
              />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!selectedFile || uploadLoading}
                  className="border border-zinc-950 bg-zinc-950 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
                >
                  {uploadLoading ? "上传中..." : "上传并解析"}
                </button>
                {selectedFile ? <span className="text-sm text-zinc-500">{selectedFile.name}</span> : null}
              </div>
              {uploadMessage ? (
                <p className="mt-4 border border-lime-500 bg-lime-100 p-3 text-sm text-zinc-800">
                  {uploadMessage}
                </p>
              ) : null}
            </section>

            <section className="border border-zinc-950 bg-white p-5">
              <h2 className="font-black">文档库</h2>
              {documents.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  {documents.map((document) => (
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
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDocument(document.id)}
                          disabled={deletingDocumentId === document.id}
                          className="border border-red-300 px-3 py-1 text-xs font-bold text-red-700 hover:bg-red-50 disabled:text-zinc-400"
                        >
                          {deletingDocumentId === document.id ? "删除中" : "删除"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 border border-dashed border-zinc-500 p-6 text-sm text-zinc-500">
                  暂无文档。先上传一份 PDF、Markdown 或 TXT。
                </div>
              )}
            </section>

            <section className="border border-zinc-950 bg-zinc-950 p-5 text-white">
              <div className="flex items-center justify-between">
                <h2 className="font-black">问题输入</h2>
                <button type="button" onClick={() => setQuestion(sampleQuestion)} className="text-sm font-bold text-lime-300">
                  示例
                </button>
              </div>
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                className="mt-4 min-h-40 w-full resize-none border border-white/20 bg-black p-4 text-sm leading-6 text-white outline-none focus:border-lime-300"
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={searchLoading || question.trim().length === 0}
                  className="bg-lime-300 px-5 py-3 text-sm font-black text-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-500"
                >
                  {searchLoading ? "检索中..." : "检索 chunks"}
                </button>
                <button
                  type="button"
                  onClick={handleChat}
                  disabled={chatLoading || question.trim().length === 0}
                  className="border border-white/30 px-5 py-3 text-sm font-bold hover:border-lime-300"
                >
                  {chatLoading ? "生成中..." : "DeepSeek 回答"}
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
              {error ? <p className="mt-4 border border-red-400 bg-red-950 p-3 text-sm text-red-100">{error}</p> : null}
            </section>
          </div>

          <div className="space-y-5">
            <section className="border border-zinc-950 bg-white p-5">
              <h2 className="font-black">检索结果</h2>
              {searchResult ? (
                <div className="mt-4 space-y-3">
                  <p className="text-sm text-zinc-500">
                    扫描 {searchResult.total_chunks} 个 chunks，返回 {searchResult.results.length} 个结果。
                  </p>
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
                        </div>
                        <div className="h-2 w-28 border border-zinc-950 bg-white">
                          <div className="h-full bg-blue-600" style={{ width: `${Math.min(100, Math.max(0, item.score * 100))}%` }} />
                        </div>
                      </div>
                      <p className="mt-3 line-clamp-6 text-sm leading-6 text-zinc-700">{item.content}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-4 border border-dashed border-zinc-500 p-8 text-sm text-zinc-500">
                  输入问题后点击“检索 chunks”，这里会展示相似度排名。
                </div>
              )}
            </section>

            <section className="border border-zinc-950 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-black">LLM 回答</h2>
                {chatResult ? (
                  <span className={`border px-3 py-1 text-xs font-black ${chatResult.mode === "deepseek" ? "border-lime-500 bg-lime-100 text-zinc-950" : "border-zinc-300 text-zinc-500"}`}>
                    {chatResult.mode}
                  </span>
                ) : null}
              </div>
              {chatResult ? (
                <div className="mt-4 space-y-5">
                  <p className="whitespace-pre-wrap border-l-4 border-blue-600 pl-4 leading-8 text-zinc-800">
                    {chatResult.answer}
                  </p>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Sources</p>
                    <div className="mt-3 grid gap-3">
                      {chatResult.sources.map((source, index) => (
                        <article key={`${source.title}-${index}`} className="border border-zinc-950/20 bg-[#f6f3ec] p-4">
                          <h3 className="font-bold">{source.title}</h3>
                          <p className="mt-2 line-clamp-4 text-sm leading-6 text-zinc-600">{source.content}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 border border-dashed border-zinc-500 p-8 text-sm text-zinc-500">
                  点击“DeepSeek 回答”后，这里会展示基于检索结果生成的回答。
                </div>
              )}
            </section>

            <section className="border border-zinc-950 bg-white p-5">
              <h2 className="font-black">文档详情</h2>
              {detailLoading ? (
                <div className="mt-4 border border-dashed border-zinc-500 p-8 text-sm text-zinc-500">正在加载...</div>
              ) : documentDetail ? (
                <div className="mt-4 space-y-5">
                  <div className="grid gap-2 border border-zinc-950 bg-[#f6f3ec] p-4 text-sm text-zinc-600 md:grid-cols-2">
                    <p>文件：{documentDetail.document.filename}</p>
                    <p>类型：{documentDetail.document.file_type}</p>
                    <p>字符数：{documentDetail.document.char_count}</p>
                    <p>Chunks：{documentDetail.document.chunk_count}</p>
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
                        <p className="mt-3 line-clamp-5 text-sm leading-6 text-zinc-700">{chunk.content}</p>
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
