import { Problem, RecommendationPlatformConfig } from './types';

/**
 * QuestionSelector handles filtering and selecting candidate problems
 * based on user's known topics, difficulty constraints, and requested daily counts.
 */
export class QuestionSelector {
  /**
   * Selects problems for a platform configuration strictly based on known topics and difficulty preferences.
   */
  static selectQuestionsForPlatform(
    allPlatformProblems: Problem[],
    selectedTopics: string[],
    config: RecommendationPlatformConfig
  ): Problem[] {
    if (selectedTopics.length === 0 || allPlatformProblems.length === 0) {
      return [];
    }

    // 1. Filter candidates to only those related to user's known topics
    const topicMatchingCandidates = allPlatformProblems.filter(problem =>
      problem.topics.some(topic => selectedTopics.includes(topic))
    );

    if (topicMatchingCandidates.length === 0) {
      return [];
    }

    const targetCount = Math.max(1, Math.min(10, config.questionsPerDay));
    const targetDifficulty = config.difficulty;

    // 2. If difficulty is specified (and not Mixed), separate exact difficulty matches
    if (targetDifficulty && targetDifficulty !== 'Mixed') {
      const exactDifficultyMatches = topicMatchingCandidates.filter(
        p => p.difficulty === targetDifficulty
      );

      if (exactDifficultyMatches.length >= targetCount) {
        return exactDifficultyMatches.slice(0, targetCount);
      }

      // If exact matches are fewer than targetCount, fill remaining slots with other known-topic problems
      const selected = [...exactDifficultyMatches];
      const remainingNeeded = targetCount - selected.length;
      const otherMatches = topicMatchingCandidates.filter(
        p => p.difficulty !== targetDifficulty
      );

      return [...selected, ...otherMatches.slice(0, remainingNeeded)];
    }

    // 3. Mixed difficulty: return top candidate problems matching known topics
    return topicMatchingCandidates.slice(0, targetCount);
  }
}
