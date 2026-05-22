"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ParticleField from "../../components/ParticleField";

type AgentRole = "Developer" | "Reviewer" | "Challenger" | "Judge";

type Persona = {
  agent_id: string;
  role: AgentRole;
  personality: string;
  style: string;
  focus: string;
  goal: string;
  tolerance: string;
};

type Message = {
  turn: number;
  agent_id: string;
  role: AgentRole;
  content: string;
};

type QualityScores = {
  realism: number;
  difficulty: number;
  diversity: number;
  consistency: number;
  conflict: number;
  training_value: number;
  safety: number;
  final_score: number;
};

type ConversationRecord = {
  conversation_id: string;
  task_type: "code_review";
  scenario: string;
  language: string;
  code_diff: string;
  review_focus: string[];
  agents: Persona[];
  messages: Message[];
  scores: QualityScores;
  accepted: boolean;
  generation_mode: string;
  llm_provider?: string | null;
  llm_model?: string | null;
  llm_error?: string | null;
  scoring_mode: string;
  scoring_provider?: string | null;
  scoring_model?: string | null;
  scoring_error?: string | null;
  score_feedback: string[];
  created_at: string;
};

const apiBaseUrl = "http://localhost:8001";

const sampleDiff = `+ query = f"SELECT * FROM users WHERE id = {user_id}"
+ cursor.execute(query)
+ print(user)
+ return {"user": user}`;

const scoreLabels: Array<[keyof QualityScores, string]> = [
  ["realism", "真实感"],
  ["difficulty", "难度"],
  ["diversity", "多样性"],
  ["consistency", "一致性"],
  ["conflict", "冲突强度"],
  ["training_value", "训练价值"],
  ["safety", "安全性"],
];

export default function MultiAgentDataFactoryDemoPage() {
  const [codeDiff, setCodeDiff] = useState(sampleDiff);
  const [language, setLanguage] = useState("python");
  const [reviewFocus, setReviewFocus] = useState("security, performance, testing");
  const [maxTurns, setMaxTurns] = useState(8);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [conversation, setConversation] = useState<ConversationRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const runSimulation = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/simulations/code-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          code_diff: codeDiff,
          review_focus: reviewFocus
            .split(/[,，]/)
            .map((item) => item.trim())
            .filter(Boolean),
          max_turns: maxTurns,
        }),
      });

      if (!response.ok) throw new Error(`Simulation failed: ${response.status}`);
      setConversation((await response.json()) as ConversationRecord);
      setApiOnline(true);
    } catch (simulationError) {
      setApiOnline(false);
      setError(
        simulationError instanceof Error
          ? simulationError.message
          : "无法连接 Multi-Agent Data Factory 后端。",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="lab-demo-theme min-h-screen overflow-hidden bg-[#05070b] text-zinc-100">
      <ParticleField />
      <div className="pointer-events-none fixed inset-0 z-0 opacity-40 [background-image:linear-gradient(rgba(103,232,249,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.12)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="pointer-events-none fixed inset-0 z-0 [background-image:radial-gradient(circle_at_30%_20%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_78%_12%,rgba(163,230,53,0.12),transparent_28%),linear-gradient(180deg,transparent,rgba(5,7,11,0.92))]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-1 bg-cyan-300" />

      <header className="sticky top-0 z-30 border-b border-cyan-300/20 bg-[#05070b]/86 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.22em]">
            曾见云霞满天 AI Lab
          </Link>
          <div className="flex gap-5 text-xs font-medium uppercase tracking-[0.16em] text-zinc-600">
            <Link href="/#projects">Projects</Link>
            <Link href="/projects/multi-agent-data-factory">Detail</Link>
            <a href="https://github.com/huaixu0909/multi-agent-data-factory" target="_blank">
              GitHub
            </a>
          </div>
        </nav>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-8">
        <div className="grid gap-5 border-b border-zinc-950 pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
              Synthetic Data Factory / Multi-Agent / Code Review
            </p>
            <h1 className="font-display mt-4 text-4xl font-black sm:text-6xl">
              多 Agent 数据生产控制台
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-700">
              输入代码 diff，系统会优先调用 DeepSeek 生成中文 Developer、Reviewer、Challenger、Judge
              多 Agent 审查讨论；未配置 API 时自动回退到本地中文 mock。
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
            {conversation ? (
              <div className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">
                {conversation.generation_mode === "llm" ? "LLM" : "MOCK"}{" "}
                {conversation.llm_provider ? `/ ${conversation.llm_provider}` : ""}
                {conversation.llm_model ? ` / ${conversation.llm_model}` : ""}
                <br />
                SCORE / {conversation.scoring_mode === "llm_judge" ? "LLM JUDGE" : "HEURISTIC"}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="border border-zinc-950 bg-white p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                  Generator
                </p>
                <h2 className="mt-2 font-black">Code Review 任务</h2>
              </div>
              <button
                type="button"
                onClick={() => setCodeDiff(sampleDiff)}
                className="text-sm font-bold text-blue-700"
              >
                示例
              </button>
            </div>

            <label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
              Language
              <input
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="mt-2 w-full border border-zinc-950 bg-black p-3 text-sm"
              />
            </label>

            <label className="mt-4 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
              Review Focus
              <input
                value={reviewFocus}
                onChange={(event) => setReviewFocus(event.target.value)}
                className="mt-2 w-full border border-zinc-950 bg-black p-3 text-sm"
              />
            </label>

            <label className="mt-4 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
              Max Turns: {maxTurns}
              <input
                type="range"
                min={6}
                max={12}
                value={maxTurns}
                onChange={(event) => setMaxTurns(Number(event.target.value))}
                className="mt-3 w-full"
              />
            </label>

            <textarea
              value={codeDiff}
              onChange={(event) => setCodeDiff(event.target.value)}
              className="mt-5 min-h-64 w-full resize-none border border-zinc-950 bg-black p-4 font-code text-sm leading-6 text-white outline-none focus:border-lime-300"
            />

            <button
              type="button"
              onClick={runSimulation}
              disabled={loading || codeDiff.trim().length === 0}
              className="mt-4 bg-lime-300 px-5 py-3 text-sm font-black text-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-500"
            >
              {loading ? "生成中..." : "生成多 Agent 对话"}
            </button>

            {error ? <p className="mt-4 border border-red-400 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          </section>

          <div className="space-y-5">
            <section className="border border-zinc-950 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                    Quality Scorer
                  </p>
                  <h2 className="mt-2 font-black">数据质量评分</h2>
                </div>
                {conversation ? (
                  <span className="border border-lime-500 bg-lime-100 px-3 py-1 text-xs font-black text-zinc-950">
                    {conversation.accepted ? "ACCEPTED" : "REJECTED"} / {conversation.scores.final_score.toFixed(2)}
                  </span>
                ) : null}
              </div>

              {conversation ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="border border-zinc-950/20 bg-[#f6f3ec] p-3 sm:col-span-2">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.12em] text-zinc-500">
                      <span>Generation Mode</span>
                      <span>
                        {conversation.generation_mode === "llm" ? "真实 LLM" : "本地 Mock"}
                        {conversation.llm_provider ? ` / ${conversation.llm_provider}` : ""}
                        {conversation.llm_model ? ` / ${conversation.llm_model}` : ""}
                      </span>
                    </div>
                    {conversation.llm_error ? (
                      <p className="mt-2 text-xs leading-5 text-amber-700">
                        LLM 回退原因：{conversation.llm_error}
                      </p>
                    ) : null}
                  </div>
                  <div className="border border-zinc-950/20 bg-[#f6f3ec] p-3 sm:col-span-2">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.12em] text-zinc-500">
                      <span>Scoring Mode</span>
                      <span>
                        {conversation.scoring_mode === "llm_judge" ? "LLM-as-a-Judge" : "规则评分"}
                        {conversation.scoring_provider ? ` / ${conversation.scoring_provider}` : ""}
                        {conversation.scoring_model ? ` / ${conversation.scoring_model}` : ""}
                      </span>
                    </div>
                    {conversation.scoring_error ? (
                      <p className="mt-2 text-xs leading-5 text-amber-700">
                        评分回退原因：{conversation.scoring_error}
                      </p>
                    ) : null}
                    {conversation.score_feedback.length > 0 ? (
                      <ul className="mt-3 space-y-1 text-xs leading-5 text-zinc-700">
                        {conversation.score_feedback.map((item, index) => (
                          <li key={`${index}-${item}`}>· {item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  {scoreLabels.map(([key, label]) => (
                    <div key={key} className="border border-zinc-950/20 bg-[#f6f3ec] p-3">
                      <div className="flex justify-between text-xs font-black uppercase tracking-[0.12em] text-zinc-500">
                        <span>{label}</span>
                        <span>{conversation.scores[key].toFixed(1)}</span>
                      </div>
                      <div className="mt-3 h-2 border border-zinc-950 bg-black">
                        <div
                          className="h-full bg-blue-600"
                          style={{ width: `${conversation.scores[key] * 10}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 border border-dashed border-zinc-500 p-8 text-sm text-zinc-500">
                  生成后这里会展示 realism、difficulty、conflict、training value 等质量评分。
                </div>
              )}
            </section>

            <section className="border border-zinc-950 bg-white p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
                Agent Conversation
              </p>
              <h2 className="mt-2 font-black">模拟对话</h2>

              {conversation ? (
                <div className="mt-4 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {conversation.agents.map((agent) => (
                      <span key={agent.agent_id} className="border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-blue-700">
                        {agent.role} / {agent.personality}
                      </span>
                    ))}
                  </div>
                  {conversation.messages.map((message) => (
                    <article key={message.turn} className="border border-zinc-950/20 bg-[#f6f3ec] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-bold">
                          {String(message.turn).padStart(2, "0")} / {message.role}
                        </h3>
                        <span className="text-xs font-bold text-zinc-500">{message.agent_id}</span>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-zinc-700">{message.content}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-4 border border-dashed border-zinc-500 p-8 text-sm text-zinc-500">
                  暂无模拟结果。输入 diff 后点击生成。
                </div>
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
