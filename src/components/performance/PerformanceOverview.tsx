"use client";

import * as React from "react";
import { FullPerformanceIntelligence } from "@/services/performance/performanceTypes";
import { PerformanceMetricCard } from "./PerformanceMetricCard";
import { LearningVelocityCard } from "./LearningVelocityCard";

interface PerformanceOverviewProps {
  intelligence: FullPerformanceIntelligence;
  onSelectTab?: (tab: string) => void;
}

export function PerformanceOverview({
  intelligence,
  onSelectTab,
}: PerformanceOverviewProps) {
  const { metrics, diagnosisSummary, learningVelocity, strategicRecommendations, persistentWeaknesses, windowConfig } = intelligence;

  const topRec = strategicRecommendations[0];

  return (
    <div className="space-y-6 select-none">
      {/* ── Executive Diagnosis Banner ────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-sky-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-sky-300">
              Longitudinal Intelligence Diagnosis · {windowConfig.label}
            </span>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-white backdrop-blur-sm w-fit">
            {metrics.totalAttempts} total attempts · {metrics.totalPracticeMinutes} min practice
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-snug">
          {diagnosisSummary.headline}
        </h2>
        <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-3xl leading-relaxed">
          {diagnosisSummary.subheadline}
        </p>

        {/* Actionable Callout */}
        {topRec && (
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">🎯</span>
              <div>
                <p className="text-xs font-bold text-sky-300 uppercase tracking-wide">Top Strategic Intervention</p>
                <p className="text-sm font-semibold text-white mt-0.5">{topRec.title}</p>
                <p className="text-xs text-slate-300 mt-0.5">{topRec.suggestedIntervention}</p>
              </div>
            </div>
            {onSelectTab && (
              <button
                onClick={() => onSelectTab("recommendations")}
                className="shrink-0 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-extrabold transition-all cursor-pointer shadow-sm"
              >
                View Strategy →
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Key Highlights Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Strongest Improving Skill */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-green-700 uppercase tracking-wide mb-1">
            <span>📈</span>
            <span>Strongest Improving Skill</span>
          </div>
          <p className="text-lg font-extrabold text-slate-900 mt-1">
            {diagnosisSummary.strongestImprovingSkill ?? "Building History"}
          </p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {diagnosisSummary.strongestImprovingSkill
              ? `Demonstrates the strongest verified gains in independent problem solving.`
              : "Complete more practice to identify top improving skills."}
          </p>
        </div>

        {/* Most Persistent Weakness */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">
            <span>⚠️</span>
            <span>Most Persistent Weakness</span>
          </div>
          <p className="text-lg font-extrabold text-slate-900 mt-1">
            {diagnosisSummary.mostPersistentWeakness ?? "No Persistent Weakness"}
          </p>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {diagnosisSummary.mostPersistentWeakness
              ? `Shows recurring failures or heavy hint dependency across sessions.`
              : "No recurring multi-session bottlenecks detected in this window."}
          </p>
        </div>

        {/* Learning Velocity Card Spotlight */}
        <LearningVelocityCard velocity={learningVelocity} compact />
      </div>

      {/* ── Core Metric Cards Grid ────────────────────────────────────────── */}
      <div>
        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider mb-3">
          Core Performance Rate & Timing Metrics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <PerformanceMetricCard
            label="Independent Solves"
            icon="⭐"
            trend={metrics.independentSolveRate}
            colorScheme="green"
          />
          <PerformanceMetricCard
            label="Overall Solve Rate"
            icon="🎯"
            trend={metrics.solveRate}
            colorScheme="sky"
          />
          <PerformanceMetricCard
            label="Median Solve Speed"
            icon="⏱️"
            trend={metrics.medianSolveTimeSeconds}
            unit="m"
            colorScheme="indigo"
          />
          <PerformanceMetricCard
            label="Time Efficiency Score"
            icon="⚡"
            trend={metrics.timeEfficiencyScore}
            colorScheme="purple"
          />
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <PerformanceMetricCard
          label="Hint Dependency"
          icon="💡"
          trend={metrics.hintAssistedRate}
          colorScheme="amber"
        />
        <PerformanceMetricCard
          label="Failure Rate"
          icon="❌"
          trend={metrics.failureRate}
          colorScheme="rose"
        />
        <PerformanceMetricCard
          label="Session Completion"
          icon="🏁"
          trend={metrics.sessionCompletionRate}
          colorScheme="sky"
        />
      </div>
    </div>
  );
}
