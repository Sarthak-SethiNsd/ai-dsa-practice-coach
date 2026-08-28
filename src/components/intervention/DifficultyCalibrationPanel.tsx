"use client";

import * as React from "react";
import { DifficultyPolicy } from "@/services/intervention/interventionTypes";
import { Difficulty } from "@/services/types";

interface DifficultyCalibrationPanelProps {
  policy: DifficultyPolicy;
  preferredDifficulty: Difficulty | "Mixed";
  pacingDiagnosis: string;
}

export function DifficultyCalibrationPanel({
  policy,
  preferredDifficulty,
  pacingDiagnosis,
}: DifficultyCalibrationPanelProps) {
  const getPolicyStyle = (p: DifficultyPolicy) => {
    switch (p) {
      case "INCREASE":
        return {
          badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
          icon: "📈",
          label: "Accelerating Difficulty",
          desc: "Introducing Harder problem tiers based on proven mastery in lower tiers.",
        };
      case "DECREASE":
        return {
          badge: "bg-amber-100 text-amber-800 border-amber-300",
          icon: "📉",
          label: "Stepping Down Difficulty",
          desc: "Temporarily shifting down to reinforce fundamentals and restore unassisted solve rates.",
        };
      case "MIXED":
        return {
          badge: "bg-purple-100 text-purple-800 border-purple-300",
          icon: "🔀",
          label: "Mixed Pacing Calibration",
          desc: "Blending Medium and Hard tiers to dismantle plateau boundaries.",
        };
      case "HOLD":
      default:
        return {
          badge: "bg-slate-100 text-slate-800 border-slate-300",
          icon: "⚖️",
          label: "Calibrated (Holding Current Difficulty)",
          desc: "Target difficulty matches current learner capabilities with healthy challenge.",
        };
    }
  };

  const style = getPolicyStyle(policy);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Difficulty Calibration</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Dynamic difficulty pacing calibrated to prevent comfort-zone stagnation and avoid burnout
          </p>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${style.badge}`}>
          {style.icon} {policy}
        </span>
      </div>

      <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-slate-800 uppercase tracking-wide">Target Problem Tier</p>
          <span className="text-sm font-extrabold text-indigo-700">{preferredDifficulty}</span>
        </div>
        <p className="text-xs text-slate-700 font-semibold leading-relaxed">
          {style.desc}
        </p>
        <p className="text-xs text-slate-500 font-medium pt-1 border-t border-slate-200/60">
          <span className="font-bold text-slate-700">Diagnosis: </span>{pacingDiagnosis}
        </p>
      </div>

      {/* Difficulty Breakdown Visualizer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className={`p-4 rounded-2xl border ${preferredDifficulty === "Easy" ? "border-emerald-300 bg-emerald-50/60 ring-2 ring-emerald-100" : "border-slate-200 bg-slate-50/50"}`}>
          <p className="text-xs font-bold text-emerald-800">Easy Tier</p>
          <p className="text-[11px] text-slate-500 mt-1">Foundation & quick pattern drills</p>
        </div>
        <div className={`p-4 rounded-2xl border ${preferredDifficulty === "Medium" ? "border-sky-300 bg-sky-50/60 ring-2 ring-sky-100" : "border-slate-200 bg-slate-50/50"}`}>
          <p className="text-xs font-bold text-sky-800">Medium Tier</p>
          <p className="text-[11px] text-slate-500 mt-1">Core interview & standard paradigm problems</p>
        </div>
        <div className={`p-4 rounded-2xl border ${preferredDifficulty === "Hard" ? "border-rose-300 bg-rose-50/60 ring-2 ring-rose-100" : "border-slate-200 bg-slate-50/50"}`}>
          <p className="text-xs font-bold text-rose-800">Hard Tier</p>
          <p className="text-[11px] text-slate-500 mt-1">Complex multi-pattern & competitive problems</p>
        </div>
      </div>
    </div>
  );
}
