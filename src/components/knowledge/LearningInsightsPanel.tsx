"use client";

import * as React from "react";
import { AiKnowledgeInsight } from "@/services/knowledge/knowledgeTypes";
import { Button } from "@/components/ui/Button";
import {
  Brain,
  AlertTriangle,
  CheckCircle2,
  Info,
  TrendingUp,
  RotateCcw,
  Lightbulb,
  ExternalLink,
} from "lucide-react";

interface LearningInsightsPanelProps {
  insights: AiKnowledgeInsight[];
  loading?: boolean;
}

const INSIGHT_ICON_MAP: Record<string, React.ElementType> = {
  repeated_mistake: AlertTriangle,
  pattern_uncertainty: RotateCcw,
  concept_gap: AlertTriangle,
  improving_pattern: TrendingUp,
  frequently_revisited: RotateCcw,
  mastery_achieved: CheckCircle2,
};

const SEVERITY_STYLES: Record<string, string> = {
  warning: "bg-amber-50 border-amber-200",
  error: "bg-red-50 border-red-200",
  success: "bg-emerald-50 border-emerald-200",
  info: "bg-sky-50 border-sky-200",
};

const SEVERITY_ICON_COLORS: Record<string, string> = {
  warning: "text-amber-600",
  error: "text-red-500",
  success: "text-emerald-600",
  info: "text-sky-600",
};

const SEVERITY_ICON_BG: Record<string, string> = {
  warning: "bg-amber-100",
  error: "bg-red-100",
  success: "bg-emerald-100",
  info: "bg-sky-100",
};

export function LearningInsightsPanel({ insights, loading }: LearningInsightsPanelProps) {
  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center mb-3">
          <Brain className="w-6 h-6 text-sky-500" />
        </div>
        <h3 className="text-sm font-bold text-slate-700 mb-1">No insights yet</h3>
        <p className="text-xs text-slate-500 max-w-xs">
          As you add notes and capture mistakes, AI insights will appear here based on your learning patterns.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
          <Brain className="w-4 h-4 text-violet-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">AI Knowledge Insights</p>
          <p className="text-xs text-slate-500">Derived from your notes and learning patterns</p>
        </div>
      </div>

      {insights.map((insight) => {
        const Icon = INSIGHT_ICON_MAP[insight.type] ?? Lightbulb;
        const cardStyle = SEVERITY_STYLES[insight.severity] ?? SEVERITY_STYLES.info;
        const iconColor = SEVERITY_ICON_COLORS[insight.severity] ?? "text-sky-600";
        const iconBg = SEVERITY_ICON_BG[insight.severity] ?? "bg-sky-100";

        return (
          <div
            key={insight.id}
            className={`flex gap-3 p-4 rounded-2xl border ${cardStyle} transition-all duration-200 hover:shadow-sm`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-slate-900">{insight.title}</p>
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                  {insight.dataPoints} data point{insight.dataPoints !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                {insight.description}
              </p>
              {insight.actionUrl && insight.actionLabel && (
                <Button
                  href={insight.actionUrl}
                  variant="ghost"
                  size="sm"
                  className={`mt-2 gap-1 text-xs ${iconColor} cursor-pointer px-0 hover:bg-transparent`}
                >
                  {insight.actionLabel}
                  <ExternalLink className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        );
      })}

      <p className="text-xs text-slate-400 text-center pt-1 flex items-center justify-center gap-1">
        <Info className="w-3 h-3" />
        Insights are computed from your personal notes — no fabricated data
      </p>
    </div>
  );
}
