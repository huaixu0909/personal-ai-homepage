"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Source = {
  title: string;
  content: string;
};

type ChatResponse = {
  answer: string;
  sources: Source[];
  mode: "mock";
};

const apiBaseUrl = "http://localhost:8000";
const sampleQuestion = "这个 RAG Agent 系统当前已经支持什么？下一步应该做什么？";

export default function RagAgentDemoPage() {
  const [question, setQuestion] = useState(sampleQuestion);
  const [result, setResult] = useState<ChatResponse | null>(null);
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

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setLatency(null);

    const startedAt = performance.now();

    try {
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error(`API 请求失败：${response.status}`);
      }

      const data = (await response.json()) as ChatResponse;
      setResult(data);
      setApiOnline(true);
      setLatency(Math.round(performance.now() - startedAt));
    } catch {
      setApiOnline(false);
      setError("无法连接 RAG 后端，请确认 http://localhost:8000 已启动。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <header className="border-b border-zinc-200 bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-semibold">
            Yunhao AI Lab
          </Link>
          <div className="flex gap-5 text-sm text-zinc-600">
            <Link href="/#projects">Projects</Link>
            <Link href="/projects/rag-agent">详情页</Link>
            <a href="https://github.com/huaixu0909/rag-agent-system" target="_blank">
              GitHub
            </a>
          </div>
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-blue-600">RAG Agent Demo</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              企业知识库问答工作台
            </h1>
            <p className="mt-3 max-w-2xl text-zinc-600">
              当前连接本地 FastAPI mock 问答接口，后续会替换为文档上传、向量检索和真实 RAG 回答。
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
              <h2 className="font-semibold">问题输入</h2>
              <button
                type="button"
                onClick={() => setQuestion(sampleQuestion)}
                className="text-sm font-medium text-blue-600"
              >
                填充示例
              </button>
            </div>

            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className="mt-4 min-h-52 w-full resize-none border border-zinc-300 p-4 text-sm leading-6 outline-none focus:border-zinc-950"
            />

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || question.trim().length === 0}
                className="rounded-md bg-zinc-950 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {loading ? "请求中..." : "发送问题"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuestion("");
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
            <h2 className="font-semibold">回答结果</h2>

            {result ? (
              <div className="mt-4 space-y-5">
                <div>
                  <p className="text-sm font-medium text-zinc-500">Answer</p>
                  <p className="mt-2 leading-7 text-zinc-700">{result.answer}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-zinc-500">Sources</p>
                  <div className="mt-3 grid gap-3">
                    {result.sources.map((source) => (
                      <article
                        key={source.title}
                        className="border border-zinc-200 bg-zinc-50 p-4"
                      >
                        <h3 className="font-medium">{source.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-zinc-600">
                          {source.content}
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
                发送问题后，这里会展示回答、引用来源和接口模式。
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
