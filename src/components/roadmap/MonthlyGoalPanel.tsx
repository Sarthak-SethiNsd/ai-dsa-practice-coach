"use client";

import * as React from "react";
import { CalendarRange, Target, TrendingUp, Star } from "lucide-react";
import { MonthlyGoal } from "@/services/roadmapTypes";

interface MonthlyGoalPanelProps {
  monthlyGoal: MonthlyGoal;
  completedTaskIds: Set<string>;
}

export function MonthlyGoalPanel({ monthlyGoal, completedTaskIds }: MonthlyGoalPanelProps) {
  const overallPct =
    monthlyGoal.totalQuestions > 0
      ? Math.round((monthlyGoal.completedQuestions / monthlyGoal.totalQuestions) * 100)
      : 0;

  const readinessPct =
    monthlyGoal.targetReadinessScore > 0
      ? Math.round((monthlyGoal.currentReadinessScore / monthlyGoal.targetReadinessScore) * 100)
      : 0;

  return (
    <section className="roadmap-monthly">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-100 text-violet-600 shrink-0">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Monthly Goal</h3>
            <p className="text-xs text-slate-500">{monthlyGoal.monthLabel}</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700">
          {overallPct}% complete
        </span>
      </div>

      {/* Objective */}
      <div className="mb-5 p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
        <div className="flex items-start gap-2">
          <Star className="w-4 h-4 text-violet-500 shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-slate-700">{monthlyGoal.improvementObjective}</p>
        </div>
      </div>

      {/* Readiness progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-violet-500" />
            <span className="text-xs font-semibold text-slate-600">Readiness Score</span>
          </div>
          <span className="text-xs text-slate-500">
            <span className="font-bold text-slate-800">{monthlyGoal.currentReadinessScore}</span>
            {" → "}
            <span className="font-bold text-violet-600">{monthlyGoal.targetReadinessScore}</span>
          </span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500"
            style={{ width: `${Math.min(100, readinessPct)}%` }}
          />
        </div>
      </div>

      {/* Question progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-600">Questions Solved</span>
          </div>
          <span className="text-xs text-slate-500">
            <span className="font-bold text-slate-800">{monthlyGoal.completedQuestions}</span>
            {" / "}
            <span className="font-bold text-slate-600">{monthlyGoal.totalQuestions}</span>
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
            style={{ width: `${Math.min(100, overallPct)}%` }}
          />
        </div>
      </div>

      {/* Mastery targets */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Topic Mastery Targets
        </p>
        <div className="flex flex-col gap-3">
          {monthlyGoal.masteryTargets.map((mt) => {
            const pct =
              mt.questionsNeeded > 0
                ? Math.min(100, Math.round((mt.questionsCompleted / mt.questionsNeeded) * 100))
                : 0;
            const currentColor = masteryColor(mt.currentMastery);
            const targetColor = masteryColor(mt.targetMastery);

            return (
              <div key={mt.topic} className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-800">{mt.topic}</span>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className={`font-semibold ${currentColor}`}>{mt.currentMastery}</span>
                    <span className="text-slate-400">→</span>
                    <span className={`font-semibold ${targetColor}`}>{mt.targetMastery}</span>
                  </div>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="h-full rounded-full bg-violet-400 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 text-right">
                  {mt.questionsCompleted}/{mt.questionsNeeded} problems to next level
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* void to suppress unused warning */}
      <span className="sr-only">{completedTaskIds.size}</span>
    </section>
  );
}

function masteryColor(mastery: string) {
  if (mastery === "Mastered") return "text-emerald-600";
  if (mastery === "Proficient") return "text-sky-600";
  if (mastery === "Developing") return "text-amber-600";
  return "text-red-500";
}
