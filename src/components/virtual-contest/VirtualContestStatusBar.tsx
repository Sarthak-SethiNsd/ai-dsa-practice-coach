"use client";

import { VCSession } from "@/services/contest/virtualContestTypes";
import { Zap, AlertOctagon, CheckCircle2, Target } from "lucide-react";

interface VirtualContestStatusBarProps {
  session: VCSession;
}

export function VirtualContestStatusBar({ session }: VirtualContestStatusBarProps) {
  const elapsedSeconds = session.totalDurationSeconds - session.remainingSeconds;
  const elapsedMinutes = Math.round(elapsedSeconds / 60);

  return (
    <div className="sticky bottom-0 z-20 bg-slate-900 text-white border-t border-slate-800 px-4 py-2.5 sm:px-6 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4 max-w-7xl mx-auto text-xs">
        {/* Left: Score & Solved */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5 font-semibold">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Current Score:</span>
            <span className="font-mono text-emerald-400 font-bold text-sm">
              {session.totalScore} pts
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            <span className="text-slate-400">Solved:</span>
            <span className="font-mono font-bold text-slate-100">
              {session.solvedCount} / {session.problems.length}
            </span>
          </div>

          {session.totalPenaltyMinutes > 0 && (
            <div className="flex items-center gap-1.5 text-amber-400">
              <AlertOctagon className="w-4 h-4 shrink-0" />
              <span className="text-slate-400">Penalty:</span>
              <span className="font-mono font-bold">
                +{session.totalPenaltyMinutes}m
              </span>
            </div>
          )}
        </div>

        {/* Right: Elapsed Time & Active Problem Status */}
        <div className="flex items-center gap-4 text-slate-400">
          <div className="hidden sm:flex items-center gap-1.5">
            <Target className="w-4 h-4 text-slate-500" />
            <span>Problem:</span>
            <span className="font-mono font-bold text-slate-200 uppercase">
              {session.problems[session.activeProblemIndex]?.problem.contestLabel || "A"} (
              {session.problems[session.activeProblemIndex]?.status.replace("_", " ")})
            </span>
          </div>

          <div>
            <span>Elapsed: </span>
            <span className="font-mono text-slate-200">{elapsedMinutes}m</span>
          </div>
        </div>
      </div>
    </div>
  );
}
