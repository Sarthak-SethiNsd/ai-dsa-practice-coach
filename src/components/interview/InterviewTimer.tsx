"use client";

import { Clock, AlertTriangle } from "lucide-react";

interface InterviewTimerProps {
  remainingSeconds: number;
  totalDurationSeconds: number;
}

export function InterviewTimer({
  remainingSeconds,
  totalDurationSeconds,
}: InterviewTimerProps) {
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeFormatted = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  const isLowTime = remainingSeconds <= 300; // <= 5 mins
  const isCriticalTime = remainingSeconds <= 60; // <= 1 min
  const progressPercent = Math.max(0, Math.min(100, (remainingSeconds / totalDurationSeconds) * 100));

  return (
    <div
      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border font-mono text-sm font-semibold transition-all duration-300 ${
        isCriticalTime
          ? "bg-red-50 text-red-700 border-red-300 ring-2 ring-red-400/40 animate-pulse"
          : isLowTime
          ? "bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-400/30"
          : "bg-slate-50 text-slate-700 border-slate-200"
      }`}
    >
      {isLowTime ? (
        <AlertTriangle className="w-4 h-4 text-amber-600 animate-bounce" />
      ) : (
        <Clock className="w-4 h-4 text-slate-500" />
      )}
      <span>{timeFormatted}</span>
      <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden shrink-0">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            isLowTime ? "bg-red-500" : "bg-sky-500"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
