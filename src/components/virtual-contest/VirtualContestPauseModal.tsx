"use client";

import { VCSession } from "@/services/contest/virtualContestTypes";
import { Play, Flag, PauseCircle, Clock, Trophy } from "lucide-react";

interface VirtualContestPauseModalProps {
  isOpen: boolean;
  session: VCSession | null;
  onResume: () => void;
  onEnd: () => void;
}

export function VirtualContestPauseModal({
  isOpen,
  session,
  onResume,
  onEnd,
}: VirtualContestPauseModalProps) {
  if (!isOpen || !session) return null;

  const m = Math.floor(session.remainingSeconds / 60);
  const s = session.remainingSeconds % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shadow-inner">
          <PauseCircle className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-bold text-slate-900">Contest Paused</h2>
          <p className="text-xs text-slate-500">
            The timer has been suspended. Take a breather or review your high-level strategy.
          </p>
        </div>

        {/* Current State Snapshot */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 font-mono text-xs">
          <div className="p-3 bg-white rounded-xl border border-slate-200/60 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase font-sans font-semibold">
              Time Remaining
            </span>
            <span className="text-base font-bold text-slate-800 mt-1">
              {m}:{String(s).padStart(2, "0")}
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-slate-200/60 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase font-sans font-semibold">
              Current Points
            </span>
            <span className="text-base font-bold text-emerald-600 mt-1">
              {session.totalScore} pts
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={onResume}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            Resume Contest
          </button>

          <button
            onClick={onEnd}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5" />
            End Contest Early & Evaluate
          </button>
        </div>
      </div>
    </div>
  );
}
