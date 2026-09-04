"use client";

import * as React from "react";
import { StateValue } from "@/services/visualizer/visualizerTypes";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Sparkles, CheckCircle2, AlertTriangle, Play, Activity } from "lucide-react";

interface StateInspectorPanelProps {
  explanation: string;
  stateVariables: Readonly<Record<string, StateValue>>;
  status: "running" | "success" | "failure" | "completed";
  stepIndex: number;
  totalSteps: number;
}

/**
 * Safely and cleanly formats structured StateValues for display.
 */
function formatStateValue(val: StateValue): string {
  if (val === null || val === undefined) return "null";
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "number" || typeof val === "string") return String(val);
  if (Array.isArray(val)) {
    if (val.length === 0) return "[]";
    return `[${val.map(formatStateValue).join(", ")}]`;
  }
  if (typeof val === "object") {
    return JSON.stringify(val);
  }
  return String(val);
}

export function StateInspectorPanel({
  explanation,
  stateVariables,
  status,
  stepIndex,
  totalSteps,
}: StateInspectorPanelProps) {
  const statusBadge = {
    running: { label: "Running", variant: "primary" as const, icon: Play },
    success: { label: "Success", variant: "success" as const, icon: CheckCircle2 },
    completed: { label: "Completed", variant: "success" as const, icon: CheckCircle2 },
    failure: { label: "Not Found / Exhausted", variant: "warning" as const, icon: AlertTriangle },
  }[status];

  const StatusIcon = statusBadge.icon;

  return (
    <Card className="flex flex-col overflow-hidden bg-white border border-slate-200/80 shadow-xs">
      <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Activity className="w-4 h-4 text-sky-600" /> State Inspector
        </CardTitle>
        <Badge variant={statusBadge.variant} className="gap-1 text-[11px] py-0.5 px-2">
          <StatusIcon className="w-3 h-3" />
          {statusBadge.label}
        </Badge>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {/* Plain-English Step Explanation Card */}
        <div className="p-3.5 rounded-xl bg-sky-50/80 border border-sky-200/60 text-xs sm:text-sm text-sky-950 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-sky-900 block mb-0.5">Step {stepIndex + 1} of {totalSteps}:</span>
            {explanation}
          </div>
        </div>

        {/* Runtime State Variables Table */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Runtime Variables
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(stateVariables).map(([key, value]) => {
              const formatted = formatStateValue(value);
              return (
                <div
                  key={key}
                  className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between"
                >
                  <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                    {key}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-900 truncate mt-0.5" title={formatted}>
                    {formatted}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
