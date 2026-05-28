"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ParticleField from "../../components/ParticleField";
import {
  BatchJobPanel,
  CodeReviewForm,
  ConversationPanel,
  CustomerComplaintForm,
  DatasetPanel,
  PersonaPoolPanel,
  QualityPanel,
  ScenarioInfo,
  TechnicalInterviewForm,
  formatGenerationMode,
  formatScoringMode,
  inputClassName,
} from "./components";
import {
  apiBaseUrl,
  endpoints,
  pageSize,
  scenarioLabels,
  scenarioNotes,
  type AcceptedFilter,
  type BatchJobListResponse,
  type BatchJobRecord,
  type ConversationListResponse,
  type ConversationRecord,
  type DatasetVersionListResponse,
  type DatasetVersionRecord,
  type PersonaListResponse,
  type PersonaRecord,
  type ScenarioDescriptor,
  type ScenarioFilter,
  type ScenarioType,
  type Template,
} from "./shared";

export default function MultiAgentDataFactoryProductPage() {
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
  const [datasetVersions, setDatasetVersions] = useState<DatasetVersionRecord[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [versionName, setVersionName] = useState("");
  const [versionDescription, setVersionDescription] = useState("");
  const [deletingVersionId, setDeletingVersionId] = useState("");
  const [adminApiKey, setAdminApiKey] = useState("");

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
    "候选人有 Python、FastAPI 和本地 RAG 项目经验，了解向量检索和 DeepSeek API，但生产级监控、评估和故障恢复经验较少。",
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
  const [deletingConversationId, setDeletingConversationId] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const isAdminMode = adminApiKey.trim().length > 0;
  const adminHeaders = useMemo(
    () => ({
      "X-Admin-API-Key": adminApiKey.trim(),
    }),
    [adminApiKey],
  );

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
        const [
          healthResponse,
          scenariosResponse,
          historyResponse,
          personasResponse,
          jobsResponse,
          versionsResponse,
        ] = await Promise.all([
          fetch(`${apiBaseUrl}/health`),
          fetch(`${apiBaseUrl}/api/scenarios`),
          fetch(`${apiBaseUrl}/api/conversations?scenario=code_review&page=1&page_size=${pageSize}`),
          fetch(`${apiBaseUrl}/api/personas`),
          fetch(`${apiBaseUrl}/api/jobs`),
          fetch(`${apiBaseUrl}/api/datasets/versions`),
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
        if (versionsResponse.ok) {
          const data = (await versionsResponse.json()) as DatasetVersionListResponse;
          setDatasetVersions(data.items);
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
          setCandidateProfile("候选人有 Python、FastAPI 和本地 RAG 项目经验，了解向量检索和 DeepSeek API，但生产级经验较少。");
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
          setCandidateProfile("候选人做过 RAG 和工具调用项目，但还没有完整落地过多 Agent 状态机。");
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

  async function loadDatasetVersions() {
    setVersionsLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/datasets/versions`);
      if (!response.ok) throw new Error("dataset versions failed");
      const data = (await response.json()) as DatasetVersionListResponse;
      setDatasetVersions(data.items);
      setApiOnline(true);
    } catch {
      setApiOnline(false);
    } finally {
      setVersionsLoading(false);
    }
  }

  async function createDatasetVersion() {
    if (!isAdminMode) {
      setError("需要管理员密钥才能创建数据集版本。");
      return;
    }
    const name = versionName.trim() || `dataset-${new Date().toISOString().slice(0, 10)}`;
    setVersionsLoading(true);
    setError("");
    try {
      const params = buildDatasetParams(1);
      const payload = {
        name,
        description: versionDescription.trim() || undefined,
        scenario: params.get("scenario") || undefined,
        accepted:
          params.get("accepted") === null
            ? undefined
            : params.get("accepted") === "true",
        min_score: params.get("min_score") ? Number(params.get("min_score")) : undefined,
        q: params.get("q") || undefined,
      };
      const response = await fetch(`${apiBaseUrl}/api/datasets/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...adminHeaders },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`Create dataset version failed: ${response.status}`);
      const data = (await response.json()) as DatasetVersionRecord;
      setDatasetVersions((items) => [data, ...items.filter((item) => item.version_id !== data.version_id)]);
      setVersionName("");
      setVersionDescription("");
      setApiOnline(true);
    } catch (versionError) {
      setApiOnline(false);
      setError(versionError instanceof Error ? versionError.message : "创建数据集版本失败。");
    } finally {
      setVersionsLoading(false);
    }
  }

  async function deleteDatasetVersion(version: DatasetVersionRecord) {
    if (!isAdminMode) {
      setError("需要管理员密钥才能删除数据集版本。");
      return;
    }
    const confirmed = window.confirm(`确定删除数据集版本 ${version.name} 吗？这不会删除原始 conversation。`);
    if (!confirmed) return;

    setDeletingVersionId(version.version_id);
    setError("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/datasets/versions/${version.version_id}`, {
        method: "DELETE",
        headers: adminHeaders,
      });
      if (!response.ok) throw new Error(`Delete dataset version failed: ${response.status}`);
      setDatasetVersions((items) => items.filter((item) => item.version_id !== version.version_id));
      setApiOnline(true);
    } catch (versionError) {
      setApiOnline(false);
      setError(versionError instanceof Error ? versionError.message : "删除数据集版本失败。");
    } finally {
      setDeletingVersionId("");
    }
  }

  async function deleteConversationItem(item: ConversationRecord) {
    if (!isAdminMode) {
      setError("需要管理员密钥才能删除数据。");
      return;
    }
    const confirmed = window.confirm(`确定删除数据 ${item.conversation_id} 吗？删除后不会出现在筛选、搜索和导出结果中。`);
    if (!confirmed) return;

    setDeletingConversationId(item.conversation_id);
    setError("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/conversations/${item.conversation_id}`, {
        method: "DELETE",
        headers: adminHeaders,
      });
      if (!response.ok) throw new Error(`Delete failed: ${response.status}`);
      if (conversation?.conversation_id === item.conversation_id) {
        setConversation(null);
      }
      await loadHistory(historyPage);
      await loadJobs();
      await loadDatasetVersions();
      setApiOnline(true);
    } catch (deleteError) {
      setApiOnline(false);
      setError(deleteError instanceof Error ? deleteError.message : "删除数据失败。");
    } finally {
      setDeletingConversationId("");
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
    if (!isAdminMode) {
      setError("需要管理员密钥才能启动批量任务。");
      return;
    }
    setBatchLoading(true);
    setError("");
    try {
      const response = await fetch(`${apiBaseUrl}/api/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...adminHeaders },
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
    <main className="lab-product-theme min-h-screen overflow-hidden bg-[#05070b] text-zinc-100">
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
                SCORE / {formatScoringMode(conversation.scoring_mode)}
              </div>
            ) : null}
          </div>
        </div>

        <section className="mt-5 rounded-3xl border border-cyan-300/20 bg-white/[0.08] p-4 backdrop-blur">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
            <label className="text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
              Admin Mode
              <input
                type="password"
                value={adminApiKey}
                onChange={(event) => setAdminApiKey(event.target.value)}
                placeholder="ADMIN_API_KEY"
                className={inputClassName()}
              />
            </label>
            <span
              className={`rounded-full border px-3 py-2 text-xs font-black ${
                isAdminMode
                  ? "border-lime-300/50 bg-lime-300/10 text-lime-200"
                  : "border-white/15 bg-black/25 text-zinc-500"
              }`}
            >
              {isAdminMode ? "ADMIN ENABLED" : "READ ONLY"}
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 text-zinc-500">
            单次生成对普通访客开放并按 IP 限流；批量任务、删除数据和数据集版本管理需要管理员密钥。
          </p>
        </section>

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
                className="rounded-full bg-cyan-600 px-5 py-3 text-sm font-black text-white shadow-[0_0_0_1px_rgba(103,232,249,0.35)] transition hover:bg-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 disabled:shadow-none"
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
              isAdminMode={isAdminMode}
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
              onDelete={deleteConversationItem}
              deletingConversationId={deletingConversationId}
              exportUrl={exportUrl}
              versionName={versionName}
              setVersionName={setVersionName}
              versionDescription={versionDescription}
              setVersionDescription={setVersionDescription}
              versions={datasetVersions}
              versionsLoading={versionsLoading}
              deletingVersionId={deletingVersionId}
              isAdminMode={isAdminMode}
              onCreateVersion={createDatasetVersion}
              onRefreshVersions={loadDatasetVersions}
              onDeleteVersion={deleteDatasetVersion}
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
