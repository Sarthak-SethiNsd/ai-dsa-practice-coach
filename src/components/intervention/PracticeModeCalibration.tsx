"use client";

import * as React from "react";
import { InterventionPracticeMode, AdaptiveStrategyState } from "@/services/intervention/interventionTypes";

interface PracticeModeCalibrationProps {
  preferredModes: InterventionPracticeMode[];
  timePressureLevel: AdaptiveStrategyState["timePressureLevel"];
  currentModeRationale: string;
}

export function PracticeModeCalibration({
  preferredModes,
  timePressureLevel,
  currentModeRationale,
}: PracticeModeCalibrationProps) {
  const mode = preferredModes[0] || "REINFORCEMENT";

  const getModeInfo = (m: InterventionPracticeMode) => {
    switch (m) {
      case "LEARNING":
        return {
          icon: "📖",
          title: "Learning & Exploration Mode",
          desc: "Step-by-step concept discovery with unrestricted scaffolding and foundational explanations.",
        };
      case "TIMED":
        return {
          icon: "⏱️",
          title: "Timed Fluency Mode",
          desc: "Active countdown timer enforcing realistic interview time constraints to close the speed gap.",
        };
      case "CHALLENGE":
        return {
          icon: "🔥",
          title: "Challenge Mode",
          desc: "Hard-tier problems designed to push pattern synthesis and complex state management.",
        };
      case "INTERVIEW":
        return {
          icon: "💼",
          title: "Mock Interview Simulation Mode",
          desc: "Focusing on verbal solution formulation, trade-off analysis, and zero-hint solving.",
        };
      case "CONTEST":
        return {
          icon: "🏆",
          title: "Competitive Contest Mode",
          desc: "Rapid problem identification, boundary handling, and fast time-to-first-accepted.",
        };
      case "REVISION":
        return {
          icon: "🔄",
          title: "Spaced Revision Mode",
          desc: "Consolidating decay risks across previously solved problem notes and flashcards.",
        };
      case "MIXED":
        return {
          icon: "🔀",
          title: "Mixed-Pattern Practice Mode",
          desc: "Alternating paradigms within a single session to prevent pattern bias and break stagnation.",
        };
      case "REINFORCEMENT":
      default:
        return {
          icon: "🎯",
          title: "Pattern Reinforcement Mode",
          desc: "Standard adaptive practice reinforcing recognized core patterns with balanced hint delays.",
        };
    }
  };

  const info = getModeInfo(mode);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Practice Mode Calibration</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Calibrating session format, timer pressure, and hint scaffolding to target current bottlenecks
          </p>
        </div>
      </div>

      {/* Main Mode Card */}
      <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-4">
        <span className="text-3xl shrink-0">{info.icon}</span>
        <div>
          <h4 className="text-sm font-extrabold text-indigo-950">{info.title}</h4>
          <p className="text-xs text-indigo-900 mt-1 leading-relaxed font-medium">{info.desc}</p>
          <p className="text-[11px] text-indigo-800/80 mt-2 font-medium">
            <span className="font-bold">Strategy Alignment: </span>{currentModeRationale}
          </p>
        </div>
      </div>

      {/* Constraints Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Time Pressure Level</p>
          <p className="text-lg font-extrabold text-slate-900 mt-1">{timePressureLevel}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {timePressureLevel === "HIGH" ? "Strict countdown timer active" : timePressureLevel === "NONE" ? "No time constraints" : "Standard guidance time"}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Secondary Modes</p>
          <p className="text-lg font-extrabold text-slate-900 mt-1">
            {preferredModes.slice(1).join(", ") || "None"}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Fallback options for varied practice queues</p>
        </div>
      </div>
    </div>
  );
}
