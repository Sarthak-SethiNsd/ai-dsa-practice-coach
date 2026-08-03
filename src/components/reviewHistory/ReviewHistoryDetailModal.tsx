"use client";

import * as React from "react";
import { ReviewHistoryEntry, ReviewCategory } from "@/services/ai/aiTypes";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ExportMenu } from "@/components/reviewHistory/ExportMenu";
import {
  X,
  Clock,
  Code2,
  Timer,
  Zap,
  Sparkles,
  Lightbulb,
  FileCode,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Loader2,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatAbsolute(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const CATEGORY_LABELS: Record<ReviewCategory, string> = {
  OPTIMAL_COMPLEXITY:    "Optimal Complexity",
  OPTIMAL_HINTS:        "Optimal Hints",
  OPTIMAL_FULL_SOLUTION:"Optimal Full Solution",
  MY_COMPLEXITY:        "My Complexity",
  CORRECTNESS_CHECK:    "Correctness Check",
  EDGE_CASE_ANALYSIS:   "Edge Case Analysis",
  MY_HINTS:             "My Hints",
  FULL_CODE_REVIEW:     "Full Code Review",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface ReviewHistoryDetailModalProps {
  /** The full history entry to display, or null while loading */
  entry: ReviewHistoryEntry | null;
  /** Set to true while the entry is being fetched */
  loading?: boolean;
  onClose: () => void;
  /** Called with an error message if an export operation fails */
  onError?: (message: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReviewHistoryDetailModal({
  entry,
  loading = false,
  onClose,
  onError,
}: ReviewHistoryDetailModalProps) {
  const [copiedCode, setCopiedCode] = React.useState(false);
  const [copiedOptimal, setCopiedOptimal] = React.useState(false);

  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const copyToClipboard = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const review = entry?.response;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-start justify-end"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Panel */}
      <div className="relative h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">
                {entry ? CATEGORY_LABELS[entry.category] : "Review Detail"}
              </p>
              {entry && (
                <p className="text-[11px] text-slate-400 font-medium">
                  {formatAbsolute(entry.timestamp)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Export menu — only when a full entry is loaded */}
            {entry && !loading && (
              <ExportMenu
                entry={entry}
                onError={msg => onError?.(msg)}
              />
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* Loading state */}
          {loading && (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
              <p className="text-sm text-slate-500 font-medium">Loading review…</p>
            </div>
          )}

          {/* Entry content */}
          {!loading && entry && review && (
            <>
              {/* Meta row */}
              <div className="flex flex-wrap gap-2 items-center pb-3 border-b border-slate-100">
                <Badge variant="primary">{entry.language}</Badge>
                {entry.usage?.totalTokens && (
                  <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <Zap className="w-3 h-3 text-amber-500" />
                    {entry.usage.totalTokens.toLocaleString()} tokens
                  </span>
                )}
                <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                  <Timer className="w-3 h-3 text-sky-500" />
                  {(entry.durationMs / 1000).toFixed(1)}s
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium ml-auto">
                  <Code2 className="w-3 h-3" />
                  {entry.model}
                </span>
                {entry.problemUrl && (
                  <a
                    href={entry.problemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[11px] text-sky-600 hover:text-sky-800 font-semibold"
                    onClick={e => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3 h-3" />
                    Problem
                  </a>
                )}
              </div>

              {/* Submitted code */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Submitted Code
                  </span>
                  <button
                    onClick={() => copyToClipboard(entry.code, setCopiedCode)}
                    className="flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
                  >
                    {copiedCode ? <><Check className="w-3 h-3 text-emerald-600" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                  </button>
                </div>
                <pre className="bg-slate-900 text-slate-200 font-mono text-xs p-4 rounded-xl overflow-x-auto leading-relaxed shadow-inner max-h-52 overflow-y-auto">
                  <code>{entry.code}</code>
                </pre>
              </div>

              {/* Summary */}
              {review.summary && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Summary</span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{review.summary}</p>
                </div>
              )}

              {/* Complexity badges */}
              {(review.timeComplexity || review.spaceComplexity) && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-sky-50/50 border border-sky-100">
                    <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider mb-1">Time Complexity</p>
                    <p className="text-base font-extrabold text-slate-900 font-mono">{review.timeComplexity}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">Space Complexity</p>
                    <p className="text-base font-extrabold text-slate-900 font-mono">{review.spaceComplexity}</p>
                  </div>
                </div>
              )}

              {/* Hints */}
              {review.hints && review.hints.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500" /> Progressive Hints
                  </h4>
                  <div className="space-y-2">
                    {review.hints.map((hint, i) => (
                      <div key={i} className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-xs text-amber-950 font-medium leading-relaxed flex gap-2.5 items-start">
                        <span className="w-5 h-5 rounded-full bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0 text-[10px] font-bold">{i + 1}</span>
                        <span>{hint}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optimal code */}
              {review.optimalCode && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-emerald-600" /> Optimal Reference Solution
                    </h4>
                    <button
                      onClick={() => copyToClipboard(review.optimalCode!, setCopiedOptimal)}
                      className="flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
                    >
                      {copiedOptimal ? <><Check className="w-3 h-3 text-emerald-600" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-slate-200 font-mono text-xs p-4 rounded-xl overflow-x-auto leading-relaxed shadow-inner">
                    <code>{review.optimalCode}</code>
                  </pre>
                </div>
              )}

              {/* Overall feedback */}
              {review.overallFeedback && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overall Evaluation</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{review.overallFeedback}</p>
                </div>
              )}

              {/* Correctness analysis */}
              {review.correctnessAnalysis && (
                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Correctness &amp; Logic Audit</span>
                  <p className="text-xs text-slate-700 leading-relaxed">{review.correctnessAnalysis}</p>
                </div>
              )}

              {/* Edge cases */}
              {review.edgeCases && review.edgeCases.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Edge Cases
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {review.edgeCases.map((ec, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100 text-xs text-slate-700 leading-relaxed flex gap-2 items-start">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                        <span>{ec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optimization suggestions */}
              {review.optimizationSuggestions && review.optimizationSuggestions.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Optimization Suggestions
                  </span>
                  <ul className="space-y-1.5">
                    {review.optimizationSuggestions.map((opt, i) => (
                      <li key={i} className="flex gap-2 items-start text-xs text-slate-600 leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                        <span>{opt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Learning tips */}
              {review.learningTips && review.learningTips.length > 0 && (
                <div className="p-4 rounded-xl bg-indigo-50/30 border border-indigo-100 space-y-2 pt-3">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Learning Tips
                  </span>
                  <ul className="space-y-1.5">
                    {review.learningTips.map((tip, i) => (
                      <li key={i} className="flex gap-2 items-start text-xs text-indigo-800 leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {/* Not found state */}
          {!loading && !entry && (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Code2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">Review not found</p>
              <p className="text-xs text-slate-400">This entry may have been deleted.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
