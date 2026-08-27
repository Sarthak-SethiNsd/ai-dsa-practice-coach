"use client";

import * as React from "react";
import { PatternPerformanceTrend } from "@/services/performance/performanceTypes";

interface PatternTrendTableProps {
  patterns: PatternPerformanceTrend[];
}

export function PatternTrendTable({ patterns }: PatternTrendTableProps) {
  const getExposureBadge = (status: PatternPerformanceTrend["exposureStatus"]) => {
    if (status === "OVEREXPOSED") {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">Overexposed</span>;
    }
    if (status === "UNDEREXPOSED") {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">Underexposed</span>;
    }
    if (status === "NEGLECTED") {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">Neglected</span>;
    }
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-200">Optimal</span>;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Algorithmic Pattern Coverage</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Exposure distribution, independence rates, and overexposure / underexposure alerts across core patterns
          </p>
        </div>
      </div>

      <div className="overflow-x-auto mt-3">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 pr-4">Pattern Name</th>
              <th className="py-2.5 px-3">Exposure Status</th>
              <th className="py-2.5 px-3 text-right">Attempts</th>
              <th className="py-2.5 px-3 text-right">Independent Solve %</th>
              <th className="py-2.5 pl-4">Strategic Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {patterns.map((p) => (
              <tr key={p.patternName} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 pr-4 font-bold text-slate-800">
                  {p.patternName}
                </td>
                <td className="py-3.5 px-3">
                  {getExposureBadge(p.exposureStatus)}
                </td>
                <td className="py-3.5 px-3 text-right font-extrabold text-slate-700 tabular-nums">
                  {p.exposureCount} <span className="text-slate-400 font-normal">({p.exposurePercentage}%)</span>
                </td>
                <td className="py-3.5 px-3 text-right font-extrabold text-sky-700 tabular-nums">
                  {p.exposureCount > 0 ? `${p.independentSolveRate}%` : "—"}
                </td>
                <td className="py-3.5 pl-4 text-slate-500 font-medium leading-relaxed">
                  {p.actionRecommendation}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
