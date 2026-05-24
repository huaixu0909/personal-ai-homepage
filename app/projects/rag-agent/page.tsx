import Link from "next/link";

const githubUrl = "https://github.com/huaixu0909/rag-agent-system";

const capabilities = [
  "支持 .txt、.md、.pdf 文档上传与批量上传。",
  "异步入库任务队列：上传后后台执行解析、chunking、embedding 和写入索引。",
  "SQLite 保存文档元数据、摘要、标签、状态、任务进度和会话记录。",
  "Chroma 本地向量数据库负责知识库相似度检索，保留 JSON chunks 便于调试和详情展示。",
  "支持 Qwen Embedding，未配置时自动回退本地 hash embedding。",
  "支持混合检索与 rerank：向量分数、关键词覆盖、标题/章节命中共同参与排序。",
  "LangGraph + LangChain + DeepSeek 组成 RAG 问答链路。",
  "支持相似度阈值，资料不足时严格回答：当前知识库中没有足够信息回答这个问题。",
  "支持多轮对话、问题改写、知识库概览问答和来源引用。",
  "支持文档去重、文档摘要、手动标签和删除时多存储同步清理。",
];

const stack = [
  ["Backend", "FastAPI / Pydantic / Uvicorn"],
  ["Workflow", "LangGraph / LangChain"],
  ["LLM", "DeepSeek OpenAI-compatible API"],
  ["Embedding", "Qwen Embedding / Local Hash Fallback"],
  ["Vector DB", "Chroma"],
  ["Metadata DB", "SQLite"],
  ["Frontend", "Next.js Product Console"],
];

const apiGroups = [
  {
    title: "文档库",
    items: [
      "POST /api/documents/upload",
      "POST /api/documents/upload/batch",
      "GET /api/ingest-tasks/{task_id}",
      "GET /api/documents?page=1&page_size=10",
      "GET /api/documents/{document_id}",
      "PATCH /api/documents/{document_id}/tags",
      "DELETE /api/documents/{document_id}",
    ],
  },
  {
    title: "检索与问答",
    items: [
      "POST /api/search",
      "POST /api/chat",
      "GET /api/chat/sessions/{session_id}/messages",
      "GET /api/vector-store/status",
      "POST /api/vector-store/rebuild",
    ],
  },
];

export default function RagAgentProjectPage() {
  return (
    <main className="project-detail-theme min-h-screen overflow-hidden bg-[#10151d] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-22 [background-image:linear-gradient(rgba(236,214,167,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(236,214,167,0.1)_1px,transparent_1px)] [background-size:80px_80px]" />
      <div className="pointer-events-none fixed inset-0 z-0 [background-image:radial-gradient(circle_at_18%_10%,rgba(236,214,167,0.12),transparent_30%),radial-gradient(circle_at_88%_12%,rgba(94,132,160,0.16),transparent_28%),linear-gradient(180deg,rgba(16,21,29,0.12),rgba(16,21,29,0.96))]" />

      <header className="relative z-10 border-b border-[#ecd6a7]/20 bg-[#10151d]/88 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold text-zinc-100">
            曾见云霞满天 AI Lab
          </Link>
          <div className="flex gap-5 text-sm text-zinc-400">
            <Link href="/">Home</Link>
            <Link href="/#projects">Projects</Link>
            <Link href="/products/rag-agent">Product</Link>
            <a href={githubUrl} target="_blank">
              GitHub
            </a>
          </div>
        </nav>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <p className="mb-4 text-sm font-medium text-[#ecd6a7]">Project 01 / v1.9</p>
        <h1 className="font-display max-w-4xl text-4xl font-bold">
          企业知识库 RAG Agent System
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
          一个面向本地知识库问答的 RAG 工程系统。它已经从最小原型演进为包含文档上传、异步解析、
          结构化 chunking、Qwen Embedding、Chroma 向量检索、LangGraph RAG 问答、多轮对话、
          知识库概览和文档管理闭环的可运行原型。
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/products/rag-agent"
            className="rounded-xl border border-[#ecd6a7]/70 bg-[#ecd6a7] px-5 py-3 text-sm font-bold !text-[#10151d] shadow-[0_12px_30px_rgba(236,214,167,0.16)] transition hover:bg-[#f7e7bd]"
          >
            打开产品控制台
          </Link>
          <a
            href={githubUrl}
            target="_blank"
            className="rounded-xl border border-[#ecd6a7]/35 bg-[#ecd6a7]/10 px-5 py-3 text-sm font-bold !text-[#f5ead2] transition hover:border-[#ecd6a7]/70 hover:bg-[#ecd6a7]/16"
          >
            查看 GitHub
          </a>
        </div>
      </section>

      <section className="relative z-10 border-t border-[#ecd6a7]/18 bg-[#17202b]/78">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">当前能力</h2>
            <ul className="mt-5 space-y-3 text-zinc-300">
              {capabilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold">技术栈</h2>
            <div className="mt-5 space-y-3">
              {stack.map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#ecd6a7]">
                    {label}
                  </p>
                  <p className="mt-2 text-zinc-200">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-14">
        <h2 className="text-2xl font-bold">系统工作流</h2>
        <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-5 text-sm leading-7 text-zinc-300">
          <pre className="overflow-x-auto whitespace-pre-wrap font-code text-sm leading-7">
{`上传文档
-> 保存原始文件到 data/uploads
-> 创建异步入库任务
-> 解析文本到 data/parsed
-> 结构化 chunking 并保存 JSON chunks
-> 生成 embedding
-> 写入 Chroma
-> SQLite 保存文档元数据、摘要、标签和状态
-> 用户提问
-> LangGraph 执行 retrieve / reject_answer / generate_answer
-> DeepSeek 基于检索上下文生成回答并返回来源`}
          </pre>
        </div>
      </section>

      <section className="relative z-10 border-y border-[#ecd6a7]/18 bg-[#111923]/70">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 md:grid-cols-2">
          {apiGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-2xl font-bold">{group.title} API</h2>
              <ul className="mt-5 space-y-3 text-zinc-300">
                {group.items.map((item) => (
                  <li key={item} className="rounded-2xl border border-white/10 bg-black/20 p-3 font-code text-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-14">
        <h2 className="text-2xl font-bold">当前开发状态</h2>
        <p className="mt-4 max-w-3xl leading-7 text-zinc-300">
          当前版本已经具备“上传资料到知识库、检索知识库、基于知识库问答、资料不足时拒答、查看来源、
          管理文档库”的完整本地闭环。它还不是生产级 SaaS，但已经能体现 RAG 工程中的核心模块：
          文档处理、向量索引、检索质量、LLM 约束、数据持久化、异步任务和前后端联调。
        </p>

        <h2 className="mt-10 text-2xl font-bold">后续计划</h2>
        <p className="mt-4 max-w-3xl leading-7 text-zinc-300">
          下一阶段可以继续补强流式输出、权限与知识库分区、真实 reranker、文件预览、高级引用定位、
          评测集与自动化 RAG 质量评估，让系统从本地知识库项目 继续走向更完整的工程化知识助手。
        </p>
      </section>
    </main>
  );
}
