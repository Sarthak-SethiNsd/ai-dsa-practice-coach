"use client";

import * as React from "react";
import {
  KnowledgeSearchFilters,
  KnowledgeSortField,
  NoteRevisionStatus,
  MistakeCategory,
  MISTAKE_CATEGORIES,
  DSA_PATTERNS,
} from "@/services/knowledge/knowledgeTypes";
import { Platform, Difficulty } from "@/services/types";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const TOPICS = [
  "Arrays", "Binary Search", "Dynamic Programming", "Trees & BST", "Graphs",
  "Strings", "Two Pointers", "Sliding Window", "Linked Lists", "Stacks",
  "Queues", "Heaps", "Hash Table", "Sorting", "Math", "Bit Manipulation",
  "Greedy", "Backtracking", "Recursion",
];

const REVISION_STATUS_OPTIONS: { id: NoteRevisionStatus; label: string }[] = [
  { id: "mastered", label: "Mastered" },
  { id: "in_progress", label: "In Progress" },
  { id: "revisit", label: "Needs Revisit" },
  { id: "forgotten", label: "Forgotten" },
  { id: "not_started", label: "Not Started" },
];

const SORT_OPTIONS: { id: KnowledgeSortField; label: string }[] = [
  { id: "recently_updated", label: "Recently Updated" },
  { id: "recently_solved", label: "Recently Added" },
  { id: "most_revisited", label: "Most Needing Revision" },
  { id: "most_mistakes", label: "Most Mistakes" },
  { id: "difficulty", label: "Difficulty (Easy → Hard)" },
];

interface KnowledgeFiltersProps {
  filters: KnowledgeSearchFilters;
  onChange: (f: KnowledgeSearchFilters) => void;
}

export function KnowledgeFilters({ filters, onChange }: KnowledgeFiltersProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const activeFiltersCount = [
    filters.platform,
    filters.topic,
    filters.difficulty,
    filters.pattern,
    filters.mistakeCategory,
    filters.revisionStatus,
    ...(filters.tags ?? []),
  ].filter(Boolean).length;

  const clearFilters = () => {
    onChange({ query: filters.query, sortBy: filters.sortBy });
  };

  const update = (patch: Partial<KnowledgeSearchFilters>) => {
    onChange({ ...filters, ...patch });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {/* Sort */}
        <select
          value={filters.sortBy ?? "recently_updated"}
          onChange={(e) => update({ sortBy: e.target.value as KnowledgeSortField })}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400/30 bg-white cursor-pointer"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>

        {/* Toggle advanced filters */}
        <Button
          variant={activeFiltersCount > 0 ? "primary" : "secondary"}
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-1.5 cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {activeFiltersCount > 0 && (
            <span className="bg-white text-sky-700 rounded-full px-1.5 py-0.5 text-xs font-extrabold ml-0.5">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1 text-slate-500 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </Button>
        )}
      </div>

      {/* Expanded filter panel */}
      {isExpanded && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <FilterSelect
            label="Platform"
            value={filters.platform ?? ""}
            onChange={(v) => update({ platform: (v as Platform) || undefined })}
            options={[
              { value: "", label: "All Platforms" },
              { value: "leetcode", label: "LeetCode" },
              { value: "codeforces", label: "Codeforces" },
            ]}
          />

          <FilterSelect
            label="Difficulty"
            value={filters.difficulty ?? ""}
            onChange={(v) => update({ difficulty: (v as Difficulty) || undefined })}
            options={[
              { value: "", label: "All Difficulties" },
              { value: "Easy", label: "Easy" },
              { value: "Medium", label: "Medium" },
              { value: "Hard", label: "Hard" },
            ]}
          />

          <FilterSelect
            label="Topic"
            value={filters.topic ?? ""}
            onChange={(v) => update({ topic: v || undefined })}
            options={[
              { value: "", label: "All Topics" },
              ...TOPICS.map((t) => ({ value: t, label: t })),
            ]}
          />

          <FilterSelect
            label="Pattern"
            value={filters.pattern ?? ""}
            onChange={(v) => update({ pattern: v || undefined })}
            options={[
              { value: "", label: "All Patterns" },
              ...DSA_PATTERNS.map((p) => ({ value: p, label: p })),
            ]}
          />

          <FilterSelect
            label="Revision Status"
            value={filters.revisionStatus ?? ""}
            onChange={(v) => update({ revisionStatus: (v as NoteRevisionStatus) || undefined })}
            options={[
              { value: "", label: "All Statuses" },
              ...REVISION_STATUS_OPTIONS.map((s) => ({ value: s.id, label: s.label })),
            ]}
          />

          <FilterSelect
            label="Mistake Type"
            value={filters.mistakeCategory ?? ""}
            onChange={(v) => update({ mistakeCategory: (v as MistakeCategory) || undefined })}
            options={[
              { value: "", label: "All Mistake Types" },
              ...MISTAKE_CATEGORIES.map((m) => ({ value: m.id, label: m.label })),
            ]}
          />
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-500 mb-1 block uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400/30 bg-white cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
