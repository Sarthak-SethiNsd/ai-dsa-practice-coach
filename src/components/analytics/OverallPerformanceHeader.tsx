"use client";

import * as React from "react";
import { OverallPerformanceMetrics } from "@/services/analytics/performanceAnalyticsTypes";
import { CheckCircle2, Cpu, Flame, TrendingUp, Calendar, Zap, Award } from "lucide-react";

interface OverallPerformanceHeaderProps {
  metrics: OverallPerformanceMetrics;
}

export function OverallPerformanceHeader({ metrics }: OverallPerformanceHeaderProps) {
  const cards = [
    {
      title: "Total Problems Solved",
      value: metrics.totalProblemsSolved.toLocaleString(),
      subtext: "Across all platforms",
      icon: CheckCircle2,
      color: "bg-sky-50 text-sky-600 border-sky-100",
      accent: "text-sky-600",
    },
    {
      title: "AI Reviews Completed",
      value: metrics.totalReviewsCompleted.toLocaleString(),
      subtext: "Code reviews & feedback",
      icon: Cpu,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
      accent: "text-indigo-600",
    },
    {
      title: "Current Practice Streak",
      value: `${metrics.currentStreak} Days`,
      subtext: `Longest streak: ${metrics.longestStreak} days`,
      icon: Flame,
      color: "bg-amber-50 text-amber-600 border-amber-100",
      accent: "text-amber-600",
    },
    {
      title: "Overall Readiness Score",
      value: `${metrics.currentReadinessScore} / 100`,
      subtext: `${metrics.overallImprovementPercentage >= 0 ? "+" : ""}${metrics.overallImprovementPercentage}% overall growth`,
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      accent: "text-emerald-600",
    },
    {
      title: "Weekly Activity Score",
      value: `${metrics.weeklyActivityScore}%`,
      subtext: "7-day momentum index",
      icon: Zap,
      color: "bg-cyan-50 text-cyan-600 border-cyan-100",
      accent: "text-cyan-600",
    },
    {
      title: "Monthly Consistency",
      value: `${metrics.monthlyConsistencyScore}%`,
      subtext: "30-day active day coverage",
      icon: Calendar,
      color: "bg-purple-50 text-purple-600 border-purple-100",
      accent: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Award className="w-5 h-5 text-sky-600" /> Executive Performance Overview
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time intelligence aggregated across AI reviews, recommendations, practice sessions, and roadmap milestones.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-500 line-clamp-1">{c.title}</span>
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center border shrink-0 ${c.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="mt-3">
                <p className={`text-xl font-black ${c.accent} tracking-tight`}>{c.value}</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5 truncate">{c.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
