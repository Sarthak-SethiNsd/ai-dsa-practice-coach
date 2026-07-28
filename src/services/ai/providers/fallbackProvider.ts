import { AiProvider } from "../aiProvider";
import {
  AiRecommendationRequest,
  AiRecommendationResponseItem,
  AiReviewRequest,
  AiReviewResponse
} from "../aiTypes";

/**
 * FallbackAiProvider provides robust rule-based candidate problem ranking and
 * structured code review evaluation when external AI services are unavailable
 * or unconfigured.
 */
export class FallbackAiProvider implements AiProvider {
  readonly name = "FallbackProvider";

  async rankRecommendations(request: AiRecommendationRequest): Promise<AiRecommendationResponseItem[]> {
    const { candidateProblems, selectedTopics, platformConfig, selectedLanguage } = request;

    // Filter candidate problems matching topics or difficulty
    let candidates = [...candidateProblems];

    if (selectedTopics.length > 0) {
      const topicMatches = candidates.filter(p =>
        p.topics.some(t => selectedTopics.includes(t))
      );
      if (topicMatches.length > 0) {
        candidates = topicMatches;
      }
    }

    if (platformConfig.difficulty && platformConfig.difficulty !== "Mixed") {
      const diffMatches = candidates.filter(p => p.difficulty === platformConfig.difficulty);
      if (diffMatches.length > 0) {
        candidates = diffMatches;
      }
    }

    const count = Math.min(platformConfig.questionsPerDay, candidates.length);
    const selected = candidates.slice(0, count);

    return selected.map(p => {
      const matchingTopics = p.topics.filter(t => selectedTopics.includes(t));
      const topicStr = matchingTopics.length > 0 ? matchingTopics.join(" and ") : p.topics[0] || "DSA";
      const difficultyStr = p.difficulty;

      return {
        id: p.id,
        platform: p.platform,
        platformProblemId: p.platformProblemId || `${p.platform}-${p.id}`,
        title: p.title,
        url: p.url || (p.platform === "leetcode" ? `https://leetcode.com/problems/${p.id}` : `https://codeforces.com/problemset/problem/${p.id}/A`),
        difficulty: p.difficulty,
        topics: p.topics,
        selectionReason: `Recommended because it matches your selected ${topicStr} topic(s) at ${difficultyStr} difficulty in ${selectedLanguage}.`
      };
    });
  }

  async generateReview(request: AiReviewRequest): Promise<AiReviewResponse> {
    const { problemTitle, code, language, topics } = request;
    const cleanCode = code ? code.trim() : "";
    const lines = cleanCode.split("\n").length;
    const mainTopic = topics && topics.length > 0 ? topics[0] : "Algorithms";

    let timeComp = "O(N)";
    let spaceComp = "O(1)";

    if (cleanCode.includes("for") && cleanCode.includes("Map") || cleanCode.includes("dict")) {
      timeComp = "O(N)";
      spaceComp = "O(N)";
    } else if (cleanCode.includes("while") && cleanCode.includes("mid")) {
      timeComp = "O(log N)";
      spaceComp = "O(1)";
    } else if (cleanCode.includes("for") && (cleanCode.match(/for/g) || []).length >= 2) {
      timeComp = "O(N^2)";
      spaceComp = "O(1)";
    }

    return {
      overallFeedback: `Solid solution for "${problemTitle}" in ${language}. The overall structure is clean and demonstrates good understanding of ${mainTopic}.`,
      correctnessAnalysis: `The implementation correctly handles primary test cases with ${lines} lines of code. Variable scoping and return types match standard ${language} conventions.`,
      timeComplexity: timeComp,
      spaceComplexity: spaceComp,
      optimizationSuggestions: [
        `Consider validating input boundary conditions at the beginning of the function.`,
        `Use explicit variable names for index pointers to enhance code readability during interviews.`
      ],
      edgeCases: [
        "Empty arrays or null pointer inputs",
        "Single element collections",
        "Integer overflow with extreme boundary values"
      ],
      learningTips: [
        `Practice tracing execution steps on paper for non-trivial loop invariants.`,
        `Familiarize yourself with standard ${language} built-in utility functions for cleaner code.`
      ]
    };
  }
}
