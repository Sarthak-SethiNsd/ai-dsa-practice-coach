"use client";

import * as React from "react";
import { ImprovementAnalytics } from "@/services/dashboardTypes";
import {
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  ArrowUpRight,
} from "lucide-react";

interface ImprovementPanelProps {
  improvements: ImprovementAnalytics;
}

export function ImprovementPanel({ improvements }: ImprovementPanelProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
          <TrendingUp className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">
            Improvement Analytics &amp; Key Insights
          </h3>
          <p className="text-[11px] text-slate-400">
            Automated analysis of your coding trends, weak spots, and targeted focus areas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Overall Improvement */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Overall Score Growth</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {improvements.scoreImprovementPct >= 0 ? "+" : ""}
            {improvements.scoreImprovementPct}%
          </p>
          <p className="text-[11px] text-slate-400">
            Comparison between early and recent reviews
          </p>
        </div>

        {/* Metric 2: Last 7 Trend */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Last 7 Reviews Trend</span>
            <TrendingUp className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-black text-slate-900">
            {improvements.avgImprovementLast7 >= 0 ? "+" : ""}
            {improvements.avgImprovementLast7} pts
          </p>
          <p className="text-[11px] text-slate-400">
            Net score momentum over your last 7 submissions
          </p>
        </div>

        {/* Metric 3: Most Improved Category */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Top Performing Category</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-lg font-extrabold text-slate-900 truncate">
            {improvements.mostImprovedCategory}
          </p>
          <p className="text-[11px] text-slate-400">
            Highest average AI quality category
          </p>
        </div>
      </div>

      {/* Topics & Repeated Mistakes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        {/* Strongest Topics */}
        <div className="space-y-2 border border-slate-100 bg-emerald-50/30 p-3.5 rounded-xl">
          <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Strongest Topics
          </h4>
          {improvements.strongestTopics.length > 0 ? (
            <ul className="space-y-1">
              {improvements.strongestTopics.map((t, idx) => (
                <li key={idx} className="text-xs text-slate-700 font-medium truncate">
                  • {t}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">No data available yet.</p>
          )}
        </div>

        {/* Weakest Topics */}
        <div className="space-y-2 border border-slate-100 bg-rose-50/30 p-3.5 rounded-xl">
          <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Areas Needing Work
          </h4>
          {improvements.weakestTopics.length > 0 ? (
            <ul className="space-y-1">
              {improvements.weakestTopics.map((t, idx) => (
                <li key={idx} className="text-xs text-slate-700 font-medium truncate">
                  • {t}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">No data available yet.</p>
          )}
        </div>

        {/* Frequently Repeated Mistakes */}
        <div className="space-y-2 border border-slate-100 bg-amber-50/30 p-3.5 rounded-xl">
          <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" /> Repeated Fix Patterns
          </h4>
          {improvements.frequentlyRepeatedMistakes.length > 0 ? (
            <ul className="space-y-1">
              {improvements.frequentlyRepeatedMistakes.map((m, idx) => (
                <li key={idx} className="text-xs text-slate-700 font-medium line-clamp-1">
                  • {m}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">No common patterns flagged.</p>
          )}
        </div>
      </div>

      {/* Suggested Focus Area */}
      <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200/80 flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-extrabold text-sky-900">
            Suggested Next Focus Area
          </h4>
          <p className="text-xs text-sky-800 font-medium leading-relaxed">
            {improvements.suggestedNextFocus}
          </p>
        </div>
      </div>
    </div>
  );
}
