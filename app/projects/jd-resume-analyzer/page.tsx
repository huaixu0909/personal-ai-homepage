import Link from "next/link";

const githubUrl = "https://github.com/huaixu0909/jd-resume-analyzer";

export default function JdResumeAnalyzerProjectPage() {
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
        <p className="mb-4 text-sm font-medium text-blue-600">Project 02</p>
        <h1 className="font-display max-w-3xl text-4xl font-bold">
          JD-简历匹配与学习规划系统
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-zinc-600">
          一个面向求职准备场景的 AI 分析工具，输入岗位 JD 和简历内容后，输出匹配度、能力差距、简历优化建议和阶段性学习计划。
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/demos/jd-resume-analyzer"
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
              <li>JD 输入：支持粘贴岗位描述文本。</li>
              <li>简历输入：支持粘贴简历文本，后续扩展 PDF 解析。</li>
              <li>匹配度分析：输出总分和分项评分。</li>
              <li>差距分析：识别缺失技能和表达不足。</li>
              <li>学习计划：生成 2 到 6 周补强路线。</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold">技术栈</h2>
            <ul className="mt-5 space-y-3 text-zinc-600">
              <li>Backend：FastAPI、Pydantic</li>
              <li>LLM：DeepSeek、Qwen 或 OpenAI</li>
              <li>Output：JSON Schema 结构化输出</li>
              <li>Parser：pdfplumber 或 pypdf</li>
              <li>Database：PostgreSQL</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="text-2xl font-bold">当前开发状态</h2>
        <p className="mt-4 max-w-3xl leading-7 text-zinc-600">
          当前已经完成 FastAPI 最小原型和前端 Demo 页联调。下一步会接入真实 LLM API、结构化 Prompt 和简历 PDF 解析。
        </p>

        <h2 className="mt-10 text-2xl font-bold">后续计划</h2>
        <p className="mt-4 max-w-3xl leading-7 text-zinc-600">
          在 MVP 可用后，继续加入 PDF 简历解析、历史分析记录、多 JD 对比和可下载的优化建议报告。
        </p>
      </section>
    </main>
  );
}
