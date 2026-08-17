"use client";

import * as React from "react";
import { StudyTask } from "@/services/study/studyTypes";
import { CheckCircle2, XCircle, SkipForward, Circle, ListOrdered } from "lucide-react";

interface Props {
  tasks: StudyTask[];
  currentIndex: number;
  onSelectTask: (index: number) => void;
}

export function SessionTaskQueue({ tasks, currentIndex, onSelectTask }: Props) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListOrdered className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
            Session Task Queue
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-semibold">
          {tasks.filter((t) => t.status === "solved").length} / {tasks.length} Solved
        </span>
      </div>

      <div className="space-y-2">
        {tasks.map((task, idx) => {
          const isActive = idx === currentIndex;
          const isSolved = task.status === "solved";
          const isFailed = task.status === "failed";
          const isSkipped = task.status === "skipped";

          return (
            <button
              key={task.id}
              type="button"
              onClick={() => onSelectTask(idx)}
              className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                isActive
                  ? "bg-sky-50 border-sky-300 ring-2 ring-sky-200"
                  : isSolved
                  ? "bg-emerald-50/50 border-emerald-100"
                  : isFailed
                  ? "bg-rose-50/50 border-rose-100"
                  : "bg-slate-50 border-slate-100 hover:border-slate-200"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-extrabold text-xs shrink-0">
                  {idx + 1}
                </span>

                <div className="min-w-0">
                  <p className={`text-xs font-extrabold truncate ${isActive ? "text-sky-900" : "text-slate-800"}`}>
                    {task.title}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold truncate">
                    {task.platform} · {task.difficulty} · {task.topics.join(", ")}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                {isSolved ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : isFailed ? (
                  <XCircle className="w-4 h-4 text-rose-500" />
                ) : isSkipped ? (
                  <SkipForward className="w-4 h-4 text-slate-400" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
