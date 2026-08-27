"use client";

import * as React from "react";
import { ImprovementSignal } from "@/services/performance/performanceTypes";

interface ImprovementSignalsProps {
  signals: ImprovementSignal[];
}

export function ImprovementSignals({ signals }: ImprovementSignalsProps) {
  if (signals.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none">
      <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Verified Improvement Signals</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Confirmed positive skill development based on longitudinal performance evidence
          </p>
        </div>
        <span className="text-xs font-extrabold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
          {signals.length} positive signal{signals.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {signals.map((sig) => (
          <div key={sig.id} className="p-4.5 rounded-2xl border border-green-200 bg-green-50/40 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-extrabold text-slate-900">{sig.skillOrPattern}</span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-green-600 text-white shadow-xs">
                {sig.magnitude}
              </span>
            </div>

            <p className="text-xs text-green-950 font-semibold leading-relaxed">
              {sig.celebrationMessage}
            </p>

            <p className="text-[11px] text-slate-600 leading-relaxed font-medium pt-1 border-t border-green-200/60">
              {sig.evidence}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
