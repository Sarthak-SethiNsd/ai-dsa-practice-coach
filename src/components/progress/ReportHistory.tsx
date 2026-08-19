"use client";

import * as React from "react";
import { SavedReportRecord } from "@/services/progress/progressTypes";
import { Button } from "@/components/ui/Button";
import {
  History,
  Calendar,
  Trash2,
  RefreshCw,
  X,
  BookmarkPlus,
  Target,
  Clock,
  Flame,
  Award,
} from "lucide-react";

interface ReportHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  savedReports: SavedReportRecord[];
  onSelectReport: (report: SavedReportRecord) => void;
  onDeleteReport: (id: string) => Promise<void>;
  onSaveCurrentReport: () => Promise<void>;
}

export function ReportHistory({
  isOpen,
  onClose,
  savedReports,
  onSelectReport,
  onDeleteReport,
  onSaveCurrentReport,
}: ReportHistoryProps) {
  const [savingCurrent, setSavingCurrent] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSavingCurrent(true);
    try {
      await onSaveCurrentReport();
    } finally {
      setSavingCurrent(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await onDeleteReport(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col pointer-events-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-indigo-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Report History</h3>
              <p className="text-xs text-slate-500">{savedReports.length} saved progress reports</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/70 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Save Current Button */}
        <div className="p-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={savingCurrent}
            className="w-full gap-2 text-xs font-bold cursor-pointer bg-sky-600 hover:bg-sky-700 text-white"
          >
            <BookmarkPlus className="w-4 h-4" />
            {savingCurrent ? "Saving to History..." : "Save Current Report to History"}
          </Button>
        </div>

        {/* Reports List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedReports.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs font-semibold">
              No saved reports in history yet. Save your current progress report to revisit anytime!
            </div>
          ) : (
            savedReports.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-sky-300 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{rec.title}</h4>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {rec.startDate} to {rec.endDate}
                    </p>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {rec.timeRangePreset}
                  </span>
                </div>

                {/* Highlights mini grid */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 text-[11px] font-bold text-slate-700">
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3 text-sky-600" />
                    <span>{rec.summaryHighlights.problemsSolved} solved</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500" />
                    <span>{rec.summaryHighlights.streak}d streak</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-emerald-600" />
                    <span>{rec.summaryHighlights.readinessScore}% score</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400">
                    Saved {new Date(rec.generatedAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        onSelectReport(rec);
                        onClose();
                      }}
                      className="p-1.5 text-xs font-bold text-sky-600 hover:bg-sky-50 cursor-pointer h-7"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" /> Load
                    </Button>
                    <button
                      onClick={() => handleDelete(rec.id)}
                      disabled={deletingId === rec.id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
