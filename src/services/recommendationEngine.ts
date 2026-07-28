import { QuestionProvider, RecommendationConfig, Problem, DailyPracticeSession, SessionQuestionItem } from './types';
import { getTodayDateString } from '@/utils/dateUtils';
import { aiRecommendationService } from './ai/aiRecommendationService';

/**
 * RecommendationEngine operates against abstract QuestionProvider instances to generate
 * structured DailyPracticeSessions. Candidate problems come strictly from platform providers
 * and are ranked/filtered by the AI Recommendation Service without generating fake problems.
 */
export class RecommendationEngine {
  private providers: Map<string, QuestionProvider>;

  constructor(providers: QuestionProvider[] = []) {
    this.providers = new Map();
    providers.forEach(provider => {
      this.providers.set(provider.platform, provider);
    });
  }

  /**
   * Registers a QuestionProvider for a specific platform.
   */
  registerProvider(provider: QuestionProvider): void {
    this.providers.set(provider.platform, provider);
  }

  /**
   * Generates a new DailyPracticeSession based on selected topics, programming language,
   * and recommendation configuration.
   */
  async generateDailySession(
    selectedTopics: string[],
    config: RecommendationConfig,
    selectedLanguage: string = "JavaScript"
  ): Promise<DailyPracticeSession> {
    const todayStr = getTodayDateString();
    const nowIso = new Date().toISOString();

    if (!selectedTopics || selectedTopics.length === 0 || !config.platformConfigs || config.platformConfigs.length === 0) {
      return {
        sessionId: `session-${todayStr}`,
        date: todayStr,
        createdAt: nowIso,
        updatedAt: nowIso,
        platformConfigs: config.platformConfigs || [],
        questions: [],
        metadata: {
          totalQuestions: 0,
          completedCount: 0,
          skippedCount: 0,
          inProgressCount: 0,
          topicsCovered: []
        }
      };
    }

    const sessionQuestions: SessionQuestionItem[] = [];

    for (const pConfig of config.platformConfigs) {
      const provider = this.providers.get(pConfig.platform);
      if (!provider) continue;

      try {
        // 1. Fetch candidate problems from platform provider (LeetCode / Codeforces)
        const candidateProblems: Problem[] = await provider.getProblems({
          topics: selectedTopics,
          platforms: [pConfig.platform],
          countPerPlatform: Math.max(10, pConfig.questionsPerDay * 3), // Fetch sufficient candidates for ranking
          difficulty: pConfig.difficulty === "Mixed" ? undefined : pConfig.difficulty
        });

        // 2. Rank and filter candidate problems using AI Recommendation Service
        const rankedItems = await aiRecommendationService.rankCandidateProblems(
          candidateProblems,
          selectedLanguage,
          selectedTopics,
          pConfig
        );

        // 3. Map ranked items back into SessionQuestionItem structure
        rankedItems.forEach(item => {
          const match = candidateProblems.find(p => p.id === item.id || p.platformProblemId === item.platformProblemId);
          sessionQuestions.push({
            problemId: item.id,
            platformProblemId: item.platformProblemId || match?.platformProblemId || `${item.platform}-${item.id}`,
            problemTitle: item.title,
            url: item.url || match?.url || (item.platform === "leetcode" ? `https://leetcode.com/problems/${item.id}` : `https://codeforces.com/problemset/problem/${item.id}/A`),
            platform: item.platform,
            difficulty: item.difficulty,
            topics: item.topics,
            estimated: match?.estimated || "20 mins",
            solutions: match?.solutions || {},
            complexity: match?.complexity || { time: "O(N)", space: "O(1)" },
            takeaways: match?.takeaways || [],
            selectionReason: item.selectionReason,
            status: "Not Started"
          });
        });
      } catch (err) {
        console.error(`Error generating AI recommendations for platform ${pConfig.platform}:`, err);
      }
    }

    const topicsSet = new Set<string>();
    sessionQuestions.forEach(q => q.topics.forEach(t => topicsSet.add(t)));

    return {
      sessionId: `session-${todayStr}`,
      date: todayStr,
      createdAt: nowIso,
      updatedAt: nowIso,
      platformConfigs: config.platformConfigs,
      questions: sessionQuestions,
      metadata: {
        totalQuestions: sessionQuestions.length,
        completedCount: 0,
        skippedCount: 0,
        inProgressCount: 0,
        topicsCovered: Array.from(topicsSet)
      }
    };
  }
}