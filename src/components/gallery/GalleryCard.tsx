"use client";

import * as React from "react";
import { GalleryItem } from "@/services/gallery/galleryTypes";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Star, Maximize2, Sparkles } from "lucide-react";

interface GalleryCardProps {
  item: GalleryItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelect: (item: GalleryItem) => void;
}

const CATEGORY_LABELS: Record<string, { label: string; variant: "primary" | "secondary" | "success" | "warning" | "neutral" }> = {
  data_structures: { label: "Data Structures", variant: "primary" },
  algorithm_patterns: { label: "Algorithm Patterns", variant: "secondary" },
  cheatsheets: { label: "Cheatsheet", variant: "warning" },
  system_architecture: { label: "System Architecture", variant: "success" },
};

export function GalleryCard({
  item,
  isFavorite,
  onToggleFavorite,
  onSelect,
}: GalleryCardProps) {
  const categoryInfo = CATEGORY_LABELS[item.category] || { label: item.category, variant: "neutral" };

  return (
    <Card
      className="group relative flex flex-col overflow-hidden bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200 cursor-pointer"
      onClick={() => onSelect(item)}
      tabIndex={0}
      role="button"
      aria-label={`View diagram: ${item.title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(item);
        }
      }}
    >
      {/* Visual Preview Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-900 border-b border-slate-100 flex items-center justify-center p-2">
        <div
          className="w-full h-full flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.02]"
          dangerouslySetInnerHTML={{ __html: item.svgContent }}
        />

        {/* Hover Overlay with Zoom Icon */}
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/90 text-slate-800 text-xs font-semibold backdrop-blur-sm shadow-sm">
            <Maximize2 className="w-3.5 h-3.5 text-sky-600" /> Click to Expand
          </span>
        </div>

        {/* Favorite Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(item.id);
          }}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg backdrop-blur-md transition-all duration-150 select-none ${
            isFavorite
              ? "bg-amber-500/90 text-white shadow-sm"
              : "bg-slate-900/60 text-slate-300 hover:bg-slate-900/90 hover:text-white"
          }`}
          aria-label={isFavorite ? `Remove ${item.title} from favorites` : `Add ${item.title} to favorites`}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star className={`w-4 h-4 ${isFavorite ? "fill-white" : ""}`} />
        </button>

        {/* Difficulty Pill */}
        {item.difficulty && (
          <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-slate-900/80 text-slate-200 text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
            {item.difficulty}
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 p-4.5 justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={categoryInfo.variant} className="text-[11px] py-0 px-2">
              {categoryInfo.label}
            </Badge>
          </div>

          <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
            {item.title}
          </h3>

          <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Topic Chips Footer */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1 items-center">
            {item.topics.slice(0, 2).map((topic) => (
              <span
                key={topic}
                className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium"
              >
                {topic}
              </span>
            ))}
            {item.topics.length > 2 && (
              <span className="text-[10px] text-slate-400 font-medium">
                +{item.topics.length - 2}
              </span>
            )}
          </div>

          {item.relatedSkillNodeId && (
            <span className="inline-flex items-center gap-1 text-[10px] text-sky-600 font-semibold" title="Linked to Learning Graph">
              <Sparkles className="w-3 h-3" /> Graph
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
