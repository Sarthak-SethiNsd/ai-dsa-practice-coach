"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  InterviewConfig,
  InterviewSession,
  AIInterviewReport,
  InterviewHistoryRecord,
  InterviewReadinessProfile,
  InterviewAnalyticsSummary,
  InterviewPhase,
  HintLevel,
} from "@/services/interview/interviewTypes";
import {
  initializeInterviewSession,
  processCandidateMessage,
  unlockInterviewHint,
  advanceInterviewPhase,
  finalizeInterviewSession,
  generatePostInterviewCoachAdvice,
  PostInterviewCoachAdvice,
} from "@/services/interview/interviewEngine";
import { interviewStorage } from "@/services/interview/interviewStorage";
import {
  computeInterviewAnalytics,
  AnalyticsTimeframe,
} from "@/services/interview/interviewAnalytics";

export interface UseMockInterviewReturn {
  // Active Session State
  session: InterviewSession | null;
  history: InterviewHistoryRecord[];
  readinessProfile: InterviewReadinessProfile | null;
  activeReport: AIInterviewReport | null;
  coachAdvice: PostInterviewCoachAdvice | null;
  analytics: InterviewAnalyticsSummary | null;
  analyticsTimeframe: AnalyticsTimeframe;
  isLoading: boolean;
  isProcessingMessage: boolean;

  // Modals
  isConfigModalOpen: boolean;
  isPreparationModalOpen: boolean;
  isSummaryModalOpen: boolean;
  pendingConfig: InterviewConfig | null;

  // Session Actions
  openConfigModal: () => void;
  closeConfigModal: () => void;
  openPreparationModal: (config: InterviewConfig) => void;
  closePreparationModal: () => void;
  startInterview: (config: InterviewConfig) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  requestHint: (level: HintLevel) => Promise<void>;
  advanceToPhase: (targetPhase?: InterviewPhase) => Promise<void>;
  updateCode: (code: string, language?: string) => void;
  updateComplexity: (time: string, space: string, explanation?: string) => void;
  addEdgeCase: (edgeCase: string) => void;
  removeEdgeCase: (index: number) => void;
  submitSolution: () => Promise<void>;
  endInterview: () => Promise<void>;
  viewReport: (interviewId: string) => Promise<void>;
  closeSummaryModal: () => void;
  setAnalyticsTimeframe: (timeframe: AnalyticsTimeframe) => void;
}

export function useMockInterview(): UseMockInterviewReturn {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [history, setHistory] = useState<InterviewHistoryRecord[]>([]);
  const [readinessProfile, setReadinessProfile] = useState<InterviewReadinessProfile | null>(null);
  const [activeReport, setActiveReport] = useState<AIInterviewReport | null>(null);
  const [coachAdvice, setCoachAdvice] = useState<PostInterviewCoachAdvice | null>(null);
  const [analyticsTimeframe, setAnalyticsTimeframeState] = useState<AnalyticsTimeframe>("30d");
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingMessage, setIsProcessingMessage] = useState(false);

  // Modals
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isPreparationModalOpen, setIsPreparationModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [pendingConfig, setPendingConfig] = useState<InterviewConfig | null>(null);

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Initial Load ───────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [hist, profile, active] = await Promise.all([
        interviewStorage.getHistory(),
        interviewStorage.getReadinessProfile(),
        interviewStorage.getActiveSession(),
      ]);

      setHistory(hist);
      setReadinessProfile(profile);
      if (active && active.status === "in_progress") {
        setSession(active);
      }
    } catch (e) {
      console.error("[useMockInterview] Failed to load data:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Timer Loop ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!session || session.status !== "in_progress") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSession((prev) => {
        if (!prev || prev.status !== "in_progress") return prev;
        if (prev.remainingSeconds <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return { ...prev, remainingSeconds: 0 };
        }
        return {
          ...prev,
          remainingSeconds: prev.remainingSeconds - 1,
        };
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session?.status]);

  // ─── Computed Analytics ─────────────────────────────────────────────────────

  const analytics = computeInterviewAnalytics(history, analyticsTimeframe);

  // ─── Modals ─────────────────────────────────────────────────────────────────

  const openConfigModal = useCallback(() => setIsConfigModalOpen(true), []);
  const closeConfigModal = useCallback(() => setIsConfigModalOpen(false), []);

  const openPreparationModal = useCallback((config: InterviewConfig) => {
    setPendingConfig(config);
    setIsConfigModalOpen(false);
    setIsPreparationModalOpen(true);
  }, []);

  const closePreparationModal = useCallback(() => {
    setIsPreparationModalOpen(false);
    setPendingConfig(null);
  }, []);

  // ─── Start Interview ────────────────────────────────────────────────────────

  const startInterview = useCallback(async (config: InterviewConfig) => {
    setIsLoading(true);
    setIsPreparationModalOpen(false);
    try {
      const newSession = await initializeInterviewSession(config);
      setSession(newSession);
    } catch (e) {
      console.error("[useMockInterview] Failed to start interview:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Communication ──────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (content: string) => {
    if (!session || !content.trim()) return;
    setIsProcessingMessage(true);
    try {
      const updated = await processCandidateMessage(session, content);
      setSession(updated);
    } catch (e) {
      console.error("[useMockInterview] Message processing failed:", e);
    } finally {
      setIsProcessingMessage(false);
    }
  }, [session]);

  // ─── Hints ──────────────────────────────────────────────────────────────────

  const requestHint = useCallback(async (level: HintLevel) => {
    if (!session) return;
    try {
      const updated = await unlockInterviewHint(session, level);
      setSession(updated);
    } catch (e) {
      console.error("[useMockInterview] Hint request failed:", e);
    }
  }, [session]);

  // ─── Phase Transitions ──────────────────────────────────────────────────────

  const advanceToPhase = useCallback(async (targetPhase?: InterviewPhase) => {
    if (!session) return;
    try {
      const updated = await advanceInterviewPhase(session, targetPhase);
      setSession(updated);
    } catch (e) {
      console.error("[useMockInterview] Advance phase failed:", e);
    }
  }, [session]);

  // ─── Workspace Inputs ───────────────────────────────────────────────────────

  const updateCode = useCallback((code: string, language: string = "javascript") => {
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        candidateCode: { ...prev.candidateCode, [language]: code },
        selectedLanguage: language,
      };
    });
  }, []);

  const updateComplexity = useCallback((time: string, space: string, explanation: string = "") => {
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        candidateComplexity: { time, space, explanation },
      };
    });
  }, []);

  const addEdgeCase = useCallback((edgeCase: string) => {
    if (!edgeCase.trim()) return;
    setSession((prev) => {
      if (!prev) return prev;
      if (prev.candidateEdgeCases.includes(edgeCase.trim())) return prev;
      return {
        ...prev,
        candidateEdgeCases: [...prev.candidateEdgeCases, edgeCase.trim()],
      };
    });
  }, []);

  const removeEdgeCase = useCallback((index: number) => {
    setSession((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        candidateEdgeCases: prev.candidateEdgeCases.filter((_, i) => i !== index),
      };
    });
  }, []);

  const submitSolution = useCallback(async () => {
    if (!session) return;
    const updated: InterviewSession = {
      ...session,
      solutionSubmitted: true,
      currentPhase: "testing_edge_cases",
    };
    setSession(updated);
    await interviewStorage.saveActiveSession(updated);
  }, [session]);

  // ─── End Interview & Finalize ───────────────────────────────────────────────

  const endInterview = useCallback(async () => {
    if (!session) return;
    setIsLoading(true);
    try {
      const report = await finalizeInterviewSession(session);
      const advice = generatePostInterviewCoachAdvice(report);

      setActiveReport(report);
      setCoachAdvice(advice);
      setIsSummaryModalOpen(true);
      setSession(null);

      // Refresh history & profile
      const [hist, profile] = await Promise.all([
        interviewStorage.getHistory(),
        interviewStorage.getReadinessProfile(),
      ]);
      setHistory(hist);
      setReadinessProfile(profile);
    } catch (e) {
      console.error("[useMockInterview] Finalize interview failed:", e);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  const viewReport = useCallback(async (interviewId: string) => {
    try {
      const report = await interviewStorage.getReport(interviewId);
      if (report) {
        setActiveReport(report);
        setCoachAdvice(generatePostInterviewCoachAdvice(report));
        setIsSummaryModalOpen(true);
      }
    } catch (e) {
      console.error("[useMockInterview] View report failed:", e);
    }
  }, []);

  const closeSummaryModal = useCallback(() => {
    setIsSummaryModalOpen(false);
    setActiveReport(null);
    setCoachAdvice(null);
  }, []);

  const setAnalyticsTimeframe = useCallback((timeframe: AnalyticsTimeframe) => {
    setAnalyticsTimeframeState(timeframe);
  }, []);

  return {
    session,
    history,
    readinessProfile,
    activeReport,
    coachAdvice,
    analytics,
    analyticsTimeframe,
    isLoading,
    isProcessingMessage,
    isConfigModalOpen,
    isPreparationModalOpen,
    isSummaryModalOpen,
    pendingConfig,
    openConfigModal,
    closeConfigModal,
    openPreparationModal,
    closePreparationModal,
    startInterview,
    sendMessage,
    requestHint,
    advanceToPhase,
    updateCode,
    updateComplexity,
    addEdgeCase,
    removeEdgeCase,
    submitSolution,
    endInterview,
    viewReport,
    closeSummaryModal,
    setAnalyticsTimeframe,
  };
}
