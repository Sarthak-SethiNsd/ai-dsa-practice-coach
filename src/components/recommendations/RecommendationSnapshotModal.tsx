"use client";

import * as React from "react";
import {
  RecommendationSnapshot,
  RecommendationComparison,
} from "@/services/recommendationTypes";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  X,
  History,
  Trash2,
  GitCompare,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Calendar,
} from "lucide-react";

interface RecommendationSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: RecommendationSnapshot[];
  currentSnapshot: RecommendationSnapshot;
  comparison: RecommendationComparison | null;
  selectedBaselineId: string | null;
  onSelectBaseline: (id: string | null) => void;
  onDeleteSnapshot: (id: string) => Promise<void>;
}

export function RecommendationSnapshotModal({
  isOpen,
  onClose,
  snapshots,
  currentSnapshot,
  comparison,
  selectedBaselineId,
  onSelectBaseline,
  onDeleteSnapshot,
}: RecommendationSnapshotModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recommendation History & Snapshot Comparison</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                View previous recommendation snapshots and compare side-by-side performance changes over time
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Comparison Section (if baseline selected) */}
          {comparison && (
            <div className="bg-gradient-to-r from-sky-900/10 via-indigo-900/10 to-slate-900/10 dark:from-sky-950/40 dark:to-indigo-950/40 border border-sky-200/80 dark:border-sky-800/60 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Comparison: Current Snapshot ({currentSnapshot.overallReadinessScore} pts) vs Snapshot ({new Date(comparison.baselineSnapshot.timestamp).toLocaleDateString()})
                  </h4>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSelectBaseline(null)}
                  className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer p-1"
                >
                  Clear Comparison
                </Button>
              </div>

              {/* Top Summary Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Overall Score Change</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    {comparison.overallScoreChange >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-rose-500" />
                    )}
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {comparison.overallScoreChange >= 0 ? `+${comparison.overallScoreChange}` : comparison.overallScoreChange} pts
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Resolved Action Items</span>
                  <div className="flex items-center gap-1.5 mt-1 text-emerald-600 dark:text-emerald-400 font-extrabold text-lg">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{comparison.resolvedActionsCount} item(s)</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Weakest Topic Shift</span>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {comparison.weakestTopicChanged ? (
                      <span className="text-amber-600 dark:text-amber-400 font-bold">
                        {comparison.previousWeakestTopic} → {comparison.currentWeakestTopic}
                      </span>
                    ) : (
                      <span className="text-slate-500">Unchanged ({comparison.currentWeakestTopic})</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Per-Metric Readiness Differences */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Dimension Score Changes:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {comparison.readinessDiffs.map((diff) => (
                    <div
                      key={diff.metric}
                      className="bg-white/80 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-xs"
                    >
                      <span className="text-slate-600 dark:text-slate-400 font-semibold">{diff.metric}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">{diff.previousScore} → {diff.currentScore}</span>
                        <Badge
                          variant={diff.diff >= 0 ? "success" : "warning"}
                          className="text-[10px] px-1.5 py-0 font-bold"
                        >
                          {diff.diff >= 0 ? `+${diff.diff}` : diff.diff}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Snapshot History Table / Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Saved Recommendation Snapshots ({snapshots.length})
              </h4>
              <span className="text-xs text-slate-400">Click any snapshot to compare with current state</span>
            </div>

            {snapshots.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs">
                No saved recommendation snapshots yet. Click &quot;Save Snapshot&quot; on the overview bar to record your progress snapshot.
              </div>
            ) : (
              <div className="space-y-2.5">
                {snapshots.map((snap) => {
                  const isSelected = snap.id === selectedBaselineId;
                  const dateStr = new Date(snap.timestamp).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={snap.id}
                      className={`p-4 rounded-2xl border transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isSelected
                          ? "bg-sky-50/80 dark:bg-sky-950/40 border-sky-300 dark:border-sky-700 shadow-xs"
                          : "bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{dateStr}</span>
                          <Badge variant="primary" className="text-[10px] py-0 font-extrabold">
                            Readiness: {snap.overallReadinessScore} pts
                          </Badge>
                        </div>

                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                          Weakest: <strong className="text-slate-700 dark:text-slate-300">{snap.weakTopics.weakestTopic?.name || "None"}</strong> • Action Cards: <strong>{snap.actionCards.length}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant={isSelected ? "primary" : "secondary"}
                          size="sm"
                          onClick={() => onSelectBaseline(isSelected ? null : snap.id)}
                          className="text-xs gap-1.5 cursor-pointer"
                        >
                          <GitCompare className="w-3.5 h-3.5" />
                          <span>{isSelected ? "Comparing" : "Compare"}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteSnapshot(snap.id)}
                          className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 cursor-pointer"
                          title="Delete snapshot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose} className="text-xs cursor-pointer">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
