import { GalleryItem, GalleryFilterOptions } from "./galleryTypes";

export const GALLERY_FAVORITES_STORAGE_KEY = "dsa_gallery_favorites";

function isClient(): boolean {
  return (
    typeof window !== "undefined" ||
    (typeof globalThis !== "undefined" && typeof globalThis.localStorage !== "undefined")
  );
}

/**
 * Retrieves the list of favorited gallery item IDs from localStorage.
 */
export function getFavoriteItemIds(): string[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(GALLERY_FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch (err) {
    console.error("[galleryStorage] Error reading favorites:", err);
    return [];
  }
}

/**
 * Saves favorited gallery item IDs to localStorage.
 */
export function saveFavoriteItemIds(ids: string[]): void {
  if (!isClient()) return;
  try {
    const uniqueIds = Array.from(new Set(ids));
    localStorage.setItem(GALLERY_FAVORITES_STORAGE_KEY, JSON.stringify(uniqueIds));
  } catch (err) {
    console.error("[galleryStorage] Error saving favorites:", err);
  }
}

/**
 * Toggles a gallery item's favorite status and returns the updated array of favorite IDs.
 */
export function toggleFavoriteItemId(id: string): string[] {
  const current = getFavoriteItemIds();
  const exists = current.includes(id);
  const updated = exists ? current.filter((favId) => favId !== id) : [...current, id];
  saveFavoriteItemIds(updated);
  return updated;
}

/**
 * Checks whether a specific gallery item is favorited.
 */
export function isFavoriteItem(id: string, favoriteIds?: string[]): boolean {
  const list = favoriteIds ?? getFavoriteItemIds();
  return list.includes(id);
}

/**
 * Clears all favorited gallery items.
 */
export function clearFavorites(): void {
  if (!isClient()) return;
  try {
    localStorage.removeItem(GALLERY_FAVORITES_STORAGE_KEY);
  } catch (err) {
    console.error("[galleryStorage] Error clearing favorites:", err);
  }
}

/**
 * Deterministically filters and searches gallery items based on user criteria.
 */
export function filterGalleryItems(
  items: GalleryItem[],
  options: GalleryFilterOptions,
  favoriteIds: string[] = []
): GalleryItem[] {
  const query = options.searchQuery.trim().toLowerCase();

  return items.filter((item) => {
    // Category filter
    if (options.category !== "all" && item.category !== options.category) {
      return false;
    }

    // Favorites only filter
    if (options.favoritesOnly && !favoriteIds.includes(item.id)) {
      return false;
    }

    // Specific topic filter
    if (options.topic && !item.topics.map((t) => t.toLowerCase()).includes(options.topic.toLowerCase())) {
      return false;
    }

    // Search query across title, description, and topics
    if (query) {
      const titleMatch = item.title.toLowerCase().includes(query);
      const descMatch = item.description.toLowerCase().includes(query);
      const topicMatch = item.topics.some((t) => t.toLowerCase().includes(query));
      const notesMatch = item.detailedNotes.some((n) => n.toLowerCase().includes(query));

      if (!titleMatch && !descMatch && !topicMatch && !notesMatch) {
        return false;
      }
    }

    return true;
  });
}
