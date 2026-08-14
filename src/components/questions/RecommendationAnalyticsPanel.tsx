"use client";

import * as React from "react";
import { BarChart3, CheckCircle2, XCircle, Minus, Target } from "lucide-react";
import { QuestionAnalytics } from "@/services/questionRecommendationTypes";

interface RecommendationAnalyticsPanelProps {
  analytics: QuestionAnalytics;
}

export function RecommendationAnalyticsPanel({ analytics }: RecommendationAnalyticsPanelProps) {
  return (
    <section className="recommendation-analytics border border-slate-200/80 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-violet-100 text-violet-600">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Recommendation Analytics</h3>
          <p className="text-xs text-slate-500">Track recommendation precision and solve performance</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Accuracy Score</span>
            <Target className="w-4 h-4 text-violet-500" />
          </div>
          <p className="text-2xl font-bold text-violet-600">{analytics.recommendationAccuracy}%</p>
          <p className="text-[11px] text-slate-400 mt-1">Relevance match rate</p>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
          <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold mb-1">
            <span>Solved Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600">{analytics.successRate}%</p>
          <p className="text-[11px] text-slate-500 mt-1">{analytics.solvedRecommendations} solved</p>
        </div>

        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100">
          <div className="flex items-center justify-between text-xs text-amber-700 font-semibold mb-1">
            <span>Skipped</span>
            <XCircle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{analytics.skippedRecommendations}</p>
          <p className="text-[11px] text-slate-500 mt-1">Bypassed questions</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Ignored / Pending</span>
            <Minus className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-700">{analytics.ignoredRecommendations}</p>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting practice</p>
        </div>
      </div>

      {/* Most Recommended Topics */}
      {analytics.mostRecommendedTopics.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Topic Distribution in Current Batch
          </h4>
          <div className="flex flex-col gap-2.5">
            {analytics.mostRecommendedTopics.map((item) => {
              const pct = Math.round((item.count / (analytics.totalRecommended || 1)) * 100);

              return (
                <div key={item.topic} className="flex items-center gap-3 text-xs">
                  <span className="font-semibold text-slate-700 w-36 truncate">{item.topic}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-bold text-slate-600 w-12 text-right">{item.count} q&apos;s</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
