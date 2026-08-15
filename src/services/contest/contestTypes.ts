// ─── Contest Intelligence Types ───────────────────────────────────────────────

export type ContestPlatform = "codeforces" | "leetcode" | "atcoder" | "other";

export type ContestReadinessLevel =
  | "Beginner"
  | "Developing"
  | "Competitive"
  | "Advanced"
  | "Expert";

export type ContestGoalCategory =
  | "rating"
  | "participation"
  | "topic_mastery"
  | "consistency";

export type ContestGoalStatus = "in_progress" | "completed" | "at_risk";

export type ImprovementTrend = "up" | "flat" | "down";

// ─── Core Contest Entry ───────────────────────────────────────────────────────

export interface ContestProblemBreakdown {
  easySolved: number;
  easyAttempted: number;
  mediumSolved: number;
  mediumAttempted: number;
  hardSolved: number;
  hardAttempted: number;
  timeEfficiencyScore: number; // 0–100
  penaltyMinutes: number;
  missedOpportunities: number; // problems you could have solved but didn't
  topicsAttempted: string[];
}

export interface ContestEntry {
  id: string;
  contestName: string;
  date: string; // YYYY-MM-DD
  platform: ContestPlatform;
  rank: number;
  totalParticipants: number;
  ratingBefore: number;
  ratingAfter: number;
  ratingChange: number; // ratingAfter - ratingBefore
  problemsSolved: number;
  totalProblems: number;
  timeSpentMinutes: number;
  performanceScore: number; // 0–100 computed score
  problemBreakdown: ContestProblemBreakdown;
  notes?: string;
  createdAt: string; // ISO timestamp
}

// ─── Rating Snapshot ──────────────────────────────────────────────────────────

export interface ContestRatingSnapshot {
  date: string; // YYYY-MM-DD
  rating: number;
  delta: number;
  contestName: string;
  platform: ContestPlatform;
}

// ─── Dashboard Metrics ────────────────────────────────────────────────────────

export interface ContestDashboardMetrics {
  currentRating: number;
  peakRating: number;
  totalContests: number;
  averageRank: number;
  bestRank: number;
  worstRank: number;
  ratingGrowth30d: number; // net rating change in last 30 days
  ratingGrowthAllTime: number;
  winRateTop25Pct: number; // % of contests where rank <= 25th percentile
  avgProblemsPerContest: number;
  avgTimePerContest: number; // minutes
}

// ─── Rating Progress Analytics ────────────────────────────────────────────────

export interface RatingDataPoint {
  date: string;
  rating: number;
  contestName: string;
  platform: ContestPlatform;
}

export interface MonthlyRatingGain {
  month: string; // "Aug 2026"
  gain: number;
  contests: number;
}

export interface PerformanceTrendPoint {
  date: string;
  performanceScore: number;
  rank: number;
  contestName: string;
}

export interface RatingProgressAnalytics {
  ratingOverTime: RatingDataPoint[];
  monthlyGain: MonthlyRatingGain[];
  performanceTrend: PerformanceTrendPoint[];
  avgRankTrend: { date: string; avgRank: number }[];
  participationConsistency: number; // 0–100
  longestActiveStreak: number; // consecutive months with contests
  currentMonthContests: number;
}

// ─── Weakness Detection ───────────────────────────────────────────────────────

export type WeaknessSeverity = "critical" | "high" | "medium" | "low";

export interface WeakTopic {
  topic: string;
  successRate: number; // 0–100
  contestAppearances: number;
  severity: WeaknessSeverity;
  recommendation: string;
}

export interface SlowArea {
  area: string;
  avgTimeMinutes: number;
  benchmarkMinutes: number;
  overagePercent: number;
}

export interface MistakePattern {
  pattern: string;
  frequency: number; // how often it occurs across contests
  description: string;
  suggestedFix: string;
}

export interface WeaknessDetectionResult {
  weakTopics: WeakTopic[];
  slowAreas: SlowArea[];
  difficultyBottleneck: "Easy" | "Medium" | "Hard" | "None";
  paceIssues: string[];
  mistakePatterns: MistakePattern[];
  overallWeaknessScore: number; // 0–100, higher = more weaknesses
  aiInsights: string[];
}

// ─── Topic Performance Matrix ─────────────────────────────────────────────────

export interface TopicContestPerformance {
  topic: string;
  successRate: number; // 0–100
  avgDifficultySolved: "Easy" | "Medium" | "Hard" | "None";
  contestContribution: number; // % of contest problems from this topic
  improvementTrend: ImprovementTrend;
  totalAppearances: number;
  solvedCount: number;
}

// ─── Readiness Score ──────────────────────────────────────────────────────────

export interface ReadinessFactor {
  factor: string;
  score: number; // 0–100
  weight: number; // 0–1
  impact: "positive" | "neutral" | "needs_attention";
  description: string;
}

export interface ContestReadinessScore {
  score: number; // 0–100
  level: ContestReadinessLevel;
  factors: ReadinessFactor[];
  contestsNeededForNextLevel: number;
  nextLevel: ContestReadinessLevel;
  strengthSummary: string;
  improvementSummary: string;
}

// ─── Virtual Contest Planner ──────────────────────────────────────────────────

export interface RatingGoalMilestone {
  targetRating: number;
  estimatedDate: string; // "in 3 months"
  contestsNeeded: number;
  currentGap: number;
}

export interface WeeklyContestPlan {
  weekLabel: string; // "Week 1 of Aug"
  recommendedContests: number;
  focusTopics: string[];
  targetRatingGain: number;
  suggestedPlatform: ContestPlatform;
}

export interface VirtualContestPlan {
  recommendedFrequency: number; // contests per week
  recommendedFrequencyReason: string;
  ratingMilestones: RatingGoalMilestone[];
  targetTopics: string[];
  weeklyPlan: WeeklyContestPlan[];
  monthlyGoals: {
    month: string;
    targetContests: number;
    targetRatingGain: number;
    focusArea: string;
  }[];
}

// ─── AI Contest Coach ─────────────────────────────────────────────────────────

export interface CoachingAdvice {
  id: string;
  category: "strategy" | "topic" | "mindset" | "timing" | "preparation";
  title: string;
  advice: string;
  priority: "high" | "medium" | "low";
  actionable: boolean;
}

export interface RatingRoadmapMilestone {
  rating: number;
  label: string; // "Specialist", "Expert", etc.
  estimatedDate: string;
  contestsAway: number;
  status: "achieved" | "upcoming" | "future";
}

export interface ContestCoachAdvice {
  improvementAdvice: CoachingAdvice[];
  strategyTips: CoachingAdvice[];
  topicPriorities: { rank: number; topic: string; reason: string }[];
  ratingRoadmap: RatingRoadmapMilestone[];
  nextMilestonePrediction: {
    targetRating: number;
    estimatedDate: string;
    confidencePercent: number;
    requiredConsistency: string;
  };
}

// ─── Contest Goals ────────────────────────────────────────────────────────────

export interface ContestGoal {
  id: string;
  title: string;
  category: ContestGoalCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate: string; // YYYY-MM-DD
  status: ContestGoalStatus;
  completionPercentage: number; // 0–100
  estimatedCompletionDate: string;
  predictedSuccessPercentage: number; // 0–100
  createdAt: string;
}

// ─── Full Intelligence Aggregate ──────────────────────────────────────────────

export interface FullContestIntelligence {
  dashboard: ContestDashboardMetrics;
  entries: ContestEntry[];
  ratingProgress: RatingProgressAnalytics;
  weakness: WeaknessDetectionResult;
  topicMatrix: TopicContestPerformance[];
  readiness: ContestReadinessScore;
  virtualPlan: VirtualContestPlan;
  coach: ContestCoachAdvice;
  goals: ContestGoal[];
  lastUpdated: string;
}

// ─── UI / Filter State ────────────────────────────────────────────────────────

export type ContestSortField = "date" | "rank" | "rating" | "performance";
export type ContestSortDir = "asc" | "desc";
