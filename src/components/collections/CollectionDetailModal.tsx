"use client";

import * as React from "react";
import { ReviewCollection, CollectionColor } from "@/services/collectionTypes";
import { useReviewCollections } from "@/hooks/useReviewCollections";
import { reviewHistoryStorage } from "@/services/reviewHistoryStorage";
import { ReviewHistoryEntry, ReviewCategory } from "@/services/ai/aiTypes";
import {
  exportCollectionPDF,
  exportCollectionMarkdown,
  exportCollectionText,
  exportCollectionJSON,
} from "@/services/reviewCollectionExportService";
import { ReviewHistoryCard } from "@/components/reviewHistory/ReviewHistoryCard";
import { ReviewHistoryDetailModal } from "@/components/reviewHistory/ReviewHistoryDetailModal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  X,
  Folder,
  Search,
  Download,
  ChevronDown,
  FileText,
  FileType,
  FileCode,
  Zap,
  Timer,
  Layers,
  Code2,
  Trash2,
  Loader2,
} from "lucide-react";

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

const COLOR_HEADER_BG: Record<CollectionColor, string> = {
  sky: "bg-sky-50 border-sky-200",
  emerald: "bg-emerald-50 border-emerald-200",
  purple: "bg-purple-50 border-purple-200",
  amber: "bg-amber-50 border-amber-200",
  rose: "bg-rose-50 border-rose-200",
  indigo: "bg-indigo-50 border-indigo-200",
  cyan: "bg-cyan-50 border-cyan-200",
  slate: "bg-slate-100 border-slate-300",
};

type ReviewSortOption = "newest" | "oldest" | "tokens" | "duration" | "language" | "category";

interface CollectionDetailModalProps {
  collection: ReviewCollection | null;
  isOpen: boolean;
  onClose: () => void;
  onError?: (message: string) => void;
}

export function CollectionDetailModal({
  collection,
  isOpen,
  onClose,
  onError,
}: CollectionDetailModalProps) {
  const { removeReviewFromCollection, calculateStats, refresh } = useReviewCollections();

  const [entries, setEntries] = React.useState<ReviewHistoryEntry[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Search & Sort state inside collection
  const [search, setSearch] = React.useState("");
  const [sortOption, setSortOption] = React.useState<ReviewSortOption>("newest");

  // Export dropdown state
  const [exportOpen, setExportOpen] = React.useState(false);
  const exportRef = React.useRef<HTMLDivElement>(null);

  // Individual Review Detail Modal inside collection view
  const [selectedReview, setSelectedReview] = React.useState<ReviewHistoryEntry | null>(null);

  // Load full entries for reviewIds in collection
  React.useEffect(() => {
    if (!isOpen || !collection) return;
    let cancelled = false;

    const loadEntries = async () => {
      setLoading(true);
      try {
        const fetched: ReviewHistoryEntry[] = [];
        for (const id of collection.reviewIds) {
          const entry = await reviewHistoryStorage.getById(id);
          if (entry) fetched.push(entry);
        }
        if (!cancelled) setEntries(fetched);
      } catch (err) {
        console.error("[CollectionDetailModal] Load entries error:", err);
        if (!cancelled) setEntries([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadEntries();
    return () => {
      cancelled = true;
    };
  }, [isOpen, collection]);

  // Click outside for export dropdown
  React.useEffect(() => {
    if (!exportOpen) return;
    const h = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [exportOpen]);

  // Keyboard escape
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Body scroll lock
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !collection) return null;

  const stats = calculateStats(entries);

  // Filter & Sort entries
  const filtered = entries.filter(
    (e) =>
      e.language.toLowerCase().includes(search.toLowerCase().trim()) ||
      CATEGORY_LABELS[e.category]?.toLowerCase().includes(search.toLowerCase().trim()) ||
      e.code.toLowerCase().includes(search.toLowerCase().trim()) ||
      e.response.overallFeedback.toLowerCase().includes(search.toLowerCase().trim())
  );

  const sorted = [...filtered].sort((a, b) => {
    switch (sortOption) {
      case "oldest":
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      case "tokens":
        return (b.usage?.totalTokens || 0) - (a.usage?.totalTokens || 0);
      case "duration":
        return b.durationMs - a.durationMs;
      case "language":
        return a.language.localeCompare(b.language);
      case "category":
        return a.category.localeCompare(b.category);
      case "newest":
      default:
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }
  });

  const handleRemoveReview = async (reviewId: string) => {
    try {
      await removeReviewFromCollection(collection.id, reviewId);
      setEntries((prev) => prev.filter((e) => e.id !== reviewId));
      refresh();
    } catch (err) {
      console.error("[CollectionDetailModal] Remove error:", err);
      onError?.("Failed to remove review from collection.");
    }
  };

  const handleExport = (fmt: "pdf" | "markdown" | "text" | "json") => {
    setExportOpen(false);
    try {
      if (fmt === "pdf") exportCollectionPDF(collection, entries, stats);
      else if (fmt === "markdown") exportCollectionMarkdown(collection, entries, stats);
      else if (fmt === "text") exportCollectionText(collection, entries, stats);
      else exportCollectionJSON(collection, entries);
    } catch (err) {
      console.error("[CollectionDetailModal] Export error:", err);
      onError?.("Collection export failed. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-6 px-3 sm:px-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200">
        {/* Header Banner */}
        <div
          className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 py-5 border-b ${
            COLOR_HEADER_BG[collection.color]
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/80 border border-slate-200 flex items-center justify-center font-bold text-slate-800 shadow-sm shrink-0">
              <Folder className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 truncate">
                  {collection.name}
                </h2>
                <Badge variant="neutral" className="text-[10px] shrink-0">
                  {collection.reviewIds.length} review{collection.reviewIds.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              {collection.description && (
                <p className="text-xs text-slate-600 truncate mt-0.5">
                  {collection.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Export Dropdown */}
            <div ref={exportRef} className="relative">
              <button
                type="button"
                onClick={() => setExportOpen((prev) => !prev)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-sky-400 hover:text-sky-700 hover:bg-sky-50 transition-all cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Export Collection
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${exportOpen ? "rotate-180" : ""}`}
                />
              </button>
              {exportOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-50 w-52 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleExport("pdf")}
                    className="flex items-center gap-2 w-full px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors text-left"
                  >
                    <FileType className="w-3.5 h-3.5 text-slate-400" />
                    <span>Export PDF</span>
                    <span className="ml-auto text-[10px] font-mono text-slate-400">.pdf</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("markdown")}
                    className="flex items-center gap-2 w-full px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors text-left"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Export Markdown</span>
                    <span className="ml-auto text-[10px] font-mono text-slate-400">.md</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("text")}
                    className="flex items-center gap-2 w-full px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors text-left"
                  >
                    <FileCode className="w-3.5 h-3.5 text-slate-400" />
                    <span>Export Text</span>
                    <span className="ml-auto text-[10px] font-mono text-slate-400">.txt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExport("json")}
                    className="flex items-center gap-2 w-full px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors text-left border-t border-slate-100"
                  >
                    <Code2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Export Raw JSON</span>
                    <span className="ml-auto text-[10px] font-mono text-slate-400">.json</span>
                  </button>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* STATISTICS PANEL */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3 text-sky-600" /> Total Reviews
              </span>
              <p className="text-base font-extrabold text-slate-900">{stats.totalReviews}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Code2 className="w-3 h-3 text-indigo-600" /> Languages Used
              </span>
              <p className="text-xs font-bold text-slate-800 truncate">
                {stats.languagesUsed.join(", ") || "—"}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" /> Avg Tokens
              </span>
              <p className="text-base font-extrabold text-slate-900">
                {stats.avgTokens.toLocaleString()}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Timer className="w-3 h-3 text-emerald-600" /> Avg Duration
              </span>
              <p className="text-base font-extrabold text-slate-900">
                {(stats.avgDurationMs / 1000).toFixed(2)}s
              </p>
            </div>
          </div>

          {/* SEARCH & SORT BAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reviews in collection..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-medium">Sort:</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as ReviewSortOption)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="tokens">Most Tokens</option>
                <option value="duration">Longest Duration</option>
                <option value="language">Language</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>

          {/* REVIEW LIST */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
              <p className="text-xs text-slate-400 font-medium">Loading collection reviews...</p>
            </div>
          ) : sorted.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-1">
              <p className="text-xs text-slate-500 font-medium">
                {search ? "No reviews match your search." : "This collection is empty."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sorted.map((entry) => (
                <div key={entry.id} className="relative group">
                  <ReviewHistoryCard
                    summary={{
                      id: entry.id,
                      timestamp: entry.timestamp,
                      category: entry.category,
                      language: entry.language,
                      codePreview: entry.code.slice(0, 120),
                      totalTokens: entry.usage?.totalTokens || 0,
                      model: entry.model,
                      durationMs: entry.durationMs,
                      problemTitle: entry.problemTitle,
                    }}
                    onOpen={() => setSelectedReview(entry)}
                    onDelete={() => handleRemoveReview(entry.id)}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveReview(entry.id);
                    }}
                    title="Remove from collection"
                    className="absolute top-3 right-3 p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Embedded Detail Modal for selected review */}
      {selectedReview && (
        <ReviewHistoryDetailModal
          entry={selectedReview}
          onClose={() => setSelectedReview(null)}
          onError={onError}
        />
      )}
    </div>
  );
}
