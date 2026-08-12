"use client";

import * as React from "react";
import { Target, RefreshCw, Zap, Award, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RecommendationBatch, QuestionAnalytics } from "@/services/questionRecommendationTypes";

interface QuestionRecommendationOverviewProps {
  batch: RecommendationBatch | null;
  analytics: QuestionAnalytics;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
}

export function QuestionRecommendationOverview({
  batch,
  analytics,
  refreshing,
  onRefresh,
}: QuestionRecommendationOverviewProps) {
  const generatedAt = batch
    ? new Date(batch.generatedAt).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <section className="questions-overview border border-slate-200/80 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-200">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Recommended Questions</h2>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700">
                <Sparkles className="w-3 h-3" />
                AI Matched
              </span>
            </div>
            {batch && (
              <p className="text-xs text-slate-500 mt-0.5">
                Targeting: <span className="font-semibold text-slate-700">{batch.targetGoal}</span> · Generated {generatedAt}
              </p>
            )}
          </div>
        </div>

        <Button
          variant="primary"
          onClick={onRefresh}
          disabled={refreshing}
          className="gap-2 shrink-0 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Generating..." : "Refresh Questions"}
        </Button>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-violet-50/80 border border-violet-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-violet-700 font-semibold mb-1">
            <span>Accuracy Score</span>
            <Sparkles className="w-4 h-4 text-violet-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{analytics.recommendationAccuracy}%</p>
          <p className="text-[11px] text-slate-500 mt-1">Based on topic match & readiness</p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold mb-1">
            <span>Success Rate</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{analytics.successRate}%</p>
          <p className="text-[11px] text-slate-500 mt-1">{analytics.solvedRecommendations} / {analytics.totalRecommended} solved</p>
        </div>

        <div className="p-4 rounded-xl bg-sky-50/80 border border-sky-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-sky-700 font-semibold mb-1">
            <span>Readiness Score</span>
            <Zap className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{batch?.readinessScore ?? "—"}</p>
          <p className="text-[11px] text-slate-500 mt-1">Overall readiness index</p>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-100 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-amber-700 font-semibold mb-1">
            <span>Focus Topics</span>
            <Target className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 truncate">
            {batch?.sourceTopics.slice(0, 2).join(", ") || "Arrays, DP"}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">{batch?.sourceTopics.length ?? 0} active topic targets</p>
        </div>
      </div>

      {/* Target topics tags */}
      {batch && batch.sourceTopics.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Active Priority Topics:</span>
          {batch.sourceTopics.map((topic) => (
            <span
              key={topic}
              className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60"
            >
              {topic}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
