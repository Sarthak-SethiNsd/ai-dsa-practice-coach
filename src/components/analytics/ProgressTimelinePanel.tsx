"use client";

import * as React from "react";
import { ProgressTimeline, TimelinePoint } from "@/services/analytics/performanceAnalyticsTypes";
import { History, Calendar, CheckCircle2, Cpu, Flame, TrendingUp } from "lucide-react";

interface ProgressTimelinePanelProps {
  timeline: ProgressTimeline;
}

export function ProgressTimelinePanel({ timeline }: ProgressTimelinePanelProps) {
  const [period, setPeriod] = React.useState<"daily" | "weekly" | "monthly">("daily");

  const currentPoints: TimelinePoint[] = timeline[period];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-sky-600" /> Historical Progress Timeline
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Track daily, weekly, and monthly growth trends for solved problems, AI reviews, readiness, and streaks.
          </p>
        </div>

        {/* View Period Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {(["daily", "weekly", "monthly"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold capitalize transition-all cursor-pointer ${
                period === p ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Table / Card List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 px-3">Period</th>
              <th className="py-2.5 px-3">Problems Solved</th>
              <th className="py-2.5 px-3">AI Reviews</th>
              <th className="py-2.5 px-3">Topics Improved</th>
              <th className="py-2.5 px-3">Readiness Score</th>
              <th className="py-2.5 px-3 text-right">Streak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
            {currentPoints.map((pt) => (
              <tr key={pt.date} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-3 font-extrabold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> {pt.label}
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1.5 text-sky-700 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" /> {pt.questionsSolved}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1.5 text-indigo-700 font-bold">
                    <Cpu className="w-3.5 h-3.5 text-indigo-500" /> {pt.reviewsCompleted}
                  </span>
                </td>
                <td className="py-3 px-3 font-bold text-slate-800">
                  +{pt.topicsImprovedCount} topics
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-extrabold">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> {pt.readinessScore} pts
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <span className="inline-flex items-center gap-1 text-amber-700 font-extrabold">
                    <Flame className="w-3.5 h-3.5 text-amber-500" /> {pt.streak}d
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
