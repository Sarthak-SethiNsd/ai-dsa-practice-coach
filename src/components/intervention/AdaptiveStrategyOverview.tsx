"use client";

import * as React from "react";
import { AdaptiveStrategyResult } from "@/services/intervention/interventionTypes";
import { StrategyModeCard } from "./StrategyModeCard";
import { InterventionCard } from "./InterventionCard";

interface AdaptiveStrategyOverviewProps {
  result: AdaptiveStrategyResult;
  onSelectTab?: (tab: string) => void;
}

export function AdaptiveStrategyOverview({
  result,
  onSelectTab,
}: AdaptiveStrategyOverviewProps) {
  const { state, plans, signals, intelligenceSummary } = result;
  const primaryPlan = plans.find((p) => p.status === "ACTIVE") || plans[0];

  return (
    <div className="space-y-6 select-none">
      {/* ── Active Strategy Mode Banner ───────────────────────────────────── */}
      <StrategyModeCard
        mode={state.currentMode}
        rationale={state.modeRationale}
        focus={state.currentFocus}
      />

      {/* ── Key Metrics & Readiness Snapshot ───────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Strategy Status</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">
            {signals.preparationCommandCenter.strategyStatus}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Goal Risk: <span className="font-bold text-slate-700">{signals.preparationCommandCenter.goalRisk}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Difficulty Calibration</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">
            {state.difficultyPolicy} ({state.preferredDifficulty})
          </p>
          <p className="text-[11px] text-slate-500 mt-1 truncate" title={intelligenceSummary.pacingDiagnosis}>
            {intelligenceSummary.pacingDiagnosis}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Practice Mode</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">
            {state.preferredPracticeModes[0] || "REINFORCEMENT"}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Time Pressure: <span className="font-bold text-slate-700">{state.timePressureLevel}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Active Interventions</p>
          <p className="text-xl font-extrabold text-indigo-700 mt-1 tabular-nums">
            {state.activeInterventions.length} Active / {state.proposedInterventions.length} Queued
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Across {intelligenceSummary.totalAttempts} practice attempts
          </p>
        </div>
      </div>

      {/* ── Primary Active Intervention Spotlight ─────────────────────────── */}
      {primaryPlan ? (
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
              Primary Active Intervention
            </h3>
            {onSelectTab && (
              <button
                onClick={() => onSelectTab("interventions")}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
              >
                View All Interventions ({plans.length}) →
              </button>
            )}
          </div>
          <InterventionCard plan={primaryPlan} isPrimary />
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center">
          <p className="text-sm font-bold text-slate-700">No Active Interventions</p>
          <p className="text-xs text-slate-400 mt-1">Practice baseline is healthy. Proceed with regular daily practice sessions.</p>
        </div>
      )}

      {/* ── Subsystem Signals Summary ──────────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none">
        <h3 className="text-base font-extrabold text-slate-900 mb-1">
          Active Signals Emitted to Subsystems
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Structured instructions guiding the adaptive behavior of connected learning engines
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <p className="text-xs font-extrabold text-slate-800">Recommendation Engine</p>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{signals.recommendationEngine.reasoning}</p>
            {signals.recommendationEngine.boostSkills.length > 0 && (
              <p className="text-[10px] font-bold text-sky-700 mt-2">
                Boost: {signals.recommendationEngine.boostSkills.join(", ")}
              </p>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <p className="text-xs font-extrabold text-slate-800">Practice Session Engine</p>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{signals.practiceSessionEngine.reasoning}</p>
            <p className="text-[10px] font-bold text-indigo-700 mt-2">
              Mode: {signals.practiceSessionEngine.preferredMode} ({signals.practiceSessionEngine.targetDurationMinutes} min)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <p className="text-xs font-extrabold text-slate-800">Learning Graph & SRS</p>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{signals.learningGraph.reasoning}</p>
            <p className="text-[10px] font-bold text-emerald-700 mt-2">
              Revision: {signals.srsRevision.priorityLevel} Priority
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
