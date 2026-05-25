function normalizeApiBaseUrl(value: string | undefined, fallback: string) {
  const rawValue = value?.trim() || fallback;
  return rawValue.replace(/\/+$/, "");
}

export const ragApiBaseUrl = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_RAG_API_BASE_URL,
  "http://localhost:8000",
);

export const multiAgentApiBaseUrl = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_MULTI_AGENT_API_BASE_URL,
  "http://localhost:8001",
);
