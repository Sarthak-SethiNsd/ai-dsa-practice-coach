"use client";

import { Clock, PauseCircle, AlertTriangle } from "lucide-react";

interface VirtualContestTimerProps {
  remainingSeconds: number;
  totalDurationSeconds: number;
  isPaused: boolean;
  className?: string;
}

export function VirtualContestTimer({
  remainingSeconds,
  totalDurationSeconds,
  isPaused,
  className = "",
}: VirtualContestTimerProps) {
  const h = Math.floor(remainingSeconds / 3600);
  const m = Math.floor((remainingSeconds % 3600) / 60);
  const s = remainingSeconds % 60;

  const formattedTime =
    h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  const pctRemaining =
    totalDurationSeconds > 0
      ? Math.max(0, Math.min(100, (remainingSeconds / totalDurationSeconds) * 100))
      : 0;

  const isUrgent = remainingSeconds <= 60 && remainingSeconds > 0;
  const isWarning = remainingSeconds <= 300 && remainingSeconds > 60;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-sm font-mono font-bold transition-all ${
          isPaused
            ? "bg-amber-50 text-amber-800 border-amber-300"
            : isUrgent
            ? "bg-rose-50 text-rose-700 border-rose-300 animate-pulse"
            : isWarning
            ? "bg-amber-50 text-amber-700 border-amber-300"
            : "bg-slate-900 text-emerald-400 border-slate-800 shadow-inner"
        }`}
      >
        {isPaused ? (
          <PauseCircle className="w-4 h-4 text-amber-600 shrink-0" />
        ) : isUrgent ? (
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
        ) : (
          <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
        )}
        <span className="tracking-wider">{formattedTime}</span>
        {isPaused && (
          <span className="text-[10px] uppercase tracking-widest font-sans font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">
            PAUSED
          </span>
        )}
      </div>

      {/* Mini Progress Bar */}
      <div className="hidden sm:block w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isUrgent
              ? "bg-rose-500"
              : isWarning
              ? "bg-amber-500"
              : "bg-emerald-500"
          }`}
          style={{ width: `${pctRemaining}%` }}
        />
      </div>
    </div>
  );
}
