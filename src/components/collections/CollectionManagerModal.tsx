"use client";

import * as React from "react";
import { ReviewCollection, CollectionColor } from "@/services/collectionTypes";
import { useReviewCollections } from "@/hooks/useReviewCollections";
import { DEFAULT_COLLECTION_COLORS } from "@/services/reviewCollectionStorage";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  X,
  Folder,
  Plus,
  Search,
  Copy,
  Pencil,
  Trash2,
  AlertTriangle,
  FolderOpen,
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

type SortOption = "name" | "updated" | "created" | "count";

interface CollectionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCollection: (col: ReviewCollection) => void;
  onError?: (message: string) => void;
}

export function CollectionManagerModal({
  isOpen,
  onClose,
  onSelectCollection,
  onError,
}: CollectionManagerModalProps) {
  const {
    collections,
    createCollection,
    updateCollection,
    deleteCollection,
    duplicateCollection,
  } = useReviewCollections();

  const [search, setSearch] = React.useState("");
  const [sortOption, setSortOption] = React.useState<SortOption>("updated");

  // Editor form state
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    color: "sky" as CollectionColor,
  });

  // Delete confirm state
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);

  // Keyboard escape
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (deleteConfirmId) setDeleteConfirmId(null);
        else if (isEditing) setIsEditing(false);
        else onClose();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, isEditing, deleteConfirmId, onClose]);

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

  if (!isOpen) return null;

  // Filter & Sort
  const filtered = collections.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase().trim()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase().trim()))
  );

  const sorted = [...filtered].sort((a, b) => {
    switch (sortOption) {
      case "name":
        return a.name.localeCompare(b.name);
      case "created":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "count":
        return b.reviewIds.length - a.reviewIds.length;
      case "updated":
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: "", description: "", color: "sky" });
    setIsEditing(true);
  };

  const handleOpenEdit = (col: ReviewCollection) => {
    setEditingId(col.id);
    setFormData({
      name: col.name,
      description: col.description || "",
      color: col.color,
    });
    setIsEditing(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingId) {
        await updateCollection(editingId, {
          name: formData.name,
          description: formData.description,
          color: formData.color,
        });
      } else {
        await createCollection({
          name: formData.name,
          description: formData.description,
          color: formData.color,
        });
      }
      setIsEditing(false);
    } catch (err) {
      console.error("[CollectionManagerModal] Save error:", err);
      onError?.("Failed to save collection.");
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateCollection(id);
    } catch (err) {
      console.error("[CollectionManagerModal] Duplicate error:", err);
      onError?.("Failed to duplicate collection.");
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteCollection(deleteConfirmId);
    } catch (err) {
      console.error("[CollectionManagerModal] Delete error:", err);
      onError?.("Failed to delete collection.");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-start justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative h-full w-full max-w-2xl bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Saved Review Collections</h2>
              <p className="text-xs text-slate-400">
                Organize and aggregate your AI code reviews into custom sets.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenCreate}
                className="gap-1.5 text-xs font-bold"
              >
                <Plus className="w-3.5 h-3.5" /> New Collection
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* EDIT / CREATE FORM OVERLAY */}
          {isEditing ? (
            <form onSubmit={handleSaveForm} className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  {editingId ? "Edit Collection" : "Create New Collection"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-slate-400 hover:text-slate-700 font-semibold"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Collection Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dynamic Programming Solutions"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g. Reviews targeting O(N) space optimizations."
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Color Tag
                  </label>
                  <div className="flex items-center gap-2">
                    {DEFAULT_COLLECTION_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: c })}
                        className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                          COLOR_STYLES[c].bg
                        } ${COLOR_STYLES[c].border} ${
                          formData.color === c ? "scale-110 border-slate-800 ring-2 ring-slate-400/30" : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Collection
                </Button>
              </div>
            </form>
          ) : (
            <>
              {/* Search & Sort Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search collections..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-slate-400 font-medium">Sort:</span>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
                  >
                    <option value="updated">Recently Updated</option>
                    <option value="name">Name (A-Z)</option>
                    <option value="count">Most Reviews</option>
                    <option value="created">Creation Date</option>
                  </select>
                </div>
              </div>

              {/* Collections Grid / List */}
              {sorted.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 space-y-3">
                  <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">
                    {search ? "No collections match your search." : "No collections created yet."}
                  </p>
                  {!search && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleOpenCreate}
                      className="gap-1 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create Collection
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {sorted.map((col) => {
                    const style = COLOR_STYLES[col.color];

                    return (
                      <div
                        key={col.id}
                        className={`p-4 rounded-2xl border transition-all shadow-sm flex items-start justify-between gap-4 ${style.bg} ${style.border}`}
                      >
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className={`text-sm font-extrabold ${style.text}`}>
                              {col.name}
                            </h4>
                            <Badge variant="neutral" className="text-[10px] px-1.5 py-0">
                              {col.reviewIds.length} review{col.reviewIds.length !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                          {col.description && (
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {col.description}
                            </p>
                          )}
                          <p className="text-[10px] text-slate-400">
                            Updated {new Date(col.updatedAt).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              onSelectCollection(col);
                              onClose();
                            }}
                            className="text-xs font-bold px-3 py-1 h-8 bg-white border-slate-200 hover:bg-slate-50 text-slate-800 cursor-pointer"
                          >
                            Open
                          </Button>

                          <button
                            type="button"
                            onClick={() => handleDuplicate(col.id)}
                            title="Duplicate collection"
                            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-xl transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(col)}
                            title="Edit collection"
                            className="p-2 text-slate-400 hover:text-sky-600 hover:bg-white rounded-xl transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(col.id)}
                            title="Delete collection"
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Inline Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-60 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-red-600 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>Delete Collection?</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete this collection? Reviews inside this collection will NOT be deleted from history.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDeleteConfirmed}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
