"use client";

import * as React from "react";
import { PracticeSessionHistoryItem, SESSION_MODE_CONFIGS } from "@/services/practice/practiceTypes";
import { getSessionHistory } from "@/services/practice/practiceSessionStorage";

interface PracticeSessionHistoryProps {
  onOpenReport?: (sessionId: string) => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  return m > 0 ? `${m}m` : "<1m";
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 88 ? "bg-green-100 text-green-800" :
    score >= 72 ? "bg-sky-100 text-sky-800" :
    score >= 55 ? "bg-amber-100 text-amber-800" :
    score >= 38 ? "bg-orange-100 text-orange-700" :
    "bg-red-100 text-red-700";

  return (
    <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${color}`}>
      {score}
    </span>
  );
}

function StatusBadge({ status }: { status: PracticeSessionHistoryItem["status"] }) {
  const config = {
    COMPLETED: { color: "bg-green-100 text-green-700", label: "Completed" },
    ABANDONED: { color: "bg-orange-100 text-orange-700", label: "Abandoned" },
    EXPIRED: { color: "bg-red-100 text-red-700", label: "Expired" },
    ACTIVE: { color: "bg-sky-100 text-sky-700", label: "Active" },
    PAUSED: { color: "bg-indigo-100 text-indigo-700", label: "Paused" },
    NOT_STARTED: { color: "bg-slate-100 text-slate-700", label: "Not Started" },
  }[status] ?? { color: "bg-slate-100 text-slate-700", label: status };

  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
}

export function PracticeSessionHistory({ onOpenReport }: PracticeSessionHistoryProps) {
  const [history] = React.useState<PracticeSessionHistoryItem[]>(() => {
    try {
      return getSessionHistory();
    } catch {
      return [];
    }
  });

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-12 px-4 text-center">
        <p className="text-3xl mb-3">📋</p>
        <p className="text-sm font-bold text-slate-700">No sessions yet</p>
        <p className="text-xs text-slate-500 mt-1">Complete your first Adaptive Practice Session to see history here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">Session History</h3>
        <span className="text-xs text-slate-500">{history.length} session{history.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="space-y-2">
        {history.map((item) => {
          const modeConfig = SESSION_MODE_CONFIGS.find((m) => m.mode === item.mode);
          return (
            <div
              key={item.sessionId}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:border-sky-200 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">{modeConfig?.icon ?? "🧠"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-bold text-slate-800 truncate">{item.goalTitle}</p>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                    <span>{formatDate(item.date)}</span>
                    <span>·</span>
                    <span>{modeConfig?.label ?? item.mode}</span>
                    <span>·</span>
                    <span>{item.durationMinutes}m planned</span>
                    {item.actualDurationSeconds > 0 && (
                      <>
                        <span>·</span>
                        <span className="text-slate-400">{formatDuration(item.actualDurationSeconds)} actual</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <ScoreBadge score={item.score.overallScore} />
                    <span className="text-xs text-slate-600">
                      {item.problemsSolved}/{item.problemsAttempted} solved ({item.completionRate}%)
                    </span>
                    <span className="text-xs text-sky-600 font-medium">{item.primarySkill}</span>
                    <span className="text-xs text-indigo-600 font-medium">{item.primaryPattern}</span>
                  </div>
                </div>
                {onOpenReport && (
                  <button
                    onClick={() => onOpenReport(item.sessionId)}
                    className="shrink-0 text-xs font-bold text-sky-600 hover:text-sky-800 border border-sky-200 hover:bg-sky-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    View →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
