"use client";

import { useState } from "react";
import { VCContestReport, VCProblemState } from "@/services/contest/virtualContestTypes";
import { AIVirtualContestCoach } from "./AIVirtualContestCoach";
import { revisionStorage } from "@/services/revision/revisionStorage";
import {
  Trophy,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Award,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Tag,
} from "lucide-react";

interface VirtualContestSummaryModalProps {
  isOpen: boolean;
  report: VCContestReport | null;
  onClose: () => void;
}

export function VirtualContestSummaryModal({
  isOpen,
  report,
  onClose,
}: VirtualContestSummaryModalProps) {
  const [addedRevisionIds, setAddedRevisionIds] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<"summary" | "coach">("summary");

  if (!isOpen || !report) return null;

  const handleAddToRevision = async (ps: VCProblemState) => {
    try {
      await revisionStorage.addItem({
        problemId: ps.problem.id,
        problemTitle: ps.problem.title,
        platform: ps.problem.platform,
        difficulty: ps.problem.difficulty,
        topics: ps.problem.topics,
        url: ps.problem.url,
        repetitions: 0,
        intervalDays: 1,
        easeFactor: 2.5,
        memoryStrength: 30,
        successRate: 0,
        lastSolvedAt: new Date().toISOString().split("T")[0],
        lastRevisedAt: new Date().toISOString().split("T")[0],
        nextDueDate: new Date().toISOString().split("T")[0],
        status: "due",
        lastReviewScore: 50,
        previousSolutionSnippet: ps.code,
      });
      setAddedRevisionIds((prev) => new Set([...prev, ps.problem.id]));
    } catch (err) {
      console.error("Failed to add problem to SRS revision:", err);
    }
  };

  const { score, config } = report;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:px-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Virtual Contest Report
                </h2>
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-white">
                  {report.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {config.contestType} Simulation • {config.durationMinutes}m Duration • {report.problemStates.length} Problems
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 sm:px-6 pt-3 border-b border-slate-100 bg-white">
          <button
            onClick={() => setActiveTab("summary")}
            className={`pb-2.5 px-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "summary"
                ? "border-sky-600 text-sky-700"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Contest Telemetry & Breakdown
          </button>
          <button
            onClick={() => setActiveTab("coach")}
            className={`pb-2.5 px-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "coach"
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Coach Debrief
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs sm:text-sm">
          {activeTab === "summary" ? (
            <>
              {/* Score KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                {/* Final Score */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-1">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                    Final Score
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
                    {score.finalScore}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Max possible: {score.maxPossibleScore} pts
                  </span>
                </div>

                {/* Solved Count */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                    Problems Solved
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
                    {score.difficultyBreakdown.easy + score.difficultyBreakdown.medium + score.difficultyBreakdown.hard}
                    <span className="text-sm font-normal text-slate-400">
                      {" "}
                      / {report.problemStates.length}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    {score.solveRate}% Solve Rate
                  </span>
                </div>

                {/* Accuracy */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                    Accuracy
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
                    {score.accuracy}%
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Precision rate
                  </span>
                </div>

                {/* Avg Solve Time */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                    Avg Solve Time
                  </span>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
                    {Math.round(score.avgSolveTimeSeconds / 60)}m
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Per solved problem
                  </span>
                </div>
              </div>

              {/* Problem Breakdown Table */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Problem Performance Breakdown
                </h3>
                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {report.problemStates.map((ps) => {
                    const isSolved = ps.status === "solved";
                    const isAdded = addedRevisionIds.has(ps.problem.id);

                    return (
                      <div
                        key={ps.problem.id}
                        className="p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isSolved ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-slate-400 shrink-0" />
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">
                                Problem {ps.problem.contestLabel}
                              </span>
                              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                {ps.problem.title}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                {ps.problem.difficulty}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                              <span>Submissions: {ps.submissions.length}</span>
                              {ps.timeToSolveSeconds && (
                                <>
                                  <span>•</span>
                                  <span>Time: {Math.round(ps.timeToSolveSeconds / 60)}m</span>
                                </>
                              )}
                              <span>•</span>
                              <span>Earned: +{isSolved ? ps.problem.basePoints : 0} pts</span>
                            </div>
                          </div>
                        </div>

                        {/* Revision Action */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAddToRevision(ps)}
                            disabled={isAdded}
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                              isAdded
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 opacity-80"
                                : "bg-white text-purple-700 border-purple-200 hover:bg-purple-50"
                            }`}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{isAdded ? "Added to SRS" : "Add to Revision"}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Observed Strengths
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-emerald-800 font-sans">
                    {report.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-600" />
                    Areas to Improve
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-amber-800 font-sans">
                    {report.weaknesses.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Learning Loop Actions Synced */}
              {report.learningLoopActions && report.learningLoopActions.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-600" />
                    Automatic Learning Loop Sync
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {report.learningLoopActions.map((action, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-medium bg-white text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs"
                      >
                        ✓ {action}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <AIVirtualContestCoach advice={report.aiCoachAdvice} score={report.score} />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xs cursor-pointer"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
