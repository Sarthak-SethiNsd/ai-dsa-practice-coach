"use client";

import * as React from "react";
import { ReviewCategory, ReviewHistorySummary } from "@/services/ai/aiTypes";
import { Search, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReviewHistoryFiltersState {
  search: string;
  categories: ReviewCategory[];
  languages: string[];
}

export const DEFAULT_REVIEW_HISTORY_FILTERS: ReviewHistoryFiltersState = {
  search: "",
  categories: [],
  languages: [],
};

interface ReviewHistoryFiltersProps {
  filters: ReviewHistoryFiltersState;
  onChange: (filters: ReviewHistoryFiltersState) => void;
  summaries: ReviewHistorySummary[];
  resultCount: number;
}

// ─── All known categories ─────────────────────────────────────────────────────

const ALL_CATEGORIES: { key: ReviewCategory; label: string }[] = [
  { key: "OPTIMAL_COMPLEXITY",     label: "Optimal Complexity" },
  { key: "OPTIMAL_HINTS",          label: "Optimal Hints" },
  { key: "OPTIMAL_FULL_SOLUTION",  label: "Optimal Solution" },
  { key: "MY_COMPLEXITY",          label: "My Complexity" },
  { key: "CORRECTNESS_CHECK",      label: "Correctness Check" },
  { key: "EDGE_CASE_ANALYSIS",     label: "Edge Case Analysis" },
  { key: "MY_HINTS",               label: "My Hints" },
  { key: "FULL_CODE_REVIEW",       label: "Full Code Review" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function ReviewHistoryFilters({
  filters,
  onChange,
  summaries,
  resultCount,
}: ReviewHistoryFiltersProps) {

  // Derive unique languages present in the summaries
  const availableLanguages = React.useMemo(() => {
    return Array.from(new Set(summaries.map(s => s.language))).sort();
  }, [summaries]);

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.categories.length > 0 ||
    filters.languages.length > 0;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value });
  };

  const toggleCategory = (cat: ReviewCategory) => {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter(c => c !== cat)
      : [...filters.categories, cat];
    onChange({ ...filters, categories: next });
  };

  const toggleLanguage = (lang: string) => {
    const next = filters.languages.includes(lang)
      ? filters.languages.filter(l => l !== lang)
      : [...filters.languages, lang];
    onChange({ ...filters, languages: next });
  };

  const clearFilters = () => onChange(DEFAULT_REVIEW_HISTORY_FILTERS);

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={filters.search}
          onChange={handleSearchChange}
          placeholder="Search code or AI response…"
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-400 transition-colors"
        />
        {filters.search && (
          <button
            onClick={() => onChange({ ...filters, search: "" })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Category:</span>
        {ALL_CATEGORIES.map(({ key, label }) => {
          const active = filters.categories.includes(key);
          return (
            <button
              key={key}
              onClick={() => toggleCategory(key)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                active
                  ? "bg-sky-600 text-white border-sky-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-700"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Language filter chips */}
      {availableLanguages.length > 0 && (
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Language:</span>
          {availableLanguages.map(lang => {
            const active = filters.languages.includes(lang);
            return (
              <button
                key={lang}
                onClick={() => toggleLanguage(lang)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                  active
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-700"
                }`}
              >
                {lang}
              </button>
            );
          })}
        </div>
      )}

      {/* Result count + clear */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium">
          {resultCount} {resultCount === 1 ? "review" : "reviews"}
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-sky-600 hover:text-sky-800 font-semibold hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Filter application helper ────────────────────────────────────────────────

/**
 * Applies the filter state to a list of full entries.
 * Exported so the parent page can call it without coupling to the component.
 */
export function applyReviewHistoryFilters(
  summaries: ReviewHistorySummary[],
  filters: ReviewHistoryFiltersState,
  /** Optional full text lookup for search — map of id -> (code + response text) */
  fullTextMap?: Map<string, string>
): ReviewHistorySummary[] {
  return summaries.filter(s => {
    if (filters.categories.length > 0 && !filters.categories.includes(s.category)) return false;
    if (filters.languages.length > 0 && !filters.languages.includes(s.language)) return false;
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      const inCode = s.codePreview.toLowerCase().includes(q);
      const inProblem = s.problemTitle?.toLowerCase().includes(q) ?? false;
      const inFullText = fullTextMap?.get(s.id)?.toLowerCase().includes(q) ?? false;
      if (!inCode && !inProblem && !inFullText) return false;
    }
    return true;
  });
}
