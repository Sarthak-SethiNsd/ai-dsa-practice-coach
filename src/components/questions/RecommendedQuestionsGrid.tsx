"use client";

import * as React from "react";
import {
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Filter,
  Code2,
  Flame,
  Shield,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  QuestionRecommendation,
  QuestionRecommendationFilter,
  QuestionCategory,
} from "@/services/questionRecommendationTypes";
import { Platform, Difficulty } from "@/services/types";

interface RecommendedQuestionsGridProps {
  questions: QuestionRecommendation[];
  filters: QuestionRecommendationFilter;
  setFilters: React.Dispatch<React.SetStateAction<QuestionRecommendationFilter>>;
  onMarkSolved: (id: string) => Promise<void>;
  onMarkSkipped: (id: string) => Promise<void>;
  onMarkViewed: (id: string) => Promise<void>;
}

export function RecommendedQuestionsGrid({
  questions,
  filters,
  setFilters,
  onMarkSolved,
  onMarkSkipped,
  onMarkViewed,
}: RecommendedQuestionsGridProps) {
  return (
    <section className="questions-grid space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white/80 border border-slate-200/80 backdrop-blur-md">
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
          <Filter className="w-4 h-4 text-violet-500" />
          <span>Filter Questions</span>
          <span className="text-xs text-slate-400 font-normal">({questions.length} matching)</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters((p) => ({ ...p, category: e.target.value as QuestionCategory | "All" }))
            }
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          >
            <option value="All">All Categories</option>
            <option value="Top Recommendation">Top Recommendations</option>
            <option value="Stretch Challenge">Stretch Challenges</option>
            <option value="Confidence Builder">Confidence Builders</option>
            <option value="Interview Preparation">Interview Prep</option>
          </select>

          {/* Platform Filter */}
          <select
            value={filters.platform}
            onChange={(e) => setFilters((p) => ({ ...p, platform: e.target.value as Platform | "All" }))}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          >
            <option value="All">All Platforms</option>
            <option value="leetcode">LeetCode</option>
            <option value="codeforces">Codeforces</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={filters.difficulty}
            onChange={(e) =>
              setFilters((p) => ({ ...p, difficulty: e.target.value as Difficulty | "All" }))
            }
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value as any }))}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Solved">Solved</option>
            <option value="Skipped">Skipped</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {questions.length === 0 ? (
        <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/50">
          <Code2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No questions match your filters</p>
          <p className="text-xs text-slate-500 mt-1">Try broadening your filter criteria above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              onMarkSolved={onMarkSolved}
              onMarkSkipped={onMarkSkipped}
              onMarkViewed={onMarkViewed}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Question Card ────────────────────────────────────────────────────────────

interface QuestionCardProps {
  question: QuestionRecommendation;
  onMarkSolved: (id: string) => Promise<void>;
  onMarkSkipped: (id: string) => Promise<void>;
  onMarkViewed: (id: string) => Promise<void>;
}

export function QuestionCard({
  question: q,
  onMarkSolved,
  onMarkSkipped,
  onMarkViewed,
}: QuestionCardProps) {
  const [loading, setLoading] = React.useState(false);

  const handleSolved = async () => {
    setLoading(true);
    try {
      await onMarkSolved(q.id);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipped = async () => {
    setLoading(true);
    try {
      await onMarkSkipped(q.id);
    } finally {
      setLoading(false);
    }
  };

  const isSolved = q.status === "Solved";
  const isSkipped = q.status === "Skipped";

  const categoryIcon =
    q.category === "Stretch Challenge" ? (
      <Flame className="w-3.5 h-3.5 text-orange-500" />
    ) : q.category === "Confidence Builder" ? (
      <Shield className="w-3.5 h-3.5 text-emerald-500" />
    ) : q.category === "Interview Preparation" ? (
      <BookOpen className="w-3.5 h-3.5 text-sky-500" />
    ) : (
      <Sparkles className="w-3.5 h-3.5 text-violet-500" />
    );

  const diffBadge =
    q.difficulty === "Easy"
      ? "bg-emerald-100 text-emerald-700"
      : q.difficulty === "Medium"
      ? "bg-amber-100 text-amber-700"
      : "bg-red-100 text-red-700";

  const priorityDot =
    q.priority === "High" ? "bg-red-500" : q.priority === "Medium" ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div
      className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
        isSolved
          ? "bg-emerald-50/40 border-emerald-200/70"
          : isSkipped
          ? "bg-slate-50/60 border-slate-200/60 opacity-70"
          : "bg-white border-slate-200/90 hover:border-violet-300 hover:shadow-md"
      }`}
    >
      <div>
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="capitalize text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {q.platform}
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${diffBadge}`}>
              {q.difficulty}
            </span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
              {q.topic}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${priorityDot}`} title={`${q.priority} priority`} />
            <span className="text-[11px] font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full border border-violet-100">
              {q.confidenceScore}% Match
            </span>
          </div>
        </div>

        {/* Category Header */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1.5">
          {categoryIcon}
          <span>{q.category}</span>
        </div>

        {/* Problem Title */}
        <h3
          className={`text-base font-bold mb-2 ${
            isSolved ? "line-through text-slate-500" : "text-slate-900"
          }`}
        >
          {q.title}
        </h3>

        {/* Reason Quote */}
        <p className="text-xs text-slate-600 italic bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 mb-4">
          "{q.recommendationReason}"
        </p>
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          <span>{q.estimatedTime}</span>
        </div>

        <div className="flex items-center gap-2">
          {isSolved ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
              <CheckCircle2 className="w-4 h-4" /> Solved
            </span>
          ) : isSkipped ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
              <XCircle className="w-4 h-4" /> Skipped
            </span>
          ) : (
            <>
              <button
                onClick={handleSkipped}
                disabled={loading}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                title="Skip problem"
              >
                <XCircle className="w-4 h-4" />
              </button>

              <button
                onClick={handleSolved}
                disabled={loading}
                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                title="Mark as Solved"
              >
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </>
          )}

          <a
            href={q.problemUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onMarkViewed(q.id)}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-colors shadow-xs"
          >
            <span>Solve</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
