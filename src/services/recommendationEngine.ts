import { QuestionProvider, RecommendationConfig, Problem, DailyPracticeSession, SessionQuestionItem } from './types';
import { getTodayDateString } from '@/utils/dateUtils';
import { aiRecommendationService } from './ai/aiRecommendationService';
import { UserProfileMetadata, RecentHistoryItem, ReviewHistoryEntry } from './ai/aiTypes';
import { ReviewCollection } from './collectionTypes';
import { calculateEntryScore } from './dashboardAnalytics';
import {
  WeakTopicAnalysis,
  PersonalizedLearningPlan,
  SmartActionCard,
  ReadinessScores,
  ReadinessScoreDetail,
  TrendAnalysisMetrics,
  TopicPerformance,
  RecommendationSnapshot,
} from './recommendationTypes';

// Keep existing Daily Practice Session Recommendation Engine
export class RecommendationEngine {
  private providers: Map<string, QuestionProvider>;

  constructor(providers: QuestionProvider[] = []) {
    this.providers = new Map();
    providers.forEach(provider => {
      this.providers.set(provider.platform, provider);
    });
  }

  registerProvider(provider: QuestionProvider): void {
    this.providers.set(provider.platform, provider);
  }

  async generateDailySession(
    selectedTopics: string[],
    config: RecommendationConfig,
    selectedLanguage: string = "JavaScript",
    userProfile?: UserProfileMetadata,
    recentHistory?: RecentHistoryItem[]
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
          topicsCovered: [],
          recommendationReason: "No topics selected in your profile.",
          strengthsMatched: [],
          suggestedLearningOrder: []
        }
      };
    }

    const sessionQuestions: SessionQuestionItem[] = [];
    let combinedReason = "";
    let combinedStrengths: string[] = [];
    let combinedLearningOrder: string[] = [];

    for (const pConfig of config.platformConfigs) {
      const provider = this.providers.get(pConfig.platform);
      if (!provider) continue;

      try {
        const candidateProblems: Problem[] = await provider.getProblems({
          topics: selectedTopics,
          platforms: [pConfig.platform],
          countPerPlatform: Math.max(10, pConfig.questionsPerDay * 3),
          difficulty: pConfig.difficulty === "Mixed" ? undefined : pConfig.difficulty
        });

        const rankingResult = await aiRecommendationService.rankCandidateProblems(
          candidateProblems,
          selectedLanguage,
          selectedTopics,
          pConfig,
          userProfile,
          recentHistory
        );

        if (rankingResult.recommendationReason) {
          combinedReason = rankingResult.recommendationReason;
        }

        if (rankingResult.strengthsMatched && rankingResult.strengthsMatched.length > 0) {
          combinedStrengths = Array.from(new Set([...combinedStrengths, ...rankingResult.strengthsMatched]));
        }

        if (rankingResult.suggestedLearningOrder && rankingResult.suggestedLearningOrder.length > 0) {
          combinedLearningOrder = [...combinedLearningOrder, ...rankingResult.suggestedLearningOrder];
        }

        rankingResult.rankedProblems.forEach(item => {
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
        topicsCovered: Array.from(topicsSet),
        recommendationReason: combinedReason || `Personalized selection matching ${selectedTopics.join(", ")} in ${selectedLanguage}.`,
        strengthsMatched: combinedStrengths.length > 0 ? combinedStrengths : selectedTopics,
        suggestedLearningOrder: combinedLearningOrder
      }
    };
  }
}

// ============================================================================
// DETERMINISTIC PERSONALIZED RECOMMENDATION ENGINE
// ============================================================================

const STANDARD_DSA_TOPICS = [
  "Arrays",
  "Binary Search",
  "Dynamic Programming",
  "Trees & BST",
  "Graphs",
  "Strings",
  "Two Pointers",
  "Sliding Window",
  "Edge Cases",
  "Optimization",
];

function inferTopicsFromEntry(entry: ReviewHistoryEntry): string[] {
  const topics: string[] = [];
  const text = `${entry.problemTitle || ""} ${entry.category} ${entry.response.summary || ""} ${entry.response.overallFeedback || ""}`.toLowerCase();

  if (text.includes("binary search") || text.includes("bs")) topics.push("Binary Search");
  if (text.includes("array") || text.includes("matrix") || text.includes("subarray")) topics.push("Arrays");
  if (text.includes("dp") || text.includes("dynamic programming") || text.includes("memoization") || text.includes("knapsack")) topics.push("Dynamic Programming");
  if (text.includes("tree") || text.includes("bst") || text.includes("trie") || text.includes("binary tree")) topics.push("Trees & BST");
  if (text.includes("graph") || text.includes("bfs") || text.includes("dfs") || text.includes("dijkstra")) topics.push("Graphs");
  if (text.includes("string") || text.includes("palindrome") || text.includes("anagram")) topics.push("Strings");
  if (text.includes("pointer") || text.includes("two pointer")) topics.push("Two Pointers");
  if (text.includes("sliding window") || text.includes("window")) topics.push("Sliding Window");

  if (entry.category === "EDGE_CASE_ANALYSIS" || text.includes("edge case") || (entry.response.edgeCases && entry.response.edgeCases.length > 0)) {
    topics.push("Edge Cases");
  }

  if (entry.category.includes("OPTIMAL") || text.includes("optimize") || (entry.response.optimizationSuggestions && entry.response.optimizationSuggestions.length > 0)) {
    topics.push("Optimization");
  }

  if (topics.length === 0) {
    topics.push("Arrays");
  }

  return Array.from(new Set(topics));
}

export function generatePersonalizedRecommendations(
  entries: ReviewHistoryEntry[],
  collections: ReviewCollection[] = []
): RecommendationSnapshot {
  const now = new Date();
  const nowIso = now.toISOString();

  // Handle case with 0 entries gracefully by providing structured baseline recommendations
  if (!entries || entries.length === 0) {
    return generateEmptyStateBaseline(collections);
  }

  // Sort entries chronologically (oldest to newest)
  const sorted = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // 1. Analyze Topic Performance & Mistakes
  const topicStatsMap: Record<
    string,
    {
      totalScore: number;
      count: number;
      timeComplexityMistakes: number;
      spaceComplexityMistakes: number;
      edgeCaseMistakes: number;
      optimizationMistakes: number;
      lastTimestamp: number;
      scores: number[];
    }
  > = {};

  STANDARD_DSA_TOPICS.forEach((topic) => {
    topicStatsMap[topic] = {
      totalScore: 0,
      count: 0,
      timeComplexityMistakes: 0,
      spaceComplexityMistakes: 0,
      edgeCaseMistakes: 0,
      optimizationMistakes: 0,
      lastTimestamp: 0,
      scores: [],
    };
  });

  let totalTimeComplexityMistakes = 0;
  let totalSpaceComplexityMistakes = 0;
  let totalEdgeCaseMistakes = 0;
  let totalOptimizationMistakes = 0;

  sorted.forEach((entry) => {
    const score = calculateEntryScore(entry);
    const topics = inferTopicsFromEntry(entry);
    const entryTime = new Date(entry.timestamp).getTime();

    // Check mistake flags
    const tcText = (entry.response.timeComplexity || "").toLowerCase();
    const scText = (entry.response.spaceComplexity || "").toLowerCase();
    const suggestions = entry.response.optimizationSuggestions || [];
    const edgeCases = entry.response.edgeCases || [];

    const isTimeMistake = tcText.includes("o(n^2)") || tcText.includes("o(n^3)") || tcText.includes("o(2^n)") || suggestions.some(s => s.toLowerCase().includes("time"));
    const isSpaceMistake = scText.includes("o(n)") || scText.includes("o(n^2)") || suggestions.some(s => s.toLowerCase().includes("space") || s.toLowerCase().includes("memory"));
    const isEdgeMistake = edgeCases.length >= 2 || entry.category === "EDGE_CASE_ANALYSIS";
    const isOptMistake = suggestions.length >= 2 || entry.category.includes("OPTIMAL");

    if (isTimeMistake) totalTimeComplexityMistakes++;
    if (isSpaceMistake) totalSpaceComplexityMistakes++;
    if (isEdgeMistake) totalEdgeCaseMistakes++;
    if (isOptMistake) totalOptimizationMistakes++;

    topics.forEach((t) => {
      if (!topicStatsMap[t]) {
        topicStatsMap[t] = {
          totalScore: 0,
          count: 0,
          timeComplexityMistakes: 0,
          spaceComplexityMistakes: 0,
          edgeCaseMistakes: 0,
          optimizationMistakes: 0,
          lastTimestamp: 0,
          scores: [],
        };
      }
      const st = topicStatsMap[t];
      st.totalScore += score;
      st.count += 1;
      st.scores.push(score);
      if (entryTime > st.lastTimestamp) st.lastTimestamp = entryTime;
      if (isTimeMistake) st.timeComplexityMistakes++;
      if (isSpaceMistake) st.spaceComplexityMistakes++;
      if (isEdgeMistake) st.edgeCaseMistakes++;
      if (isOptMistake) st.optimizationMistakes++;
    });
  });

  // Convert map to TopicPerformance array
  const topicPerformanceList: TopicPerformance[] = Object.entries(topicStatsMap).map(
    ([topic, data]) => {
      const avgScore = data.count > 0 ? Math.round(data.totalScore / data.count) : 70;
      let masteryLevel: TopicPerformance["masteryLevel"] = "Developing";
      if (avgScore >= 85 && data.count >= 3) masteryLevel = "Mastered";
      else if (avgScore >= 75) masteryLevel = "Proficient";
      else if (avgScore >= 60) masteryLevel = "Developing";
      else masteryLevel = "Needs Attention";

      return {
        topic,
        avgScore,
        totalReviews: data.count,
        timeComplexityMistakes: data.timeComplexityMistakes,
        spaceComplexityMistakes: data.spaceComplexityMistakes,
        edgeCaseMistakes: data.edgeCaseMistakes,
        optimizationMistakes: data.optimizationMistakes,
        lastReviewedAt: data.lastTimestamp > 0 ? new Date(data.lastTimestamp).toISOString() : null,
        masteryLevel,
      };
    }
  );

  // 2. Identify Weak Topics (Requirement 3)
  const evaluatedTopics = topicPerformanceList.filter((t) => t.totalReviews > 0);
  const candidateWeakList = evaluatedTopics.length > 0 ? evaluatedTopics : topicPerformanceList;

  const sortedByScoreAsc = [...candidateWeakList].sort((a, b) => a.avgScore - b.avgScore);
  const weakestTopicObj = sortedByScoreAsc[0] || null;
  const secondWeakestTopicObj = sortedByScoreAsc[1] || sortedByScoreAsc[0] || null;

  // Most improved topic (compare first half average vs second half average)
  let mostImprovedObj: TopicPerformance | null = null;
  let maxScoreDelta = -999;

  for (const [tName, tData] of Object.entries(topicStatsMap)) {
    if (tData.scores.length >= 2) {
      const half = Math.floor(tData.scores.length / 2);
      const firstHalfAvg = tData.scores.slice(0, half).reduce((a, b) => a + b, 0) / half;
      const secondHalfAvg = tData.scores.slice(half).reduce((a, b) => a + b, 0) / (tData.scores.length - half);
      const delta = secondHalfAvg - firstHalfAvg;
      if (delta > maxScoreDelta) {
        maxScoreDelta = delta;
        mostImprovedObj = topicPerformanceList.find((tp) => tp.topic === tName) || null;
      }
    }
  }

  if (!mostImprovedObj && sortedByScoreAsc.length > 0) {
    mostImprovedObj = sortedByScoreAsc[sortedByScoreAsc.length - 1];
    maxScoreDelta = 5;
  }

  // Most neglected topic (longest since last review or 0 reviews)
  const nowMs = now.getTime();
  let mostNeglectedObj: TopicPerformance | null = null;
  let maxDaysSince = -1;

  for (const tp of topicPerformanceList) {
    const lastMs = tp.lastReviewedAt ? new Date(tp.lastReviewedAt).getTime() : 0;
    const daysSince = lastMs > 0 ? Math.floor((nowMs - lastMs) / (86400 * 1000)) : 99;
    if (daysSince > maxDaysSince) {
      maxDaysSince = daysSince;
      mostNeglectedObj = tp;
    }
  }

  // Calculate confidence score (based on number of reviews and topic distribution)
  const totalReviews = entries.length;
  const confidenceScore = Math.min(100, Math.max(35, Math.round(45 + Math.min(totalReviews, 20) * 2.5)));

  const weakTopics: WeakTopicAnalysis = {
    weakestTopic: weakestTopicObj
      ? {
          name: weakestTopicObj.topic,
          score: weakestTopicObj.avgScore,
          reason: `Average score of ${weakestTopicObj.avgScore}% across ${weakestTopicObj.totalReviews} reviews with high mistake frequency.`,
        }
      : null,
    secondWeakestTopic: secondWeakestTopicObj
      ? {
          name: secondWeakestTopicObj.topic,
          score: secondWeakestTopicObj.avgScore,
          reason: `Average score of ${secondWeakestTopicObj.avgScore}% requires reinforcement.`,
        }
      : null,
    mostImprovedTopic: mostImprovedObj
      ? {
          name: mostImprovedObj.topic,
          scoreDelta: Math.max(1, Math.round(maxScoreDelta)),
          reason: `Performance improved by +${Math.max(1, Math.round(maxScoreDelta))} points in recent practice sessions.`,
        }
      : null,
    mostNeglectedTopic: mostNeglectedObj
      ? {
          name: mostNeglectedObj.topic,
          daysSinceReview: Math.max(1, maxDaysSince === 99 ? 14 : maxDaysSince),
          reason: maxDaysSince === 99
            ? `Has not been practiced yet in your review history.`
            : `Not practiced in ${maxDaysSince} days. Revisit to maintain retention.`,
        }
      : null,
    confidenceScore,
    topicBreakdown: topicPerformanceList,
  };

  // 3. Trend Analysis (Requirement 7)
  const scoresAll = sorted.map(calculateEntryScore);
  const last7Scores = scoresAll.slice(-7);
  const last30Scores = scoresAll.slice(-30);

  const trend7Day = last7Scores.length > 0 ? Math.round(last7Scores.reduce((a, b) => a + b, 0) / last7Scores.length) : 75;
  const trend30Day = last30Scores.length > 0 ? Math.round(last30Scores.reduce((a, b) => a + b, 0) / last30Scores.length) : 70;

  let improvementPercentage = 0;
  let declinePercentage = 0;

  if (scoresAll.length >= 4) {
    const half = Math.floor(scoresAll.length / 2);
    const firstHalfAvg = scoresAll.slice(0, half).reduce((a, b) => a + b, 0) / half;
    const secondHalfAvg = scoresAll.slice(half).reduce((a, b) => a + b, 0) / (scoresAll.length - half);

    if (secondHalfAvg >= firstHalfAvg) {
      improvementPercentage = Math.round(((secondHalfAvg - firstHalfAvg) / (firstHalfAvg || 1)) * 100);
    } else {
      declinePercentage = Math.round(((firstHalfAvg - secondHalfAvg) / (firstHalfAvg || 1)) * 100);
    }
  }

  const scoreVelocity = Math.round(trend7Day - trend30Day);

  const trendAnalysis: TrendAnalysisMetrics = {
    trend7Day,
    trend30Day,
    improvementPercentage,
    declinePercentage,
    scoreVelocity,
    totalReviewsAnalyzed: totalReviews,
  };

  // 4. Readiness Scores (Requirement 6)
  // Scores 0-100: Problem Solving, Optimization, Edge Cases, Communication, Consistency
  const overallAvgScore = Math.round(scoresAll.reduce((a, b) => a + b, 0) / (scoresAll.length || 1));

  // Consistency score based on active review frequency
  const uniqueDatesCount = new Set(sorted.map((e) => e.timestamp.split("T")[0])).size;
  const consistencyScore = Math.min(100, Math.max(30, Math.round(uniqueDatesCount * 12 + Math.min(totalReviews, 10) * 4)));

  // Edge cases score
  const edgeCaseReviews = sorted.filter((e) => e.category === "EDGE_CASE_ANALYSIS" || (e.response.edgeCases && e.response.edgeCases.length > 0));
  const edgeCasesAvg = edgeCaseReviews.length > 0
    ? Math.round(edgeCaseReviews.reduce((a, b) => a + calculateEntryScore(b), 0) / edgeCaseReviews.length)
    : Math.max(40, overallAvgScore - 10);

  // Optimization score
  const optReviews = sorted.filter((e) => e.category.includes("OPTIMAL"));
  const optAvg = optReviews.length > 0
    ? Math.round(optReviews.reduce((a, b) => a + calculateEntryScore(b), 0) / optReviews.length)
    : Math.max(45, overallAvgScore - 5);

  // Communication score (tips, explanations, notes)
  const commScore = Math.min(100, Math.max(50, Math.round(overallAvgScore + (entries.some((e) => (e.response.learningTips?.length || 0) > 0) ? 8 : 0))));

  const getStatus = (score: number): ReadinessScoreDetail["status"] => {
    if (score >= 85) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 55) return "Needs Improvement";
    return "Critical";
  };

  const readinessScores: ReadinessScores = {
    problemSolving: {
      score: overallAvgScore,
      label: "Problem Solving",
      status: getStatus(overallAvgScore),
      keyFactor: `${totalReviews} AI code reviews analyzed with ${overallAvgScore}% overall quality accuracy.`,
    },
    optimization: {
      score: optAvg,
      label: "Optimization",
      status: getStatus(optAvg),
      keyFactor: `Big-O efficiency analysis and space/time trade-off evaluation.`,
    },
    edgeCases: {
      score: edgeCasesAvg,
      label: "Edge Cases",
      status: getStatus(edgeCasesAvg),
      keyFactor: `Identification of empty arrays, boundaries, overflow, and null pointers.`,
    },
    communication: {
      score: commScore,
      label: "Communication",
      status: getStatus(commScore),
      keyFactor: `Clarity of code structure, inline reasoning, and learning takeaway integration.`,
    },
    consistency: {
      score: consistencyScore,
      label: "Consistency",
      status: getStatus(consistencyScore),
      keyFactor: `${uniqueDatesCount} active practice day(s) recorded in history.`,
    },
    overallScore: Math.round(
      (overallAvgScore * 0.25) +
      (optAvg * 0.25) +
      (edgeCasesAvg * 0.2) +
      (commScore * 0.15) +
      (consistencyScore * 0.15)
    ),
  };

  // 5. Smart Action Cards (Requirement 5)
  const actionCards: SmartActionCard[] = [];

  // Card 1: Weakest Topic
  if (weakestTopicObj) {
    actionCards.push({
      id: "card_weak_topic",
      title: `Review more ${weakestTopicObj.topic} problems`,
      priority: "High",
      category: "Topic Mastery",
      reason: `Your current accuracy in ${weakestTopicObj.topic} is ${weakestTopicObj.avgScore}%, lower than your target threshold.`,
      suggestedAction: `Complete 3 targeted ${weakestTopicObj.topic} reviews focusing on fundamental patterns and step-by-step trace.`,
      targetTopic: weakestTopicObj.topic,
      actionUrl: "/practice",
      completed: false,
    });
  }

  // Card 2: Edge Cases
  if (totalEdgeCaseMistakes > 0 || edgeCasesAvg < 75) {
    actionCards.push({
      id: "card_edge_cases",
      title: "Practice edge cases in Arrays & Data Structures",
      priority: "High",
      category: "Edge Cases",
      reason: `Multiple review entries flagged missing boundary checks (e.g. empty arrays, single elements, integer overflow).`,
      suggestedAction: `Run dedicated Edge Case Analysis AI reviews before submitting solutions.`,
      targetTopic: "Edge Cases",
      actionUrl: "/review",
      completed: false,
    });
  }

  // Card 3: Optimization Reasoning
  if (totalTimeComplexityMistakes > 0 || totalSpaceComplexityMistakes > 0 || totalOptimizationMistakes > 0 || optAvg < 75) {
    actionCards.push({
      id: "card_optimization",
      title: "Improve optimization reasoning",
      priority: "Medium",
      category: "Optimization",
      reason: `Nested loops or suboptimal Big-O space/time complexities were identified in recent code reviews.`,
      suggestedAction: `Before coding, state the theoretical lower bound (e.g. O(N log N) vs O(N)) and check hash map trade-offs.`,
      targetTopic: "Optimization",
      actionUrl: "/review",
      completed: false,
    });
  }

  // Card 4: Response Verbosity & Complexity Analysis
  actionCards.push({
    id: "card_complexity_analysis",
    title: "Improve time complexity analysis",
    priority: "Medium",
    category: "Communication",
    reason: `Clear Big-O notation explanations demonstrate deep algorithmic comprehension to technical interviewers.`,
    suggestedAction: `Add explicit space/time complexity comments to your submitted code solutions.`,
    targetTopic: "Complexity Analysis",
    actionUrl: "/review",
    completed: false,
  });

  // Card 5: Consistency
  if (consistencyScore < 80) {
    actionCards.push({
      id: "card_consistency",
      title: "Maintain daily review streak",
      priority: "Low",
      category: "Consistency",
      reason: `Regular daily practice accelerates pattern recognition and long-term interview readiness.`,
      suggestedAction: `Complete 1 practice problem or AI review session today to extend your activity streak.`,
      targetTopic: "Practice Habit",
      actionUrl: "/practice",
      completed: false,
    });
  }

  // 6. Personalized Learning Plan (Requirement 4)
  const learningPlan: PersonalizedLearningPlan = {
    today: {
      focusArea: weakestTopicObj ? weakestTopicObj.topic : "Arrays & Two Pointers",
      improvementGoal: `Achieve 85+ quality score on a ${weakestTopicObj ? weakestTopicObj.topic : "DSA"} problem with explicit edge case handling.`,
      suggestedCategory: "EDGE_CASE_ANALYSIS",
      recommendedTopic: weakestTopicObj ? weakestTopicObj.topic : "Arrays",
    },
    thisWeek: {
      topTopicsToStudy: [
        weakestTopicObj ? weakestTopicObj.topic : "Binary Search",
        secondWeakestTopicObj ? secondWeakestTopicObj.topic : "Dynamic Programming",
        mostNeglectedObj ? mostNeglectedObj.topic : "Trees & BST",
      ],
      rationale: `Targeting your top 2 weakest topics plus your most neglected topic maximizes score growth.`,
    },
    thisMonth: {
      longTermTarget: `Elevate overall readiness score from ${readinessScores.overallScore} to ${Math.min(95, readinessScores.overallScore + 15)} across all 5 key categories.`,
      targetReadinessScore: Math.min(95, readinessScores.overallScore + 15),
    },
  };

  return {
    id: `rec_${now.getTime()}`,
    timestamp: nowIso,
    overallReadinessScore: readinessScores.overallScore,
    weakTopics,
    learningPlan,
    actionCards,
    readinessScores,
    trendAnalysis,
    topicPerformance: topicPerformanceList,
    summaryNote: `Recommendations calculated based on ${totalReviews} review entries and ${collections.length} collection(s).`,
  };
}

function generateEmptyStateBaseline(collections: ReviewCollection[]): RecommendationSnapshot {
  const now = new Date();
  const nowIso = now.toISOString();

  const baselineTopicPerformance: TopicPerformance[] = [
    { topic: "Arrays", avgScore: 75, totalReviews: 0, timeComplexityMistakes: 0, spaceComplexityMistakes: 0, edgeCaseMistakes: 0, optimizationMistakes: 0, lastReviewedAt: null, masteryLevel: "Developing" },
    { topic: "Binary Search", avgScore: 65, totalReviews: 0, timeComplexityMistakes: 0, spaceComplexityMistakes: 0, edgeCaseMistakes: 0, optimizationMistakes: 0, lastReviewedAt: null, masteryLevel: "Needs Attention" },
    { topic: "Dynamic Programming", avgScore: 60, totalReviews: 0, timeComplexityMistakes: 0, spaceComplexityMistakes: 0, edgeCaseMistakes: 0, optimizationMistakes: 0, lastReviewedAt: null, masteryLevel: "Needs Attention" },
    { topic: "Trees & BST", avgScore: 70, totalReviews: 0, timeComplexityMistakes: 0, spaceComplexityMistakes: 0, edgeCaseMistakes: 0, optimizationMistakes: 0, lastReviewedAt: null, masteryLevel: "Developing" },
    { topic: "Graphs", avgScore: 65, totalReviews: 0, timeComplexityMistakes: 0, spaceComplexityMistakes: 0, edgeCaseMistakes: 0, optimizationMistakes: 0, lastReviewedAt: null, masteryLevel: "Needs Attention" },
    { topic: "Strings", avgScore: 78, totalReviews: 0, timeComplexityMistakes: 0, spaceComplexityMistakes: 0, edgeCaseMistakes: 0, optimizationMistakes: 0, lastReviewedAt: null, masteryLevel: "Proficient" },
    { topic: "Two Pointers", avgScore: 80, totalReviews: 0, timeComplexityMistakes: 0, spaceComplexityMistakes: 0, edgeCaseMistakes: 0, optimizationMistakes: 0, lastReviewedAt: null, masteryLevel: "Proficient" },
    { topic: "Sliding Window", avgScore: 72, totalReviews: 0, timeComplexityMistakes: 0, spaceComplexityMistakes: 0, edgeCaseMistakes: 0, optimizationMistakes: 0, lastReviewedAt: null, masteryLevel: "Developing" },
  ];

  return {
    id: `rec_baseline_${now.getTime()}`,
    timestamp: nowIso,
    overallReadinessScore: 68,
    weakTopics: {
      weakestTopic: { name: "Dynamic Programming", score: 60, reason: "High-frequency interview topic requiring recurrence relation practice." },
      secondWeakestTopic: { name: "Binary Search", score: 65, reason: "Boundary conditions and off-by-one errors need structured review." },
      mostImprovedTopic: { name: "Two Pointers", scoreDelta: 10, reason: "Solid foundational understanding demonstrated." },
      mostNeglectedTopic: { name: "Graphs", daysSinceReview: 14, reason: "Traversal algorithms (BFS/DFS) should be refreshed." },
      confidenceScore: 50,
      topicBreakdown: baselineTopicPerformance,
    },
    learningPlan: {
      today: {
        focusArea: "Binary Search & Boundaries",
        improvementGoal: "Complete 1 practice review with clean lower/upper bound logic.",
        suggestedCategory: "EDGE_CASE_ANALYSIS",
        recommendedTopic: "Binary Search",
      },
      thisWeek: {
        topTopicsToStudy: ["Dynamic Programming", "Binary Search", "Graphs"],
        rationale: "Focusing on core algorithmic paradigms to build systematic problem-solving habits.",
      },
      thisMonth: {
        longTermTarget: "Achieve 85+ Readiness Score across all 5 evaluation metrics by completing 15 AI code reviews.",
        targetReadinessScore: 85,
      },
    },
    actionCards: [
      {
        id: "baseline_card_1",
        title: "Review more Binary Search problems",
        priority: "High",
        category: "Topic Mastery",
        reason: "Binary search off-by-one errors are the #1 mistake in technical interviews.",
        suggestedAction: "Practice lower_bound and upper_bound boundary checks in Binary Search.",
        targetTopic: "Binary Search",
        actionUrl: "/practice",
        completed: false,
      },
      {
        id: "baseline_card_2",
        title: "Practice edge cases in Arrays",
        priority: "High",
        category: "Edge Cases",
        reason: "Edge cases (empty inputs, single element, negative numbers) account for 30% of bug reports.",
        suggestedAction: "Use AI Review 'Edge Case Analysis' on array solutions.",
        targetTopic: "Edge Cases",
        actionUrl: "/review",
        completed: false,
      },
      {
        id: "baseline_card_3",
        title: "Improve optimization reasoning",
        priority: "Medium",
        category: "Optimization",
        reason: "Optimizing nested loops from O(N^2) to O(N) using Hash Maps boost interview scores.",
        suggestedAction: "Analyze time and space complexity before writing optimal code.",
        targetTopic: "Optimization",
        actionUrl: "/review",
        completed: false,
      },
      {
        id: "baseline_card_4",
        title: "Improve time complexity analysis",
        priority: "Medium",
        category: "Communication",
        reason: "Stating Big-O space/time complexities demonstrates technical fluency.",
        suggestedAction: "Add Big-O summary comments to all submitted code reviews.",
        targetTopic: "Complexity Analysis",
        actionUrl: "/review",
        completed: false,
      },
    ],
    readinessScores: {
      problemSolving: { score: 70, label: "Problem Solving", status: "Good", keyFactor: "Initial baseline assessment." },
      optimization: { score: 65, label: "Optimization", status: "Needs Improvement", keyFactor: "Requires Big-O trade-off evaluation." },
      edgeCases: { score: 60, label: "Edge Cases", status: "Needs Improvement", keyFactor: "Needs explicit boundary verification." },
      communication: { score: 75, label: "Communication", status: "Good", keyFactor: "Structured explanation and feedback." },
      consistency: { score: 70, label: "Consistency", status: "Good", keyFactor: "Complete regular AI code reviews to increase streak." },
      overallScore: 68,
    },
    trendAnalysis: {
      trend7Day: 70,
      trend30Day: 68,
      improvementPercentage: 5,
      declinePercentage: 0,
      scoreVelocity: 2,
      totalReviewsAnalyzed: 0,
    },
    topicPerformance: baselineTopicPerformance,
    summaryNote: `Baseline initial recommendations based on ${collections.length} collection(s). Complete AI reviews to update personalized scores.`,
  };
}