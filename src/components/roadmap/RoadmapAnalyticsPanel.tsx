"use client";

import * as React from "react";
import {
  BarChart2,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Minus,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
} from "recharts";
import { RoadmapAnalytics, RoadmapProgress } from "@/services/roadmapTypes";

interface RoadmapAnalyticsPanelProps {
  analytics: RoadmapAnalytics;
  progress: RoadmapProgress;
}

export function RoadmapAnalyticsPanel({ analytics, progress }: RoadmapAnalyticsPanelProps) {
  return (
    <section className="roadmap-analytics">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600 shrink-0">
          <BarChart2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Progress Analytics</h3>
          <p className="text-xs text-slate-500">Track your solving momentum</p>
        </div>
      </div>

      {/* Highlights row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <HighlightCard
          icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
          label="Best Topic"
          value={analytics.strongestImprovement ?? "—"}
          bg="bg-emerald-50"
        />
        <HighlightCard
          icon={<TrendingDown className="w-4 h-4 text-red-400" />}
          label="Needs Work"
          value={analytics.weakestImprovement ?? "—"}
          bg="bg-red-50"
        />
        <HighlightCard
          icon={<Award className="w-4 h-4 text-amber-500" />}
          label="Most Solved"
          value={analytics.mostSolvedTopic ?? "—"}
          bg="bg-amber-50"
        />
        <HighlightCard
          icon={<Target className="w-4 h-4 text-violet-500" />}
          label="+Readiness"
          value={`+${analytics.estimatedReadinessIncrease} pts`}
          bg="bg-violet-50"
        />
      </div>

      {/* Completion trend chart */}
      {analytics.completionTrend.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Completion Trend
          </p>
          <div className="bg-white border border-slate-100 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={analytics.completionTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="roadmapGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickFormatter={(v) => {
                    const d = new Date(v);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  }}
                />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                  labelFormatter={(l) => `Date: ${l}`}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeCompleted"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#roadmapGrad)"
                  name="Cumulative Solved"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Topic breakdown bar chart */}
      {analytics.topicBreakdown.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
            Completion by Topic (%)
          </p>
          <div className="bg-white border border-slate-100 rounded-xl p-4">
            <ResponsiveContainer width="100%" height={150}>
              <BarChart
                data={analytics.topicBreakdown}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 40, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} unit="%" />
                <YAxis
                  dataKey="topic"
                  type="category"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  width={65}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                  formatter={(value) => [`${value as number}%`, "Completion"]}
                />
                <Bar dataKey="completionRate" radius={[0, 4, 4, 0]} name="Completion %">
                  {analytics.topicBreakdown.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={entry.completionRate >= 70 ? "#10b981" : entry.completionRate >= 40 ? "#f59e0b" : "#ef4444"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Difficulty distribution */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Difficulty Distribution
        </p>
        <div className="grid grid-cols-3 gap-3">
          <DiffCell label="Easy" count={analytics.difficultyBreakdown.easy} color="emerald" />
          <DiffCell label="Medium" count={analytics.difficultyBreakdown.medium} color="amber" />
          <DiffCell label="Hard" count={analytics.difficultyBreakdown.hard} color="red" />
        </div>
      </div>

      {/* Consistency */}
      <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
        <Minus className="w-3.5 h-3.5" />
        Consistency score:{" "}
        <span className="font-bold text-slate-800">{progress.consistencyScore}%</span> · Avg
        difficulty:{" "}
        <span className="font-bold text-slate-800">{progress.averageDifficulty}</span>
      </div>
    </section>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HighlightCard({
  icon,
  label,
  value,
  bg,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-3`}>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-[11px] font-medium text-slate-500">{label}</span>
      </div>
      <p className="text-sm font-bold text-slate-800 truncate">{value}</p>
    </div>
  );
}

function DiffCell({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: "emerald" | "amber" | "red";
}) {
  const cls = {
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-500",
  }[color];

  return (
    <div className={`${cls} rounded-xl p-3 text-center`}>
      <p className="text-xl font-bold">{count}</p>
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
    </div>
  );
}
