"use client";

import * as React from "react";
import { PerformanceMetricTrend } from "@/services/performance/performanceTypes";

interface PerformanceMetricCardProps {
  label: string;
  trend: PerformanceMetricTrend;
  icon?: string;
  unit?: string;
  colorScheme?: "sky" | "green" | "amber" | "indigo" | "purple" | "rose";
}

export function PerformanceMetricCard({
  label,
  trend,
  icon,
  unit = "%",
  colorScheme = "sky",
}: PerformanceMetricCardProps) {
  const { currentValue, previousValue, delta, direction, confidence, sampleSize, explanation } = trend;

  const isInsufficient = direction === "INSUFFICIENT_DATA";

  const getDirectionBadge = () => {
    if (isInsufficient) {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
          Not Enough Data
        </span>
      );
    }
    if (direction === "IMPROVING") {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
          <span>▲</span>
          <span>{delta > 0 ? `+${delta}` : delta}{unit}</span>
        </span>
      );
    }
    if (direction === "DECLINING") {
      return (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
          <span>▼</span>
          <span>{delta}{unit}</span>
        </span>
      );
    }
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
        <span>■</span>
        <span>Stable</span>
      </span>
    );
  };

  const colors = {
    sky: "border-slate-200 hover:border-sky-300",
    green: "border-slate-200 hover:border-green-300",
    amber: "border-slate-200 hover:border-amber-300",
    indigo: "border-slate-200 hover:border-indigo-300",
    purple: "border-slate-200 hover:border-purple-300",
    rose: "border-slate-200 hover:border-rose-300",
  }[colorScheme];

  return (
    <div className={`bg-white rounded-2xl border p-4 shadow-xs transition-all ${colors}`}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide truncate">
          {icon && <span className="mr-1.5">{icon}</span>}
          {label}
        </span>
        {getDirectionBadge()}
      </div>

      <div className="flex items-baseline gap-2 my-1">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
          {isInsufficient && sampleSize === 0 ? "—" : `${currentValue}${unit}`}
        </span>
        {previousValue !== null && !isInsufficient && (
          <span className="text-xs text-slate-400 font-medium">
            vs {previousValue}{unit} prev
          </span>
        )}
      </div>

      <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed" title={explanation}>
        {explanation}
      </p>

      <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mt-3 pt-2 border-t border-slate-100">
        <span>{sampleSize} sample{sampleSize !== 1 ? "s" : ""}</span>
        <span className={`${confidence === "HIGH" ? "text-green-600 font-bold" : confidence === "MEDIUM" ? "text-amber-600" : "text-slate-400"}`}>
          {confidence} confidence
        </span>
      </div>
    </div>
  );
}
