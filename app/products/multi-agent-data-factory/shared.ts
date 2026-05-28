import { multiAgentApiBaseUrl } from "../../config/api";

export type ScenarioType = "code_review" | "customer_complaint" | "technical_interview";
export type ScenarioFilter = "current" | "all" | ScenarioType;
export type AcceptedFilter = "all" | "accepted" | "rejected";

export type Persona = {
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

export type Message = {
  turn: number;
  agent_id: string;
  role: string;
  content: string;
};

export type QualityScores = {
  realism: number;
  difficulty: number;
  diversity: number;
  consistency: number;
  conflict: number;
  training_value: number;
  safety: number;
  final_score: number;
};

export type QualityReport = {
  grade: string;
  decision: string;
  pass_threshold: number;
  judge_votes: Array<{
    judge: string;
    vote: string;
    reason: string;
  }>;
  dimension_diagnostics: Array<{
    dimension: string;
    label: string;
    score: number;
    level: string;
    reason: string;
  }>;
  strengths: string[];
  weaknesses: string[];
  improvement_actions: string[];
  rejection_reasons: string[];
};

export type DiversityReport = {
  content_hash: string;
  duplicate_level: string;
  duplicate_of?: string | null;
  similarity_score: number;
  uniqueness_score: number;
  recommendation: string;
  signals: string[];
};

export type ConversationRecord = {
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
  quality_report?: QualityReport;
  content_hash?: string | null;
  duplicate_of?: string | null;
  similarity_score?: number;
  diversity_report?: DiversityReport;
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

export type ScenarioDescriptor = {
  name: string;
  title: string;
  description: string;
  status: string;
  agent_roles: string[];
  endpoint: string;
};

export type ConversationListResponse = {
  items: ConversationRecord[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type PersonaRecord = {
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

export type PersonaListResponse = {
  items: PersonaRecord[];
  total: number;
};

export type BatchJobRecord = {
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

export type BatchJobListResponse = {
  items: BatchJobRecord[];
  total: number;
};

export type DatasetVersionRecord = {
  version_id: string;
  name: string;
  description?: string | null;
  filters: Record<string, unknown>;
  conversation_ids: string[];
  total: number;
  accepted: number;
  average_score: number;
  duplicate_count: number;
  duplicate_rate: number;
  diversity_score: number;
  created_at: string;
};

export type DatasetVersionListResponse = {
  items: DatasetVersionRecord[];
  total: number;
};

export type Template = {
  label: string;
  apply: () => void;
};

export const apiBaseUrl = multiAgentApiBaseUrl;
export const pageSize = 10;

export const scenarioLabels: Record<ScenarioType, string> = {
  code_review: "代码审查",
  customer_complaint: "客服投诉",
  technical_interview: "技术面试",
};

export const scenarioNotes: Record<ScenarioType, string> = {
  code_review: "输入一段代码 diff，生成开发者、审查者、挑战者和裁判之间的中文代码审查讨论。",
  customer_complaint: "输入投诉背景、用户画像、情绪强度和企业政策，生成客服投诉处理训练对话。",
  technical_interview: "输入岗位、主题、候选人背景和考察上下文，生成技术面试问答、追问和能力评估。",
};

export const roleLabels: Record<string, string> = {
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

export const endpoints: Record<ScenarioType, string> = {
  code_review: "/api/simulations/code-review",
  customer_complaint: "/api/simulations/customer-complaint",
  technical_interview: "/api/simulations/technical-interview",
};

export const scoreLabels: Array<[keyof QualityScores, string]> = [
  ["realism", "真实感"],
  ["difficulty", "难度"],
  ["diversity", "多样性"],
  ["consistency", "一致性"],
  ["conflict", "冲突强度"],
  ["training_value", "训练价值"],
  ["safety", "安全性"],
];

