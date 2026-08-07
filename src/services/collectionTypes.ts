export type CollectionColor =
  | "sky"
  | "emerald"
  | "purple"
  | "amber"
  | "rose"
  | "indigo"
  | "cyan"
  | "slate";

export interface ReviewCollection {
  /** Unique ID, e.g. "col_1722518400000_abc12" */
  id: string;
  /** Display name of the collection */
  name: string;
  /** Optional description */
  description?: string;
  /** Visual color theme identifier */
  color: CollectionColor;
  /** ISO 8601 timestamp string */
  createdAt: string;
  /** ISO 8601 timestamp string */
  updatedAt: string;
  /** Array of ReviewHistoryEntry IDs */
  reviewIds: string[];
}

export interface CreateCollectionPayload {
  name: string;
  description?: string;
  color?: CollectionColor;
  initialReviewIds?: string[];
}

export interface UpdateCollectionPayload {
  name?: string;
  description?: string;
  color?: CollectionColor;
}

export interface CollectionStats {
  totalReviews: number;
  languagesUsed: string[];
  categoriesCovered: string[];
  avgTokens: number;
  avgDurationMs: number;
  firstReviewDate: string | null;
  latestReviewDate: string | null;
}
