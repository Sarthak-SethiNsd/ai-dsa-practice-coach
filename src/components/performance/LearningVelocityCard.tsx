"use client";

import * as React from "react";
import { LearningVelocity } from "@/services/performance/performanceTypes";

interface LearningVelocityCardProps {
  velocity: LearningVelocity;
  compact?: boolean;
}

export function LearningVelocityCard({
  velocity,
  compact = false,
}: LearningVelocityCardProps) {
  const { overallVelocityScore, tier, components, explanation } = velocity;

  const getTierColor = (t: LearningVelocity["tier"]) => {
    if (t === "High Velocity") return "bg-green-100 text-green-800 border-green-200";
    if (t === "Solid Progress") return "bg-sky-100 text-sky-800 border-sky-200";
    if (t === "Moderate Pace") return "bg-amber-100 text-amber-800 border-amber-200";
    if (t === "Plateaued") return "bg-orange-100 text-orange-800 border-orange-200";
    return "bg-slate-100 text-slate-600 border-slate-200";
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 65) return "bg-sky-500";
    if (score >= 45) return "bg-amber-500";
    return "bg-orange-500";
  };

  if (compact) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
              🚀 Learning Velocity
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTierColor(tier)}`}>
              {tier}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {overallVelocityScore}/100
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
          {explanation}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-xl text-indigo-600">
            🚀
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Learning Velocity</h3>
            <p className="text-xs text-slate-500">
              Deterministic measure of how quickly practice converts into independent problem-solving mastery
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-indigo-900 tabular-nums">
            {overallVelocityScore}
          </span>
          <span className="text-xs font-bold text-slate-400">/ 100</span>
          <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${getTierColor(tier)}`}>
            {tier}
          </span>
        </div>
      </div>

      {/* Explanation Banner */}
      <p className="text-xs text-slate-600 bg-slate-50 rounded-xl p-3.5 my-4 leading-relaxed font-medium">
        {explanation}
      </p>

      {/* Sub-component Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
        {Object.values(components).map((comp) => (
          <div key={comp.name} className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-bold text-slate-700">{comp.name}</span>
              <span className="text-xs font-extrabold text-slate-900 tabular-nums">{comp.score}/100</span>
            </div>
            <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(comp.score)}`}
                style={{ width: `${comp.score}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">{comp.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
