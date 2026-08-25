import {
  RecommendationHistoryItem,
  RecommendationFilterOptions,
} from "./recommendationTypes";
import {
  getRecommendationHistory,
  saveRecommendationHistory,
  getDismissedProblemIds,
  dismissProblem,
  clearDismissals,
} from "./recommendationHistory";

const PREFERENCES_KEY = "dsa_adaptive_rec_preferences";

export interface StoredRecommendationPreferences {
  defaultMode?: string;
  preferredPlatform?: string;
  preferredDifficulty?: string;
  autoRefreshMinutes?: number;
}

export function getStoredRecommendationPreferences(): StoredRecommendationPreferences {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStoredRecommendationPreferences(
  prefs: StoredRecommendationPreferences
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.error("[recommendationStorage] Error saving preferences:", err);
  }
}

export {
  getRecommendationHistory,
  saveRecommendationHistory,
  getDismissedProblemIds,
  dismissProblem,
  clearDismissals,
};
