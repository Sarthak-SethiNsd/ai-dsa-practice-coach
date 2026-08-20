"use client";

import { PriorityLevel } from "@/services/dailyPlan/dailyPlanTypes";

interface PriorityBadgeProps {
  priority: PriorityLevel;
  size?: "sm" | "md";
}

const CONFIG: Record<PriorityLevel, { label: string; classes: string }> = {
  CRITICAL: {
    label: "Critical",
    classes: "bg-red-50 text-red-700 border border-red-200 ring-1 ring-red-300/40",
  },
  HIGH: {
    label: "High",
    classes: "bg-orange-50 text-orange-700 border border-orange-200",
  },
  MEDIUM: {
    label: "Medium",
    classes: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  LOW: {
    label: "Low",
    classes: "bg-slate-50 text-slate-500 border border-slate-200",
  },
};

export function PriorityBadge({ priority, size = "sm" }: PriorityBadgeProps) {
  const cfg = CONFIG[priority];
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${sizeClass} ${cfg.classes}`}
    >
      {priority === "CRITICAL" && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      )}
      {cfg.label}
    </span>
  );
}
