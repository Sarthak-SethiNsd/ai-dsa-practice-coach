import {
  PracticeSession,
  PracticeSessionConfig,
  PracticeSessionProblem,
  PracticeSessionOutcome,
  PracticeOutcomeType,
  PracticeAdaptationRecord,
} from "./practiceTypes";
import { buildSessionPlan } from "./practiceSessionPlanner";
import {
  saveActiveSession,
  loadActiveSession,
  clearActiveSession,
  computeRemainingSeconds,
  isSessionExpired,
  expireSession,
  saveSessionToHistory,
} from "./practiceSessionStorage";
import {
  evaluateAdaptation,
  buildAdaptationRecord,
  AdaptationContext,
  decreaseDifficulty,
} from "./practiceSessionAdaptation";
import {
  dispatchRecommendationFeedback,
  dispatchLearningGraphFeedback,
  dispatchSRSFeedback,
  buildSessionProblemFromRec,
  refreshCandidatesForAdaptation,
} from "./practiceSessionOutcome";
import { computeSessionScore, computeSessionAnalytics, buildHistoryItem } from "./practiceSessionScoring";

// ─── Main Practice Session Engine ─────────────────────────────────────────────

function generateSessionId(): string {
  return `ps_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Starts a new practice session.
 */
export async function startPracticeSession(
  config: PracticeSessionConfig
): Promise<PracticeSession> {
  const { problems, goalTitle, planSummary } = await buildSessionPlan(config);

  const now = new Date().toISOString();
  const session: PracticeSession = {
    sessionId: generateSessionId(),
    startedAt: now,
    durationMinutes: config.durationMinutes,
    mode: config.mode,
    goalTitle,
    config,
    plannedProblems: problems,
    completedProblems: [],
    currentProblemIndex: 0,
    status: "ACTIVE",
    timerStartedAt: now,
    totalPausedMs: 0,
    outcomes: [],
    adaptations: [],
  };

  saveActiveSession(session);
  console.info(`[practiceSessionEngine] Session started: ${session.sessionId} — ${planSummary}`);
  return session;
}

/**
 * Restores a session from storage, handling expiration.
 */
export function restoreSession(): PracticeSession | null {
  const session = loadActiveSession();
  if (!session) return null;

  if (isSessionExpired(session)) {
    return expireSession(session);
  }

  return session;
}

/**
 * Pauses the active session timer.
 */
export function pauseSession(session: PracticeSession): PracticeSession {
  if (session.status !== "ACTIVE") return session;
  const now = new Date().toISOString();
  const paused: PracticeSession = {
    ...session,
    status: "PAUSED",
    lastPausedAt: now,
  };
  saveActiveSession(paused);
  return paused;
}

/**
 * Resumes a paused session timer.
 */
export function resumeSession(session: PracticeSession): PracticeSession {
  if (session.status !== "PAUSED") return session;

  const now = Date.now();
  const pausedAt = session.lastPausedAt ? new Date(session.lastPausedAt).getTime() : now;
  const additionalPausedMs = now - pausedAt;

  const resumed: PracticeSession = {
    ...session,
    status: "ACTIVE",
    totalPausedMs: session.totalPausedMs + additionalPausedMs,
    lastPausedAt: undefined,
  };
  saveActiveSession(resumed);
  return resumed;
}

/**
 * Retrieves the current problem or null if session is done.
 */
export function getCurrentProblem(session: PracticeSession): PracticeSessionProblem | null {
  return session.plannedProblems[session.currentProblemIndex] ?? null;
}

/**
 * Submits an outcome for the current problem, triggers adaptation, and advances.
 */
export async function submitOutcome(
  session: PracticeSession,
  outcomeType: PracticeOutcomeType,
  actualSolveTimeSeconds: number,
  hintCount: number,
  perceivedDifficulty: PracticeSessionOutcome["perceivedDifficulty"] = null,
  notes = ""
): Promise<{ session: PracticeSession; adaptation: PracticeAdaptationRecord | null }> {
  const currentProblem = getCurrentProblem(session);
  if (!currentProblem) {
    return { session, adaptation: null };
  }

  const remainingSeconds = computeRemainingSeconds(session);

  // Build outcome record
  const outcome: PracticeSessionOutcome = {
    problemId: currentProblem.problemId,
    sessionProblemIndex: session.currentProblemIndex,
    outcomeType,
    actualSolveTimeSeconds,
    estimatedSolveTimeSeconds: currentProblem.timeEstimate.estimatedMinutes * 60,
    hintCount,
    perceivedDifficulty,
    sessionPosition: session.outcomes.length + 1,
    timestamp: new Date().toISOString(),
    notes,
    adaptationTriggered: false,
  };

  // Dispatch feedback to subsystems (async, don't block)
  dispatchRecommendationFeedback(currentProblem, outcome).catch((e) =>
    console.error("[practiceSessionEngine] Rec feedback error:", e)
  );
  dispatchLearningGraphFeedback(currentProblem, outcome);
  dispatchSRSFeedback(currentProblem, outcome).catch((e) =>
    console.error("[practiceSessionEngine] SRS feedback error:", e)
  );

  // Compute adaptation context
  const consecutiveFailures = getConsecutiveFailures(session.outcomes, outcomeType);
  const consecutiveIndependentSolves = getConsecutiveIndependentSolves(session.outcomes, outcomeType);

  const ctx: AdaptationContext = {
    session,
    lastOutcome: outcome,
    remainingSeconds,
    consecutiveFailures,
    consecutiveIndependentSolves,
    historyMedianSolveSeconds: currentProblem.timeEstimate.estimatedMinutes * 60,
  };

  const decision = evaluateAdaptation(ctx, currentProblem);

  // Apply adaptation to remaining queue
  let updatedQueue = [...session.plannedProblems];
  let adaptationRecord: PracticeAdaptationRecord | null = null;
  const addedIds: number[] = [];
  const removedIds: number[] = [];

  if (decision.shouldAdapt) {
    outcome.adaptationTriggered = true;

    // Trim queue if budget is tight
    if (decision.trimQueue) {
      const remainingMinutes = Math.floor(remainingSeconds / 60);
      const nextIndex = session.currentProblemIndex + 1;
      const trimmedQueue = updatedQueue.slice(0, nextIndex);
      for (
        let i = nextIndex;
        i < updatedQueue.length;
        i++
      ) {
        const est = updatedQueue[i].timeEstimate.estimatedMinutes;
        if (trimmedQueue.reduce((s, p) => s + p.timeEstimate.estimatedMinutes, 0) + est <= remainingMinutes) {
          trimmedQueue.push({ ...updatedQueue[i], difficulty: decision.targetDifficulty ?? updatedQueue[i].difficulty });
        } else {
          removedIds.push(updatedQueue[i].problemId);
        }
      }
      updatedQueue = trimmedQueue;
    }

    // Insert prerequisite bridge after current
    if (decision.insertPrerequisite) {
      try {
        const newCandidates = await refreshCandidatesForAdaptation(session);
        const bridgeDifficulty = decision.targetDifficulty ?? decreaseDifficulty(currentProblem.difficulty);
        const bridgeCandidate = newCandidates.find(
          (r) =>
            r.difficulty === bridgeDifficulty &&
            r.problemId !== currentProblem.problemId &&
            !session.completedProblems.includes(r.problemId) &&
            !session.plannedProblems.find((p) => p.problemId === r.problemId && p.problemId !== currentProblem.problemId)
        );

        if (bridgeCandidate) {
          const bridgeProblem = buildSessionProblemFromRec(bridgeCandidate, session, {
            isPrerequisiteBridge: true,
          });
          const nextIndex = session.currentProblemIndex + 1;
          updatedQueue = [
            ...updatedQueue.slice(0, nextIndex),
            bridgeProblem,
            ...updatedQueue.slice(nextIndex),
          ];
          addedIds.push(bridgeProblem.problemId);
        }
      } catch (e) {
        console.error("[practiceSessionEngine] Adaptation candidate refresh failed:", e);
      }
    }

    adaptationRecord = buildAdaptationRecord(
      decision,
      outcomeType,
      currentProblem.problemId,
      addedIds,
      removedIds
    );
  }

  // Advance to next problem
  const nextIndex = session.currentProblemIndex + 1;
  const isSessionComplete = nextIndex >= updatedQueue.length || remainingSeconds <= 0;

  const updatedSession: PracticeSession = {
    ...session,
    plannedProblems: updatedQueue,
    currentProblemIndex: isSessionComplete ? session.currentProblemIndex : nextIndex,
    completedProblems: [...session.completedProblems, currentProblem.problemId],
    outcomes: [...session.outcomes, outcome],
    adaptations: adaptationRecord
      ? [...session.adaptations, adaptationRecord]
      : session.adaptations,
    status: isSessionComplete ? "COMPLETED" : "ACTIVE",
    endedAt: isSessionComplete ? new Date().toISOString() : undefined,
  };

  // If completed, compute score and save to history
  if (isSessionComplete) {
    const finalSession = finalizeSession(updatedSession);
    return { session: finalSession, adaptation: adaptationRecord };
  }

  saveActiveSession(updatedSession);
  return { session: updatedSession, adaptation: adaptationRecord };
}

/**
 * Ends the session early (user triggered).
 */
export function finishSession(session: PracticeSession): PracticeSession {
  return finalizeSession({
    ...session,
    status: "COMPLETED",
    endedAt: new Date().toISOString(),
  });
}

/**
 * Abandons the session and saves partial data.
 */
export function abandonSession(session: PracticeSession): PracticeSession {
  const abandoned: PracticeSession = {
    ...session,
    status: "ABANDONED",
    endedAt: new Date().toISOString(),
  };
  const score = computeSessionScore(abandoned);
  const analytics = computeSessionAnalytics(abandoned);
  const final = { ...abandoned, score, analytics };
  const historyItem = buildHistoryItem(final, score, analytics);
  saveSessionToHistory(historyItem);
  clearActiveSession();
  return final;
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

function finalizeSession(session: PracticeSession): PracticeSession {
  const score = computeSessionScore(session);
  const analytics = computeSessionAnalytics(session);
  const final: PracticeSession = { ...session, score, analytics };
  const historyItem = buildHistoryItem(final, score, analytics);
  saveSessionToHistory(historyItem);
  clearActiveSession();
  return final;
}

function getConsecutiveFailures(
  outcomes: PracticeSessionOutcome[],
  currentOutcome: PracticeOutcomeType
): number {
  if (currentOutcome !== "FAILED") return 0;
  let count = 1;
  for (let i = outcomes.length - 1; i >= 0; i--) {
    if (outcomes[i].outcomeType === "FAILED") count++;
    else break;
  }
  return count;
}

function getConsecutiveIndependentSolves(
  outcomes: PracticeSessionOutcome[],
  currentOutcome: PracticeOutcomeType
): number {
  if (currentOutcome !== "SOLVED_INDEPENDENTLY") return 0;
  let count = 1;
  for (let i = outcomes.length - 1; i >= 0; i--) {
    if (outcomes[i].outcomeType === "SOLVED_INDEPENDENTLY") count++;
    else break;
  }
  return count;
}
