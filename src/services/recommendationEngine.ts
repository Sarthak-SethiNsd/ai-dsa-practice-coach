import { QuestionProvider, RecommendationConfig, Problem, DailyPracticeSession, SessionQuestionItem } from './types';
import { QuestionSelector } from './questionSelector';
import { getTodayDateString } from '@/utils/dateUtils';

/**
 * RecommendationEngine operates against abstract QuestionProvider instances to generate
 * structured DailyPracticeSessions for the user's saved profile and per-platform recommendation settings.
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
   * Generates a new DailyPracticeSession based on selected topics and recommendation configuration.
   */
  async generateDailySession(
    selectedTopics: string[],
    config: RecommendationConfig
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
        const candidateProblems: Problem[] = await provider.getProblems({
          topics: selectedTopics,
          platforms: [pConfig.platform],
          countPerPlatform: pConfig.questionsPerDay,
          difficulty: pConfig.difficulty === "Mixed" ? undefined : pConfig.difficulty
        });

        const selectedProblems = QuestionSelector.selectQuestionsForPlatform(
          candidateProblems,
          selectedTopics,
          pConfig
        );

        selectedProblems.forEach(p => {
          sessionQuestions.push({
            problemId: p.id,
            problemTitle: p.title,
            platform: p.platform,
            difficulty: p.difficulty,
            topics: p.topics,
            estimated: p.estimated,
            solutions: p.solutions,
            complexity: p.complexity,
            takeaways: p.takeaways,
            status: "Not Started"
          });
        });
      } catch (err) {
        console.error(`Error fetching problems for platform ${pConfig.platform}:`, err);
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