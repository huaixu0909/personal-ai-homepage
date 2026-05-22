import Link from "next/link";

const githubUrl = "https://github.com/huaixu0909/multi-agent-data-factory";

export default function MultiAgentDataFactoryProjectPage() {
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
            <Link href="/#projects">Projects</Link>
            <Link href="/demos/multi-agent-data-factory">Demo</Link>
            <a href={githubUrl} target="_blank">
              GitHub
            </a>
          </div>
        </nav>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <p className="mb-4 text-sm font-medium text-[#ecd6a7]">Project 02 / v1.1</p>
        <h1 className="font-display max-w-4xl text-4xl font-bold">
          Multi-Agent Synthetic Data Factory
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-300">
          一个面向 AI 训练数据生产的多 Agent 社会模拟系统。当前版本支持 Code Review、客服投诉和技术面试三个场景，
          通过多角色制造真实冲突，优先调用 DeepSeek 生成中文训练对话，再通过规则评分或 LLM-as-a-Judge 判断数据质量。
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/demos/multi-agent-data-factory"
            className="rounded-xl bg-zinc-100 px-5 py-3 text-sm font-medium text-zinc-950"
          >
            打开本地 Demo
          </Link>
          <a
            href={githubUrl}
            target="_blank"
            className="rounded-xl border border-zinc-500 px-5 py-3 text-sm font-medium text-zinc-100"
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
              <li>支持 Code Review、客服投诉、技术面试三类数据合成场景。</li>
              <li>每个场景都有独立输入结构、Agent Persona 和中文对话生成逻辑。</li>
              <li>优先调用 DeepSeek 生成真实 LLM 对话，失败时回退本地中文 mock。</li>
              <li>支持规则评分和 LLM-as-a-Judge，返回多维度质量评分与中文评语。</li>
              <li>conversation 保存到 SQLite，形成可复用的数据沉淀。</li>
              <li>v0.8 新增数据集搜索、场景筛选、通过状态筛选、最低分筛选和分页。</li>
              <li>v0.9 新增 Persona 池，记录使用次数、平均分、权重和最近记忆。</li>
              <li>v1.0 接入 LangGraph StateGraph，显式记录生成节点和评分节点。</li>
              <li>v1.1 将角色升级为独立 Agent 节点，每个节点只生成自己当前轮的一条发言。</li>
              <li>支持按当前筛选条件导出 JSONL 训练数据。</li>
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold">技术栈</h2>
            <ul className="mt-5 space-y-3 text-zinc-300">
              <li>FastAPI + Pydantic API 层。</li>
              <li>SQLite 本地 conversation storage。</li>
              <li>DeepSeek / OpenAI-compatible Chat Completions。</li>
              <li>Scenario 架构下的 Agent Simulator 与 Quality Scorer。</li>
              <li>Next.js 多场景 Demo 控制台。</li>
              <li>后续强化条件路由、Persona Generator 和数据集版本管理。</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-14">
        <h2 className="text-2xl font-bold">当前开发状态</h2>
        <p className="mt-4 max-w-3xl leading-7 text-zinc-300">
          当前版本是 v1.1，本质是一条可运行的多场景数据生产闭环：输入场景素材，由 Scenario 识别问题线索，
          从 Persona 池选择角色，优先调用 DeepSeek 生成中文多 Agent 对话，随后由质量评分器计算分数、保存到 SQLite，
          并回写 Persona 的历史表现、权重和记忆。生成过程已由 LangGraph StateGraph 编排，角色已经升级为独立 Agent 节点，
          接口会返回 workflow_engine、workflow_steps 和 agent_trace。
        </p>

        <h2 className="mt-10 text-2xl font-bold">后续计划</h2>
        <p className="mt-4 max-w-3xl leading-7 text-zinc-300">
          下一步可以加入条件路由、Persona Generator、Prompt 模板管理和数据集版本管理，
          让系统从可运行 Demo 继续升级为更完整的 AI Native 数据工厂。
        </p>
      </section>
    </main>
  );
}
