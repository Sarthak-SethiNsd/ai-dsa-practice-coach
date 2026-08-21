"use client";

import {
  BarChart2,
  TrendingUp,
  Award,
  Clock,
  HelpCircle,
  MessageSquare,
  Gauge,
  CheckCircle2,
  Layers,
} from "lucide-react";
import {
  InterviewAnalyticsSummary,
} from "@/services/interview/interviewTypes";
import { AnalyticsTimeframe } from "@/services/interview/interviewAnalytics";

interface InterviewAnalyticsProps {
  analytics: InterviewAnalyticsSummary;
  timeframe: AnalyticsTimeframe;
  onTimeframeChange: (tf: AnalyticsTimeframe) => void;
}

const TIMEFRAMES: { id: AnalyticsTimeframe; label: string }[] = [
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "90d", label: "90 Days" },
  { id: "all", label: "All Time" },
];

export function InterviewAnalytics({
  analytics,
  timeframe,
  onTimeframeChange,
}: InterviewAnalyticsProps) {
  return (
    <div className="space-y-5">
      {/* Timeframe Filter & Summary Stats */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-sky-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">Interview Analytics</h3>
              <p className="text-xs text-slate-400">Technical performance metrics</p>
            </div>
          </div>

          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.id}
                onClick={() => onTimeframeChange(tf.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  timeframe === tf.id
                    ? "bg-white text-sky-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-center">
            <span className="text-[11px] text-slate-500 font-medium">Average Score</span>
            <p className="text-2xl font-bold font-mono text-slate-800 mt-0.5">{analytics.avgScore}</p>
            <span className="text-[10px] text-sky-600 font-semibold">{analytics.currentReadinessTier}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-center">
            <span className="text-[11px] text-slate-500 font-medium">Completed Sessions</span>
            <p className="text-2xl font-bold font-mono text-slate-800 mt-0.5">{analytics.completedInterviews}</p>
            <span className="text-[10px] text-slate-400 font-medium">{analytics.totalMinutesPracticed}m total</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-center">
            <span className="text-[11px] text-slate-500 font-medium">Avg Hints / Session</span>
            <p className="text-2xl font-bold font-mono text-amber-700 mt-0.5">{analytics.avgHintCountPerInterview}</p>
            <span className="text-[10px] text-slate-400 font-medium">Target &lt; 1.0</span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-center">
            <span className="text-[11px] text-slate-500 font-medium">Peak Score</span>
            <p className="text-2xl font-bold font-mono text-emerald-700 mt-0.5">{analytics.highestScore}</p>
            <span className="text-[10px] text-emerald-600 font-medium">Best session</span>
          </div>
        </div>
      </div>

      {/* Topic Readiness & Difficulty Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Topic Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-sky-600" />
            Topic Interview Performance
          </h4>

          {analytics.topicPerformance.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No topic data available for this timeframe.</p>
          ) : (
            <div className="space-y-2">
              {analytics.topicPerformance.map((tp) => (
                <div
                  key={tp.topic}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{tp.topic}</p>
                    <p className="text-[10px] text-slate-400">{tp.interviewCount} session(s)</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold font-mono text-slate-700">{tp.avgScore}%</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        tp.readinessStatus === "Strong"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : tp.readinessStatus === "Developing"
                          ? "bg-sky-50 text-sky-700 border-sky-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {tp.readinessStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Strengths & Weaknesses */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
            Top Strengths & Weakness Areas
          </h4>

          <div className="space-y-3">
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 space-y-1.5">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                Consistently Strong
              </span>
              <ul className="text-xs text-emerald-900 space-y-1 list-disc list-inside">
                {analytics.strongestAreas.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 space-y-1.5">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                High Leverage Weaknesses
              </span>
              <ul className="text-xs text-amber-900 space-y-1 list-disc list-inside">
                {analytics.weakestAreas.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
