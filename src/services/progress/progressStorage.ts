import {
  SavedReportRecord,
  ReportPrivacySettings,
  DEFAULT_PRIVACY_SETTINGS,
} from "./progressTypes";

const SAVED_REPORTS_KEY = "dsa_progress_saved_reports";
const PRIVACY_SETTINGS_KEY = "dsa_progress_privacy_settings";

function buildSeedSavedReports(): SavedReportRecord[] {
  const now = new Date();
  const offset = (daysAgo: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split("T")[0];
  };

  return [
    {
      id: "rep_seed_30d",
      title: "Monthly DSA Mastery & Performance Report",
      timeRangePreset: "30d",
      startDate: offset(30),
      endDate: offset(0),
      generatedAt: new Date(now.getTime() - 86400000).toISOString(),
      summaryHighlights: {
        problemsSolved: 42,
        studyHours: 18.5,
        streak: 7,
        readinessScore: 84,
        contestsRating: 1385,
      },
      privacySnapshot: DEFAULT_PRIVACY_SETTINGS,
    },
    {
      id: "rep_seed_7d",
      title: "Weekly Sprint & Revision Summary",
      timeRangePreset: "7d",
      startDate: offset(7),
      endDate: offset(0),
      generatedAt: new Date(now.getTime() - 3600000 * 3).toISOString(),
      summaryHighlights: {
        problemsSolved: 14,
        studyHours: 6.2,
        streak: 7,
        readinessScore: 86,
        contestsRating: 1385,
      },
      privacySnapshot: DEFAULT_PRIVACY_SETTINGS,
    },
  ];
}

export interface ProgressStorageProvider {
  getSavedReports(): Promise<SavedReportRecord[]>;
  saveReportRecord(report: SavedReportRecord): Promise<void>;
  deleteReportRecord(id: string): Promise<boolean>;
  getPrivacySettings(): Promise<ReportPrivacySettings>;
  savePrivacySettings(settings: ReportPrivacySettings): Promise<void>;
}

export class LocalStorageProgressStorage implements ProgressStorageProvider {
  private isClient(): boolean {
    return typeof window !== "undefined";
  }

  // ── Saved Reports ─────────────────────────────────────────────────────────

  private loadRawReports(): SavedReportRecord[] {
    if (!this.isClient()) return [];
    try {
      const raw = localStorage.getItem(SAVED_REPORTS_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("[ProgressStorage] Load reports failed:", e);
      return [];
    }
  }

  private saveRawReports(reports: SavedReportRecord[]): void {
    if (!this.isClient()) return;
    localStorage.setItem(SAVED_REPORTS_KEY, JSON.stringify(reports));
  }

  async getSavedReports(): Promise<SavedReportRecord[]> {
    const reports = this.loadRawReports();
    if (reports.length === 0) {
      const seed = buildSeedSavedReports();
      this.saveRawReports(seed);
      return seed;
    }
    return reports;
  }

  async saveReportRecord(report: SavedReportRecord): Promise<void> {
    const existing = await this.getSavedReports();
    const filtered = existing.filter((r) => r.id !== report.id);
    this.saveRawReports([report, ...filtered]);
  }

  async deleteReportRecord(id: string): Promise<boolean> {
    const existing = await this.getSavedReports();
    const filtered = existing.filter((r) => r.id !== id);
    if (filtered.length === existing.length) return false;
    this.saveRawReports(filtered);
    return true;
  }

  // ── Privacy Settings ──────────────────────────────────────────────────────

  async getPrivacySettings(): Promise<ReportPrivacySettings> {
    if (!this.isClient()) return DEFAULT_PRIVACY_SETTINGS;
    try {
      const raw = localStorage.getItem(PRIVACY_SETTINGS_KEY);
      if (!raw) return DEFAULT_PRIVACY_SETTINGS;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PRIVACY_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_PRIVACY_SETTINGS;
    }
  }

  async savePrivacySettings(settings: ReportPrivacySettings): Promise<void> {
    if (!this.isClient()) return;
    localStorage.setItem(PRIVACY_SETTINGS_KEY, JSON.stringify(settings));
  }
}

export const progressStorage = new LocalStorageProgressStorage();
