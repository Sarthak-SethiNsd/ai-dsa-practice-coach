"use client";

import * as React from "react";
import {
  TopicContestPerformance,
  ImprovementTrend,
} from "@/services/contest/contestTypes";
import { TrendingUp, TrendingDown, Minus, Grid3X3 } from "lucide-react";

interface Props {
  topicMatrix: TopicContestPerformance[];
}

function TrendIcon({ trend }: { trend: ImprovementTrend }) {
  if (trend === "up")
    return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
  if (trend === "down")
    return <TrendingDown className="w-3.5 h-3.5 text-rose-500" />;
  return <Minus className="w-3.5 h-3.5 text-slate-400" />;
}

function DifficultyBadge({
  difficulty,
}: {
  difficulty: "Easy" | "Medium" | "Hard" | "None";
}) {
  const map: Record<string, string> = {
    Easy: "bg-emerald-100 text-emerald-700",
    Medium: "bg-amber-100 text-amber-700",
    Hard: "bg-rose-100 text-rose-700",
    None: "bg-slate-100 text-slate-500",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-bold ${map[difficulty]}`}
    >
      {difficulty}
    </span>
  );
}

function SuccessBar({ rate }: { rate: number }) {
  const color =
    rate >= 70
      ? "bg-emerald-500"
      : rate >= 45
      ? "bg-sky-500"
      : rate >= 25
      ? "bg-amber-500"
      : "bg-rose-400";

  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5">
      <div
        className={`h-1.5 rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${rate}%` }}
      />
    </div>
  );
}

export function TopicMatrixPanel({ topicMatrix }: Props) {
  const [sortBy, setSortBy] = React.useState<
    "successRate" | "appearances" | "contribution"
  >("successRate");

  const sorted = [...topicMatrix].sort((a, b) => {
    if (sortBy === "successRate") return b.successRate - a.successRate;
    if (sortBy === "appearances") return b.totalAppearances - a.totalAppearances;
    return b.contestContribution - a.contestContribution;
  });

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3">
        <Grid3X3 className="w-4 h-4 text-slate-400" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Sort by
        </span>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {(
            [
              { key: "successRate", label: "Success Rate" },
              { key: "appearances", label: "Appearances" },
              { key: "contribution", label: "Contribution" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSortBy(opt.key)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                sortBy === opt.key
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Topic Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sorted.map((topic) => (
          <div
            key={topic.topic}
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-shadow space-y-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-extrabold text-slate-800 leading-tight">
                {topic.topic}
              </span>
              <TrendIcon trend={topic.improvementTrend} />
            </div>

            {/* Success Rate */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400 font-medium">
                  Success Rate
                </span>
                <span
                  className={`text-xs font-extrabold tabular-nums ${
                    topic.successRate >= 70
                      ? "text-emerald-600"
                      : topic.successRate >= 45
                      ? "text-sky-600"
                      : topic.successRate >= 25
                      ? "text-amber-600"
                      : "text-rose-600"
                  }`}
                >
                  {topic.successRate}%
                </span>
              </div>
              <SuccessBar rate={topic.successRate} />
            </div>

            {/* Meta */}
            <div className="flex items-center justify-between">
              <DifficultyBadge difficulty={topic.avgDifficultySolved} />
              <span className="text-xs text-slate-400 font-medium">
                {topic.contestContribution}% contests
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{topic.totalAppearances} appearances</span>
              <span>{topic.solvedCount} solved</span>
            </div>

            {topic.totalAppearances === 0 && (
              <p className="text-xs text-slate-300 italic">
                Not yet attempted in contests
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
