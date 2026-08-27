"use client";

import * as React from "react";
import { DifficultyProgressionTrend } from "@/services/performance/performanceTypes";

interface DifficultyProgressionProps {
  difficultyTrend: DifficultyProgressionTrend;
}

export function DifficultyProgression({ difficultyTrend }: DifficultyProgressionProps) {
  const { byDifficulty, pacing, transitionGap, pacingDiagnosis, recommendedDifficultyAction } = difficultyTrend;

  const getPacingBadge = (p: DifficultyProgressionTrend["pacing"]) => {
    const map = {
      APPROPRIATE: { bg: "bg-green-100 text-green-800 border-green-200", label: "Calibrated" },
      PLATEAU: { bg: "bg-amber-100 text-amber-800 border-amber-200", label: "Plateaued" },
      TOO_AGGRESSIVE: { bg: "bg-rose-100 text-rose-800 border-rose-200", label: "Too Aggressive" },
      TOO_CONSERVATIVE: { bg: "bg-sky-100 text-sky-800 border-sky-200", label: "Too Conservative" },
      INSUFFICIENT_DATA: { bg: "bg-slate-100 text-slate-600 border-slate-200", label: "Building History" },
    }[p];

    return (
      <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${map.bg}`}>
        {map.label}
      </span>
    );
  };

  const difficulties = ["Easy", "Medium", "Hard"] as const;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Difficulty Progression & Transition Gaps</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pacing calibration and performance distribution across Easy, Medium, and Hard tiers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Pacing:</span>
          {getPacingBadge(pacing)}
        </div>
      </div>

      {/* Pacing & Transition Diagnosis */}
      <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
        <p className="text-xs font-bold text-slate-800">
          ⚖️ {pacingDiagnosis}
        </p>
        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          {recommendedDifficultyAction}
        </p>
      </div>

      {/* Transition Gap Callout if present */}
      {(transitionGap.hasMediumToHardGap || transitionGap.hasEasyToMediumGap) && (
        <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-2.5">
          <span className="text-base shrink-0">⚠️</span>
          <div>
            <p className="text-xs font-bold text-amber-900">Transition Bottleneck Detected</p>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">{transitionGap.gapDescription}</p>
          </div>
        </div>
      )}

      {/* 3-Tier Difficulty Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
        {difficulties.map((diff) => {
          const stats = byDifficulty[diff];
          const colorStyles = {
            Easy: "border-green-200 bg-green-50/40 text-green-700",
            Medium: "border-amber-200 bg-amber-50/40 text-amber-700",
            Hard: "border-rose-200 bg-rose-50/40 text-rose-700",
          }[diff];

          const progressColor = {
            Easy: "bg-green-500",
            Medium: "bg-amber-500",
            Hard: "bg-rose-500",
          }[diff];

          return (
            <div key={diff} className={`rounded-2xl border p-4.5 ${colorStyles}`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-extrabold uppercase tracking-wider">{diff} Tier</span>
                <span className="text-xs font-extrabold text-slate-700 tabular-nums">
                  {stats.attempts} attempt{stats.attempts !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="my-2">
                <div className="flex items-baseline justify-between text-xs mb-1">
                  <span className="text-slate-500 font-medium">Independent Solve Rate</span>
                  <span className="font-extrabold text-slate-900 tabular-nums">
                    {stats.attempts > 0 ? `${stats.independentSolveRate}%` : "—"}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                    style={{ width: `${stats.independentSolveRate}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-semibold mt-3 pt-2 border-t border-slate-200/60">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Solved</p>
                  <p className="text-slate-800 font-bold mt-0.5">{stats.solvedCount}/{stats.attempts}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Hints Used</p>
                  <p className="text-slate-800 font-bold mt-0.5">{stats.hintCount}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
