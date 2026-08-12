import {
  RecommendationBatch,
  QUESTION_STORAGE_KEYS,
} from "./questionRecommendationTypes";

export interface QuestionRecommendationStorageProvider {
  saveBatch(batch: RecommendationBatch): Promise<void>;
  getBatch(): Promise<RecommendationBatch | null>;
  markViewed(questionId: string): Promise<void>;
  getViewed(): Promise<Record<string, string>>;
  markSolved(questionId: string): Promise<void>;
  getSolved(): Promise<Record<string, string>>;
  markSkipped(questionId: string): Promise<void>;
  getSkipped(): Promise<Record<string, string>>;
  clearHistory(): Promise<void>;
  clearAll(): Promise<void>;
}

export class LocalStorageQuestionRecommendationStorage
  implements QuestionRecommendationStorageProvider
{
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  private read<T>(key: string): T | null {
    if (!this.isClient()) return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      console.error(`[QuestionStorage] Failed to parse key: ${key}`);
      return null;
    }
  }

  private write(key: string, value: unknown): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error(`[QuestionStorage] Failed to write key: ${key}`);
    }
  }

  async saveBatch(batch: RecommendationBatch): Promise<void> {
    this.write(QUESTION_STORAGE_KEYS.BATCH, batch);
  }

  async getBatch(): Promise<RecommendationBatch | null> {
    return this.read<RecommendationBatch>(QUESTION_STORAGE_KEYS.BATCH);
  }

  async markViewed(questionId: string): Promise<void> {
    const existing = (await this.getViewed()) ?? {};
    existing[questionId] = new Date().toISOString();
    this.write(QUESTION_STORAGE_KEYS.VIEWED, existing);
  }

  async getViewed(): Promise<Record<string, string>> {
    return this.read<Record<string, string>>(QUESTION_STORAGE_KEYS.VIEWED) ?? {};
  }

  async markSolved(questionId: string): Promise<void> {
    const existing = (await this.getSolved()) ?? {};
    existing[questionId] = new Date().toISOString();
    this.write(QUESTION_STORAGE_KEYS.SOLVED, existing);
  }

  async getSolved(): Promise<Record<string, string>> {
    return this.read<Record<string, string>>(QUESTION_STORAGE_KEYS.SOLVED) ?? {};
  }

  async markSkipped(questionId: string): Promise<void> {
    const existing = (await this.getSkipped()) ?? {};
    existing[questionId] = new Date().toISOString();
    this.write(QUESTION_STORAGE_KEYS.SKIPPED, existing);
  }

  async getSkipped(): Promise<Record<string, string>> {
    return this.read<Record<string, string>>(QUESTION_STORAGE_KEYS.SKIPPED) ?? {};
  }

  async clearHistory(): Promise<void> {
    if (!this.isClient()) return;
    localStorage.removeItem(QUESTION_STORAGE_KEYS.SOLVED);
    localStorage.removeItem(QUESTION_STORAGE_KEYS.SKIPPED);
    localStorage.removeItem(QUESTION_STORAGE_KEYS.VIEWED);
  }

  async clearAll(): Promise<void> {
    if (!this.isClient()) return;
    Object.values(QUESTION_STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }
}

export const questionRecommendationStorage =
  new LocalStorageQuestionRecommendationStorage();
