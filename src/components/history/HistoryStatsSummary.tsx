import * as React from "react";
import { DailyPracticeSession } from "@/services/types";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accentClass?: string;
}

function StatCard({ label, value, sub, accentClass = "text-slate-800" }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1 bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <span className={`text-2xl font-extrabold tabular-nums ${accentClass}`}>{value}</span>
      {sub && <span className="text-xs text-slate-400 font-medium">{sub}</span>}
    </div>
  );
}

/**
 * Parses an estimated-time string like "20 min", "1.5 hrs", "45 mins" etc.
 * Returns the value in minutes.
 */
function parseEstimatedMinutes(estimated: string): number {
  if (!estimated) return 0;
  const lower = estimated.toLowerCase();
  const num = parseFloat(lower.replace(/[^0-9.]/g, "")) || 0;
  if (lower.includes("hr") || lower.includes("hour")) return Math.round(num * 60);
  return Math.round(num); // assume minutes
}

function formatTotalTime(totalMinutes: number): string {
  if (totalMinutes === 0) return "0 min";
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

interface HistoryStatsSummaryProps {
  sessions: DailyPracticeSession[];
}

/**
 * Displays a 6-card statistics summary across all practice sessions.
 * Computations are memoised so re-renders are cheap.
 */
export function HistoryStatsSummary({ sessions }: HistoryStatsSummaryProps) {
  const stats = React.useMemo(() => {
    const totalSessions = sessions.length;
    let totalQuestions = 0;
    let totalCompleted = 0;
    let totalSkipped = 0;
    let totalMinutes = 0;

    for (const session of sessions) {
      totalQuestions += session.metadata.totalQuestions;
      totalCompleted += session.metadata.completedCount;
      totalSkipped += session.metadata.skippedCount;

      for (const q of session.questions) {
        totalMinutes += parseEstimatedMinutes(q.estimated);
      }
    }

    const avgCompletion =
      totalQuestions > 0 ? Math.round((totalCompleted / totalQuestions) * 100) : 0;

    return {
      totalSessions,
      totalQuestions,
      totalCompleted,
      totalSkipped,
      avgCompletion,
      totalTime: formatTotalTime(totalMinutes),
    };
  }, [sessions]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatCard label="Sessions" value={stats.totalSessions} />
      <StatCard label="Questions" value={stats.totalQuestions} />
      <StatCard
        label="Completed"
        value={stats.totalCompleted}
        accentClass="text-emerald-600"
      />
      <StatCard
        label="Skipped"
        value={stats.totalSkipped}
        accentClass="text-amber-500"
      />
      <StatCard
        label="Avg Completion"
        value={`${stats.avgCompletion}%`}
        accentClass="text-sky-600"
      />
      <StatCard label="Practice Time" value={stats.totalTime} />
    </div>
  );
}
