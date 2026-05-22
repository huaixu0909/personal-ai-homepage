"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ParticleField from "../../components/ParticleField";

type ScenarioType = "code_review" | "customer_complaint" | "technical_interview";

type Persona = {
  agent_id: string;
  role: string;
  personality: string;
  style: string;
  focus: string;
  goal: string;
  tolerance: string;
};

type Message = {
  turn: number;
  agent_id: string;
  role: string;
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
  task_type: string;
  scenario: string;
  language?: string | null;
  code_diff?: string | null;
  review_focus: string[];
  task_input: Record<string, unknown>;
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

type ScenarioDescriptor = {
  name: string;
  title: string;
  description: string;
  status: string;
  agent_roles: string[];
  endpoint: string;
};

type ConversationListResponse = {
  items: ConversationRecord[];
  total: number;
};

type Template = {
  label: string;
  apply: () => void;
};

const apiBaseUrl = "http://localhost:8001";

const roleLabels: Record<string, string> = {
  Developer: "开发者",
  Reviewer: "审查者",
  Challenger: "挑战者",
  Judge: "裁判",
  Customer: "用户",
  SupportAgent: "客服专员",
  ComplianceReviewer: "合规审核",
  EscalationManager: "升级经理",
  Interviewer: "面试官",
  Candidate: "候选人",
  FollowupInterviewer: "追问面试官",
  Evaluator: "评估官",
};

const scenarioLabels: Record<ScenarioType, string> = {
  code_review: "Code Review",
  customer_complaint: "客服投诉",
  technical_interview: "技术面试",
};

const scenarioNotes: Record<ScenarioType, string> = {
  code_review: "输入一段代码 diff，生成开发者、审查者、挑战者和裁判之间的代码审查讨论。",
  customer_complaint: "输入投诉背景、情绪强度和企业政策，生成客服投诉处理训练对话。",
  technical_interview: "输入岗位、主题和候选人背景，生成技术面试问答、追问和能力评估。",
};

const endpoints: Record<ScenarioType, string> = {
  code_review: "POST /api/simulations/code-review",
  customer_complaint: "POST /api/simulations/customer-complaint",
  technical_interview: "POST /api/simulations/technical-interview",
};

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
  const [scenario, setScenario] = useState<ScenarioType>("code_review");
  const [scenarios, setScenarios] = useState<ScenarioDescriptor[]>([]);
  const [history, setHistory] = useState<ConversationRecord[]>([]);

  const [codeDiff, setCodeDiff] = useState(`+ query = f"SELECT * FROM users WHERE id = {user_id}"
+ cursor.execute(query)
+ print(user)
+ return {"user": user}`);
  const [language, setLanguage] = useState("python");
  const [reviewFocus, setReviewFocus] = useState("security, performance, testing");

  const [industry, setIndustry] = useState("电商");
  const [complaintType, setComplaintType] = useState("退款纠纷");
  const [customerProfile, setCustomerProfile] = useState("老用户，最近一次订单体验很差");
  const [emotionLevel, setEmotionLevel] = useState("high");
  const [companyPolicy, setCompanyPolicy] = useState(
    "支持在符合规则时退款；涉及高额赔付时需要升级主管审核；客服必须避免承诺超出政策范围的补偿。",
  );
  const [complaintDetail, setComplaintDetail] = useState(
    "我上周买的商品显示已经发货，但物流三天没有更新。联系客服一直让我等，今天又说可能丢件。我现在要求退款，并且希望你们给出明确处理时间。",
  );

  const [targetRole, setTargetRole] = useState("AI 工程师");
  const [candidateLevel, setCandidateLevel] = useState("中级");
  const [interviewTopic, setInterviewTopic] = useState("RAG");
  const [interviewDifficulty, setInterviewDifficulty] = useState("medium");
  const [candidateProfile, setCandidateProfile] = useState(
    "候选人有 Python、FastAPI 和本地 RAG Demo 经验，了解向量检索和 DeepSeek API，但生产级监控、评估和故障恢复经验较少。",
  );
  const [interviewContext, setInterviewContext] = useState(
    "希望考察候选人是否真的理解 RAG 的检索、chunking、相似度阈值、上下文拼接和幻觉控制，而不是只会描述概念。",
  );

  const [maxTurns, setMaxTurns] = useState(8);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [conversation, setConversation] = useState<ConversationRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const activeDescriptor = useMemo(
    () => scenarios.find((item) => item.name === scenario),
    [scenario, scenarios],
  );

  const canSubmit =
    scenario === "code_review"
      ? codeDiff.trim().length > 0
      : scenario === "customer_complaint"
        ? complaintDetail.trim().length > 0
        : candidateProfile.trim().length > 0 && interviewContext.trim().length > 0;

  const templates = buildTemplates();

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const [healthResponse, scenariosResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/health`),
          fetch(`${apiBaseUrl}/api/scenarios`),
        ]);
        setApiOnline(healthResponse.ok);
        if (scenariosResponse.ok) {
          const data = (await scenariosResponse.json()) as { items: ScenarioDescriptor[] };
          setScenarios(data.items);
        }
        const historyResponse = await fetch(`${apiBaseUrl}/api/conversations?scenario=code_review`);
        if (historyResponse.ok) {
          const historyData = (await historyResponse.json()) as ConversationListResponse;
          setHistory(historyData.items.slice(0, 8));
        }
      } catch {
        setApiOnline(false);
      }
    };
    loadStatus();
  }, []);

  async function loadHistory(nextScenario: ScenarioType) {
    setHistoryLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/conversations?scenario=${nextScenario}`);
      if (!response.ok) throw new Error("history failed");
      const data = (await response.json()) as ConversationListResponse;
      setHistory(data.items.slice(0, 8));
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  function buildTemplates(): Template[] {
    if (scenario === "code_review") {
      return [
        {
          label: "SQL 注入",
          apply: () => {
            setLanguage("python");
            setReviewFocus("security, testing");
            setCodeDiff(`+ query = f"SELECT * FROM users WHERE id = {user_id}"
+ cursor.execute(query)
+ print(user)
+ return {"user": user}`);
          },
        },
        {
          label: "N+1 查询",
          apply: () => {
            setLanguage("python");
            setReviewFocus("performance, database");
            setCodeDiff(`+ for user in users:
+     orders = db.query(Order).filter(Order.user_id == user.id).all()
+     user.total_orders = len(orders)
+ return users`);
          },
        },
        {
          label: "硬编码密钥",
          apply: () => {
            setLanguage("typescript");
            setReviewFocus("security, secret");
            setCodeDiff(`+ const apiKey = "sk_live_123456"
+ await fetch(url, { headers: { Authorization: apiKey } })
+ return response.json()`);
          },
        },
      ];
    }

    if (scenario === "customer_complaint") {
      return [
        {
          label: "退款纠纷",
          apply: () => {
            setIndustry("电商");
            setComplaintType("退款纠纷");
            setEmotionLevel("high");
            setCustomerProfile("老用户，最近一次订单体验很差");
            setComplaintDetail(
              "商品显示已发货，但物流三天没有更新。客服一直让我等，现在我要求退款并给出明确处理时间。",
            );
          },
        },
        {
          label: "物流延迟",
          apply: () => {
            setIndustry("生鲜配送");
            setComplaintType("物流延迟");
            setEmotionLevel("medium");
            setCustomerProfile("第一次下单的新用户，对时效很敏感");
            setComplaintDetail(
              "我订的是当天送达的生鲜，但现在已经超过承诺时间 6 小时。商品如果不新鲜了，责任怎么算？",
            );
          },
        },
        {
          label: "隐私风险",
          apply: () => {
            setIndustry("在线教育");
            setComplaintType("隐私泄露疑虑");
            setEmotionLevel("extreme");
            setCustomerProfile("家长用户，对孩子信息非常敏感");
            setComplaintDetail(
              "客服刚才在群里提到了我的手机号尾号和孩子姓名，我担心个人信息被泄露，要求你们说明处理措施。",
            );
          },
        },
      ];
    }

    return [
      {
        label: "RAG 面试",
        apply: () => {
          setTargetRole("AI 工程师");
          setCandidateLevel("中级");
          setInterviewTopic("RAG");
          setInterviewDifficulty("medium");
          setCandidateProfile(
            "候选人有 Python、FastAPI 和本地 RAG Demo 经验，了解向量检索和 DeepSeek API，但生产级监控、评估和故障恢复经验较少。",
          );
          setInterviewContext(
            "希望考察候选人是否真的理解 RAG 的检索、chunking、相似度阈值、上下文拼接和幻觉控制。",
          );
        },
      },
      {
        label: "Agent 工作流",
        apply: () => {
          setTargetRole("Agent 应用工程师");
          setCandidateLevel("高级");
          setInterviewTopic("LangGraph 多 Agent 工作流");
          setInterviewDifficulty("high");
          setCandidateProfile("候选人做过 RAG 和工具调用 Demo，但还没有完整落地过多 Agent 状态机。");
          setInterviewContext("重点考察状态管理、工具失败恢复、长期记忆和多 Agent 协作边界。");
        },
      },
      {
        label: "后端工程化",
        apply: () => {
          setTargetRole("后端 AI 应用工程师");
          setCandidateLevel("中级");
          setInterviewTopic("FastAPI + 异步任务");
          setInterviewDifficulty("medium");
          setCandidateProfile("候选人熟悉 FastAPI，写过 SQLite 和本地文件处理，但异步队列经验较少。");
          setInterviewContext("重点考察接口设计、任务队列、错误处理、幂等性和日志监控。");
        },
      },
    ];
  }

  async function runSimulation() {
    setLoading(true);
    setError("");
    setCopied("");
    setConversation(null);

    const endpoint = endpoints[scenario].replace("POST ", "");
    const payload =
      scenario === "code_review"
        ? {
            language,
            code_diff: codeDiff,
            review_focus: reviewFocus
              .split(/[,，]/)
              .map((item) => item.trim())
              .filter(Boolean),
            max_turns: maxTurns,
          }
        : scenario === "customer_complaint"
          ? {
              industry,
              complaint_type: complaintType,
              customer_profile: customerProfile,
              complaint_detail: complaintDetail,
              company_policy: companyPolicy,
              emotion_level: emotionLevel,
              max_turns: maxTurns,
            }
          : {
              target_role: targetRole,
              candidate_level: candidateLevel,
              topic: interviewTopic,
              difficulty: interviewDifficulty,
              candidate_profile: candidateProfile,
              interview_context: interviewContext,
              max_turns: maxTurns,
            };

    try {
      const response = await fetch(`${apiBaseUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Simulation failed: ${response.status}`);
      const data = (await response.json()) as ConversationRecord;
      setConversation(data);
      setApiOnline(true);
      await loadHistory(scenario);
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
  }

  async function copyConversationJson() {
    if (!conversation) return;
    await navigator.clipboard.writeText(JSON.stringify(conversation, null, 2));
    setCopied("已复制 JSON");
    setTimeout(() => setCopied(""), 1800);
  }

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
          <div className="flex gap-5 text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">
            <Link href="/#projects">Projects</Link>
            <Link href="/projects/multi-agent-data-factory">Detail</Link>
            <a href="https://github.com/huaixu0909/multi-agent-data-factory" target="_blank">
              GitHub
            </a>
          </div>
        </nav>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-8">
        <div className="grid gap-5 border-b border-cyan-300/25 pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
              Synthetic Data Factory / Multi-Agent / Scenario Console
            </p>
            <h1 className="font-display mt-4 text-4xl font-black sm:text-6xl">
              多场景数据生产控制台
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300">
              选择业务场景、套用模板、生成中文多 Agent 对话，并在同一工作台查看历史记录、评分和可导出的 JSONL 数据。
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-300/25 bg-white/10 px-4 py-3 text-sm backdrop-blur">
            <span className="text-zinc-400">API</span>
            <span
              className={`ml-3 font-black ${
                apiOnline ? "text-lime-300" : apiOnline === false ? "text-red-300" : "text-zinc-400"
              }`}
            >
              {apiOnline ? "ONLINE" : apiOnline === false ? "OFFLINE" : "CHECKING"}
            </span>
            {conversation ? (
              <div className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
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
          <section className="rounded-3xl border border-cyan-300/25 bg-white/[0.08] p-5 backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                  Generator
                </p>
                <h2 className="mt-2 font-black text-white">{scenarioLabels[scenario]} 任务</h2>
                <p className="mt-2 max-w-xl text-xs leading-5 text-zinc-400">
                  {activeDescriptor?.description ?? scenarioNotes[scenario]}
                </p>
              </div>
              <a
                href={`${apiBaseUrl}/api/datasets/export.jsonl`}
                target="_blank"
                className="rounded-full border border-lime-300/50 px-3 py-1.5 text-xs font-black text-lime-200"
              >
                导出 JSONL
              </a>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {(Object.keys(scenarioLabels) as ScenarioType[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setScenario(value);
                    setConversation(null);
                    setError("");
                    setCopied("");
                    loadHistory(value);
                  }}
                  className={`rounded-2xl border px-4 py-3 text-sm font-black transition ${
                    scenario === value
                      ? "border-lime-300 bg-lime-300 text-zinc-950"
                      : "border-white/15 bg-black/30 text-zinc-300 hover:border-cyan-300/50"
                  }`}
                >
                  {scenarioLabels[value]}
                </button>
              ))}
            </div>

            <ScenarioInfo descriptor={activeDescriptor} scenario={scenario} />

            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                输入模板
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {templates.map((template) => (
                  <button
                    key={template.label}
                    type="button"
                    onClick={template.apply}
                    className="rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-xs font-bold text-zinc-300 hover:border-cyan-300/50"
                  >
                    {template.label}
                  </button>
                ))}
              </div>
            </div>

            {scenario === "code_review" ? (
              <CodeReviewForm
                language={language}
                setLanguage={setLanguage}
                reviewFocus={reviewFocus}
                setReviewFocus={setReviewFocus}
                codeDiff={codeDiff}
                setCodeDiff={setCodeDiff}
              />
            ) : scenario === "customer_complaint" ? (
              <CustomerComplaintForm
                industry={industry}
                setIndustry={setIndustry}
                complaintType={complaintType}
                setComplaintType={setComplaintType}
                emotionLevel={emotionLevel}
                setEmotionLevel={setEmotionLevel}
                customerProfile={customerProfile}
                setCustomerProfile={setCustomerProfile}
                companyPolicy={companyPolicy}
                setCompanyPolicy={setCompanyPolicy}
                complaintDetail={complaintDetail}
                setComplaintDetail={setComplaintDetail}
              />
            ) : (
              <TechnicalInterviewForm
                targetRole={targetRole}
                setTargetRole={setTargetRole}
                candidateLevel={candidateLevel}
                setCandidateLevel={setCandidateLevel}
                interviewTopic={interviewTopic}
                setInterviewTopic={setInterviewTopic}
                interviewDifficulty={interviewDifficulty}
                setInterviewDifficulty={setInterviewDifficulty}
                candidateProfile={candidateProfile}
                setCandidateProfile={setCandidateProfile}
                interviewContext={interviewContext}
                setInterviewContext={setInterviewContext}
              />
            )}

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

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={runSimulation}
                disabled={loading || !canSubmit}
                className="rounded-full bg-lime-300 px-5 py-3 text-sm font-black text-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-500"
              >
                {loading ? "生成中..." : "生成多 Agent 对话"}
              </button>
              <button
                type="button"
                onClick={copyConversationJson}
                disabled={!conversation}
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-black text-zinc-200 disabled:cursor-not-allowed disabled:text-zinc-600"
              >
                复制 JSON
              </button>
              {copied ? <span className="text-xs font-bold text-lime-300">{copied}</span> : null}
            </div>

            {error ? (
              <p className="mt-4 rounded-2xl border border-red-400 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <HistoryPanel
              history={history}
              loading={historyLoading}
              onSelect={(item) => setConversation(item)}
            />
          </section>

          <div className="space-y-5">
            <QualityPanel conversation={conversation} />
            <ConversationPanel conversation={conversation} />
          </div>
        </div>
      </section>
    </main>
  );
}

function translateRole(role: string) {
  return roleLabels[role] ?? role;
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function inputClassName() {
  return "mt-2 w-full rounded-xl border border-white/15 bg-black/50 p-3 text-sm text-white outline-none focus:border-cyan-300";
}

function textareaClassName(extra = "min-h-56") {
  return `mt-2 ${extra} w-full resize-none rounded-2xl border border-white/15 bg-black/60 p-4 text-sm leading-7 text-white outline-none focus:border-lime-300`;
}

function ScenarioInfo({
  descriptor,
  scenario,
}: {
  descriptor?: ScenarioDescriptor;
  scenario: ScenarioType;
}) {
  const roles = descriptor?.agent_roles ?? [];
  return (
    <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 text-xs leading-6 text-zinc-400">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-bold text-zinc-200">{descriptor?.status ?? "本地场景"}</p>
        <p className="font-code text-cyan-200">{endpoints[scenario]}</p>
      </div>
      <p className="mt-2">{scenarioNotes[scenario]}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {roles.map((role) => (
          <span key={role} className="rounded-full bg-cyan-300/10 px-3 py-1 text-cyan-100">
            {translateRole(role)}
          </span>
        ))}
      </div>
    </div>
  );
}

function CodeReviewForm({
  language,
  setLanguage,
  reviewFocus,
  setReviewFocus,
  codeDiff,
  setCodeDiff,
}: {
  language: string;
  setLanguage: (value: string) => void;
  reviewFocus: string;
  setReviewFocus: (value: string) => void;
  codeDiff: string;
  setCodeDiff: (value: string) => void;
}) {
  return (
    <>
      <label className="mt-5 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
        编程语言
        <input value={language} onChange={(event) => setLanguage(event.target.value)} className={inputClassName()} />
      </label>
      <label className="mt-4 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
        审查重点
        <input
          value={reviewFocus}
          onChange={(event) => setReviewFocus(event.target.value)}
          className={inputClassName()}
        />
      </label>
      <label className="mt-4 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
        代码 Diff
        <textarea
          value={codeDiff}
          onChange={(event) => setCodeDiff(event.target.value)}
          className={`${textareaClassName("min-h-64")} font-code leading-6`}
        />
      </label>
    </>
  );
}

function CustomerComplaintForm({
  industry,
  setIndustry,
  complaintType,
  setComplaintType,
  emotionLevel,
  setEmotionLevel,
  customerProfile,
  setCustomerProfile,
  companyPolicy,
  setCompanyPolicy,
  complaintDetail,
  setComplaintDetail,
}: {
  industry: string;
  setIndustry: (value: string) => void;
  complaintType: string;
  setComplaintType: (value: string) => void;
  emotionLevel: string;
  setEmotionLevel: (value: string) => void;
  customerProfile: string;
  setCustomerProfile: (value: string) => void;
  companyPolicy: string;
  setCompanyPolicy: (value: string) => void;
  complaintDetail: string;
  setComplaintDetail: (value: string) => void;
}) {
  return (
    <>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
          行业
          <input value={industry} onChange={(event) => setIndustry(event.target.value)} className={inputClassName()} />
        </label>
        <label className="block text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
          投诉类型
          <input
            value={complaintType}
            onChange={(event) => setComplaintType(event.target.value)}
            className={inputClassName()}
          />
        </label>
      </div>
      <label className="mt-4 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
        情绪强度
        <select
          value={emotionLevel}
          onChange={(event) => setEmotionLevel(event.target.value)}
          className={inputClassName()}
        >
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
          <option value="extreme">极高</option>
        </select>
      </label>
      <label className="mt-4 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
        用户画像
        <input
          value={customerProfile}
          onChange={(event) => setCustomerProfile(event.target.value)}
          className={inputClassName()}
        />
      </label>
      <label className="mt-4 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
        企业政策
        <textarea
          value={companyPolicy}
          onChange={(event) => setCompanyPolicy(event.target.value)}
          className={textareaClassName("min-h-24")}
        />
      </label>
      <label className="mt-4 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
        投诉详情
        <textarea
          value={complaintDetail}
          onChange={(event) => setComplaintDetail(event.target.value)}
          className={textareaClassName("min-h-56")}
        />
      </label>
    </>
  );
}

function TechnicalInterviewForm({
  targetRole,
  setTargetRole,
  candidateLevel,
  setCandidateLevel,
  interviewTopic,
  setInterviewTopic,
  interviewDifficulty,
  setInterviewDifficulty,
  candidateProfile,
  setCandidateProfile,
  interviewContext,
  setInterviewContext,
}: {
  targetRole: string;
  setTargetRole: (value: string) => void;
  candidateLevel: string;
  setCandidateLevel: (value: string) => void;
  interviewTopic: string;
  setInterviewTopic: (value: string) => void;
  interviewDifficulty: string;
  setInterviewDifficulty: (value: string) => void;
  candidateProfile: string;
  setCandidateProfile: (value: string) => void;
  interviewContext: string;
  setInterviewContext: (value: string) => void;
}) {
  return (
    <>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
          目标岗位
          <input
            value={targetRole}
            onChange={(event) => setTargetRole(event.target.value)}
            className={inputClassName()}
          />
        </label>
        <label className="block text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
          候选人级别
          <input
            value={candidateLevel}
            onChange={(event) => setCandidateLevel(event.target.value)}
            className={inputClassName()}
          />
        </label>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
          面试主题
          <input
            value={interviewTopic}
            onChange={(event) => setInterviewTopic(event.target.value)}
            className={inputClassName()}
          />
        </label>
        <label className="block text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
          难度
          <select
            value={interviewDifficulty}
            onChange={(event) => setInterviewDifficulty(event.target.value)}
            className={inputClassName()}
          >
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
        </label>
      </div>
      <label className="mt-4 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
        候选人背景
        <textarea
          value={candidateProfile}
          onChange={(event) => setCandidateProfile(event.target.value)}
          className={textareaClassName("min-h-32")}
        />
      </label>
      <label className="mt-4 block text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
        面试考察上下文
        <textarea
          value={interviewContext}
          onChange={(event) => setInterviewContext(event.target.value)}
          className={textareaClassName("min-h-36")}
        />
      </label>
    </>
  );
}

function HistoryPanel({
  history,
  loading,
  onSelect,
}: {
  history: ConversationRecord[];
  loading: boolean;
  onSelect: (item: ConversationRecord) => void;
}) {
  return (
    <div className="mt-5 rounded-3xl border border-white/10 bg-black/25 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
          最近生成记录
        </p>
        <span className="text-xs text-zinc-500">{loading ? "加载中" : `${history.length} 条`}</span>
      </div>
      {history.length > 0 ? (
        <div className="mt-3 grid gap-2">
          {history.map((item) => (
            <button
              key={item.conversation_id}
              type="button"
              onClick={() => onSelect(item)}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left transition hover:border-cyan-300/40"
            >
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-bold text-zinc-200">{item.conversation_id}</span>
                <span className={item.accepted ? "text-lime-300" : "text-amber-300"}>
                  {item.scores.final_score.toFixed(2)}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
                <span>{scenarioLabels[item.scenario as ScenarioType] ?? item.scenario}</span>
                <span>{formatTime(item.created_at)}</span>
                <span>{item.generation_mode === "llm" ? "真实 LLM" : "本地 Mock"}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-2xl border border-dashed border-white/15 p-4 text-xs text-zinc-500">
          当前场景还没有历史记录。
        </p>
      )}
    </div>
  );
}

function QualityPanel({ conversation }: { conversation: ConversationRecord | null }) {
  return (
    <section className="rounded-3xl border border-cyan-300/25 bg-white/[0.08] p-5 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
            Quality Scorer
          </p>
          <h2 className="mt-2 font-black text-white">数据质量评分</h2>
        </div>
        {conversation ? (
          <span className="rounded-full border border-lime-300 bg-lime-300 px-3 py-1 text-xs font-black text-zinc-950">
            {conversation.accepted ? "ACCEPTED" : "REJECTED"} / {conversation.scores.final_score.toFixed(2)}
          </span>
        ) : null}
      </div>

      {conversation ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <MetaPanel
            title="场景"
            value={scenarioLabels[conversation.scenario as ScenarioType] ?? conversation.scenario}
          />
          <MetaPanel
            title="生成模式"
            value={`${conversation.generation_mode === "llm" ? "真实 LLM" : "本地 Mock"}${
              conversation.llm_provider ? ` / ${conversation.llm_provider}` : ""
            }${conversation.llm_model ? ` / ${conversation.llm_model}` : ""}`}
            warning={conversation.llm_error ? `LLM 回退原因：${conversation.llm_error}` : ""}
          />
          <MetaPanel
            title="评分模式"
            value={`${conversation.scoring_mode === "llm_judge" ? "LLM-as-a-Judge" : "规则评分"}${
              conversation.scoring_provider ? ` / ${conversation.scoring_provider}` : ""
            }${conversation.scoring_model ? ` / ${conversation.scoring_model}` : ""}`}
            warning={conversation.scoring_error ? `评分回退原因：${conversation.scoring_error}` : ""}
            feedback={conversation.score_feedback}
          />
          {scoreLabels.map(([key, label]) => (
            <div key={key} className="rounded-2xl border border-white/10 bg-black/25 p-3">
              <div className="flex justify-between text-xs font-black uppercase tracking-[0.12em] text-zinc-400">
                <span>{label}</span>
                <span>{conversation.scores[key].toFixed(1)}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-black">
                <div
                  className="h-full rounded-full bg-cyan-300"
                  style={{ width: `${conversation.scores[key] * 10}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-white/20 p-8 text-sm text-zinc-400">
          生成后这里会展示评分模式、中文质量评语和各维度分数。
        </div>
      )}
    </section>
  );
}

function ConversationPanel({ conversation }: { conversation: ConversationRecord | null }) {
  return (
    <section className="rounded-3xl border border-cyan-300/25 bg-white/[0.08] p-5 backdrop-blur">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
        Agent Conversation
      </p>
      <h2 className="mt-2 font-black text-white">模拟对话</h2>

      {conversation ? (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {conversation.agents.map((agent) => (
              <span
                key={agent.agent_id}
                className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100"
              >
                {translateRole(agent.role)} / {agent.personality}
              </span>
            ))}
          </div>
          {conversation.messages.map((message) => (
            <article key={message.turn} className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-white">
                  {String(message.turn).padStart(2, "0")} / {translateRole(message.role)}
                </h3>
                <span className="text-xs font-bold text-zinc-500">{message.agent_id}</span>
              </div>
              <p className="mt-2 text-sm leading-7 text-zinc-300">{message.content}</p>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-white/20 p-8 text-sm text-zinc-400">
          暂无模拟结果。选择场景并输入素材后点击生成。
        </div>
      )}
    </section>
  );
}

function MetaPanel({
  title,
  value,
  warning,
  feedback = [],
}: {
  title: string;
  value: string;
  warning?: string;
  feedback?: string[];
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-3 sm:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.12em] text-zinc-400">
        <span>{title}</span>
        <span>{value}</span>
      </div>
      {warning ? <p className="mt-2 text-xs leading-5 text-amber-300">{warning}</p> : null}
      {feedback.length > 0 ? (
        <ul className="mt-3 space-y-1 text-xs leading-5 text-zinc-300">
          {feedback.map((item, index) => (
            <li key={`${index}-${item}`}>- {item}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
