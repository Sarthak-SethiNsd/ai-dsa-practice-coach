"use client";

import * as React from "react";
import { TimeSeriesPoint, Distributions } from "@/services/dashboardTypes";
import { ChartCard } from "./ChartCard";
import {
  ResponsiveContainer,
  LineChart,
  Line,
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
import {
  TrendingUp,
  BarChart2,
  Zap,
  Clock,
  Code2,
  Layers,
  Cpu,
  Boxes,
  Server,
  Terminal,
} from "lucide-react";

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

interface DashboardChartsProps {
  timeSeries: TimeSeriesPoint[];
  distributions: Distributions;
}

export function DashboardCharts({
  timeSeries,
  distributions,
}: DashboardChartsProps) {
  const hasSeries = timeSeries.length > 0;

  return (
    <div className="space-y-6">
      {/* ROW 1: Score Trend & Activity Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. AI Score Over Time */}
        <ChartCard
          title="AI Quality Score Progression"
          subtitle="Derived code quality index (0–100) over review history"
          icon={TrendingUp}
        >
          {hasSeries ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`${val || 0} pts`, "Quality Score"]}
                />
                <Line
                  type="monotone"
                  dataKey="avgScore"
                  stroke="#0284c7"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#0284c7" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-400 font-medium">No trend data available.</p>
          )}
        </ChartCard>

        {/* 2. Reviews Per Day */}
        <ChartCard
          title="Review Activity Volume"
          subtitle="Number of AI review submissions over time"
          icon={BarChart2}
        >
          {hasSeries ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`${val || 0} review(s)`, "Submissions"]}
                />
                <Bar dataKey="reviewCount" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-400 font-medium">No activity data available.</p>
          )}
        </ChartCard>
      </div>

      {/* ROW 2: Token Usage & Response Duration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Token Usage Trend */}
        <ChartCard
          title="Token Consumption Trend"
          subtitle="Total prompt + completion tokens per active day"
          icon={Zap}
        >
          {hasSeries ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`${Number(val || 0).toLocaleString()} tokens`, "Total Usage"]}
                />
                <Area
                  type="monotone"
                  dataKey="totalTokens"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#tokenGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-400 font-medium">No token data available.</p>
          )}
        </ChartCard>

        {/* 4. Response Duration Trend */}
        <ChartCard
          title="AI Response Duration"
          subtitle="Average wall-clock response latency in seconds"
          icon={Clock}
        >
          {hasSeries ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="durationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  tickFormatter={(v: any) => `${(Number(v || 0) / 1000).toFixed(1)}s`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`${(Number(val || 0) / 1000).toFixed(2)}s`, "Avg Duration"]}
                />
                <Area
                  type="monotone"
                  dataKey="avgDurationMs"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#durationGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-400 font-medium">No duration data available.</p>
          )}
        </ChartCard>
      </div>

      {/* ROW 3: Languages & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5. Language Distribution */}
        <ChartCard
          title="Programming Language Distribution"
          subtitle="Breakdown of submitted code languages"
          icon={Code2}
        >
          {distributions.languages.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributions.languages}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  label={(entry: any) => `${entry.name} (${entry.percentage ?? Math.round((entry.percent || 0) * 100)}%)`}
                >
                  {distributions.languages.map((_, index) => (
                    <Cell key={`cell-lang-${index}`} fill={COLORS[index % COLORS.length]} />
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
          ) : (
            <p className="text-xs text-slate-400 font-medium">No language data available.</p>
          )}
        </ChartCard>

        {/* 6. Category Distribution */}
        <ChartCard
          title="Review Category Breakdown"
          subtitle="Distribution across review prompt types"
          icon={Layers}
        >
          {distributions.categories.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributions.categories}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  label={(entry: any) => `${entry.name?.split(" ")[0]} (${entry.count})`}
                >
                  {distributions.categories.map((_, index) => (
                    <Cell key={`cell-cat-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
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
          ) : (
            <p className="text-xs text-slate-400 font-medium">No category data available.</p>
          )}
        </ChartCard>
      </div>

      {/* ROW 4: Time Complexity & Space Complexity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7. Time Complexity Distribution */}
        <ChartCard
          title="Time Complexity Distribution"
          subtitle="Analyzed Big-O time complexity tags"
          icon={Cpu}
        >
          {distributions.timeComplexities.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={distributions.timeComplexities.slice(0, 6)}
                margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#0284c7" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-400 font-medium">No complexity data available.</p>
          )}
        </ChartCard>

        {/* 8. Space Complexity Distribution */}
        <ChartCard
          title="Space Complexity Distribution"
          subtitle="Analyzed Big-O auxiliary space complexity tags"
          icon={Boxes}
        >
          {distributions.spaceComplexities.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={distributions.spaceComplexities.slice(0, 6)}
                margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-400 font-medium">No space complexity data available.</p>
          )}
        </ChartCard>
      </div>

      {/* ROW 5: AI Provider & Model Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 9. AI Provider Usage */}
        <ChartCard
          title="AI Provider Usage"
          subtitle="Requests routed per AI service"
          icon={Server}
        >
          {distributions.providers.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributions.providers}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={3}
                  label={(entry: any) => `${entry.name} (${entry.count})`}
                >
                  {distributions.providers.map((_, index) => (
                    <Cell key={`cell-prov-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
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
          ) : (
            <p className="text-xs text-slate-400 font-medium">No provider data available.</p>
          )}
        </ChartCard>

        {/* 10. Model Usage */}
        <ChartCard
          title="AI Model Usage"
          subtitle="Breakdown by specific LLM model version"
          icon={Terminal}
        >
          {distributions.models.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributions.models} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#1e293b",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-400 font-medium">No model data available.</p>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
