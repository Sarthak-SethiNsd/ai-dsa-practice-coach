import { AiProvider } from "./aiProvider";
import { GroqAiProvider } from "./providers/groqProvider";
import { FallbackAiProvider } from "./providers/fallbackProvider";
import { loadRecommendationConfig, loadReviewConfig } from "./aiConfig";

/**
 * AiProviderFactory
 *
 * Creates and caches isolated provider instances for each inference service.
 *
 * Two independent singletons are maintained:
 *   - recommendationProvider  ← serves /api/recommendations
 *   - reviewProvider          ← serves /api/review
 *
 * They never share API keys, configs, or instances.
 *
 * Adding a new provider (OpenAI, Gemini, Claude, local):
 *   1. Implement AiProvider in src/services/ai/providers/<name>Provider.ts
 *   2. Import it here
 *   3. Add it to the provider map below
 *   4. Set ACTIVE_AI_PROVIDER=<name> in .env.local (or per-service env vars)
 *
 * Adding a new inference service (e.g. "explain"):
 *   1. Add loadExplainConfig() to aiConfig.ts
 *   2. Add getExplainProvider() here
 *   3. Add /api/explain/route.ts that calls getExplainProvider()
 */

// ─── Provider builder ─────────────────────────────────────────────────────────

/**
 * Builds a provider instance for the given provider name and config loader.
 * Falls back to FallbackAiProvider if the name is unknown.
 */
function buildProvider(
  providerName: string,
  configLoader: () => ReturnType<typeof loadRecommendationConfig>
): AiProvider {
  const name = providerName.trim().toLowerCase();

  switch (name) {
    case "groq":
      return new GroqAiProvider(configLoader());

    // ── Future providers ──────────────────────────────────────────────────────
    // case "openai":
    //   return new OpenAiProvider(configLoader());
    // case "gemini":
    //   return new GeminiAiProvider(configLoader());
    // case "claude":
    //   return new ClaudeAiProvider(configLoader());
    // ─────────────────────────────────────────────────────────────────────────

    case "fallback":
      return new FallbackAiProvider();

    default:
      console.warn(
        `[AiProviderFactory] Unknown provider "${providerName}" — falling back to FallbackAiProvider.`
      );
      return new FallbackAiProvider();
  }
}

// ─── Env resolution ───────────────────────────────────────────────────────────

function getEnv(key: string, fallback = ""): string {
  return (
    (typeof process !== "undefined" && process.env[key]) || fallback
  );
}

/** Global default provider name, overridable per-service. */
const GLOBAL_DEFAULT_PROVIDER = getEnv("ACTIVE_AI_PROVIDER", "groq");

// ─── Isolated singletons ──────────────────────────────────────────────────────

/**
 * Provider singleton for the Recommendation inference service.
 * Config is sourced exclusively from GROQ_RECOMMENDATION_* env vars.
 */
const recommendationProvider: AiProvider = buildProvider(
  getEnv("RECOMMENDATION_AI_PROVIDER", GLOBAL_DEFAULT_PROVIDER),
  loadRecommendationConfig
);

/**
 * Provider singleton for the Review inference service.
 * Config is sourced exclusively from GROQ_REVIEW_* env vars.
 */
const reviewProvider: AiProvider = buildProvider(
  getEnv("REVIEW_AI_PROVIDER", GLOBAL_DEFAULT_PROVIDER),
  loadReviewConfig
);

// ─── Public accessors ─────────────────────────────────────────────────────────

/** Returns the provider instance dedicated to recommendation ranking. */
export function getRecommendationProvider(): AiProvider {
  return recommendationProvider;
}

/** Returns the provider instance dedicated to code review. */
export function getReviewProvider(): AiProvider {
  return reviewProvider;
}

/**
 * Generic provider accessor (for backwards compatibility and future use).
 * When a name is given, a fresh un-cached instance is returned.
 * For production routes, prefer the named accessors above.
 */
export function getAiProvider(name?: string): AiProvider {
  if (!name) return recommendationProvider;
  return buildProvider(name, loadRecommendationConfig);
}

/** @deprecated Use getRecommendationProvider() or getReviewProvider() */
export class AiProviderFactory {
  static getProvider(name?: string): AiProvider {
    return getAiProvider(name);
  }
}
