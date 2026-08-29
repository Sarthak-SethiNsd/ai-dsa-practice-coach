"use client";

import * as React from "react";
import { DeferredActivity } from "@/services/orchestration/orchestrationTypes";

interface DeferredActivitiesProps {
  deferred: DeferredActivity[];
}

export function DeferredActivities({ deferred }: DeferredActivitiesProps) {
  const doLater = deferred.filter((d) => d.category === "DO_LATER");
  const notRecommended = deferred.filter((d) => d.category === "NOT_RECOMMENDED");

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none space-y-6">
      <div className="pb-4 border-b border-slate-100">
        <h3 className="text-base font-extrabold text-slate-900">Deferred & De-prioritized Work</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Explicitly distinguishes work to do later from activities not recommended in your current state
        </p>
      </div>

      {/* ── DO LATER (Time & Prerequisite Deferred) ────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-sky-100 text-sky-900 border border-sky-200">
            ⏳ DO LATER ({doLater.length})
          </span>
          <span className="text-xs text-slate-400">Valid activities deferred due to time limits or prerequisite order</span>
        </div>

        {doLater.length === 0 ? (
          <p className="text-xs text-slate-400 italic pl-2">No activities deferred for later.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {doLater.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-extrabold text-slate-900">{item.activity.title}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                    {item.activity.estimatedMinutes}m
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.deferralReason}</p>
                <p className="text-[10px] text-slate-400 font-semibold pt-1 border-t border-slate-200/60">
                  Constraint: {item.appliedConstraint}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── NOT RECOMMENDED (Overexposure / Fatigue Suppressed) ───────────── */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
            🛑 NOT RECOMMENDED ({notRecommended.length})
          </span>
          <span className="text-xs text-slate-400">Activities currently suppressed to prevent over-concentration or burnout</span>
        </div>

        {notRecommended.length === 0 ? (
          <p className="text-xs text-slate-400 italic pl-2">No activities currently suppressed.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {notRecommended.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-1.5">
                <h4 className="text-sm font-extrabold text-amber-950">{item.activity.title}</h4>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">{item.deferralReason}</p>
                <p className="text-[10px] text-amber-800/80 font-semibold pt-1 border-t border-amber-200/60">
                  Constraint: {item.appliedConstraint}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
