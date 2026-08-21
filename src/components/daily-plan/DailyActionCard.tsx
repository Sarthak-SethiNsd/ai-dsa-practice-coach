"use client";

import {
  CheckCircle2,
  Clock,
  ExternalLink,
  SkipForward,
  RotateCcw,
  AlertTriangle,
  BookOpen,
  Layers,
  Target,
  Sword,
  Brain,
  Trophy,
  RefreshCcw,
  Briefcase,
} from "lucide-react";
import { DailyAction, ActionType } from "@/services/dailyPlan/dailyPlanTypes";
import { PriorityBadge } from "./PriorityBadge";
import { WhyThisAction } from "./WhyThisAction";

// ─── Action Type Meta ──────────────────────────────────────────────────────────

const ACTION_META: Record<
  ActionType,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  REVISION: {
    label: "SRS Revision",
    icon: RotateCcw,
    color: "text-purple-600",
    bg: "bg-purple-50 border-purple-200",
  },
  RECOMMENDED_PROBLEM: {
    label: "Recommended",
    icon: Target,
    color: "text-sky-600",
    bg: "bg-sky-50 border-sky-200",
  },
  WEAK_TOPIC_PRACTICE: {
    label: "Weak Topic",
    icon: Sword,
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-200",
  },
  PATTERN_PRACTICE: {
    label: "Pattern Practice",
    icon: Layers,
    color: "text-indigo-600",
    bg: "bg-indigo-50 border-indigo-200",
  },
  CONTEST_PREP: {
    label: "Contest Prep",
    icon: Trophy,
    color: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-200",
  },
  STUDY_SESSION: {
    label: "Study Session",
    icon: BookOpen,
    color: "text-teal-600",
    bg: "bg-teal-50 border-teal-200",
  },
  REVIEW_PREVIOUS_MISTAKE: {
    label: "Mistake Review",
    icon: Brain,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
  },
  ROADMAP_STEP: {
    label: "Roadmap Step",
    icon: RefreshCcw,
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
  },
  MOCK_INTERVIEW: {
    label: "Mock Interview",
    icon: Briefcase,
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
  },
};

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "text-emerald-700 bg-emerald-50 border-emerald-200",
  medium: "text-amber-700 bg-amber-50 border-amber-200",
  hard: "text-red-700 bg-red-50 border-red-200",
};

// ─── Component ─────────────────────────────────────────────────────────────────

interface DailyActionCardProps {
  action: DailyAction;
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  onUndo: (id: string) => void;
}

export function DailyActionCard({
  action,
  onComplete,
  onSkip,
  onUndo,
}: DailyActionCardProps) {
  const meta = ACTION_META[action.actionType];
  const Icon = meta.icon;
  const isCompleted = action.status === "completed";
  const isSkipped = action.status === "skipped";
  const isDone = isCompleted || isSkipped;

  const diffClass =
    DIFFICULTY_COLORS[action.difficulty?.toLowerCase() ?? ""] ??
    "text-slate-600 bg-slate-50 border-slate-200";

  return (
    <div
      className={`rounded-xl border p-4 transition-all duration-200 ${
        isCompleted
          ? "bg-emerald-50/60 border-emerald-200 opacity-80"
          : isSkipped
          ? "bg-slate-50/60 border-slate-200 opacity-60"
          : action.priority === "CRITICAL"
          ? "bg-white border-red-200 shadow-sm"
          : "bg-white border-slate-200 hover:border-sky-200 hover:shadow-sm"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border ${meta.bg}`}
        >
          <Icon className={`w-4.5 h-4.5 ${meta.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${meta.bg} ${meta.color}`}>
              {meta.label}
            </span>
            <PriorityBadge priority={action.priority} />
            {action.difficulty && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full border font-medium ${diffClass}`}
              >
                {action.difficulty}
              </span>
            )}
            {action.platform && (
              <span className="text-xs text-slate-400 capitalize">
                {action.platform}
              </span>
            )}
          </div>

          <h3
            className={`text-sm font-semibold leading-snug ${
              isCompleted ? "line-through text-slate-400" : "text-slate-800"
            }`}
          >
            {action.title}
          </h3>

          {action.topic && (
            <p className="text-xs text-slate-500 mt-0.5">Topic: {action.topic}</p>
          )}
        </div>

        {/* Time estimate */}
        <div className="shrink-0 flex items-center gap-1 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          {action.estimatedMinutes}m
        </div>
      </div>

      {/* Description */}
      {!isDone && (
        <p className="mt-2.5 text-xs text-slate-600 leading-relaxed pl-12">
          {action.description}
        </p>
      )}

      {/* Why this action */}
      {!isDone && (
        <div className="pl-12">
          <WhyThisAction action={action} />
        </div>
      )}

      {/* Action buttons */}
      <div className="mt-3 pl-12 flex flex-wrap items-center gap-2">
        {!isDone && (
          <>
            {/* Mark complete */}
            <button
              onClick={() => onComplete(action.id)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark Complete
            </button>

            {/* Open platform */}
            {action.problemUrl && (
              <a
                href={action.problemUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Problem
              </a>
            )}

            {/* Skip */}
            <button
              onClick={() => onSkip(action.id)}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              <SkipForward className="w-3.5 h-3.5" />
              Skip
            </button>
          </>
        )}

        {/* Undo */}
        {isDone && (
          <button
            onClick={() => onUndo(action.id)}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Undo
          </button>
        )}

        {/* Status badge */}
        {isCompleted && (
          <span className="flex items-center gap-1 text-xs text-emerald-700 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        )}
        {isSkipped && (
          <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
            <AlertTriangle className="w-3.5 h-3.5" /> Skipped
          </span>
        )}
      </div>
    </div>
  );
}
