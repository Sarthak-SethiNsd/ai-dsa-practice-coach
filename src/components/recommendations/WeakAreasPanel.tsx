"use client";

import * as React from "react";
import { WeakTopicAnalysis } from "@/services/recommendationTypes";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AlertTriangle, TrendingUp, Clock, Target, CheckCircle2 } from "lucide-react";

interface WeakAreasPanelProps {
  analysis: WeakTopicAnalysis;
}

export function WeakAreasPanel({ analysis }: WeakAreasPanelProps) {
  const {
    weakestTopic,
    secondWeakestTopic,
    mostImprovedTopic,
    mostNeglectedTopic,
    confidenceScore,
  } = analysis;

  return (
    <Card className="border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <CardTitle className="text-slate-900 dark:text-white">Weak Topic Detection & Mastery</CardTitle>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Algorithmic topic classification based on review scores, mistake density, and practice intervals
          </p>
        </div>

        {/* Confidence Score Badge */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shrink-0">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Engine Confidence: <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{confidenceScore}%</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Weakest Topic */}
          <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  Weakest Topic
                </span>
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {weakestTopic ? weakestTopic.name : "None identified"}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-3">
                {weakestTopic ? weakestTopic.reason : "Insufficient review history available."}
              </p>
            </div>
            {weakestTopic && (
              <div className="pt-2 border-t border-rose-100 dark:border-rose-900/30 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg Score</span>
                <Badge variant="warning" className="bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 border-none font-bold">
                  {weakestTopic.score}%
                </Badge>
              </div>
            )}
          </div>

          {/* 2. Second Weakest Topic */}
          <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  2nd Weakest Topic
                </span>
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {secondWeakestTopic ? secondWeakestTopic.name : "None identified"}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-3">
                {secondWeakestTopic ? secondWeakestTopic.reason : "Reinforce secondary weak topics."}
              </p>
            </div>
            {secondWeakestTopic && (
              <div className="pt-2 border-t border-amber-100 dark:border-amber-900/30 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Avg Score</span>
                <Badge variant="warning" className="bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-none font-bold">
                  {secondWeakestTopic.score}%
                </Badge>
              </div>
            )}
          </div>

          {/* 3. Most Improved Topic */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Most Improved
                </span>
                <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {mostImprovedTopic ? mostImprovedTopic.name : "N/A"}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-3">
                {mostImprovedTopic ? mostImprovedTopic.reason : "Track performance gains across sessions."}
              </p>
            </div>
            {mostImprovedTopic && (
              <div className="pt-2 border-t border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Score Delta</span>
                <Badge variant="success" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-none font-bold">
                  +{mostImprovedTopic.scoreDelta} pts
                </Badge>
              </div>
            )}
          </div>

          {/* 4. Most Neglected Topic */}
          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Most Neglected
                </span>
                <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {mostNeglectedTopic ? mostNeglectedTopic.name : "None"}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-3">
                {mostNeglectedTopic ? mostNeglectedTopic.reason : "Revisit topics regularly to prevent skill decay."}
              </p>
            </div>
            {mostNeglectedTopic && (
              <div className="pt-2 border-t border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Days Idle</span>
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border-none font-bold">
                  {mostNeglectedTopic.daysSinceReview} days
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
