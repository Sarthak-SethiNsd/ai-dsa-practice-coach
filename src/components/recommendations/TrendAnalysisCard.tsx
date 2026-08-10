"use client";

import * as React from "react";
import { TrendAnalysisMetrics } from "@/services/recommendationTypes";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { TrendingUp, TrendingDown, Activity, Zap } from "lucide-react";

interface TrendAnalysisCardProps {
  metrics: TrendAnalysisMetrics;
}

export function TrendAnalysisCard({ metrics }: TrendAnalysisCardProps) {
  const {
    trend7Day,
    trend30Day,
    improvementPercentage,
    declinePercentage,
    scoreVelocity,
    totalReviewsAnalyzed,
  } = metrics;

  return (
    <Card className="border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
      <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          <CardTitle className="text-slate-900 dark:text-white">Trend Analysis & Score Velocity</CardTitle>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Rolling review performance metrics across short-term and long-term practice windows
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 7-Review Rolling Average */}
          <div className="bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-semibold text-sky-700 dark:text-sky-300">7-Review Score Average</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{trend7Day} pts</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Last 7 reviews</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Short-term quality score snapshot.</p>
          </div>

          {/* 30-Review Rolling Average */}
          <div className="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">30-Review Score Average</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{trend30Day} pts</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Last 30 reviews</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Baseline macro quality score.</p>
          </div>

          {/* Improvement vs Decline Percentage */}
          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Performance Delta</span>
            <div className="flex items-center justify-between">
              {improvementPercentage > 0 ? (
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold text-2xl">
                  <TrendingUp className="w-6 h-6" />
                  <span>+{improvementPercentage}%</span>
                </div>
              ) : declinePercentage > 0 ? (
                <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-extrabold text-2xl">
                  <TrendingDown className="w-6 h-6" />
                  <span>-{declinePercentage}%</span>
                </div>
              ) : (
                <span className="text-2xl font-extrabold text-slate-700 dark:text-slate-300">Stable</span>
              )}
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Trajectory</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {improvementPercentage > 0 ? "Gains across recent submissions" : "Consistent baseline score"}
            </p>
          </div>

          {/* Score Velocity */}
          <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-2xl p-4 space-y-2">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">Score Momentum</span>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-extrabold text-2xl">
                <Zap className="w-5 h-5 fill-amber-500" />
                <span>{scoreVelocity > 0 ? `+${scoreVelocity}` : scoreVelocity} pts</span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Velocity</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Calculated over {totalReviewsAnalyzed} review(s).
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
