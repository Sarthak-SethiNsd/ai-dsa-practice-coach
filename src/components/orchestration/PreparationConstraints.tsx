"use client";

import * as React from "react";
import { CONSTRAINT_PRECEDENCE } from "@/services/orchestration/orchestrationConflictResolver";

interface PreparationConstraintsProps {
  constraintsApplied: string[];
}

export function PreparationConstraints({ constraintsApplied }: PreparationConstraintsProps) {
  const precedenceDescriptions: Record<string, string> = {
    SAFETY_RECOVERY: "1. Safety & Recovery — Protects against burnout and fatigue dropouts.",
    HARD_PREREQUISITE: "2. Hard Prerequisites — Learning Graph dependencies must be unblocked first.",
    ACTIVE_INTERVENTION: "3. Active Interventions — Enforces targeted strategy interventions.",
    ACTIVE_GOAL: "4. Active Goal Alignment — Aligns activities with target milestone dates.",
    SRS_URGENCY: "5. SRS Retention Urgency — Protects decaying knowledge memory.",
    STRATEGY_PRIORITY: "6. Strategy Mode Priorities — Focuses on dominant strategy.",
    PERFORMANCE_EVIDENCE: "7. Performance Evidence — Responds to measured solve rates & speeds.",
    PATTERN_DIVERSITY: "8. Pattern Diversification — Prevents over-concentration tunnel vision.",
    RECENCY: "9. Recency — Balances fresh concepts against established topics.",
    CONVENIENCE: "10. Convenience — Standard time-budget scheduling.",
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none space-y-6">
      <div className="pb-4 border-b border-slate-100">
        <h3 className="text-base font-extrabold text-slate-900">Constraint Engine & Precedence Rules</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Deterministic constraint filtering enforcing safety, prerequisite boundaries, and time bounds
        </p>
      </div>

      {/* Applied Constraints List */}
      <div className="space-y-3">
        <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
          Constraints Active in Current Plan ({constraintsApplied.length})
        </h4>
        {constraintsApplied.length === 0 ? (
          <p className="text-xs text-slate-400 italic">All candidate activities fit within current budget constraints.</p>
        ) : (
          <div className="space-y-2">
            {constraintsApplied.map((constraint, idx) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700 flex items-start gap-2.5">
                <span className="text-sky-600">🛡️</span>
                <span>{constraint}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 10-Level Precedence Hierarchy */}
      <div className="pt-2 border-t border-slate-100 space-y-3">
        <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
          10-Level Constraint Precedence Hierarchy
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {CONSTRAINT_PRECEDENCE.map((p) => (
            <div key={p} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 font-medium text-slate-700">
              {precedenceDescriptions[p] || p}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
