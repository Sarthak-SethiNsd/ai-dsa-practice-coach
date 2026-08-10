"use client";

import * as React from "react";
import { ReadinessScores, ReadinessScoreDetail } from "@/services/recommendationTypes";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Gauge, Cpu, ShieldAlert, MessageSquare, Flame, Code } from "lucide-react";

interface ReadinessScoresGridProps {
  scores: ReadinessScores;
}

export function ReadinessScoresGrid({ scores }: ReadinessScoresGridProps) {
  const categories: { key: keyof Omit<ReadinessScores, "overallScore">; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "problemSolving", icon: Code },
    { key: "optimization", icon: Cpu },
    { key: "edgeCases", icon: ShieldAlert },
    { key: "communication", icon: MessageSquare },
    { key: "consistency", icon: Flame },
  ];

  const statusBadgeVariant = (status: ReadinessScoreDetail["status"]) => {
    switch (status) {
      case "Excellent":
        return "success";
      case "Good":
        return "primary";
      case "Needs Improvement":
        return "warning";
      case "Critical":
        return "neutral";
    }
  };

  return (
    <Card className="border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <CardTitle className="text-slate-900 dark:text-white">Interview Readiness Index (0–100)</CardTitle>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Quantitative assessment of core software engineering interview dimensions
          </p>
        </div>

        <div className="flex items-center gap-2 bg-sky-50 dark:bg-sky-950/50 px-4 py-2 rounded-2xl border border-sky-100 dark:border-sky-900/50 shrink-0">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Composite Readiness:</span>
          <span className="text-xl font-extrabold text-sky-600 dark:text-sky-400">{scores.overallScore} / 100</span>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map(({ key, icon: Icon }) => {
            const detail: ReadinessScoreDetail = scores[key];
            return (
              <div
                key={key}
                className="bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs border border-slate-200/60 dark:border-slate-700">
                      <Icon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{detail.label}</span>
                  </div>

                  <Badge variant={statusBadgeVariant(detail.status)} className="text-[11px] font-bold">
                    {detail.status}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <ProgressBar completed={detail.score} total={100} height={8} />
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
                    <span>Dimension Score</span>
                    <span className="text-slate-900 dark:text-white font-extrabold">{detail.score} pts</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/40 dark:border-slate-700/40 leading-relaxed">
                  {detail.keyFactor}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
