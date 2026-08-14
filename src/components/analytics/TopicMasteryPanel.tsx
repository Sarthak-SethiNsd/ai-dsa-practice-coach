"use client";

import * as React from "react";
import { TopicMasteryDetail, MasteryTier } from "@/services/analytics/performanceAnalyticsTypes";
import { BookOpen, TrendingUp, AlertCircle } from "lucide-react";

interface TopicMasteryPanelProps {
  topics: TopicMasteryDetail[];
  strongestTopics: TopicMasteryDetail[];
  weakestTopics: TopicMasteryDetail[];
  masteryDistribution: Record<MasteryTier, number>;
}

const TIER_COLORS: Record<MasteryTier, { bg: string; text: string; border: string }> = {
  Mastered: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  Advanced: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  Intermediate: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  Developing: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Beginner: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
};

export function TopicMasteryPanel({
  topics,
  strongestTopics,
  weakestTopics,
  masteryDistribution,
}: TopicMasteryPanelProps) {
  const [filterTier, setFilterTier] = React.useState<string>("all");
  const [search, setSearch] = React.useState<string>("");

  const filteredTopics = React.useMemo(() => {
    return topics.filter((t) => {
      const matchSearch = t.topic.toLowerCase().includes(search.toLowerCase());
      const matchTier = filterTier === "all" || t.masteryLevel === filterTier;
      return matchSearch && matchTier;
    });
  }, [topics, search, filterTier]);

  return (
    <div className="space-y-6">
      {/* Header & Tier Summary Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sky-600" /> Topic Mastery Intelligence
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Comprehensive breakdown of proficiency, completion percentage, AI review quality, and difficulty tier for each DSA topic.
            </p>
          </div>
        </div>

        {/* Tier Count Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(["Mastered", "Advanced", "Intermediate", "Developing", "Beginner"] as MasteryTier[]).map((tier) => {
            const style = TIER_COLORS[tier];
            const count = masteryDistribution[tier] || 0;
            return (
              <button
                key={tier}
                type="button"
                onClick={() => setFilterTier(filterTier === tier ? "all" : tier)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${style.bg} ${style.border} ${
                  filterTier === tier ? "ring-2 ring-sky-500 shadow-xs" : "hover:opacity-90"
                }`}
              >
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{tier}</p>
                <p className={`text-xl font-black mt-1 ${style.text}`}>{count} <span className="text-xs font-semibold">topics</span></p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Strongest vs Weakest Highlight Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strongest */}
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Top Strongest Topics
          </div>
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {strongestTopics.map((t) => (
              <div key={t.topic} className="bg-white border border-emerald-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs flex items-center gap-2">
                <span>{t.topic}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">{t.completionPercentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weakest */}
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600" /> Focus Improvement Needed
          </div>
          <div className="flex items-center gap-2 flex-wrap pt-1">
            {weakestTopics.map((t) => (
              <div key={t.topic} className="bg-white border border-amber-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs flex items-center gap-2">
                <span>{t.topic}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-extrabold">{t.completionPercentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <input
            type="text"
            placeholder="Search topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 px-3.5 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Showing {filteredTopics.length} of {topics.length} topics</span>
          </div>
        </div>

        {/* Topic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTopics.map((t) => {
            const tierStyle = TIER_COLORS[t.masteryLevel];
            return (
              <div key={t.topic} className="border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 rounded-xl p-3.5 transition-all space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{t.topic}</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Avg Difficulty: {t.avgDifficulty}</p>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
                    {t.masteryLevel}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600">
                    <span>Completion</span>
                    <span>{t.completionPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-600 h-full transition-all duration-300"
                      style={{ width: `${t.completionPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Stats Chips */}
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-1 border-t border-slate-100">
                  <span>Solved: <strong className="text-slate-800">{t.solvedCount}</strong></span>
                  <span>Review Quality: <strong className="text-emerald-700">{t.reviewQualityScore} pts</strong></span>
                  <span>Reviews: <strong className="text-indigo-700">{t.totalReviews}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
