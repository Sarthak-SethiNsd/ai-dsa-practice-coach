import * as React from "react";
import { Search, SlidersHorizontal } from "lucide-react";

export type PlatformFilter = "all" | "leetcode" | "codeforces";
export type StatusFilter = "all" | "completed" | "in-progress" | "partial";
export type DateFilter = "all" | "today" | "week" | "month";
export type SortOption =
  | "newest"
  | "oldest"
  | "completion-high"
  | "completion-low";

export interface HistoryFilters {
  search: string;
  platform: PlatformFilter;
  status: StatusFilter;
  date: DateFilter;
  sort: SortOption;
}

interface HistoryFiltersBarProps {
  filters: HistoryFilters;
  onFiltersChange: (next: HistoryFilters) => void;
  totalResults: number;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

function FilterSelect({ label, children, className = "", ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-0.5">
        {label}
      </label>
      <select
        className={`text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

/**
 * Toolbar with topic search, platform / status / date filters, and sort selector.
 * Stateless — all filter values are lifted to the parent (history/page.tsx).
 */
export function HistoryFiltersBar({
  filters,
  onFiltersChange,
  totalResults,
}: HistoryFiltersBarProps) {
  const set = <K extends keyof HistoryFilters>(key: K, value: HistoryFilters[K]) =>
    onFiltersChange({ ...filters, [key]: value });

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs p-4 space-y-3">
      {/* Row 1: search + result count */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by topic..."
            value={filters.search}
            onChange={e => set("search", e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-slate-50/50 text-slate-700 font-medium"
          />
        </div>
        <span className="text-xs font-semibold text-slate-400 whitespace-nowrap shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5 inline mr-1 text-sky-500" />
          {totalResults} session{totalResults !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Row 2: filter + sort controls */}
      <div className="flex flex-wrap gap-3">
        <FilterSelect
          label="Platform"
          value={filters.platform}
          onChange={e => set("platform", e.target.value as PlatformFilter)}
        >
          <option value="all">All Platforms</option>
          <option value="leetcode">LeetCode</option>
          <option value="codeforces">Codeforces</option>
        </FilterSelect>

        <FilterSelect
          label="Status"
          value={filters.status}
          onChange={e => set("status", e.target.value as StatusFilter)}
        >
          <option value="all">All Statuses</option>
          <option value="completed">Fully Completed</option>
          <option value="in-progress">In Progress</option>
          <option value="partial">Partial</option>
        </FilterSelect>

        <FilterSelect
          label="Date"
          value={filters.date}
          onChange={e => set("date", e.target.value as DateFilter)}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </FilterSelect>

        <FilterSelect
          label="Sort By"
          value={filters.sort}
          onChange={e => set("sort", e.target.value as SortOption)}
          className="ml-auto"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="completion-high">Highest Completion %</option>
          <option value="completion-low">Lowest Completion %</option>
        </FilterSelect>
      </div>
    </div>
  );
}
