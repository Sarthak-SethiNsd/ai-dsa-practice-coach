"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DailyPracticeSession } from "@/services/types";
import { useSessionArchive } from "@/hooks/useSessionArchive";
import { useAppContext } from "@/context/AppContext";
import { HistoryStatsSummary } from "@/components/history/HistoryStatsSummary";
import {
  HistoryFiltersBar,
  HistoryFilters,
  PlatformFilter,
  StatusFilter,
  DateFilter,
} from "@/components/history/HistoryFiltersBar";
import { SessionHistoryCard } from "@/components/history/SessionHistoryCard";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ClipboardList } from "lucide-react";

const DEFAULT_FILTERS: HistoryFilters = {
  search: "",
  platform: "all",
  status: "all",
  date: "all",
  sort: "newest",
};

// ──────────────────────────────────────────────
// Filtering helpers
// ──────────────────────────────────────────────

function getTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function matchesDateFilter(sessionDate: string, filter: DateFilter): boolean {
  if (filter === "all") return true;
  const today = getTodayStr();
  if (filter === "today") return sessionDate === today;

  const now = new Date();
  const [y, mo, d] = sessionDate.split("-").map(Number);
  const sDate = new Date(y, mo - 1, d);

  if (filter === "week") {
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return sDate >= weekAgo;
  }
  if (filter === "month") {
    const monthAgo = new Date(now);
    monthAgo.setMonth(now.getMonth() - 1);
    return sDate >= monthAgo;
  }
  return true;
}

function matchesPlatformFilter(session: DailyPracticeSession, filter: PlatformFilter): boolean {
  if (filter === "all") return true;
  return session.questions.some(q => q.platform === filter);
}

function matchesStatusFilter(session: DailyPracticeSession, filter: StatusFilter): boolean {
  const { totalQuestions, completedCount, inProgressCount } = session.metadata;
  if (filter === "all") return true;
  if (filter === "completed") return completedCount === totalQuestions && totalQuestions > 0;
  if (filter === "in-progress") return inProgressCount > 0;
  if (filter === "partial") return completedCount > 0 && completedCount < totalQuestions;
  return true;
}

function matchesTopicSearch(session: DailyPracticeSession, search: string): boolean {
  if (!search.trim()) return true;
  const q = search.toLowerCase();
  return session.metadata.topicsCovered.some(t => t.toLowerCase().includes(q));
}

function completionPct(session: DailyPracticeSession): number {
  const { totalQuestions, completedCount } = session.metadata;
  return totalQuestions > 0 ? completedCount / totalQuestions : 0;
}

function applyFiltersAndSort(
  sessions: DailyPracticeSession[],
  filters: HistoryFilters
): DailyPracticeSession[] {
  const filtered = sessions.filter(
    s =>
      matchesPlatformFilter(s, filters.platform) &&
      matchesStatusFilter(s, filters.status) &&
      matchesDateFilter(s.date, filters.date) &&
      matchesTopicSearch(s, filters.search)
  );

  return [...filtered].sort((a, b) => {
    switch (filters.sort) {
      case "newest":
        return b.date.localeCompare(a.date);
      case "oldest":
        return a.date.localeCompare(b.date);
      case "completion-high":
        return completionPct(b) - completionPct(a);
      case "completion-low":
        return completionPct(a) - completionPct(b);
      default:
        return 0;
    }
  });
}

// ──────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────

export default function History() {
  const router = useRouter();
  const { selectReviewProblem } = useAppContext();
  const { sessions, loading } = useSessionArchive();

  const [filters, setFilters] = React.useState<HistoryFilters>(DEFAULT_FILTERS);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const filteredSessions = React.useMemo(
    () => applyFiltersAndSort(sessions, filters),
    [sessions, filters]
  );

  const handleOpenQuestion = React.useCallback(
    (problemId: number) => {
      selectReviewProblem(problemId);
      router.push("/review");
    },
    [selectReviewProblem, router]
  );

  const handleToggle = React.useCallback((sessionId: string) => {
    setExpandedId(prev => (prev === sessionId ? null : sessionId));
  }, []);

  return (
    <div className="space-y-8 select-none">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Practice History
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed">
          Browse every daily practice session, review individual questions, and track your progress over time.
        </p>
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        /* ── Empty State ── */
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
              <ClipboardList className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-xs">
              <h3 className="text-base font-bold text-slate-800">No sessions yet</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Complete questions in Today&apos;s Practice to see your session history here.
              </p>
            </div>
            <Button href="/practice" variant="primary" size="sm" className="mt-2">
              Go to Today&apos;s Practice
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Statistics Summary */}
          <HistoryStatsSummary sessions={sessions} />

          {/* Filters Bar */}
          <HistoryFiltersBar
            filters={filters}
            onFiltersChange={setFilters}
            totalResults={filteredSessions.length}
          />

          {/* Session List */}
          {filteredSessions.length > 0 ? (
            <div className="space-y-4">
              {filteredSessions.map(session => (
                <SessionHistoryCard
                  key={session.sessionId}
                  session={session}
                  isExpanded={expandedId === session.sessionId}
                  onToggle={() => handleToggle(session.sessionId)}
                  onOpenQuestion={handleOpenQuestion}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-sm text-slate-500 font-medium">
                  No sessions match your current filters.
                </p>
                <button
                  type="button"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="mt-2 text-xs text-sky-600 hover:underline font-semibold"
                >
                  Clear filters
                </button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}