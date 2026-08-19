"use client";

import * as React from "react";
import { Achievement, AchievementCategory } from "@/services/progress/progressTypes";
import {
  Trophy,
  Award,
  Target,
  Flame,
  Zap,
  Shield,
  TrendingUp,
  Crown,
  BookOpen,
  Layers,
  Cpu,
  Clock,
  Timer,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface AchievementGridProps {
  achievements: Achievement[];
}

const CATEGORY_TABS: { id: AchievementCategory | "all"; label: string }[] = [
  { id: "all", label: "All Badges" },
  { id: "problems", label: "Problems" },
  { id: "streak", label: "Streaks" },
  { id: "contests", label: "Contests" },
  { id: "ratings", label: "Ratings" },
  { id: "topics", label: "Topics" },
  { id: "patterns", label: "Patterns" },
  { id: "consistency", label: "Study Focus" },
  { id: "reviews", label: "AI Reviews" },
  { id: "srs", label: "SRS Retention" },
];

const ICON_MAP: Record<string, React.ElementType> = {
  Target,
  Award,
  Trophy,
  Flame,
  Zap,
  Shield,
  TrendingUp,
  Crown,
  BookOpen,
  Layers,
  Cpu,
  Clock,
  Timer,
  Sparkles,
  RotateCcw,
};

export function AchievementGrid({ achievements }: AchievementGridProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<AchievementCategory | "all">("all");

  const filtered = React.useMemo(() => {
    if (selectedCategory === "all") return achievements;
    return achievements.filter((a) => a.category === selectedCategory);
  }, [achievements, selectedCategory]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100 rounded-2xl">
        {CATEGORY_TABS.map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-sky-700 shadow-xs border border-sky-100"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Counter summary */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>
          Showing {filtered.length} milestone{filtered.length !== 1 ? "s" : ""}
        </span>
        <span>
          {unlockedCount} of {achievements.length} unlocked ({Math.round((unlockedCount / achievements.length) * 100)}%)
        </span>
      </div>

      {/* Grid of badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ach) => {
          const Icon = ICON_MAP[ach.iconName] || Trophy;
          const progressPct = Math.min(100, Math.round((ach.currentProgress / ach.maxProgress) * 100));

          return (
            <div
              key={ach.id}
              className={`p-5 rounded-3xl border transition-all ${
                ach.unlocked
                  ? "bg-white border-slate-200 shadow-xs hover:shadow-md hover:border-sky-300"
                  : "bg-slate-50/70 border-slate-200 opacity-75"
              }`}
            >
              {/* Badge Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-xs ${
                      ach.unlocked
                        ? ach.badgeColor
                        : "bg-slate-200 text-slate-400 border-slate-300"
                    }`}
                  >
                    {ach.unlocked ? <Icon className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{ach.title}</h4>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {ach.tier}
                    </span>
                  </div>
                </div>

                {ach.unlocked && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4">
                {ach.description}
              </p>

              {/* Progress Bar & Status */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                  <span>Progress</span>
                  <span>
                    {ach.currentProgress} / {ach.maxProgress} {ach.unit}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      ach.unlocked ? "bg-emerald-500" : "bg-sky-500"
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
