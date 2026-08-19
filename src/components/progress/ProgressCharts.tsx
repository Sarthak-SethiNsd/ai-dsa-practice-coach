"use client";

import * as React from "react";
import { ProgressReportData } from "@/services/progress/progressTypes";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";

interface ProgressChartsProps {
  report: ProgressReportData;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "#10b981", // emerald-500
  Medium: "#f59e0b", // amber-500
  Hard: "#ef4444", // red-500
};

export function ProgressCharts({ report }: ProgressChartsProps) {
  const p = report.privacy;

  // 1. Difficulty distribution pie data
  const difficultyData = [
    { name: "Easy", value: report.problemSolving.byDifficulty.Easy, color: DIFFICULTY_COLORS.Easy },
    { name: "Medium", value: report.problemSolving.byDifficulty.Medium, color: DIFFICULTY_COLORS.Medium },
    { name: "Hard", value: report.problemSolving.byDifficulty.Hard, color: DIFFICULTY_COLORS.Hard },
  ].filter((d) => d.value > 0);

  // 2. Activity trend data
  const activityData = report.problemSolving.dailyActivity.map((a) => ({
    date: a.date.slice(5), // MM-DD
    solved: a.count,
  }));

  // 3. Topic mastery bar data
  const topicData = report.topics.topTopics.map((t) => ({
    topic: t.topic,
    solved: t.solvedCount,
    quality: t.qualityScore,
  }));

  // 4. Contest rating trend
  const ratingData = report.contests.ratingHistory.map((r) => ({
    contest: r.contestName.length > 15 ? r.contestName.slice(0, 14) + "…" : r.contestName,
    rating: r.ratingAfter,
    delta: r.delta,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Problem Solving Activity Over Time */}
      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 mb-1">Problem Solving Activity</h4>
        <p className="text-xs text-slate-500 mb-4">Daily solved problem count across the selected period</p>
        <div className="h-64 w-full">
          {activityData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No daily problem activity recorded in this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorSolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
                />
                <Area type="monotone" dataKey="solved" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSolved)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Difficulty Distribution */}
      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 mb-1">Difficulty Distribution</h4>
        <p className="text-xs text-slate-500 mb-4">Proportion of Easy, Medium, and Hard challenges</p>
        <div className="h-64 w-full">
          {difficultyData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No difficulty metrics available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {difficultyData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 3. Core Topic Mastery (if permitted) */}
      {p.showTopicStats && (
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 mb-1">Topic Performance & Solved Volume</h4>
          <p className="text-xs text-slate-500 mb-4">Solved count by primary DSA topic</p>
          <div className="h-64 w-full">
            {topicData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No topic data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicData}>
                  <XAxis dataKey="topic" stroke="#94a3b8" fontSize={10} angle={-15} textAnchor="end" height={40} />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
                  />
                  <Bar dataKey="solved" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="Solved Count" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* 4. Contest Rating Progression (if permitted) */}
      {p.showRatings && p.showContests && (
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-xs">
          <h4 className="text-sm font-bold text-slate-900 mb-1">Contest Rating Progression</h4>
          <p className="text-xs text-slate-500 mb-4">Rating change across competitive programming contests</p>
          <div className="h-64 w-full">
            {ratingData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No contest rating history in this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ratingData}>
                  <XAxis dataKey="contest" stroke="#94a3b8" fontSize={10} angle={-15} textAnchor="end" height={40} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={["dataMin - 50", "dataMax + 50"]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none", color: "#fff", fontSize: "12px" }}
                  />
                  <Line type="monotone" dataKey="rating" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: "#6366f1" }} name="Rating" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
