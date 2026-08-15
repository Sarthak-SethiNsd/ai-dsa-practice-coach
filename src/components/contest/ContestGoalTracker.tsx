"use client";

import * as React from "react";
import {
  ContestGoal,
  ContestGoalCategory,
} from "@/services/contest/contestTypes";
import {
  Target,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Trophy,
  Activity,
  BookOpen,
  Repeat,
} from "lucide-react";

interface Props {
  goals: ContestGoal[];
  onOpenAddGoal: () => void;
  onDeleteGoal: (id: string) => void;
}

const CATEGORY_CONFIG: Record<
  ContestGoalCategory,
  { icon: React.ElementType; label: string; color: string; bg: string }
> = {
  rating: {
    icon: Trophy,
    label: "Rating Goal",
    color: "text-sky-700",
    bg: "bg-sky-50 border-sky-100",
  },
  participation: {
    icon: Activity,
    label: "Participation Goal",
    color: "text-violet-700",
    bg: "bg-violet-50 border-violet-100",
  },
  topic_mastery: {
    icon: BookOpen,
    label: "Topic Mastery",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-100",
  },
  consistency: {
    icon: Repeat,
    label: "Consistency Goal",
    color: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-100",
  },
};

function GoalCard({
  goal,
  onDelete,
}: {
  goal: ContestGoal;
  onDelete: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const cfg = CATEGORY_CONFIG[goal.category];
  const Icon = cfg.icon;

  const statusIcon =
    goal.status === "completed" ? (
      <CheckCircle className="w-4 h-4 text-emerald-500" />
    ) : goal.status === "at_risk" ? (
      <AlertCircle className="w-4 h-4 text-rose-500" />
    ) : (
      <Clock className="w-4 h-4 text-sky-500" />
    );

  const barColor =
    goal.status === "completed"
      ? "bg-emerald-500"
      : goal.status === "at_risk"
      ? "bg-rose-400"
      : "bg-sky-500";

  return (
    <div className={`bg-white border rounded-2xl p-5 shadow-xs space-y-4 ${cfg.bg}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`p-2 rounded-xl border ${cfg.bg} ${cfg.color} shrink-0`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-slate-800 leading-tight">
              {goal.title}
            </p>
            <p className={`text-xs font-bold ${cfg.color} mt-0.5`}>
              {cfg.label}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {statusIcon}
          {confirmDelete ? (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => { onDelete(); setConfirmDelete(false); }}
                className="text-xs font-bold text-rose-600 cursor-pointer"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-xs font-bold text-slate-400 cursor-pointer ml-1"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="p-1 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-500 font-medium">Progress</span>
          <span className="text-xs font-extrabold text-slate-700 tabular-nums">
            {goal.currentValue} / {goal.targetValue} {goal.unit}
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${barColor} transition-all duration-700`}
            style={{ width: `${goal.completionPercentage}%` }}
          />
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-400">{goal.completionPercentage}% complete</span>
          <span className={`text-xs font-bold capitalize ${
            goal.status === "completed"
              ? "text-emerald-600"
              : goal.status === "at_risk"
              ? "text-rose-600"
              : "text-sky-600"
          }`}>
            {goal.status.replace("_", " ")}
          </span>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
        <div>
          <p className="text-xs text-slate-400 font-medium">Target Date</p>
          <p className="text-xs font-bold text-slate-700">{goal.targetDate}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium">Est. Completion</p>
          <p className="text-xs font-bold text-slate-700">
            {goal.estimatedCompletionDate}
          </p>
        </div>
      </div>

      {/* Success prediction */}
      <div className="flex items-center justify-between bg-white/70 px-3 py-2 rounded-xl">
        <span className="text-xs text-slate-500 font-medium">Success Likelihood</span>
        <span
          className={`text-xs font-extrabold ${
            goal.predictedSuccessPercentage >= 70
              ? "text-emerald-600"
              : goal.predictedSuccessPercentage >= 40
              ? "text-amber-600"
              : "text-rose-600"
          }`}
        >
          {goal.predictedSuccessPercentage}%
        </span>
      </div>
    </div>
  );
}

export function ContestGoalTracker({ goals, onOpenAddGoal, onDeleteGoal }: Props) {
  const completed = goals.filter((g) => g.status === "completed").length;
  const atRisk = goals.filter((g) => g.status === "at_risk").length;
  const inProgress = goals.filter((g) => g.status === "in_progress").length;

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "In Progress", value: inProgress, color: "text-sky-600", bg: "bg-sky-50" },
          { label: "Completed", value: completed, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "At Risk", value: atRisk, color: "text-rose-600", bg: "bg-rose-50" },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.bg} border border-slate-100 rounded-2xl p-4 text-center shadow-xs`}
          >
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Header + Add */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-extrabold text-slate-700 uppercase tracking-wide">
            {goals.length} Goal{goals.length !== 1 ? "s" : ""}
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenAddGoal}
          className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      {/* Goals grid */}
      {goals.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <Target className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-400">No goals set yet</p>
          <button
            type="button"
            onClick={onOpenAddGoal}
            className="text-sm text-sky-600 font-bold hover:underline cursor-pointer"
          >
            Create your first goal →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDelete={() => onDeleteGoal(goal.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
