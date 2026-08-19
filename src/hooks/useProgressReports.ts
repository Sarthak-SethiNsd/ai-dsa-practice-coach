"use client";

import * as React from "react";
import {
  ProgressReportData,
  ProgressSnapshotCardData,
  ReportTimeRange,
  TimeRangePreset,
  ReportPrivacySettings,
  SavedReportRecord,
  DEFAULT_PRIVACY_SETTINGS,
} from "@/services/progress/progressTypes";
import { resolveTimeRange } from "@/services/progress/progressEngine";
import { generateProgressReport } from "@/services/progress/reportGenerator";
import { progressStorage } from "@/services/progress/progressStorage";
import { exportProgressReportPDF, exportSnapshotCardPNG } from "@/services/progress/progressExport";

// Underlying stores
import { sessionArchiveStorage } from "@/services/sessionArchiveStorage";
import { contestStorage } from "@/services/contest/contestStorage";
import { studyStorage } from "@/services/study/studyStorage";
import { revisionStorage } from "@/services/revision/revisionStorage";
import { knowledgeStorage } from "@/services/knowledge/knowledgeStorage";
import { computePatternLibrary } from "@/services/knowledge/knowledgeEngine";
import { reviewHistoryStorage } from "@/services/reviewHistoryStorage";
import { computePerformanceAnalytics } from "@/services/analytics/performanceAnalyticsEngine";
import { recommendationHistoryStorage } from "@/services/recommendationHistoryStorage";
import { roadmapStorage } from "@/services/roadmapStorage";

export interface UseProgressReportsReturn {
  // Report data & status
  report: ProgressReportData | null;
  loading: boolean;
  timeRange: ReportTimeRange;
  privacySettings: ReportPrivacySettings;
  savedReports: SavedReportRecord[];

  // Actions
  setTimeRangePreset: (preset: TimeRangePreset, customStart?: string, customEnd?: string) => void;
  updatePrivacySettings: (settings: Partial<ReportPrivacySettings>) => Promise<void>;
  regenerateReport: () => void;
  saveCurrentReportToHistory: () => Promise<void>;
  deleteSavedReport: (id: string) => Promise<void>;

  // Export & Sharing
  downloadPDF: () => void;
  downloadPNG: () => Promise<void>;

  // UI Modal Toggles
  isShareModalOpen: boolean;
  setIsShareModalOpen: (open: boolean) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  isPrivacyModalOpen: boolean;
  setIsPrivacyModalOpen: (open: boolean) => void;
  isHistoryDrawerOpen: boolean;
  setIsHistoryDrawerOpen: (open: boolean) => void;
}

export function useProgressReports(): UseProgressReportsReturn {
  const [timeRangePreset, setPreset] = React.useState<TimeRangePreset>("30d");
  const [customRange, setCustomRange] = React.useState<{ start?: string; end?: string }>({});
  const [privacySettings, setPrivacySettings] = React.useState<ReportPrivacySettings>(DEFAULT_PRIVACY_SETTINGS);
  const [report, setReport] = React.useState<ProgressReportData | null>(null);
  const [savedReports, setSavedReports] = React.useState<SavedReportRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshSignal, setRefreshSignal] = React.useState(0);

  // Modals
  const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = React.useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = React.useState(false);

  const timeRange = React.useMemo(
    () => resolveTimeRange(timeRangePreset, customRange.start, customRange.end),
    [timeRangePreset, customRange]
  );

  // ─── Load underlying data and generate report ─────────────────────────────

  React.useEffect(() => {
    let cancelled = false;

    const loadAndGenerate = async () => {
      setLoading(true);
      try {
        const [
          savedPrivacy,
          loadedSavedReports,
          sessions,
          contests,
          studySessions,
          revisionItems,
          knowledgeNotes,
          reviews,
          snapshots,
          roadmap,
        ] = await Promise.all([
          progressStorage.getPrivacySettings(),
          progressStorage.getSavedReports(),
          sessionArchiveStorage.loadAll(),
          contestStorage.getEntries(),
          studyStorage.getSessions(),
          revisionStorage.getItems(),
          knowledgeStorage.getNotes(),
          reviewHistoryStorage.getAllEntries(),
          recommendationHistoryStorage.getAllSnapshots(),
          roadmapStorage.getRoadmap(),
        ]);

        if (cancelled) return;

        setPrivacySettings(savedPrivacy);
        setSavedReports(loadedSavedReports);

        const recSnapshot = snapshots.length > 0 ? snapshots[0] : null;
        const patterns = computePatternLibrary(knowledgeNotes, revisionItems);

        // Compute performance analytics for topic mastery
        const analytics = computePerformanceAnalytics(
          sessions,
          reviews,
          recSnapshot ? [recSnapshot] : [],
          [],
          roadmap,
          []
        );

        const generated = generateProgressReport({
          timeRange,
          privacy: savedPrivacy,
          sessions,
          contests,
          studySessions,
          revisionItems,
          knowledgeNotes,
          patterns,
          reviews,
          topicMasteryList: analytics.topicMastery.topics,
          recommendationSnapshot: recSnapshot,
          roadmap,
        });

        setReport(generated);
      } catch (err) {
        console.error("[useProgressReports] Error generating report:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadAndGenerate();
    return () => {
      cancelled = true;
    };
  }, [timeRange, refreshSignal]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const setTimeRangePreset = React.useCallback(
    (preset: TimeRangePreset, customStart?: string, customEnd?: string) => {
      setPreset(preset);
      if (customStart || customEnd) {
        setCustomRange({ start: customStart, end: customEnd });
      }
    },
    []
  );

  const updatePrivacySettings = React.useCallback(
    async (updates: Partial<ReportPrivacySettings>) => {
      const updated: ReportPrivacySettings = { ...privacySettings, ...updates };
      setPrivacySettings(updated);
      await progressStorage.savePrivacySettings(updated);
      setRefreshSignal((n) => n + 1);
    },
    [privacySettings]
  );

  const regenerateReport = React.useCallback(() => {
    setRefreshSignal((n) => n + 1);
  }, []);

  const saveCurrentReportToHistory = React.useCallback(async () => {
    if (!report) return;

    const record: SavedReportRecord = {
      id: report.reportId,
      title: report.title,
      timeRangePreset: report.timeRange.preset,
      startDate: report.timeRange.startDate,
      endDate: report.timeRange.endDate,
      generatedAt: report.generatedAt,
      summaryHighlights: {
        problemsSolved: report.summary.totalSolved,
        studyHours: report.summary.studyHours,
        streak: report.summary.currentStreak,
        readinessScore: report.summary.readinessScore,
        contestsRating: report.contests.currentCodeforcesRating,
      },
      privacySnapshot: report.privacy,
    };

    await progressStorage.saveReportRecord(record);
    const updated = await progressStorage.getSavedReports();
    setSavedReports(updated);
  }, [report]);

  const deleteSavedReport = React.useCallback(async (id: string) => {
    await progressStorage.deleteReportRecord(id);
    const updated = await progressStorage.getSavedReports();
    setSavedReports(updated);
  }, []);

  const downloadPDF = React.useCallback(() => {
    if (report) {
      exportProgressReportPDF(report);
    }
  }, [report]);

  const downloadPNG = React.useCallback(async () => {
    if (report) {
      await exportSnapshotCardPNG(report.snapshotCard);
    }
  }, [report]);

  return {
    report,
    loading,
    timeRange,
    privacySettings,
    savedReports,
    setTimeRangePreset,
    updatePrivacySettings,
    regenerateReport,
    saveCurrentReportToHistory,
    deleteSavedReport,
    downloadPDF,
    downloadPNG,
    isShareModalOpen,
    setIsShareModalOpen,
    isExportModalOpen,
    setIsExportModalOpen,
    isPrivacyModalOpen,
    setIsPrivacyModalOpen,
    isHistoryDrawerOpen,
    setIsHistoryDrawerOpen,
  };
}
