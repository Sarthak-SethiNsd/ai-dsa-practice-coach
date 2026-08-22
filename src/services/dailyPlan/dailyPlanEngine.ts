import {
  DailyPlan,
  DailyAction,
  ActionType,
  AIDailyCoachAdvice,
  TomorrowPreviewData,
  PlanHistoryRecord,
  ScoringContext,
} from "./dailyPlanTypes";
import {
  scoreAction,
  scoreToPriority,
  allocateTimeBudget,
  detectOverlappingWeakTopics,
} from "./dailyPlanScoring";
import { revisionStorage } from "@/services/revision/revisionStorage";
import { roadmapStorage } from "@/services/roadmapStorage";
import { knowledgeStorage } from "@/services/knowledge/knowledgeStorage";
import { contestStorage } from "@/services/contest/contestStorage";
import { studyStorage } from "@/services/study/studyStorage";
import { recommendationHistoryStorage } from "@/services/recommendationHistoryStorage";
import { questionRecommendationStorage } from "@/services/questionRecommendationStorage";

// ─── Utilities ────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function tomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function uid(): string {
  return `action_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

function difficultyToMinutes(difficulty?: string): number {
  switch (difficulty?.toLowerCase()) {
    case "easy":   return 15;
    case "medium": return 25;
    case "hard":   return 40;
    default:       return 20;
  }
}

// ─── Main Engine ──────────────────────────────────────────────────────────────

export async function generateDailyPlan(timeBudgetMinutes: number): Promise<DailyPlan> {
  const today = todayStr();
  const allocation = allocateTimeBudget(timeBudgetMinutes);

  // ── Fetch signals from all subsystems ──────────────────────────────────────
  const [
    revisionItems,
    roadmap,
    completedTasks,
    notes,
    contestGoals,
    streak,
    snapshots,
    recBatch,
    solvedRecs,
  ] = await Promise.all([
    revisionStorage.getItems(),
    roadmapStorage.getRoadmap(),
    roadmapStorage.getCompletedTasks(),
    knowledgeStorage.getNotes(),
    contestStorage.getGoals(),
    studyStorage.getStreak(),
    recommendationHistoryStorage.getAllSnapshots(),
    questionRecommendationStorage.getBatch(),
    questionRecommendationStorage.getSolved(),
  ]);

  const allContestEntries = await contestStorage.getEntries();

  // ── Compute weak topics across subsystems ──────────────────────────────────
  const latestSnapshot = snapshots[0] ?? null;

  const analyticsWeakTopics: string[] = latestSnapshot?.weakTopics
    ? [
        latestSnapshot.weakTopics.weakestTopic?.name,
        latestSnapshot.weakTopics.secondWeakestTopic?.name,
      ].filter(Boolean) as string[]
    : [];

  // Topics that appear as mistake in notes (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const noteMistakeTopics = notes
    .filter((n) => n.mistakeCategory && new Date(n.updatedAt) > thirtyDaysAgo)
    .map((n) => n.topic ?? n.patternName ?? "")
    .filter(Boolean);

  const overlappingWeakTopics = detectOverlappingWeakTopics(
    analyticsWeakTopics,
    [],  // review topics — we use snapshots instead
    noteMistakeTopics
  );

  // ── Detect upcoming contest ─────────────────────────────────────────────────
  const inThreeDays = new Date();
  inThreeDays.setDate(inThreeDays.getDate() + 3);
  const upcomingContest = allContestEntries.find((e) => {
    // Check contest goals with target date within 3 days
    const contestGoal = contestGoals.find(
      (g) => g.category === "participation" && g.targetDate
    );
    return contestGoal && new Date(contestGoal.targetDate) <= inThreeDays;
  });
  const hasContestWithin3Days = !!upcomingContest;

  // ── Detect recent mistakes (last 48h) ──────────────────────────────────────
  const fortyEightHoursAgo = new Date();
  fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);
  const recentMistakeNotes = notes.filter(
    (n) => n.mistakeCategory && new Date(n.updatedAt) > fortyEightHoursAgo
  );
  const hasMistakeInLast48h = recentMistakeNotes.length > 0;

  // ── Build actions array ────────────────────────────────────────────────────
  const actions: DailyAction[] = [];
  let usedMinutes = 0;

  // ── 1. REVISION actions (overdue first, then due today) ───────────────────
  const overdueItems = revisionItems.filter((i) => i.status === "overdue");
  const dueItems = revisionItems.filter((i) => i.status === "due");
  const allDueRevision = [...overdueItems, ...dueItems];

  for (const item of allDueRevision) {
    const estMins = difficultyToMinutes(item.difficulty);
    if (usedMinutes + estMins > allocation.revisionMinutes + 5) break;

    const isOverdue = item.status === "overdue";
    const ctx: ScoringContext = {
      hasOverdueSRS: isOverdue,
      hasDueSRS: !isOverdue,
      hasWeakTopicOverlap: item.topics.some((t) =>
        overlappingWeakTopics.includes(t.toLowerCase())
      ),
      hasGoalAlignment: false,
      hasRoadmapMilestone: false,
      hasContestWithin3Days,
      hasMistakeInLast48h: false,
      remainingBudgetMinutes: timeBudgetMinutes - usedMinutes,
      estimatedActionMinutes: estMins,
    };

    const { score, reason } = scoreAction("REVISION", ctx);

    actions.push({
      id: uid(),
      actionType: "REVISION",
      title: `Revise: ${item.problemTitle}`,
      description: isOverdue
        ? `⚠️ Overdue revision — memory strength at ${item.memoryStrength}%. Solve again from scratch.`
        : `SRS item due today. Retention window optimal. Last score: ${item.lastReviewScore ?? "N/A"}.`,
      platform: item.platform,
      difficulty: item.difficulty,
      topic: item.topics[0],
      problemUrl: item.url,
      estimatedMinutes: estMins,
      priority: scoreToPriority(score),
      priorityScore: score,
      reason,
      expectedOutcome: "Extend SRS interval and strengthen long-term memory",
      goalAlignment: ctx.hasWeakTopicOverlap ? "High" : "Medium",
      status: "pending",
      sourceRef: { type: "revision", id: item.id },
    });

    usedMinutes += estMins;
  }

  // ── 2. ROADMAP_STEP actions ───────────────────────────────────────────────
  if (roadmap && allocation.newProblemMinutes > 0) {
    const pendingTasks = roadmap.allTasks.filter(
      (t) =>
        t.status !== "Completed" &&
        t.status !== "Skipped" &&
        !completedTasks[t.id]
    );
    const nextTask = pendingTasks[0];

    if (nextTask) {
      const estMins = parseInt(nextTask.estimatedTime) || 25;
      if (usedMinutes + estMins <= timeBudgetMinutes) {
        const ctx: ScoringContext = {
          hasOverdueSRS: false,
          hasDueSRS: false,
          hasWeakTopicOverlap: overlappingWeakTopics.includes(
            nextTask.topic.toLowerCase()
          ),
          hasGoalAlignment: true,
          hasRoadmapMilestone: true,
          hasContestWithin3Days,
          hasMistakeInLast48h: false,
          remainingBudgetMinutes: timeBudgetMinutes - usedMinutes,
          estimatedActionMinutes: estMins,
        };
        const { score, reason } = scoreAction("ROADMAP_STEP", ctx);

        actions.push({
          id: uid(),
          actionType: "ROADMAP_STEP",
          title: `Roadmap: ${nextTask.title}`,
          description: `Next step on your practice roadmap. Topic: ${nextTask.topic}. Priority: ${nextTask.priority}.`,
          platform: nextTask.platform,
          difficulty: nextTask.difficulty,
          topic: nextTask.topic,
          problemUrl: nextTask.problemUrl,
          estimatedMinutes: estMins,
          priority: scoreToPriority(score),
          priorityScore: score,
          reason,
          expectedOutcome: "Advance your structured practice roadmap milestone",
          goalAlignment: "High",
          status: "pending",
          sourceRef: { type: "roadmap", id: nextTask.id },
        });

        usedMinutes += estMins;
      }
    }
  }

  // ── 3. WEAK_TOPIC_PRACTICE actions ────────────────────────────────────────
  if (overlappingWeakTopics.length > 0 && allocation.weakTopicMinutes > 0) {
    const weakTopic = overlappingWeakTopics[0];
    const estMins = Math.min(25, allocation.weakTopicMinutes);

    if (usedMinutes + estMins <= timeBudgetMinutes) {
      const ctx: ScoringContext = {
        hasOverdueSRS: false,
        hasDueSRS: false,
        hasWeakTopicOverlap: true,
        hasGoalAlignment: true,
        hasRoadmapMilestone: false,
        hasContestWithin3Days,
        hasMistakeInLast48h: hasMistakeInLast48h,
        remainingBudgetMinutes: timeBudgetMinutes - usedMinutes,
        estimatedActionMinutes: estMins,
      };
      const { score, reason } = scoreAction("WEAK_TOPIC_PRACTICE", ctx);

      // Capitalize topic name for display
      const displayTopic =
        weakTopic.charAt(0).toUpperCase() + weakTopic.slice(1);

      actions.push({
        id: uid(),
        actionType: "WEAK_TOPIC_PRACTICE",
        title: `Weak Topic Drill: ${displayTopic}`,
        description: `${displayTopic} identified as weak across multiple systems. Practice 1–2 problems targeting this topic specifically.`,
        topic: displayTopic,
        estimatedMinutes: estMins,
        priority: scoreToPriority(score),
        priorityScore: score,
        reason,
        expectedOutcome: `Improve ${displayTopic} proficiency and reduce cross-system weakness signal`,
        goalAlignment: "High",
        status: "pending",
        sourceRef: { type: "knowledge", id: "weak_topic_" + weakTopic },
      });

      usedMinutes += estMins;
    }
  }

  // ── 4. REVIEW_PREVIOUS_MISTAKE actions ────────────────────────────────────
  if (hasMistakeInLast48h && allocation.mistakeReviewMinutes > 0) {
    const mistakeNote = recentMistakeNotes[0];
    const estMins = 10;

    if (usedMinutes + estMins <= timeBudgetMinutes) {
      const ctx: ScoringContext = {
        hasOverdueSRS: false,
        hasDueSRS: false,
        hasWeakTopicOverlap: false,
        hasGoalAlignment: false,
        hasRoadmapMilestone: false,
        hasContestWithin3Days,
        hasMistakeInLast48h: true,
        remainingBudgetMinutes: timeBudgetMinutes - usedMinutes,
        estimatedActionMinutes: estMins,
      };
      const { score, reason } = scoreAction("REVIEW_PREVIOUS_MISTAKE", ctx);

      actions.push({
        id: uid(),
        actionType: "REVIEW_PREVIOUS_MISTAKE",
        title: `Review: Mistake on "${mistakeNote.problemTitle}"`,
        description: `You noted a mistake on this problem in the last 48 hours. Re-read your own analysis and identify the root cause before it becomes a habit.`,
        platform: mistakeNote.platform,
        difficulty: mistakeNote.difficulty,
        topic: mistakeNote.topic,
        problemUrl: mistakeNote.problemUrl,
        estimatedMinutes: estMins,
        priority: scoreToPriority(score),
        priorityScore: score,
        reason,
        expectedOutcome: "Break the mistake pattern before it solidifies",
        goalAlignment: "Medium",
        status: "pending",
        sourceRef: { type: "knowledge", id: mistakeNote.id },
      });

      usedMinutes += estMins;
    }
  }

  // ── 5. CONTEST_PREP (if contest within 3 days) ────────────────────────────
  if (hasContestWithin3Days && allocation.contestPrepMinutes > 0) {
    const estMins = Math.min(30, allocation.contestPrepMinutes);
    if (usedMinutes + estMins <= timeBudgetMinutes) {
      const ctx: ScoringContext = {
        hasOverdueSRS: false,
        hasDueSRS: false,
        hasWeakTopicOverlap: false,
        hasGoalAlignment: true,
        hasRoadmapMilestone: false,
        hasContestWithin3Days: true,
        hasMistakeInLast48h: false,
        remainingBudgetMinutes: timeBudgetMinutes - usedMinutes,
        estimatedActionMinutes: estMins,
      };
      const { score, reason } = scoreAction("CONTEST_PREP", ctx);

      actions.push({
        id: uid(),
        actionType: "CONTEST_PREP",
        title: "Contest Prep: Timed Problem Sprint",
        description:
          "A contest is coming up. Solve 2–3 easy/medium problems under time pressure to sharpen your execution speed and mental readiness.",
        estimatedMinutes: estMins,
        priority: scoreToPriority(score),
        priorityScore: score,
        reason,
        expectedOutcome:
          "Build speed, stamina, and contest-mode mental state before competition",
        goalAlignment: "High",
        status: "pending",
        sourceRef: { type: "contest", id: "contest_prep" },
      });

      usedMinutes += estMins;
    }
  }

  // ── 6. RECOMMENDED_PROBLEM (from latest question recommendation batch) ───
  if (recBatch && allocation.newProblemMinutes > 0) {
    const unsolvedRec = recBatch.recommendedQuestions?.find(
      (q) => !solvedRecs[q.id] && q.status !== "Solved"
    );
    if (unsolvedRec) {
      const estMins = parseInt(unsolvedRec.estimatedTime) || 25;
      if (usedMinutes + estMins <= timeBudgetMinutes) {
        const ctx: ScoringContext = {
          hasOverdueSRS: false,
          hasDueSRS: false,
          hasWeakTopicOverlap: overlappingWeakTopics.includes(
            unsolvedRec.topic.toLowerCase()
          ),
          hasGoalAlignment: unsolvedRec.priority === "High",
          hasRoadmapMilestone: false,
          hasContestWithin3Days,
          hasMistakeInLast48h: false,
          remainingBudgetMinutes: timeBudgetMinutes - usedMinutes,
          estimatedActionMinutes: estMins,
        };
        const { score, reason } = scoreAction("RECOMMENDED_PROBLEM", ctx);

        actions.push({
          id: uid(),
          actionType: "RECOMMENDED_PROBLEM",
          title: `Solve: ${unsolvedRec.title}`,
          description: unsolvedRec.recommendationReason,
          platform: unsolvedRec.platform,
          difficulty: unsolvedRec.difficulty,
          topic: unsolvedRec.topic,
          problemUrl: unsolvedRec.problemUrl,
          estimatedMinutes: estMins,
          priority: scoreToPriority(score),
          priorityScore: score,
          reason,
          expectedOutcome: `Build proficiency in ${unsolvedRec.topic} — targeted recommendation based on your readiness score`,
          goalAlignment: unsolvedRec.priority === "High" ? "High" : "Medium",
          status: "pending",
          sourceRef: { type: "recommendation", id: unsolvedRec.id },
        });

        usedMinutes += estMins;
      }
    }
  }

  // ── 7. MOCK_INTERVIEW (if time budget >= 45m and weak topics exist) ────────
  if (timeBudgetMinutes >= 45 && usedMinutes + 30 <= timeBudgetMinutes && overlappingWeakTopics.length > 0) {
    const focusTopic = overlappingWeakTopics[0];
    const displayTopic = focusTopic.charAt(0).toUpperCase() + focusTopic.slice(1);

    actions.push({
      id: uid(),
      actionType: "MOCK_INTERVIEW",
      title: `Mock Interview: ${displayTopic} Drill`,
      description: `Test your technical communication and complexity breakdown on ${displayTopic} under simulated interview conditions.`,
      topic: displayTopic,
      estimatedMinutes: 30,
      priority: "HIGH",
      priorityScore: 55,
      reason: "Reinforce weak topic with simulated interviewer pressure and live think-aloud evaluation",
      expectedOutcome: `Benchmark your ${displayTopic} interview readiness and test edge-case awareness`,
      goalAlignment: "High",
      status: "pending",
      sourceRef: { type: "interview", id: "mock_interview_drill" },
    });

    usedMinutes += 30;
  }

  // ── 8. VIRTUAL_CONTEST (if time budget >= 60m and contest prep is relevant) ──
  if (timeBudgetMinutes >= 60 && usedMinutes + 45 <= timeBudgetMinutes && (hasContestWithin3Days || overlappingWeakTopics.length > 0)) {
    actions.push({
      id: uid(),
      actionType: "VIRTUAL_CONTEST",
      title: "Virtual Contest Simulation (45m)",
      description: "Run a timed 3-problem contest with real platform problems, test submission accuracy, and evaluate competitive pace.",
      topic: "Contest Simulation",
      estimatedMinutes: 45,
      priority: "HIGH",
      priorityScore: 58,
      reason: "Build real-time competitive endurance, practice problem triage, and benchmark your solve rate",
      expectedOutcome: "Complete a timed contest simulation and feed performance weaknesses into the learning loop",
      goalAlignment: "High",
      status: "pending",
      sourceRef: { type: "vcontest", id: "virtual_contest_drill" },
    });

    usedMinutes += 45;
  }

  // ── Sort by priority score descending ──────────────────────────────────────
  actions.sort((a, b) => b.priorityScore - a.priorityScore);

  // ── Compute plan summary ───────────────────────────────────────────────────
  const criticalCount = actions.filter((a) => a.priority === "CRITICAL").length;
  const totalPlanned = actions.reduce((s, a) => s + a.estimatedMinutes, 0);

  // Determine main focus label
  let mainFocus = "Balanced Practice Session";
  const overdueCount = overdueItems.length;
  if (overdueCount > 0) {
    mainFocus = `${overdueCount} Overdue SRS Revision${overdueCount > 1 ? "s" : ""}`;
    if (overlappingWeakTopics.length > 0) {
      const topic =
        overlappingWeakTopics[0].charAt(0).toUpperCase() +
        overlappingWeakTopics[0].slice(1);
      mainFocus += ` + Weak Topic: ${topic}`;
    }
  } else if (overlappingWeakTopics.length > 0) {
    const topic =
      overlappingWeakTopics[0].charAt(0).toUpperCase() +
      overlappingWeakTopics[0].slice(1);
    mainFocus = `Weak Topic Focus: ${topic}`;
  } else if (hasContestWithin3Days) {
    mainFocus = "Contest Preparation Sprint";
  }

  const plan: DailyPlan = {
    id: `plan_${today}_${Date.now()}`,
    date: today,
    timeBudgetMinutes,
    totalPlannedMinutes: Math.min(totalPlanned, timeBudgetMinutes),
    completedMinutes: 0,
    actions,
    criticalCount,
    completedCount: 0,
    skippedCount: 0,
    streak: streak.currentStreak,
    mainFocus,
    status: "in_progress",
    generatedAt: new Date().toISOString(),
  };

  return plan;
}

// ─── Adaptive Replan ──────────────────────────────────────────────────────────
// Called when user skips tasks, marks completion early, or changes time budget.

export async function replanDailyPlan(
  currentPlan: DailyPlan,
  newTimeBudgetMinutes?: number
): Promise<DailyPlan> {
  const budget = newTimeBudgetMinutes ?? currentPlan.timeBudgetMinutes;

  // Generate fresh plan
  const freshPlan = await generateDailyPlan(budget);

  // Preserve completed action statuses from the current plan
  const completedIds = new Set(
    currentPlan.actions
      .filter((a) => a.status === "completed")
      .map((a) => a.sourceRef?.id)
      .filter(Boolean)
  );

  const mergedActions = freshPlan.actions.map((a) => {
    const sourceId = a.sourceRef?.id;
    if (sourceId && completedIds.has(sourceId)) {
      return { ...a, status: "completed" as const };
    }
    return a;
  });

  const completedCount = mergedActions.filter(
    (a) => a.status === "completed"
  ).length;
  const completedMinutes = mergedActions
    .filter((a) => a.status === "completed")
    .reduce((s, a) => s + a.estimatedMinutes, 0);

  return {
    ...freshPlan,
    id: currentPlan.id, // keep same plan ID for the day
    actions: mergedActions,
    completedCount,
    completedMinutes,
    replannedAt: new Date().toISOString(),
  };
}

// ─── Tomorrow Preview ─────────────────────────────────────────────────────────

export async function getTomorrowPreview(): Promise<TomorrowPreviewData> {
  const tomorrow = tomorrowStr();

  const [revisionItems, roadmap, completedTasks, contestGoals, allContestEntries] =
    await Promise.all([
      revisionStorage.getItems(),
      roadmapStorage.getRoadmap(),
      roadmapStorage.getCompletedTasks(),
      contestStorage.getGoals(),
      contestStorage.getEntries(),
    ]);

  const dueTomorrow = revisionItems.filter(
    (i) => i.nextDueDate === tomorrow && i.status !== "completed"
  ).length;
  const overdueTomorrow = revisionItems.filter(
    (i) => i.status === "overdue"
  ).length;

  // Next roadmap step
  let upcomingRoadmapStep: string | null = null;
  if (roadmap) {
    const nextTask = roadmap.allTasks.find(
      (t) => t.status !== "Completed" && t.status !== "Skipped" && !completedTasks[t.id]
    );
    upcomingRoadmapStep = nextTask?.title ?? null;
  }

  // Upcoming contest
  const inFiveDays = new Date();
  inFiveDays.setDate(inFiveDays.getDate() + 5);
  let upcomingContest: TomorrowPreviewData["upcomingContest"] = null;

  const goal = contestGoals.find(
    (g) => g.category === "participation" && g.targetDate &&
      new Date(g.targetDate) <= inFiveDays &&
      new Date(g.targetDate) > new Date()
  );
  if (goal?.targetDate) {
    const contestDate = new Date(goal.targetDate);
    const daysUntil = Math.ceil(
      (contestDate.getTime() - Date.now()) / 86400000
    );
    upcomingContest = {
      name: "Upcoming Contest",
      date: goal.targetDate,
      daysUntil,
    };
  }

  const estimatedMinutes = dueTomorrow * 20 + (upcomingRoadmapStep ? 25 : 0);

  return {
    srsItemsDue: dueTomorrow,
    srsItemsOverdue: overdueTomorrow,
    upcomingRoadmapStep,
    upcomingContest,
    estimatedMinutes,
  };
}

// ─── AI Daily Coach Advice ────────────────────────────────────────────────────

export async function generateDailyCoachAdvice(
  plan: DailyPlan
): Promise<AIDailyCoachAdvice> {
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? "Good morning! 🌅"
      : hour < 17
      ? "Good afternoon! ☀️"
      : "Good evening! 🌙";

  const criticalRevisions = plan.actions.filter(
    (a) => a.actionType === "REVISION" && a.priority === "CRITICAL"
  );
  const weakTopicActions = plan.actions.filter(
    (a) => a.actionType === "WEAK_TOPIC_PRACTICE"
  );
  const contestActions = plan.actions.filter(
    (a) => a.actionType === "CONTEST_PREP"
  );

  let mainDirective: string;
  let whyItMatters: string;
  let whatToAvoid: string;
  let nextMilestone: string;

  if (criticalRevisions.length > 0) {
    mainDirective = `Complete your ${criticalRevisions.length} overdue SRS revision${criticalRevisions.length > 1 ? "s" : ""} first`;
    whyItMatters = "Overdue SRS items are on the steep side of the forgetting curve — every day you delay increases the chance of permanent forgetting";
    whatToAvoid = "Don't skip revisions to jump to new problems. New problems have no value if old concepts are forgotten";
    nextMilestone = `Clear all ${criticalRevisions.length} overdue revision${criticalRevisions.length > 1 ? "s" : ""} today`;
  } else if (contestActions.length > 0) {
    mainDirective = "Focus on timed practice — a contest is approaching";
    whyItMatters = "Mental speed and pattern recall under time pressure are built through repetition, not knowledge alone";
    whatToAvoid = "Don't get stuck debugging a single problem — practice moving on and returning later, as in real contests";
    nextMilestone = "Complete the contest prep sprint with honest time tracking";
  } else if (weakTopicActions.length > 0) {
    const topic = weakTopicActions[0].topic ?? "your weak topic";
    mainDirective = `Target your weak area: ${topic}`;
    whyItMatters = `${topic} shows up as a gap in your notes, analytics, and review history — closing this gap will have compounding benefits across multiple problem types`;
    whatToAvoid = "Don't practice easy variants — deliberately target medium difficulty to build real muscle memory";
    nextMilestone = `Solve 2+ ${topic} problems and write down your insight in your Knowledge Base`;
  } else {
    mainDirective = "Maintain your practice streak with a balanced session";
    whyItMatters = "Consistent daily practice, even short sessions, compounds into massive long-term skill gains";
    whatToAvoid = "Don't skip today just because there's no urgent signal — consistency is the goal";
    nextMilestone = `Complete all ${plan.actions.length} planned action${plan.actions.length !== 1 ? "s" : ""} for today`;
  }

  const streakLine =
    plan.streak >= 3
      ? `You're on a ${plan.streak}-day streak — protect it!`
      : "Start your streak today — day 1 is always the hardest.";

  return {
    greeting,
    mainDirective,
    whyItMatters,
    whatToAvoid,
    nextMilestone,
    motivationLine: streakLine,
  };
}

// ─── Plan to History Record Converter ────────────────────────────────────────

export function planToHistoryRecord(plan: DailyPlan): PlanHistoryRecord {
  return {
    id: plan.id,
    date: plan.date,
    timeBudgetMinutes: plan.timeBudgetMinutes,
    totalPlannedMinutes: plan.totalPlannedMinutes,
    completedMinutes: plan.completedMinutes,
    completedCount: plan.completedCount,
    totalActions: plan.actions.length,
    mainFocus: plan.mainFocus,
    status: plan.status,
    generatedAt: plan.generatedAt,
  };
}
