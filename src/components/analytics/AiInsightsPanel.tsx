"use client";

import * as React from "react";
import { AiLearningInsight } from "@/services/analytics/performanceAnalyticsTypes";
import { Sparkles, AlertTriangle, CheckCircle2, Lightbulb, AlertCircle } from "lucide-react";

interface AiInsightsPanelProps {
  insights: AiLearningInsight[];
}

export function AiInsightsPanel({ insights }: AiInsightsPanelProps) {
  const getSeverityStyle = (severity: AiLearningInsight["severity"]) => {
    switch (severity) {
      case "high":
        return { bg: "bg-rose-50/70", border: "border-rose-200", icon: AlertTriangle, iconColor: "text-rose-600", tag: "bg-rose-100 text-rose-800" };
      case "medium":
        return { bg: "bg-amber-50/70", border: "border-amber-200", icon: AlertCircle, iconColor: "text-amber-600", tag: "bg-amber-100 text-amber-800" };
      case "positive":
        return { bg: "bg-emerald-50/70", border: "border-emerald-200", icon: CheckCircle2, iconColor: "text-emerald-600", tag: "bg-emerald-100 text-emerald-800" };
      default:
        return { bg: "bg-sky-50/70", border: "border-sky-200", icon: Lightbulb, iconColor: "text-sky-600", tag: "bg-sky-100 text-sky-800" };
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" /> AI Learning Insights & Diagnostic Observations
        </h3>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          AI-generated observations derived from review history analysis, complexity patterns, edge cases, and topic coverage.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((item) => {
          const style = getSeverityStyle(item.severity);
          const Icon = style.icon;
          return (
            <div
              key={item.id}
              className={`${style.bg} ${style.border} border rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 shrink-0 ${style.iconColor}`} />
                    <h4 className="text-sm font-extrabold text-slate-900">{item.title}</h4>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${style.tag}`}>
                    {item.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {item.description}
                </p>

                {item.affectedTopics && item.affectedTopics.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] font-bold text-slate-400">Topics:</span>
                    {item.affectedTopics.map((t) => (
                      <span key={t} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Recommendation */}
              <div className="bg-white/80 border border-slate-200/80 rounded-xl p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Action Recommendation
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {item.actionRecommendation}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
