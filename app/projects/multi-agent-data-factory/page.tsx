import Link from "next/link";

const githubUrl = "https://github.com/huaixu0909/multi-agent-data-factory";

export default function MultiAgentDataFactoryProjectPage() {
  return (
    <main className="project-detail-theme min-h-screen overflow-hidden bg-[#10151d] text-zinc-100">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-22 [background-image:linear-gradient(rgba(236,214,167,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(236,214,167,0.1)_1px,transparent_1px)] [background-size:80px_80px]" />
      <div className="pointer-events-none fixed inset-0 z-0 [background-image:radial-gradient(circle_at_18%_10%,rgba(236,214,167,0.12),transparent_30%),radial-gradient(circle_at_88%_12%,rgba(94,132,160,0.16),transparent_28%),linear-gradient(180deg,rgba(16,21,29,0.12),rgba(16,21,29,0.96))]" />

      <header className="relative z-10 border-b border-[#ecd6a7]/20 bg-[#10151d]/88 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold">
            曾见云霞满天 AI Lab
          </Link>
          <div className="flex gap-5 text-sm text-zinc-600">
            <Link href="/#projects">Projects</Link>
            <Link href="/demos/multi-agent-data-factory">Demo</Link>
            <a href={githubUrl} target="_blank">
              GitHub
            </a>
          </div>
        </nav>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <p className="mb-4 text-sm font-medium text-blue-600">Project 02</p>
        <h1 className="font-display max-w-4xl text-4xl font-bold">
          Multi-Agent Synthetic Data Factory
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600">
          一个面向 AI 训练数据生产的多 Agent 社会模拟系统。当前版本支持 Code Review、
          客服投诉和技术面试三个场景，通过多角色制造真实冲突，并优先调用 DeepSeek 生成中文训练对话，
          再通过规则评分与 LLM-as-a-Judge 判断数据质量。
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/demos/multi-agent-data-factory"
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

      <section className="relative z-10 border-t border-[#ecd6a7]/18 bg-[#17202b]/78">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">MVP 功能</h2>
            <ul className="mt-5 space-y-3 text-zinc-600">
              <li>输入代码 diff 和 review focus。</li>
              <li>自动生成四类 Agent Persona。</li>
              <li>优先调用 DeepSeek 生成中文多轮代码审查讨论。</li>
              <li>支持客服投诉场景：用户投诉、情绪升级、客服安抚、合规审核。</li>
              <li>支持技术面试场景：面试官提问、候选人回答、追问和能力评分。</li>
              <li>前端控制台支持中文角色、模板切换、历史记录、导出和复制 JSON。</li>
              <li>未配置 API key 时自动回退到本地中文 mock。</li>
              <li>自动计算 realism、difficulty、conflict、training value 等评分。</li>
              <li>支持 LLM-as-a-Judge 输出中文质量评语。</li>
              <li>保存 conversation 到 SQLite。</li>
              <li>支持 JSONL 数据集导出。</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold">技术栈</h2>
            <ul className="mt-5 space-y-3 text-zinc-600">
              <li>FastAPI + Pydantic API 层。</li>
              <li>SQLite 本地 conversation storage。</li>
              <li>DeepSeek / OpenAI-compatible Chat Completions。</li>
              <li>Scenario 架构下的 Agent Simulator 与 Quality Scorer。</li>
              <li>Next.js Demo 控制台。</li>
              <li>后续接入 LangGraph、LangChain 和 LLM-as-a-Judge。</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-14">
        <h2 className="text-2xl font-bold">当前开发状态</h2>
        <p className="mt-4 max-w-3xl leading-7 text-zinc-600">
          当前版本是 v0.7，本质是一条可运行的多场景数据生产闭环：输入场景素材，
          由 Scenario 识别问题线索，优先调用 DeepSeek 生成中文多 Agent 对话，随后由质量评分器计算分数、
          保存并导出数据。它还不是完整平台，但已经具备 Synthetic Data Factory 的核心工程路径。
        </p>

        <h2 className="mt-10 text-2xl font-bold">后续计划</h2>
        <p className="mt-4 max-w-3xl leading-7 text-zinc-600">
          下一步会加入 LangGraph 工作流、Persona Generator、LLM-as-a-Judge、
          数据筛选与进化机制，让系统从规则模拟升级为真正的 AI Native 数据工厂。
        </p>
      </section>
    </main>
  );
}
