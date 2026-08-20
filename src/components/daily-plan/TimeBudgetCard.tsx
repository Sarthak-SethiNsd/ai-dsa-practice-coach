"use client";

import { Clock } from "lucide-react";
import { TimeBudgetPreset } from "@/services/dailyPlan/dailyPlanTypes";

const PRESETS: { label: string; value: number }[] = [
  { label: "15m", value: 15 },
  { label: "30m", value: 30 },
  { label: "45m", value: 45 },
  { label: "60m", value: 60 },
  { label: "90m", value: 90 },
  { label: "120m", value: 120 },
];

interface TimeBudgetCardProps {
  currentBudget: number;
  onChange: (minutes: number) => void;
  isReplanning: boolean;
}

export function TimeBudgetCard({
  currentBudget,
  onChange,
  isReplanning,
}: TimeBudgetCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-sky-500" />
        <h2 className="text-sm font-semibold text-slate-700">Time Budget</h2>
        <span className="ml-auto text-xs text-slate-500">
          {isReplanning ? "Recalculating…" : "Select available study time"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map(({ label, value }) => {
          const isActive = currentBudget === value;
          return (
            <button
              key={value}
              onClick={() => onChange(value)}
              disabled={isReplanning}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${
                isActive
                  ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-700"
              } disabled:opacity-50`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <p className="mt-2.5 text-xs text-slate-400">
        Changing the budget instantly recalculates task priorities and time allocation.
      </p>
    </div>
  );
}
