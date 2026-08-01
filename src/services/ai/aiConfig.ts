/**
 * aiConfig.ts
 *
 * Strongly typed configuration for AI service providers.
 * Each inference service (Recommendation, Review) has its own independent
 * configuration object loaded from environment variables.
 *
 * No values are hardcoded in provider implementations.
 * Changing only environment variables is sufficient to:
 *   - Switch models
 *   - Adjust reasoning level
 *   - Adjust generation parameters
 *   - Enable or disable optional capabilities
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReasoningLevel = "low" | "medium" | "high";

/**
 * Full configuration for a single Groq inference service.
 * Maps 1-to-1 with environment variables; no runtime defaults live in the provider.
 */
export interface GroqServiceConfig {
  /** Groq API key for this service. May differ per service for billing/quota isolation. */
  apiKey: string;

  /** Groq model identifier, e.g. "llama-3.3-70b-versatile" */
  model: string;

  /** Maximum tokens the model may output. Null = use model default. */
  maxOutputTokens: number | null;

  /** Sampling temperature [0.0 – 2.0]. Lower = more deterministic. */
  temperature: number;

  /** Nucleus sampling probability mass [0.0 – 1.0]. */
  topP: number;

  /** Reasoning effort level passed to supported models. */
  reasoningLevel: ReasoningLevel;

  /** Whether to enable Groq's content moderation layer. */
  moderationEnabled: boolean;

  /** Whether the service may call a web-search tool (future capability). */
  webSearchEnabled: boolean;

  /** Whether the service may use a code interpreter tool (future capability). */
  codeInterpreterEnabled: boolean;

  /** Whether the service may perform tool/function calling (future capability). */
  toolCallingEnabled: boolean;

  /** Whether to use streaming completions (future capability). */
  streamingEnabled: boolean;

  /** Weekly token quota limit for Review AI. */
  weeklyTokenLimit?: number;

  /** Weekly request quota limit for Review AI (null = unlimited). */
  weeklyRequestLimit?: number | null;
}

// ─── Validation helpers ────────────────────────────────────────────────────────

const VALID_REASONING_LEVELS: ReasoningLevel[] = ["low", "medium", "high"];

function parseReasoningLevel(raw: string | undefined, fallback: ReasoningLevel): ReasoningLevel {
  if (!raw || raw.trim() === "") return fallback;
  const normalised = raw.trim().toLowerCase() as ReasoningLevel;
  if (VALID_REASONING_LEVELS.includes(normalised)) return normalised;
  console.warn(
    `[aiConfig] Invalid REASONING_LEVEL "${raw}" — valid values: low | medium | high. Falling back to "${fallback}".`
  );
  return fallback;
}

function parseFloat_clamped(
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
  label: string
): number {
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = parseFloat(raw);
  if (isNaN(n)) {
    console.warn(`[aiConfig] Invalid float "${raw}" for ${label} — using default (${fallback}).`);
    return fallback;
  }
  if (n < min || n > max) {
    console.warn(
      `[aiConfig] ${label} value ${n} is outside [${min}, ${max}] — clamping.`
    );
    return Math.min(Math.max(n, min), max);
  }
  return n;
}

function parseInt_positive(
  raw: string | undefined,
  fallback: number | null,
  label: string
): number | null {
  if (raw === undefined || raw.trim() === "") return fallback;
  const n = parseInt(raw, 10);
  if (isNaN(n) || n <= 0) {
    console.warn(`[aiConfig] Invalid integer "${raw}" for ${label} — must be a positive integer. Using default.`);
    return fallback;
  }
  return n;
}

function parseBool(raw: string | undefined, fallback: boolean): boolean {
  if (raw === undefined || raw.trim() === "") return fallback;
  const normalised = raw.trim().toLowerCase();
  if (normalised === "true" || normalised === "false") {
    return normalised === "true";
  }
  console.warn(`[aiConfig] Invalid boolean "${raw}" — expected "true" or "false". Using default (${fallback}).`);
  return fallback;
}

// ─── Default values ────────────────────────────────────────────────────────────

const RECOMMENDATION_DEFAULTS = {
  model: "llama-3.3-70b-versatile",
  maxOutputTokens: null as number | null,
  temperature: 0.2,
  topP: 1.0,
  reasoningLevel: "medium" as ReasoningLevel,
  moderationEnabled: true,
  webSearchEnabled: false,
  codeInterpreterEnabled: false,
  toolCallingEnabled: false,
  streamingEnabled: false
} as const;

const REVIEW_DEFAULTS = {
  model: "llama-3.3-70b-versatile",
  maxOutputTokens: null as number | null,
  temperature: 0.15,
  topP: 1.0,
  reasoningLevel: "high" as ReasoningLevel,
  moderationEnabled: true,
  webSearchEnabled: false,
  codeInterpreterEnabled: false,
  toolCallingEnabled: false,
  streamingEnabled: false,
  weeklyTokenLimit: 50000,
  weeklyRequestLimit: null as number | null
} as const;

// ─── Loaders ───────────────────────────────────────────────────────────────────

const env = () =>
  typeof process !== "undefined" && process.env ? process.env : ({} as NodeJS.ProcessEnv);

export function loadRecommendationConfig(): GroqServiceConfig {
  const e = env();
  return {
    apiKey: e.GROQ_RECOMMENDATION_API_KEY || e.GROQ_API_KEY || "",
    model:
      (e.GROQ_RECOMMENDATION_MODEL || "").trim() || RECOMMENDATION_DEFAULTS.model,
    maxOutputTokens: parseInt_positive(
      e.GROQ_RECOMMENDATION_MAX_OUTPUT_TOKENS,
      RECOMMENDATION_DEFAULTS.maxOutputTokens,
      "GROQ_RECOMMENDATION_MAX_OUTPUT_TOKENS"
    ),
    temperature: parseFloat_clamped(
      e.GROQ_RECOMMENDATION_TEMPERATURE,
      RECOMMENDATION_DEFAULTS.temperature,
      0, 2,
      "GROQ_RECOMMENDATION_TEMPERATURE"
    ),
    topP: parseFloat_clamped(
      e.GROQ_RECOMMENDATION_TOP_P,
      RECOMMENDATION_DEFAULTS.topP,
      0, 1,
      "GROQ_RECOMMENDATION_TOP_P"
    ),
    reasoningLevel: parseReasoningLevel(
      e.GROQ_RECOMMENDATION_REASONING_LEVEL,
      RECOMMENDATION_DEFAULTS.reasoningLevel
    ),
    moderationEnabled: parseBool(
      e.GROQ_RECOMMENDATION_MODERATION_ENABLED,
      RECOMMENDATION_DEFAULTS.moderationEnabled
    ),
    webSearchEnabled: parseBool(
      e.GROQ_RECOMMENDATION_WEB_SEARCH_ENABLED,
      RECOMMENDATION_DEFAULTS.webSearchEnabled
    ),
    codeInterpreterEnabled: parseBool(
      e.GROQ_RECOMMENDATION_CODE_INTERPRETER_ENABLED,
      RECOMMENDATION_DEFAULTS.codeInterpreterEnabled
    ),
    toolCallingEnabled: parseBool(
      e.GROQ_RECOMMENDATION_TOOL_CALLING_ENABLED,
      RECOMMENDATION_DEFAULTS.toolCallingEnabled
    ),
    streamingEnabled: parseBool(
      e.GROQ_RECOMMENDATION_STREAMING_ENABLED,
      RECOMMENDATION_DEFAULTS.streamingEnabled
    )
  };
}

export function loadReviewConfig(): GroqServiceConfig {
  const e = env();
  const rawTokenLimit =
    e.GROQ_REVIEW_WEEKLY_TOKEN_LIMIT || e.NEXT_PUBLIC_REVIEW_WEEKLY_TOKEN_LIMIT;
  const rawRequestLimit =
    e.GROQ_REVIEW_WEEKLY_REQUEST_LIMIT || e.NEXT_PUBLIC_REVIEW_WEEKLY_REQUEST_LIMIT;

  return {
    apiKey: e.GROQ_REVIEW_API_KEY || e.GROQ_API_KEY || "",
    model:
      (e.GROQ_REVIEW_MODEL || "").trim() || REVIEW_DEFAULTS.model,
    maxOutputTokens: parseInt_positive(
      e.GROQ_REVIEW_MAX_OUTPUT_TOKENS,
      REVIEW_DEFAULTS.maxOutputTokens,
      "GROQ_REVIEW_MAX_OUTPUT_TOKENS"
    ),
    temperature: parseFloat_clamped(
      e.GROQ_REVIEW_TEMPERATURE,
      REVIEW_DEFAULTS.temperature,
      0, 2,
      "GROQ_REVIEW_TEMPERATURE"
    ),
    topP: parseFloat_clamped(
      e.GROQ_REVIEW_TOP_P,
      REVIEW_DEFAULTS.topP,
      0, 1,
      "GROQ_REVIEW_TOP_P"
    ),
    reasoningLevel: parseReasoningLevel(
      e.GROQ_REVIEW_REASONING_LEVEL,
      REVIEW_DEFAULTS.reasoningLevel
    ),
    moderationEnabled: parseBool(
      e.GROQ_REVIEW_MODERATION_ENABLED,
      REVIEW_DEFAULTS.moderationEnabled
    ),
    webSearchEnabled: parseBool(
      e.GROQ_REVIEW_WEB_SEARCH_ENABLED,
      REVIEW_DEFAULTS.webSearchEnabled
    ),
    codeInterpreterEnabled: parseBool(
      e.GROQ_REVIEW_CODE_INTERPRETER_ENABLED,
      REVIEW_DEFAULTS.codeInterpreterEnabled
    ),
    toolCallingEnabled: parseBool(
      e.GROQ_REVIEW_TOOL_CALLING_ENABLED,
      REVIEW_DEFAULTS.toolCallingEnabled
    ),
    streamingEnabled: parseBool(
      e.GROQ_REVIEW_STREAMING_ENABLED,
      REVIEW_DEFAULTS.streamingEnabled
    ),
    weeklyTokenLimit:
      parseInt_positive(rawTokenLimit, REVIEW_DEFAULTS.weeklyTokenLimit, "GROQ_REVIEW_WEEKLY_TOKEN_LIMIT") ??
      REVIEW_DEFAULTS.weeklyTokenLimit,
    weeklyRequestLimit: parseInt_positive(
      rawRequestLimit,
      REVIEW_DEFAULTS.weeklyRequestLimit,
      "GROQ_REVIEW_WEEKLY_REQUEST_LIMIT"
    )
  };
}
