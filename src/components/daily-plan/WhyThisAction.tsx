"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { DailyAction } from "@/services/dailyPlan/dailyPlanTypes";

interface WhyThisActionProps {
  action: DailyAction;
}

export function WhyThisAction({ action }: WhyThisActionProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-700 font-medium transition-colors"
      >
        <Lightbulb className="w-3.5 h-3.5" />
        Why this action?
        {open ? (
          <ChevronUp className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>

      {open && (
        <div className="mt-2 rounded-lg bg-sky-50 border border-sky-100 p-3 text-xs text-sky-800 space-y-2">
          <p>
            <span className="font-semibold">Signal: </span>
            {action.reason}
          </p>
          <p>
            <span className="font-semibold">Expected outcome: </span>
            {action.expectedOutcome}
          </p>
          <p>
            <span className="font-semibold">Priority score: </span>
            {action.priorityScore}/100 — drives{" "}
            <span className="font-semibold">{action.priority}</span> ranking
          </p>
        </div>
      )}
    </div>
  );
}
