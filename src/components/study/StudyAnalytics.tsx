"use client";

import * as React from "react";
import { StudyAnalyticsData } from "@/services/study/studyTypes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { BarChart2, PieChart as PieChartIcon, Clock, Zap, Target } from "lucide-react";

interface Props {
  analytics: StudyAnalyticsData | null;
}

const PIE_COLORS = ["#0ea5e9", "#8b5cf6", "#10b981", "#f59e0b", "#f43f5e", "#64748b"];

export function StudyAnalytics({ analytics }: Props) {
  if (!analytics) return null;

  const topicPieData = Object.entries(analytics.topicDistributionAllTime).map(
    ([name, value]) => ({ name, value })
  );

  return (
    <div className="space-y-6">
      {/* 3 Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Avg Session Completion
            </p>
            <p className="text-3xl font-black text-sky-600 tabular-nums mt-1">
              {analytics.avgSessionCompletionPct}%
            </p>
          </div>
          <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl">
            <Target className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Revision vs New Ratio
            </p>
            <p className="text-3xl font-black text-violet-600 tabular-nums mt-1">
              {analytics.revisionVsNewRatioPct}% <span className="text-xs text-slate-400 font-semibold">Revisions</span>
            </p>
          </div>
          <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Focus Efficiency
            </p>
            <p className="text-3xl font-black text-emerald-600 tabular-nums mt-1">
              {analytics.focusEfficiencyPct}%
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Zap className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Study Time Chart */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-sky-600" />
            <h4 className="text-base font-extrabold text-slate-900">
              Daily Study Time (Minutes)
            </h4>
          </div>

          {analytics.dailyStudyMinutes30d.length === 0 ? (
            <p className="text-center py-12 text-slate-400 text-sm">No study time recorded.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={analytics.dailyStudyMinutes30d} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v: string) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "12px" }} />
                <Bar dataKey="minutes" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* All-Time Topic Distribution */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-violet-600" />
            <h4 className="text-base font-extrabold text-slate-900">
              All-Time Topic Practice Distribution
            </h4>
          </div>

          {topicPieData.length === 0 ? (
            <p className="text-center py-12 text-slate-400 text-sm">No topics recorded yet.</p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={topicPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {topicPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-1 text-xs font-semibold text-slate-600 shrink-0">
                {topicPieData.slice(0, 5).map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span>{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
