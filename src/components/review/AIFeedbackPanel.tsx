"use client";

import * as React from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Zap,
  ShieldCheck,
  Layers,
  BookOpen,
  FileCode,
} from "lucide-react";
import { AiReviewResponse, ReviewCategory } from "@/services/ai/aiTypes";

interface AIFeedbackPanelProps {
  reviewResult: AiReviewResponse | null;
  selectedCategory: ReviewCategory | null;
  onSelectCategory: (category: ReviewCategory) => void;
  isLoading: boolean;
}

interface CategoryMeta {
  key: ReviewCategory;
  title: string;
  shortDesc: string;
  icon: React.ElementType;
  color: string;
}

const REVIEW_CATEGORIES: CategoryMeta[] = [
  { key: "FULL_CODE_REVIEW", title: "Full Code Review", shortDesc: "Comprehensive evaluation of quality & logic", icon: Sparkles, color: "violet" },
  { key: "OPTIMAL_COMPLEXITY", title: "Optimal Complexity", shortDesc: "Theoretical minimum time & space bounds", icon: Zap, color: "sky" },
  { key: "CORRECTNESS_CHECK", title: "Correctness Check", shortDesc: "Bug audit, off-by-one errors & correctness verdict", icon: ShieldCheck, color: "purple" },
  { key: "MY_COMPLEXITY", title: "My Complexity", shortDesc: "Exact time & space complexity of submitted code", icon: Layers, color: "indigo" },
  { key: "EDGE_CASE_ANALYSIS", title: "Edge Case Analysis", shortDesc: "Boundary inputs, overflow & extreme constraints", icon: AlertTriangle, color: "rose" },
  { key: "OPTIMAL_FULL_SOLUTION", title: "Optimal Reference Solution", shortDesc: "Complete reference optimal code & implementation", icon: FileCode, color: "emerald" },
  { key: "OPTIMAL_HINTS", title: "Optimal Hints", shortDesc: "Step-by-step guidance to reach optimal solution", icon: Lightbulb, color: "amber" },
  { key: "MY_HINTS", title: "Refinement Hints", shortDesc: "Targeted hints to fix and refine your current code", icon: BookOpen, color: "blue" },
];

export function AIFeedbackPanel({
  reviewResult,
  selectedCategory,
  onSelectCategory,
  isLoading,
}: AIFeedbackPanelProps) {
  return (
    <div className="ai-feedback-panel space-y-6">
      {/* Category selector chips */}
      <div className="border border-slate-200/80 bg-white/80 backdrop-blur-md rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span>Select AI Review Category</span>
          </h3>
          <span className="text-xs text-slate-500">Choose a focus area</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {REVIEW_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.key;

            return (
              <button
                key={cat.key}
                onClick={() => onSelectCategory(cat.key)}
                className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-violet-50 border-violet-300 text-violet-900 shadow-sm"
                    : "bg-white border-slate-200/80 hover:border-violet-200 text-slate-700 hover:bg-slate-50/60"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${isSelected ? "text-violet-600" : "text-slate-400"}`} />
                  <span className="text-xs font-bold truncate">{cat.title}</span>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-2 leading-snug">{cat.shortDesc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Feedback Content */}
      {isLoading ? (
        <div className="p-12 border border-slate-200/80 bg-white/80 rounded-2xl text-center space-y-3">
          <Sparkles className="w-8 h-8 text-violet-500 animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-800">Analyzing Your Solution...</p>
          <p className="text-xs text-slate-500">Checking time/space complexity, correctness, and edge cases.</p>
        </div>
      ) : reviewResult ? (
        <div className="border border-slate-200/80 bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-sm space-y-5">
          {/* Header Summary */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-violet-50/70 border border-violet-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-violet-700">
                {reviewResult.categoryTitle || "AI Feedback Summary"}
              </span>
              <p className="text-sm text-slate-800 mt-1 font-medium leading-relaxed">
                {reviewResult.overallFeedback}
              </p>
            </div>
          </div>

          {/* Correctness Analysis */}
          {reviewResult.correctnessAnalysis && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Correctness & Logic Verdict</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                {reviewResult.correctnessAnalysis}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 border border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/40">
          <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">No AI Review Generated Yet</p>
          <p className="text-xs text-slate-500 mt-1">
            Submit your solution code above to receive instant complexity analysis, optimization hints, and feedback.
          </p>
        </div>
      )}
    </div>
  );
}
