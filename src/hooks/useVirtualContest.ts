"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  VCConfig,
  VCSession,
  VCContestReport,
  VCHistoryRecord,
  VCReadinessProfile,
  VCAnalyticsSummary,
} from "@/services/contest/virtualContestTypes";
import {
  initializeContestSession,
  resumeInterruptedSession,
  tickTimer,
  pauseSession,
  resumeSession,
  setActiveProblem,
  updateCode,
  submitSolution,
  markProblemSolved,
  skipProblem,
  endSession,
  compileContestReport,
  syncToLearningLoop,
} from "@/services/contest/virtualContestEngine";
import {
  getContestHistory,
  loadReadinessProfile,
} from "@/services/contest/virtualContestStorage";
import {
  computeVCAnalytics,
  VCAnalyticsTimeframe,
  VCAnalyticsPlatform,
} from "@/services/contest/virtualContestAnalytics";

export type VCMode =
  | "dashboard"
  | "config"
  | "preparing"
  | "active"
  | "results"
  | "history"
  | "analytics";

const DEFAULT_CONFIG: VCConfig = {
  platform: "mixed",
  contestType: "Standard",
  difficulty: "Mixed",
  durationMinutes: 60,
  problemCount: 3,
  topic: "All Topics",
  sequentialMode: false,
};

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function useVirtualContest() {
  const [mode, setMode] = useState<VCMode>("dashboard");
  const [config, setConfig] = useState<VCConfig>(DEFAULT_CONFIG);
  const [session, setSession] = useState<VCSession | null>(null);
  const [report, setReport] = useState<VCContestReport | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const [history, setHistory] = useState<VCHistoryRecord[]>([]);
  const [readiness, setReadiness] = useState<VCReadinessProfile | null>(null);
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<VCAnalyticsTimeframe>("30d");
  const [analyticsPlatform, setAnalyticsPlatform] = useState<VCAnalyticsPlatform>("all");
  const [analytics, setAnalytics] = useState<VCAnalyticsSummary | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Refresh History & Readiness Data ───────────────────────────────────────
  const refreshUserData = useCallback(() => {
    try {
      const hist = getContestHistory();
      setHistory(hist);
      const read = loadReadinessProfile();
      setReadiness(read);
      const ana = computeVCAnalytics(hist, analyticsTimeframe, analyticsPlatform);
      setAnalytics(ana);
    } catch (err) {
      console.error("[useVirtualContest] Failed to load user data:", err);
    }
  }, [analyticsTimeframe, analyticsPlatform]);

  // ─── Initial Load & Session Recovery ─────────────────────────────────────────
  useEffect(() => {
    refreshUserData();
    const interrupted = resumeInterruptedSession();
    if (interrupted && interrupted.status === "in_progress") {
      setSession(interrupted);
      setMode("active");
    } else if (interrupted && interrupted.status === "paused") {
      setSession(interrupted);
      setMode("active");
      setShowPauseModal(true);
    }
  }, [refreshUserData]);

  // ─── Timer Countdown Interval ───────────────────────────────────────────────
  useEffect(() => {
    if (mode === "active" && session && !session.isPaused && session.status === "in_progress") {
      timerRef.current = setInterval(() => {
        setSession((prev) => {
          if (!prev) return null;
          const next = tickTimer(prev);
          if (next.status === "expired" || next.remainingSeconds <= 0) {
            clearInterval(timerRef.current!);
            handleFinishContest(next);
            return next;
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [mode, session?.isPaused, session?.status]);

  // ─── Start Contest ──────────────────────────────────────────────────────────
  const startContest = useCallback(
    async (customConfig?: VCConfig) => {
      setIsLoading(true);
      setError(null);
      try {
        const activeCfg = customConfig || config;
        const newSession = await initializeContestSession(activeCfg);
        setSession(newSession);
        setShowConfigModal(false);
        setMode("active");
      } catch (err) {
        console.error("[useVirtualContest] Failed to start contest:", err);
        setError("Failed to start virtual contest. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [config]
  );

  // ─── Pause & Resume ─────────────────────────────────────────────────────────
  const handlePause = useCallback(() => {
    if (!session) return;
    const updated = pauseSession(session);
    setSession(updated);
    setShowPauseModal(true);
  }, [session]);

  const handleResume = useCallback(() => {
    if (!session) return;
    const updated = resumeSession(session);
    setSession(updated);
    setShowPauseModal(false);
  }, [session]);

  // ─── Problem Switching ──────────────────────────────────────────────────────
  const handleSwitchProblem = useCallback(
    (index: number) => {
      if (!session) return;
      const updated = setActiveProblem(session, index);
      setSession(updated);
    },
    [session]
  );

  // ─── Code Editing ───────────────────────────────────────────────────────────
  const handleUpdateCode = useCallback(
    (code: string, language: string) => {
      if (!session) return;
      const updated = updateCode(session, session.activeProblemIndex, code, language);
      setSession(updated);
    },
    [session]
  );

  // ─── Submit Attempt ─────────────────────────────────────────────────────────
  const handleSubmitProblem = useCallback(
    (
      code: string,
      language: string,
      selfVerdict: "accepted" | "wrong_answer" | "not_submitted"
    ) => {
      if (!session) return;
      const updated = submitSolution(
        session,
        session.activeProblemIndex,
        code,
        language,
        selfVerdict
      );
      setSession(updated);
    },
    [session]
  );

  const handleMarkSolved = useCallback(() => {
    if (!session) return;
    const updated = markProblemSolved(session, session.activeProblemIndex);
    setSession(updated);
  }, [session]);

  const handleSkipProblem = useCallback(() => {
    if (!session) return;
    const updated = skipProblem(session, session.activeProblemIndex);
    setSession(updated);
  }, [session]);

  // ─── Finish Contest ─────────────────────────────────────────────────────────
  const handleFinishContest = useCallback(
    (activeSession?: VCSession) => {
      const sess = activeSession || session;
      if (!sess) return;

      const ended = endSession(sess);
      const finalReport = compileContestReport(ended);
      syncToLearningLoop(finalReport);

      setReport(finalReport);
      setSession(null);
      setShowPauseModal(false);
      setShowSummaryModal(true);
      setMode("results");
      refreshUserData();
    },
    [session, refreshUserData]
  );

  // ─── Update Config Helper ───────────────────────────────────────────────────
  const updateConfig = useCallback((partial: Partial<VCConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  }, []);

  return {
    mode,
    setMode,
    config,
    updateConfig,
    session,
    startContest,
    pauseContest: handlePause,
    resumeContest: handleResume,
    endContest: () => handleFinishContest(),
    switchProblem: handleSwitchProblem,
    updateProblemCode: handleUpdateCode,
    submitProblem: handleSubmitProblem,
    markSolved: handleMarkSolved,
    skipProblem: handleSkipProblem,

    remainingSeconds: session ? session.remainingSeconds : 0,
    formattedTime: formatTime(session ? session.remainingSeconds : 0),
    isPaused: session ? session.isPaused : false,
    isExpired: session ? session.status === "expired" : false,

    report,
    setReport,
    showSummaryModal,
    setShowSummaryModal,
    closeSummaryModal: () => setShowSummaryModal(false),

    showPauseModal,
    setShowPauseModal,

    showConfigModal,
    setShowConfigModal,

    history,
    readiness,
    analytics,
    analyticsTimeframe,
    setAnalyticsTimeframe,
    analyticsPlatform,
    setAnalyticsPlatform,

    isLoading,
    error,
    refreshUserData,
  };
}
