"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ParticleField from "../../components/ParticleField";

type ScenarioType = "code_review" | "customer_complaint" | "technical_interview";
type ScenarioFilter = "current" | "all" | ScenarioType;
type AcceptedFilter = "all" | "accepted" | "rejected";

type Persona = {
  persona_id?: string | null;
  agent_id: string;
  role: string;
  name?: string | null;
  personality: string;
  style: string;
  focus: string;
  goal: string;
  tolerance: string;
  memory_notes?: string[];
  success_patterns?: string[];
  failure_patterns?: string[];
  strategy_notes?: string[];
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
  workflow_engine: string;
  workflow_steps: string[];
  agent_trace: Array<{
    node: string;
    turn: number;
    role: string;
    agent_id: string;
    persona_id?: string | null;
    mode: string;
    route_reason?: string | null;
    memory_context_count?: number;
    error?: string | null;
  }>;
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
  page: number;
  page_size: number;
  total_pages: number;
};

type PersonaRecord = {
  persona_id: string;
  scenario: string;
  role: string;
  name: string;
  personality: string;
  style: string;
  focus: string;
  goal: string;
  tolerance: string;
  usage_count: number;
  average_score: number;
  success_count: number;
  weight: number;
  memory_notes: string[];
  success_patterns: string[];
  failure_patterns: string[];
  strategy_notes: string[];
  created_at: string;
  updated_at: string;
};

type PersonaListResponse = {
  items: PersonaRecord[];
  total: number;
};

type BatchJobRecord = {
  job_id: string;
  scenario: ScenarioType;
  status: "queued" | "running" | "completed" | "failed";
  total: number;
  completed: number;
  accepted: number;
  failed: number;
  min_score: number;
  payload: Record<string, unknown>;
  conversation_ids: string[];
  error?: string | null;
  created_at: string;
  started_at?: string | null;
  finished_at?: string | null;
};

type BatchJobListResponse = {
  items: BatchJobRecord[];
  total: number;
};

type Template = {
  label: string;
  apply: () => void;
};

const apiBaseUrl = "http://localhost:8001";
const pageSize = 10;

const scenarioLabels: Record<ScenarioType, string> = {
  code_review: "代码审查",
  customer_complaint: "客服投诉",
  technical_interview: "技术面试",
};

const scenarioNotes: Record<ScenarioType, string> = {
  code_review: "输入一段代码 diff，生成开发者、审查者、挑战者和裁判之间的中文代码审查讨论。",
  customer_complaint: "输入投诉背景、用户画像、情绪强度和企业政策，生成客服投诉处理训练对话。",
  technical_interview: "输入岗位、主题、候选人背景和考察上下文，生成技术面试问答、追问和能力评估。",
};

const roleLabels: Record<string, string> = {
  Developer: "开发者",
  Reviewer: "审查者",
  Challenger: "挑战者",
  Judge: "裁判",
  Customer: "客户",
  SupportAgent: "客服专员",
  ComplianceReviewer: "合规审核员",
  EscalationManager: "升级主管",
  Interviewer: "面试官",
  Candidate: "候选人",
  FollowupInterviewer: "追问面试官",
  Evaluator: "评估官",
};

const endpoints: Record<ScenarioType, string> = {
  code_review: "/api/simulations/code-review",
  customer_complaint: "/api/simulations/customer-complaint",
  technical_interview: "/api/simulations/technical-interview",
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
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [personas, setPersonas] = useState<PersonaRecord[]>([]);
  const [personasLoading, setPersonasLoading] = useState(false);
  const [jobs, setJobs] = useState<BatchJobRecord[]>([]);
  const [activeJob, setActiveJob] = useState<BatchJobRecord | null>(null);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchTotal, setBatchTotal] = useState(5);

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
    "我上周买的商品显示已经发货，但物流三天没有更新。联系客服一直让我等，今天又说可能丢件。我现在要求退款，并希望你们给出明确处理时间。",
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

  const [datasetScenario, setDatasetScenario] = useState<ScenarioFilter>("current");
  const [acceptedFilter, setAcceptedFilter] = useState<AcceptedFilter>("all");
  const [minScore, setMinScore] = useState("0");
  const [searchQuery, setSearchQuery] = useState("");

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
  const exportUrl = `${apiBaseUrl}/api/datasets/export.jsonl?${buildDatasetParams().toString()}`;

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const [healthResponse, scenariosResponse, historyResponse, personasResponse, jobsResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/health`),
          fetch(`${apiBaseUrl}/api/scenarios`),
          fetch(`${apiBaseUrl}/api/conversations?scenario=code_review&page=1&page_size=${pageSize}`),
          fetch(`${apiBaseUrl}/api/personas`),
          fetch(`${apiBaseUrl}/api/jobs`),
        ]);
        setApiOnline(healthResponse.ok);
        if (scenariosResponse.ok) {
          const data = (await scenariosResponse.json()) as { items: ScenarioDescriptor[] };
          setScenarios(data.items);
        }
        if (historyResponse.ok) {
          const data = (await historyResponse.json()) as ConversationListResponse;
          setHistory(data.items);
          setHistoryTotal(data.total);
          setHistoryPage(data.page);
          setHistoryTotalPages(data.total_pages);
        }
        if (personasResponse.ok) {
          const data = (await personasResponse.json()) as PersonaListResponse;
          setPersonas(data.items);
        }
        if (jobsResponse.ok) {
          const data = (await jobsResponse.json()) as BatchJobListResponse;
          setJobs(data.items);
          setActiveJob(data.items.find((item) => item.status === "running" || item.status === "queued") ?? data.items[0] ?? null);
        }
      } catch {
        setApiOnline(false);
      }
    };
    loadStatus();
  }, []);

  useEffect(() => {
    if (!activeJob || (activeJob.status !== "queued" && activeJob.status !== "running")) return;
    const timer = window.setInterval(async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/jobs/${activeJob.job_id}`);
        if (!response.ok) throw new Error("job polling failed");
        const data = (await response.json()) as BatchJobRecord;
        setActiveJob(data);
        setJobs((items) => [data, ...items.filter((item) => item.job_id !== data.job_id)]);
        if (data.status === "completed" || data.status === "failed") {
          await loadHistory(1);
          await loadPersonas();
          await loadJobs();
        }
      } catch {
        setApiOnline(false);
      }
    }, 1200);
    return () => window.clearInterval(timer);
  // Polling should stay tied to the selected job, not to every filter change in the page.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeJob?.job_id, activeJob?.status]);

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
            setComplaintDetail("商品显示已发货，但物流三天没有更新。客服一直让我等，现在我要求退款并给出明确处理时间。");
          },
        },
        {
          label: "物流延迟",
          apply: () => {
            setIndustry("生鲜配送");
            setComplaintType("物流延迟");
            setEmotionLevel("medium");
            setCustomerProfile("第一次下单的新用户，对时效很敏感");
            setComplaintDetail("我订的是当天送达的生鲜，但现在已经超过承诺时间 6 小时。商品如果不新鲜了，责任怎么算？");
          },
        },
        {
          label: "隐私风险",
          apply: () => {
            setIndustry("在线教育");
            setComplaintType("隐私泄露疑虑");
            setEmotionLevel("extreme");
            setCustomerProfile("家长用户，对孩子信息非常敏感");
            setComplaintDetail("客服刚才在群里提到了我的手机号尾号和孩子姓名，我担心个人信息被泄露，要求说明处理措施。");
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
          setCandidateProfile("候选人有 Python、FastAPI 和本地 RAG Demo 经验，了解向量检索和 DeepSeek API，但生产级经验较少。");
          setInterviewContext("重点考察检索、chunking、相似度阈值、上下文拼接和幻觉控制。");
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

  function buildDatasetParams(targetPage = historyPage) {
    const params = new URLSearchParams();
    const scenarioValue = datasetScenario === "current" ? scenario : datasetScenario;
    if (scenarioValue !== "all") params.set("scenario", scenarioValue);
    if (acceptedFilter !== "all") params.set("accepted", acceptedFilter === "accepted" ? "true" : "false");
    if (Number(minScore) > 0) params.set("min_score", minScore);
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    params.set("page", String(targetPage));
    params.set("page_size", String(pageSize));
    return params;
  }

  async function loadHistory(targetPage = 1) {
    setHistoryLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/conversations?${buildDatasetParams(targetPage).toString()}`);
      if (!response.ok) throw new Error("history failed");
      const data = (await response.json()) as ConversationListResponse;
      setHistory(data.items);
      setHistoryTotal(data.total);
      setHistoryPage(data.page);
      setHistoryTotalPages(data.total_pages);
      setApiOnline(true);
    } catch {
      setHistory([]);
      setHistoryTotal(0);
      setHistoryPage(1);
      setHistoryTotalPages(1);
      setApiOnline(false);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function loadPersonas() {
    setPersonasLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/personas`);
      if (!response.ok) throw new Error("personas failed");
      const data = (await response.json()) as PersonaListResponse;
      setPersonas(data.items);
      setApiOnline(true);
    } catch {
      setApiOnline(false);
    } finally {
      setPersonasLoading(false);
    }
  }

  async function loadJobs() {
    setJobsLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/jobs`);
      if (!response.ok) throw new Error("jobs failed");
      const data = (await response.json()) as BatchJobListResponse;
      setJobs(data.items);
      setActiveJob((current) => {
        if (!current) return data.items[0] ?? null;
        return data.items.find((item) => item.job_id === current.job_id) ?? data.items[0] ?? null;
      });
      setApiOnline(true);
    } catch {
      setApiOnline(false);
    } finally {
      setJobsLoading(false);
    }
  }

  function buildSimulationPayload() {
    return scenario === "code_review"
      ? {
          language,
          code_diff: codeDiff,
          review_focus: reviewFocus
            .split(/[,，\s]+/)
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
  }

  async function runSimulation() {
    setLoading(true);
    setError("");
    setCopied("");
    setConversation(null);

    const payload = buildSimulationPayload();

    try {
      const response = await fetch(`${apiBaseUrl}${endpoints[scenario]}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Simulation failed: ${response.status}`);
      const data = (await response.json()) as ConversationRecord;
      setConversation(data);
      setApiOnline(true);
      await loadHistory(1);
      await loadPersonas();
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

  async function startBatchJob() {
    setBatchLoading(true);
    setError("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          total: batchTotal,
          min_score: Number(minScore) || 0,
          payload: buildSimulationPayload(),
        }),
      });
      if (!response.ok) throw new Error(`Batch job failed: ${response.status}`);
      const data = (await response.json()) as BatchJobRecord;
      setActiveJob(data);
      setJobs((items) => [data, ...items.filter((item) => item.job_id !== data.job_id)]);
      setApiOnline(true);
      await loadJobs();
    } catch (jobError) {
      setApiOnline(false);
      setError(jobError instanceof Error ? jobError.message : "无法创建批量生成任务。");
    } finally {
      setBatchLoading(false);
    }
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
              选择业务场景、套用模板、生成中文多 Agent 对话，并在同一工作台筛选、搜索、翻页和导出可沉淀的 JSONL 数据。
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
                {formatGenerationMode(conversation.generation_mode)}
                {conversation.llm_provider ? ` / ${conversation.llm_provider}` : ""}
                {conversation.llm_model ? ` / ${conversation.llm_model}` : ""}
                <br />
                SCORE / {conversation.scoring_mode === "llm_judge" ? "LLM JUDGE" : "HEURISTIC"}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[0.92fr_1.08fr]">
          <section className="rounded-3xl border border-cyan-300/25 bg-white/[0.08] p-5 backdrop-blur">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                  Generator
                </p>
                <h2 className="mt-2 font-black text-white">{scenarioLabels[scenario]}任务</h2>
                <p className="mt-2 max-w-xl text-xs leading-5 text-zinc-400">
                  {activeDescriptor?.description ?? scenarioNotes[scenario]}
                </p>
              </div>
              <a
                href={exportUrl}
                target="_blank"
                className="rounded-full border border-lime-300/50 px-3 py-1.5 text-xs font-black text-lime-200"
              >
                导出当前筛选
              </a>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {(Object.keys(scenarioLabels) as ScenarioType[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setScenario(item)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    scenario === item
                      ? "border-cyan-300 bg-cyan-300/15 text-cyan-100"
                      : "border-white/10 bg-black/25 text-zinc-300 hover:border-cyan-300/40"
                  }`}
                >
                  <span className="text-sm font-black">{scenarioLabels[item]}</span>
                  <span className="mt-2 block text-xs leading-5 text-zinc-500">{scenarioNotes[item]}</span>
                </button>
              ))}
            </div>

            <ScenarioInfo descriptor={activeDescriptor} scenario={scenario} />

            <div className="mt-4 flex flex-wrap gap-2">
              {templates.map((template) => (
                <button
                  key={template.label}
                  type="button"
                  onClick={template.apply}
                  className="rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-xs font-bold text-zinc-200 hover:border-lime-300/50"
                >
                  {template.label}
                </button>
              ))}
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

            <BatchJobPanel
              batchTotal={batchTotal}
              setBatchTotal={setBatchTotal}
              activeJob={activeJob}
              jobs={jobs}
              loading={batchLoading || jobsLoading}
              canSubmit={canSubmit}
              onStart={startBatchJob}
              onRefresh={loadJobs}
              onSelect={setActiveJob}
            />

            <DatasetPanel
              history={history}
              loading={historyLoading}
              total={historyTotal}
              page={historyPage}
              totalPages={historyTotalPages}
              datasetScenario={datasetScenario}
              setDatasetScenario={setDatasetScenario}
              acceptedFilter={acceptedFilter}
              setAcceptedFilter={setAcceptedFilter}
              minScore={minScore}
              setMinScore={setMinScore}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={() => loadHistory(1)}
              onPageChange={loadHistory}
              onSelect={(item) => setConversation(item)}
              exportUrl={exportUrl}
            />
            <PersonaPoolPanel
              personas={personas}
              loading={personasLoading}
              activeScenario={scenario}
              onRefresh={loadPersonas}
            />
          </section>

          <div className="space-y-5">
            <ConversationPanel conversation={conversation} />
            <QualityPanel conversation={conversation} />
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

function formatGenerationMode(mode: string) {
  if (mode === "langgraph_routed_llm") return "Routed Agents LLM";
  if (mode === "langgraph_routed_mixed") return "Routed Agents Mixed";
  if (mode === "langgraph_routed_mock") return "Routed Agents Mock";
  if (mode === "langgraph_agent_llm") return "Agent Nodes LLM";
  if (mode === "langgraph_agent_mixed") return "Agent Nodes Mixed";
  if (mode === "langgraph_agent_mock") return "Agent Nodes Mock";
  if (mode === "langgraph_llm") return "LangGraph LLM";
  if (mode === "langgraph_mock") return "LangGraph Mock";
  if (mode === "llm") return "真实 LLM";
  if (mode === "mock") return "本地 Mock";
  return mode;
}

function formatWorkflowEngine(engine: string) {
  if (engine === "langgraph_memory_agents") return "Memory Agents";
  if (engine === "langgraph_conditional_agents") return "Conditional Agents";
  if (engine === "langgraph_agent_nodes") return "Agent Nodes";
  if (engine === "langgraph") return "LangGraph";
  if (engine === "legacy") return "Legacy";
  return engine;
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
        <p className="font-code text-cyan-200">POST {endpoints[scenario]}</p>
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

function BatchJobPanel({
  batchTotal,
  setBatchTotal,
  activeJob,
  jobs,
  loading,
  canSubmit,
  onStart,
  onRefresh,
  onSelect,
}: {
  batchTotal: number;
  setBatchTotal: (value: number) => void;
  activeJob: BatchJobRecord | null;
  jobs: BatchJobRecord[];
  loading: boolean;
  canSubmit: boolean;
  onStart: () => void;
  onRefresh: () => void;
  onSelect: (job: BatchJobRecord) => void;
}) {
  const progress = activeJob ? Math.round(((activeJob.completed + activeJob.failed) / activeJob.total) * 100) : 0;
  const statusClassName =
    activeJob?.status === "completed"
      ? "text-lime-300"
      : activeJob?.status === "failed"
        ? "text-red-300"
        : activeJob?.status === "running"
          ? "text-cyan-200"
          : "text-amber-200";

  return (
    <div className="mt-5 rounded-3xl border border-cyan-300/20 bg-black/25 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Batch Queue</p>
          <h3 className="mt-1 font-black text-white">批量生成任务队列</h3>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            提交后接口立即返回 job_id，后台按顺序生成样本、写入 SQLite，并持续更新进度。
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-full border border-cyan-300/40 px-3 py-1.5 text-xs font-black text-cyan-100"
        >
          {loading ? "刷新中..." : "刷新任务"}
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
          批量数量：{batchTotal}
          <input
            type="range"
            min={1}
            max={20}
            value={batchTotal}
            onChange={(event) => setBatchTotal(Number(event.target.value))}
            className="mt-3 w-full"
          />
        </label>
        <button
          type="button"
          onClick={onStart}
          disabled={!canSubmit || loading}
          className="rounded-full bg-cyan-300 px-5 py-3 text-sm font-black text-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-500"
        >
          {loading ? "提交中..." : "启动批量任务"}
        </button>
      </div>

      {activeJob ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.12em]">
            <span className="text-zinc-400">{activeJob.job_id}</span>
            <span className={statusClassName}>{activeJob.status}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black">
            <div className="h-full rounded-full bg-cyan-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-3 grid gap-2 text-xs text-zinc-400 sm:grid-cols-4">
            <span>完成 {activeJob.completed}/{activeJob.total}</span>
            <span>通过 {activeJob.accepted}</span>
            <span>失败 {activeJob.failed}</span>
            <span>{formatTime(activeJob.created_at)}</span>
          </div>
          {activeJob.error ? <p className="mt-2 text-xs leading-5 text-amber-300">{activeJob.error}</p> : null}
        </div>
      ) : (
        <p className="mt-3 rounded-2xl border border-dashed border-white/15 p-4 text-xs text-zinc-500">
          暂无批量任务。先配置当前场景素材，然后启动批量任务。
        </p>
      )}

      {jobs.length > 0 ? (
        <div className="mt-3 grid gap-2">
          {jobs.slice(0, 4).map((job) => (
            <button
              key={job.job_id}
              type="button"
              onClick={() => onSelect(job)}
              className="rounded-2xl border border-white/10 bg-black/20 p-3 text-left text-xs transition hover:border-cyan-300/40"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-zinc-200">{job.job_id}</span>
                <span className="text-zinc-500">
                  {scenarioLabels[job.scenario]} / {job.status} / {job.completed + job.failed}/{job.total}
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DatasetPanel({
  history,
  loading,
  total,
  page,
  totalPages,
  datasetScenario,
  setDatasetScenario,
  acceptedFilter,
  setAcceptedFilter,
  minScore,
  setMinScore,
  searchQuery,
  setSearchQuery,
  onSearch,
  onPageChange,
  onSelect,
  exportUrl,
}: {
  history: ConversationRecord[];
  loading: boolean;
  total: number;
  page: number;
  totalPages: number;
  datasetScenario: ScenarioFilter;
  setDatasetScenario: (value: ScenarioFilter) => void;
  acceptedFilter: AcceptedFilter;
  setAcceptedFilter: (value: AcceptedFilter) => void;
  minScore: string;
  setMinScore: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onSearch: () => void;
  onPageChange: (page: number) => void;
  onSelect: (item: ConversationRecord) => void;
  exportUrl: string;
}) {
  return (
    <div className="mt-5 rounded-3xl border border-white/10 bg-black/25 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Dataset Manager</p>
          <h3 className="mt-1 font-black text-white">数据筛选、搜索与导出</h3>
        </div>
        <a
          href={exportUrl}
          target="_blank"
          className="rounded-full border border-lime-300/50 px-3 py-1.5 text-xs font-black text-lime-200"
        >
          导出 JSONL
        </a>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <label className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
          场景
          <select
            value={datasetScenario}
            onChange={(event) => setDatasetScenario(event.target.value as ScenarioFilter)}
            className={inputClassName()}
          >
            <option value="current">当前场景</option>
            <option value="all">全部场景</option>
            <option value="code_review">代码审查</option>
            <option value="customer_complaint">客服投诉</option>
            <option value="technical_interview">技术面试</option>
          </select>
        </label>
        <label className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
          结果
          <select
            value={acceptedFilter}
            onChange={(event) => setAcceptedFilter(event.target.value as AcceptedFilter)}
            className={inputClassName()}
          >
            <option value="all">全部</option>
            <option value="accepted">已通过</option>
            <option value="rejected">未通过</option>
          </select>
        </label>
        <label className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
          最低分
          <select value={minScore} onChange={(event) => setMinScore(event.target.value)} className={inputClassName()}>
            <option value="0">不限</option>
            <option value="6">6+</option>
            <option value="7">7+</option>
            <option value="8">8+</option>
            <option value="9">9+</option>
          </select>
        </label>
        <label className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
          搜索
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="关键词 / Agent / 任务"
            className={inputClassName()}
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onSearch}
          className="rounded-full bg-cyan-300 px-4 py-2 text-xs font-black text-zinc-950"
        >
          应用筛选
        </button>
        <span className="text-xs font-bold text-zinc-500">
          {loading ? "加载中..." : `共 ${total} 条 / 第 ${page} 页 / ${totalPages} 页`}
        </span>
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
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-bold text-zinc-200">{item.conversation_id}</span>
                <span className={item.accepted ? "text-lime-300" : "text-amber-300"}>
                  {item.accepted ? "通过" : "待筛"} / {item.scores.final_score.toFixed(2)}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
                <span>{scenarioLabels[item.scenario as ScenarioType] ?? item.scenario}</span>
                <span>{formatTime(item.created_at)}</span>
                <span>{formatGenerationMode(item.generation_mode)}</span>
                <span>{formatWorkflowEngine(item.workflow_engine)}</span>
                <span>{item.scoring_mode === "llm_judge" ? "LLM 评分" : "规则评分"}</span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-2xl border border-dashed border-white/15 p-4 text-xs text-zinc-500">
          当前筛选条件下暂无数据。
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1 || loading}
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-black text-zinc-200 disabled:cursor-not-allowed disabled:text-zinc-600"
        >
          上一页
        </button>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages || loading}
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-black text-zinc-200 disabled:cursor-not-allowed disabled:text-zinc-600"
        >
          下一页
        </button>
      </div>
    </div>
  );
}

function PersonaPoolPanel({
  personas,
  loading,
  activeScenario,
  onRefresh,
}: {
  personas: PersonaRecord[];
  loading: boolean;
  activeScenario: ScenarioType;
  onRefresh: () => void;
}) {
  const activePersonas = personas.filter((persona) => persona.scenario === activeScenario);
  const visiblePersonas = activePersonas.length > 0 ? activePersonas : personas.slice(0, 8);

  return (
    <div className="mt-5 rounded-3xl border border-white/10 bg-black/25 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">Persona Memory</p>
          <h3 className="mt-1 font-black text-white">Agent Persona 池</h3>
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            当前场景会优先选择权重和历史表现更高的 Persona；生成完成后自动更新使用次数、均分、权重和记忆。
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-full border border-cyan-300/40 px-3 py-1.5 text-xs font-black text-cyan-100"
        >
          {loading ? "刷新中..." : "刷新"}
        </button>
      </div>

      {visiblePersonas.length > 0 ? (
        <div className="mt-4 grid gap-3">
          {visiblePersonas.map((persona) => (
            <article key={persona.persona_id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-zinc-100">
                    {persona.name} / {translateRole(persona.role)}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {scenarioLabels[persona.scenario as ScenarioType] ?? persona.scenario}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-black">
                  <span className="rounded-full bg-cyan-300/10 px-2 py-1 text-cyan-100">
                    {persona.usage_count} 次
                  </span>
                  <span className="rounded-full bg-lime-300/10 px-2 py-1 text-lime-100">
                    均分 {persona.average_score.toFixed(2)}
                  </span>
                  <span className="rounded-full bg-white/10 px-2 py-1 text-zinc-200">
                    权重 {persona.weight.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-xs leading-5 text-zinc-400 sm:grid-cols-2">
                <p>性格：{persona.personality}</p>
                <p>关注：{persona.focus}</p>
              </div>
              <p className="mt-3 rounded-xl border border-white/10 bg-black/25 p-3 text-xs leading-5 text-zinc-400">
                {persona.memory_notes[0] ?? "等待真实生成结果积累记忆。"}
              </p>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <MemoryList title="成功经验" items={persona.success_patterns ?? []} tone="lime" />
                <MemoryList title="失败教训" items={persona.failure_patterns ?? []} tone="amber" />
                <MemoryList title="策略建议" items={persona.strategy_notes ?? []} tone="cyan" />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-2xl border border-dashed border-white/15 p-4 text-xs text-zinc-500">
          后端启动后会自动初始化默认 Persona 池。
        </p>
      )}
    </div>
  );
}

function MemoryList({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "lime" | "amber" | "cyan";
}) {
  const toneClassName =
    tone === "lime"
      ? "border-lime-300/20 bg-lime-300/[0.06] text-lime-100"
      : tone === "amber"
        ? "border-amber-300/20 bg-amber-300/[0.06] text-amber-100"
        : "border-cyan-300/20 bg-cyan-300/[0.06] text-cyan-100";
  const visibleItems = items.slice(0, 2);

  return (
    <div className={`rounded-2xl border p-3 ${toneClassName}`}>
      <p className="text-xs font-black">{title}</p>
      {visibleItems.length > 0 ? (
        <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
          {visibleItems.map((item, index) => (
            <li key={`${title}-${index}-${item}`}>- {item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs leading-5 text-zinc-500">暂无长期记忆</p>
      )}
    </div>
  );
}

function ConversationPanel({ conversation }: { conversation: ConversationRecord | null }) {
  return (
    <section className="rounded-3xl border border-cyan-300/25 bg-white/[0.08] p-5 backdrop-blur">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Agent Conversation</p>
      <h2 className="mt-2 font-black text-white">模拟对话</h2>

      {conversation ? (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-2">
            {conversation.agents.map((agent) => (
              <span
                key={agent.agent_id}
                className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100"
              >
                {translateRole(agent.role)} / {agent.name ?? agent.personality}
              </span>
            ))}
          </div>
          {conversation.messages.map((message) => (
            <article key={`${conversation.conversation_id}-${message.turn}`} className="rounded-2xl border border-white/10 bg-black/25 p-4">
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

function QualityPanel({ conversation }: { conversation: ConversationRecord | null }) {
  return (
    <section className="rounded-3xl border border-cyan-300/25 bg-white/[0.08] p-5 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Quality Scorer</p>
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
            value={`${formatGenerationMode(conversation.generation_mode)}${
              conversation.llm_provider ? ` / ${conversation.llm_provider}` : ""
            }${conversation.llm_model ? ` / ${conversation.llm_model}` : ""}`}
            warning={conversation.llm_error ? `LLM 回退原因：${conversation.llm_error}` : ""}
          />
          <MetaPanel
            title="工作流"
            value={`${formatWorkflowEngine(conversation.workflow_engine)} / ${conversation.agent_trace.length} Agent Turns`}
            feedback={conversation.workflow_steps.map((step, index) => `${index + 1}. ${step}`)}
          />
          <MetaPanel
            title="Agent 执行轨迹"
            value={`${conversation.agent_trace.filter((item) => item.mode === "llm").length} LLM / ${
              conversation.agent_trace.filter((item) => item.mode === "mock").length
            } Mock`}
            feedback={conversation.agent_trace.map(
              (item) =>
                `${item.turn}. ${translateRole(item.role)} / ${item.node} / ${item.mode.toUpperCase()}${
                  typeof item.memory_context_count === "number" ? ` / Memory ${item.memory_context_count}` : ""
                }${
                  item.route_reason ? ` / ${item.route_reason}` : ""
                }`,
            )}
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
