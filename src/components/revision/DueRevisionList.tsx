"use client";

import * as React from "react";
import { RevisionItem } from "@/services/revision/revisionTypes";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  Brain,
  Sparkles,
} from "lucide-react";

interface Props {
  dueItems: RevisionItem[];
  overdueItems: RevisionItem[];
  upcomingItems: RevisionItem[];
  onStartWorkspaceItem: (item: RevisionItem) => void;
  onMarkRemembered: (id: string) => void;
  onMarkForgotten: (id: string) => void;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
  Hard: "bg-rose-100 text-rose-700 border-rose-200",
};

const PLATFORM_COLORS: Record<string, string> = {
  leetcode: "bg-orange-100 text-orange-700 border-orange-200",
  codeforces: "bg-blue-100 text-blue-700 border-blue-200",
};

function RevisionItemRow({
  item,
  onStart,
  onRemembered,
  onForgotten,
}: {
  item: RevisionItem;
  onStart: () => void;
  onRemembered: () => void;
  onForgotten: () => void;
}) {
  const isOverdue = item.status === "overdue";

  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        isOverdue
          ? "bg-rose-50/40 border-rose-200/70 hover:border-rose-300"
          : "bg-white border-slate-100 hover:border-slate-200"
      } shadow-xs space-y-3`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${
                PLATFORM_COLORS[item.platform] || "bg-slate-100 text-slate-700"
              }`}
            >
              {item.platform}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                DIFFICULTY_COLORS[item.difficulty] || "bg-slate-100 text-slate-700"
              }`}
            >
              {item.difficulty}
            </span>
            {isOverdue && (
              <span className="flex items-center gap-1 text-xs font-extrabold text-rose-600 bg-rose-100 border border-rose-200 px-2.5 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3" /> Overdue
              </span>
            )}
          </div>
          <h4 className="text-base font-extrabold text-slate-900 truncate">
            {item.problemTitle}
          </h4>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors"
              title="Open problem on platform"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            type="button"
            onClick={onStart}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            Revise
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Topics & SRS Stats */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
        <div className="flex flex-wrap gap-1.5">
          {item.topics.map((t) => (
            <span
              key={t}
              className="px-2 py-0.5 bg-slate-100 text-slate-600 font-semibold rounded-md"
            >
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <Brain className="w-3.5 h-3.5 text-violet-500" />
            Memory: <strong className="text-slate-800">{item.memoryStrength}%</strong>
          </span>
          <span>Due: <strong className="text-slate-800">{item.nextDueDate}</strong></span>
          <span>Interval: <strong className="text-slate-800">{item.intervalDays}d</strong></span>
        </div>
      </div>

      {/* Quick feedback buttons */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onRemembered}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Mark Remembered
        </button>
        <button
          type="button"
          onClick={onForgotten}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
        >
          <XCircle className="w-3.5 h-3.5" />
          Mark Forgotten
        </button>
      </div>
    </div>
  );
}

export function DueRevisionList({
  dueItems,
  overdueItems,
  upcomingItems,
  onStartWorkspaceItem,
  onMarkRemembered,
  onMarkForgotten,
}: Props) {
  const [activeSection, setActiveSection] = React.useState<"due" | "upcoming">("due");

  const pendingItems = [...overdueItems, ...dueItems];

  return (
    <div className="space-y-6">
      {/* Section toggle */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveSection("due")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeSection === "due"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Clock className="w-4 h-4 text-rose-500" />
            <span>Ready for Revision ({pendingItems.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("upcoming")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              activeSection === "upcoming"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-4 h-4 text-sky-500" />
            <span>Upcoming ({upcomingItems.length})</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
          SM-2 Adaptive Spaced Repetition Queue
        </span>
      </div>

      {/* Due / Overdue section */}
      {activeSection === "due" && (
        <div className="space-y-4">
          {pendingItems.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-lg font-extrabold text-slate-800">
                You&apos;re completely caught up!
              </h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                Great job! No revisions are due or overdue right now. Check back tomorrow or review upcoming items early.
              </p>
            </div>
          ) : (
            pendingItems.map((item) => (
              <RevisionItemRow
                key={item.id}
                item={item}
                onStart={() => onStartWorkspaceItem(item)}
                onRemembered={() => onMarkRemembered(item.id)}
                onForgotten={() => onMarkForgotten(item.id)}
              />
            ))
          )}
        </div>
      )}

      {/* Upcoming section */}
      {activeSection === "upcoming" && (
        <div className="space-y-4">
          {upcomingItems.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400">
              No upcoming items scheduled.
            </div>
          ) : (
            upcomingItems.map((item) => (
              <RevisionItemRow
                key={item.id}
                item={item}
                onStart={() => onStartWorkspaceItem(item)}
                onRemembered={() => onMarkRemembered(item.id)}
                onForgotten={() => onMarkForgotten(item.id)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
