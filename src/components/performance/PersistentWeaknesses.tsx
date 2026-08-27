"use client";

import * as React from "react";
import { PersistentWeakness } from "@/services/performance/performanceTypes";

interface PersistentWeaknessesProps {
  weaknesses: PersistentWeakness[];
}

export function PersistentWeaknesses({ weaknesses }: PersistentWeaknessesProps) {
  const getSeverityBadge = (s: PersistentWeakness["severity"]) => {
    const map = {
      CRITICAL: "bg-red-100 text-red-800 border-red-200",
      HIGH: "bg-rose-100 text-rose-800 border-rose-200",
      MEDIUM: "bg-amber-100 text-amber-800 border-amber-200",
      LOW: "bg-slate-100 text-slate-700 border-slate-200",
    }[s];
    return <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${map}`}>{s}</span>;
  };

  const getPersistenceBadge = (p: PersistentWeakness["persistence"]) => {
    const map = {
      PERSISTENT: "bg-purple-100 text-purple-800 border-purple-200",
      RECURRING: "bg-orange-100 text-orange-800 border-orange-200",
      NEW: "bg-sky-100 text-sky-800 border-sky-200",
      IMPROVING: "bg-green-100 text-green-800 border-green-200",
    }[p];
    return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map}`}>{p}</span>;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Multi-Session Persistent Weaknesses</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Weaknesses identified across multiple sessions, contests, and mock interviews requiring targeted intervention
          </p>
        </div>
        <span className="text-xs font-extrabold text-slate-500">
          {weaknesses.length} detected
        </span>
      </div>

      <div className="space-y-3.5 mt-4">
        {weaknesses.length === 0 ? (
          <div className="py-12 text-center bg-green-50/40 rounded-2xl border border-green-100">
            <span className="text-3xl">🎉</span>
            <p className="text-sm font-bold text-green-900 mt-2">No Persistent Weaknesses Detected</p>
            <p className="text-xs text-green-700 mt-1">Your practice shows healthy failure recovery with zero recurring bottlenecks.</p>
          </div>
        ) : (
          weaknesses.map((w) => (
            <div key={w.id} className="p-4.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-extrabold text-slate-900">{w.skillOrPattern}</h4>
                  {getSeverityBadge(w.severity)}
                  {getPersistenceBadge(w.persistence)}
                  <span className="text-[10px] font-semibold text-slate-400">
                    Observed in: {w.affectedSystems.join(", ")}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-500 shrink-0">
                  {w.failCount} fail{w.failCount !== 1 ? "s" : ""} · {w.hintCount} hint{w.hintCount !== 1 ? "s" : ""}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {w.evidenceText}
              </p>

              <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200/80 flex items-start gap-2.5">
                <span className="text-sm shrink-0">🔧</span>
                <div>
                  <p className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">Targeted Intervention</p>
                  <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{w.recommendedIntervention}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
