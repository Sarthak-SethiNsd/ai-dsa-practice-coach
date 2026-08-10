import {
  RecommendationSnapshot,
  RecommendationComparison,
  ReadinessScoreDiff,
} from "./recommendationTypes";

const STORAGE_KEY = "dsa_recommendation_snapshots";
const MAX_SNAPSHOTS = 50;

export interface RecommendationHistoryStorageProvider {
  saveSnapshot(snapshot: RecommendationSnapshot): Promise<void>;
  getAllSnapshots(): Promise<RecommendationSnapshot[]>;
  getSnapshotById(id: string): Promise<RecommendationSnapshot | null>;
  deleteSnapshotById(id: string): Promise<void>;
  clearAllSnapshots(): Promise<void>;
  compareSnapshots(
    current: RecommendationSnapshot,
    baseline: RecommendationSnapshot
  ): RecommendationComparison;
}

export class LocalStorageRecommendationHistoryStorage
  implements RecommendationHistoryStorageProvider
{
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  private loadAll(): RecommendationSnapshot[] {
    if (!this.isClient()) return [];
    const item = localStorage.getItem(STORAGE_KEY);
    if (!item) return [];
    try {
      const parsed = JSON.parse(item);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("[RecommendationHistoryStorage] Error loading snapshots:", e);
      return [];
    }
  }

  private persist(snapshots: RecommendationSnapshot[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots));
  }

  async saveSnapshot(snapshot: RecommendationSnapshot): Promise<void> {
    if (!this.isClient()) return;
    const existing = this.loadAll();
    const updated = [snapshot, ...existing.filter((s) => s.id !== snapshot.id)];
    const trimmed = updated.slice(0, MAX_SNAPSHOTS);
    this.persist(trimmed);
  }

  async getAllSnapshots(): Promise<RecommendationSnapshot[]> {
    return this.loadAll();
  }

  async getSnapshotById(id: string): Promise<RecommendationSnapshot | null> {
    const snapshots = this.loadAll();
    return snapshots.find((s) => s.id === id) || null;
  }

  async deleteSnapshotById(id: string): Promise<void> {
    if (!this.isClient()) return;
    const filtered = this.loadAll().filter((s) => s.id !== id);
    this.persist(filtered);
  }

  async clearAllSnapshots(): Promise<void> {
    if (!this.isClient()) return;
    localStorage.removeItem(STORAGE_KEY);
  }

  compareSnapshots(
    current: RecommendationSnapshot,
    baseline: RecommendationSnapshot
  ): RecommendationComparison {
    const keys: (keyof typeof current.readinessScores)[] = [
      "problemSolving",
      "optimization",
      "edgeCases",
      "communication",
      "consistency",
    ];

    const readinessDiffs: ReadinessScoreDiff[] = keys.map((key) => {
      const cDetail = current.readinessScores[key];
      const bDetail = baseline.readinessScores[key];
      const cScore = typeof cDetail === "object" ? cDetail.score : 0;
      const bScore = typeof bDetail === "object" ? bDetail.score : 0;
      return {
        metric: typeof cDetail === "object" ? cDetail.label : String(key),
        currentScore: cScore,
        previousScore: bScore,
        diff: cScore - bScore,
      };
    });

    const prevWeak = baseline.weakTopics.weakestTopic?.name || null;
    const currWeak = current.weakTopics.weakestTopic?.name || null;
    const weakestTopicChanged = prevWeak !== currWeak;

    const resolvedActionsCount = baseline.actionCards.filter(
      (bCard) => !current.actionCards.some((cCard) => cCard.id === bCard.id)
    ).length;

    const overallScoreChange =
      current.overallReadinessScore - baseline.overallReadinessScore;

    return {
      baselineSnapshot: baseline,
      currentSnapshot: current,
      readinessDiffs,
      weakestTopicChanged,
      previousWeakestTopic: prevWeak,
      currentWeakestTopic: currWeak,
      resolvedActionsCount: Math.max(0, resolvedActionsCount),
      overallScoreChange,
    };
  }
}

export const recommendationHistoryStorage =
  new LocalStorageRecommendationHistoryStorage();
