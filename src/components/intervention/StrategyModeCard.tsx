"use client";

import * as React from "react";
import { StrategyMode } from "@/services/intervention/interventionTypes";

interface StrategyModeCardProps {
  mode: StrategyMode;
  rationale: string;
  focus: string;
}

export function StrategyModeCard({ mode, rationale, focus }: StrategyModeCardProps) {
  const getModeDetails = (m: StrategyMode) => {
    switch (m) {
      case "FOUNDATION_REPAIR":
        return {
          icon: "🏗️",
          badge: "bg-amber-100 text-amber-900 border-amber-300",
          gradient: "from-amber-900 via-orange-950 to-slate-950",
          accentColor: "text-amber-400",
          label: "Foundation Repair Mode",
          sub: "Addressing core prerequisite bottlenecks and rebuilding independent problem solving confidence.",
        };
      case "RECOVERY":
        return {
          icon: "🌱",
          badge: "bg-rose-100 text-rose-900 border-rose-300",
          gradient: "from-rose-950 via-slate-900 to-slate-950",
          accentColor: "text-rose-400",
          label: "Preparation Recovery Mode",
          sub: "Alleviating preparation fatigue, shortening sessions, and focusing on light review.",
        };
      case "STAGNATION_BREAK":
        return {
          icon: "⚡",
          badge: "bg-purple-100 text-purple-900 border-purple-300",
          gradient: "from-purple-950 via-indigo-950 to-slate-950",
          accentColor: "text-purple-400",
          label: "Stagnation Break Mode",
          sub: "Disrupting flat progress plateaus through mixed-pattern practice and varied problem formats.",
        };
      case "DIFFICULTY_ACCELERATION":
        return {
          icon: "🚀",
          badge: "bg-emerald-100 text-emerald-900 border-emerald-300",
          gradient: "from-emerald-950 via-teal-950 to-slate-950",
          accentColor: "text-emerald-400",
          label: "Difficulty Acceleration Mode",
          sub: "Pushing into Harder problem tiers to expand competitive and assessment readiness.",
        };
      case "INTERVIEW_FOCUS":
        return {
          icon: "🎯",
          badge: "bg-sky-100 text-sky-900 border-sky-300",
          gradient: "from-sky-950 via-indigo-950 to-slate-950",
          accentColor: "text-sky-400",
          label: "Interview Focus Mode",
          sub: "Prioritizing high-frequency Medium patterns, time fluency, and unassisted solution formulation.",
        };
      case "CONTEST_FOCUS":
        return {
          icon: "🏆",
          badge: "bg-indigo-100 text-indigo-900 border-indigo-300",
          gradient: "from-indigo-950 via-slate-900 to-slate-950",
          accentColor: "text-indigo-400",
          label: "Contest Focus Mode",
          sub: "Sharpening execution speed, timed solving, and diverse problem classification.",
        };
      case "REVISION_FOCUS":
        return {
          icon: "🔄",
          badge: "bg-cyan-100 text-cyan-900 border-cyan-300",
          gradient: "from-cyan-950 via-slate-900 to-slate-950",
          accentColor: "text-cyan-400",
          label: "Revision Focus Mode",
          sub: "Consolidating decay risks and reinforcing spaced repetition retention.",
        };
      case "SKILL_BUILDING":
        return {
          icon: "🧱",
          badge: "bg-blue-100 text-blue-900 border-blue-300",
          gradient: "from-blue-950 via-slate-900 to-slate-950",
          accentColor: "text-blue-400",
          label: "Skill Building Mode",
          sub: "Progressing through targeted curriculum nodes with balanced practice.",
        };
      case "BALANCED":
      default:
        return {
          icon: "⚖️",
          badge: "bg-slate-100 text-slate-900 border-slate-300",
          gradient: "from-slate-900 via-indigo-950 to-slate-950",
          accentColor: "text-sky-400",
          label: "Balanced Progression Mode",
          sub: "Healthy multi-topic progression maintaining consistent difficulty and review cadence.",
        };
    }
  };

  const details = getModeDetails(mode);

  return (
    <div className={`rounded-3xl p-6 sm:p-8 bg-gradient-to-br ${details.gradient} text-white shadow-md border border-white/10 relative overflow-hidden select-none`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{details.icon}</span>
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-300">
            Active Strategy Mode
          </span>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${details.badge} w-fit`}>
          {details.label}
        </span>
      </div>

      <div className="space-y-2 mt-2">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white">
          {focus}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          {rationale}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2 text-xs text-slate-400">
        <span className={details.accentColor}>●</span>
        <span>{details.sub}</span>
      </div>
    </div>
  );
}
