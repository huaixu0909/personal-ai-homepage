import Link from "next/link";
import ParticleField from "./components/ParticleField";

const githubUrl = "https://github.com/huaixu0909";

const projects = [
  {
    id: "01",
    name: "RAG Agent System",
    cnName: "企业知识库 RAG Agent",
    status: "v1.8 / Knowledge Overview",
    description:
      "支持文档上传、chunking、向量检索、知识库概览问答和 DeepSeek RAG 回答的本地知识库系统。",
    stack: ["FastAPI", "RAG", "Chroma", "LangGraph"],
    demoHref: "/demos/rag-agent",
    detailHref: "/projects/rag-agent",
    githubHref: `${githubUrl}/rag-agent-system`,
    accent: "bg-cyan-300",
  },
  {
    id: "02",
    name: "Multi-Agent Data Factory",
    cnName: "多 Agent 数据合成平台",
    status: "v1.5 / Batch Queue",
    description:
      "通过条件路由调度独立 Agent 节点生成中文对话，并支持长期记忆、批量任务队列、数据搜索、分页、JSONL 导出和 Persona 演化。",
    stack: ["FastAPI", "DeepSeek", "Scenario", "SQLite"],
    demoHref: "/demos/multi-agent-data-factory",
    detailHref: "/projects/multi-agent-data-factory",
    githubHref: `${githubUrl}/multi-agent-data-factory`,
    accent: "bg-lime-300",
  },
];

const labSignals = [
  ["Homepage", "localhost:3000", "ONLINE"],
  ["RAG Agent", "localhost:8000", "DEEPSEEK"],
  ["Data Factory", "localhost:8001", "AGENTS"],
];

const telemetry = [
  ["RAG", "Retrieval chain active"],
  ["LLM", "DeepSeek response mode"],
  ["UI", "Future lab interface"],
  ["DATA", "Local documents isolated"],
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#05070b] text-zinc-100">
      <ParticleField />
      <div className="pointer-events-none fixed inset-0 opacity-40 [background-image:linear-gradient(rgba(103,232,249,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.12)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="pointer-events-none fixed inset-0 [background-image:radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_78%_12%,rgba(163,230,53,0.12),transparent_28%),linear-gradient(180deg,transparent,rgba(5,7,11,0.92))]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-1 bg-cyan-300" />

      <header className="sticky top-0 z-30 border-b border-cyan-300/20 bg-[#05070b]/86 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100">
            曾见云霞满天 AI Lab
          </Link>
          <div className="flex items-center gap-5 text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">
            <a className="transition hover:text-cyan-200" href="#projects">
              Projects
            </a>
            <a className="transition hover:text-cyan-200" href="#about">
              About
            </a>
            <a className="transition hover:text-cyan-200" href={githubUrl} target="_blank">
              GitHub
            </a>
          </div>
        </nav>
      </header>

      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-65px)] max-w-7xl gap-8 px-5 py-8 pt-14 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="pb-2 lg:-translate-y-6">
          <div className="inline-flex border border-cyan-300/40 bg-cyan-300/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100">
            AI Application Lab / RAG Builder / Agent Systems
          </div>

          <h1 className="font-display mt-7 max-w-4xl text-4xl font-black leading-[1.02] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl [text-shadow:0_0_26px_rgba(103,232,249,0.2)]">
            <span className="block bg-gradient-to-r from-white via-cyan-100 to-zinc-300 bg-clip-text text-transparent">
              曾见云霞满天的
            </span>
            <span className="mt-2 block bg-gradient-to-r from-cyan-200 via-white to-lime-200 bg-clip-text text-transparent">
              AI 工程实验室
            </span>
          </h1>

          <p className="mt-8 max-w-2xl border-l border-cyan-300/50 pl-5 text-base leading-8 text-zinc-300 sm:text-lg">
            一个面向 LLM、RAG、Agent 和 AI 工程化的可运行作品空间。这里不只展示项目，也展示接口、本地服务、检索链路和可以被追问的系统细节。
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#projects"
              className="border border-cyan-300 bg-cyan-300 px-5 py-3 text-sm font-black text-zinc-950 transition hover:bg-white"
            >
              进入项目舱
            </a>
            <Link
              href="/demos/rag-agent"
              className="border border-zinc-500 bg-white/5 px-5 py-3 text-sm font-semibold text-zinc-100 transition hover:border-lime-300 hover:text-lime-200"
            >
              打开 RAG 控制台
            </Link>
          </div>

          <div className="mt-10 grid max-w-2xl grid-cols-2 border border-cyan-300/20 bg-black/30 sm:grid-cols-4">
            {telemetry.map(([label, text]) => (
              <div key={label} className="border-r border-cyan-300/20 p-4 last:border-r-0">
                <p className="text-lg font-black text-cyan-200">{label}</p>
                <p className="mt-2 text-xs leading-5 text-zinc-500">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-5 -top-5 h-24 w-24 border-l border-t border-cyan-300/60" />
          <div className="absolute -bottom-5 -right-5 h-24 w-24 border-b border-r border-lime-300/60" />

          <div className="border border-cyan-300/40 bg-[#08111b]/88 p-5 shadow-[0_0_50px_rgba(34,211,238,0.12)]">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-lime-300">
                  Local Lab Status
                </p>
                <h2 className="mt-4 text-3xl font-black text-white">三服务联调工作台</h2>
              </div>
              <span className="rounded-full border border-lime-300 px-3 py-1 text-xs font-bold text-lime-300">
                LIVE
              </span>
            </div>

            <div className="mt-8 border border-cyan-300/20">
              {labSignals.map(([name, url, tag]) => (
                <div key={name} className="flex items-center justify-between border-b border-cyan-300/10 p-4 last:border-b-0">
                  <div>
                    <p className="font-bold text-zinc-100">{name}</p>
                    <p className="mt-1 text-sm text-zinc-500">{url}</p>
                  </div>
                  <span className="rounded-full bg-cyan-300 px-3 py-1 text-xs font-black text-zinc-950">
                    {tag}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 border border-cyan-300/15">
              {["RAG", "AGENT", "LLM"].map((item) => (
                <div key={item} className="border-r border-cyan-300/15 p-4 last:border-r-0">
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Focus</p>
                  <p className="mt-6 text-2xl font-black text-white">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="relative z-10 border-y border-cyan-300/20 bg-[#071017]/80">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime-300">
                Projects
              </p>
              <h2 className="font-display mt-3 text-3xl font-black text-white sm:text-5xl">
                可运行的 AI 工程样本
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-zinc-400">
              每个项目都尽量保留真实工程形态：后端接口、前端 Demo、本地数据、模型调用和可以逐步演进的技术路线。
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {projects.map((project) => (
              <article
                key={project.id}
                className="group border border-cyan-300/20 bg-black/28 p-6 transition hover:border-cyan-300/55 hover:bg-cyan-300/[0.05]"
              >
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-sm font-black text-zinc-500">{project.id}</p>
                    <h3 className="mt-4 font-display text-2xl font-black text-white">{project.name}</h3>
                    <p className="mt-1 text-lg font-bold text-cyan-100">{project.cnName}</p>
                  </div>
                  <span className={`${project.accent} px-3 py-1 text-xs font-black text-zinc-950`}>
                    {project.status}
                  </span>
                </div>

                <p className="mt-5 min-h-20 text-sm leading-7 text-zinc-400">{project.description}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {project.stack.map((item) => (
                    <span key={item} className="border border-white/15 px-3 py-1 text-xs font-semibold text-zinc-300">
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={project.demoHref}
                    className="bg-cyan-300 px-4 py-2 text-sm font-black text-zinc-950 transition hover:bg-white"
                  >
                    本地 Demo
                  </Link>
                  <Link
                    href={project.detailHref}
                    className="border border-zinc-600 px-4 py-2 text-sm font-semibold text-zinc-100 transition hover:border-lime-300 hover:text-lime-200"
                  >
                    项目详情
                  </Link>
                  <a
                    href={project.githubHref}
                    target="_blank"
                    className="border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-400 transition hover:border-zinc-300 hover:text-white"
                  >
                    GitHub
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="relative z-10 mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200">About</p>
            <h2 className="font-display mt-3 text-3xl font-black text-white">从 Demo 到工程闭环</h2>
          </div>
          <p className="text-base leading-8 text-zinc-400">
            这个站点会随着项目一起演进：RAG 项目负责知识库问答与检索质量，Multi-Agent Data Factory 负责数据合成与质量评估。目标不是堆砌概念，而是把每一步能力做成可以运行、可以联调、可以复盘的工程切片。
          </p>
        </div>
      </section>
    </main>
  );
}
