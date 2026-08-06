"use client";

import * as React from "react";
import { ReviewHistorySummary, ReviewCategory } from "@/services/ai/aiTypes";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Trash2, Clock, Code2, Zap, Timer, CheckSquare2, Square } from "lucide-react";

// ─── Category colour mapping ───────────────────────────────────────────────────

const CATEGORY_META: Record<ReviewCategory, { label: string; colour: string }> = {
  OPTIMAL_COMPLEXITY:    { label: "Optimal Complexity",   colour: "bg-sky-100 text-sky-700 border-sky-200" },
  OPTIMAL_HINTS:        { label: "Optimal Hints",        colour: "bg-amber-100 text-amber-700 border-amber-200" },
  OPTIMAL_FULL_SOLUTION:{ label: "Optimal Solution",     colour: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  MY_COMPLEXITY:        { label: "My Complexity",        colour: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  CORRECTNESS_CHECK:    { label: "Correctness Check",    colour: "bg-purple-100 text-purple-700 border-purple-200" },
  EDGE_CASE_ANALYSIS:   { label: "Edge Case Analysis",   colour: "bg-rose-100 text-rose-700 border-rose-200" },
  MY_HINTS:             { label: "My Hints",             colour: "bg-blue-100 text-blue-700 border-blue-200" },
  FULL_CODE_REVIEW:     { label: "Full Code Review",     colour: "bg-violet-100 text-violet-700 border-violet-200" },
};

// ─── Relative time helper ─────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatAbsolute(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ReviewHistoryCardProps {
  summary: ReviewHistorySummary;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  /** When true, the card is in compare-selection mode */
  compareMode?: boolean;
  /** Whether this card is currently selected for comparison */
  isSelected?: boolean;
  /** Called when the user toggles this card's selection */
  onToggleSelect?: (id: string) => void;
}

export function ReviewHistoryCard({
  summary,
  onOpen,
  onDelete,
  compareMode = false,
  isSelected = false,
  onToggleSelect,
}: ReviewHistoryCardProps) {
  const catMeta = CATEGORY_META[summary.category] ?? { label: summary.category, colour: "bg-slate-100 text-slate-600 border-slate-200" };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(summary.id);
  };

  const handleClick = () => {
    if (compareMode) {
      onToggleSelect?.(summary.id);
    } else {
      onOpen(summary.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") handleClick();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={`group relative bg-white border rounded-2xl p-4 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500/30
        ${
          compareMode
            ? isSelected
              ? "border-sky-400 ring-2 ring-sky-400/40 shadow-md shadow-sky-100 -translate-y-0.5"
              : "border-slate-200 hover:border-sky-300 hover:shadow-sm"
            : "border-slate-200 hover:border-sky-300 hover:shadow-md hover:-translate-y-0.5"
        }
      `}
    >
      {/* Compare mode checkbox overlay */}
      {compareMode && (
        <div className="absolute top-3 left-3 z-10">
          {isSelected
            ? <CheckSquare2 className="w-5 h-5 text-sky-600 fill-sky-100" />
            : <Square className="w-5 h-5 text-slate-400" />}
        </div>
      )}
      {/* Top row */}
      <div className={`flex items-start justify-between gap-3 mb-3 ${compareMode ? "ml-7" : ""}`}>
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {/* Category */}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border select-none ${catMeta.colour}`}>
            {catMeta.label}
          </span>
          {/* Language */}
          <Badge variant="neutral" className="text-[11px]">
            {summary.language}
          </Badge>
          {/* Problem title if available */}
          {summary.problemTitle && (
            <span className="text-[11px] text-slate-400 font-medium truncate max-w-[180px]">
              {summary.problemTitle}
            </span>
          )}
        </div>

        {/* Delete button */}
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-slate-400 hover:text-red-500 cursor-pointer"
          onClick={handleDelete}
          aria-label="Delete review"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Code preview */}
      {summary.codePreview && (
        <div className="mb-3 relative">
          <pre className="bg-slate-900/90 text-slate-300 font-mono text-[11px] p-3 rounded-xl leading-relaxed overflow-hidden whitespace-pre-wrap break-all line-clamp-3">
            {summary.codePreview}
            {summary.codePreview.length >= 120 && (
              <span className="text-slate-500">…</span>
            )}
          </pre>
        </div>
      )}

      {/* Footer row */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
        {/* Relative timestamp */}
        <span className="flex items-center gap-1 font-medium" title={formatAbsolute(summary.timestamp)}>
          <Clock className="w-3 h-3" />
          {relativeTime(summary.timestamp)}
        </span>

        {/* Tokens */}
        {summary.totalTokens > 0 && (
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" />
            {summary.totalTokens.toLocaleString()} tokens
          </span>
        )}

        {/* Duration */}
        {summary.durationMs > 0 && (
          <span className="flex items-center gap-1">
            <Timer className="w-3 h-3 text-sky-500" />
            {(summary.durationMs / 1000).toFixed(1)}s
          </span>
        )}

        {/* Model */}
        <span className="flex items-center gap-1 ml-auto">
          <Code2 className="w-3 h-3" />
          {summary.model}
        </span>
      </div>
    </div>
  );
}
