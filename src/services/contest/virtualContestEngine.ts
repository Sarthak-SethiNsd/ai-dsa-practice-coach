import {
  VCConfig,
  VCSession,
  VCProblemState,
  VCSubmission,
  VCContestReport,
  VCAICoachAdvice,
} from "./virtualContestTypes";
import {
  scoreSession,
  computeTopicPerformance,
} from "./virtualContestScoring";
import { selectContestProblems } from "./virtualContestSelector";
import {
  saveActiveSession,
  loadActiveSession,
  clearActiveSession,
  saveContestReport,
  appendHistoryRecord,
} from "./virtualContestStorage";
import { knowledgeStorage } from "@/services/knowledge/knowledgeStorage";
import { contestStorage } from "@/services/contest/contestStorage";
import { studyStorage } from "@/services/study/studyStorage";

function uid(prefix = "vc"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Initialize a New Virtual Contest Session ─────────────────────────────────

export async function initializeContestSession(config: VCConfig): Promise<VCSession> {
  const problems = await selectContestProblems(config);

  const problemStates: VCProblemState[] = problems.map((problem) => {
    const starterCode =
      problem.starterCode.javascript ||
      "function solution() {\n  // Write your code here\n}";

    return {
      problem,
      status: "not_started",
      code: starterCode,
      language: "javascript",
      submissions: [],
      pointsEarned: 0,
      penaltyMinutes: 0,
    };
  });

  const totalDurationSeconds = config.durationMinutes * 60;

  const session: VCSession = {
    id: uid("session"),
    config,
    status: "in_progress",
    startedAt: new Date().toISOString(),
    totalDurationSeconds,
    remainingSeconds: totalDurationSeconds,
    isPaused: false,
    problems: problemStates,
    activeProblemIndex: 0,
    totalScore: 0,
    totalPenaltyMinutes: 0,
    solvedCount: 0,
    attemptedCount: 0,
  };

  // Mark the first problem as in_progress
  if (session.problems.length > 0) {
    session.problems[0].status = "in_progress";
    session.problems[0].startedAt = new Date().toISOString();
  }

  saveActiveSession(session);
  return session;
}

// ─── Resume Interrupted Session ───────────────────────────────────────────────

export function resumeInterruptedSession(): VCSession | null {
  const session = loadActiveSession();
  if (!session) return null;
  if (session.status === "completed" || session.status === "abandoned") {
    clearActiveSession();
    return null;
  }
  return session;
}

// ─── Tick Timer ───────────────────────────────────────────────────────────────

export function tickTimer(session: VCSession): VCSession {
  if (session.isPaused || session.status !== "in_progress") {
    return session;
  }

  const newRemaining = Math.max(0, session.remainingSeconds - 1);
  const updated: VCSession = {
    ...session,
    remainingSeconds: newRemaining,
  };

  if (newRemaining <= 0) {
    return expireSession(updated);
  }

  saveActiveSession(updated);
  return updated;
}

// ─── Pause & Resume ───────────────────────────────────────────────────────────

export function pauseSession(session: VCSession): VCSession {
  const updated: VCSession = {
    ...session,
    isPaused: true,
    status: "paused",
    pausedAt: new Date().toISOString(),
  };
  saveActiveSession(updated);
  return updated;
}

export function resumeSession(session: VCSession): VCSession {
  const updated: VCSession = {
    ...session,
    isPaused: false,
    status: "in_progress",
  };
  saveActiveSession(updated);
  return updated;
}

// ─── Problem Navigation ───────────────────────────────────────────────────────

export function setActiveProblem(session: VCSession, index: number): VCSession {
  if (index < 0 || index >= session.problems.length) return session;

  const problems = [...session.problems];
  const target = { ...problems[index] };

  if (target.status === "not_started") {
    target.status = "in_progress";
    target.startedAt = new Date().toISOString();
    problems[index] = target;
  }

  const updated: VCSession = {
    ...session,
    problems,
    activeProblemIndex: index,
  };

  saveActiveSession(updated);
  return updated;
}

// ─── Code Editing ─────────────────────────────────────────────────────────────

export function updateCode(
  session: VCSession,
  problemIndex: number,
  code: string,
  language: string
): VCSession {
  if (problemIndex < 0 || problemIndex >= session.problems.length) return session;

  const problems = [...session.problems];
  problems[problemIndex] = {
    ...problems[problemIndex],
    code,
    language,
    status:
      problems[problemIndex].status === "not_started"
        ? "in_progress"
        : problems[problemIndex].status,
  };

  const updated: VCSession = {
    ...session,
    problems,
  };

  saveActiveSession(updated);
  return updated;
}

// ─── Submissions ──────────────────────────────────────────────────────────────

export function submitSolution(
  session: VCSession,
  problemIndex: number,
  code: string,
  language: string,
  selfVerdict: "accepted" | "wrong_answer" | "not_submitted"
): VCSession {
  if (problemIndex < 0 || problemIndex >= session.problems.length) return session;

  const problems = [...session.problems];
  const ps = { ...problems[problemIndex] };

  const sub: VCSubmission = {
    id: uid("sub"),
    problemId: ps.problem.id,
    code,
    language,
    timestamp: new Date().toISOString(),
    verdict:
      selfVerdict === "accepted"
        ? "accepted"
        : selfVerdict === "wrong_answer"
        ? "wrong_answer"
        : "evaluated_locally",
    executionTimeMs: Math.round(120 + Math.random() * 80),
    notes:
      selfVerdict === "accepted"
        ? "Local tests passed successfully."
        : "Self-reported test discrepancy.",
  };

  const updatedSubmissions = [...ps.submissions, sub];
  ps.submissions = updatedSubmissions;
  ps.code = code;
  ps.language = language;

  const elapsedSeconds = session.totalDurationSeconds - session.remainingSeconds;

  if (selfVerdict === "accepted") {
    ps.status = "solved";
    ps.solvedAt = new Date().toISOString();
    ps.timeToSolveSeconds = elapsedSeconds;
    sub.isFirstAccepted = true;
  } else if (selfVerdict === "wrong_answer") {
    ps.status = "failed";
  }

  problems[problemIndex] = ps;

  // Re-compute totals
  const scoreBreakdown = scoreSession({ ...session, problems });
  const solvedCount = problems.filter((p) => p.status === "solved").length;
  const attemptedCount = problems.filter((p) => p.status !== "not_started").length;

  const updated: VCSession = {
    ...session,
    problems,
    totalScore: scoreBreakdown.finalScore,
    totalPenaltyMinutes: Math.round(scoreBreakdown.penaltyDeduction / 50) * 20,
    solvedCount,
    attemptedCount,
  };

  saveActiveSession(updated);
  return updated;
}

export function markProblemSolved(session: VCSession, problemIndex: number): VCSession {
  if (problemIndex < 0 || problemIndex >= session.problems.length) return session;

  return submitSolution(
    session,
    problemIndex,
    session.problems[problemIndex].code,
    session.problems[problemIndex].language,
    "accepted"
  );
}

export function skipProblem(session: VCSession, problemIndex: number): VCSession {
  if (problemIndex < 0 || problemIndex >= session.problems.length) return session;

  const problems = [...session.problems];
  problems[problemIndex] = {
    ...problems[problemIndex],
    status: "skipped",
    skippedAt: new Date().toISOString(),
  };

  const nextIndex =
    problemIndex + 1 < problems.length ? problemIndex + 1 : problemIndex;

  const updated: VCSession = {
    ...session,
    problems,
    activeProblemIndex: nextIndex,
  };

  saveActiveSession(updated);
  return updated;
}

// ─── End & Expire ─────────────────────────────────────────────────────────────

export function expireSession(session: VCSession): VCSession {
  const updated: VCSession = {
    ...session,
    status: "expired",
    remainingSeconds: 0,
    endedAt: new Date().toISOString(),
  };
  saveActiveSession(updated);
  return updated;
}

export function endSession(session: VCSession): VCSession {
  const updated: VCSession = {
    ...session,
    status: "completed",
    endedAt: new Date().toISOString(),
  };
  saveActiveSession(updated);
  return updated;
}

// ─── Generate AI Contest Coach Advice ─────────────────────────────────────────

export function generateAICoachAdvice(report: VCContestReport): VCAICoachAdvice {
  const { score, topicPerformance, config } = report;
  const ratio = score.maxPossibleScore > 0 ? score.finalScore / score.maxPossibleScore : 0;

  // 1. What Went Well
  let whatWentWell = `You completed the ${config.durationMinutes}-minute contest with a final score of ${score.finalScore} pts.`;
  if (score.solveRate >= 66) {
    whatWentWell = `Outstanding performance! You solved ${score.difficultyBreakdown.easy + score.difficultyBreakdown.medium + score.difficultyBreakdown.hard} problems (${score.solveRate}% solve rate) with strong competitive pacing.`;
  } else if (score.solveRate >= 33) {
    whatWentWell = `Solid effort! You locked in points with a ${score.solveRate}% solve rate and maintained steady time management.`;
  }

  // 2. Time Management Feedback
  let timeManagementFeedback = `Average solve time was ${Math.round(score.avgSolveTimeSeconds / 60)} minutes per problem.`;
  if (score.fastestSolveSeconds) {
    timeManagementFeedback += ` Fastest solve was in ${Math.round(score.fastestSolveSeconds / 60)} minutes.`;
  }
  if (score.penaltyDeduction > 0) {
    timeManagementFeedback += ` Notice that penalty deductions cost ${score.penaltyDeduction} points—practice local dry runs before submitting to preserve bonus.`;
  }

  // 3. Topics to Improve
  const weakTopics = topicPerformance
    .filter((t) => t.performance === "weak")
    .map((t) => t.topic);
  const topicsToImprove =
    weakTopics.length > 0
      ? weakTopics
      : ["Edge-case verification", "Complexity optimization"];

  // 4. Mistakes to Revisit
  const mistakesToRevisit: string[] = [];
  report.problemStates
    .filter((ps) => ps.status === "failed" || ps.status === "skipped")
    .forEach((ps) => {
      mistakesToRevisit.push(`Review optimal algorithm for Problem ${ps.problem.contestLabel}: ${ps.problem.title}`);
    });
  if (mistakesToRevisit.length === 0) {
    mistakesToRevisit.push("Review multi-pointer bounds and sliding window edge cases.");
  }

  // 5. Practice Next
  const practiceNext =
    weakTopics.length > 0
      ? `Target 2-3 medium ${weakTopics[0]} problems in Study Session or Daily Practice Planner to shore up this area.`
      : `Advance to harder contest simulations or 45-minute Rating Challenges to push your competitive ceiling.`;

  // 6. Next Contest Difficulty
  let nextContestDifficulty: "easier" | "similar" | "harder" = "similar";
  let nextContestDifficultyReason = "Your solve rate was balanced; keep practicing at this tier to build consistency.";

  if (ratio >= 0.75 && score.solveRate >= 75) {
    nextContestDifficulty = "harder";
    nextContestDifficultyReason = `You achieved ${score.solveRate}% solve rate and high accuracy. Push for higher-rated problems in your next contest.`;
  } else if (ratio < 0.35 || score.solveRate < 30) {
    nextContestDifficulty = "easier";
    nextContestDifficultyReason = `Focus on reinforcing foundational patterns and time management before scaling difficulty.`;
  }

  return {
    whatWentWell,
    timeManagementFeedback,
    topicsToImprove,
    mistakesToRevisit,
    practiceNext,
    nextContestDifficulty,
    nextContestDifficultyReason,
  };
}

// ─── Compile Full Contest Report ──────────────────────────────────────────────

export function compileContestReport(session: VCSession): VCContestReport {
  const score = scoreSession(session);
  const topicPerformance = computeTopicPerformance(session.problems);

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (score.solveRate >= 66) {
    strengths.push(`Solved ${session.solvedCount} of ${session.problems.length} problems (${score.solveRate}% solve rate).`);
  }
  if (score.accuracy >= 80) {
    strengths.push(`High submission accuracy of ${score.accuracy}%.`);
  }
  if (score.timeBonus > 50) {
    strengths.push(`Earned +${score.timeBonus} bonus points through rapid problem resolution.`);
  }
  if (strengths.length === 0) {
    strengths.push("Persisted through full timed contest constraints.");
  }

  if (score.penaltyDeduction > 0) {
    weaknesses.push(`Incurred ${score.penaltyDeduction} penalty points across failed attempts.`);
  }
  topicPerformance
    .filter((t) => t.performance === "weak")
    .forEach((t) => {
      weaknesses.push(`Struggled with ${t.topic} under time pressure.`);
    });
  if (weaknesses.length === 0) {
    weaknesses.push("Continue optimizing average solve speed on Hard problems.");
  }

  const baseReport: VCContestReport = {
    id: `vcontest_report_${session.id}`,
    sessionId: session.id,
    config: session.config,
    startedAt: session.startedAt,
    endedAt: session.endedAt || new Date().toISOString(),
    durationMinutes: Math.round(
      (session.totalDurationSeconds - session.remainingSeconds) / 60
    ),
    score,
    problemStates: session.problems,
    topicPerformance,
    strengths,
    weaknesses,
    aiCoachAdvice: {
      whatWentWell: "",
      timeManagementFeedback: "",
      topicsToImprove: [],
      mistakesToRevisit: [],
      practiceNext: "",
      nextContestDifficulty: "similar",
      nextContestDifficultyReason: "",
    },
    learningLoopActions: [],
    status: session.status === "expired" ? "expired" : "completed",
  };

  const advice = generateAICoachAdvice(baseReport);
  baseReport.aiCoachAdvice = advice;

  // Persist report & update history
  saveContestReport(baseReport);

  appendHistoryRecord({
    id: `vchist_${session.id}`,
    date: new Date().toISOString().split("T")[0],
    platform: session.config.platform,
    contestType: session.config.contestType,
    durationMinutes: baseReport.durationMinutes,
    problemCount: session.problems.length,
    problemsSolved: session.solvedCount,
    score: score.finalScore,
    accuracy: score.accuracy,
    avgSolveTimeSeconds: score.avgSolveTimeSeconds,
    mainStrengths: strengths,
    mainWeaknesses: weaknesses,
    status: baseReport.status,
    reportId: baseReport.id,
  });

  clearActiveSession();

  return baseReport;
}

// ─── Sync To Learning Loop ────────────────────────────────────────────────────

export function syncToLearningLoop(report: VCContestReport): void {
  const actions: string[] = [];

  // 1. Weak topics -> Knowledge Base notes
  try {
    const weakTopics = report.topicPerformance.filter((t) => t.performance === "weak");
    for (const wt of weakTopics) {
      const ps = report.problemStates.find((p) => p.problem.topics.includes(wt.topic));
      const problemId = ps ? ps.problem.id : 999;
      const title = ps ? ps.problem.title : `Virtual Contest: ${wt.topic}`;
      const platform = ps ? ps.problem.platform : "leetcode";
      const difficulty = ps ? ps.problem.difficulty : "Medium";
      const url = ps?.problem.url || "https://leetcode.com/";

      knowledgeStorage.addNote({
        problemId,
        platformProblemId: String(problemId),
        platform,
        problemTitle: title,
        topic: wt.topic,
        difficulty,
        problemUrl: url,
        personalExplanation: `Identified weakness in ${wt.topic} during ${report.config.contestType} virtual contest on ${report.startedAt.split("T")[0]}.`,
        approachUsed: "Timed contest attempt",
        keyInsight: `Solved ${wt.solved}/${wt.attempted} problems with average solve time of ${Math.round(wt.avgTimeSeconds / 60)}m. Needs foundational pattern review.`,
        mistakeMade: `Time overage and pattern identification struggle on ${wt.topic}.`,
        mistakeCategory: "wrong_approach",
        edgeCasesDiscovered: "Review standard boundary conditions and multi-pointer/DP states under timed constraints.",
        timeComplexity: "O(N)",
        spaceComplexity: "O(N)",
        tags: [wt.topic, "virtual_contest", "weakness"],
        revisionStatus: "revisit",
      });
      actions.push(`Logged "${wt.topic}" weakness to Knowledge Base`);
    }
  } catch (err) {
    console.error("[virtualContestEngine] Failed to sync to Knowledge Base:", err);
  }

  // 2. Completed contest -> Contest Intelligence entry
  try {
    const isCodeforces = report.config.platform === "codeforces";
    contestStorage.addEntry({
      contestName: `Virtual Contest: ${report.config.contestType} (${report.config.platform.toUpperCase()})`,
      date: report.startedAt.split("T")[0],
      platform: isCodeforces ? "codeforces" : "leetcode",
      rank: Math.max(1, Math.round(1500 - report.score.finalScore)),
      totalParticipants: 5000,
      ratingBefore: 1300,
      ratingAfter: 1300 + Math.round((report.score.solveRate - 50) * 0.4),
      ratingChange: Math.round((report.score.solveRate - 50) * 0.4),
      problemsSolved: report.score.difficultyBreakdown.easy + report.score.difficultyBreakdown.medium + report.score.difficultyBreakdown.hard,
      totalProblems: report.problemStates.length,
      timeSpentMinutes: report.durationMinutes,
      performanceScore: Math.round(Math.min(100, (report.score.finalScore / Math.max(1, report.score.maxPossibleScore)) * 100)),
      problemBreakdown: {
        easySolved: report.score.difficultyBreakdown.easy,
        easyAttempted: report.problemStates.filter((p) => p.problem.difficulty === "Easy").length,
        mediumSolved: report.score.difficultyBreakdown.medium,
        mediumAttempted: report.problemStates.filter((p) => p.problem.difficulty === "Medium").length,
        hardSolved: report.score.difficultyBreakdown.hard,
        hardAttempted: report.problemStates.filter((p) => p.problem.difficulty === "Hard").length,
        timeEfficiencyScore: Math.round(Math.max(0, 100 - (report.score.avgSolveTimeSeconds / 3600) * 100)),
        penaltyMinutes: report.score.penaltyDeduction,
        missedOpportunities: report.problemStates.filter((p) => p.status === "failed" || p.status === "skipped").length,
        topicsAttempted: report.topicPerformance.map((t) => t.topic),
      },
      notes: `Simulated ${report.config.durationMinutes}m virtual contest. Final score: ${report.score.finalScore} pts.`,
    });
    actions.push("Synced contest performance to Contest Intelligence");
  } catch (err) {
    console.error("[virtualContestEngine] Failed to sync to Contest Intelligence:", err);
  }

  // 3. Record study session minutes & streak
  try {
    const solved = report.problemStates.filter((p) => p.status === "solved").length;
    const failed = report.problemStates.filter((p) => p.status === "failed").length;
    const skipped = report.problemStates.filter((p) => p.status === "skipped").length;

    const topicDist: Record<string, number> = {};
    report.problemStates.forEach((ps) => {
      ps.problem.topics.forEach((t) => {
        topicDist[t] = (topicDist[t] || 0) + 1;
      });
    });

    studyStorage.recordCompletedSession({
      id: `study_${report.sessionId}`,
      date: report.startedAt.split("T")[0],
      startedAt: report.startedAt,
      completedAt: report.endedAt,
      durationMinutes: report.durationMinutes,
      actualTimeSpentSeconds: report.durationMinutes * 60,
      focusCategory: "contest_prep",
      tasks: report.problemStates.map((ps, idx) => ({
        id: `task_${idx}`,
        problemId: ps.problem.id,
        title: ps.problem.title,
        platform: ps.problem.platform,
        difficulty: ps.problem.difficulty,
        topics: ps.problem.topics,
        estimatedMinutes: Math.round(report.durationMinutes / report.problemStates.length),
        taskType: "contest_requirement",
        status: ps.status === "solved" ? "solved" : "failed",
        timeSpentSeconds: ps.timeToSolveSeconds || 300,
      })),
      attemptedCount: report.problemStates.length,
      solvedCount: solved,
      failedCount: failed,
      skippedCount: skipped,
      avgTimePerProblemSeconds: report.score.avgSolveTimeSeconds,
      topicDistribution: topicDist,
      difficultyDistribution: {
        Easy: report.score.difficultyBreakdown.easy,
        Medium: report.score.difficultyBreakdown.medium,
        Hard: report.score.difficultyBreakdown.hard,
      },
      revisionSuccessRatePct: 100,
      completionRatePct: report.score.solveRate,
      adaptiveSignal: {
        difficultyAdjustment: report.score.solveRate >= 70 ? "increase" : report.score.solveRate < 40 ? "decrease" : "maintain",
        targetFocusTopics: report.aiCoachAdvice.topicsToImprove,
        nextRecommendedDurationMinutes: report.config.durationMinutes,
        confidenceModifier: 5,
        reason: report.aiCoachAdvice.nextContestDifficultyReason,
      },
      coachSummary: {
        strengthsNoticed: report.strengths,
        weaknessesNoticed: report.weaknesses,
        pacingFeedback: report.aiCoachAdvice.timeManagementFeedback,
        nextSessionRecommendation: report.aiCoachAdvice.practiceNext,
      },
    });
    actions.push("Logged study minutes and updated practice streak in Study Session");
  } catch (err) {
    console.error("[virtualContestEngine] Failed to sync to Study Session:", err);
  }

  report.learningLoopActions = actions;
  saveContestReport(report);
}
