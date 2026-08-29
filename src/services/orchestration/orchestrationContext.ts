import { PreparationContext } from "./orchestrationTypes";
import { SkillNode } from "@/services/learningGraph/learningGraphTypes";
import { RevisionItem } from "@/services/revision/revisionTypes";
import { getActiveGoal } from "@/services/preparation/preparationStorage";
import { compilePerformanceIntelligence } from "@/services/performance/performanceEngine";
import { compileAdaptiveStrategy } from "@/services/intervention/interventionEngine";
import { getStoredSkillNodes } from "@/services/learningGraph/learningGraphStorage";
import { revisionStorage } from "@/services/revision/revisionStorage";
import { getSessionHistory } from "@/services/practice/practiceSessionStorage";
import { interviewStorage } from "@/services/interview/interviewStorage";
import { getContestHistory } from "@/services/contest/virtualContestStorage";

export async function assemblePreparationContext(
  availableMinutes = 45,
  forceRefresh = false
): Promise<PreparationContext> {
  // 1. Goal Authority (Preparation Command Center)
  const activeGoal = getActiveGoal();
  const goalType = activeGoal?.type ?? "none";

  // 2. Analysis Authority (Performance Intelligence)
  let currentPerformanceState = null;
  try {
    currentPerformanceState = await compilePerformanceIntelligence("30d", forceRefresh);
  } catch (err) {
    console.error("[orchestrationContext] Failed to load performance intelligence:", err);
  }

  // 3. Strategy Authority (Adaptive Intervention Engine)
  let strategyState = null;
  try {
    const strategyResult = await compileAdaptiveStrategy(forceRefresh, currentPerformanceState ?? undefined);
    strategyState = strategyResult.state;
  } catch (err) {
    console.error("[orchestrationContext] Failed to load adaptive strategy:", err);
  }

  // 4. Skill & Dependency Authority (Learning Graph)
  let learningGraphNodes: SkillNode[] = [];
  try {
    learningGraphNodes = getStoredSkillNodes();
  } catch (err) {
    console.error("[orchestrationContext] Failed to load learning graph nodes:", err);
  }

  // 5. Revision Scheduling Authority (SRS)
  let revisionDueItems: RevisionItem[] = [];
  try {
    const allRevisionItems = await revisionStorage.getItems();
    const todayStr = new Date().toISOString().split("T")[0];
    revisionDueItems = allRevisionItems.filter(
      (item) => item.status === "due" || item.nextDueDate <= todayStr
    );
  } catch (err) {
    console.error("[orchestrationContext] Failed to load SRS revision items:", err);
  }

  // 6. Recent Counts
  let recentPracticeSessionsCount = 0;
  try {
    recentPracticeSessionsCount = getSessionHistory().length;
  } catch (err) {
    console.error("[orchestrationContext] Failed to load practice history:", err);
  }

  let recentInterviewsCount = 0;
  try {
    const interviews = await interviewStorage.getHistory();
    recentInterviewsCount = interviews.length;
  } catch (err) {
    console.error("[orchestrationContext] Failed to load interview history:", err);
  }

  let recentContestsCount = 0;
  try {
    recentContestsCount = getContestHistory().length;
  } catch (err) {
    console.error("[orchestrationContext] Failed to load contest history:", err);
  }

  return {
    activeGoal,
    goalType,
    availableTimeMinutes: availableMinutes,
    currentPerformanceState,
    strategyState,
    learningGraphNodes,
    revisionDueItems,
    recentPracticeSessionsCount,
    recentInterviewsCount,
    recentContestsCount,
    timestamp: new Date().toISOString(),
  };
}
