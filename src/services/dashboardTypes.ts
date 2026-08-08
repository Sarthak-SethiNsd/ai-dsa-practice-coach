import { ReviewCategory } from "./ai/aiTypes";

export type DateRangeFilter = "all" | "7d" | "30d" | "90d" | "year";

export interface DashboardFiltersState {
  dateRange: DateRangeFilter;
  language: string;
  category: ReviewCategory | "all";
  provider: string;
  model: string;
  collectionId: string;
}

export const DEFAULT_DASHBOARD_FILTERS: DashboardFiltersState = {
  dateRange: "all",
  language: "all",
  category: "all",
  provider: "all",
  model: "all",
  collectionId: "all",
};

export interface DashboardStats {
  totalReviews: number;
  reviewsThisWeek: number;
  reviewsThisMonth: number;
  avgScore: number;
  bestScore: number;
  avgTokens: number;
  avgDurationMs: number;
  totalCodingTimeMs: number;
  collectionsCount: number;
  mostActiveLanguage: string;
  mostActiveCategory: string;
}

export interface TimeSeriesPoint {
  date: string;
  timestamp: number;
  reviewCount: number;
  avgScore: number;
  totalTokens: number;
  avgDurationMs: number;
}

export interface DistributionItem {
  name: string;
  count: number;
  percentage: number;
}

export interface Distributions {
  languages: DistributionItem[];
  categories: DistributionItem[];
  timeComplexities: DistributionItem[];
  spaceComplexities: DistributionItem[];
  providers: DistributionItem[];
  models: DistributionItem[];
}

export interface ImprovementAnalytics {
  scoreImprovementPct: number;
  avgImprovementLast7: number;
  weakestTopics: string[];
  strongestTopics: string[];
  frequentlyRepeatedMistakes: string[];
  mostImprovedCategory: string;
  suggestedNextFocus: string;
}

export interface CollectionAnalyticsItem {
  id: string;
  name: string;
  color: string;
  reviewCount: number;
  avgScore: number;
  avgTokens: number;
  languages: string[];
}

export interface CollectionAnalytics {
  collections: CollectionAnalyticsItem[];
  mostActiveCollection: string | null;
  bestPerformingCollection: string | null;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0 to 100
  criteria: string;
}
