"use client";
import {
  apiBaseUrl,
  endpoints,
  roleLabels,
  scenarioLabels,
  scenarioNotes,
  scoreLabels,
  type AcceptedFilter,
  type BatchJobRecord,
  type ConversationRecord,
  type DatasetVersionRecord,
  type PersonaRecord,
  type ScenarioDescriptor,
  type ScenarioFilter,
  type ScenarioType,
} from "./shared";

export function translateRole(role: string) {
  return roleLabels[role] ?? role;
}

export function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatGenerationMode(mode: string) {
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

export function formatWorkflowEngine(engine: string) {
  if (engine === "langgraph_memory_agents") return "Memory Agents";
  if (engine === "langgraph_conditional_agents") return "Conditional Agents";
  if (engine === "langgraph_agent_nodes") return "Agent Nodes";
  if (engine === "langgraph") return "LangGraph";
  if (engine === "legacy") return "Legacy";
  return engine;
}

export function formatScoringMode(mode: string) {
  if (mode === "enhanced_multi_judge") return "Enhanced Multi-Judge";
  if (mode === "heuristic_multi_judge") return "Heuristic Multi-Judge";
  if (mode === "llm_judge") return "LLM-as-a-Judge";
  if (mode === "heuristic") return "规则评分";
  return mode;
}

export function inputClassName() {
  return "mt-2 w-full rounded-xl border border-white/15 bg-black/50 p-3 text-sm text-white outline-none focus:border-cyan-300";
}

function textareaClassName(extra = "min-h-56") {
  return `mt-2 ${extra} w-full resize-none rounded-2xl border border-white/15 bg-black/60 p-4 text-sm leading-7 text-white outline-none focus:border-lime-300`;
}

export function ScenarioInfo({
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

export function CodeReviewForm({
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

export function CustomerComplaintForm({
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

export function TechnicalInterviewForm({
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

export function BatchJobPanel({
  batchTotal,
  setBatchTotal,
  activeJob,
  jobs,
  loading,
  canSubmit,
  isAdminMode,
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
  isAdminMode: boolean;
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

      {isAdminMode ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
            生成数量：{batchTotal}
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
      ) : (
        <p className="mt-4 rounded-2xl border border-dashed border-white/15 p-4 text-xs leading-5 text-zinc-500">
          当前为只读模式。输入管理员密钥后可启动批量任务。
        </p>
      )}

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

export function DatasetPanel({
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
  onDelete,
  deletingConversationId,
  exportUrl,
  versionName,
  setVersionName,
  versionDescription,
  setVersionDescription,
  versions,
  versionsLoading,
  deletingVersionId,
  isAdminMode,
  onCreateVersion,
  onRefreshVersions,
  onDeleteVersion,
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
  onDelete: (item: ConversationRecord) => void;
  deletingConversationId: string;
  exportUrl: string;
  versionName: string;
  setVersionName: (value: string) => void;
  versionDescription: string;
  setVersionDescription: (value: string) => void;
  versions: DatasetVersionRecord[];
  versionsLoading: boolean;
  deletingVersionId: string;
  isAdminMode: boolean;
  onCreateVersion: () => void;
  onRefreshVersions: () => void;
  onDeleteVersion: (version: DatasetVersionRecord) => void;
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
            <option value="3">3+</option>
            <option value="3.5">3.5+</option>
            <option value="4">4+</option>
            <option value="4.5">4.5+</option>
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

      <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.04] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-100">Dataset Versions</p>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Save the current filter result as an immutable conversation id snapshot.
            </p>
          </div>
          <button
            type="button"
            onClick={onRefreshVersions}
            className="rounded-full border border-cyan-300/40 px-3 py-1.5 text-xs font-black text-cyan-100"
          >
            {versionsLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {isAdminMode ? (
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <input
              value={versionName}
              onChange={(event) => setVersionName(event.target.value)}
              placeholder="Version name"
              className={inputClassName()}
            />
            <input
              value={versionDescription}
              onChange={(event) => setVersionDescription(event.target.value)}
              placeholder="Description"
              className={inputClassName()}
            />
            <button
              type="button"
              onClick={onCreateVersion}
              disabled={versionsLoading}
              className="rounded-full bg-lime-300 px-4 py-2 text-xs font-black text-zinc-950 disabled:cursor-not-allowed disabled:bg-zinc-500"
            >
              Create Version
            </button>
          </div>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-white/15 p-4 text-xs leading-5 text-zinc-500">
            当前为只读模式。输入管理员密钥后可创建数据集版本。
          </p>
        )}

        {versions.length > 0 ? (
          <div className="mt-3 grid gap-2">
            {versions.slice(0, 5).map((version) => (
              <article key={version.version_id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-zinc-100">{version.name}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {version.version_id} / {version.total} rows / avg {version.average_score.toFixed(2)} / {formatTime(version.created_at)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      duplicates {version.duplicate_count} / rate {(version.duplicate_rate * 100).toFixed(0)}% / diversity {(version.diversity_score * 100).toFixed(0)}%
                    </p>
                    {version.description ? (
                      <p className="mt-1 text-xs leading-5 text-zinc-400">{version.description}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`${apiBaseUrl}/api/datasets/versions/${version.version_id}/export.jsonl`}
                      target="_blank"
                      className="rounded-full border border-lime-300/40 px-3 py-1.5 text-xs font-black text-lime-100"
                    >
                      Export
                    </a>
                    {isAdminMode ? (
                      <button
                        type="button"
                        onClick={() => onDeleteVersion(version)}
                        disabled={deletingVersionId === version.version_id}
                        className="rounded-full border border-red-300/35 px-3 py-1.5 text-xs font-black text-red-200 transition hover:border-red-300 hover:bg-red-300/10 disabled:cursor-not-allowed disabled:text-zinc-600"
                      >
                        {deletingVersionId === version.version_id ? "Deleting" : "Delete"}
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-3 rounded-2xl border border-dashed border-white/15 p-4 text-xs text-zinc-500">
            No dataset versions yet.
          </p>
        )}
      </div>

      {history.length > 0 ? (
        <div className="mt-3 grid gap-2">
          {history.map((item) => (
            <article
              key={item.conversation_id}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition hover:border-cyan-300/40"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <button type="button" onClick={() => onSelect(item)} className="min-w-0 flex-1 text-left">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="font-bold text-zinc-200">{item.conversation_id}</span>
                    <span className={item.accepted ? "text-lime-300" : "text-amber-300"}>
                      {item.accepted ? "\u901a\u8fc7" : "\u5f85\u7b5b"} / {item.scores.final_score.toFixed(2)} / 5
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-zinc-500">
                    <span>{scenarioLabels[item.scenario as ScenarioType] ?? item.scenario}</span>
                    <span>{formatTime(item.created_at)}</span>
                    <span>{formatGenerationMode(item.generation_mode)}</span>
                    <span>{formatWorkflowEngine(item.workflow_engine)}</span>
                    <span>{formatScoringMode(item.scoring_mode)}</span>
                    {item.diversity_report ? (
                      <span className={item.diversity_report.duplicate_level === "unique" ? "text-lime-300" : "text-amber-300"}>
                        diversity {item.diversity_report.duplicate_level} / sim {(item.similarity_score ?? item.diversity_report.similarity_score).toFixed(2)}
                      </span>
                    ) : null}
                  </div>
                </button>
                {isAdminMode ? (
                  <button
                    type="button"
                    onClick={() => onDelete(item)}
                    disabled={deletingConversationId === item.conversation_id}
                    className="rounded-full border border-red-300/35 px-3 py-1.5 text-xs font-black text-red-200 transition hover:border-red-300 hover:bg-red-300/10 disabled:cursor-not-allowed disabled:text-zinc-600"
                  >
                    {deletingConversationId === item.conversation_id ? "删除中" : "删除"}
                  </button>
                ) : null}
              </div>
            </article>
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

export function PersonaPoolPanel({
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

export function ConversationPanel({ conversation }: { conversation: ConversationRecord | null }) {
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

export function QualityPanel({ conversation }: { conversation: ConversationRecord | null }) {
  return (
    <section className="rounded-3xl border border-cyan-300/25 bg-white/[0.08] p-5 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Quality Scorer</p>
          <h2 className="mt-2 font-black text-white">数据质量评分</h2>
        </div>
        {conversation ? (
          <span className="rounded-full border border-lime-300 bg-lime-300 px-3 py-1 text-xs font-black text-zinc-950">
            {conversation.accepted ? "ACCEPTED" : "REJECTED"} / {conversation.scores.final_score.toFixed(2)} / 5
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
            value={`${formatScoringMode(conversation.scoring_mode)}${
              conversation.scoring_provider ? ` / ${conversation.scoring_provider}` : ""
            }${conversation.scoring_model ? ` / ${conversation.scoring_model}` : ""}`}
            warning={conversation.scoring_error ? `评分回退原因：${conversation.scoring_error}` : ""}
            feedback={conversation.score_feedback}
          />
          {conversation.quality_report ? (
            <div className="rounded-2xl border border-lime-300/20 bg-lime-300/[0.06] p-3 sm:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.12em] text-zinc-400">
                <span>Quality Report</span>
                <span>
                  Grade {conversation.quality_report.grade} / {conversation.quality_report.decision.toUpperCase()} / {conversation.quality_report.score_scale ?? "0-5"} / threshold {conversation.quality_report.pass_threshold.toFixed(1)}
                </span>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <QualityList title="Judge Votes" items={conversation.quality_report.judge_votes.map((vote) => `${vote.judge}: ${vote.vote} - ${vote.reason}`)} />
                <QualityList
                  title="Weaknesses"
                  items={
                    conversation.quality_report.weaknesses.length
                      ? conversation.quality_report.weaknesses
                      : conversation.quality_report.rejection_reasons
                  }
                />
                <QualityList title="Actions" items={conversation.quality_report.improvement_actions} />
              </div>
            </div>
          ) : null}
          {conversation.diversity_report ? (
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-3 sm:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-black uppercase tracking-[0.12em] text-zinc-400">
                <span>Diversity Control</span>
                <span>
                  {conversation.diversity_report.duplicate_level} / sim {conversation.diversity_report.similarity_score.toFixed(2)} / unique {conversation.diversity_report.uniqueness_score.toFixed(2)}
                </span>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-zinc-400">Hash</p>
                  <p className="mt-2 break-all text-xs leading-5 text-zinc-300">
                    {conversation.diversity_report.content_hash}
                  </p>
                  {conversation.diversity_report.duplicate_of ? (
                    <p className="mt-2 break-all text-xs leading-5 text-amber-200">
                      duplicate of {conversation.diversity_report.duplicate_of}
                    </p>
                  ) : null}
                </div>
                <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-zinc-400">Recommendation</p>
                  <p className="mt-2 text-xs leading-5 text-zinc-300">
                    {conversation.diversity_report.recommendation}
                  </p>
                </div>
              </div>
              {conversation.diversity_report.signals.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {conversation.diversity_report.signals.map((signal) => (
                    <span key={signal} className="rounded-full border border-cyan-300/25 px-2 py-1 text-xs font-bold text-cyan-100">
                      {signal}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
          {scoreLabels.map(([key, label]) => (
            <div key={key} className="rounded-2xl border border-white/10 bg-black/25 p-3">
              <div className="flex justify-between text-xs font-black uppercase tracking-[0.12em] text-zinc-400">
                <span>{label}</span>
                <span>{conversation.scores[key].toFixed(1)} / 5</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-black">
                <div
                  className="h-full rounded-full bg-cyan-300"
                  style={{ width: `${Math.min(100, Math.max(0, (conversation.scores[key] / 5) * 100))}%` }}
                />
              </div>
            </div>
          ))}
          {conversation.quality_report?.dimension_diagnostics?.length ? (
            <div className="rounded-2xl border border-white/10 bg-black/25 p-3 sm:col-span-2">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-zinc-400">Dimension Diagnostics</p>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {conversation.quality_report.dimension_diagnostics.map((item) => (
                  <div key={item.dimension} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    <div className="flex items-center justify-between gap-3 text-xs font-black text-zinc-300">
                      <span>{item.label}</span>
                      <span>{item.score.toFixed(1)} / 5 / {item.pass === false ? "fail" : "pass"} / {item.level}</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-zinc-500">{item.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-white/20 p-8 text-sm text-zinc-400">
          生成后这里会展示评分模式、中文质量评语和各维度分数。
        </div>
      )}
    </section>
  );
}

function QualityList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-zinc-400">{title}</p>
      {items.length > 0 ? (
        <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-300">
          {items.slice(0, 4).map((item, index) => (
            <li key={`${title}-${index}-${item}`}>- {item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs leading-5 text-zinc-500">暂无明显风险。</p>
      )}
    </div>
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
