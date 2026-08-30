import {
  AdaptiveProblemRecommendation,
  RecommendationFeedbackAction,
} from "@/services/recommendations/recommendationTypes";
import {
  ExternalLink,
  HelpCircle,
  Check,
  SkipForward,
  X,
  BookOpen,
  Clock,
  Zap,
  AlertTriangle,
} from "lucide-react";

interface RecommendationCardProps {
  rec: AdaptiveProblemRecommendation;
  isFeatured?: boolean;
  onFeedback: (rec: AdaptiveProblemRecommendation, action: RecommendationFeedbackAction) => void;
  onWhyClick: (rec: AdaptiveProblemRecommendation) => void;
}

const PRIORITY_CONFIG = {
  CRITICAL: { bg: "bg-rose-100", text: "text-rose-800", border: "border-rose-300", badge: "CRITICAL" },
  HIGH:     { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300", badge: "HIGH" },
  MEDIUM:   { bg: "bg-sky-100", text: "text-sky-800", border: "border-sky-300", badge: "MEDIUM" },
  LOW:      { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300", badge: "LOW" },
};

const DIFFICULTY_CONFIG = {
  Easy:   { bg: "bg-emerald-100", text: "text-emerald-800" },
  Medium: { bg: "bg-amber-100",   text: "text-amber-800"   },
  Hard:   { bg: "bg-rose-100",    text: "text-rose-800"    },
};

const PLATFORM_LABELS = { leetcode: "LeetCode", codeforces: "Codeforces" };

export function RecommendationCard({
  rec,
  isFeatured = false,
  onFeedback,
  onWhyClick,
}: RecommendationCardProps) {
  const priority = PRIORITY_CONFIG[rec.priority];
  const diff = DIFFICULTY_CONFIG[rec.difficulty];

  return (
    <div
      className={`rounded-3xl border transition-all flex flex-col ${
        isFeatured
          ? "bg-slate-900 text-white border-slate-800 shadow-xl ring-2 ring-sky-500/30"
          : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
      }`}
    >
      {/* Card Header */}
      <div className="p-4 sm:p-5 border-b border-white/10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${priority.bg} ${priority.text} ${priority.border}`}>
              {priority.badge}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${diff.bg} ${diff.text}`}>
              {rec.difficulty}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isFeatured ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
              {PLATFORM_LABELS[rec.platform]}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-mono font-bold ${isFeatured ? "text-sky-400" : "text-sky-600"}`}>
              Score: {rec.recommendationScore}
            </span>
            <div className={`w-px h-3 ${isFeatured ? "bg-slate-600" : "bg-slate-300"}`} />
            <span className={`text-[10px] ${isFeatured ? "text-slate-400" : "text-slate-500"}`}>
              <Clock className="w-3 h-3 inline mr-0.5" />{rec.estimatedEffortMinutes}m
            </span>
          </div>
        </div>

        <div>
          <h3 className={`text-sm sm:text-base font-bold ${isFeatured ? "text-white" : "text-slate-900"}`}>
            {rec.title}
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {rec.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${isFeatured ? "bg-white/10 text-slate-300" : "bg-slate-100 text-slate-600"}`}
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        {/* Category & Pattern */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className={`font-bold px-2 py-0.5 rounded-md ${isFeatured ? "bg-sky-500/20 text-sky-300 border border-sky-500/30" : "bg-sky-50 text-sky-700 border border-sky-200"}`}>
            {rec.categoryLabel}
          </span>
          <span className={isFeatured ? "text-slate-400" : "text-slate-500"}>
            Pattern: <span className="font-semibold">{rec.primaryPattern}</span>
          </span>
        </div>
      </div>

      {/* Reason & Evidence */}
      <div className="px-4 sm:px-5 py-3 space-y-2">
        <p className={`text-xs leading-relaxed ${isFeatured ? "text-slate-300" : "text-slate-600"}`}>
          {rec.reason}
        </p>

        {/* Evidence mini-chips */}
        <div className="flex flex-wrap gap-1.5">
          {rec.evidence.targetSkillMasteryScore < 70 && (
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium flex items-center gap-1 ${isFeatured ? "bg-amber-900/40 text-amber-300" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
              <Zap className="w-3 h-3" />
              Skill: {rec.evidence.targetSkillMasteryScore}%
            </span>
          )}
          {rec.evidence.relatedMistakeNotesCount > 0 && (
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium flex items-center gap-1 ${isFeatured ? "bg-rose-900/40 text-rose-300" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
              <AlertTriangle className="w-3 h-3" />
              {rec.evidence.relatedMistakeNotesCount} mistake notes
            </span>
          )}
          {rec.evidence.srsOverdueCount > 0 && (
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${isFeatured ? "bg-purple-900/40 text-purple-300" : "bg-purple-50 text-purple-700 border border-purple-200"}`}>
              SRS Overdue
            </span>
          )}
          {rec.evidence.isPrerequisiteRepair && (
            <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${isFeatured ? "bg-sky-900/40 text-sky-300" : "bg-sky-50 text-sky-700 border border-sky-200"}`}>
              Prereq repair
            </span>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className={`px-4 sm:px-5 py-3 border-t flex flex-wrap items-center justify-between gap-2 ${isFeatured ? "border-white/10" : "border-slate-100"}`}>
        <div className="flex items-center gap-2">
          <a
            href={rec.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onFeedback(rec, "accepted")}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isFeatured
                ? "bg-sky-500 hover:bg-sky-400 text-white"
                : "bg-slate-900 hover:bg-slate-800 text-white"
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Solve Now</span>
          </a>

          <button
            onClick={() => onWhyClick(rec)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isFeatured
                ? "bg-white/10 hover:bg-white/20 text-slate-300"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Why?</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onFeedback(rec, "added_to_revision")}
            title="Add to SRS revision"
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${isFeatured ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
          >
            <BookOpen className="w-4 h-4" />
          </button>
          <button
            onClick={() => onFeedback(rec, "solved")}
            title="Mark as solved"
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${isFeatured ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => onFeedback(rec, "skipped")}
            title="Skip"
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${isFeatured ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
          >
            <SkipForward className="w-4 h-4" />
          </button>
          <button
            onClick={() => onFeedback(rec, "dismissed")}
            title="Dismiss this problem"
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${isFeatured ? "hover:bg-white/10 text-slate-400" : "hover:bg-slate-100 text-slate-500"}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
