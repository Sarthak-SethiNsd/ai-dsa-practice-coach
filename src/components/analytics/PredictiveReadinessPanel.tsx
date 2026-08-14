"use client";

import * as React from "react";
import { PredictiveReadinessMetrics } from "@/services/analytics/performanceAnalyticsTypes";
import { Gauge, ShieldCheck, ArrowUpRight } from "lucide-react";

interface PredictiveReadinessPanelProps {
  predictive: PredictiveReadinessMetrics;
}

export function PredictiveReadinessPanel({ predictive }: PredictiveReadinessPanelProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Gauge className="w-5 h-5 text-indigo-600" /> Predictive Readiness & AI Growth Modeling
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Predictive algorithm estimating interview & contest readiness, 30-day skill growth velocity, and confidence metrics.
        </p>
      </div>

      {/* Gauges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Interview Readiness */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-300">Technical Interview</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-800 text-indigo-200">
              {predictive.interviewReadinessConfidence}% Confidence
            </span>
          </div>
          <div>
            <p className="text-3xl font-black tracking-tight text-white">{predictive.interviewReadinessScore}%</p>
            <p className="text-xs text-indigo-200 font-medium mt-0.5">Interview Readiness Index</p>
          </div>
          <div className="w-full bg-indigo-950 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-400 h-full transition-all duration-300" style={{ width: `${predictive.interviewReadinessScore}%` }} />
          </div>
        </div>

        {/* Contest Readiness */}
        <div className="bg-gradient-to-br from-sky-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-sky-300">Competitive Contest</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-800 text-sky-200">
              {predictive.contestReadinessConfidence}% Confidence
            </span>
          </div>
          <div>
            <p className="text-3xl font-black tracking-tight text-white">{predictive.contestReadinessScore}%</p>
            <p className="text-xs text-sky-200 font-medium mt-0.5">Contest Speed & Accuracy Index</p>
          </div>
          <div className="w-full bg-sky-950 h-2 rounded-full overflow-hidden">
            <div className="bg-sky-400 h-full transition-all duration-300" style={{ width: `${predictive.contestReadinessScore}%` }} />
          </div>
        </div>

        {/* 30-Day Growth Forecast */}
        <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">Growth Forecast</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-3xl font-black tracking-tight text-emerald-400">+{predictive.problemSolvingGrowth30dPct}%</p>
            <p className="text-xs text-emerald-200 font-medium mt-0.5">Projected 30-Day Skill Increase</p>
          </div>
          <p className="text-[11px] text-emerald-300/80 font-medium">Based on current review quality & streak velocity</p>
        </div>
      </div>

      {/* Factor Breakdown */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
        <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-sky-600" /> Readiness Calculation Weight Factors
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {predictive.readinessFactors.map((f) => (
            <div key={f.factor} className="border border-slate-100 bg-slate-50/50 rounded-xl p-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold text-slate-900">{f.factor}</p>
                <p className="text-[10px] text-slate-400 font-medium">Weight: {f.weight}</p>
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                f.impact === "Positive"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : f.impact === "Neutral"
                  ? "bg-sky-50 text-sky-700 border-sky-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                {f.impact} ({f.score} pts)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
