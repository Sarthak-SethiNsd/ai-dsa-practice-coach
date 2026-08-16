"use client";

import * as React from "react";
import { RevisionItem } from "@/services/revision/revisionTypes";
import {
  X,
  Brain,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Sparkles,
  Award,
} from "lucide-react";

interface Props {
  queue: RevisionItem[];
  initialIndex?: number;
  onClose: () => void;
  onRemembered: (id: string) => void;
  onForgotten: (id: string) => void;
}

export function RevisionWorkspaceModal({
  queue,
  initialIndex = 0,
  onClose,
  onRemembered,
  onForgotten,
}: Props) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [showSolution, setShowSolution] = React.useState(false);
  const [completedSession, setCompletedSession] = React.useState(false);

  const currentItem = queue[currentIndex];

  const handleNext = (action: "remembered" | "forgotten") => {
    if (!currentItem) return;

    if (action === "remembered") {
      onRemembered(currentItem.id);
    } else {
      onForgotten(currentItem.id);
    }

    setShowSolution(false);
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCompletedSession(true);
    }
  };

  if (completedSession || !currentItem) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-slate-900">
              Revision Session Complete!
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Great job! You revised {queue.length} problem{queue.length > 1 ? "s" : ""}. Your SRS memory intervals have been updated.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-sm rounded-2xl transition-colors cursor-pointer"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-violet-100 text-violet-700 rounded-2xl">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Active Recall Session
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Problem {currentIndex + 1} of {queue.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Progress bar pill */}
            <div className="w-32 bg-slate-200 rounded-full h-2 overflow-hidden hidden sm:block">
              <div
                className="bg-sky-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / queue.length) * 100}%` }}
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6">
          {/* Metadata badges */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-extrabold capitalize">
                {currentItem.platform}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                  currentItem.difficulty === "Easy"
                    ? "bg-emerald-100 text-emerald-800"
                    : currentItem.difficulty === "Medium"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {currentItem.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
              <span>Memory Strength: <strong className="text-slate-900">{currentItem.memoryStrength}%</strong></span>
              <span>Last Interval: <strong className="text-slate-900">{currentItem.intervalDays}d</strong></span>
            </div>
          </div>

          {/* Problem Title */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {currentItem.problemTitle}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {currentItem.topics.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Prompt card */}
          <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                Active Recall Prompt
              </span>
              {currentItem.url && (
                <a
                  href={currentItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-xs font-bold text-sky-600 hover:underline"
                >
                  Solve on Platform <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            <p className="text-slate-700 text-sm leading-relaxed font-medium">
              Without opening your previous code, mentally outline the algorithm or write down the optimal time and space complexity.
            </p>
          </div>

          {/* Toggle Solution drawer */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowSolution((s) => !s)}
              className="flex items-center gap-2 text-xs font-extrabold text-slate-600 hover:text-sky-600 cursor-pointer bg-slate-100 px-4 py-2 rounded-xl transition-colors"
            >
              {showSolution ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showSolution ? "Hide Previous Solution" : "View Previous Solution"}
            </button>

            {showSolution && (
              <div className="p-4 bg-slate-900 rounded-2xl text-slate-100 text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">
                <pre>{currentItem.previousSolutionSnippet || "// No code snippet stored."}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => handleNext("forgotten")}
            className="w-full sm:flex-1 py-3.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-sm font-extrabold rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Mark Forgotten (Reset)
          </button>
          <button
            type="button"
            onClick={() => handleNext("remembered")}
            className="w-full sm:flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark Remembered (+Interval)
          </button>
        </div>
      </div>
    </div>
  );
}
