"use client";

import * as React from "react";
import { GalleryCategory, GalleryItem, VirtualTour } from "@/services/gallery/galleryTypes";
import { GALLERY_ITEMS, VIRTUAL_TOURS } from "@/services/gallery/galleryData";
import {
  getFavoriteItemIds,
  toggleFavoriteItemId,
  filterGalleryItems,
} from "@/services/gallery/galleryStorage";
import { GalleryFilterBar } from "./GalleryFilterBar";
import { GalleryCard } from "./GalleryCard";
import { ImageLightboxModal } from "./ImageLightboxModal";
import { VirtualTourList } from "./VirtualTourList";
import { VirtualTourPlayer } from "./VirtualTourPlayer";
import { Image as ImageIcon, Compass, Layers, Star, SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";

type GalleryTab = "diagrams" | "tours";

export function GalleryView() {
  const [activeTab, setActiveTab] = React.useState<GalleryTab>("diagrams");
  const [selectedCategory, setSelectedCategory] = React.useState<GalleryCategory | "all">("all");
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [selectedTopic, setSelectedTopic] = React.useState<string | null>(null);
  const [favoritesOnly, setFavoritesOnly] = React.useState<boolean>(false);

  // Favorites state initialized lazily from storage
  const [favoriteIds, setFavoriteIds] = React.useState<string[]>(() => getFavoriteItemIds());

  // Modal / Tour states
  const [selectedLightboxItem, setSelectedLightboxItem] = React.useState<GalleryItem | null>(null);
  const [activeTour, setActiveTour] = React.useState<VirtualTour | null>(null);

  const handleToggleFavorite = (id: string) => {
    const updated = toggleFavoriteItemId(id);
    setFavoriteIds(updated);
  };

  // Collect all unique topics
  const availableTopics = React.useMemo(() => {
    const set = new Set<string>();
    GALLERY_ITEMS.forEach((item) => item.topics.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, []);

  // Category counts
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: GALLERY_ITEMS.length };
    GALLERY_ITEMS.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered items
  const filteredItems = React.useMemo(() => {
    return filterGalleryItems(
      GALLERY_ITEMS,
      {
        category: selectedCategory,
        searchQuery,
        topic: selectedTopic,
        favoritesOnly,
      },
      favoriteIds
    );
  }, [selectedCategory, searchQuery, selectedTopic, favoritesOnly, favoriteIds]);

  return (
    <div className="space-y-6">
      {/* ── Page Header & Stats Banner ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-600 border border-sky-500/20">
            <ImageIcon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Visual Gallery &amp; Virtual Tours
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-bold">
                V1
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Interactive algorithmic architecture, memory models, invariant flowcharts, and guided tours.
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/60 shrink-0">
          <div className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-sky-600" />
            <span>{GALLERY_ITEMS.length} Diagrams</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-indigo-600" />
            <span>{VIRTUAL_TOURS.length} Tours</span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-500" />
            <span>{favoriteIds.length} Saved</span>
          </div>
        </div>
      </div>

      {/* ── Tab Switcher ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("diagrams")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer select-none ${
            activeTab === "diagrams"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <ImageIcon className="w-4 h-4" /> Visual Diagrams &amp; Cheatsheets
          <span className={`px-2 py-0.2 rounded-full text-xs ${activeTab === "diagrams" ? "bg-white/20" : "bg-slate-200 text-slate-600"}`}>
            {GALLERY_ITEMS.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tours")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer select-none ${
            activeTab === "tours"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Compass className="w-4 h-4" /> Guided Visual Tours
          <span className={`px-2 py-0.2 rounded-full text-xs ${activeTab === "tours" ? "bg-white/20" : "bg-slate-200 text-slate-600"}`}>
            {VIRTUAL_TOURS.length}
          </span>
        </button>
      </div>

      {/* ── Main Tab Content ────────────────────────────────────────────────── */}
      {activeTab === "diagrams" ? (
        <div className="space-y-6">
          {/* Filters Bar */}
          <GalleryFilterBar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
            availableTopics={availableTopics}
            favoritesOnly={favoritesOnly}
            onToggleFavoritesOnly={() => setFavoritesOnly((f) => !f)}
            favoritesCount={favoriteIds.length}
            totalResultsCount={filteredItems.length}
            categoryCounts={categoryCounts}
          />

          {/* Visual Cards Grid */}
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <GalleryCard
                  key={item.id}
                  item={item}
                  isFavorite={favoriteIds.includes(item.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onSelect={setSelectedLightboxItem}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-3">
              <div className="p-3 rounded-full bg-slate-100 text-slate-400">
                <SearchX className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No visual diagrams found</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                No diagrams match your active filters or search query. Try clearing your filters or searching for different topics.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                  setSelectedTopic(null);
                  setFavoritesOnly(false);
                }}
                className="mt-2 text-xs"
              >
                Reset All Filters
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Tours View */
        <VirtualTourList
          tours={VIRTUAL_TOURS}
          galleryItems={GALLERY_ITEMS}
          onStartTour={setActiveTour}
        />
      )}

      {/* ── Lightbox Modal ──────────────────────────────────────────────────── */}
      <ImageLightboxModal
        key={selectedLightboxItem?.id ?? "none"}
        item={selectedLightboxItem}
        allItems={filteredItems.length > 0 ? filteredItems : GALLERY_ITEMS}
        isOpen={selectedLightboxItem !== null}
        onClose={() => setSelectedLightboxItem(null)}
        onNavigate={setSelectedLightboxItem}
        isFavorite={selectedLightboxItem ? favoriteIds.includes(selectedLightboxItem.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* ── Virtual Tour Player ─────────────────────────────────────────────── */}
      <VirtualTourPlayer
        key={activeTour?.id ?? "none"}
        tour={activeTour}
        galleryItems={GALLERY_ITEMS}
        isOpen={activeTour !== null}
        onClose={() => setActiveTour(null)}
      />
    </div>
  );
}
