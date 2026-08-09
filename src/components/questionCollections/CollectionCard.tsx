"use client";

import * as React from "react";
import { ReviewCollection } from "@/services/collectionTypes";
import { CollectionAnalyticsResult, COLOR_PALETTE } from "@/services/questionCollectionAnalytics";
import {
  Folder,
  Calendar,
  MoreHorizontal,
  Edit2,
  Copy,
  Trash2,
  ArrowRight,
  TrendingUp,
  BookOpen,
} from "lucide-react";

interface CollectionCardProps {
  collection: ReviewCollection;
  analytics: CollectionAnalyticsResult;
  onView: (col: ReviewCollection) => void;
  onEdit: (col: ReviewCollection) => void;
  onDuplicate: (id: string) => void;
  onDelete: (col: ReviewCollection) => void;
}

export function CollectionCard({
  collection,
  analytics,
  onView,
  onEdit,
  onDuplicate,
  onDelete,
}: CollectionCardProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const pal = COLOR_PALETTE[collection.color];

  React.useEffect(() => {
    if (!menuOpen) return;
    const h = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [menuOpen]);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(collection.updatedAt));

  return (
    <div className="group bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-4">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-2">
        {/* Color dot + Name */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${pal.bg} ${pal.text} ${pal.border} border`}
          >
            <Folder className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-slate-900 truncate leading-snug">
              {collection.name}
            </h3>
            {collection.description && (
              <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-snug mt-0.5">
                {collection.description}
              </p>
            )}
          </div>
        </div>

        {/* Overflow menu */}
        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setMenuOpen((p) => !p); }}
            className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Collection options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1.5 z-30 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-sm">
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onEdit(collection); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-400" /> Edit
              </button>
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onDuplicate(collection.id); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" /> Duplicate
              </button>
              <div className="border-t border-slate-100" />
              <button
                type="button"
                onClick={() => { setMenuOpen(false); onDelete(collection); }}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center space-y-0.5">
          <p className="text-base font-black text-slate-900">{collection.reviewIds.length}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reviews</p>
        </div>
        <div className="text-center space-y-0.5">
          <p className="text-base font-black text-sky-600">
            {analytics.totalReviews > 0 ? `${analytics.avgScore} pts` : "—"}
          </p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Score</p>
        </div>
        <div className="text-center space-y-0.5">
          <p className="text-base font-black text-slate-900">
            {analytics.languages.length > 0 ? analytics.languages[0] : "—"}
          </p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Language</p>
        </div>
      </div>

      {/* Quick analytics pills */}
      {analytics.strongestTopic && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <TrendingUp className="w-3 h-3" /> {analytics.strongestTopic.split(" ")[0]}
          </span>
          {analytics.categories.slice(0, 2).map((cat) => (
            <span key={cat} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              <BookOpen className="w-3 h-3 inline mr-0.5" />{cat.split(" ")[0]}
            </span>
          ))}
        </div>
      )}

      {/* Footer: date + view button */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
          <Calendar className="w-3 h-3" />
          Updated {formattedDate}
        </div>

        <button
          type="button"
          onClick={() => onView(collection)}
          className="flex items-center gap-1 text-xs font-extrabold text-sky-600 hover:text-sky-800 transition-colors cursor-pointer"
        >
          View <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
