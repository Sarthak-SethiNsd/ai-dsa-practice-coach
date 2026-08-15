"use client";

import * as React from "react";
import {
  ContestReadinessScore,
  ContestReadinessLevel,
} from "@/services/contest/contestTypes";
import { Shield, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";

interface Props {
  readiness: ContestReadinessScore;
}

const LEVEL_CONFIG: Record<
  ContestReadinessLevel,
  { color: string; bg: string; gradient: string; ring: string }
> = {
  Beginner: {
    color: "text-slate-600",
    bg: "bg-slate-100",
    gradient: "from-slate-400 to-slate-600",
    ring: "stroke-slate-400",
  },
  Developing: {
    color: "text-amber-700",
    bg: "bg-amber-50",
    gradient: "from-amber-400 to-amber-600",
    ring: "stroke-amber-400",
  },
  Competitive: {
    color: "text-sky-700",
    bg: "bg-sky-50",
    gradient: "from-sky-400 to-sky-600",
    ring: "stroke-sky-400",
  },
  Advanced: {
    color: "text-violet-700",
    bg: "bg-violet-50",
    gradient: "from-violet-400 to-violet-600",
    ring: "stroke-violet-400",
  },
  Expert: {
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    gradient: "from-emerald-400 to-emerald-600",
    ring: "stroke-emerald-400",
  },
};

function CircularGauge({ score, level }: { score: number; level: ContestReadinessLevel }) {
  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const strokeColor =
    level === "Beginner"
      ? "#94a3b8"
      : level === "Developing"
      ? "#f59e0b"
      : level === "Competitive"
      ? "#0ea5e9"
      : level === "Advanced"
      ? "#8b5cf6"
      : "#10b981";

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        {/* Background ring */}
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="10"
        />
        {/* Progress ring */}
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000"
        />
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-black tabular-nums text-slate-900">
          {score}
        </span>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
          /100
        </span>
      </div>
    </div>
  );
}

export function ContestReadinessPanel({ readiness }: Props) {
  const cfg = LEVEL_CONFIG[readiness.level];

  return (
    <div className="space-y-6">
      {/* Main score card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row items-center gap-10">
          {/* Gauge */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            <CircularGauge score={readiness.score} level={readiness.level} />
            <div
              className={`px-6 py-2 rounded-2xl ${cfg.bg} border border-slate-200 text-center`}
            >
              <p className={`text-xl font-black ${cfg.color}`}>
                {readiness.level}
              </p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Contest Readiness Level
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 space-y-5 w-full">
            {/* Progress to next level */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Progress to {readiness.nextLevel}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  ~{readiness.contestsNeededForNextLevel} contest{readiness.contestsNeededForNextLevel !== 1 ? "s" : ""} away
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full bg-gradient-to-r ${cfg.gradient} transition-all duration-700`}
                  style={{ width: `${readiness.score}%` }}
                />
              </div>
            </div>

            {/* Summaries */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                    Strengths
                  </p>
                </div>
                <p className="text-sm text-emerald-800 font-medium leading-snug">
                  {readiness.strengthSummary}
                </p>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                    Needs Work
                  </p>
                </div>
                <p className="text-sm text-amber-800 font-medium leading-snug">
                  {readiness.improvementSummary}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Factor Breakdown */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
        <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wide mb-5">
          Readiness Factor Breakdown
        </h3>
        <div className="space-y-4">
          {readiness.factors.map((factor) => {
            const impactColor =
              factor.impact === "positive"
                ? "text-emerald-600"
                : factor.impact === "neutral"
                ? "text-sky-600"
                : "text-rose-600";
            const barColor =
              factor.impact === "positive"
                ? "bg-emerald-500"
                : factor.impact === "neutral"
                ? "bg-sky-500"
                : "bg-rose-400";

            return (
              <div key={factor.factor} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-sm font-semibold text-slate-700">
                      {factor.factor}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      ({Math.round(factor.weight * 100)}% weight)
                    </span>
                  </div>
                  <span className={`text-sm font-extrabold tabular-nums ${impactColor}`}>
                    {factor.score}/100
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${barColor} transition-all duration-700`}
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 pl-5">{factor.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Readiness Levels Scale */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
        <h3 className="text-sm font-extrabold text-slate-700 uppercase tracking-wide mb-4">
          Readiness Scale
        </h3>
        <div className="flex gap-2 flex-wrap">
          {(
            [
              "Beginner",
              "Developing",
              "Competitive",
              "Advanced",
              "Expert",
            ] as ContestReadinessLevel[]
          ).map((level) => {
            const c = LEVEL_CONFIG[level];
            const isActive = level === readiness.level;
            return (
              <div
                key={level}
                className={`flex-1 min-w-[80px] px-3 py-2 rounded-xl text-center border transition-all ${
                  isActive
                    ? `${c.bg} border-slate-300 shadow-sm`
                    : "bg-slate-50 border-slate-100 opacity-50"
                }`}
              >
                <p
                  className={`text-xs font-extrabold ${
                    isActive ? c.color : "text-slate-500"
                  }`}
                >
                  {level}
                </p>
                {isActive && (
                  <div className="w-2 h-2 rounded-full mx-auto mt-1 bg-current opacity-60" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
