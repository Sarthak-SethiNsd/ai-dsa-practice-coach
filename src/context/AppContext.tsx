"use client";

import * as React from "react";
import { LeetCodeService } from "@/services/leetcode/leetcodeService";
import { CodeforcesService } from "@/services/codeforces/codeforcesService";
import {
  RecommendationRequest,
  ProblemService,
  Platform,
  RecommendationPlatformConfig,
  RecommendationConfig
} from "@/services/types";
import { recommendationStorage } from "@/services/recommendationStorage";
import { checkRecommendationSettingsCooldown } from "@/services/cooldownService";

export type { RecommendationPlatformConfig, RecommendationConfig };

export interface Problem {
  id: number;
  title: string;
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
}

export interface HistoryItem {
  id: number;
  problemId: number;
  problemTitle: string;
  date: string; // Formatted date for display (started date)
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Solved" | "Incomplete";
  // New tracking fields
  startedAt: string; // ISO timestamp
  completedAt?: string; // ISO timestamp (only when completed)
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

interface AppContextType {
  selectedLanguage: string;
  selectedTopics: string[];
  problems: Problem[];
  history: HistoryItem[];
  selectedReviewProblem: Problem | null;
  toast: ToastState;
  recommendationConfig: RecommendationConfig;
  // Loading states
  loading: boolean;
  error: string | null;
  // Problem tracking
  problemStatuses: Record<string, {
    status: "Not Started" | "In Progress" | "Completed";
    startedAt?: string; // ISO timestamp
    completedAt?: string; // ISO timestamp
  }>;
  // Notes
  notes: Record<string, string>; // problemId -> note
  saveProfile: (language: string, topics: string[]) => void;
  selectReviewProblem: (problemId: number) => void;
  clearToast: () => void;
  resetProfile: () => void;
  importProfile: (language: string, topics: string[], history: HistoryItem[]) => void;
  updateRecommendationConfig: (platformConfigs: RecommendationPlatformConfig[]) => { success: boolean; message: string };
  // Problem tracking functions
  startPractice: (problemId: number) => void;
  markCompleted: (problemId: number) => void;
  // Problem refetch / retry function
  retryProblems: () => void;
  // Notes functions
  updateNote: (problemId: number, note: string) => void;
  deleteNote: (problemId: number) => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

// Helper to determine active problems matching selected topics & recommendation config
const getFilteredProblems = async (topics: string[], config: RecommendationConfig): Promise<Problem[]> => {
  if (topics.length === 0 || !config.platformConfigs || config.platformConfigs.length === 0) return [];

  const platformPromises = config.platformConfigs.map(async (pConfig) => {
    let service: ProblemService;
    if (pConfig.platform === "leetcode") {
      service = new LeetCodeService();
    } else if (pConfig.platform === "codeforces") {
      service = new CodeforcesService();
    } else {
      return [];
    }

    const request: RecommendationRequest = {
      topics: topics,
      platforms: [pConfig.platform],
      countPerPlatform: pConfig.questionsPerDay,
      difficulty: pConfig.difficulty === "Mixed" ? undefined : pConfig.difficulty
    };

    return await service.getProblems(request);
  });

  const results = await Promise.all(platformPromises);
  const allProblems = results.flat();

  // Deduplicate by problem ID and sort
  const uniqueProblems = Array.from(
    new Map(allProblems.map(p => [p.id, p])).values()
  );
  uniqueProblems.sort((a, b) => a.id - b.id);

  return uniqueProblems;
};

// Generate static history items using standard mock problems
const getMockHistory = async (topics: string[], config: RecommendationConfig): Promise<HistoryItem[]> => {
  const filtered = await getFilteredProblems(topics, config);
  if (filtered.length === 0) return [];

  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return [
    {
      id: 1,
      problemId: filtered[0].id,
      problemTitle: filtered[0].title,
      date: formattedDate,
      difficulty: filtered[0].difficulty,
      status: "Solved" as const,
      startedAt: now.toISOString(),
      completedAt: now.toISOString(),
      platform: filtered[0].platform,
      topics: filtered[0].topics
    },
    ...(filtered.length > 1
      ? [
          {
            id: 2,
            problemId: filtered[1].id,
            problemTitle: filtered[1].title,
            date: formattedDate,
            difficulty: filtered[1].difficulty,
            status: "Incomplete" as const,
            startedAt: now.toISOString(),
            completedAt: undefined,
            platform: filtered[1].platform,
            topics: filtered[1].topics
          }
        ]
      : [])
  ];
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>("JavaScript");
  const [selectedTopics, setSelectedTopics] = React.useState<string[]>([
    "Arrays",
    "Hashing",
    "Two Pointers",
    "Binary Search",
    "Recursion"
  ]);
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [selectedReviewProblem, setSelectedReviewProblem] = React.useState<Problem | null>(null);
  const [toast, setToast] = React.useState<ToastState>({ show: false, message: "" });
  const [recommendationConfig, setRecommendationConfig] = React.useState<RecommendationConfig>(DEFAULT_RECOMMENDATION_CONFIG);

  // Problem status tracking: maps problemId to status object
  const [problemStatuses, setProblemStatuses] = React.useState<Record<string, {
    status: "Not Started" | "In Progress" | "Completed";
    startedAt?: string;
    completedAt?: string;
  }>>({});
  // Notes tracking: maps problemId to note string
  const [notes, setNotes] = React.useState<Record<string, string>>({});

  // Track mount status for safe state updates
  const mountedRef = React.useRef(false);
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Memoize problems based on selectedTopics and recommendationConfig
  const [problems, setProblems] = React.useState<Problem[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [reloadTrigger, setReloadTrigger] = React.useState(0);

  const retryProblems = React.useCallback(() => {
    setReloadTrigger(prev => prev + 1);
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    const loadProblems = async () => {
      if (isMounted) {
        setLoading(true);
        setError(null);
      }
      try {
        const fetchedProblems = await getFilteredProblems(selectedTopics, recommendationConfig);
        if (isMounted) {
          setProblems(fetchedProblems);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load problems");
          setLoading(false);
          setToast({
            show: true,
            message: "Failed to load problems. Please try again."
          });
        }
      }
    };

    loadProblems();

    return () => {
      isMounted = false;
    };
  }, [selectedTopics, recommendationConfig, reloadTrigger, setToast]);

  // Synchronise state on first render
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem("dsa_language");
    const savedTopics = localStorage.getItem("dsa_topics");
    const savedHistory = localStorage.getItem("dsa_history");
    const savedProblemStatuses = localStorage.getItem("dsa_problem_status");
    const savedNotes = localStorage.getItem("dsa_notes");

    let activeTopics = [
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
        interface OldHistoryItem {
          id: number;
          problemId: number;
          problemTitle: string;
          date: string;
          difficulty: "Easy" | "Medium" | "Hard";
          status: "Solved" | "Incomplete";
        }
        activeHistory = parsed.map((item: OldHistoryItem) => {
          let fallbackDate: Date;
          try {
            fallbackDate = new Date(item.date);
            if (isNaN(fallbackDate.getTime())) {
              fallbackDate = new Date();
            }
          } catch {
            fallbackDate = new Date();
          }

          return {
            ...item,
            startedAt: fallbackDate.toISOString(),
            completedAt: item.status === "Solved" ? fallbackDate.toISOString() : undefined,
            platform: "leetcode",
            topics: []
          } as HistoryItem;
        });
      } catch (e) {
        console.error("Failed to parse saved history", e);
        activeHistory = [];
      }
    } else {
      getMockHistory(activeTopics, DEFAULT_RECOMMENDATION_CONFIG).then(h => {
        if (mountedRef.current) {
          setHistory(h);
          localStorage.setItem("dsa_history", JSON.stringify(h));
        }
      });
    }

    let activeConfig: RecommendationConfig = DEFAULT_RECOMMENDATION_CONFIG;
    recommendationStorage.loadConfig().then((loadedConfig) => {
      if (loadedConfig) {
        if (loadedConfig.platformConfigs && Array.isArray(loadedConfig.platformConfigs) && loadedConfig.platformConfigs.length > 0) {
          activeConfig = loadedConfig;
        } else if ((loadedConfig as unknown as Record<string, unknown>).platforms) {
          // Migration from legacy schema
          const legacyObj = loadedConfig as unknown as { platforms: Platform[]; countPerPlatform?: number; difficulty?: "Easy" | "Medium" | "Hard" | "Mixed"; lastRecommendationSettingsUpdate?: string };
          const migrated: RecommendationPlatformConfig[] = (legacyObj.platforms || []).map(p => ({
            platform: p,
            questionsPerDay: legacyObj.countPerPlatform ?? 5,
            difficulty: legacyObj.difficulty ?? "Mixed"
          }));
          activeConfig = {
            platformConfigs: migrated.length > 0 ? migrated : DEFAULT_RECOMMENDATION_CONFIG.platformConfigs,
            lastRecommendationSettingsUpdate: legacyObj.lastRecommendationSettingsUpdate
          };
        }
      }

      if (mountedRef.current) {
        setRecommendationConfig(activeConfig);
      }
    });

    let activeProblemStatuses: Record<string, {
      status: "Not Started" | "In Progress" | "Completed";
      startedAt?: string;
      completedAt?: string;
    }> = {};
    if (savedProblemStatuses) {
      try {
        activeProblemStatuses = JSON.parse(savedProblemStatuses);
      } catch (e) {
        console.error("Failed to parse saved problem statuses", e);
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

    const timer = setTimeout(() => {
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage);
      }
      setSelectedTopics(activeTopics);
      if (activeHistory.length > 0) {
        setHistory(activeHistory);
      }
      setProblemStatuses(activeProblemStatuses);
      setNotes(activeNotes);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Persist problemStatuses to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem("dsa_problem_status", JSON.stringify(problemStatuses));
  }, [problemStatuses]);

  // Persist notes to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem("dsa_notes", JSON.stringify(notes));
  }, [notes]);

  // Persist history to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem("dsa_history", JSON.stringify(history));
  }, [history]);

  const saveProfile = (language: string, topics: string[]) => {
    setSelectedLanguage(language);
    setSelectedTopics(topics);
    localStorage.setItem("dsa_language", language);
    localStorage.setItem("dsa_topics", JSON.stringify(topics));

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

    getMockHistory(defaultTopics, DEFAULT_RECOMMENDATION_CONFIG).then(defaultHistory => {
      setSelectedLanguage("JavaScript");
      setSelectedTopics(defaultTopics);
      setHistory(defaultHistory);
      setSelectedReviewProblem(null);
      setRecommendationConfig(DEFAULT_RECOMMENDATION_CONFIG);
      setProblemStatuses({});
      setNotes({});

      localStorage.removeItem("dsa_language");
      localStorage.removeItem("dsa_topics");
      localStorage.removeItem("dsa_history");
      localStorage.removeItem("dsa_review_problem_id");
      localStorage.removeItem("dsa_problem_status");
      localStorage.removeItem("dsa_notes");
      recommendationStorage.clearConfig();

      setToast({
        show: true,
        message: "Permanent knowledge profile reset to defaults."
      });
    });
  };

  const importProfile = (language: string, topics: string[], importedHistory: HistoryItem[]) => {
    setSelectedLanguage(language);
    setSelectedTopics(topics);

    const convertedHistory: HistoryItem[] = importedHistory.map((item): HistoryItem => {
      let fallbackDate: Date;
      try {
        fallbackDate = new Date(item.date);
        if (isNaN(fallbackDate.getTime())) {
          fallbackDate = new Date();
        }
      } catch {
        fallbackDate = new Date();
      }

      return {
        ...item,
        startedAt: item.startedAt || fallbackDate.toISOString(),
        completedAt: item.completedAt || (item.status === "Solved" ? fallbackDate.toISOString() : undefined),
        platform: item.platform || "leetcode",
        topics: Array.isArray(item.topics) ? item.topics : []
      };
    });

    setHistory(convertedHistory);
    setSelectedReviewProblem(null);

    localStorage.setItem("dsa_language", language);
    localStorage.setItem("dsa_topics", JSON.stringify(topics));
    localStorage.setItem("dsa_history", JSON.stringify(convertedHistory));
    localStorage.removeItem("dsa_review_problem_id");

    setToast({
      show: true,
      message: "Profile imported successfully!"
    });
  };

  const updateRecommendationConfig = (newPlatformConfigs: RecommendationPlatformConfig[]): { success: boolean; message: string } => {
    const cooldownCheck = checkRecommendationSettingsCooldown(recommendationConfig.lastRecommendationSettingsUpdate);

    if (!cooldownCheck.canUpdate) {
      const message = `Recommendation settings can only be changed once every 24 hours. Next update available in ${cooldownCheck.formattedRemainingTime} (at ${cooldownCheck.nextAvailableTimeFormatted}).`;
      setToast({
        show: true,
        message
      });
      return { success: false, message };
    }

    const nowIso = new Date().toISOString();
    const updatedConfig: RecommendationConfig = {
      platformConfigs: newPlatformConfigs,
      lastRecommendationSettingsUpdate: nowIso
    };

    setRecommendationConfig(updatedConfig);
    recommendationStorage.saveConfig(updatedConfig);

    const message = "Recommendation settings saved successfully!";
    setToast({
      show: true,
      message
    });
    return { success: true, message };
  };

  const startPractice = (problemId: number) => {
    const existingHistoryIndex = history.findIndex(item => item.problemId === problemId);
    if (existingHistoryIndex === -1) {
      const problem = problems.find(p => p.id === problemId);
      if (problem) {
        const now = new Date();
        const formattedDate = now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

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

    setProblemStatuses(prev => {
      const newStatuses = { ...prev };
      const problemIdStr = problemId.toString();
      if (!newStatuses[problemIdStr]) {
        newStatuses[problemIdStr] = {
          status: "In Progress",
          startedAt: new Date().toISOString()
        };
      } else {
        newStatuses[problemIdStr] = {
          ...newStatuses[problemIdStr],
          status: "In Progress",
          startedAt: new Date().toISOString()
        };
      }
      return newStatuses;
    });
  };

  const markCompleted = (problemId: number) => {
    setHistory(prev => prev.map(item =>
      item.problemId === problemId
        ? {
            ...item,
            status: "Solved",
            completedAt: new Date().toISOString()
          }
        : item
    ));

    setProblemStatuses(prev => {
      const newStatuses = { ...prev };
      const problemIdStr = problemId.toString();
      if (!newStatuses[problemIdStr]) {
        newStatuses[problemIdStr] = {
          status: "Completed",
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString()
        };
      } else {
        newStatuses[problemIdStr] = {
          ...newStatuses[problemIdStr],
          status: "Completed",
          completedAt: new Date().toISOString()
        };
      }
      return newStatuses;
    });

    const problem = problems.find(p => p.id === problemId);
    if (problem) {
      const alreadyInHistory = history.some(item => item.problemId === problemId);
      if (!alreadyInHistory) {
        const newHistoryItem: HistoryItem = {
          id: Date.now(),
          problemId: problem.id,
          problemTitle: problem.title,
          date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
          difficulty: problem.difficulty,
          status: "Solved",
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          platform: problem.platform,
          topics: problem.topics
        };
        setHistory(prev => [newHistoryItem, ...prev]);
      }
    }
  };

  const clearToast = () => {
    setToast((prev: ToastState) => ({ ...prev, show: false }));
  };

  const updateNote = (problemId: number, note: string) => {
    setNotes(prev => {
      const newNotes = { ...prev };
      if (note.trim() === "") {
        delete newNotes[problemId.toString()];
      } else {
        newNotes[problemId.toString()] = note;
      }
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

  return (
    <AppContext.Provider
      value={{
        selectedLanguage: selectedLanguage,
        selectedTopics: selectedTopics,
        problems: problems,
        history: history,
        selectedReviewProblem: selectedReviewProblem,
        toast: toast,
        recommendationConfig: recommendationConfig,
        loading: loading,
        error: error,
        problemStatuses: problemStatuses,
        notes: notes,
        saveProfile: saveProfile,
        selectReviewProblem: selectReviewProblem,
        clearToast: clearToast,
        resetProfile: resetProfile,
        importProfile: importProfile,
        updateRecommendationConfig: updateRecommendationConfig,
        startPractice: startPractice,
        markCompleted: markCompleted,
        retryProblems: retryProblems,
        updateNote: updateNote,
        deleteNote: deleteNote
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
