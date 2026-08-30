"use client";

import { Flame, RotateCcw, Compass } from "lucide-react";
import { DailyPlan } from "@/services/dailyPlan/dailyPlanTypes";

interface DailyPlanHeaderProps {
  plan: DailyPlan;
  onReplan: () => void;
  isReplanning: boolean;
}

export function DailyPlanHeader({ plan, onReplan, isReplanning }: DailyPlanHeaderProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const pendingCount = plan.actions.filter((a) => a.status === "pending").length;
  const completedCount = plan.actions.filter((a) => a.status === "completed").length;
  const totalCount = plan.actions.length;

  return (
    <div className="bg-gradient-to-br from-sky-600 to-sky-700 rounded-2xl p-5 text-white shadow-lg">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        {/* Left: Title + Date + Focus */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-5 h-5 text-sky-200 shrink-0" />
            <span className="text-sky-100 text-sm font-medium">{today}</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight mb-1">Today&apos;s Action Plan</h1>
          <p className="text-sky-100 text-sm line-clamp-2">{plan.mainFocus}</p>
        </div>

        {/* Right: Stats */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Streak */}
          {plan.streak > 0 && (
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 text-amber-300">
                <Flame className="w-4 h-4" />
                <span className="text-lg font-bold">{plan.streak}</span>
              </div>
              <span className="text-sky-200 text-xs">day streak</span>
            </div>
          )}

          {/* Progress */}
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold">
              {completedCount}/{totalCount}
            </span>
            <span className="text-sky-200 text-xs">actions</span>
          </div>

          {/* Time planned */}
          <div className="flex flex-col items-center">
            <span className="text-lg font-bold">{plan.totalPlannedMinutes}m</span>
            <span className="text-sky-200 text-xs">planned</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-sky-200 mb-1.5">
          <span>{pendingCount} remaining</span>
          <span>
            {totalCount > 0
              ? Math.round((completedCount / totalCount) * 100)
              : 0}
            % complete
          </span>
        </div>
        <div className="h-2 bg-sky-800/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-white/80 rounded-full transition-all duration-500"
            style={{
              width:
                totalCount > 0
                  ? `${(completedCount / totalCount) * 100}%`
                  : "0%",
            }}
          />
        </div>
      </div>

      {/* Replan button */}
      <div className="mt-3 flex justify-end">
        <button
          onClick={onReplan}
          disabled={isReplanning}
          className="flex items-center gap-1.5 text-xs text-sky-100 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
        >
          <RotateCcw className={`w-3 h-3 ${isReplanning ? "animate-spin" : ""}`} />
          {isReplanning ? "Replanning…" : "Adaptive Replan"}
        </button>
      </div>
    </div>
  );
}
