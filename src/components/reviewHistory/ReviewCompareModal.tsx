"use client";

import * as React from "react";
import { ReviewHistoryEntry, ReviewCategory } from "@/services/ai/aiTypes";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  exportComparisonPDF,
  exportComparisonMarkdown,
  exportComparisonText,
} from "@/services/reviewCompareExportService";
import {
  X,
  GitCompare,
  Clock,
  Code2,
  Zap,
  Timer,
  Download,
  ChevronDown,
  FileText,
  FileType,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Loader2,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<ReviewCategory, string> = {
  OPTIMAL_COMPLEXITY:    "Optimal Complexity",
  OPTIMAL_HINTS:         "Optimal Hints",
  OPTIMAL_FULL_SOLUTION: "Optimal Full Solution",
  MY_COMPLEXITY:         "My Complexity",
  CORRECTNESS_CHECK:     "Correctness Check",
  EDGE_CASE_ANALYSIS:    "Edge Case Analysis",
  MY_HINTS:              "My Hints",
  FULL_CODE_REVIEW:      "Full Code Review",
};

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

type BetterSide = "left" | "right" | "equal" | "none";

function betterLower(a: number | undefined, b: number | undefined): BetterSide {
  if (a == null && b == null) return "none";
  if (a == null) return "right";
  if (b == null) return "left";
  if (a < b) return "left";
  if (b < a) return "right";
  return "equal";
}

function betterHigher(a: number | undefined, b: number | undefined): BetterSide {
  if (a == null && b == null) return "none";
  if (a == null) return "right";
  if (b == null) return "left";
  if (a > b) return "left";
  if (b > a) return "right";
  return "equal";
}

// ─── Small sub-components ─────────────────────────────────────────────────────

function BetterBadge({ side, which }: { side: BetterSide; which: "left" | "right" }) {
  if (side === "none") return null;
  if (side === "equal") return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 rounded-full px-1.5 py-0.5">
      <Minus className="w-2.5 h-2.5" /> Equal
    </span>
  );
  if (side === which) return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-1.5 py-0.5">
      <TrendingUp className="w-2.5 h-2.5" /> Better
    </span>
  );
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-100 rounded-full px-1.5 py-0.5">
      <TrendingDown className="w-2.5 h-2.5" />
    </span>
  );
}

interface SidePanelProps {
  children: React.ReactNode;
  accent: "sky" | "violet";
}

function SidePanel({ children, accent }: SidePanelProps) {
  const border = accent === "sky"
    ? "border-sky-200 bg-sky-50/30"
    : "border-violet-200 bg-violet-50/30";
  return (
    <div className={`flex-1 min-w-0 rounded-xl border p-3 text-xs leading-relaxed text-slate-700 ${border}`}>
      {children}
    </div>
  );
}

interface SideBySideCodeProps {
  leftCode: string;
  rightCode: string;
  leftLabel: string;
  rightLabel: string;
  identical: boolean;
}

function SideBySideCode({ leftCode, rightCode, leftLabel, rightLabel, identical }: SideBySideCodeProps) {
  return (
    <div className="space-y-2">
      {identical && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 text-[11px] font-semibold rounded-xl w-fit">
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
          Identical code submitted in both reviews
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wider mb-1">{leftLabel}</div>
          <pre className="bg-slate-900 text-slate-200 font-mono text-[10px] p-3 rounded-xl overflow-auto max-h-56 leading-relaxed whitespace-pre-wrap break-all">
            {leftCode || "(empty)"}
          </pre>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold text-violet-700 uppercase tracking-wider mb-1">{rightLabel}</div>
          <pre className="bg-slate-900 text-slate-200 font-mono text-[10px] p-3 rounded-xl overflow-auto max-h-56 leading-relaxed whitespace-pre-wrap break-all">
            {rightCode || "(empty)"}
          </pre>
        </div>
      </div>
    </div>
  );
}

interface SideBySideTextProps {
  leftText: string | undefined;
  rightText: string | undefined;
  leftLabel: string;
  rightLabel: string;
}

function SideBySideText({ leftText, rightText, leftLabel, rightLabel }: SideBySideTextProps) {
  const lv = leftText?.trim() || "";
  const rv = rightText?.trim() || "";
  return (
    <div className="flex flex-col lg:flex-row gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wider mb-1">{leftLabel}</div>
        <SidePanel accent="sky">{lv || <span className="text-slate-400 italic">Not available</span>}</SidePanel>
      </div>
      <div className="flex items-center justify-center lg:flex-col">
        <ArrowRight className="w-4 h-4 text-slate-300 rotate-0 lg:rotate-90" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold text-violet-700 uppercase tracking-wider mb-1">{rightLabel}</div>
        <SidePanel accent="violet">{rv || <span className="text-slate-400 italic">Not available</span>}</SidePanel>
      </div>
    </div>
  );
}

interface SideBySideListProps {
  leftItems: string[];
  rightItems: string[];
  leftLabel: string;
  rightLabel: string;
}

function SideBySideList({ leftItems, rightItems, leftLabel, rightLabel }: SideBySideListProps) {
  const rightSet = new Set(rightItems.map(s => s.trim()));
  const leftSet  = new Set(leftItems.map(s => s.trim()));

  return (
    <div className="flex flex-col lg:flex-row gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wider mb-1">{leftLabel}</div>
        <div className="flex-1 rounded-xl border border-sky-200 bg-sky-50/30 p-3 space-y-1.5">
          {leftItems.length === 0
            ? <span className="text-[11px] text-slate-400 italic">None</span>
            : leftItems.map((item, i) => (
              <div key={i} className={`flex gap-2 items-start text-xs text-slate-700 ${!rightSet.has(item.trim()) ? "font-semibold text-sky-800" : ""}`}>
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${!rightSet.has(item.trim()) ? "bg-sky-400" : "bg-slate-300"}`} />
                <span>{item}</span>
              </div>
            ))}
        </div>
      </div>
      <div className="flex items-center justify-center lg:flex-col">
        <ArrowRight className="w-4 h-4 text-slate-300 rotate-0 lg:rotate-90" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold text-violet-700 uppercase tracking-wider mb-1">{rightLabel}</div>
        <div className="flex-1 rounded-xl border border-violet-200 bg-violet-50/30 p-3 space-y-1.5">
          {rightItems.length === 0
            ? <span className="text-[11px] text-slate-400 italic">None</span>
            : rightItems.map((item, i) => (
              <div key={i} className={`flex gap-2 items-start text-xs text-slate-700 ${!leftSet.has(item.trim()) ? "font-semibold text-violet-800" : ""}`}>
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${!leftSet.has(item.trim()) ? "bg-violet-400" : "bg-slate-300"}`} />
                <span>{item}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ─── Export Dropdown ──────────────────────────────────────────────────────────

function ComparisonExportMenu({
  left, right, onError,
}: {
  left: ReviewHistoryEntry;
  right: ReviewHistoryEntry;
  onError: (msg: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  const handle = (fmt: "pdf" | "markdown" | "text") => {
    setOpen(false);
    try {
      if (fmt === "pdf")      exportComparisonPDF(left, right);
      else if (fmt === "markdown") exportComparisonMarkdown(left, right);
      else                    exportComparisonText(left, right);
    } catch (e) {
      console.error("[ComparisonExportMenu]", e);
      onError("Comparison export failed. Please try again.");
    }
  };

  const items = [
    { fmt: "pdf"      as const, label: "Export as PDF",      ext: ".pdf", Icon: FileType },
    { fmt: "markdown" as const, label: "Export as Markdown",  ext: ".md",  Icon: FileText },
    { fmt: "text"     as const, label: "Export as Text",      ext: ".txt", Icon: FileText },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:border-sky-400 hover:text-sky-700 hover:bg-sky-50 transition-all cursor-pointer shadow-sm"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Download className="w-3.5 h-3.5" />
        Export
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-52 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden" role="menu">
          {items.map(({ fmt, label, ext, Icon }) => (
            <button
              key={fmt}
              type="button"
              role="menuitem"
              onClick={() => handle(fmt)}
              className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors cursor-pointer text-left"
            >
              <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span>{label}</span>
              <span className="ml-auto text-[10px] font-mono text-slate-400">{ext}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Section Wrapper ──────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="flex items-center gap-2 text-xs font-extrabold text-slate-700 uppercase tracking-wider">
        <Icon className="w-4 h-4 text-sky-600 shrink-0" />
        <span>{title}</span>
      </h3>
      {children}
    </div>
  );
}

// ─── Improvements Analysis ────────────────────────────────────────────────────

interface ImprovementItem {
  text: string;
  positive: boolean;
}

function analyseImprovements(left: ReviewHistoryEntry, right: ReviewHistoryEntry): ImprovementItem[] {
  const lR = left.response;
  const rR = right.response;
  const items: ImprovementItem[] = [];

  const lTokens = left.usage?.totalTokens ?? 0;
  const rTokens = right.usage?.totalTokens ?? 0;
  if (lTokens > 0 && rTokens > 0) {
    if (rTokens < lTokens * 0.9) {
      items.push({ text: `Review B used ${Math.round(100 - (rTokens / lTokens) * 100)}% fewer tokens — more concise response.`, positive: true });
    } else if (rTokens > lTokens * 1.1) {
      items.push({ text: `Review B was more detailed: ${rTokens - lTokens} more tokens used.`, positive: true });
    }
  }

  if (left.durationMs > 0 && right.durationMs > 0) {
    const speedup = left.durationMs - right.durationMs;
    if (speedup > 1000) {
      items.push({ text: `Review B was ${(speedup / 1000).toFixed(1)}s faster.`, positive: true });
    } else if (speedup < -1000) {
      items.push({ text: `Review A was ${(Math.abs(speedup) / 1000).toFixed(1)}s faster.`, positive: false });
    }
  }

  const lSugg = lR.optimizationSuggestions.length;
  const rSugg = rR.optimizationSuggestions.length;
  if (rSugg > lSugg) {
    items.push({ text: `Review B provided ${rSugg - lSugg} more optimization suggestion${rSugg - lSugg > 1 ? "s" : ""}.`, positive: true });
  }

  const lTips = lR.learningTips.length;
  const rTips = rR.learningTips.length;
  if (rTips > lTips) {
    items.push({ text: `Review B added ${rTips - lTips} extra learning takeaway${rTips - lTips > 1 ? "s" : ""}.`, positive: true });
  }

  const lEdge = lR.edgeCases.length;
  const rEdge = rR.edgeCases.length;
  if (rEdge > lEdge) {
    items.push({ text: `Review B identified ${rEdge - lEdge} more edge case${rEdge - lEdge > 1 ? "s" : ""}.`, positive: true });
  }

  if (!lR.optimalCode && rR.optimalCode) {
    items.push({ text: "Review B includes an optimal reference solution that Review A lacked.", positive: true });
  }

  if (!lR.summary && rR.summary) {
    items.push({ text: "Review B added a structured summary section.", positive: true });
  }

  if (items.length === 0) {
    items.push({ text: "Both reviews are broadly comparable. Select different categories to see a wider perspective.", positive: true });
  }

  return items;
}

function analyseMissing(left: ReviewHistoryEntry, right: ReviewHistoryEntry): string[] {
  const lR = left.response;
  const rR = right.response;
  const missing: string[] = [];

  if (!lR.summary && !rR.summary) missing.push("Neither review includes a summary section.");
  if (!lR.optimalCode && !rR.optimalCode) missing.push("No optimal reference solution available in either review.");
  if (!lR.hints?.length && !rR.hints?.length) missing.push("No progressive hints provided in either review.");
  if (lR.edgeCases.length === 0 && rR.edgeCases.length === 0) missing.push("No edge cases identified in either review.");
  if (lR.learningTips.length === 0 && rR.learningTips.length === 0) missing.push("No learning takeaways in either review.");

  if (missing.length === 0) missing.push("No significant gaps identified — both reviews appear comprehensive.");
  return missing;
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface ReviewCompareModalProps {
  left: ReviewHistoryEntry | null;
  right: ReviewHistoryEntry | null;
  loading?: boolean;
  onClose: () => void;
  onError?: (message: string) => void;
}

export function ReviewCompareModal({
  left,
  right,
  loading = false,
  onClose,
  onError,
}: ReviewCompareModalProps) {
  // Body scroll lock
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Escape key
  React.useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  const handleError = React.useCallback((msg: string) => { onError?.(msg); }, [onError]);

  // Derived values (only when both entries are loaded)
  const improvements   = React.useMemo(() => (left && right ? analyseImprovements(left, right) : []), [left, right]);
  const missingFields  = React.useMemo(() => (left && right ? analyseMissing(left, right) : []), [left, right]);
  const codeIdentical  = React.useMemo(() => !!(left && right && left.code.trim() === right.code.trim()), [left, right]);
  const tokenBetter    = React.useMemo(() => betterLower(left?.usage?.totalTokens, right?.usage?.totalTokens), [left, right]);
  const durationBetter = React.useMemo(() => betterLower(left?.durationMs, right?.durationMs), [left, right]);
  const suggBetter     = React.useMemo(() => betterHigher(left?.response.optimizationSuggestions.length, right?.response.optimizationSuggestions.length), [left, right]);

  const leftLabel  = left  ? `Review A · ${CATEGORY_LABELS[left.category]}`  : "Review A";
  const rightLabel = right ? `Review B · ${CATEGORY_LABELS[right.category]}` : "Review B";

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-6 px-3 sm:px-6"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0 bg-gradient-to-r from-sky-50 to-violet-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Review Comparison</h2>
              <p className="text-[11px] text-slate-400">Side-by-side analysis of two AI reviews</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {left && right && (
              <ComparisonExportMenu left={left} right={right} onError={handleError} />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              aria-label="Close comparison"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1 px-5 py-6 space-y-8">

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
              <p className="text-sm text-slate-500 font-medium">Loading reviews for comparison…</p>
            </div>
          )}

          {!loading && (!left || !right) && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <GitCompare className="w-10 h-10 text-slate-300" />
              <p className="text-sm text-slate-500 font-medium">Unable to load one or both reviews.</p>
              <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
            </div>
          )}

          {!loading && left && right && (() => {
            const lR = left.response;
            const rR = right.response;

            return (
              <>
                {/* Review Labels */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 flex items-center gap-2.5 px-4 py-3 bg-sky-50 border border-sky-200 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold shrink-0">A</div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-sky-900 truncate">{CATEGORY_LABELS[left.category]}</p>
                      <p className="text-[10px] text-sky-600 flex items-center gap-1 truncate">
                        <Clock className="w-2.5 h-2.5" /> {fmt(left.timestamp)}
                      </p>
                    </div>
                    <Badge variant="neutral" className="text-[10px] ml-auto shrink-0">{left.language}</Badge>
                  </div>
                  <div className="flex-1 flex items-center gap-2.5 px-4 py-3 bg-violet-50 border border-violet-200 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-violet-500 text-white flex items-center justify-center text-xs font-bold shrink-0">B</div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-violet-900 truncate">{CATEGORY_LABELS[right.category]}</p>
                      <p className="text-[10px] text-violet-600 flex items-center gap-1 truncate">
                        <Clock className="w-2.5 h-2.5" /> {fmt(right.timestamp)}
                      </p>
                    </div>
                    <Badge variant="neutral" className="text-[10px] ml-auto shrink-0">{right.language}</Badge>
                  </div>
                </div>

                {/* ── Metadata Comparison Table ── */}
                <Section title="Metadata Comparison" icon={Code2}>
                  <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="text-left px-4 py-2.5 font-bold text-slate-600 w-36">Field</th>
                          <th className="text-left px-4 py-2.5 font-bold text-sky-700">
                            <span className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-sky-500 text-white text-[9px] flex items-center justify-center font-bold">A</span>
                              Review A
                            </span>
                          </th>
                          <th className="text-left px-4 py-2.5 font-bold text-violet-700">
                            <span className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-violet-500 text-white text-[9px] flex items-center justify-center font-bold">B</span>
                              Review B
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          { label: "Date",     lv: fmt(left.timestamp),       rv: fmt(right.timestamp),       badge: null },
                          { label: "Language", lv: left.language,             rv: right.language,             badge: null },
                          { label: "Category", lv: CATEGORY_LABELS[left.category], rv: CATEGORY_LABELS[right.category], badge: null },
                          { label: "Provider", lv: left.model,                rv: right.model,                badge: null },
                          {
                            label: "Tokens",
                            lv: left.usage?.totalTokens?.toLocaleString() ?? "—",
                            rv: right.usage?.totalTokens?.toLocaleString() ?? "—",
                            badge: tokenBetter,
                          },
                          {
                            label: "Duration",
                            lv: `${(left.durationMs / 1000).toFixed(2)}s`,
                            rv: `${(right.durationMs / 1000).toFixed(2)}s`,
                            badge: durationBetter,
                          },
                          {
                            label: "Suggestions",
                            lv: String(lR.optimizationSuggestions.length),
                            rv: String(rR.optimizationSuggestions.length),
                            badge: suggBetter,
                          },
                        ].map(({ label, lv, rv, badge }) => (
                          <tr key={label} className="hover:bg-slate-50/80">
                            <td className="px-4 py-2 font-semibold text-slate-500">{label}</td>
                            <td className="px-4 py-2 text-slate-700">
                              <span className="flex items-center gap-1.5">
                                {lv}
                                {badge && <BetterBadge side={badge} which="left" />}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-slate-700">
                              <span className="flex items-center gap-1.5">
                                {rv}
                                {badge && <BetterBadge side={badge} which="right" />}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Section>

                {/* ── Submitted Code ── */}
                <Section title="Submitted Code" icon={Code2}>
                  <SideBySideCode
                    leftCode={left.code}
                    rightCode={right.code}
                    leftLabel={leftLabel}
                    rightLabel={rightLabel}
                    identical={codeIdentical}
                  />
                </Section>

                {/* ── Summary ── */}
                {(lR.summary || rR.summary) && (
                  <Section title="Summary" icon={Zap}>
                    <SideBySideText leftText={lR.summary} rightText={rR.summary} leftLabel={leftLabel} rightLabel={rightLabel} />
                  </Section>
                )}

                {/* ── Overall Feedback ── */}
                <Section title="Overall Feedback" icon={CheckCircle2}>
                  <SideBySideText leftText={lR.overallFeedback} rightText={rR.overallFeedback} leftLabel={leftLabel} rightLabel={rightLabel} />
                </Section>

                {/* ── Correctness Analysis ── */}
                <Section title="Correctness Analysis" icon={ShieldCheck}>
                  <SideBySideText leftText={lR.correctnessAnalysis} rightText={rR.correctnessAnalysis} leftLabel={leftLabel} rightLabel={rightLabel} />
                </Section>

                {/* ── Complexity ── */}
                <Section title="Complexity" icon={Zap}>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Timer className="w-3 h-3" /> Time Complexity
                      </p>
                      <SideBySideText leftText={lR.timeComplexity} rightText={rR.timeComplexity} leftLabel={leftLabel} rightLabel={rightLabel} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Timer className="w-3 h-3" /> Space Complexity
                      </p>
                      <SideBySideText leftText={lR.spaceComplexity} rightText={rR.spaceComplexity} leftLabel={leftLabel} rightLabel={rightLabel} />
                    </div>
                  </div>
                </Section>

                {/* ── Optimization Suggestions ── */}
                <Section title="Optimization Suggestions" icon={Lightbulb}>
                  <SideBySideList
                    leftItems={lR.optimizationSuggestions}
                    rightItems={rR.optimizationSuggestions}
                    leftLabel={leftLabel}
                    rightLabel={rightLabel}
                  />
                </Section>

                {/* ── Edge Cases ── */}
                <Section title="Edge Cases" icon={AlertCircle}>
                  <SideBySideList
                    leftItems={lR.edgeCases}
                    rightItems={rR.edgeCases}
                    leftLabel={leftLabel}
                    rightLabel={rightLabel}
                  />
                </Section>

                {/* ── Learning Tips ── */}
                <Section title="Learning Takeaways" icon={BookOpen}>
                  <SideBySideList
                    leftItems={lR.learningTips}
                    rightItems={rR.learningTips}
                    leftLabel={leftLabel}
                    rightLabel={rightLabel}
                  />
                </Section>

                {/* ── Hints (if present) ── */}
                {(lR.hints?.length || rR.hints?.length) && (
                  <Section title="Progressive Hints" icon={Lightbulb}>
                    <SideBySideList
                      leftItems={lR.hints ?? []}
                      rightItems={rR.hints ?? []}
                      leftLabel={leftLabel}
                      rightLabel={rightLabel}
                    />
                  </Section>
                )}

                {/* ── Optimal Code ── */}
                {(lR.optimalCode || rR.optimalCode) && (
                  <Section title="Optimal Reference Solution" icon={ShieldCheck}>
                    <SideBySideCode
                      leftCode={lR.optimalCode ?? "(not available)"}
                      rightCode={rR.optimalCode ?? "(not available)"}
                      leftLabel={leftLabel}
                      rightLabel={rightLabel}
                      identical={!!(lR.optimalCode && rR.optimalCode && lR.optimalCode.trim() === rR.optimalCode.trim())}
                    />
                  </Section>
                )}

                {/* ── What's Improved? ── */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-3">
                  <h3 className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> What&apos;s Improved?
                  </h3>
                  <ul className="space-y-2">
                    {improvements.map((item, i) => (
                      <li key={i} className={`flex gap-2 items-start text-xs leading-relaxed ${item.positive ? "text-emerald-800" : "text-amber-800"}`}>
                        <div className={`w-4 h-4 rounded-full shrink-0 flex items-center justify-center mt-0.5 ${item.positive ? "bg-emerald-200 text-emerald-700" : "bg-amber-200 text-amber-700"}`}>
                          {item.positive ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
                        </div>
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ── What's Still Missing? ── */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4 space-y-3">
                  <h3 className="text-xs font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> What&apos;s Still Missing?
                  </h3>
                  <ul className="space-y-2">
                    {missingFields.map((msg, i) => (
                      <li key={i} className="flex gap-2 items-start text-xs text-amber-800 leading-relaxed">
                        <div className="w-4 h-4 rounded-full bg-amber-200 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                          <Minus className="w-2.5 h-2.5" />
                        </div>
                        <span>{msg}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
