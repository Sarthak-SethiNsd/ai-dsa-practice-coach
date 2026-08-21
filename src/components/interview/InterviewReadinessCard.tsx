"use client";

import { Award, Compass, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { InterviewReadinessProfile } from "@/services/interview/interviewTypes";

interface InterviewReadinessCardProps {
  profile: InterviewReadinessProfile;
  onStartInterview: () => void;
}

const TIER_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  Advanced: { bg: "bg-purple-600", text: "text-purple-700", ring: "ring-purple-200" },
  Strong: { bg: "bg-emerald-600", text: "text-emerald-700", ring: "ring-emerald-200" },
  "Interview Ready": { bg: "bg-sky-600", text: "text-sky-700", ring: "ring-sky-200" },
  Developing: { bg: "bg-amber-600", text: "text-amber-700", ring: "ring-amber-200" },
  Beginner: { bg: "bg-slate-600", text: "text-slate-700", ring: "ring-slate-200" },
};

export function InterviewReadinessCard({
  profile,
  onStartInterview,
}: InterviewReadinessCardProps) {
  const tierStyle = TIER_COLORS[profile.tier] || TIER_COLORS.Developing;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        {/* Left: Overall Readiness */}
        <div className="space-y-2 max-w-md">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
              Current Interview Readiness
            </span>
            <span className="text-xs text-slate-400">
              {profile.interviewsCount} interview{profile.interviewsCount !== 1 ? "s" : ""} completed
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {profile.tier}
            </h2>
            <span className="text-xl font-mono font-bold text-sky-400">
              {profile.overallScore}/100
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {profile.tierDescription}
          </p>
        </div>

        {/* Right: CTA Button */}
        <button
          onClick={onStartInterview}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all shadow-lg hover:shadow-sky-500/25 shrink-0"
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Launch Mock Interview</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 6 Key Competency Dimension Bars */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-700/60">
        <div className="space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Problem Solving</span>
          <p className="text-sm font-bold text-slate-100">{profile.dimensionsSummary.problemSolving}%</p>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-sky-400 rounded-full" style={{ width: `${profile.dimensionsSummary.problemSolving}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Communication</span>
          <p className="text-sm font-bold text-slate-100">{profile.dimensionsSummary.communication}%</p>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${profile.dimensionsSummary.communication}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Complexity</span>
          <p className="text-sm font-bold text-slate-100">{profile.dimensionsSummary.complexityAnalysis}%</p>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-purple-400 rounded-full" style={{ width: `${profile.dimensionsSummary.complexityAnalysis}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Edge Cases</span>
          <p className="text-sm font-bold text-slate-100">{profile.dimensionsSummary.edgeCaseDetection}%</p>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${profile.dimensionsSummary.edgeCaseDetection}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Clean Code</span>
          <p className="text-sm font-bold text-slate-100">{profile.dimensionsSummary.cleanCoding}%</p>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-teal-400 rounded-full" style={{ width: `${profile.dimensionsSummary.cleanCoding}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] text-slate-400 font-medium">Independence</span>
          <p className="text-sm font-bold text-slate-100">{profile.dimensionsSummary.independence}%</p>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${profile.dimensionsSummary.independence}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
