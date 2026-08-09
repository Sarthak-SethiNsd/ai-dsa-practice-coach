"use client";

import * as React from "react";
import { useQuestionCollections } from "@/hooks/useQuestionCollections";
import { ReviewCollection, CreateCollectionPayload, UpdateCollectionPayload } from "@/services/collectionTypes";
import { CollectionCard } from "@/components/questionCollections/CollectionCard";
import { CollectionDetailView } from "@/components/questionCollections/CollectionDetailView";
import { CreateEditCollectionModal, CollectionFormPayload } from "@/components/questionCollections/CreateEditCollectionModal";
import { DeleteCollectionModal } from "@/components/questionCollections/DeleteCollectionModal";
import { CollectionSortKey } from "@/services/questionCollectionAnalytics";
import { useAppContext } from "@/context/AppContext";
import {
  Folder,
  Plus,
  Search,
  SortAsc,
  Loader2,
  X,
  BarChart2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

type SortOption = { key: CollectionSortKey; label: string };

const SORT_OPTIONS: SortOption[] = [
  { key: "updated",       label: "Recently Updated" },
  { key: "created",       label: "Date Created"     },
  { key: "name",          label: "Name (A–Z)"       },
  { key: "questionCount", label: "Question Count"   },
  { key: "avgScore",      label: "Average Score"    },
];

export default function CollectionsPage() {
  const { showToast } = useAppContext();

  const {
    loading,
    filteredCollections,
    analyticsMap,
    searchQuery,
    setSearchQuery,
    sortKey,
    setSortKey,
    getCollectionEntries,
    createCollection,
    updateCollection,
    deleteCollection,
    duplicateCollection,
    removeReviewFromCollection,
    collections,
  } = useQuestionCollections();

  // View state
  const [viewingCollection, setViewingCollection] = React.useState<ReviewCollection | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<ReviewCollection | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<ReviewCollection | null>(null);

  // ── Keep viewingCollection in sync; handle deletion without setState-in-effect ──
  const syncedViewingCollection = React.useMemo(() => {
    if (!viewingCollection) return null;
    return collections.find((c) => c.id === viewingCollection.id) ?? null;
  }, [viewingCollection, collections]);

  // If the collection was deleted while viewing it, go back to list
  const activeViewCollection = viewingCollection && syncedViewingCollection ? syncedViewingCollection : null;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleCreate = async (payload: CollectionFormPayload) => {
    const cp: CreateCollectionPayload = { name: payload.name, description: payload.description, color: payload.color };
    await createCollection(cp);
    showToast("Collection created successfully.");
  };

  const handleEdit = async (payload: CollectionFormPayload) => {
    if (!editTarget) return;
    const up: UpdateCollectionPayload = { name: payload.name, description: payload.description, color: payload.color };
    await updateCollection(editTarget.id, up);
    showToast("Collection updated.");
    setEditTarget(null);
  };

  const handleDuplicate = async (id: string) => {
    const dup = await duplicateCollection(id);
    if (dup) showToast(`Duplicated as "${dup.name}".`);
    else showToast("Failed to duplicate collection.");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const ok = await deleteCollection(deleteTarget.id);
    if (ok) {
      showToast(`"${deleteTarget.name}" deleted.`);
      if (viewingCollection?.id === deleteTarget.id) setViewingCollection(null);
    } else {
      showToast("Failed to delete collection.");
    }
    setDeleteTarget(null);
  };

  // ── Detail View ─────────────────────────────────────────────────────────────
  if (activeViewCollection) {
    const colEntries = getCollectionEntries(activeViewCollection);
    const analytics = analyticsMap.get(activeViewCollection.id) ?? {
      totalReviews: 0, avgScore: 0, avgTokens: 0, avgDurationMs: 0,
      languages: [], categories: [], strongestTopic: null,
      weakestTopic: null, mostCommonMistakeCategory: null,
      firstReviewDate: null, latestReviewDate: null,
    };

    return (
      <div className="max-w-4xl mx-auto pb-12">
        <CollectionDetailView
          collection={activeViewCollection}
          entries={colEntries}
          analytics={analytics}
          onBack={() => setViewingCollection(null)}
          onUpdate={async (id, payload) => {
            const updated = await updateCollection(id, payload);
            if (updated) showToast("Collection updated.");
            return updated;
          }}
          onDelete={(col) => setDeleteTarget(col)}
          onRemoveReview={async (collectionId, reviewId) => {
            const ok = await removeReviewFromCollection(collectionId, reviewId);
            if (ok) showToast("Review removed from collection.");
            return ok;
          }}
        />

        {deleteTarget && (
          <DeleteCollectionModal
            collection={deleteTarget}
            onConfirm={handleDelete}
            onClose={() => setDeleteTarget(null)}
          />
        )}
      </div>
    );
  }

  // ── Collections List View ────────────────────────────────────────────────────
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 select-none">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Question Collections
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed">
            Organise your AI-reviewed DSA questions into structured, searchable collections for targeted revision.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="gap-2 shrink-0"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="w-4 h-4" /> New Collection
        </Button>
      </div>

      {/* Summary Stats */}
      {!loading && collections.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Collections",
              value: collections.length,
              icon: Folder,
              bg: "bg-sky-50",
              text: "text-sky-600",
            },
            {
              label: "Total Reviews",
              value: collections.reduce((acc, c) => acc + c.reviewIds.length, 0),
              icon: BookOpen,
              bg: "bg-purple-50",
              text: "text-purple-600",
            },
            {
              label: "Avg Score",
              value: (() => {
                const all = [...analyticsMap.values()].filter((a) => a.totalReviews > 0);
                if (all.length === 0) return "—";
                return `${Math.round(all.reduce((s, a) => s + a.avgScore, 0) / all.length)} pts`;
              })(),
              icon: BarChart2,
              bg: "bg-emerald-50",
              text: "text-emerald-600",
            },
            {
              label: "Languages",
              value: new Set(
                [...analyticsMap.values()].flatMap((a) => a.languages)
              ).size,
              icon: SortAsc,
              bg: "bg-amber-50",
              text: "text-amber-600",
            },
          ].map(({ label, value, icon: Icon, bg, text }) => (
            <div
              key={label}
              className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center shadow-xs space-y-1"
            >
              <div className={`w-8 h-8 rounded-xl ${bg} ${text} flex items-center justify-center mx-auto`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xl font-black text-slate-900">{value}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search + Sort Toolbar */}
      {!loading && collections.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search collections…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 text-sm font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-shadow"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 shrink-0">
            <SortAsc className="w-4 h-4 text-slate-400" />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as CollectionSortKey)}
              className="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.key} value={o.key}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-7 h-7 text-sky-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading collections…</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && collections.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-400">
            <Folder className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-base font-extrabold text-slate-800">No collections yet</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Create your first collection to organize AI-reviewed DSA questions into structured study sets.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)} className="gap-2 mt-1">
            <Plus className="w-4 h-4" /> Create First Collection
          </Button>
        </div>
      )}

      {/* No results (after searching) */}
      {!loading && collections.length > 0 && filteredCollections.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <p className="text-sm font-semibold text-slate-500">
            No collections match &quot;{searchQuery}&quot;.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-xs text-sky-600 font-bold hover:underline cursor-pointer"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Collections Grid */}
      {!loading && filteredCollections.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCollections.map((col) => (
            <CollectionCard
              key={col.id}
              collection={col}
              analytics={analyticsMap.get(col.id) ?? {
                totalReviews: 0, avgScore: 0, avgTokens: 0, avgDurationMs: 0,
                languages: [], categories: [], strongestTopic: null,
                weakestTopic: null, mostCommonMistakeCategory: null,
                firstReviewDate: null, latestReviewDate: null,
              }}
              onView={setViewingCollection}
              onEdit={(c) => setEditTarget(c)}
              onDuplicate={handleDuplicate}
              onDelete={(c) => setDeleteTarget(c)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {createOpen && (
        <CreateEditCollectionModal
          onSubmit={handleCreate}
          onClose={() => setCreateOpen(false)}
        />
      )}

      {editTarget && (
        <CreateEditCollectionModal
          existing={editTarget}
          onSubmit={handleEdit}
          onClose={() => setEditTarget(null)}
        />
      )}

      {deleteTarget && (
        <DeleteCollectionModal
          collection={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
