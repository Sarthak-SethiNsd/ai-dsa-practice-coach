"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DailyPracticeSession } from "@/services/types";
import { ReviewHistoryEntry, ReviewHistorySummary } from "@/services/ai/aiTypes";
import { useSessionArchive } from "@/hooks/useSessionArchive";
import { useReviewHistory } from "@/hooks/useReviewHistory";
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
import { ReviewHistoryCard } from "@/components/reviewHistory/ReviewHistoryCard";
import {
  ReviewHistoryFilters,
  ReviewHistoryFiltersState,
  DEFAULT_REVIEW_HISTORY_FILTERS,
  applyReviewHistoryFilters,
} from "@/components/reviewHistory/ReviewHistoryFilters";
import { ReviewHistoryDetailModal } from "@/components/reviewHistory/ReviewHistoryDetailModal";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ClipboardList, Cpu, Trash2 } from "lucide-react";

// ─── Practice History helpers (unchanged from original) ───────────────────────

const DEFAULT_FILTERS: HistoryFilters = {
  search: "",
  platform: "all",
  status: "all",
  date: "all",
  sort: "newest",
};

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

// ─── Tab type ─────────────────────────────────────────────────────────────────

type ActiveTab = "practice" | "reviews";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function History() {
  const router = useRouter();
  const { selectReviewProblem, showToast } = useAppContext();

  // ── Tab state ──────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = React.useState<ActiveTab>("practice");

  // ── Practice History state ─────────────────────────────────────────────────
  const { sessions, loading: sessionsLoading } = useSessionArchive();
  const [practiceFilters, setPracticeFilters] = React.useState<HistoryFilters>(DEFAULT_FILTERS);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const filteredSessions = React.useMemo(
    () => applyFiltersAndSort(sessions, practiceFilters),
    [sessions, practiceFilters]
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

  // ── Review History state ───────────────────────────────────────────────────
  const { summaries, loading: reviewsLoading, getFullReview, deleteReview, clearHistory } = useReviewHistory();
  const [reviewFilters, setReviewFilters] = React.useState<ReviewHistoryFiltersState>(DEFAULT_REVIEW_HISTORY_FILTERS);

  // Modal state
  const [modalEntry, setModalEntry] = React.useState<ReviewHistoryEntry | null>(null);
  const [modalLoading, setModalLoading] = React.useState(false);
  const [modalOpen, setModalOpen] = React.useState(false);

  // Clear confirm state
  const [showClearConfirm, setShowClearConfirm] = React.useState(false);

  const handleOpenReview = React.useCallback(async (id: string) => {
    setModalOpen(true);
    setModalEntry(null);
    setModalLoading(true);
    const entry = await getFullReview(id);
    setModalEntry(entry);
    setModalLoading(false);
  }, [getFullReview]);

  const handleCloseModal = React.useCallback(() => {
    setModalOpen(false);
    setModalEntry(null);
  }, []);

  const handleDeleteReview = React.useCallback(async (id: string) => {
    await deleteReview(id);
  }, [deleteReview]);

  const handleClearHistory = React.useCallback(async () => {
    await clearHistory();
    setShowClearConfirm(false);
  }, [clearHistory]);

  // Apply review filters
  const filteredReviewSummaries = React.useMemo((): ReviewHistorySummary[] => {
    return applyReviewHistoryFilters(summaries, reviewFilters);
  }, [summaries, reviewFilters]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 select-none max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          History
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed">
          Browse your practice sessions and AI code reviews.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("practice")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "practice"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Practice History
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "reviews"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Cpu className="w-4 h-4" />
          AI Review History
          {summaries.length > 0 && (
            <span className="ml-0.5 px-1.5 py-0.5 bg-sky-100 text-sky-700 rounded-full text-[10px] font-bold">
              {summaries.length}
            </span>
          )}
        </button>
      </div>

      {/* ── PRACTICE HISTORY TAB ── */}
      {activeTab === "practice" && (
        <>
          {sessionsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
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
              <HistoryStatsSummary sessions={sessions} />
              <HistoryFiltersBar
                filters={practiceFilters}
                onFiltersChange={setPracticeFilters}
                totalResults={filteredSessions.length}
              />
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
                      onClick={() => setPracticeFilters(DEFAULT_FILTERS)}
                      className="mt-2 text-xs text-sky-600 hover:underline font-semibold"
                    >
                      Clear filters
                    </button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}

      {/* ── AI REVIEW HISTORY TAB ── */}
      {activeTab === "reviews" && (
        <>
          {reviewsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : summaries.length === 0 ? (
            <Card>
              <CardContent className="py-16 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400">
                  <Cpu className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <h3 className="text-base font-bold text-slate-800">No reviews saved yet</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Every time you run a Review AI analysis, it&apos;s automatically saved here for future reference.
                  </p>
                </div>
                <Button href="/review" variant="primary" size="sm" className="mt-2">
                  Go to AI Review
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Filters */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <ReviewHistoryFilters
                  filters={reviewFilters}
                  onChange={setReviewFilters}
                  summaries={summaries}
                  resultCount={filteredReviewSummaries.length}
                />
              </div>

              {/* Clear all button */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 font-medium">
                  {summaries.length} review{summaries.length !== 1 ? "s" : ""} saved
                </p>
                {!showClearConfirm ? (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear All History
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-700 font-semibold">Delete all {summaries.length} reviews?</span>
                    <button
                      onClick={handleClearHistory}
                      className="px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Card grid */}
              {filteredReviewSummaries.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredReviewSummaries.map(s => (
                    <ReviewHistoryCard
                      key={s.id}
                      summary={s}
                      onOpen={handleOpenReview}
                      onDelete={handleDeleteReview}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-sm text-slate-500 font-medium">No reviews match your filters.</p>
                    <button
                      onClick={() => setReviewFilters(DEFAULT_REVIEW_HISTORY_FILTERS)}
                      className="mt-2 text-xs text-sky-600 hover:underline font-semibold"
                    >
                      Clear filters
                    </button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}

      {/* Detail modal */}
      {modalOpen && (
        <ReviewHistoryDetailModal
          entry={modalEntry}
          loading={modalLoading}
          onClose={handleCloseModal}
          onError={(msg) => showToast(msg)}
        />
      )}
    </div>
  );
}