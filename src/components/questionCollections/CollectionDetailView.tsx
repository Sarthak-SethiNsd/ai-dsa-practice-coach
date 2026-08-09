"use client";

import * as React from "react";
import { ReviewCollection } from "@/services/collectionTypes";
import { ReviewHistoryEntry, ReviewCategory } from "@/services/ai/aiTypes";
import { CollectionAnalyticsResult, COLOR_PALETTE } from "@/services/questionCollectionAnalytics";
import {
  ArrowLeft,
  Folder,
  Edit2,
  Trash2,
  X,
  Code2,
  Clock,
  Zap,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  Search,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CreateEditCollectionModal, CollectionFormPayload } from "./CreateEditCollectionModal";
import { UpdateCollectionPayload } from "@/services/collectionTypes";
import { calculateEntryScore } from "@/services/dashboardAnalytics";

const CATEGORY_LABELS: Record<ReviewCategory, string> = {
  OPTIMAL_COMPLEXITY: "Optimal Complexity",
  OPTIMAL_HINTS: "Optimal Hints",
  OPTIMAL_FULL_SOLUTION: "Optimal Full Solution",
  MY_COMPLEXITY: "My Complexity",
  CORRECTNESS_CHECK: "Correctness Check",
  EDGE_CASE_ANALYSIS: "Edge Case Analysis",
  MY_HINTS: "My Hints",
  FULL_CODE_REVIEW: "Full Code Review",
};

interface CollectionDetailViewProps {
  collection: ReviewCollection;
  entries: ReviewHistoryEntry[];
  analytics: CollectionAnalyticsResult;
  onBack: () => void;
  onUpdate: (id: string, payload: UpdateCollectionPayload) => Promise<ReviewCollection | null>;
  onDelete: (col: ReviewCollection) => void;
  onRemoveReview: (collectionId: string, reviewId: string) => Promise<boolean>;
}

export function CollectionDetailView({
  collection,
  entries,
  analytics,
  onBack,
  onUpdate,
  onDelete,
  onRemoveReview,
}: CollectionDetailViewProps) {
  const pal = COLOR_PALETTE[collection.color];
  const [editOpen, setEditOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [confirmRemoveId, setConfirmRemoveId] = React.useState<string | null>(null);
  const [removingId, setRemovingId] = React.useState<string | null>(null);

  const filteredEntries = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        (e.problemTitle ?? "").toLowerCase().includes(q) ||
        e.language.toLowerCase().includes(q) ||
        (CATEGORY_LABELS[e.category] ?? "").toLowerCase().includes(q) ||
        e.code.substring(0, 200).toLowerCase().includes(q)
    );
  }, [entries, searchQuery]);

  const handleRemove = async (reviewId: string) => {
    setRemovingId(reviewId);
    await onRemoveReview(collection.id, reviewId);
    setConfirmRemoveId(null);
    setRemovingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={onBack}
          className="mt-1 flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Collections
        </button>
      </div>

      {/* Collection Info Card */}
      <div className={`${pal.bg} ${pal.border} border rounded-2xl p-6 space-y-4`}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${pal.bg} ${pal.text} ${pal.border} border flex items-center justify-center bg-white`}>
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {collection.name}
              </h1>
              {collection.description && (
                <p className="text-sm text-slate-600 mt-0.5">{collection.description}</p>
              )}
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Created {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(collection.createdAt))}
                {" · "}
                Updated {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(collection.updatedAt))}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-sky-400 hover:text-sky-700 transition-all cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(collection)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[
            { label: "Total Reviews", value: analytics.totalReviews.toString() },
            { label: "Avg Score", value: analytics.totalReviews > 0 ? `${analytics.avgScore} pts` : "—" },
            { label: "Avg Tokens", value: analytics.totalReviews > 0 ? analytics.avgTokens.toLocaleString() : "—" },
            { label: "Avg Duration", value: analytics.totalReviews > 0 ? `${(analytics.avgDurationMs / 1000).toFixed(1)}s` : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/70 rounded-xl p-3 text-center space-y-0.5">
              <p className="text-base font-black text-slate-900">{value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Summary */}
      {analytics.totalReviews > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {analytics.strongestTopic && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <TrendingUp className="w-3.5 h-3.5" /> Strongest Topic
              </div>
              <p className="text-sm font-extrabold text-slate-900">{analytics.strongestTopic}</p>
            </div>
          )}
          {analytics.weakestTopic && analytics.weakestTopic !== analytics.strongestTopic && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                <AlertCircle className="w-3.5 h-3.5" /> Area to Improve
              </div>
              <p className="text-sm font-extrabold text-slate-900">{analytics.weakestTopic}</p>
            </div>
          )}
          {analytics.mostCommonMistakeCategory && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <Lightbulb className="w-3.5 h-3.5" /> Common Fix Category
              </div>
              <p className="text-sm font-extrabold text-amber-900">{analytics.mostCommonMistakeCategory}</p>
            </div>
          )}
        </div>
      )}

      {/* Question List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-base font-extrabold text-slate-900">
            Questions in this Collection
            <span className="ml-2 text-sm font-bold text-slate-400">({entries.length})</span>
          </h2>

          {/* Search inside collection */}
          {entries.length > 0 && (
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-shadow"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {entries.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
              <Folder className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">No reviews in this collection yet.</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Add reviews from the History page using the &ldquo;Add to Collection&rdquo; button.
              </p>
            </div>
            <Button href="/history" variant="primary" size="sm" className="mt-1">
              Go to History
            </Button>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <p className="text-sm text-slate-500 font-medium">No reviews match your search.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEntries.map((entry) => {
              const score = calculateEntryScore(entry);
              const isConfirmingRemove = confirmRemoveId === entry.id;

              return (
                <div
                  key={entry.id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-4 hover:shadow-sm transition-all"
                >
                  {/* Entry Info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-extrabold text-slate-900 truncate">
                        {entry.problemTitle || "Untitled Review"}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                        {CATEGORY_LABELS[entry.category] ?? entry.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium flex-wrap">
                      <span className="flex items-center gap-1">
                        <Code2 className="w-3 h-3" /> {entry.language}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" /> {(entry.usage?.totalTokens ?? 0).toLocaleString()} tokens
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {(entry.durationMs / 1000).toFixed(1)}s
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(entry.timestamp))}
                      </span>
                    </div>
                  </div>

                  {/* Score + Remove */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-center">
                      <p className={`text-sm font-black ${score >= 75 ? "text-emerald-600" : score >= 55 ? "text-amber-600" : "text-rose-600"}`}>
                        {score} pts
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold">Score</p>
                    </div>

                    {isConfirmingRemove ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleRemove(entry.id)}
                          disabled={removingId === entry.id}
                          className="px-2.5 py-1.5 bg-red-600 text-white text-[11px] font-bold rounded-lg hover:bg-red-700 cursor-pointer disabled:opacity-60"
                        >
                          {removingId === entry.id ? "Removing…" : "Confirm"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmRemoveId(null)}
                          className="px-2.5 py-1.5 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg hover:bg-slate-200 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmRemoveId(entry.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        aria-label="Remove from collection"
                        title="Remove from collection"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <CreateEditCollectionModal
          existing={collection}
          onSubmit={async (payload: CollectionFormPayload) => {
            const up: UpdateCollectionPayload = { name: payload.name, description: payload.description, color: payload.color };
            await onUpdate(collection.id, up);
            setEditOpen(false);
          }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}
