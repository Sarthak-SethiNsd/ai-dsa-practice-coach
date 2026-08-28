"use client";

import * as React from "react";
import { InterventionPlan } from "@/services/intervention/interventionTypes";
import { InterventionCard } from "./InterventionCard";

interface ActiveInterventionsProps {
  plans: InterventionPlan[];
}

export function ActiveInterventions({ plans }: ActiveInterventionsProps) {
  const [filter, setFilter] = React.useState<"all" | "active" | "proposed">("all");

  const filteredPlans = plans.filter((p) => {
    if (filter === "active") return p.status === "ACTIVE";
    if (filter === "proposed") return p.status === "PROPOSED";
    return true;
  });

  return (
    <div className="space-y-4 select-none">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Intervention Plans</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Structured strategy adjustments designed to resolve diagnosed bottlenecks
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200/60">
          {(["all", "active", "proposed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === f
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {f === "all" ? "All Plans" : f === "active" ? "Active (In Progress)" : "Proposed (Queued)"}
            </button>
          ))}
        </div>
      </div>

      {filteredPlans.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
          <p className="text-3xl mb-2">🎉</p>
          <p className="text-sm font-bold text-slate-800">No Interventions Required</p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Your current practice exhibits balanced progression with zero active bottleneck alerts.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPlans.map((plan, idx) => (
            <InterventionCard key={plan.id} plan={plan} isPrimary={idx === 0 && plan.status === "ACTIVE"} />
          ))}
        </div>
      )}
    </div>
  );
}
