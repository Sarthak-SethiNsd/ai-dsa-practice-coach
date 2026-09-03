"use client";

import * as React from "react";
import { GalleryCategory } from "@/services/gallery/galleryTypes";
import { Search, X, Star, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface GalleryFilterBarProps {
  selectedCategory: GalleryCategory | "all";
  onSelectCategory: (cat: GalleryCategory | "all") => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedTopic: string | null;
  onSelectTopic: (topic: string | null) => void;
  availableTopics: string[];
  favoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
  favoritesCount: number;
  totalResultsCount: number;
  categoryCounts: Record<string, number>;
}

const CATEGORIES: { id: GalleryCategory | "all"; label: string }[] = [
  { id: "all", label: "All Visuals" },
  { id: "algorithm_patterns", label: "Algorithm Patterns" },
  { id: "data_structures", label: "Data Structures" },
  { id: "system_architecture", label: "System Architecture" },
];

export function GalleryFilterBar({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  selectedTopic,
  onSelectTopic,
  availableTopics,
  favoritesOnly,
  onToggleFavoritesOnly,
  favoritesCount,
  totalResultsCount,
  categoryCounts,
}: GalleryFilterBarProps) {
  const hasActiveFilters =
    selectedCategory !== "all" ||
    searchQuery.trim().length > 0 ||
    selectedTopic !== null ||
    favoritesOnly;

  return (
    <div className="space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search diagrams, patterns, topics..."
            className="w-full pl-10 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              aria-label="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Favorites & Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant={favoritesOnly ? "primary" : "secondary"}
            size="sm"
            onClick={onToggleFavoritesOnly}
            className={`gap-1.5 cursor-pointer ${
              favoritesOnly
                ? "bg-amber-500 hover:bg-amber-600 border-amber-500 text-white"
                : ""
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${favoritesOnly ? "fill-white" : ""}`} />
            Favorites
            {favoritesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-white/20 rounded-full text-[10px] font-bold">
                {favoritesCount}
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onSelectCategory("all");
                onSearchChange("");
                onSelectTopic(null);
                if (favoritesOnly) onToggleFavoritesOnly();
              }}
              className="text-xs text-slate-500 hover:text-slate-800 gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const count = cat.id === "all" ? categoryCounts.all ?? 0 : categoryCounts[cat.id] ?? 0;
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all select-none cursor-pointer ${
                isSelected
                  ? "bg-sky-600 text-white shadow-sm shadow-sky-500/10"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {cat.label}
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Topic Filter Chips (if any available) */}
      {availableTopics.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Topics:
          </span>
          {availableTopics.map((topic) => {
            const isSelected = selectedTopic?.toLowerCase() === topic.toLowerCase();
            return (
              <button
                key={topic}
                type="button"
                onClick={() => onSelectTopic(isSelected ? null : topic)}
                className={`px-2.5 py-0.5 rounded-lg text-xs font-medium transition-all select-none cursor-pointer ${
                  isSelected
                    ? "bg-slate-800 text-white font-semibold shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {topic}
              </button>
            );
          })}
        </div>
      )}

      {/* Results Count Line */}
      <div className="text-xs text-slate-400 font-medium">
        Showing {totalResultsCount} visual {totalResultsCount === 1 ? "diagram" : "diagrams"}
      </div>
    </div>
  );
}
