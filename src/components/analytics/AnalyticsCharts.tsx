"use client";

import * as React from "react";
import { FullPerformanceAnalytics } from "@/services/analytics/performanceAnalyticsTypes";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { BarChart2, PieChart as PieIcon, TrendingUp, Zap } from "lucide-react";

interface AnalyticsChartsProps {
  analytics: FullPerformanceAnalytics;
}

const PIE_COLORS = ["#0284c7", "#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

export function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  const solvedTimeline = analytics.timeline.daily.map((d) => ({
    date: d.label,
    solved: d.questionsSolved,
    reviews: d.reviewsCompleted,
  }));

  const topicChartData = analytics.topicMastery.topics.slice(0, 8).map((t) => ({
    name: t.topic.length > 12 ? `${t.topic.substring(0, 10)}...` : t.topic,
    completion: t.completionPercentage,
    quality: t.reviewQualityScore,
  }));

  const platformPieData = [
    { name: "LeetCode", value: analytics.platforms.leetcode.solvedCount },
    { name: "Codeforces", value: analytics.platforms.codeforces.solvedCount },
  ].filter((p) => p.value > 0);

  if (platformPieData.length === 0) {
    platformPieData.push({ name: "LeetCode", value: 1 });
  }

  const readinessTrendData = analytics.overall.readinessScoreTrend;

  const consistencyData = analytics.timeline.daily.slice(7).map((d) => ({
    day: d.label,
    score: d.questionsSolved > 0 ? 100 : 0,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-sky-600" /> Interactive Performance Visualizations
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Visual analytics charts for problem solving velocity, topic mastery, platform distribution, review frequency, and readiness trend.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Solved Problems Over Time */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" /> Daily Solved Velocity
            </h4>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={solvedTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="solvedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  formatter={(val) => [`${val ?? 0} problems`, "Solved"]}
                />
                <Area type="monotone" dataKey="solved" stroke="#0284c7" strokeWidth={2.5} fill="url(#solvedGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Topic Mastery Progression */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Topic Completion %
            </h4>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  formatter={(val) => [`${val ?? 0}%`, "Completion"]}
                />
                <Bar dataKey="completion" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Platform Distribution */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-indigo-500" /> Platform Share
            </h4>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {platformPieData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px", color: "#fff", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Review Activity Trend */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-900">AI Review Submissions</h4>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={solvedTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  formatter={(val) => [`${val ?? 0} reviews`, "AI Reviews"]}
                />
                <Line type="monotone" dataKey="reviews" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Readiness Trend */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-900">Readiness Score Curve</h4>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={readinessTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  formatter={(val) => [`${val ?? 0} pts`, "Readiness Score"]}
                />
                <Line type="monotone" dataKey="score" stroke="#0284c7" strokeWidth={3} dot={{ r: 4, fill: "#0284c7" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Weekly Consistency */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-extrabold text-slate-900">7-Day Consistency Meter</h4>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consistencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b", borderRadius: "12px", color: "#fff", fontSize: "12px" }}
                  formatter={(val) => [`${val ?? 0}%`, "Active Day Status"]}
                />
                <Bar dataKey="score" fill="#ec4899" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
