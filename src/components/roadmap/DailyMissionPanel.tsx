"use client";

import * as React from "react";
import { Sun, CheckCircle2, Circle, ExternalLink, Clock, ChevronDown } from "lucide-react";
import { DailyMission, PracticeTask } from "@/services/roadmapTypes";

interface DailyMissionPanelProps {
  mission: DailyMission;
  completedTaskIds: Set<string>;
  onComplete: (taskId: string) => Promise<void>;
  onIncomplete: (taskId: string) => Promise<void>;
}

export function DailyMissionPanel({
  mission,
  completedTaskIds,
  onComplete,
  onIncomplete,
}: DailyMissionPanelProps) {
  const [expanded, setExpanded] = React.useState(true);
  const completionPct =
    mission.targetQuestions > 0
      ? Math.round((mission.completedCount / mission.targetQuestions) * 100)
      : 0;

  const formattedDate = new Date(mission.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="roadmap-daily-mission">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between gap-3 mb-4 group cursor-pointer"
        onClick={() => setExpanded((p) => !p)}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600 shrink-0">
            <Sun className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-bold text-slate-900 group-hover:text-violet-700 transition-colors">
              Daily Mission
            </h3>
            <p className="text-xs text-slate-500">{formattedDate}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Progress pill */}
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              mission.isComplete
                ? "bg-emerald-100 text-emerald-700"
                : completionPct > 0
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {mission.completedCount}/{mission.targetQuestions}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-500">
            Focus: <span className="font-semibold text-slate-700">{mission.focusTopic}</span>
          </span>
          <span className="text-xs font-semibold text-slate-700">{completionPct}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* Task list */}
      {expanded && (
        <>
          {/* Motivational note */}
          <p className="text-sm text-slate-600 italic mb-4 border-l-2 border-amber-300 pl-3">
            {mission.motivationalNote}
          </p>

          <div className="flex flex-col gap-3">
            {mission.tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                isCompleted={completedTaskIds.has(task.id)}
                onComplete={onComplete}
                onIncomplete={onIncomplete}
              />
            ))}
          </div>

          {/* Estimated time */}
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            Estimated: <span className="font-semibold text-slate-700">{mission.estimatedDuration}</span>
          </div>
        </>
      )}
    </section>
  );
}

// ─── Task Row ─────────────────────────────────────────────────────────────────

interface TaskRowProps {
  task: PracticeTask;
  isCompleted: boolean;
  onComplete: (id: string) => Promise<void>;
  onIncomplete: (id: string) => Promise<void>;
}

export function TaskRow({ task, isCompleted, onComplete, onIncomplete }: TaskRowProps) {
  const [loading, setLoading] = React.useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      if (isCompleted) {
        await onIncomplete(task.id);
      } else {
        await onComplete(task.id);
      }
    } finally {
      setLoading(false);
    }
  };

  const diffColor =
    task.difficulty === "Easy"
      ? "text-emerald-600 bg-emerald-50"
      : task.difficulty === "Medium"
      ? "text-amber-600 bg-amber-50"
      : "text-red-600 bg-red-50";

  const priorityDot =
    task.priority === "High"
      ? "bg-red-400"
      : task.priority === "Medium"
      ? "bg-amber-400"
      : "bg-emerald-400";

  return (
    <div
      className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-200 ${
        isCompleted
          ? "bg-slate-50 border-slate-100 opacity-70"
          : "bg-white border-slate-200 hover:border-violet-200 hover:shadow-sm"
      }`}
    >
      {/* Completion toggle */}
      <button
        onClick={toggle}
        disabled={loading}
        className="shrink-0 mt-0.5 cursor-pointer"
        aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
      >
        {isCompleted ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        ) : (
          <Circle className="w-5 h-5 text-slate-300 hover:text-violet-400 transition-colors" />
        )}
      </button>

      {/* Task info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <span
            className={`text-sm font-semibold ${isCompleted ? "line-through text-slate-400" : "text-slate-900"}`}
          >
            {task.title}
          </span>
          <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${diffColor}`}>
            {task.difficulty}
          </span>
          <span className={`w-1.5 h-1.5 rounded-full ${priorityDot}`} title={`${task.priority} priority`} />
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="capitalize">{task.platform}</span>
          <span>·</span>
          <span>{task.topic}</span>
          <span>·</span>
          <span className="flex items-center gap-0.5">
            <Clock className="w-3 h-3" />
            {task.estimatedTime}
          </span>
        </div>
      </div>

      {/* External link */}
      <a
        href={task.problemUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
        title="Open problem"
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}
