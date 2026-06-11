"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import ParticleField from "../../components/ParticleField";
import { yunxiaAgentApiBaseUrl } from "../../config/api";

type HealthResponse = {
  status: string;
  agents?: Record<
    string,
    {
      total: number;
      success_rate: number;
      avg_ms: number;
      monitor_penalty: number;
      routing_score: number;
    }
  >;
};

type KnowledgeStatsResponse = {
  total_chunks: number;
};

type ChatResponse = {
  conv_id: string;
  response: string;
  intent: string;
  agent_type: string;
  escalated: boolean;
  latency_ms: number;
  knowledge_used: boolean;
};

const sampleMessages = [
  "我的订单显示已发货，但物流三天没有更新，应该怎么处理？",
  "应用登录一直报 401 错误，我该怎么排查？",
  "为什么这个月多扣了 50 元？",
];

export default function YunxiaAgentProductPage() {
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [knowledgeStats, setKnowledgeStats] = useState<KnowledgeStatsResponse | null>(null);
  const [message, setMessage] = useState(sampleMessages[0]);
  const [userId, setUserId] = useState("demo-user");
  const [convId, setConvId] = useState("");
  const [chatResult, setChatResult] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadStatus();
  }, []);

  async function loadStatus() {
    try {
      const [healthResponse, statsResponse] = await Promise.all([
        fetch(`${yunxiaAgentApiBaseUrl}/health`, { cache: "no-store" }),
        fetch(`${yunxiaAgentApiBaseUrl}/knowledge/stats`, { cache: "no-store" }),
      ]);
      setApiOnline(healthResponse.ok);
      if (healthResponse.ok) {
        setHealth((await healthResponse.json()) as HealthResponse);
      }
      if (statsResponse.ok) {
        setKnowledgeStats((await statsResponse.json()) as KnowledgeStatsResponse);
      }
    } catch {
      setApiOnline(false);
      setHealth(null);
      setKnowledgeStats(null);
    }
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${yunxiaAgentApiBaseUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          user_id: userId.trim() || "demo-user",
          conv_id: convId.trim() || undefined,
        }),
      });
      if (!response.ok) throw new Error(`Chat failed: ${response.status}`);
      const data = (await response.json()) as ChatResponse;
      setChatResult(data);
      setConvId(data.conv_id);
      setApiOnline(true);
      await loadStatus();
    } catch (chatError) {
      setApiOnline(false);
      setError(chatError instanceof Error ? chatError.message : "无法连接 Yunxia Agent 后端。");
    } finally {
      setLoading(false);
    }
  }

  const agentRows = Object.entries(health?.agents ?? {});

  return (
    <main className="min-h-screen overflow-hidden bg-[#05070b] text-zinc-100">
      <ParticleField />
      <div className="pointer-events-none fixed inset-0 opacity-35 [background-image:linear-gradient(rgba(103,232,249,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.12)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="pointer-events-none fixed inset-0 [background-image:radial-gradient(circle_at_18%_12%,rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(132,204,22,0.12),transparent_28%),linear-gradient(180deg,transparent,rgba(5,7,11,0.94))]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-1 bg-sky-300" />

      <header className="sticky top-0 z-30 border-b border-cyan-300/20 bg-[#05070b]/86 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.22em]">
            曾见云霞满天 AI Lab
          </Link>
          <div className="flex gap-5 text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">
            <Link href="/#projects">Projects</Link>
            <a href={`${yunxiaAgentApiBaseUrl}/docs`} target="_blank">
              API Docs
            </a>
          </div>
        </nav>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-8">
        <div className="grid gap-5 border-b border-cyan-300/25 pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">
              Yunxia Agent / Intent Routing / Memory / Knowledge Search
            </p>
            <h1 className="font-display mt-4 text-4xl font-black sm:text-6xl">
              云霞智能服务 Agent
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300">
              AI Lab 第四个独立服务，负责智能服务场景中的意图识别、专业 Agent 路由、对话记忆和知识库辅助回答。
            </p>
          </div>
          <div className="border border-cyan-300/25 bg-white/10 px-4 py-3 text-sm backdrop-blur">
            <span className="text-zinc-400">API</span>
            <span
              className={`ml-3 font-black ${
                apiOnline ? "text-lime-300" : apiOnline === false ? "text-red-300" : "text-zinc-400"
              }`}
            >
              {apiOnline ? "ONLINE" : apiOnline === false ? "OFFLINE" : "CHECKING"}
            </span>
            <p className="mt-2 max-w-64 break-all text-xs leading-5 text-zinc-500">{yunxiaAgentApiBaseUrl}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
          <section className="border border-cyan-300/25 bg-white/[0.08] p-5 backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                  Chat Console
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">服务 Agent 对话</h2>
              </div>
              <button
                type="button"
                onClick={loadStatus}
                className="border border-white/20 px-3 py-2 text-xs font-black text-zinc-200 transition hover:border-sky-300 hover:text-sky-200"
              >
                刷新状态
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {sampleMessages.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMessage(item)}
                  className="border border-white/10 bg-black/25 p-3 text-left text-xs leading-5 text-zinc-300 transition hover:border-sky-300/50"
                >
                  {item}
                </button>
              ))}
            </div>

            <form className="mt-5 space-y-4" onSubmit={sendMessage}>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                  User ID
                  <input
                    value={userId}
                    onChange={(event) => setUserId(event.target.value)}
                    className="mt-2 w-full border border-white/15 bg-black/35 px-3 py-3 text-sm text-white outline-none focus:border-sky-300"
                  />
                </label>
                <label className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                  Conversation ID
                  <input
                    value={convId}
                    onChange={(event) => setConvId(event.target.value)}
                    placeholder="自动创建"
                    className="mt-2 w-full border border-white/15 bg-black/35 px-3 py-3 text-sm text-white outline-none focus:border-sky-300"
                  />
                </label>
              </div>
              <label className="block text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                Message
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={6}
                  className="mt-2 w-full resize-none border border-white/15 bg-black/35 px-3 py-3 text-sm leading-6 text-white outline-none focus:border-sky-300"
                />
              </label>
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="bg-sky-300 px-5 py-3 text-sm font-black text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
              >
                {loading ? "发送中..." : "发送到 Yunxia Agent"}
              </button>
            </form>

            {error ? (
              <p className="mt-4 border border-red-400 bg-red-50 p-3 text-sm text-red-700">{error}</p>
            ) : null}
          </section>

          <section className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatusTile label="Knowledge Chunks" value={knowledgeStats?.total_chunks ?? 0} />
              <StatusTile label="Agent Pool" value={agentRows.length} />
              <StatusTile label="Last Intent" value={chatResult?.intent ?? "Waiting"} />
            </div>

            <div className="border border-cyan-300/25 bg-white/[0.08] p-5 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Response</p>
              {chatResult ? (
                <div className="mt-4">
                  <div className="flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.12em]">
                    <span className="bg-sky-300 px-2 py-1 text-zinc-950">{chatResult.agent_type}</span>
                    <span className="border border-white/15 px-2 py-1 text-zinc-300">{chatResult.intent}</span>
                    <span className="border border-white/15 px-2 py-1 text-zinc-300">
                      {chatResult.knowledge_used ? "Knowledge Used" : "No Knowledge"}
                    </span>
                    {chatResult.escalated ? (
                      <span className="border border-red-300 px-2 py-1 text-red-200">Escalated</span>
                    ) : null}
                  </div>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-200">{chatResult.response}</p>
                  <p className="mt-4 text-xs text-zinc-500">
                    conv_id: {chatResult.conv_id} / latency: {chatResult.latency_ms}ms
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-7 text-zinc-500">
                  等待第一条服务请求。
                </p>
              )}
            </div>

            <div className="border border-cyan-300/25 bg-white/[0.08] p-5 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Agent Runtime</p>
              <div className="mt-4 overflow-hidden border border-white/10">
                {agentRows.length > 0 ? (
                  agentRows.map(([name, stats]) => (
                    <div key={name} className="grid grid-cols-4 gap-3 border-b border-white/10 p-3 text-xs last:border-b-0">
                      <span className="font-black text-white">{name}</span>
                      <span className="text-zinc-400">total {stats.total}</span>
                      <span className="text-zinc-400">success {Math.round(stats.success_rate * 100)}%</span>
                      <span className="text-zinc-400">score {stats.routing_score}</span>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-sm text-zinc-500">后端在线后会显示 Agent 运行统计。</p>
                )}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function StatusTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-cyan-300/20 bg-black/30 p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-4 break-words text-2xl font-black text-white">{value}</p>
    </div>
  );
}
