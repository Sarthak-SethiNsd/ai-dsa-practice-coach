import { PracticeRoadmap, RoadmapProgress, ROADMAP_STORAGE_KEYS } from "./roadmapTypes";

// ─── Storage Provider Interface ───────────────────────────────────────────────

export interface RoadmapStorageProvider {
  saveRoadmap(roadmap: PracticeRoadmap): Promise<void>;
  getRoadmap(): Promise<PracticeRoadmap | null>;
  saveProgress(progress: RoadmapProgress): Promise<void>;
  getProgress(): Promise<RoadmapProgress | null>;
  saveCompletedTask(taskId: string, completedDate: string): Promise<void>;
  getCompletedTasks(): Promise<Record<string, string>>; // taskId -> completedDate
  removeCompletedTask(taskId: string): Promise<void>;
  deleteRoadmap(): Promise<void>;
  clearAll(): Promise<void>;
}

// ─── LocalStorage Implementation ──────────────────────────────────────────────

export class LocalStorageRoadmapStorage implements RoadmapStorageProvider {
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
      console.error(`[RoadmapStorage] Failed to parse key: ${key}`);
      return null;
    }
  }

  private write(key: string, value: unknown): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.error(`[RoadmapStorage] Failed to write key: ${key}`);
    }
  }

  async saveRoadmap(roadmap: PracticeRoadmap): Promise<void> {
    this.write(ROADMAP_STORAGE_KEYS.ROADMAP, roadmap);
  }

  async getRoadmap(): Promise<PracticeRoadmap | null> {
    return this.read<PracticeRoadmap>(ROADMAP_STORAGE_KEYS.ROADMAP);
  }

  async saveProgress(progress: RoadmapProgress): Promise<void> {
    this.write(ROADMAP_STORAGE_KEYS.PROGRESS, progress);
  }

  async getProgress(): Promise<RoadmapProgress | null> {
    return this.read<RoadmapProgress>(ROADMAP_STORAGE_KEYS.PROGRESS);
  }

  async saveCompletedTask(taskId: string, completedDate: string): Promise<void> {
    const existing = (await this.getCompletedTasks()) ?? {};
    existing[taskId] = completedDate;
    this.write(ROADMAP_STORAGE_KEYS.COMPLETED_TASKS, existing);
  }

  async getCompletedTasks(): Promise<Record<string, string>> {
    return this.read<Record<string, string>>(ROADMAP_STORAGE_KEYS.COMPLETED_TASKS) ?? {};
  }

  async removeCompletedTask(taskId: string): Promise<void> {
    const existing = await this.getCompletedTasks();
    delete existing[taskId];
    this.write(ROADMAP_STORAGE_KEYS.COMPLETED_TASKS, existing);
  }

  async deleteRoadmap(): Promise<void> {
    if (!this.isClient()) return;
    localStorage.removeItem(ROADMAP_STORAGE_KEYS.ROADMAP);
    localStorage.removeItem(ROADMAP_STORAGE_KEYS.PROGRESS);
  }

  async clearAll(): Promise<void> {
    if (!this.isClient()) return;
    Object.values(ROADMAP_STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }
}

export const roadmapStorage = new LocalStorageRoadmapStorage();
