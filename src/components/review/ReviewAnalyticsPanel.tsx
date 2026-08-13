"use client";

import * as React from "react";
import { BarChart2, Layers, CheckCircle2, RefreshCw, Award } from "lucide-react";
import { ReviewHistoryEntry } from "@/services/ai/aiTypes";

interface ReviewAnalyticsPanelProps {
  entries: ReviewHistoryEntry[];
}

export function ReviewAnalyticsPanel({ entries }: ReviewAnalyticsPanelProps) {
  const totalReviews = entries.length;

  const categoryBreakdown = React.useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach((e) => {
      const cat = e.category || "FULL_CODE_REVIEW";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([cat, count]) => ({ cat, count }));
  }, [entries]);

  const languageBreakdown = React.useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach((e) => {
      const lang = e.language || "Java";
      counts[lang] = (counts[lang] || 0) + 1;
    });
    return Object.entries(counts).map(([lang, count]) => ({ lang, count }));
  }, [entries]);

  if (totalReviews === 0) return null;

  return (
    <div className="review-analytics-panel border border-slate-200/80 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-100 text-violet-600">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Review Analytics & History Trends</h3>
            <p className="text-xs text-slate-500">Historical performance metrics across submitted solution reviews</p>
          </div>
        </div>

        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700">
          {totalReviews} Completed Reviews
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Review Categories Distribution */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">
            Review Mode Distribution
          </h4>
          <div className="flex flex-col gap-2">
            {categoryBreakdown.map(({ cat, count }) => {
              const pct = Math.round((count / (totalReviews || 1)) * 100);

              return (
                <div key={cat} className="flex items-center gap-3 text-xs">
                  <span className="font-semibold text-slate-700 w-36 truncate">{cat}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-bold text-slate-600 w-10 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Programming Languages Distribution */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide">
            Programming Languages Reviewed
          </h4>
          <div className="flex flex-col gap-2">
            {languageBreakdown.map(({ lang, count }) => {
              const pct = Math.round((count / (totalReviews || 1)) * 100);

              return (
                <div key={lang} className="flex items-center gap-3 text-xs">
                  <span className="font-semibold text-slate-700 w-36 truncate">
                    {lang} {lang === "Java" ? "(Primary)" : ""}
                  </span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-bold text-slate-600 w-10 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
