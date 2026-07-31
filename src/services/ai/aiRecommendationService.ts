import { Problem, RecommendationPlatformConfig } from "@/services/types";
import {
  AiRecommendationRequest,
  AiRecommendationResult,
  UserProfileMetadata,
  RecentHistoryItem
} from "./aiTypes";
import { FallbackAiProvider } from "./providers/fallbackProvider";

interface FallbackMetaExt {
  recommendationReason?: string;
  strengthsMatched?: string[];
  suggestedLearningOrder?: string[];
}

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
    platformConfig: RecommendationPlatformConfig,
    userProfile?: UserProfileMetadata,
    recentHistory?: RecentHistoryItem[]
  ): Promise<AiRecommendationResult> {
    if (!candidateProblems || candidateProblems.length === 0) {
      return {
        rankedProblems: [],
        recommendationReason: "No candidate problems available for the selected filters.",
        strengthsMatched: [],
        suggestedLearningOrder: []
      };
    }

    const payload: AiRecommendationRequest = {
      candidateProblems,
      selectedLanguage,
      selectedTopics,
      platformConfig,
      userProfile: userProfile || {
        selectedLanguage,
        selectedTopics
      },
      recentHistory: recentHistory || []
    };

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }

      const data = await response.json();
      if (data && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        return {
          rankedProblems: data.recommendations,
          recommendationReason: data.recommendationReason || `Curated problem set for ${selectedLanguage} matching ${selectedTopics.join(", ")}.`,
          strengthsMatched: Array.isArray(data.strengthsMatched) ? data.strengthsMatched : selectedTopics,
          suggestedLearningOrder: Array.isArray(data.suggestedLearningOrder) ? data.suggestedLearningOrder : []
        };
      }
      throw new Error("Empty recommendation array from API");
    } catch (err) {
      console.warn("AiRecommendationService client call failed, using fallback ranker:", err);
      const fallbackItems = await this.fallback.rankRecommendations(payload);
      const meta = fallbackItems as unknown as FallbackMetaExt;

      return {
        rankedProblems: fallbackItems,
        recommendationReason: meta.recommendationReason || `Selected top matching problems for ${selectedTopics.join(", ")}.`,
        strengthsMatched: meta.strengthsMatched || selectedTopics,
        suggestedLearningOrder: meta.suggestedLearningOrder || []
      };
    }
  }
}

export const aiRecommendationService = new AiRecommendationService();
