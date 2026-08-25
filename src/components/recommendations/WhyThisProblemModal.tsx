"use client";

import {
  AdaptiveProblemRecommendation,
  AIRecommendationCoachAdvice,
} from "@/services/recommendations/recommendationTypes";
import {
  X,
  Sparkles,
  ExternalLink,
  Target,
  Brain,
  RotateCcw,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Clock,
  ShieldCheck,
} from "lucide-react";

interface WhyThisProblemModalProps {
  rec: AdaptiveProblemRecommendation | null;
  coachAdvice: AIRecommendationCoachAdvice | null;
  isLoadingCoach: boolean;
  onClose: () => void;
  onSolve: (rec: AdaptiveProblemRecommendation) => void;
}

export function WhyThisProblemModal({
  rec,
  coachAdvice,
  isLoadingCoach,
  onClose,
  onSolve,
}: WhyThisProblemModalProps) {
  if (!rec) return null;

  const { scoreBreakdown, evidence } = rec;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-500 text-white font-mono">
                {rec.categoryLabel}
              </span>
              <span className="text-xs font-mono font-bold text-slate-400">
                {rec.platform.toUpperCase()} • {rec.difficulty}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white mt-1.5">
              {rec.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Executive Summary Card */}
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 font-mono">
              Primary Selection Reason
            </span>
            <p className="text-xs font-medium leading-relaxed">
              {rec.fullExplanation}
            </p>
          </div>

          {/* Evidence Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Skill Mastery
              </span>
              <div className="text-lg font-extrabold font-mono text-slate-900">
                {evidence.targetSkillMasteryScore}%
              </div>
              <span className="text-[10px] text-slate-500 capitalize">
                {evidence.targetSkillStatus.toLowerCase()}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Mistake Notes
              </span>
              <div className="text-lg font-extrabold font-mono text-slate-900">
                {evidence.relatedMistakeNotesCount}
              </div>
              <span className="text-[10px] text-slate-500">Knowledge Base</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Memory Health
              </span>
              <div className="text-lg font-extrabold font-mono text-slate-900">
                {evidence.srsAverageMemoryStrength}%
              </div>
              <span className="text-[10px] text-slate-500">
                {evidence.srsOverdueCount > 0 ? "⚠️ Overdue" : "SRS Retention"}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Graph Reach
              </span>
              <div className="text-lg font-extrabold font-mono text-slate-900">
                {evidence.dependencyReach}
              </div>
              <span className="text-[10px] text-slate-500">Unlocks Downstream</span>
            </div>
          </div>

          {/* Multi-Factor Score Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Deterministic Score Breakdown (0–100)
              </span>
              <span className="text-xs font-mono font-extrabold text-sky-600">
                Total: {scoreBreakdown.finalScore} pts
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
              <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500">Skill Gap:</span>
                <span className="font-bold text-slate-800">+{scoreBreakdown.skillGapScore}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500">Graph Reach:</span>
                <span className="font-bold text-slate-800">+{scoreBreakdown.dependencyValueScore}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500">Goal Align:</span>
                <span className="font-bold text-slate-800">+{scoreBreakdown.goalRelevanceScore}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500">Mistakes:</span>
                <span className="font-bold text-slate-800">+{scoreBreakdown.mistakeRelevanceScore}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500">SRS Urgency:</span>
                <span className="font-bold text-slate-800">+{scoreBreakdown.revisionUrgencyScore}</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200">
                <span className="text-slate-500">Difficulty Fit:</span>
                <span className="font-bold text-slate-800">+{scoreBreakdown.difficultyFitScore}</span>
              </div>
            </div>
          </div>

          {/* AI Coach Strategic Explanation */}
          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
            <div className="flex items-center gap-2 text-purple-900 font-bold">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>AI Recommendation Coach Assessment</span>
            </div>

            {isLoadingCoach ? (
              <p className="text-xs text-purple-700 italic">
                Synthesizing multi-subsystem coaching advice...
              </p>
            ) : coachAdvice ? (
              <div className="space-y-2 text-xs text-purple-950 leading-relaxed font-sans">
                <p>
                  <strong>Why Now: </strong>
                  {coachAdvice.whyBetterThanAlternative}
                </p>
                <p>
                  <strong>Progression Next: </strong>
                  {coachAdvice.whatToSolveAfter.explanation}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-500">
            Estimated time: {rec.estimatedEffortMinutes} minutes
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              Close
            </button>

            <a
              href={rec.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onSolve(rec)}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xs"
            >
              <span>Solve Problem Now</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
