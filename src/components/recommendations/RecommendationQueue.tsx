"use client";

import {
  AdaptiveProblemRecommendation,
  RecommendationPriority,
  RecommendationFeedbackAction,
} from "@/services/recommendations/recommendationTypes";
import { RecommendationCard } from "./RecommendationCard";
import { Zap, AlertTriangle, ShieldCheck, Flame, Layers } from "lucide-react";

interface RecommendationQueueProps {
  priorityGroups: Record<RecommendationPriority, AdaptiveProblemRecommendation[]>;
  topRecommendation: AdaptiveProblemRecommendation | null;
  onFeedback: (rec: AdaptiveProblemRecommendation, action: RecommendationFeedbackAction) => void;
  onWhyClick: (rec: AdaptiveProblemRecommendation) => void;
}

const PRIORITY_HEADINGS: Record<
  RecommendationPriority,
  { label: string; countColor: string; icon: typeof Zap; desc: string }
> = {
  CRITICAL: {
    label: "Critical Priority (Immediate Foundation/Goal Gap)",
    countColor: "bg-rose-500 text-white",
    icon: AlertTriangle,
    desc: "Composite score ≥ 85. Severe prerequisite blockages or urgent goal milestones.",
  },
  HIGH: {
    label: "High Priority (High-Leverage Targeted Drills)",
    countColor: "bg-amber-500 text-white",
    icon: Flame,
    desc: "Composite score 70–84. Strong alignment with weak skills and mistake clusters.",
  },
  MEDIUM: {
    label: "Medium Priority (Balanced Skill Expansion)",
    countColor: "bg-sky-500 text-white",
    icon: Zap,
    desc: "Composite score 50–69. Steady progress across active and developing topics.",
  },
  LOW: {
    label: "Low Priority (Exploratory / Revision Backlog)",
    countColor: "bg-slate-500 text-white",
    icon: Layers,
    desc: "Composite score < 50. Secondary practice and background revision candidates.",
  },
};

export function RecommendationQueue({
  priorityGroups,
  topRecommendation,
  onFeedback,
  onWhyClick,
}: RecommendationQueueProps) {
  const totalCount =
    priorityGroups.CRITICAL.length +
    priorityGroups.HIGH.length +
    priorityGroups.MEDIUM.length +
    priorityGroups.LOW.length;

  if (totalCount === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
        <ShieldCheck className="w-12 h-12 mx-auto text-emerald-500" />
        <h3 className="text-base font-bold text-slate-800">
          No Problems Match Current Filters
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Try resetting the platform, difficulty, topic, or time budget filters above to see fresh adaptive recommendations.
        </p>
      </div>
    );
  }

  const priorities: RecommendationPriority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

  return (
    <div className="space-y-8">
      {/* Featured #1 Recommendation Banner */}
      {topRecommendation && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-sky-500 text-white font-mono flex items-center gap-1.5 shadow-xs">
              <Zap className="w-3.5 h-3.5" />
              #1 Top Recommended Problem Right Now
            </span>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Highest composite score across all evidence dimensions
            </span>
          </div>

          <RecommendationCard
            rec={topRecommendation}
            isFeatured={true}
            onFeedback={onFeedback}
            onWhyClick={onWhyClick}
          />
        </div>
      )}

      {/* Priority Groups */}
      {priorities.map((priority) => {
        const group = priorityGroups[priority];
        if (group.length === 0) return null;

        const heading = PRIORITY_HEADINGS[priority];
        const Icon = heading.icon;

        return (
          <div key={priority} className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>{heading.label}</span>
                    <span
                      className={`text-[10px] font-extrabold font-mono px-2 py-0.5 rounded-full ${heading.countColor}`}
                    >
                      {group.length}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 hidden sm:block">
                    {heading.desc}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  rec={rec}
                  isFeatured={false}
                  onFeedback={onFeedback}
                  onWhyClick={onWhyClick}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
