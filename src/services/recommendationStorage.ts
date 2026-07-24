import { RecommendationConfig } from './types';

/**
 * Storage abstraction for recommendation settings.
 * Allows seamless swap to Firebase Firestore in future updates.
 */
export interface RecommendationStorageProvider {
  loadConfig(): Promise<RecommendationConfig | null>;
  saveConfig(config: RecommendationConfig): Promise<void>;
  clearConfig(): Promise<void>;
}

export class LocalStorageRecommendationStorage implements RecommendationStorageProvider {
  private STORAGE_KEY = "dsa_recommendation_config";

  async loadConfig(): Promise<RecommendationConfig | null> {
    if (typeof window === "undefined") return null;
    const item = localStorage.getItem(this.STORAGE_KEY);
    if (!item) return null;
    try {
      return JSON.parse(item);
    } catch (e) {
      console.error("Failed to parse recommendation config from storage", e);
      return null;
    }
  }

  async saveConfig(config: RecommendationConfig): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
  }

  async clearConfig(): Promise<void> {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const recommendationStorage = new LocalStorageRecommendationStorage();
