"use client";

import * as React from "react";
import {
  TopicPerformance,
  ReadinessScores,
  TrendAnalysisMetrics,
  SmartActionCard,
} from "@/services/recommendationTypes";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { BarChart3, PieChart as PieIcon, LineChart as LineIcon, Activity } from "lucide-react";

interface RecommendationChartsProps {
  topicPerformance: TopicPerformance[];
  readinessScores: ReadinessScores;
  trendAnalysis: TrendAnalysisMetrics;
  actionCards: SmartActionCard[];
}

const COLORS = [
  "#0284c7", // sky-600
  "#10b981", // emerald-500
  "#6366f1", // indigo-500
  "#f59e0b", // amber-500
  "#f43f5e", // rose-500
  "#8b5cf6", // purple-500
  "#06b6d4", // cyan-500
  "#64748b", // slate-500
];

interface PieLabelEntry {
  name?: string;
  count?: number;
  value?: number;
  percentage?: number;
}

export function RecommendationCharts({
  topicPerformance,
  readinessScores,
  trendAnalysis,
  actionCards,
}: RecommendationChartsProps) {
  // 1. Topic Performance Data (Sort ascending for horizontal bar chart)
  const topicData = React.useMemo(() => {
    return topicPerformance
      .slice(0, 8)
      .map((t) => ({
        name: t.topic,
        score: t.avgScore,
        reviews: t.totalReviews,
      }))
      .sort((a, b) => b.score - a.score);
  }, [topicPerformance]);

  // 2. Score Improvement Trajectory Data (Simulated/projected timeline based on trend metrics)
  const trajectoryData = React.useMemo(() => {
    const baseline7 = trendAnalysis.trend7Day;
    const baseline30 = trendAnalysis.trend30Day;
    const targetScore = Math.min(98, readinessScores.overallScore + 15);

    return [
      { step: "Initial Base", score: Math.max(40, baseline30 - 10) },
      { step: "30-Day Avg", score: baseline30 },
      { step: "7-Day Avg", score: baseline7 },
      { step: "Current Index", score: readinessScores.overallScore },
      { step: "Target Horizon", score: targetScore },
    ];
  }, [trendAnalysis, readinessScores]);

  // 3. Review Consistency Breakdown (Readiness Dimension Scores)
  const consistencyData = React.useMemo(() => {
    return [
      { name: "Problem Solving", score: readinessScores.problemSolving.score },
      { name: "Optimization", score: readinessScores.optimization.score },
      { name: "Edge Cases", score: readinessScores.edgeCases.score },
      { name: "Communication", score: readinessScores.communication.score },
      { name: "Consistency", score: readinessScores.consistency.score },
    ];
  }, [readinessScores]);

  // 4. Recommendation Priorities Distribution
  const priorityDistribution = React.useMemo(() => {
    const counts = { High: 0, Medium: 0, Low: 0 };
    actionCards.forEach((c) => {
      if (counts[c.priority] !== undefined) {
        counts[c.priority]++;
      }
    });

    return [
      { name: "High Priority", value: counts.High || 1, fill: "#f43f5e" },
      { name: "Medium Priority", value: counts.Medium || 1, fill: "#f59e0b" },
      { name: "Low Priority", value: counts.Low || 1, fill: "#0284c7" },
    ];
  }, [actionCards]);

  return (
    <div className="space-y-6">
      {/* ROW 1: Topic Performance & Score Improvement Trajectory */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Topic Performance Chart */}
        <Card className="border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                Topic Performance Breakdown
              </CardTitle>
            </div>
            <span className="text-xs text-slate-400 font-medium">Avg Score %</span>
          </CardHeader>
          <CardContent className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={topicData}
                margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(val) => [`${val ?? 0}%`, "Accuracy Score"]}
                />
                <Bar dataKey="score" fill="#0284c7" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 2. Score Improvement Progression */}
        <Card className="border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <LineIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                Score Improvement Progression
              </CardTitle>
            </div>
            <span className="text-xs text-slate-400 font-medium">Trajectory (0-100)</span>
          </CardHeader>
          <CardContent className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreTrajectoryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="step" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(val) => [`${val ?? 0} pts`, "Readiness Level"]}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#scoreTrajectoryGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ROW 2: Dimension Consistency & Action Priorities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Dimension Scores Comparison */}
        <Card className="border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                Readiness Dimension Scores
              </CardTitle>
            </div>
            <span className="text-xs text-slate-400 font-medium">5 Core Metrics</span>
          </CardHeader>
          <CardContent className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consistencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#64748b" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(val) => [`${val ?? 0} pts`, "Dimension Score"]}
                />
                <Bar dataKey="score" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 4. Recommendation Priorities Pie Chart */}
        <Card className="border-slate-100 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <CardHeader className="pb-2 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                Recommendation Priority Distribution
              </CardTitle>
            </div>
            <span className="text-xs text-slate-400 font-medium">Action Items</span>
          </CardHeader>
          <CardContent className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  label={(entry: PieLabelEntry) => `${entry.name} (${entry.value})`}
                >
                  {priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-prio-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
