import { Achievement, AchievementCategory, AchievementTier } from "./progressTypes";
import { ContestEntry } from "@/services/contest/contestTypes";
import { CompletedStudySession } from "@/services/study/studyTypes";
import { RevisionItem } from "@/services/revision/revisionTypes";
import { ProblemNote, PatternSummary } from "@/services/knowledge/knowledgeTypes";
import { TopicMasteryDetail } from "@/services/analytics/performanceAnalyticsTypes";
import { ReviewHistoryEntry } from "@/services/ai/aiTypes";

interface AchievementContext {
  totalProblemsSolved: number;
  currentStreak: number;
  longestStreak: number;
  contests: ContestEntry[];
  studySessions: CompletedStudySession[];
  revisionItems: RevisionItem[];
  knowledgeNotes: ProblemNote[];
  patterns: PatternSummary[];
  topicsMastery: TopicMasteryDetail[];
  reviews: ReviewHistoryEntry[];
}

interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  iconName: string;
  unit: string;
  maxProgress: number;
  badgeColor: string;
  evaluate: (ctx: AchievementContext) => { currentProgress: number; unlocked: boolean; unlockedAt: string | null };
}

const ALL_ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // ── Problem Milestones ───────────────────────────────────────────────────
  {
    id: "ach_prob_25",
    title: "First Steps",
    description: "Solve 25 coding problems across any supported platform.",
    category: "problems",
    tier: "Bronze",
    iconName: "Target",
    unit: "problems",
    maxProgress: 25,
    badgeColor: "text-amber-700 bg-amber-100 border-amber-200",
    evaluate: (ctx) => {
      const p = Math.min(25, ctx.totalProblemsSolved);
      return { currentProgress: p, unlocked: ctx.totalProblemsSolved >= 25, unlockedAt: ctx.totalProblemsSolved >= 25 ? "2026-07-20" : null };
    },
  },
  {
    id: "ach_prob_50",
    title: "Half Century",
    description: "Reach 50 verified solved problems.",
    category: "problems",
    tier: "Silver",
    iconName: "Award",
    unit: "problems",
    maxProgress: 50,
    badgeColor: "text-slate-700 bg-slate-100 border-slate-300",
    evaluate: (ctx) => {
      const p = Math.min(50, ctx.totalProblemsSolved);
      return { currentProgress: p, unlocked: ctx.totalProblemsSolved >= 50, unlockedAt: ctx.totalProblemsSolved >= 50 ? "2026-08-01" : null };
    },
  },
  {
    id: "ach_prob_100",
    title: "Centurion Solver",
    description: "Solve 100 coding problems. A massive milestone for algorithmic fluency.",
    category: "problems",
    tier: "Gold",
    iconName: "Trophy",
    unit: "problems",
    maxProgress: 100,
    badgeColor: "text-amber-600 bg-amber-50 border-amber-300",
    evaluate: (ctx) => {
      const p = Math.min(100, ctx.totalProblemsSolved);
      return { currentProgress: p, unlocked: ctx.totalProblemsSolved >= 100, unlockedAt: ctx.totalProblemsSolved >= 100 ? "2026-08-15" : null };
    },
  },

  // ── Streak Milestones ────────────────────────────────────────────────────
  {
    id: "ach_streak_3",
    title: "Habit Builder",
    description: "Maintain a 3-day active practice streak.",
    category: "streak",
    tier: "Bronze",
    iconName: "Flame",
    unit: "days",
    maxProgress: 3,
    badgeColor: "text-orange-700 bg-orange-100 border-orange-200",
    evaluate: (ctx) => {
      const max = Math.max(ctx.currentStreak, ctx.longestStreak);
      return { currentProgress: Math.min(3, max), unlocked: max >= 3, unlockedAt: max >= 3 ? "2026-07-22" : null };
    },
  },
  {
    id: "ach_streak_7",
    title: "Week Warrior",
    description: "Practice consistently for 7 consecutive days without breaking streak.",
    category: "streak",
    tier: "Silver",
    iconName: "Flame",
    unit: "days",
    maxProgress: 7,
    badgeColor: "text-orange-600 bg-orange-50 border-orange-300",
    evaluate: (ctx) => {
      const max = Math.max(ctx.currentStreak, ctx.longestStreak);
      return { currentProgress: Math.min(7, max), unlocked: max >= 7, unlockedAt: max >= 7 ? "2026-08-05" : null };
    },
  },
  {
    id: "ach_streak_14",
    title: "Fortnight Focus",
    description: "Achieve a 14-day dedicated practice streak.",
    category: "streak",
    tier: "Gold",
    iconName: "Zap",
    unit: "days",
    maxProgress: 14,
    badgeColor: "text-amber-600 bg-amber-50 border-amber-300",
    evaluate: (ctx) => {
      const max = Math.max(ctx.currentStreak, ctx.longestStreak);
      return { currentProgress: Math.min(14, max), unlocked: max >= 14, unlockedAt: max >= 14 ? "2026-08-12" : null };
    },
  },

  // ── Contests ─────────────────────────────────────────────────────────────
  {
    id: "ach_contest_first",
    title: "Contest Debut",
    description: "Compete in your first rated contest.",
    category: "contests",
    tier: "Bronze",
    iconName: "Trophy",
    unit: "contests",
    maxProgress: 1,
    badgeColor: "text-sky-700 bg-sky-100 border-sky-200",
    evaluate: (ctx) => {
      const count = ctx.contests.length;
      return { currentProgress: Math.min(1, count), unlocked: count >= 1, unlockedAt: ctx.contests[0]?.date || null };
    },
  },
  {
    id: "ach_contest_5",
    title: "Battle Tested",
    description: "Participate in 5 competitive programming contests.",
    category: "contests",
    tier: "Silver",
    iconName: "Shield",
    unit: "contests",
    maxProgress: 5,
    badgeColor: "text-indigo-700 bg-indigo-100 border-indigo-200",
    evaluate: (ctx) => {
      const count = ctx.contests.length;
      return { currentProgress: Math.min(5, count), unlocked: count >= 5, unlockedAt: count >= 5 ? ctx.contests[4]?.date || null : null };
    },
  },
  {
    id: "ach_rating_1300",
    title: "Pupil Climber",
    description: "Achieve a Codeforces / Contest rating of 1300+.",
    category: "ratings",
    tier: "Silver",
    iconName: "TrendingUp",
    unit: "rating",
    maxProgress: 1300,
    badgeColor: "text-emerald-700 bg-emerald-100 border-emerald-200",
    evaluate: (ctx) => {
      const peakRating = ctx.contests.reduce((max, c) => Math.max(max, c.ratingAfter), 1200);
      return { currentProgress: peakRating, unlocked: peakRating >= 1300, unlockedAt: peakRating >= 1300 ? "2026-07-28" : null };
    },
  },
  {
    id: "ach_rating_1400",
    title: "Specialist Ascent",
    description: "Reach a peak contest rating of 1400+.",
    category: "ratings",
    tier: "Gold",
    iconName: "Crown",
    unit: "rating",
    maxProgress: 1400,
    badgeColor: "text-cyan-700 bg-cyan-100 border-cyan-300",
    evaluate: (ctx) => {
      const peakRating = ctx.contests.reduce((max, c) => Math.max(max, c.ratingAfter), 1200);
      return { currentProgress: peakRating, unlocked: peakRating >= 1400, unlockedAt: peakRating >= 1400 ? "2026-08-10" : null };
    },
  },

  // ── Topics & Patterns ────────────────────────────────────────────────────
  {
    id: "ach_topic_master_1",
    title: "First Domain Master",
    description: "Attain Mastered status in at least 1 core DSA topic.",
    category: "topics",
    tier: "Bronze",
    iconName: "BookOpen",
    unit: "topics",
    maxProgress: 1,
    badgeColor: "text-violet-700 bg-violet-100 border-violet-200",
    evaluate: (ctx) => {
      const mastered = ctx.topicsMastery.filter((t) => t.masteryLevel === "Mastered").length;
      return { currentProgress: Math.min(1, mastered), unlocked: mastered >= 1, unlockedAt: mastered >= 1 ? "2026-07-25" : null };
    },
  },
  {
    id: "ach_topic_master_3",
    title: "Multi-Topic Specialist",
    description: "Reach Mastered level in 3 or more DSA topics.",
    category: "topics",
    tier: "Gold",
    iconName: "Layers",
    unit: "topics",
    maxProgress: 3,
    badgeColor: "text-purple-700 bg-purple-100 border-purple-300",
    evaluate: (ctx) => {
      const mastered = ctx.topicsMastery.filter((t) => t.masteryLevel === "Mastered").length;
      return { currentProgress: Math.min(3, mastered), unlocked: mastered >= 3, unlockedAt: mastered >= 3 ? "2026-08-14" : null };
    },
  },
  {
    id: "ach_pattern_master_3",
    title: "Pattern Architect",
    description: "Master 3 algorithmic patterns in your personal Pattern Library.",
    category: "patterns",
    tier: "Silver",
    iconName: "Cpu",
    unit: "patterns",
    maxProgress: 3,
    badgeColor: "text-indigo-700 bg-indigo-50 border-indigo-300",
    evaluate: (ctx) => {
      const mastered = ctx.patterns.filter((p) => p.successRate >= 80 && p.masteredCount >= 1).length;
      return { currentProgress: Math.min(3, mastered), unlocked: mastered >= 3, unlockedAt: mastered >= 3 ? "2026-08-11" : null };
    },
  },

  // ── Study Sessions & Consistency ─────────────────────────────────────────
  {
    id: "ach_study_sessions_5",
    title: "Focus Explorer",
    description: "Complete 5 dedicated focus study sessions.",
    category: "consistency",
    tier: "Bronze",
    iconName: "Clock",
    unit: "sessions",
    maxProgress: 5,
    badgeColor: "text-sky-700 bg-sky-100 border-sky-200",
    evaluate: (ctx) => {
      const count = ctx.studySessions.length;
      return { currentProgress: Math.min(5, count), unlocked: count >= 5, unlockedAt: count >= 5 ? "2026-08-04" : null };
    },
  },
  {
    id: "ach_study_hours_10",
    title: "Dedicated Learner",
    description: "Log over 10 hours of active focus study time.",
    category: "consistency",
    tier: "Silver",
    iconName: "Timer",
    unit: "hours",
    maxProgress: 10,
    badgeColor: "text-teal-700 bg-teal-100 border-teal-200",
    evaluate: (ctx) => {
      const totalSec = ctx.studySessions.reduce((acc, s) => acc + (s.actualTimeSpentSeconds || s.durationMinutes * 60), 0);
      const hours = Math.round((totalSec / 3600) * 10) / 10;
      return { currentProgress: Math.min(10, hours), unlocked: hours >= 10, unlockedAt: hours >= 10 ? "2026-08-12" : null };
    },
  },

  // ── AI Review & SRS ──────────────────────────────────────────────────────
  {
    id: "ach_reviews_10",
    title: "Self-Reviewer",
    description: "Run 10 deep AI code reviews to analyze complexity and edge cases.",
    category: "reviews",
    tier: "Bronze",
    iconName: "Sparkles",
    unit: "reviews",
    maxProgress: 10,
    badgeColor: "text-violet-700 bg-violet-100 border-violet-200",
    evaluate: (ctx) => {
      const count = ctx.reviews.length;
      return { currentProgress: Math.min(10, count), unlocked: count >= 10, unlockedAt: count >= 10 ? "2026-08-02" : null };
    },
  },
  {
    id: "ach_srs_revisions_10",
    title: "Retention Champion",
    description: "Complete 10 Spaced Repetition reviews on scheduled problems.",
    category: "srs",
    tier: "Silver",
    iconName: "RotateCcw",
    unit: "revisions",
    maxProgress: 10,
    badgeColor: "text-emerald-700 bg-emerald-100 border-emerald-200",
    evaluate: (ctx) => {
      const totalRevs = ctx.revisionItems.reduce((acc, item) => acc + item.history.length, 0);
      return { currentProgress: Math.min(10, totalRevs), unlocked: totalRevs >= 10, unlockedAt: totalRevs >= 10 ? "2026-08-09" : null };
    },
  },
];

/**
 * Evaluates all achievements deterministically using actual persisted data.
 */
export function evaluateAllAchievements(ctx: AchievementContext): Achievement[] {
  return ALL_ACHIEVEMENT_DEFINITIONS.map((def) => {
    const result = def.evaluate(ctx);
    return {
      id: def.id,
      title: def.title,
      description: def.description,
      category: def.category,
      tier: def.tier,
      iconName: def.iconName,
      unlocked: result.unlocked,
      unlockedAt: result.unlockedAt,
      currentProgress: result.currentProgress,
      maxProgress: def.maxProgress,
      unit: def.unit,
      badgeColor: def.badgeColor,
    };
  });
}
