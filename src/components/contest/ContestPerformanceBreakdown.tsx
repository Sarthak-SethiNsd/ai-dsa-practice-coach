"use client";

import * as React from "react";
import { ContestEntry } from "@/services/contest/contestTypes";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Target, Clock, AlertTriangle, Award, ChevronDown } from "lucide-react";

interface Props {
  entries: ContestEntry[];
}

function ContestScorecard({ entry }: { entry: ContestEntry }) {
  const breakdownData = [
    {
      name: "Easy Solved",
      value: entry.problemBreakdown.easySolved,
      color: "#10b981",
    },
    {
      name: "Medium Solved",
      value: entry.problemBreakdown.mediumSolved,
      color: "#f59e0b",
    },
    {
      name: "Hard Solved",
      value: entry.problemBreakdown.hardSolved,
      color: "#f43f5e",
    },
    {
      name: "Not Solved",
      value: Math.max(
        0,
        entry.totalProblems -
          entry.problemBreakdown.easySolved -
          entry.problemBreakdown.mediumSolved -
          entry.problemBreakdown.hardSolved
      ),
      color: "#e2e8f0",
    },
  ].filter((d) => d.value > 0);

  const scoreColor =
    entry.performanceScore >= 75
      ? "text-emerald-600"
      : entry.performanceScore >= 50
      ? "text-sky-600"
      : entry.performanceScore >= 30
      ? "text-amber-600"
      : "text-rose-600";

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-extrabold text-slate-800">{entry.contestName}</h4>
          <p className="text-xs text-slate-400 mt-0.5">{entry.date} · {entry.platform}</p>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-2xl font-black tabular-nums ${scoreColor}`}>
            {entry.performanceScore}
          </p>
          <p className="text-xs text-slate-400">Performance Score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Pie chart */}
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
            Problem Distribution
          </p>
          {breakdownData.length > 0 ? (
            <ResponsiveContainer width="100%" height={140}>
              <PieChart>
                <Pie
                  data={breakdownData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {breakdownData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    fontSize: "11px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-36 flex items-center justify-center text-slate-300 text-xs">
              No problem data
            </div>
          )}
          <div className="flex flex-wrap gap-2 mt-1">
            {breakdownData.map((d) => (
              <span
                key={d.name}
                className="flex items-center gap-1 text-xs font-medium text-slate-500"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: d.color }}
                />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-medium text-slate-600">Rank</span>
            </div>
            <span className="text-sm font-extrabold text-slate-800">
              #{entry.rank.toLocaleString()} / {entry.totalParticipants.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-slate-600">Rating Δ</span>
            </div>
            <span
              className={`text-sm font-extrabold ${
                entry.ratingChange >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {entry.ratingChange >= 0 ? "+" : ""}{entry.ratingChange}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-medium text-slate-600">Time Efficiency</span>
            </div>
            <span className="text-sm font-extrabold text-slate-800">
              {entry.problemBreakdown.timeEfficiencyScore}/100
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-medium text-slate-600">Penalty</span>
            </div>
            <span className="text-sm font-extrabold text-slate-800">
              {entry.problemBreakdown.penaltyMinutes} min
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ContestPerformanceBreakdown({ entries }: Props) {
  const [selectedId, setSelectedId] = React.useState<string>(
    entries[0]?.id ?? ""
  );

  const selected = entries.find((e) => e.id === selectedId);

  // Aggregate bar chart data across all entries
  const aggregateData = entries.slice(0, 10).map((e) => ({
    name: e.date.slice(5),
    Easy: e.problemBreakdown.easySolved,
    Medium: e.problemBreakdown.mediumSolved,
    Hard: e.problemBreakdown.hardSolved,
    Missed: e.problemBreakdown.missedOpportunities,
  }));

  return (
    <div className="space-y-6">
      {/* Contest Selector */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wide">
            Select Contest for Scorecard
          </h3>
        </div>
        <div className="relative">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all bg-white appearance-none pr-10 cursor-pointer"
          >
            {entries.map((e) => (
              <option key={e.id} value={e.id}>
                {e.contestName} — {e.date}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Scorecard */}
      {selected && <ContestScorecard entry={selected} />}

      {/* Aggregate Bar Chart */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-5">
          <Award className="w-4 h-4 text-violet-600" />
          <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wide">
            Problem Difficulty Solved — Last 10 Contests
          </h3>
        </div>
        {aggregateData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-300 text-sm">
            No contest data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={aggregateData}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="Easy" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Medium" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Hard" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
        <div className="flex gap-4 mt-3 flex-wrap">
          {[
            { label: "Easy", color: "#10b981" },
            { label: "Medium", color: "#f59e0b" },
            { label: "Hard", color: "#f43f5e" },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <span className="w-3 h-3 rounded" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
