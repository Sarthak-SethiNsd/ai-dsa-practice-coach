"use client";

import { useState } from "react";
import { DailyAction, ActionType } from "@/services/dailyPlan/dailyPlanTypes";
import { DailyActionCard } from "./DailyActionCard";

type FilterTab = "all" | ActionType;

const FILTER_TABS: { label: string; value: FilterTab }[] = [
  { label: "All", value: "all" },
  { label: "Revisions", value: "REVISION" },
  { label: "Problems", value: "RECOMMENDED_PROBLEM" },
  { label: "Weak Topics", value: "WEAK_TOPIC_PRACTICE" },
  { label: "Roadmap", value: "ROADMAP_STEP" },
  { label: "Contest", value: "CONTEST_PREP" },
  { label: "Mistakes", value: "REVIEW_PREVIOUS_MISTAKE" },
];

interface DailyActionListProps {
  actions: DailyAction[];
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  onUndo: (id: string) => void;
}

export function DailyActionList({
  actions,
  onComplete,
  onSkip,
  onUndo,
}: DailyActionListProps) {
  const [filter, setFilter] = useState<FilterTab>("all");

  const filtered =
    filter === "all" ? actions : actions.filter((a) => a.actionType === filter);

  // Tabs that actually have items
  const activeTabs = FILTER_TABS.filter(
    (t) =>
      t.value === "all" || actions.some((a) => a.actionType === t.value)
  );

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
        {activeTabs.map((tab) => {
          const count =
            tab.value === "all"
              ? actions.length
              : actions.filter((a) => a.actionType === tab.value).length;
          const isActive = filter === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                isActive
                  ? "bg-sky-600 text-white border-sky-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-700"
              }`}
            >
              {tab.label}
              <span
                className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          No actions in this category.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((action) => (
            <DailyActionCard
              key={action.id}
              action={action}
              onComplete={onComplete}
              onSkip={onSkip}
              onUndo={onUndo}
            />
          ))}
        </div>
      )}
    </div>
  );
}
