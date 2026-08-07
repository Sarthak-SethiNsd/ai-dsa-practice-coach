"use client";

import * as React from "react";
import { CollectionColor } from "@/services/collectionTypes";
import { useReviewCollections } from "@/hooks/useReviewCollections";
import { DEFAULT_COLLECTION_COLORS } from "@/services/reviewCollectionStorage";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  X,
  FolderPlus,
  Plus,
  Check,
  FolderCheck,
  Search,
} from "lucide-react";

const COLOR_STYLES: Record<CollectionColor, { bg: string; border: string; text: string }> = {
  sky: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  rose: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700" },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" },
  cyan: { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700" },
  slate: { bg: "bg-slate-100", border: "border-slate-300", text: "text-slate-700" },
};

interface AddToCollectionModalProps {
  isOpen: boolean;
  reviewIds: string[]; // one or multiple
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export function AddToCollectionModal({
  isOpen,
  reviewIds,
  onClose,
  onSuccess,
}: AddToCollectionModalProps) {
  const { collections, createCollection, addReviewsToCollection, refresh } =
    useReviewCollections();

  const [search, setSearch] = React.useState("");
  const [selectedColIds, setSelectedColIds] = React.useState<string[]>([]);
  const [isCreatingNew, setIsCreatingNew] = React.useState(false);

  // New collection form state
  const [newColName, setNewColName] = React.useState("");
  const [newColDesc, setNewColDesc] = React.useState("");
  const [newColColor, setNewColColor] = React.useState<CollectionColor>("sky");

  // Pre-select collections that ALREADY contain all requested reviewIds when modal opens
  React.useEffect(() => {
    if (isOpen && reviewIds.length > 0) {
      const initial = collections
        .filter((col) => reviewIds.every((id) => col.reviewIds.includes(id)))
        .map((col) => col.id);
      queueMicrotask(() => {
        setSelectedColIds(initial);
      });
    }
  }, [isOpen, reviewIds, collections]);

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

  if (!isOpen || reviewIds.length === 0) return null;

  const filtered = collections.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  const toggleCollectionSelect = (id: string) => {
    setSelectedColIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSaveAssignments = async () => {
    try {
      for (const colId of selectedColIds) {
        await addReviewsToCollection(colId, reviewIds);
      }
      onSuccess?.(
        `Added ${reviewIds.length} review${reviewIds.length > 1 ? "s" : ""} to collection${
          selectedColIds.length > 1 ? "s" : ""
        }.`
      );
      refresh();
      onClose();
    } catch (err) {
      console.error("[AddToCollectionModal] Save error:", err);
    }
  };

  const handleCreateAndAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    try {
      const created = await createCollection({
        name: newColName.trim(),
        description: newColDesc.trim() || undefined,
        color: newColColor,
        initialReviewIds: reviewIds,
      });

      onSuccess?.(
        `Created collection "${created.name}" with ${reviewIds.length} review${
          reviewIds.length > 1 ? "s" : ""
        }.`
      );
      setIsCreatingNew(false);
      setNewColName("");
      setNewColDesc("");
      onClose();
    } catch (err) {
      console.error("[AddToCollectionModal] Create error:", err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Add to Collection
              </h3>
              <p className="text-[11px] text-slate-400">
                Organize {reviewIds.length} selected review{reviewIds.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {isCreatingNew ? (
            <form onSubmit={handleCreateAndAssign} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800">New Collection</h4>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-[11px] text-slate-400 hover:text-slate-700 font-semibold"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Collection Name *
                </label>
                <input
                  type="text"
                  required
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="e.g. Dynamic Programming Practice"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  placeholder="Optional context or goals"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Color Tag
                </label>
                <div className="flex items-center gap-2">
                  {DEFAULT_COLLECTION_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        COLOR_STYLES[c].bg
                      } ${COLOR_STYLES[c].border} ${
                        newColColor === c ? "scale-110 border-slate-700 ring-2 ring-slate-400/30" : ""
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCreatingNew(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Create &amp; Add
                </Button>
              </div>
            </form>
          ) : (
            <>
              {/* Search & Create Button */}
              <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search collections..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsCreatingNew(true)}
                  className="gap-1 text-xs font-bold shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> New
                </Button>
              </div>

              {/* Collections Checklist */}
              {collections.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-2">
                  <p className="text-xs text-slate-500 font-medium">
                    No collections created yet.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsCreatingNew(true)}
                    className="gap-1 text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create First Collection
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((col) => {
                    const isSelected = selectedColIds.includes(col.id);
                    const colorStyle = COLOR_STYLES[col.color];

                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => toggleCollectionSelect(col.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? `${colorStyle.bg} ${colorStyle.border} shadow-sm`
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${colorStyle.text}`}>
                              {col.name}
                            </span>
                            <Badge variant="neutral" className="text-[10px] px-1.5 py-0">
                              {col.reviewIds.length} review{col.reviewIds.length !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                          {col.description && (
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              {col.description}
                            </p>
                          )}
                        </div>

                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "bg-sky-600 border-sky-600 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 font-bold" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!isCreatingNew && collections.length > 0 && (
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 bg-slate-50/70">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveAssignments}
              disabled={selectedColIds.length === 0}
              className="gap-1.5 font-bold text-xs"
            >
              <FolderCheck className="w-3.5 h-3.5" /> Save Assignments
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
