"use client";

import * as React from "react";
import { SkillPerformanceTrend } from "@/services/performance/performanceTypes";

interface SkillTrendChartProps {
  skills: SkillPerformanceTrend[];
}

export function SkillTrendChart({ skills }: SkillTrendChartProps) {
  const [filter, setFilter] = React.useState<"all" | "improving" | "stagnant" | "weak" | "strong">("all");

  const filteredSkills = skills.filter((s) => {
    if (filter === "improving") return s.classification === "IMPROVING";
    if (filter === "stagnant") return s.isStagnant;
    if (filter === "weak") return s.classification === "WEAK" || s.classification === "DECLINING";
    if (filter === "strong") return s.classification === "STRONG";
    return true;
  });

  const getClassificationBadge = (cls: SkillPerformanceTrend["classification"], isStagnant: boolean) => {
    if (isStagnant) {
      return (
        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200 flex items-center gap-1">
          <span>⏸️</span>
          <span>Stagnant</span>
        </span>
      );
    }
    const badges: Record<SkillPerformanceTrend["classification"], string> = {
      STRONG: "bg-green-100 text-green-800 border-green-200",
      IMPROVING: "bg-sky-100 text-sky-800 border-sky-200",
      STABLE: "bg-slate-100 text-slate-700 border-slate-200",
      WEAK: "bg-rose-100 text-rose-800 border-rose-200",
      DECLINING: "bg-red-100 text-red-800 border-red-200",
      STAGNANT: "bg-orange-100 text-orange-800 border-orange-200",
      INSUFFICIENT_DATA: "bg-slate-100 text-slate-500 border-slate-200",
    };

    const label: Record<SkillPerformanceTrend["classification"], string> = {
      STRONG: "Strong",
      IMPROVING: "Improving",
      STABLE: "Stable",
      WEAK: "Weak",
      DECLINING: "Declining",
      STAGNANT: "Stagnant",
      INSUFFICIENT_DATA: "Building History",
    };

    return (
      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badges[cls]}`}>
        {label[cls]}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Skill Progression & Trend Analysis</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Longitudinal mastery, independent solve rates, stagnation detection, and prerequisite health
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(["all", "improving", "stagnant", "weak", "strong"] as const).map((f) => {
            const labels = {
              all: "All Skills",
              improving: "📈 Improving",
              stagnant: "⏸️ Stagnant",
              weak: "⚠️ Needs Work",
              strong: "⭐ Strong",
            };
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filter === f
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {labels[f]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Skills List */}
      <div className="divide-y divide-slate-100 mt-2">
        {filteredSkills.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-semibold text-slate-500">No skills match the selected filter.</p>
            <p className="text-xs text-slate-400 mt-1">Try switching to &quot;All Skills&quot; or complete more practice.</p>
          </div>
        ) : (
          filteredSkills.map((skill) => (
            <div key={skill.skillId} className="py-4 first:pt-3 last:pb-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Left: Skill title & category */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-extrabold text-slate-900">{skill.skillName}</h4>
                    {getClassificationBadge(skill.classification, skill.isStagnant)}
                    {skill.prerequisiteHealth === "BOTTLENECK" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Prerequisite Bottleneck
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {skill.evidenceSummary}
                  </p>
                </div>

                {/* Right: Key Stats */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Independent Rate</p>
                    <p className="text-sm font-extrabold text-slate-900 tabular-nums">
                      {skill.totalAttempts > 0 ? `${skill.independentSolveRate}%` : "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Attempts</p>
                    <p className="text-sm font-extrabold text-slate-700 tabular-nums">{skill.totalAttempts}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Mastery</p>
                    <p className="text-sm font-extrabold text-sky-700 tabular-nums">{skill.currentMasteryScore}%</p>
                  </div>
                </div>
              </div>

              {/* Stagnation Intervention Alert */}
              {skill.isStagnant && skill.suggestedIntervention && (
                <div className="mt-2.5 p-3 rounded-xl bg-orange-50/80 border border-orange-200 flex items-start gap-2.5">
                  <span className="text-base shrink-0">💡</span>
                  <div>
                    <p className="text-xs font-bold text-orange-900">Suggested Stagnation Intervention</p>
                    <p className="text-xs text-orange-800 mt-0.5 leading-relaxed">{skill.suggestedIntervention}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
