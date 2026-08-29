"use client";

import * as React from "react";
import { PreparationPlan } from "@/services/orchestration/orchestrationTypes";
import { NextBestAction } from "./NextBestAction";
import { PreparationPlanView } from "./PreparationPlanView";

interface PreparationOverviewProps {
  plan: PreparationPlan;
  availableMinutes: number;
  onTimeBudgetChange: (mins: number) => void;
  onSelectTab?: (tab: string) => void;
}

export function PreparationOverview({
  plan,
  availableMinutes,
  onTimeBudgetChange,
  onSelectTab,
}: PreparationOverviewProps) {
  const timeOptions = [15, 30, 45, 60, 90, 120];

  return (
    <div className="space-y-6 select-none">
      {/* ── Time Budget Pill Selector ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Available Time Budget</span>
          <p className="text-xs text-slate-500 mt-0.5">Adjust how much time you have right now to re-orchestrate your plan</p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-fit border border-slate-200/60 overflow-x-auto">
          {timeOptions.map((mins) => (
            <button
              key={mins}
              onClick={() => onTimeBudgetChange(mins)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                availableMinutes === mins
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>
      </div>

      {/* ── Hero Spotlight: Next Best Action ──────────────────────────────── */}
      <NextBestAction action={plan.nextBestAction} />

      {/* ── Status Snapshot Grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Strategy Mode</p>
          <p className="text-lg font-extrabold text-slate-900 mt-1">{plan.strategyMode}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Guiding active practice priority</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Primary Focus</p>
          <p className="text-lg font-extrabold text-slate-900 mt-1 truncate" title={plan.primaryFocus}>
            {plan.primaryFocus}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate" title={plan.secondaryFocus}>
            Secondary: {plan.secondaryFocus}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Planned Activities</p>
          <p className="text-lg font-extrabold text-indigo-700 mt-1 tabular-nums">
            {plan.activities.length} Block{plan.activities.length !== 1 ? "s" : ""} ({plan.totalPlannedMinutes}m)
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{plan.deferredActivities.length} deferred</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Plan Confidence</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-lg font-extrabold text-emerald-700">
              {plan.planConfidence.level}
            </span>
            <span className="text-xs font-bold text-slate-400">({plan.planConfidence.score}%)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Empirically grounded</p>
        </div>
      </div>

      {/* ── Coordinated Preparation Plan View ─────────────────────────────── */}
      <PreparationPlanView plan={plan} />
    </div>
  );
}
