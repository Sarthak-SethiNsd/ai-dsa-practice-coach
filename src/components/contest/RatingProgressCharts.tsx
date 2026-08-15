"use client";

import * as React from "react";
import { RatingProgressAnalytics } from "@/services/contest/contestTypes";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, BarChart2, Activity, Award } from "lucide-react";

interface Props {
  analytics: RatingProgressAnalytics;
}

function ChartCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
      <div className="flex items-center gap-2 mb-6">
        <Icon className="w-4 h-4 text-sky-600" />
        <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wide">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

export function RatingProgressCharts({ analytics }: Props) {
  const {
    ratingOverTime,
    monthlyGain,
    performanceTrend,
    avgRankTrend,
    participationConsistency,
    longestActiveStreak,
    currentMonthContests,
  } = analytics;

  return (
    <div className="space-y-6">
      {/* Consistency pills */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Participation Consistency",
            value: `${participationConsistency}%`,
            color:
              participationConsistency >= 70
                ? "text-emerald-600"
                : participationConsistency >= 40
                ? "text-amber-600"
                : "text-rose-600",
          },
          {
            label: "This Month",
            value: `${currentMonthContests} contest${currentMonthContests !== 1 ? "s" : ""}`,
            color: "text-sky-600",
          },
          {
            label: "Longest Active Streak",
            value: `${longestActiveStreak} contest${longestActiveStreak !== 1 ? "s" : ""}`,
            color: "text-violet-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs text-center"
          >
            <p className={`text-2xl font-extrabold tabular-nums ${s.color}`}>
              {s.value}
            </p>
            <p className="text-xs text-slate-500 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Rating Over Time */}
      <ChartCard title="Rating Over Time" icon={TrendingUp}>
        {ratingOverTime.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
            No rating data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={ratingOverTime} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ratingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickFormatter={(v: string) => v.slice(5)}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                formatter={(value) => [value, "Rating"]}
              />
              <Area
                type="monotone"
                dataKey="rating"
                stroke="#0ea5e9"
                strokeWidth={2.5}
                fill="url(#ratingGrad)"
                dot={{ r: 3, fill: "#0ea5e9", strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Monthly Rating Gain */}
      <ChartCard title="Monthly Rating Gain" icon={BarChart2}>
        {monthlyGain.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
            No monthly data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyGain} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <ReferenceLine y={0} stroke="#e2e8f0" />
              <Tooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                formatter={(value) => [value, "Rating Gain"]}
              />
              <Bar
                dataKey="gain"
                radius={[4, 4, 0, 0]}
                fill="#10b981"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <ChartCard title="Performance Score Trend" icon={Activity}>
          {performanceTrend.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              No data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={performanceTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickFormatter={(v: string) => v.slice(5)}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [value, "Score"]}
                />
                <Line
                  type="monotone"
                  dataKey="performanceScore"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#8b5cf6", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Avg Rank Trend */}
        <ChartCard title="Average Rank Trend" icon={Award}>
          {avgRankTrend.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              No data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={avgRankTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickFormatter={(v: string) => v.slice(5)}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  reversed
                />
                <Tooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`#${value}`, "Avg Rank"]}
                />
                <Line
                  type="monotone"
                  dataKey="avgRank"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#f59e0b", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
