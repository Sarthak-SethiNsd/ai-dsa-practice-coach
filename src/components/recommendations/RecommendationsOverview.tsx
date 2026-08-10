"use client";

import * as React from "react";
import { Sparkles, RefreshCw, BookmarkPlus, History, Award } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface RecommendationsOverviewProps {
  overallScore: number;
  confidenceScore: number;
  totalReviewsAnalyzed: number;
  lastUpdated: string;
  isRefreshing?: boolean;
  onRefresh: () => void;
  onSaveSnapshot: () => void;
  onOpenHistory: () => void;
}

export function RecommendationsOverview({
  overallScore,
  confidenceScore,
  totalReviewsAnalyzed,
  lastUpdated,
  isRefreshing = false,
  onRefresh,
  onSaveSnapshot,
  onOpenHistory,
}: RecommendationsOverviewProps) {
  const formattedDate = new Date(lastUpdated).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 lg:p-8 text-white shadow-xl border border-sky-900/30">
      {/* Background Decorative Blur */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Title & Context */}
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Deterministic AI Recommendation Engine</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Personalized DSA Coach Recommendations
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Real-time actionable insights synthesized from your AI review scores, Big-O complexity mistakes, edge case analysis, and topic mastery history.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400 font-medium">
            <span>Last computed: <strong className="text-slate-200">{formattedDate}</strong></span>
            <span>•</span>
            <span>Analyzed: <strong className="text-slate-200">{totalReviewsAnalyzed} review(s)</strong></span>
            <span>•</span>
            <span>Confidence: <strong className="text-emerald-400 font-bold">{confidenceScore}%</strong></span>
          </div>
        </div>

        {/* Right side: Overall Score Banner & Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4 shrink-0">
          {/* Readiness Score Card */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-sky-300" />
            </div>
            <div>
              <div className="text-xs text-slate-300 uppercase tracking-wider font-semibold">
                Overall Readiness
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-white">{overallScore}</span>
                <span className="text-xs font-bold text-sky-400">/ 100</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="bg-slate-800/80 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={onSaveSnapshot}
              className="bg-sky-900/40 hover:bg-sky-800/60 text-sky-200 border-sky-700/60 text-xs gap-1.5 cursor-pointer"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              <span>Save Snapshot</span>
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={onOpenHistory}
              className="bg-sky-500 hover:bg-sky-400 text-white text-xs gap-1.5 cursor-pointer shadow-md"
            >
              <History className="w-3.5 h-3.5" />
              <span>History & Compare</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
