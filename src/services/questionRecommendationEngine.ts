import { LeetCodeService } from "./leetcode/leetcodeService";
import { CodeforcesService } from "./codeforces/codeforcesService";
import { Problem } from "./types";
import { ReviewHistoryEntry } from "./ai/aiTypes";
import { ReviewCollection } from "./collectionTypes";
import { RecommendationSnapshot } from "./recommendationTypes";
import { PracticeRoadmap } from "./roadmapTypes";
import {
  QuestionRecommendation,
  RecommendationBatch,
  QuestionCategory,
  QuestionPriority,
} from "./questionRecommendationTypes";

const leetCodeService = new LeetCodeService();
const codeforcesService = new CodeforcesService();

export interface GenerateQuestionRecommendationsParams {
  entries: ReviewHistoryEntry[];
  collections: ReviewCollection[];
  recommendation: RecommendationSnapshot;
  roadmap: PracticeRoadmap | null;
  solvedQuestionIds?: Set<string>;
  skippedQuestionIds?: Set<string>;
}

export async function generateQuestionRecommendations({
  entries,
  collections: _collections,
  recommendation,
  roadmap,
  solvedQuestionIds = new Set(),
  skippedQuestionIds = new Set(),
}: GenerateQuestionRecommendationsParams): Promise<RecommendationBatch> {
  const readinessScore = recommendation.overallReadinessScore;

  // 1. Identify Priority Topics
  const weakTopics = recommendation.weakTopics;
  const weakest = weakTopics.weakestTopic?.name;
  const secondWeakest = weakTopics.secondWeakestTopic?.name;
  const neglected = weakTopics.mostNeglectedTopic?.name;

  const roadmapFocus = roadmap?.dailyMission?.focusTopic;
  const weeklyTopics = roadmap?.weeklyRoadmap?.priorityTopics ?? [];

  // Build ordered target topics list
  const topicSet = new Set<string>();
  if (weakest) topicSet.add(weakest);
  if (roadmapFocus) topicSet.add(roadmapFocus);
  if (secondWeakest) topicSet.add(secondWeakest);
  if (neglected) topicSet.add(neglected);
  weeklyTopics.forEach((t) => topicSet.add(t));
  recommendation.topicPerformance.forEach((tp) => topicSet.add(tp.topic));

  const targetTopics = Array.from(topicSet).slice(0, 6);
  if (targetTopics.length === 0) {
    targetTopics.push("Arrays", "Binary Search", "Dynamic Programming", "Trees & BST");
  }

  // 2. Fetch candidates from LeetCode and Codeforces
  const [lcProblems, cfProblems] = await Promise.all([
    leetCodeService.getProblems({
      topics: targetTopics,
      countPerPlatform: 45,
      difficulty: "Mixed",
      platforms: ["leetcode"],
    }),
    codeforcesService.getProblems({
      topics: targetTopics,
      countPerPlatform: 45,
      difficulty: "Mixed",
      platforms: ["codeforces"],
    }),
  ]);

  const candidatePool: Problem[] = [...lcProblems, ...cfProblems];

  // 3. Exclude solved & skipped questions
  const historyTitles = new Set(
    entries
      .filter((e) => e.problemTitle)
      .map((e) => e.problemTitle!.toLowerCase().trim())
  );

  const availableCandidates = candidatePool.filter((p) => {
    const titleLower = p.title.toLowerCase().trim();
    const idStr = String(p.id);
    const platformId = p.platformProblemId ?? "";

    if (solvedQuestionIds.has(idStr) || solvedQuestionIds.has(titleLower) || solvedQuestionIds.has(platformId)) {
      return false;
    }
    if (skippedQuestionIds.has(idStr) || skippedQuestionIds.has(titleLower) || skippedQuestionIds.has(platformId)) {
      return false;
    }
    if (historyTitles.has(titleLower)) {
      return false;
    }
    return true;
  });

  // Fallback pool if everything is filtered out
  const finalCandidates = availableCandidates.length > 0 ? availableCandidates : candidatePool;

  // 4. Score candidates using deterministic multi-factor rules
  const scored = finalCandidates.map((problem) => {
    const primaryTopic = problem.topics[0] ?? targetTopics[0];
    let score = 50; // base score

    // Weakness alignment (+30 pts max)
    if (weakest && problem.topics.includes(weakest)) score += 30;
    else if (secondWeakest && problem.topics.includes(secondWeakest)) score += 20;
    else if (neglected && problem.topics.includes(neglected)) score += 15;

    // Roadmap goal match (+20 pts max)
    if (roadmapFocus && problem.topics.includes(roadmapFocus)) score += 20;
    else if (weeklyTopics.some((wt) => problem.topics.includes(wt))) score += 10;

    // Difficulty progression (+15 pts max)
    if (readinessScore < 60) {
      if (problem.difficulty === "Easy") score += 15;
      else if (problem.difficulty === "Medium") score += 8;
    } else if (readinessScore < 80) {
      if (problem.difficulty === "Medium") score += 15;
      else if (problem.difficulty === "Easy") score += 8;
      else score += 10;
    } else {
      if (problem.difficulty === "Hard") score += 15;
      else if (problem.difficulty === "Medium") score += 12;
    }

    return { problem, score, primaryTopic };
  });

  // Sort candidates by score descending
  scored.sort((a, b) => b.score - a.score);

  // 5. Categorize candidates into 4 buckets
  const topRecs: QuestionRecommendation[] = [];
  const stretchChallenges: QuestionRecommendation[] = [];
  const confidenceBuilders: QuestionRecommendation[] = [];
  const interviewPrep: QuestionRecommendation[] = [];

  const usedUrls = new Set<string>();

  scored.forEach(({ problem, score, primaryTopic }, index) => {
    if (usedUrls.has(problem.url || problem.title)) return;

    const topicScore = recommendation.topicPerformance.find((tp) => tp.topic === primaryTopic)?.avgScore ?? 65;
    const isWeakest = primaryTopic === weakest;

    // Determine category based on problem attributes and score rank
    let category: QuestionCategory = "Top Recommendation";
    let priority: QuestionPriority = "Medium";
    let reason = `Recommended based on your focus in ${primaryTopic} (Score: ${Math.round(topicScore)}).`;

    if (problem.difficulty === "Hard" || (readinessScore < 70 && problem.difficulty === "Medium" && index % 2 === 0)) {
      category = "Stretch Challenge";
      priority = "High";
      reason = `Stretch Challenge: Selected to push your boundaries in ${primaryTopic} and elevate your readiness score beyond ${readinessScore}.`;
    } else if (problem.difficulty === "Easy" || isWeakest) {
      category = "Confidence Builder";
      priority = "High";
      reason = `Confidence Builder: Reinforces core fundamentals in your weakest area (${primaryTopic}).`;
    } else if (index % 3 === 0 || problem.topics.includes("Arrays") || problem.topics.includes("Dynamic Programming")) {
      category = "Interview Preparation";
      priority = "High";
      reason = `Interview Classic: High-frequency interview question covering essential ${primaryTopic} patterns.`;
    } else {
      category = "Top Recommendation";
      priority = isWeakest ? "High" : "Medium";
      reason = `Top Recommendation: Perfectly aligns with your current roadmap focus on ${primaryTopic}.`;
    }

    const confidenceScore = Math.min(99, Math.max(70, Math.round(score * 0.85 + (100 - topicScore) * 0.15)));

    const recItem: QuestionRecommendation = {
      id: `qrec_${problem.platform}_${problem.id}_${Date.now()}_${index}`,
      title: problem.title,
      platform: problem.platform,
      difficulty: problem.difficulty,
      topic: primaryTopic,
      rating: problem.platform === "codeforces" ? 1200 + (problem.difficulty === "Hard" ? 500 : problem.difficulty === "Medium" ? 300 : 0) : problem.id,
      problemUrl: problem.url || (problem.platform === "leetcode" ? `https://leetcode.com/problems/${problem.title.toLowerCase().replace(/\s+/g, "-")}` : `https://codeforces.com/problemset`),
      recommendationReason: reason,
      priority,
      estimatedTime: problem.estimated || (problem.difficulty === "Easy" ? "15 mins" : problem.difficulty === "Medium" ? "30 mins" : "45 mins"),
      confidenceScore,
      category,
      platformProblemId: problem.platformProblemId || String(problem.id),
      solutions: problem.solutions,
      complexity: problem.complexity,
      takeaways: problem.takeaways,
      status: "Pending",
      recommendedAt: new Date().toISOString(),
    };

    usedUrls.add(problem.url || problem.title);

    // Distribute into buckets
    if (category === "Stretch Challenge" && stretchChallenges.length < 3) {
      stretchChallenges.push(recItem);
    } else if (category === "Confidence Builder" && confidenceBuilders.length < 3) {
      confidenceBuilders.push(recItem);
    } else if (category === "Interview Preparation" && interviewPrep.length < 3) {
      interviewPrep.push(recItem);
    } else if (topRecs.length < 5) {
      topRecs.push(recItem);
    } else if (stretchChallenges.length < 3) {
      stretchChallenges.push({ ...recItem, category: "Stretch Challenge" });
    } else if (confidenceBuilders.length < 3) {
      confidenceBuilders.push({ ...recItem, category: "Confidence Builder" });
    } else if (interviewPrep.length < 3) {
      interviewPrep.push({ ...recItem, category: "Interview Preparation" });
    }
  });

  const allRecommendedQuestions = [
    ...topRecs,
    ...stretchChallenges,
    ...confidenceBuilders,
    ...interviewPrep,
  ];

  const targetGoal = weakest
    ? `Targeting weakest area (${weakest}) & Roadmap focus (${roadmapFocus || targetTopics[0]})`
    : `Targeting topic mastery across ${targetTopics.slice(0, 3).join(", ")}`;

  return {
    id: `batch_${Date.now()}`,
    generatedAt: new Date().toISOString(),
    sourceTopics: targetTopics,
    recommendedQuestions: allRecommendedQuestions,
    targetGoal,
    readinessScore,
  };
}
