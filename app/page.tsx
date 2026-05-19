import Link from "next/link";

const githubUrl = "https://github.com/huaixu0909";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <header className="border-b border-zinc-200 bg-white/90">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold">
            Yunhao AI Lab
          </Link>
          <div className="flex gap-5 text-sm text-zinc-600">
            <Link href="/">Home</Link>
            <a href="#projects">Projects</a>
            <a href="#about">About</a>
            <a href={githubUrl} target="_blank">
              GitHub
            </a>
          </div>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <p className="mb-4 text-sm font-medium text-blue-600">
            AI Application Engineer / LLM Agent Builder
          </p>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            杜云昊的 AI 工程实验室
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
            关注 LLM、RAG、Agent 和 AI 工程化，正在构建面向大模型应用开发方向的个人作品集。
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#projects"
              className="rounded-md bg-zinc-950 px-5 py-3 text-sm font-medium text-white"
            >
              查看项目
            </a>
            <a
              href={githubUrl}
              target="_blank"
              className="rounded-md border border-zinc-300 px-5 py-3 text-sm font-medium"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="border border-zinc-200 bg-zinc-50 p-6">
          <p className="text-sm font-medium text-zinc-500">Local Lab Status</p>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <span className="font-medium">Homepage</span>
              <span className="text-sm text-zinc-500">localhost:3000</span>
            </div>
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
              <span className="font-medium">RAG Agent</span>
              <span className="text-sm text-zinc-500">localhost:8000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">JD Analyzer</span>
              <span className="text-sm text-zinc-500">localhost:8001</span>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="border-t border-zinc-200 bg-zinc-50">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-bold">核心项目</h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <article className="border border-zinc-200 bg-white p-6">
              <h3 className="text-xl font-semibold">
                企业知识库 RAG Agent 系统
              </h3>
              <p className="mt-3 text-zinc-600">
                基于 FastAPI、LangGraph 和向量数据库构建的知识库问答系统，支持文档上传、检索问答和引用溯源。
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <Link className="font-medium text-blue-600" href="/demos/rag-agent">
                  本地 Demo
                </Link>
                <a
                  className="font-medium text-blue-600"
                  href={`${githubUrl}/rag-agent-system`}
                  target="_blank"
                >
                  GitHub
                </a>
                <Link className="font-medium text-blue-600" href="/projects/rag-agent">
                  查看详情
                </Link>
              </div>
            </article>

            <article className="border border-zinc-200 bg-white p-6">
              <h3 className="text-xl font-semibold">
                JD-简历匹配与学习规划系统
              </h3>
              <p className="mt-3 text-zinc-600">
                输入岗位 JD 和简历内容，自动分析匹配度、技能差距，并生成个性化学习计划。
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                <Link
                  className="font-medium text-blue-600"
                  href="/demos/jd-resume-analyzer"
                >
                  本地 Demo
                </Link>
                <a
                  className="font-medium text-blue-600"
                  href={`${githubUrl}/jd-resume-analyzer`}
                  target="_blank"
                >
                  GitHub
                </a>
                <Link
                  className="font-medium text-blue-600"
                  href="/projects/jd-resume-analyzer"
                >
                  查看详情
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-bold">关于我</h2>
        <p className="mt-4 max-w-2xl leading-7 text-zinc-600">
          计算机科学背景，关注大模型应用开发、Agent 工作流、知识库问答和 AI Coding。这个网站会持续记录我的项目、文章和技术实验。
        </p>
      </section>

      <footer className="border-t border-zinc-200">
        <div className="mx-auto flex max-w-6xl justify-between px-6 py-6 text-sm text-zinc-500">
          <span>Yunhao AI Lab</span>
          <span>Updated 2026</span>
        </div>
      </footer>
    </main>
  );
}
