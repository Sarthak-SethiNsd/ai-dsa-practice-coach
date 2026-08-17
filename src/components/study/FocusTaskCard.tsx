"use client";

import * as React from "react";
import { StudyTask } from "@/services/study/studyTypes";
import {
  ExternalLink,
  CheckCircle2,
  XCircle,
  SkipForward,
  BookmarkPlus,
  Clock,
  Sparkles,
} from "lucide-react";

interface Props {
  task: StudyTask;
  taskIndex: number;
  totalTasks: number;
  onSolved: () => void;
  onFailed: () => void;
  onSkip: () => void;
  onAddToRevision: () => void;
  onEndSession: () => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Hard: "bg-rose-100 text-rose-700 border-rose-200",
};

const TASK_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  overdue_revision: { label: "Overdue Revision", color: "bg-rose-100 text-rose-700" },
  due_revision: { label: "Due SRS Revision", color: "bg-violet-100 text-violet-700" },
  weak_topic: { label: "Weak Topic Practice", color: "bg-amber-100 text-amber-700" },
  roadmap_priority: { label: "Roadmap Mission", color: "bg-indigo-100 text-indigo-700" },
  ai_recommendation: { label: "AI Recommendation", color: "bg-sky-100 text-sky-700" },
  contest_requirement: { label: "Contest Prep", color: "bg-orange-100 text-orange-700" },
};

export function FocusTaskCard({
  task,
  taskIndex,
  totalTasks,
  onSolved,
  onFailed,
  onSkip,
  onAddToRevision,
  onEndSession,
}: Props) {
  const [addedToRev, setAddedToRev] = React.useState(false);
  const typeMeta = TASK_TYPE_LABELS[task.taskType] || { label: "Active Task", color: "bg-slate-100 text-slate-700" };

  const handleAddRev = () => {
    onAddToRevision();
    setAddedToRev(true);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
      {/* Top Meta Badges */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-xs font-extrabold uppercase">
            Task {taskIndex + 1} of {totalTasks}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold capitalize ${typeMeta.color}`}>
            {typeMeta.label}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${DIFFICULTY_COLORS[task.difficulty] || "bg-slate-100"}`}>
            {task.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
          <Clock className="w-3.5 h-3.5" /> Est: {task.estimatedMinutes} mins
        </div>
      </div>

      {/* Problem Title */}
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {task.title}
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {task.topics.map((topic) => (
            <span
              key={topic}
              className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Action Prompt */}
      <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            Platform Task
          </span>
          <p className="text-sm font-semibold text-slate-700">
            Solve this problem on {task.platform} and mark your result below.
          </p>
        </div>

        {task.problemUrl && (
          <a
            href={task.problemUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer shrink-0 shadow-sm"
          >
            Open on {task.platform}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={onSolved}
          className="w-full sm:flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
        >
          <CheckCircle2 className="w-4 h-4" />
          Mark Solved
        </button>

        <button
          type="button"
          onClick={onFailed}
          className="w-full sm:flex-1 py-3.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-sm font-extrabold rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <XCircle className="w-4 h-4" />
          Mark Failed
        </button>

        <button
          type="button"
          onClick={onSkip}
          className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-extrabold rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          <SkipForward className="w-4 h-4" />
          Skip
        </button>

        <button
          type="button"
          onClick={handleAddRev}
          disabled={addedToRev}
          className="w-full sm:w-auto px-4 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <BookmarkPlus className="w-4 h-4 text-violet-500" />
          {addedToRev ? "Added to SRS" : "Add to SRS"}
        </button>
      </div>

      <div className="text-right">
        <button
          type="button"
          onClick={onEndSession}
          className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
        >
          End Session Early →
        </button>
      </div>
    </div>
  );
}
