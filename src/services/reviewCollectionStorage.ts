import {
  ReviewCollection,
  CreateCollectionPayload,
  UpdateCollectionPayload,
  CollectionColor,
} from "./collectionTypes";

const STORAGE_KEY = "dsa_review_collections";

export const DEFAULT_COLLECTION_COLORS: CollectionColor[] = [
  "sky",
  "emerald",
  "purple",
  "amber",
  "rose",
  "indigo",
  "cyan",
  "slate",
];

export interface ReviewCollectionStorageProvider {
  getAll(): Promise<ReviewCollection[]>;
  getById(id: string): Promise<ReviewCollection | null>;
  create(payload: CreateCollectionPayload): Promise<ReviewCollection>;
  update(id: string, payload: UpdateCollectionPayload): Promise<ReviewCollection | null>;
  deleteById(id: string): Promise<boolean>;
  duplicate(id: string): Promise<ReviewCollection | null>;
  addReviewsToCollection(collectionId: string, reviewIds: string[]): Promise<boolean>;
  removeReviewFromCollection(collectionId: string, reviewId: string): Promise<boolean>;
  removeReviewFromAllCollections(reviewId: string): Promise<void>;
  cleanupOrphanedReviewIds(validReviewIds: string[]): Promise<void>;
}

export class LocalStorageReviewCollectionStorage implements ReviewCollectionStorageProvider {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  private getRawCollections(): ReviewCollection[] {
    if (!this.isClient()) return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("[ReviewCollectionStorage] Failed to parse collections:", e);
      return [];
    }
  }

  private saveRawCollections(collections: ReviewCollection[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
  }

  async getAll(): Promise<ReviewCollection[]> {
    const list = this.getRawCollections();
    // Sort by updatedAt descending by default
    return [...list].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getById(id: string): Promise<ReviewCollection | null> {
    const all = await this.getAll();
    return all.find((c) => c.id === id) ?? null;
  }

  async create(payload: CreateCollectionPayload): Promise<ReviewCollection> {
    const now = new Date().toISOString();
    const newId = `col_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const newCol: ReviewCollection = {
      id: newId,
      name: payload.name.trim(),
      description: payload.description?.trim() || undefined,
      color: payload.color || "sky",
      createdAt: now,
      updatedAt: now,
      reviewIds: Array.from(new Set(payload.initialReviewIds || [])),
    };

    const existing = this.getRawCollections();
    this.saveRawCollections([newCol, ...existing]);
    return newCol;
  }

  async update(id: string, payload: UpdateCollectionPayload): Promise<ReviewCollection | null> {
    const existing = this.getRawCollections();
    const index = existing.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const current = existing[index];
    const updated: ReviewCollection = {
      ...current,
      name: payload.name !== undefined ? payload.name.trim() : current.name,
      description:
        payload.description !== undefined ? payload.description.trim() || undefined : current.description,
      color: payload.color !== undefined ? payload.color : current.color,
      updatedAt: new Date().toISOString(),
    };

    existing[index] = updated;
    this.saveRawCollections(existing);
    return updated;
  }

  async deleteById(id: string): Promise<boolean> {
    const existing = this.getRawCollections();
    const filtered = existing.filter((c) => c.id !== id);
    if (filtered.length === existing.length) return false;

    this.saveRawCollections(filtered);
    return true;
  }

  async duplicate(id: string): Promise<ReviewCollection | null> {
    const target = await this.getById(id);
    if (!target) return null;

    return this.create({
      name: `${target.name} (Copy)`,
      description: target.description,
      color: target.color,
      initialReviewIds: [...target.reviewIds],
    });
  }

  async addReviewsToCollection(collectionId: string, reviewIds: string[]): Promise<boolean> {
    const existing = this.getRawCollections();
    const index = existing.findIndex((c) => c.id === collectionId);
    if (index === -1) return false;

    const target = existing[index];
    const updatedSet = new Set([...target.reviewIds, ...reviewIds]);
    const updated: ReviewCollection = {
      ...target,
      reviewIds: Array.from(updatedSet),
      updatedAt: new Date().toISOString(),
    };

    existing[index] = updated;
    this.saveRawCollections(existing);
    return true;
  }

  async removeReviewFromCollection(collectionId: string, reviewId: string): Promise<boolean> {
    const existing = this.getRawCollections();
    const index = existing.findIndex((c) => c.id === collectionId);
    if (index === -1) return false;

    const target = existing[index];
    const updatedIds = target.reviewIds.filter((id) => id !== reviewId);
    if (updatedIds.length === target.reviewIds.length) return false;

    const updated: ReviewCollection = {
      ...target,
      reviewIds: updatedIds,
      updatedAt: new Date().toISOString(),
    };

    existing[index] = updated;
    this.saveRawCollections(existing);
    return true;
  }

  async removeReviewFromAllCollections(reviewId: string): Promise<void> {
    const existing = this.getRawCollections();
    let modified = false;

    const updatedCollections = existing.map((col) => {
      if (col.reviewIds.includes(reviewId)) {
        modified = true;
        return {
          ...col,
          reviewIds: col.reviewIds.filter((id) => id !== reviewId),
          updatedAt: new Date().toISOString(),
        };
      }
      return col;
    });

    if (modified) {
      this.saveRawCollections(updatedCollections);
    }
  }

  async cleanupOrphanedReviewIds(validReviewIds: string[]): Promise<void> {
    const validSet = new Set(validReviewIds);
    const existing = this.getRawCollections();
    let modified = false;

    const cleaned = existing.map((col) => {
      const filtered = col.reviewIds.filter((id) => validSet.has(id));
      if (filtered.length !== col.reviewIds.length) {
        modified = true;
        return { ...col, reviewIds: filtered };
      }
      return col;
    });

    if (modified) {
      this.saveRawCollections(cleaned);
    }
  }
}

export const reviewCollectionStorage = new LocalStorageReviewCollectionStorage();
