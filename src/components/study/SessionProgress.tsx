"use client";

import * as React from "react";
import { StudyTask } from "@/services/study/studyTypes";

interface Props {
  tasks: StudyTask[];
  durationMinutes: number;
  timerSeconds: number;
}

export function SessionProgress({ tasks, durationMinutes, timerSeconds }: Props) {
  const totalTasks = tasks.length;
  const solvedCount = tasks.filter((t) => t.status === "solved").length;
  const completionPct = totalTasks > 0 ? Math.round((solvedCount / totalTasks) * 100) : 0;

  const totalTimeSeconds = durationMinutes * 60;
  const elapsedSeconds = Math.max(0, totalTimeSeconds - timerSeconds);
  const timeProgressPct = Math.min(100, Math.round((elapsedSeconds / totalTimeSeconds) * 100));

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Task completion progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-extrabold">
            <span className="text-slate-500 uppercase tracking-wider">Task Progress</span>
            <span className="text-emerald-600">{solvedCount}/{totalTasks} ({completionPct}%)</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>

        {/* Time progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-extrabold">
            <span className="text-slate-500 uppercase tracking-wider">Time Budget</span>
            <span className="text-sky-600">{timeProgressPct}% Used</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5">
            <div
              className="h-2.5 rounded-full bg-sky-500 transition-all duration-500"
              style={{ width: `${timeProgressPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
