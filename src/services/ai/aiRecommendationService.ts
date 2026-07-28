import { Problem, RecommendationPlatformConfig } from "@/services/types";
import { AiRecommendationResponseItem } from "./aiTypes";
import { FallbackAiProvider } from "./providers/fallbackProvider";

export class AiRecommendationService {
  private fallback = new FallbackAiProvider();

  /**
   * Invokes AI recommendation ranking for a set of candidate problems.
   * Performs candidate problem ranking without generating or inventing fake problems.
   */
  async rankCandidateProblems(
    candidateProblems: Problem[],
    selectedLanguage: string,
    selectedTopics: string[],
    platformConfig: RecommendationPlatformConfig
  ): Promise<AiRecommendationResponseItem[]> {
    if (!candidateProblems || candidateProblems.length === 0) return [];

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateProblems,
          selectedLanguage,
          selectedTopics,
          platformConfig
        })
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }

      const data = await response.json();
      if (data && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        return data.recommendations;
      }
      throw new Error("Empty recommendation array from API");
    } catch (err) {
      console.warn("AiRecommendationService client call failed, using fallback ranker:", err);
      return this.fallback.rankRecommendations({
        candidateProblems,
        selectedLanguage,
        selectedTopics,
        platformConfig
      });
    }
  }
}

export const aiRecommendationService = new AiRecommendationService();
