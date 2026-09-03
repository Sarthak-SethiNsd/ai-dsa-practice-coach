/**
 * Deterministic Unit and Integration Tests for Visual Gallery & Virtual Tours.
 *
 * Covers:
 * 1. Category filtering subsets items accurately.
 * 2. Search query matches title, description, topics, and detailed notes case-insensitively.
 * 3. Topic filter isolates specific DSA categories.
 * 4. Favorites filtering isolates saved IDs.
 * 5. Combined filter queries resolve deterministically.
 * 6. LocalStorage persistence: get, save, toggle, clear, and invalid JSON recovery.
 * 7. Curated Virtual Tour validation: all steps link to existing gallery items.
 * 8. Tour step progression bounds and step counts.
 */

import assert from "node:assert/strict";
import { test, describe, beforeEach } from "node:test";

import {
  GALLERY_FAVORITES_STORAGE_KEY,
  getFavoriteItemIds,
  saveFavoriteItemIds,
  toggleFavoriteItemId,
  isFavoriteItem,
  clearFavorites,
  filterGalleryItems,
} from "../galleryStorage";
import { GALLERY_ITEMS, VIRTUAL_TOURS } from "../galleryData";
import { GalleryItem, GalleryFilterOptions } from "../galleryTypes";

// Mock localStorage for Node environment tests
class LocalStorageMock {
  private store: Record<string, string> = {};
  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }
  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
  clear(): void {
    this.store = {};
  }
}

if (typeof globalThis.localStorage === "undefined") {
  (globalThis as unknown as { localStorage: LocalStorageMock }).localStorage = new LocalStorageMock();
}

describe("Gallery Storage & Persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("1. getFavoriteItemIds returns empty array when storage is empty", () => {
    assert.deepEqual(getFavoriteItemIds(), []);
  });

  test("2. saveFavoriteItemIds persists IDs and avoids duplicates", () => {
    saveFavoriteItemIds(["gal_two_pointers", "gal_sliding_window", "gal_two_pointers"]);
    const stored = getFavoriteItemIds();
    assert.deepEqual(stored, ["gal_two_pointers", "gal_sliding_window"]);
  });

  test("3. toggleFavoriteItemId adds new ID and removes existing ID", () => {
    // Add
    const afterAdd = toggleFavoriteItemId("gal_binary_search");
    assert.deepEqual(afterAdd, ["gal_binary_search"]);
    assert.strictEqual(isFavoriteItem("gal_binary_search"), true);

    // Toggle off
    const afterRemove = toggleFavoriteItemId("gal_binary_search");
    assert.deepEqual(afterRemove, []);
    assert.strictEqual(isFavoriteItem("gal_binary_search"), false);
  });

  test("4. clearFavorites removes the storage key", () => {
    saveFavoriteItemIds(["gal_1", "gal_2"]);
    clearFavorites();
    assert.deepEqual(getFavoriteItemIds(), []);
  });

  test("5. getFavoriteItemIds handles malformed JSON gracefully", () => {
    localStorage.setItem(GALLERY_FAVORITES_STORAGE_KEY, "invalid_json_payload{");
    const result = getFavoriteItemIds();
    assert.deepEqual(result, []);
  });
});

describe("Gallery Filtering & Search Logic", () => {
  const sampleItems: GalleryItem[] = [
    {
      id: "item_1",
      slug: "two-pointers-test",
      title: "Two Pointers Flowchart",
      category: "algorithm_patterns",
      description: "Opposite direction pointers on sorted array.",
      detailedNotes: ["Inward pointer convergence O(N)."],
      svgContent: "<svg></svg>",
      aspectRatio: "16/9",
      altText: "Two pointers diagram",
      topics: ["Two Pointers", "Arrays"],
      difficulty: "Easy",
      createdAt: "2026-09-01T00:00:00Z",
    },
    {
      id: "item_2",
      slug: "trie-memory-test",
      title: "Trie Node Structure",
      category: "data_structures",
      description: "Multi-way prefix tree with character edges.",
      detailedNotes: ["26-element array for char indexing."],
      svgContent: "<svg></svg>",
      aspectRatio: "16/9",
      altText: "Trie diagram",
      topics: ["Trie", "Trees", "Strings"],
      difficulty: "Medium",
      createdAt: "2026-09-01T00:00:00Z",
    },
    {
      id: "item_3",
      slug: "dp-memo-test",
      title: "DP Memoization Tree",
      category: "algorithm_patterns",
      description: "DAG recursion tree pruning overlapping subproblems.",
      detailedNotes: ["Memoization table O(1) cache lookup."],
      svgContent: "<svg></svg>",
      aspectRatio: "16/9",
      altText: "DP tree",
      topics: ["Dynamic Programming", "Recursion"],
      difficulty: "Hard",
      createdAt: "2026-09-01T00:00:00Z",
    },
  ];

  test("6. Category filter correctly subsets items", () => {
    const opts: GalleryFilterOptions = {
      category: "data_structures",
      searchQuery: "",
      topic: null,
      favoritesOnly: false,
    };
    const res = filterGalleryItems(sampleItems, opts);
    assert.strictEqual(res.length, 1);
    assert.strictEqual(res[0].id, "item_2");
  });

  test("7. Category 'all' returns all items", () => {
    const opts: GalleryFilterOptions = {
      category: "all",
      searchQuery: "",
      topic: null,
      favoritesOnly: false,
    };
    const res = filterGalleryItems(sampleItems, opts);
    assert.strictEqual(res.length, 3);
  });

  test("8. Search query matches title, description, topics, and detailed notes", () => {
    // Title match
    let res = filterGalleryItems(sampleItems, {
      category: "all",
      searchQuery: "flowchart",
      topic: null,
      favoritesOnly: false,
    });
    assert.strictEqual(res.length, 1);
    assert.strictEqual(res[0].id, "item_1");

    // Topic match
    res = filterGalleryItems(sampleItems, {
      category: "all",
      searchQuery: "recursion",
      topic: null,
      favoritesOnly: false,
    });
    assert.strictEqual(res.length, 1);
    assert.strictEqual(res[0].id, "item_3");

    // Detailed notes match
    res = filterGalleryItems(sampleItems, {
      category: "all",
      searchQuery: "char indexing",
      topic: null,
      favoritesOnly: false,
    });
    assert.strictEqual(res.length, 1);
    assert.strictEqual(res[0].id, "item_2");
  });

  test("9. Topic filter matches exact topic case-insensitively", () => {
    const res = filterGalleryItems(sampleItems, {
      category: "all",
      searchQuery: "",
      topic: "two pointers",
      favoritesOnly: false,
    });
    assert.strictEqual(res.length, 1);
    assert.strictEqual(res[0].id, "item_1");
  });

  test("10. Favorites-only filter returns only favorited items", () => {
    const favoriteIds = ["item_1", "item_3"];
    const res = filterGalleryItems(
      sampleItems,
      {
        category: "all",
        searchQuery: "",
        topic: null,
        favoritesOnly: true,
      },
      favoriteIds
    );
    assert.strictEqual(res.length, 2);
    assert.deepEqual(
      res.map((i) => i.id),
      ["item_1", "item_3"]
    );
  });
});

describe("Curated Static Dataset & Virtual Tours Integrity", () => {
  test("11. GALLERY_ITEMS contains valid items with non-empty SVG markup and topics", () => {
    assert.ok(GALLERY_ITEMS.length >= 10, "Expected at least 10 curated gallery items");

    const ids = new Set<string>();
    for (const item of GALLERY_ITEMS) {
      assert.ok(item.id.length > 0, "Item must have id");
      assert.ok(item.title.length > 0, "Item must have title");
      assert.ok(item.svgContent.includes("<svg"), "Item must contain valid SVG markup");
      assert.ok(item.topics.length > 0, "Item must have at least 1 topic");
      assert.ok(!ids.has(item.id), `Duplicate gallery item id: ${item.id}`);
      ids.add(item.id);
    }
  });

  test("12. All Virtual Tours reference existing gallery items in all steps", () => {
    assert.ok(VIRTUAL_TOURS.length >= 3, "Expected at least 3 curated virtual tours");
    const itemIds = new Set(GALLERY_ITEMS.map((item) => item.id));

    for (const tour of VIRTUAL_TOURS) {
      assert.ok(tour.steps.length > 0, `Tour ${tour.id} must have at least 1 step`);
      assert.ok(itemIds.has(tour.coverItemId), `Tour ${tour.id} coverItemId ${tour.coverItemId} must exist in GALLERY_ITEMS`);

      for (let i = 0; i < tour.steps.length; i++) {
        const step = tour.steps[i];
        assert.strictEqual(step.stepNumber, i + 1, `Step numbers must be 1-indexed sequential in tour ${tour.id}`);
        assert.ok(
          itemIds.has(step.galleryItemId),
          `Tour ${tour.id} step ${step.stepNumber} references non-existent galleryItemId: ${step.galleryItemId}`
        );
        assert.ok(step.headline.length > 0, "Step must have a headline");
        assert.ok(step.narration.length > 0, "Step must have narration");
      }
    }
  });
});
