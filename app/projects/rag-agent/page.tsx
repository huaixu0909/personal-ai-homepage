import Link from "next/link";

const githubUrl = "https://github.com/huaixu0909/rag-agent-system";

export default function RagAgentProjectPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <header className="border-b border-zinc-200">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold">
            曾见云霞满天 AI Lab
          </Link>
          <div className="flex gap-5 text-sm text-zinc-600">
            <Link href="/">Home</Link>
            <Link href="/#projects">Projects</Link>
            <a href={githubUrl} target="_blank">
              GitHub
            </a>
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <p className="mb-4 text-sm font-medium text-blue-600">Project 01</p>
        <h1 className="font-display max-w-3xl text-4xl font-bold">
          企业知识库 RAG Agent 系统
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600">
          一个面向企业文档问答场景的 RAG Agent 原型，目标是支持文档上传、文本解析、向量检索、引用溯源和 Agent 工具调用。
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/demos/rag-agent"
            className="rounded-md bg-zinc-950 px-5 py-3 text-sm font-medium text-white"
          >
            打开本地 Demo
          </Link>
          <a
            href={githubUrl}
            target="_blank"
            className="rounded-md border border-zinc-300 px-5 py-3 text-sm font-medium"
          >
            查看 GitHub
          </a>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">MVP 功能</h2>
            <ul className="mt-5 space-y-3 text-zinc-600">
              <li>文档上传：支持 PDF、Markdown、TXT。</li>
              <li>文档解析：提取文本并保存来源信息。</li>
              <li>向量检索：基于知识库内容召回相关片段。</li>
              <li>RAG 问答：基于检索结果生成回答。</li>
              <li>引用溯源：返回回答参考的文档来源。</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold">技术栈</h2>
            <ul className="mt-5 space-y-3 text-zinc-600">
              <li>Backend：FastAPI、Pydantic</li>
              <li>Agent：LangGraph</li>
              <li>Vector DB：Qdrant 或 Chroma</li>
              <li>Database：PostgreSQL 或 MySQL</li>
              <li>Deploy：Docker Compose</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="text-2xl font-bold">当前开发状态</h2>
        <p className="mt-4 max-w-3xl leading-7 text-zinc-600">
          当前已经完成 FastAPI 最小原型和前端 Demo 页联调。下一步会加入文档上传、文本切分、向量数据库和真实 RAG 问答链路。
        </p>

        <h2 className="mt-10 text-2xl font-bold">后续计划</h2>
        <p className="mt-4 max-w-3xl leading-7 text-zinc-600">
          完成基础 RAG 后，继续加入流式输出、多轮对话、Agent 工具调用、执行过程追踪和可复现 README。
        </p>
      </section>
    </main>
  );
}
