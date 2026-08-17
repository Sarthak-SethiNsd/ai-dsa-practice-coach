"use client";

import * as React from "react";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";

interface Props {
  timerSeconds: number;
  isRunning: boolean;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
}

function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function StudyTimer({
  timerSeconds,
  isRunning,
  onPause,
  onResume,
  onRestart,
}: Props) {
  const isWarning = timerSeconds < 300; // < 5 mins

  return (
    <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
          <Clock className="w-6 h-6 text-sky-400" />
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Session Countdown
          </span>
          <p
            className={`text-4xl sm:text-5xl font-black tabular-nums tracking-tight ${
              isWarning ? "text-rose-400 animate-pulse" : "text-white"
            }`}
          >
            {formatTimer(timerSeconds)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isRunning ? (
          <button
            type="button"
            onClick={onPause}
            className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs rounded-2xl transition-colors cursor-pointer border border-white/10"
          >
            <Pause className="w-4 h-4 fill-white" />
            Pause
          </button>
        ) : (
          <button
            type="button"
            onClick={onResume}
            className="flex items-center gap-2 px-5 py-3 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-2xl transition-colors cursor-pointer shadow-md"
          >
            <Play className="w-4 h-4 fill-white" />
            Resume
          </button>
        )}

        <button
          type="button"
          onClick={onRestart}
          className="p-3 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-2xl transition-colors cursor-pointer border border-white/10"
          title="Restart timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
