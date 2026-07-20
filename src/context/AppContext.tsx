"use client";

import * as React from "react";
import { LeetCodeService } from "@/services/leetcode/leetcodeService";
import { CodeforcesService } from "@/services/codeforces/codeforcesService";
import { RecommendationEngine } from "@/services/recommendationEngine";
import { RecommendationRequest, ProblemService } from "@/services/types";

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
  platform: "leetcode" | "codeforces";
}

export interface HistoryItem {
  id: number;
  problemId: number;
  problemTitle: string;
  date: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Solved" | "Incomplete";
}

export interface ToastState {
  show: boolean;
  message: string;
}

export interface HistoryItem {
  id: number;
  problemId: number;
  problemTitle: string;
  date: string;
  difficulty: "Easy" | "Medium" | "Hard";
  status: "Solved" | "Incomplete";
}

export interface RecommendationConfig {
  platforms: ("leetcode" | "codeforces")[];
  countPerPlatform: number;
  difficulty: "Easy" | "Medium" | "Hard" | "Mixed";
  totalLimit: number;
}

interface AppContextType {
  selectedLanguage: string;
  selectedTopics: string[];
  problems: Problem[];
  history: HistoryItem[];
  selectedReviewProblem: Problem | null;
  toast: ToastState;
  recommendationConfig: RecommendationConfig;
  saveProfile: (language: string, topics: string[]) => void;
  selectReviewProblem: (problemId: number) => void;
  clearToast: () => void;
  resetProfile: () => void;
  importProfile: (language: string, topics: string[], history: HistoryItem[]) => void;
  updateRecommendationConfig: (config: Partial<RecommendationConfig>) => void;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

// Helper to determine active platforms based on config
const getActivePlatforms = (config: RecommendationConfig): ("leetcode" | "codeforces")[] => {
  if (config.platforms.includes("leetcode") && config.platforms.includes("codeforces")) {
    return ["leetcode", "codeforces"];
  }
  if (config.platforms.includes("leetcode")) {
    return ["leetcode"];
  }
  if (config.platforms.includes("codeforces")) {
    return ["codeforces"];
  }
  // Default to both if none specified
  return ["leetcode", "codeforces"];
};

// Helper to determine if difficulty is "Mixed" (no filter)
const isMixedDifficulty = (difficulty: string): boolean => {
  return difficulty === "Mixed";
};

// Helper to determine active difficulty (undefined if Mixed)
const getActiveDifficulty = (config: RecommendationConfig): undefined | "Easy" | "Medium" | "Hard" => {
  return isMixedDifficulty(config.difficulty) ? undefined : config.difficulty as "Easy" | "Medium" | "Hard";
};

// Helper to determine active problems matching selected topics
const getFilteredProblems = async (topics: string[], config: RecommendationConfig): Promise<Problem[]> => {
  if (topics.length === 0) return [];

  // Initialize services based on config
  const services: ProblemService[] = [];

  if (config.platforms.includes("leetcode")) {
    services.push(new LeetCodeService());
  }
  if (config.platforms.includes("codeforces")) {
    services.push(new CodeforcesService());
  }

  // Create recommendation engine with active services
  const recommendationEngine = new RecommendationEngine(services);

  // Create request matching the current filtering logic
  const request: RecommendationRequest = {
    topics: topics,
    platforms: getActivePlatforms(config),
    countPerPlatform: config.countPerPlatform,
    difficulty: getActiveDifficulty(config),
    totalLimit: config.totalLimit
  };

  // Get recommendations from all platforms
  return await recommendationEngine.getRecommendations(request);
};

// Generate static history items using standard mock problems
const getMockHistory = async (topics: string[], config: RecommendationConfig): Promise<HistoryItem[]> => {
  const filtered = await getFilteredProblems(topics, config);
  if (filtered.length === 0) return [];

  // Return history mappings (first two problems as in original)
  return [
    {
      id: 1,
      problemId: filtered[0].id,
      problemTitle: filtered[0].title,
      date: "Jul 11, 2026",
      difficulty: filtered[0].difficulty,
      status: "Solved"
    },
    ...(filtered.length > 1
      ? [
          {
            id: 2,
            problemId: filtered[1].id,
            problemTitle: filtered[1].title,
            date: "Jul 10, 2026",
            difficulty: filtered[1].difficulty,
            status: "Incomplete" as const
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
  const [recommendationConfig, setRecommendationConfig] = React.useState<RecommendationConfig>({
    platforms: ["leetcode", "codeforces"],
    countPerPlatform: 5,
    difficulty: "Mixed",
    totalLimit: 10
  });

  // Track mount status for safe state updates
  const mountedRef = React.useRef(false);
  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []); // Empty deps array is fine here since we're just setting a ref

  // Memoize problems based on selectedTopics and recommendationConfig
  const [problems, setProblems] = React.useState<Problem[]>([]);

  React.useEffect(() => {
    let isMounted = true;

    const loadProblems = async () => {
      const fetchedProblems = await getFilteredProblems(selectedTopics, recommendationConfig);
      if (isMounted) {
        setProblems(fetchedProblems);
      }
    };

    loadProblems();

    return () => {
      isMounted = false;
    };
  }, [selectedTopics, recommendationConfig]);

  // Synchronise state from localStorage on first render
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem("dsa_language");
    const savedTopics = localStorage.getItem("dsa_topics");
    const savedHistory = localStorage.getItem("dsa_history");
    const savedReviewId = localStorage.getItem("dsa_review_problem_id");
    const savedConfig = localStorage.getItem("dsa_recommendation_config");

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
        activeHistory = JSON.parse(savedHistory);
      } catch (e) {
        console.error("Failed to parse saved history", e);
      }
    } else {
      // Initialize history with default topics and default config
      const defaultConfig: RecommendationConfig = {
        platforms: ["leetcode", "codeforces"],
        countPerPlatform: 5,
        difficulty: "Mixed",
        totalLimit: 10
      };
      getMockHistory(activeTopics, defaultConfig).then(h => {
        if (mountedRef.current) {
          setHistory(h);
          localStorage.setItem("dsa_history", JSON.stringify(h));
        }
      });
    }

    let activeConfig: RecommendationConfig = {
      platforms: ["leetcode", "codeforces"],
      countPerPlatform: 5,
      difficulty: "Mixed",
      totalLimit: 10
    };
    if (savedConfig) {
      try {
        activeConfig = JSON.parse(savedConfig);
        // Ensure all required fields are present
        if (!activeConfig.platforms) activeConfig.platforms = ["leetcode", "codeforces"];
        if (activeConfig.countPerPlatform === undefined) activeConfig.countPerPlatform = 5;
        if (!activeConfig.difficulty) activeConfig.difficulty = "Mixed";
        if (activeConfig.totalLimit === undefined) activeConfig.totalLimit = 10;
      } catch (e) {
        console.error("Failed to parse saved recommendation config", e);
      }
    }

    const activeReview: Problem | null = null;
    if (savedReviewId) {
      // We'll fetch the problem when needed since we don't have all problems loaded yet
      // For now, we'll just store the ID and fetch when needed
    }

    // Defer state updates to avoid synchronous cascading renders during hydration
    const timer = setTimeout(() => {
      if (savedLanguage) {
        setSelectedLanguage(savedLanguage);
      }
      setSelectedTopics(activeTopics);
      if (activeHistory.length > 0) {
        setHistory(activeHistory);
      }
      if (activeReview) {
        setSelectedReviewProblem(activeReview);
      }
      setRecommendationConfig(activeConfig);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

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
    // Find the problem in our current problems list
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

    const defaultConfig: RecommendationConfig = {
      platforms: ["leetcode", "codeforces"],
      countPerPlatform: 5,
      difficulty: "Mixed",
      totalLimit: 10
    };

    getMockHistory(defaultTopics, defaultConfig).then(defaultHistory => {
      setSelectedLanguage("JavaScript");
      setSelectedTopics(defaultTopics);
      setHistory(defaultHistory);
      setSelectedReviewProblem(null);
      setRecommendationConfig(defaultConfig);

      localStorage.removeItem("dsa_language");
      localStorage.removeItem("dsa_topics");
      localStorage.removeItem("dsa_history");
      localStorage.removeItem("dsa_review_problem_id");
      localStorage.removeItem("dsa_recommendation_config");

      setToast({
        show: true,
        message: "Permanent knowledge profile reset to defaults."
      });
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
    localStorage.removeItem("dsa_review_problem_id");

    setToast({
      show: true,
      message: "Profile imported successfully!"
    });
  };

  const updateRecommendationConfig = (config: Partial<RecommendationConfig>) => {
    setRecommendationConfig(prev => {
      const newConfig = { ...prev, ...config };
      localStorage.setItem("dsa_recommendation_config", JSON.stringify(newConfig));
      return newConfig;
    });
  };

  const clearToast = () => {
    setToast((prev: ToastState) => ({ ...prev, show: false }));
  };

  return (
    <AppContext.Provider
      value={{
        selectedLanguage,
        selectedTopics,
        problems,
        history,
        selectedReviewProblem,
        toast,
        recommendationConfig,
        saveProfile,
        selectReviewProblem,
        clearToast,
        resetProfile,
        importProfile,
        updateRecommendationConfig
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