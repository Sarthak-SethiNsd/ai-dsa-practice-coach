import {
  InterviewConfig,
  InterviewSession,
  InterviewProblem,
  InterviewPhase,
  HintLevel,
  InterviewChatMessage,
  AIInterviewReport,
  InterviewHistoryRecord,
  INTERVIEW_PHASES,
} from "./interviewTypes";
import { selectInterviewQuestions } from "./interviewQuestionSelector";
import { evaluateInterviewSession, HINT_PENALTIES } from "./interviewScoring";
import { interviewStorage } from "./interviewStorage";
import { knowledgeStorage } from "@/services/knowledge/knowledgeStorage";

function uid(prefix: string = "msg"): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

// ─── Phase Transition Helpers ─────────────────────────────────────────────────

export function getNextPhase(current: InterviewPhase): InterviewPhase | null {
  const currentIndex = INTERVIEW_PHASES.findIndex((p) => p.id === current);
  if (currentIndex === -1 || currentIndex >= INTERVIEW_PHASES.length - 1) {
    return null;
  }
  return INTERVIEW_PHASES[currentIndex + 1].id;
}

// ─── Contextual Interviewer Responses (Deterministic Engine) ──────────────────

function generateInterviewerResponse(
  session: InterviewSession,
  candidateText: string
): string {
  const phase = session.currentPhase;
  const currentQ = session.questions[session.currentQuestionIndex];
  const lower = candidateText.toLowerCase();
  const style = session.config.style;

  const prefix =
    style === "Strict"
      ? "Understood."
      : style === "Coaching"
      ? "Great thought!"
      : "Thanks for explaining.";

  switch (phase) {
    case "problem_understanding":
      if (lower.includes("empty") || lower.includes("null") || lower.includes("negative") || lower.includes("duplicate")) {
        return `${prefix} Good clarifying question. For this problem, assume standard constraints: inputs fit within the stated ranges and may contain duplicates unless specified otherwise. How would you start thinking about the solution?`;
      }
      return `${prefix} Let's verify: have you considered constraints like max input length and edge cases such as empty or single-element inputs? When you're ready, walk me through your initial high-level approach.`;

    case "approach_discussion":
      if (lower.includes("hash") || lower.includes("map") || lower.includes("two pointer") || lower.includes("dp") || lower.includes("binary search")) {
        return `${prefix} That's a promising direction. What are the time and space trade-offs of this approach compared to a naive brute-force search?`;
      }
      if (lower.includes("brute") || lower.includes("nested") || lower.includes("o(n^2)")) {
        return `${prefix} That brute-force gives us a valid baseline. Can we do better in terms of time complexity using auxiliary memory or sorting?`;
      }
      return `${prefix} Walk me step-by-step through how your proposed algorithm processes the input data. What data structures will maintain state?`;

    case "algorithm_design":
      return `${prefix} The structure makes sense. Let's make sure we have our base cases and pointer/indexing logic clearly defined before typing out the code. What happens at the loop boundaries?`;

    case "complexity_analysis":
      if (lower.includes("o(n)") || lower.includes("o(1)") || lower.includes("o(n log n)") || lower.includes("o(m * n)")) {
        return `${prefix} Good. How does the auxiliary memory scale with input growth? Be sure to distinguish between memory used for input vs auxiliary data structures.`;
      }
      return `${prefix} State your big-O time complexity and space complexity explicitly, and give a brief 1-sentence justification for each.`;

    case "implementation":
      return `${prefix} Code looks to be taking shape. When you're confident, go ahead and submit the code draft, or ask if you want to discuss a specific syntax/helper point.`;

    case "testing_edge_cases":
      if (lower.includes("tested") || lower.includes("edge") || lower.includes("works") || lower.includes("dry run")) {
        return `${prefix} Nice job tracing the sample. Are there any tricky edge cases, such as extreme values, all zeros, or duplicates, that might cause off-by-one or overflow errors?`;
      }
      return `${prefix} Let's dry-run your solution with a small non-trivial test case. Trace through the variable states step by step.`;

    case "follow_up_optimization":
      return `${prefix} Excellent. How would your solution change if the input was a continuous data stream that didn't fit entirely in RAM?`;

    default:
      return `${prefix} Let's continue working through this step.`;
  }
}

// ─── Session Initialization ───────────────────────────────────────────────────

export async function initializeInterviewSession(
  config: InterviewConfig
): Promise<InterviewSession> {
  const questions = await selectInterviewQuestions(config);
  const currentQ = questions[0];

  const totalDurationSeconds = config.durationMinutes * 60;
  const now = new Date().toISOString();

  const starterCode: Record<string, string> = currentQ
    ? { ...currentQ.starterCode }
    : { javascript: "// Write solution here\n" };

  const initialMessage: InterviewChatMessage = {
    id: uid("msg_init"),
    sender: "interviewer",
    content: `Welcome to your ${config.style} technical mock interview on **${config.type}**. I'll be your interviewer today.\n\nHere is your first problem: **${currentQ?.title || "Algorithmic Challenge"}** (${currentQ?.difficulty || "Medium"}).\n\nTake a moment to read the problem statement and ask any clarifying questions about constraints or edge assumptions before jumping into code.`,
    phase: "problem_understanding",
    timestamp: now,
  };

  const session: InterviewSession = {
    id: `interview_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    config,
    status: "in_progress",
    startedAt: now,
    totalDurationSeconds,
    remainingSeconds: totalDurationSeconds,
    currentQuestionIndex: 0,
    questions,
    currentPhase: "problem_understanding",
    phaseStartTime: Date.now(),
    phaseDurationsSeconds: {
      problem_understanding: 0,
      approach_discussion: 0,
      algorithm_design: 0,
      complexity_analysis: 0,
      implementation: 0,
      testing_edge_cases: 0,
      follow_up_optimization: 0,
    },
    messages: [initialMessage],
    candidateCode: starterCode,
    selectedLanguage: "javascript",
    candidateComplexity: { time: "", space: "", explanation: "" },
    candidateEdgeCases: [],
    hintsUnlocked: {},
    solutionSubmitted: false,
  };

  await interviewStorage.saveActiveSession(session);
  return session;
}

// ─── Handle Candidate Message ─────────────────────────────────────────────────

export async function processCandidateMessage(
  session: InterviewSession,
  content: string
): Promise<InterviewSession> {
  const candidateMsg: InterviewChatMessage = {
    id: uid("msg_cand"),
    sender: "candidate",
    content: content.trim(),
    phase: session.currentPhase,
    timestamp: new Date().toISOString(),
  };

  const interviewerReplyText = generateInterviewerResponse(session, content);

  const interviewerMsg: InterviewChatMessage = {
    id: uid("msg_int"),
    sender: "interviewer",
    content: interviewerReplyText,
    phase: session.currentPhase,
    timestamp: new Date().toISOString(),
  };

  const updatedSession: InterviewSession = {
    ...session,
    messages: [...session.messages, candidateMsg, interviewerMsg],
  };

  await interviewStorage.saveActiveSession(updatedSession);
  return updatedSession;
}

// ─── Unlock Hint ──────────────────────────────────────────────────────────────

export async function unlockInterviewHint(
  session: InterviewSession,
  level: HintLevel
): Promise<InterviewSession> {
  const currentQ = session.questions[session.currentQuestionIndex];
  if (!currentQ) return session;

  const qId = String(currentQ.id);
  const alreadyUnlocked = session.hintsUnlocked[qId] || [];

  if (alreadyUnlocked.includes(level)) {
    return session;
  }

  const updatedHints = {
    ...session.hintsUnlocked,
    [qId]: [...alreadyUnlocked, level].sort((a, b) => a - b),
  };

  const hintContent = currentQ.hints[level] || "Consider the core data structure trade-offs.";
  const penalty = HINT_PENALTIES[level];

  const hintMsg: InterviewChatMessage = {
    id: uid("hint"),
    sender: "interviewer",
    content: `💡 **Hint (Level ${level} - ${level === 1 ? "Conceptual" : level === 2 ? "Approach" : level === 3 ? "Algorithm" : "Near-Solution"}):**\n${hintContent}\n\n*(Note: Unlocking this hint applies a ${penalty}-point deduction on the Hint Dependency dimension).*`,
    phase: session.currentPhase,
    timestamp: new Date().toISOString(),
    isHint: true,
    hintLevel: level,
  };

  const updatedSession: InterviewSession = {
    ...session,
    hintsUnlocked: updatedHints,
    messages: [...session.messages, hintMsg],
  };

  await interviewStorage.saveActiveSession(updatedSession);
  return updatedSession;
}

// ─── Advance Phase ────────────────────────────────────────────────────────────

export async function advanceInterviewPhase(
  session: InterviewSession,
  targetPhase?: InterviewPhase
): Promise<InterviewSession> {
  const next = targetPhase || getNextPhase(session.currentPhase);
  if (!next) return session;

  // Record elapsed duration in current phase
  const now = Date.now();
  const elapsedInPhase = Math.max(1, Math.round((now - session.phaseStartTime) / 1000));
  const updatedDurations = {
    ...session.phaseDurationsSeconds,
    [session.currentPhase]: (session.phaseDurationsSeconds[session.currentPhase] || 0) + elapsedInPhase,
  };

  const nextPhaseInfo = INTERVIEW_PHASES.find((p) => p.id === next);

  const transitionMsg: InterviewChatMessage = {
    id: uid("trans"),
    sender: "system",
    content: `🔄 **Transitioning to Phase ${nextPhaseInfo?.number || ""}: ${nextPhaseInfo?.name || next}**\n${nextPhaseInfo?.guidance || ""}`,
    phase: next,
    timestamp: new Date().toISOString(),
  };

  const updatedSession: InterviewSession = {
    ...session,
    currentPhase: next,
    phaseStartTime: now,
    phaseDurationsSeconds: updatedDurations,
    messages: [...session.messages, transitionMsg],
  };

  await interviewStorage.saveActiveSession(updatedSession);
  return updatedSession;
}

// ─── Finalize Interview & Generate Report ─────────────────────────────────────

export async function finalizeInterviewSession(
  session: InterviewSession
): Promise<AIInterviewReport> {
  const currentQ = session.questions[session.currentQuestionIndex];
  const {
    dimensions,
    overallScore,
    readinessTier,
    readinessBandLabel,
    mainStrengths,
    mainWeaknesses,
  } = evaluateInterviewSession(session);

  const qId = String(currentQ?.id || "q1");
  const unlocked = session.hintsUnlocked[qId] || [];
  let totalPenalty = 0;
  const hintsUsed = unlocked.map((lvl) => {
    const pen = HINT_PENALTIES[lvl];
    totalPenalty += pen;
    return {
      level: lvl,
      label: lvl === 1 ? "Conceptual" : lvl === 2 ? "Approach" : lvl === 3 ? "Algorithm" : "Near-Solution",
      penalty: pen,
    };
  });

  const timeUsedSec = session.totalDurationSeconds - session.remainingSeconds;
  const actualMinutesSpent = Math.round(timeUsedSec / 60);

  const refTime = currentQ?.referenceComplexity.time || "O(N)";
  const refSpace = currentQ?.referenceComplexity.space || "O(1)";
  const statedTime = session.candidateComplexity.time || "Unstated";
  const statedSpace = session.candidateComplexity.space || "Unstated";
  const isAccurate = statedTime.toLowerCase().includes(refTime.toLowerCase().slice(0, 3));

  const missedEdgeCases = currentQ?.keyEdgeCases.filter(
    (ec) => !session.candidateEdgeCases.some((cEc) => cEc.toLowerCase().includes(ec.toLowerCase().slice(0, 8)))
  ) || ["Empty/null boundary conditions", "Maximum input limit overflow"];

  const reportId = `report_${session.id}`;
  const today = new Date().toISOString().split("T")[0];

  const report: AIInterviewReport = {
    id: reportId,
    interviewId: session.id,
    date: today,
    overallScore,
    readinessTier,
    readinessBandLabel,
    dimensions,
    mainStrengths,
    mainWeaknesses,
    missedEdgeCases: missedEdgeCases.slice(0, 3),
    complexityAssessment: {
      statedTime,
      statedSpace,
      actualTime: refTime,
      actualSpace: refSpace,
      isAccurate,
      feedback: isAccurate
        ? "Accurately derived runtime complexity for the solution."
        : `Stated complexity (${statedTime}) differed from optimal ${refTime}. Review iteration loops.`,
    },
    hintUsageSummary: {
      totalHints: unlocked.length,
      totalPenaltyPoints: totalPenalty,
      hintsUsed,
    },
    timeManagementSummary: {
      allocatedMinutes: session.config.durationMinutes,
      actualMinutesSpent,
      phaseTimesSeconds: session.phaseDurationsSeconds,
      paceEvaluation: actualMinutesSpent <= session.config.durationMinutes * 0.85 ? "Paced Well" : "Rushed",
    },
    recommendedTopics: currentQ ? currentQ.topics : ["Arrays", "Hashing"],
    recommendedPatterns: currentQ?.topics.includes("Dynamic Programming")
      ? ["Memoization", "Tabulation Grid"]
      : ["Two Pointers", "Frequency Map"],
    suggestedNextDifficulty:
      overallScore >= 80
        ? session.config.difficulty === "Easy" ? "Medium" : "Hard"
        : overallScore < 60
        ? "Easy"
        : "Medium",
    actionableNextSteps: [
      `Review ${currentQ?.title || "the problem"} solution in your Knowledge Base.`,
      "Practice 15-minute timed complexity derivations before jumping into code.",
      "Work through 2 additional problems on identified weak areas.",
    ],
  };

  // Save report and history record
  const historyRecord: InterviewHistoryRecord = {
    id: session.id,
    date: today,
    interviewType: session.config.type,
    difficulty: session.config.difficulty,
    style: session.config.style,
    durationMinutes: session.config.durationMinutes,
    actualDurationMinutes: actualMinutesSpent,
    questionsAttempted: 1,
    questionsCompleted: session.solutionSubmitted ? 1 : 0,
    overallScore,
    readinessTier,
    mainStrengths,
    mainWeaknesses,
    hintCount: unlocked.length,
    status: "completed",
    reportSummary: {
      communicationScore: dimensions.communicationQuality.score,
      complexityScore: dimensions.complexityAnalysis.score,
      algorithmScore: dimensions.algorithmCorrectness.score,
      edgeCaseScore: dimensions.edgeCasesAwareness.score,
    },
  };

  await Promise.all([
    interviewStorage.saveReport(report),
    interviewStorage.saveHistoryRecord(historyRecord),
    interviewStorage.clearActiveSession(),
  ]);

  // ── Learning Loop Integration: Feed weaknesses into Knowledge Notes ───────
  if (currentQ && overallScore < 75) {
    try {
      await knowledgeStorage.addNote({
        problemId: currentQ.id,
        platformProblemId: currentQ.platformProblemId || String(currentQ.id),
        platform: currentQ.platform,
        problemTitle: currentQ.title,
        topic: currentQ.topics[0] || "General DSA",
        difficulty: currentQ.difficulty,
        problemUrl: currentQ.url,
        personalExplanation: `Interview performance review: Scored ${overallScore}/100. Key areas: ${mainWeaknesses.join("; ")}`,
        approachUsed: session.selectedLanguage,
        keyInsight: `Identified missed edge cases: ${missedEdgeCases.join(", ")}. Reference complexity: Time ${refTime}, Space ${refSpace}.`,
        mistakeCategory: dimensions.complexityAnalysis.score < 65 ? "time_complexity_issue" : "edge_case_missed",
        edgeCasesDiscovered: missedEdgeCases.join("; "),
        timeComplexity: refTime,
        spaceComplexity: refSpace,
        tags: ["Interview", "Revisit", "Concept Gap"],
        patternName: currentQ.topics[0],
        revisionStatus: "revisit",
      });
    } catch (e) {
      console.error("[InterviewEngine] Failed to sync weak note:", e);
    }
  }

  return report;
}

// ─── Post-Interview AI Coach Directive ────────────────────────────────────────

export interface PostInterviewCoachAdvice {
  whatWentWell: string;
  whatHeldMeBack: string;
  whatToPracticeNext: string;
  behaviorToChange: string;
  readyForNextDifficulty: boolean;
  readinessRecommendation: string;
}

export function generatePostInterviewCoachAdvice(
  report: AIInterviewReport
): PostInterviewCoachAdvice {
  const ready = report.overallScore >= 78;

  return {
    whatWentWell: report.mainStrengths[0] || "Structured technical approach throughout the interview.",
    whatHeldMeBack: report.mainWeaknesses[0] || "Slight hesitation when deriving space complexity limits.",
    whatToPracticeNext: `Solve 2 medium problems focusing on ${report.recommendedTopics[0] || "your weak topic"} and write down edge case discoveries.`,
    behaviorToChange: report.dimensions.communicationQuality.score < 75
      ? "Practice speaking your thoughts continuously while coding instead of working in silence."
      : "State big-O constraints before writing any code lines.",
    readyForNextDifficulty: ready,
    readinessRecommendation: ready
      ? `Yes! You demonstrated ${report.readinessTier} readiness. You are ready to step up to ${report.suggestedNextDifficulty} difficulty.`
      : `Stay at ${report.suggestedNextDifficulty} for 1–2 more sessions until complexity derivation and edge cases reach 80%+.`,
  };
}
