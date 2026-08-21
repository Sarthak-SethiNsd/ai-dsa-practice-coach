"use client";

import {
  Trophy,
  CheckCircle2,
  X,
  Clock,
  HelpCircle,
  ShieldAlert,
  Gauge,
  Compass,
  ArrowRight,
} from "lucide-react";
import { AIInterviewReport } from "@/services/interview/interviewTypes";
import { PostInterviewCoachAdvice } from "@/services/interview/interviewEngine";
import { AIInterviewCoach } from "./AIInterviewCoach";

interface InterviewSummaryModalProps {
  report: AIInterviewReport;
  coachAdvice?: PostInterviewCoachAdvice | null;
  onClose: () => void;
}

const TIER_BADGES: Record<string, { bg: string; text: string; border: string }> = {
  Advanced: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  Strong: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "Interview Ready": { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  Developing: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  Beginner: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" },
};

export function InterviewSummaryModal({
  report,
  coachAdvice,
  onClose,
}: InterviewSummaryModalProps) {
  const tierStyle = TIER_BADGES[report.readinessTier] || TIER_BADGES.Developing;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-br from-sky-600 to-sky-700 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl font-bold">
              {report.overallScore}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-sky-200">
                  Mock Interview Evaluation
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-sky-800">
                  {report.readinessTier}
                </span>
              </div>
              <h2 className="text-xl font-bold">{report.readinessBandLabel}</h2>
              <p className="text-xs text-sky-100 mt-0.5">{report.date}</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 10 Dimension Score Grid */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Evaluation Dimensions (10 Dimensions)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.entries(report.dimensions).map(([key, dim]) => (
                <div
                  key={key}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{dim.name}</span>
                    <span
                      className={`font-bold font-mono px-2 py-0.5 rounded ${
                        dim.score >= 80
                          ? "bg-emerald-100 text-emerald-800"
                          : dim.score >= 65
                          ? "bg-sky-100 text-sky-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {dim.score}/100
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        dim.score >= 80
                          ? "bg-emerald-500"
                          : dim.score >= 65
                          ? "bg-sky-500"
                          : "bg-amber-500"
                      }`}
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 pt-0.5">
                    {dim.evidence}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Demonstrated Strengths
              </div>
              <ul className="space-y-1.5 text-xs text-emerald-900 list-disc list-inside">
                {report.mainStrengths.map((str, idx) => (
                  <li key={idx}>{str}</li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wide">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Growth & Weakness Areas
              </div>
              <ul className="space-y-1.5 text-xs text-amber-900 list-disc list-inside">
                {report.mainWeaknesses.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Complexity & Hint Assessment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <Gauge className="w-4 h-4 text-sky-600" />
                Complexity Evaluation
              </div>
              <p className="text-xs text-slate-600">
                Stated: Time <span className="font-mono font-semibold">{report.complexityAssessment.statedTime}</span>, Space <span className="font-mono font-semibold">{report.complexityAssessment.statedSpace}</span>
              </p>
              <p className="text-xs text-slate-600">
                Optimal: Time <span className="font-mono font-semibold">{report.complexityAssessment.actualTime}</span>, Space <span className="font-mono font-semibold">{report.complexityAssessment.actualSpace}</span>
              </p>
              <p className="text-[11px] text-slate-500 pt-1">
                {report.complexityAssessment.feedback}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <HelpCircle className="w-4 h-4 text-amber-600" />
                Hint & Time Metrics
              </div>
              <p className="text-xs text-slate-600">
                Hints Used: <span className="font-semibold">{report.hintUsageSummary.totalHints}</span> (Total Penalty: <span className="font-semibold text-amber-700">-{report.hintUsageSummary.totalPenaltyPoints} pts</span>)
              </p>
              <p className="text-xs text-slate-600">
                Time Spent: <span className="font-semibold">{report.timeManagementSummary.actualMinutesSpent}m</span> / {report.timeManagementSummary.allocatedMinutes}m ({report.timeManagementSummary.paceEvaluation})
              </p>
            </div>
          </div>

          {/* AI Interview Coach Directive */}
          {coachAdvice && <AIInterviewCoach advice={coachAdvice} />}

          {/* Actionable Next Steps */}
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-800 uppercase tracking-wide">
              <Compass className="w-4 h-4 text-sky-600" />
              Recommended Follow-up Actions
            </div>
            <ul className="space-y-1 text-xs text-sky-900 list-disc list-inside">
              {report.actionableNextSteps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-sky-600 text-white font-semibold text-xs hover:bg-sky-700 transition-colors shadow-sm"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
