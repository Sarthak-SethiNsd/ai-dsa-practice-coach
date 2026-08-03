"use client";

import * as React from "react";
import { LeetCodeService } from "@/services/leetcode/leetcodeService";
import { CodeforcesService } from "@/services/codeforces/codeforcesService";
import { RecommendationEngine } from "@/services/recommendationEngine";
import {
  Platform,
  RecommendationPlatformConfig,
  RecommendationConfig,
  DailyPracticeSession,
  SessionQuestionItem,
  AiReviewResult
} from "@/services/types";
import { aiReviewService } from "@/services/ai/aiReviewService";
import { reviewUsageService } from "@/services/ai/reviewUsageService";
import { AiReviewRequest, ReviewQuotaStatusResponse } from "@/services/ai/aiTypes";
import { recommendationStorage } from "@/services/recommendationStorage";
import { dailySessionStorage } from "@/services/dailyRecommendationStorage";
import { sessionArchiveStorage } from "@/services/sessionArchiveStorage";
import { checkRecommendationSettingsCooldown } from "@/services/cooldownService";
import { getTodayDateString } from "@/utils/dateUtils";

export type { RecommendationPlatformConfig, RecommendationConfig, DailyPracticeSession, SessionQuestionItem, AiReviewResult };

export interface Problem {
  id: number;
  platformProblemId?: string;
  title: string;
  url?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  estimated: string;
  solutions: Record<string, string>;
  complexity: {
    time: string;
    space: string;
  };
  takeaways: string[];
  platform: Platform;
  selectionReason?: string;
}

export interface HistoryItem {
  id: number;
  problemId: number;
  problemTitle: string;
  date: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Solved" | "Incomplete";
  startedAt: string;
  completedAt?: string;
  platform: Platform;
  topics: string[];
}

export interface ToastState {
  show: boolean;
  message: string;
}

export const DEFAULT_RECOMMENDATION_CONFIG: RecommendationConfig = {
  platformConfigs: [
    { platform: "leetcode", questionsPerDay: 5, difficulty: "Mixed" },
    { platform: "codeforces", questionsPerDay: 5, difficulty: "Mixed" }
  ],
  lastRecommendationSettingsUpdate: undefined
};

const defaultEngine = new RecommendationEngine([
  new LeetCodeService(),
  new CodeforcesService()
]);

interface AppContextType {
  selectedLanguage: string;
  selectedTopics: string[];
  problems: Problem[];
  dailySession: DailyPracticeSession | null;
  history: HistoryItem[];
  selectedReviewProblem: Problem | null;
  toast: ToastState;
  recommendationConfig: RecommendationConfig;
  loading: boolean;
  error: string | null;
  problemStatuses: Record<string, {
    status: "Not Started" | "In Progress" | "Completed" | "Skipped";
    startedAt?: string;
    completedAt?: string;
    skippedAt?: string;
  }>;
  notes: Record<string, string>;
  aiReviewMap: Record<number, AiReviewResult>;
  reviewQuotaStatus: ReviewQuotaStatusResponse | null;
  refreshReviewQuota: () => void;
  showToast: (message: string) => void;
  saveProfile: (language: string, topics: string[]) => void;
  selectReviewProblem: (problemId: number) => void;
  clearToast: () => void;
  resetProfile: () => void;
  importProfile: (language: string, topics: string[], history: HistoryItem[]) => void;
  updateRecommendationConfig: (platformConfigs: RecommendationPlatformConfig[]) => { success: boolean; message: string };
  startPractice: (problemId: number) => void;
  markCompleted: (problemId: number) => void;
  skipProblem: (problemId: number) => void;
  retryProblems: () => void;
  updateNote: (problemId: number, note: string) => void;
  deleteNote: (problemId: number) => void;
  generateAiReview: (request: AiReviewRequest & { problemId: number }) => Promise<AiReviewResult>;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>("JavaScript");
  const [selectedTopics, setSelectedTopics] = React.useState<string[]>([]);
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [selectedReviewProblem, setSelectedReviewProblem] = React.useState<Problem | null>(null);
  const [toast, setToast] = React.useState<ToastState>({ show: false, message: "" });
  const [recommendationConfig, setRecommendationConfig] = React.useState<RecommendationConfig>(DEFAULT_RECOMMENDATION_CONFIG);

  const [dailySession, setDailySession] = React.useState<DailyPracticeSession | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = React.useState(0);

  const [problemStatuses, setProblemStatuses] = React.useState<Record<string, {
    status: "Not Started" | "In Progress" | "Completed" | "Skipped";
    startedAt?: string;
    completedAt?: string;
    skippedAt?: string;
  }>>({});

  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const [aiReviewMap, setAiReviewMap] = React.useState<Record<number, AiReviewResult>>({});
  const [reviewQuotaStatus, setReviewQuotaStatus] = React.useState<ReviewQuotaStatusResponse | null>(() => {
    try {
      return reviewUsageService.getQuotaStatus();
    } catch {
      return null;
    }
  });

  const refreshReviewQuota = React.useCallback(() => {
    try {
      const status = reviewUsageService.getQuotaStatus();
      setReviewQuotaStatus(status);
    } catch (e) {
      console.error("Failed to load review quota status", e);
    }
  }, []);

  const mountedRef = React.useRef(false);
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const retryProblems = React.useCallback(() => {
    setReloadTrigger(prev => prev + 1);
  }, []);

  // Convert SessionQuestionItem to standard Problem format for components that require it
  const problems: Problem[] = React.useMemo(() => {
    if (!dailySession || !dailySession.questions) return [];
    return dailySession.questions.map(q => ({
      id: q.problemId,
      platformProblemId: q.platformProblemId,
      title: q.problemTitle,
      url: q.url,
      difficulty: q.difficulty,
      topics: q.topics,
      estimated: q.estimated,
      solutions: q.solutions,
      complexity: q.complexity,
      takeaways: q.takeaways,
      platform: q.platform,
      selectionReason: q.selectionReason
    }));
  }, [dailySession]);

  // Load or generate Daily Practice Session for today's date
  React.useEffect(() => {
    let isMounted = true;
    const todayStr = getTodayDateString();

    const syncSession = async () => {
      if (selectedTopics.length === 0) {
        if (isMounted) setDailySession(null);
        return;
      }

      if (isMounted) setLoading(true);

      try {
        const existingSession = await dailySessionStorage.loadTodaySession(todayStr);

        if (existingSession && existingSession.questions && existingSession.questions.length > 0) {
          if (isMounted) {
            setDailySession(existingSession);
            setLoading(false);
          }
          return;
        }

        const userProfile = {
          selectedLanguage,
          selectedTopics,
          totalSolved: history.filter(h => h.status === "Solved").length
        };
        const recentHistoryPayload = history.slice(0, 5).map(h => ({
          problemId: h.problemId,
          problemTitle: h.problemTitle,
          difficulty: h.difficulty,
          status: h.status,
          topics: h.topics
        }));

        const newSession = await defaultEngine.generateDailySession(
          selectedTopics,
          recommendationConfig,
          selectedLanguage,
          userProfile,
          recentHistoryPayload
        );
        await dailySessionStorage.saveSession(newSession);

        if (isMounted) {
          setDailySession(newSession);
          setLoading(false);
        }
      } catch (err) {
        console.error("Error loading daily session:", err);
        if (isMounted) {
          setError("Failed to generate today's recommendations.");
          setLoading(false);
        }
      }
    };

    syncSession();

    return () => {
      isMounted = false;
    };
  }, [selectedTopics, recommendationConfig, selectedLanguage, history, reloadTrigger]);

  // Synchronise stored state on mount
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem("dsa_language");
    const savedTopics = localStorage.getItem("dsa_topics");
    const savedHistory = localStorage.getItem("dsa_history");
    const savedProblemStatuses = localStorage.getItem("dsa_problem_status");
    const savedNotes = localStorage.getItem("dsa_notes");
    const savedAiReviews = localStorage.getItem("dsa_ai_reviews");

    let activeTopics: string[] = [
      "Arrays",
      "Hashing",
      "Two Pointers",
      "Binary Search",
      "Recursion"
    ];
    if (savedTopics) {
      try {
        activeTopics = JSON.parse(savedTopics);
      } catch (e) {
        console.error("Failed to parse saved topics", e);
      }
    }

    let activeHistory: HistoryItem[] = [];
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        activeHistory = parsed;
      } catch (e) {
        console.error("Failed to parse saved history", e);
      }
    }

    recommendationStorage.loadConfig().then(loadedConfig => {
      if (loadedConfig && loadedConfig.platformConfigs && loadedConfig.platformConfigs.length > 0) {
        if (mountedRef.current) setRecommendationConfig(loadedConfig);
      }
    });

    let activeStatuses: Record<string, {
      status: "Not Started" | "In Progress" | "Completed" | "Skipped";
      startedAt?: string;
      completedAt?: string;
      skippedAt?: string;
    }> = {};
    if (savedProblemStatuses) {
      try {
        activeStatuses = JSON.parse(savedProblemStatuses);
      } catch (e) {
        console.error("Failed to parse saved statuses", e);
      }
    }

    let activeNotes: Record<string, string> = {};
    if (savedNotes) {
      try {
        activeNotes = JSON.parse(savedNotes);
      } catch (e) {
        console.error("Failed to parse saved notes", e);
      }
    }

    let activeAiReviews: Record<number, AiReviewResult> = {};
    if (savedAiReviews) {
      try {
        activeAiReviews = JSON.parse(savedAiReviews);
      } catch (e) {
        console.error("Failed to parse saved AI reviews", e);
      }
    }

    const timer = setTimeout(() => {
      if (savedLanguage) setSelectedLanguage(savedLanguage);
      setSelectedTopics(activeTopics);
      if (activeHistory.length > 0) setHistory(activeHistory);
      setProblemStatuses(activeStatuses);
      setNotes(activeNotes);
      setAiReviewMap(activeAiReviews);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    localStorage.setItem("dsa_problem_status", JSON.stringify(problemStatuses));
  }, [problemStatuses]);

  React.useEffect(() => {
    localStorage.setItem("dsa_notes", JSON.stringify(notes));
  }, [notes]);

  React.useEffect(() => {
    localStorage.setItem("dsa_ai_reviews", JSON.stringify(aiReviewMap));
  }, [aiReviewMap]);

  React.useEffect(() => {
    localStorage.setItem("dsa_history", JSON.stringify(history));
  }, [history]);

  const saveProfile = (language: string, topics: string[]) => {
    setSelectedLanguage(language);
    setSelectedTopics(topics);
    localStorage.setItem("dsa_language", language);
    localStorage.setItem("dsa_topics", JSON.stringify(topics));

    dailySessionStorage.clearSession().then(() => {
      setReloadTrigger(prev => prev + 1);
    });

    setToast({
      show: true,
      message: `Profile updated successfully! Main language: ${language}.`
    });
  };

  const selectReviewProblem = (problemId: number) => {
    const match = problems.find(p => p.id === problemId);
    if (match) {
      setSelectedReviewProblem(match);
      localStorage.setItem("dsa_review_problem_id", problemId.toString());
    }
  };

  const resetProfile = () => {
    const defaultTopics = [
      "Arrays",
      "Hashing",
      "Two Pointers",
      "Binary Search",
      "Recursion"
    ];

    setSelectedLanguage("JavaScript");
    setSelectedTopics(defaultTopics);
    setHistory([]);
    setSelectedReviewProblem(null);
    setRecommendationConfig(DEFAULT_RECOMMENDATION_CONFIG);
    setProblemStatuses({});
    setNotes({});
    setAiReviewMap({});
    setDailySession(null);

    localStorage.removeItem("dsa_language");
    localStorage.removeItem("dsa_topics");
    localStorage.removeItem("dsa_history");
    localStorage.removeItem("dsa_review_problem_id");
    localStorage.removeItem("dsa_problem_status");
    localStorage.removeItem("dsa_notes");
    localStorage.removeItem("dsa_ai_reviews");
    recommendationStorage.clearConfig();
    dailySessionStorage.clearSession();
    sessionArchiveStorage.clear();

    setToast({
      show: true,
      message: "Permanent knowledge profile reset to defaults."
    });
  };

  const importProfile = (language: string, topics: string[], importedHistory: HistoryItem[]) => {
    setSelectedLanguage(language);
    setSelectedTopics(topics);

    setHistory(importedHistory);
    setSelectedReviewProblem(null);

    localStorage.setItem("dsa_language", language);
    localStorage.setItem("dsa_topics", JSON.stringify(topics));
    localStorage.setItem("dsa_history", JSON.stringify(importedHistory));

    dailySessionStorage.clearSession().then(() => {
      setReloadTrigger(prev => prev + 1);
    });

    setToast({
      show: true,
      message: "Profile imported successfully!"
    });
  };

  const updateRecommendationConfig = (newPlatformConfigs: RecommendationPlatformConfig[]) => {
    const cooldownCheck = checkRecommendationSettingsCooldown(recommendationConfig.lastRecommendationSettingsUpdate);

    if (!cooldownCheck.canUpdate) {
      const message = `Recommendation settings can only be changed once every 24 hours. Next update available in ${cooldownCheck.formattedRemainingTime} (at ${cooldownCheck.nextAvailableTimeFormatted}).`;
      setToast({ show: true, message });
      return { success: false, message };
    }

    const nowIso = new Date().toISOString();
    const updatedConfig: RecommendationConfig = {
      platformConfigs: newPlatformConfigs,
      lastRecommendationSettingsUpdate: nowIso
    };

    setRecommendationConfig(updatedConfig);
    recommendationStorage.saveConfig(updatedConfig);

    dailySessionStorage.clearSession().then(() => {
      setReloadTrigger(prev => prev + 1);
    });

    const message = "Recommendation settings saved successfully!";
    setToast({ show: true, message });
    return { success: true, message };
  };

  const updateSessionQuestionStatus = (
    problemId: number,
    newStatus: "Not Started" | "In Progress" | "Completed" | "Skipped"
  ) => {
    if (!dailySession) return;
    const nowIso = new Date().toISOString();

    const updatedQuestions = dailySession.questions.map(q => {
      if (q.problemId === problemId) {
        return {
          ...q,
          status: newStatus,
          startedAt: newStatus === "In Progress" ? nowIso : q.startedAt,
          completedAt: newStatus === "Completed" ? nowIso : q.completedAt,
          skippedAt: newStatus === "Skipped" ? nowIso : q.skippedAt
        };
      }
      return q;
    });

    const completedCount = updatedQuestions.filter(q => q.status === "Completed").length;
    const skippedCount = updatedQuestions.filter(q => q.status === "Skipped").length;
    const inProgressCount = updatedQuestions.filter(q => q.status === "In Progress").length;

    const updatedSession: DailyPracticeSession = {
      ...dailySession,
      updatedAt: nowIso,
      questions: updatedQuestions,
      metadata: {
        ...dailySession.metadata,
        completedCount,
        skippedCount,
        inProgressCount
      }
    };

    setDailySession(updatedSession);
    dailySessionStorage.saveSession(updatedSession);
    sessionArchiveStorage.upsertSession(updatedSession);
  };

  const startPractice = (problemId: number) => {
    const problem = problems.find(p => p.id === problemId);
    if (problem) {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
      const existing = history.find(h => h.problemId === problemId);

      if (!existing) {
        const newHistoryItem: HistoryItem = {
          id: Date.now(),
          problemId: problem.id,
          problemTitle: problem.title,
          date: formattedDate,
          difficulty: problem.difficulty,
          status: "Incomplete",
          startedAt: now.toISOString(),
          completedAt: undefined,
          platform: problem.platform,
          topics: problem.topics
        };
        setHistory(prev => [newHistoryItem, ...prev]);
      }
    }

    setProblemStatuses(prev => ({
      ...prev,
      [problemId.toString()]: {
        status: "In Progress",
        startedAt: new Date().toISOString()
      }
    }));

    updateSessionQuestionStatus(problemId, "In Progress");
  };

  const markCompleted = (problemId: number) => {
    const problem = problems.find(p => p.id === problemId);
    if (problem) {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

      setHistory(prev => {
        const existing = prev.find(h => h.problemId === problemId);
        if (existing) {
          return prev.map(h => h.problemId === problemId ? { ...h, status: "Solved", completedAt: now.toISOString() } : h);
        }
        return [
          {
            id: Date.now(),
            problemId: problem.id,
            problemTitle: problem.title,
            date: formattedDate,
            difficulty: problem.difficulty,
            status: "Solved",
            startedAt: now.toISOString(),
            completedAt: now.toISOString(),
            platform: problem.platform,
            topics: problem.topics
          },
          ...prev
        ];
      });
    }

    setProblemStatuses(prev => ({
      ...prev,
      [problemId.toString()]: {
        ...prev[problemId.toString()],
        status: "Completed",
        completedAt: new Date().toISOString()
      }
    }));

    updateSessionQuestionStatus(problemId, "Completed");
  };

  const skipProblem = (problemId: number) => {
    setProblemStatuses(prev => ({
      ...prev,
      [problemId.toString()]: {
        ...prev[problemId.toString()],
        status: "Skipped",
        skippedAt: new Date().toISOString()
      }
    }));

    updateSessionQuestionStatus(problemId, "Skipped");
  };

  const clearToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const showToast = (message: string) => {
    setToast({ show: true, message });
  };

  const updateNote = (problemId: number, note: string) => {
    setNotes(prev => {
      const newNotes = { ...prev };
      if (note.trim() === "") delete newNotes[problemId.toString()];
      else newNotes[problemId.toString()] = note;
      return newNotes;
    });
  };

  const deleteNote = (problemId: number) => {
    setNotes(prev => {
      const newNotes = { ...prev };
      delete newNotes[problemId.toString()];
      return newNotes;
    });
  };

  const generateAiReview = async (request: AiReviewRequest & { problemId: number }): Promise<AiReviewResult> => {
    const response = await aiReviewService.generateReview(request);
    const resultWithTime: AiReviewResult = {
      ...response,
      reviewedAt: new Date().toISOString()
    };

    setAiReviewMap(prev => ({
      ...prev,
      [request.problemId]: resultWithTime
    }));

    setToast({
      show: true,
      message: `AI Review generated for ${request.problemTitle}!`
    });

    refreshReviewQuota();

    return resultWithTime;
  };

  return (
    <AppContext.Provider
      value={{
        selectedLanguage,
        selectedTopics,
        problems,
        dailySession,
        history,
        selectedReviewProblem,
        toast,
        recommendationConfig,
        loading,
        error,
        problemStatuses,
        notes,
        aiReviewMap,
        reviewQuotaStatus,
        refreshReviewQuota,
        showToast,
        saveProfile,
        selectReviewProblem,
        clearToast,
        resetProfile,
        importProfile,
        updateRecommendationConfig,
        startPractice,
        markCompleted,
        skipProblem,
        retryProblems,
        updateNote,
        deleteNote,
        generateAiReview
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
