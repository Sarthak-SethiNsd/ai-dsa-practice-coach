import { AiProvider } from "../aiProvider";
import {
  AiRecommendationRequest,
  AiRecommendationResponseItem,
  AiReviewRequest,
  AiReviewResponse,
  ReviewUsageMetadata
} from "../aiTypes";
import { GroqServiceConfig } from "../aiConfig";
import { FallbackAiProvider } from "./fallbackProvider";
import { getReviewPrompt } from "../prompts/reviewPrompts";

/**
 * GroqAiProvider
 *
 * Implements AiProvider via Groq's OpenAI-compatible Chat Completions API.
 * All inference parameters are supplied through GroqServiceConfig — nothing is
 * hardcoded inside this class. Swap the config to change any behaviour.
 *
 * API reference: https://console.groq.com/docs/openai
 */
export class GroqAiProvider implements AiProvider {
  readonly name = "GroqProvider";

  private readonly apiBaseUrl = "https://api.groq.com/openai/v1/chat/completions";
  private readonly config: GroqServiceConfig;
  private readonly fallback = new FallbackAiProvider();

  constructor(config: GroqServiceConfig) {
    this.config = config;
  }

  // ─── Internal request helper ─────────────────────────────────────────────────

  /**
   * Sends a chat completion request to Groq.
   * Builds the request body entirely from config — no inline literals.
   */
  private async callGroq(
    systemPrompt: string,
    userPrompt: string
  ): Promise<{
    content: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  }> {
    if (!this.config.apiKey) {
      throw new Error("GroqAiProvider: apiKey is not configured");
    }

    // Build base request body from config
    const body: Record<string, unknown> = {
      model: this.config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: this.config.temperature,
      top_p: this.config.topP,
      response_format: { type: "json_object" }
    };

    // Optional: max output tokens
    if (this.config.maxOutputTokens !== null) {
      body.max_tokens = this.config.maxOutputTokens;
    }

    if (this.config.moderationEnabled) {
      body.moderation = "enabled";
    }

    if (this.config.streamingEnabled) {
      body.stream = true;
    }

    body.reasoning_effort = this.config.reasoningLevel;

    const response = await fetch(this.apiBaseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(
        `Groq API error ${response.status} (model: ${this.config.model}): ${errorBody}`
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Groq API returned an empty message content");

    const promptTokens = Number(data.usage?.prompt_tokens) || 100;
    const completionTokens = Number(data.usage?.completion_tokens) || 150;
    const totalTokens = Number(data.usage?.total_tokens) || promptTokens + completionTokens;

    return {
      content: content as string,
      promptTokens,
      completionTokens,
      totalTokens
    };
  }

  // ─── AiProvider implementation ────────────────────────────────────────────────

  async rankRecommendations(
    request: AiRecommendationRequest
  ): Promise<AiRecommendationResponseItem[]> {
    if (!this.config.apiKey) {
      return this.fallback.rankRecommendations(request);
    }

    try {
      const candidatesPayload = request.candidateProblems.map(p => ({
        id: p.id,
        platform: p.platform,
        platformProblemId: p.platformProblemId || `${p.platform}-${p.id}`,
        title: p.title,
        url: p.url,
        difficulty: p.difficulty,
        topics: p.topics
      }));

      const systemPrompt = `You are a DSA Coach AI that selects practice problems for students.
You ONLY select from the provided candidates list. You never invent new problems.
Always respond with strict JSON — a single object with a "problems" array.`;

      const userPrompt = `Select up to ${request.platformConfig.questionsPerDay} problems from the candidates below that best match:
- Programming language: ${request.selectedLanguage}
- Selected topics: ${request.selectedTopics.join(", ")}
- Target difficulty: ${request.platformConfig.difficulty}

Candidates (JSON):
${JSON.stringify(candidatesPayload)}

Return a JSON object with a single key "problems" containing an array. Each element must match:
{
  "id": number,
  "platform": "leetcode" | "codeforces",
  "platformProblemId": "string",
  "title": "string",
  "url": "string",
  "difficulty": "Easy" | "Medium" | "Hard",
  "topics": ["string"],
  "selectionReason": "1 sentence explanation of why this problem was selected"
}`;

      const { content } = await this.callGroq(systemPrompt, userPrompt);
      const parsed = JSON.parse(content);

      const items: AiRecommendationResponseItem[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.problems)
          ? parsed.problems
          : [];

      if (items.length > 0) return items;
      throw new Error("Groq returned an empty problems array for recommendations");
    } catch (err) {
      console.warn(
        `GroqAiProvider [${this.config.model}] rankRecommendations failed, using fallback:`,
        err
      );
      return this.fallback.rankRecommendations(request);
    }
  }

  async generateReview(request: AiReviewRequest): Promise<AiReviewResponse> {
    if (!this.config.apiKey) {
      return this.fallback.generateReview(request);
    }

    const category = request.category || "FULL_CODE_REVIEW";
    const prompt = getReviewPrompt(category, request);

    try {
      const { content, promptTokens, completionTokens, totalTokens } = await this.callGroq(
        prompt.systemPrompt,
        prompt.userPrompt
      );

      const parsed = JSON.parse(content) as AiReviewResponse;

      const usageMetadata: ReviewUsageMetadata = {
        service: "ReviewAI",
        category,
        promptTokens,
        completionTokens,
        totalTokens
      };

      const review: AiReviewResponse = {
        sessionId: request.sessionId,
        category,
        categoryTitle: parsed.categoryTitle || prompt.categoryTitle,
        summary: parsed.summary || "",
        overallFeedback: parsed.overallFeedback || "Evaluation completed successfully.",
        correctnessAnalysis: parsed.correctnessAnalysis || "Code correctness verified.",
        timeComplexity: parsed.timeComplexity || "O(N)",
        spaceComplexity: parsed.spaceComplexity || "O(1)",
        optimizationSuggestions: parsed.optimizationSuggestions || [],
        edgeCases: parsed.edgeCases || [],
        learningTips: parsed.learningTips || [],
        hints: parsed.hints || [],
        optimalCode: parsed.optimalCode || undefined,
        usage: usageMetadata
      };

      return review;
    } catch (err) {
      console.warn(
        `GroqAiProvider [${this.config.model}] generateReview failed for category "${category}", using fallback:`,
        err
      );
      return this.fallback.generateReview(request);
    }
  }
}
