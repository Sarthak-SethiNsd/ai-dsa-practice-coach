"use client";

import { useState } from "react";
import { VCSession } from "@/services/contest/virtualContestTypes";
import { VirtualContestTimer } from "./VirtualContestTimer";
import {
  Trophy,
  PauseCircle,
  Flag,
  AlertTriangle,
  Flame,
  CheckCircle2,
} from "lucide-react";

interface VirtualContestHeaderProps {
  session: VCSession;
  onPause: () => void;
  onEnd: () => void;
}

export function VirtualContestHeader({
  session,
  onPause,
  onEnd,
}: VirtualContestHeaderProps) {
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);

  const isLeetCode = session.config.platform === "leetcode";
  const isCodeforces = session.config.platform === "codeforces";

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3 max-w-7xl mx-auto">
        {/* Left: Contest Info */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-slate-900">
                {session.config.contestType} Virtual Contest
              </h1>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  isLeetCode
                    ? "bg-amber-50 text-amber-800 border-amber-200"
                    : isCodeforces
                    ? "bg-blue-50 text-blue-800 border-blue-200"
                    : "bg-purple-50 text-purple-800 border-purple-200"
                }`}
              >
                {session.config.platform}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>Difficulty: {session.config.difficulty}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {session.solvedCount} of {session.problems.length} Solved
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Timer */}
        <div className="flex items-center gap-3">
          <VirtualContestTimer
            remainingSeconds={session.remainingSeconds}
            totalDurationSeconds={session.totalDurationSeconds}
            isPaused={session.isPaused}
          />
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {/* Pause Button */}
          <button
            onClick={onPause}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
          >
            <PauseCircle className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Pause</span>
          </button>

          {/* End Contest Trigger */}
          {showConfirmEnd ? (
            <div className="flex items-center gap-1.5 bg-rose-50 p-1 rounded-xl border border-rose-200 animate-in fade-in">
              <button
                onClick={onEnd}
                className="px-2.5 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-all"
              >
                Confirm End
              </button>
              <button
                onClick={() => setShowConfirmEnd(false)}
                className="px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200/60 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmEnd(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <Flag className="w-4 h-4" />
              <span>End Contest</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
