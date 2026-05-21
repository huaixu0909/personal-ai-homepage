"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ParticleField from "../../components/ParticleField";

type SkillGap = {
  skill: string;
  status: "matched" | "missing" | "weak";
  suggestion: string;
};

type LearningTask = {
  week: number;
  goal: string;
  tasks: string[];
  output: string;
};

type AnalyzeResponse = {
  match_score: number;
  summary: string;
  strengths: string[];
  gaps: SkillGap[];
  resume_suggestions: string[];
  learning_plan: LearningTask[];
  mode: "mock";
};

const apiBaseUrl = "http://localhost:8001";
const sampleJd =
  "需要熟悉 Python、FastAPI、RAG、Agent 开发，了解 Docker 和 PostgreSQL，有大模型应用项目经验。";
const sampleResume =
  "我会 Python，做过 FastAPI 项目，正在学习 RAG，完成了个人 AI Lab 首页和本地后端 Demo。";

export default function JdResumeAnalyzerDemoPage() {
  const [jobDescription, setJobDescription] = useState(sampleJd);
  const [resumeText, setResumeText] = useState(sampleResume);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/health`);
        setApiOnline(response.ok);
      } catch {
        setApiOnline(false);
      }
    };

    checkHealth();
  }, []);

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setLatency(null);

    const startedAt = performance.now();

    try {
      const response = await fetch(`${apiBaseUrl}/api/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_description: jobDescription,
          resume_text: resumeText,
        }),
      });

      if (!response.ok) {
        throw new Error(`API 请求失败：${response.status}`);
      }

      const data = (await response.json()) as AnalyzeResponse;
      setResult(data);
      setApiOnline(true);
      setLatency(Math.round(performance.now() - startedAt));
    } catch {
      setApiOnline(false);
      setError("无法连接 JD 分析后端，请确认 http://localhost:8001 已启动。");
    } finally {
      setLoading(false);
    }
  };

  const fillSample = () => {
    setJobDescription(sampleJd);
    setResumeText(sampleResume);
  };

  return (
    <main className="lab-demo-theme min-h-screen overflow-hidden bg-[#05070b] text-zinc-100">
      <ParticleField />
      <div className="pointer-events-none fixed inset-0 z-0 opacity-40 [background-image:linear-gradient(rgba(103,232,249,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.12)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="pointer-events-none fixed inset-0 z-0 [background-image:radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_78%_12%,rgba(163,230,53,0.12),transparent_28%),linear-gradient(180deg,transparent,rgba(5,7,11,0.92))]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-1 bg-cyan-300" />

      <header className="relative z-30 border-b border-cyan-300/20 bg-[#05070b]/86 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold">
            曾见云霞满天 AI Lab
          </Link>
          <div className="flex gap-5 text-sm text-zinc-600">
            <Link href="/#projects">Projects</Link>
            <Link href="/projects/jd-resume-analyzer">详情页</Link>
            <a href="https://github.com/huaixu0909/jd-resume-analyzer" target="_blank">
              GitHub
            </a>
          </div>
        </nav>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-blue-600">JD Resume Demo</p>
            <h1 className="font-display mt-3 text-3xl font-bold">
              JD-简历匹配分析工作台
            </h1>
            <p className="mt-3 max-w-2xl text-zinc-600">
              当前连接本地 FastAPI mock 分析接口，后续会替换为真实 LLM 结构化分析和 PDF 简历解析。
            </p>
          </div>

          <div className="border border-zinc-200 bg-white px-4 py-3 text-sm">
            <span className="text-zinc-500">API 状态：</span>
            <span
              className={
                apiOnline
                  ? "font-medium text-emerald-700"
                  : apiOnline === false
                    ? "font-medium text-red-700"
                    : "font-medium text-zinc-500"
              }
            >
              {apiOnline ? "Online" : apiOnline === false ? "Offline" : "Checking"}
            </span>
            {latency !== null ? (
              <span className="ml-3 text-zinc-500">{latency}ms</span>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="border border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">输入材料</h2>
              <button
                type="button"
                onClick={fillSample}
                className="text-sm font-medium text-blue-600"
              >
                填充示例
              </button>
            </div>

            <label className="mt-4 block text-sm font-medium text-zinc-600">
              岗位 JD
            </label>
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              className="mt-2 min-h-36 w-full resize-none border border-zinc-300 p-4 text-sm leading-6 outline-none focus:border-zinc-950"
            />

            <label className="mt-4 block text-sm font-medium text-zinc-600">
              简历文本
            </label>
            <textarea
              value={resumeText}
              onChange={(event) => setResumeText(event.target.value)}
              className="mt-2 min-h-36 w-full resize-none border border-zinc-300 p-4 text-sm leading-6 outline-none focus:border-zinc-950"
            />

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={
                  loading ||
                  jobDescription.trim().length === 0 ||
                  resumeText.trim().length === 0
                }
                className="rounded-md bg-zinc-950 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {loading ? "分析中..." : "开始分析"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setJobDescription("");
                  setResumeText("");
                  setResult(null);
                  setError("");
                  setLatency(null);
                }}
                className="rounded-md border border-zinc-300 px-5 py-3 text-sm font-medium"
              >
                清空
              </button>
            </div>

            {error ? (
              <p className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}
          </section>

          <section className="border border-zinc-200 bg-white p-5">
            <h2 className="font-semibold">分析结果</h2>

            {result ? (
              <div className="mt-4 space-y-6">
                <div>
                  <div className="flex items-end justify-between">
                    <p className="text-sm font-medium text-zinc-500">Match Score</p>
                    <span className="text-3xl font-bold">{result.match_score}</span>
                  </div>
                  <div className="mt-3 h-2 bg-zinc-100">
                    <div
                      className="h-2 bg-blue-600"
                      style={{ width: `${result.match_score}%` }}
                    />
                  </div>
                </div>

                <p className="leading-7 text-zinc-700">{result.summary}</p>

                <div>
                  <p className="text-sm font-medium text-zinc-500">优势</p>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                    {result.strengths.map((item) => (
                      <li key={item} className="border-l-2 border-emerald-500 pl-3">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-medium text-zinc-500">技能差距</p>
                  <div className="mt-3 grid gap-3">
                    {result.gaps.map((gap) => (
                      <article
                        key={`${gap.skill}-${gap.status}`}
                        className="border border-zinc-200 bg-zinc-50 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-medium">{gap.skill}</h3>
                          <span className="text-xs uppercase tracking-wide text-zinc-500">
                            {gap.status}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-zinc-600">
                          {gap.suggestion}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-zinc-500">简历建议</p>
                  <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                    {result.resume_suggestions.map((item) => (
                      <li key={item} className="border-l-2 border-blue-500 pl-3">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-medium text-zinc-500">学习计划</p>
                  <div className="mt-3 grid gap-3">
                    {result.learning_plan.map((task) => (
                      <article
                        key={task.week}
                        className="border border-zinc-200 bg-zinc-50 p-4"
                      >
                        <h3 className="font-medium">
                          第 {task.week} 周：{task.goal}
                        </h3>
                        <ul className="mt-2 space-y-1 text-sm text-zinc-600">
                          {task.tasks.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                        <p className="mt-3 text-sm font-medium text-zinc-700">
                          产出：{task.output}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>

                <p className="text-xs uppercase tracking-wide text-zinc-400">
                  Mode: {result.mode}
                </p>
              </div>
            ) : (
              <div className="mt-4 border border-dashed border-zinc-300 p-8 text-sm text-zinc-500">
                提交 JD 和简历文本后，这里会展示匹配分数、技能差距和学习计划。
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
