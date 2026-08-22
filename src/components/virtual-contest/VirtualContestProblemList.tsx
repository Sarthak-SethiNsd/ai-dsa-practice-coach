"use client";

import { VCProblemState } from "@/services/contest/virtualContestTypes";
import { CheckCircle2, Circle, Clock, XCircle, ArrowRight, Lock } from "lucide-react";

interface VirtualContestProblemListProps {
  problems: VCProblemState[];
  activeProblemIndex: number;
  onSelect: (index: number) => void;
  sequentialMode?: boolean;
}

const DIFFICULTY_BADGES = {
  Easy: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Medium: "bg-amber-100 text-amber-800 border-amber-200",
  Hard: "bg-rose-100 text-rose-800 border-rose-200",
};

export function VirtualContestProblemList({
  problems,
  activeProblemIndex,
  onSelect,
  sequentialMode = false,
}: VirtualContestProblemListProps) {
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3 p-1">
      {problems.map((ps, idx) => {
        const isActive = idx === activeProblemIndex;
        const isSolved = ps.status === "solved";
        const isFailed = ps.status === "failed";
        const isSkipped = ps.status === "skipped";
        const isInProgress = ps.status === "in_progress";

        // Sequential mode lock check
        const isLocked =
          sequentialMode &&
          idx > 0 &&
          problems[idx - 1].status !== "solved" &&
          problems[idx - 1].status !== "skipped";

        return (
          <button
            key={ps.problem.id}
            onClick={() => !isLocked && onSelect(idx)}
            disabled={isLocked}
            className={`group relative flex items-center gap-2.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border text-left transition-all select-none ${
              isLocked
                ? "opacity-50 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400"
                : isActive
                ? "bg-sky-50/90 border-sky-500 text-sky-950 shadow-sm ring-2 ring-sky-400/30"
                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
            }`}
          >
            {/* Status Icon */}
            <div className="shrink-0">
              {isLocked ? (
                <Lock className="w-4 h-4 text-slate-400" />
              ) : isSolved ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : isFailed ? (
                <XCircle className="w-4 h-4 text-rose-500" />
              ) : isSkipped ? (
                <ArrowRight className="w-4 h-4 text-slate-400" />
              ) : isInProgress ? (
                <Clock className="w-4 h-4 text-sky-600 animate-pulse" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300" />
              )}
            </div>

            {/* Label & Title */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-xs uppercase tracking-wider text-slate-900">
                  {ps.problem.contestLabel}
                </span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                    DIFFICULTY_BADGES[ps.problem.difficulty]
                  }`}
                >
                  {ps.problem.difficulty}
                </span>
              </div>
              <span className="text-xs font-medium text-slate-600 truncate max-w-[110px] sm:max-w-[140px]">
                {ps.problem.title}
              </span>
            </div>

            {/* Points / Result Badge */}
            <div className="ml-auto pl-1">
              {isSolved ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  +{ps.problem.basePoints}
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-400">
                  {ps.problem.basePoints} pts
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
