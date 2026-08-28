"use client";

import * as React from "react";
import { InterventionPlan } from "@/services/intervention/interventionTypes";

interface InterventionCardProps {
  plan: InterventionPlan;
  isPrimary?: boolean;
}

export function InterventionCard({ plan, isPrimary = false }: InterventionCardProps) {
  const [showEvidenceChain, setShowEvidenceChain] = React.useState(false);

  const getPriorityBadge = (p: InterventionPlan["priority"]) => {
    switch (p) {
      case "CRITICAL":
        return "bg-rose-100 text-rose-900 border-rose-300";
      case "HIGH":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "MEDIUM":
        return "bg-sky-100 text-sky-900 border-sky-300";
      case "LOW":
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  const getStatusBadge = (s: InterventionPlan["status"]) => {
    switch (s) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "PROPOSED":
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div
      className={`rounded-3xl border transition-all p-6 select-none ${
        isPrimary
          ? "bg-white border-sky-300 shadow-md ring-2 ring-sky-100"
          : "bg-white border-slate-200/90 shadow-xs hover:border-slate-300"
      }`}
    >
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getPriorityBadge(plan.priority)}`}>
            {plan.priority} Priority ({plan.priorityScore}/100)
          </span>
          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getStatusBadge(plan.status)}`}>
            {plan.status}
          </span>
          {isPrimary && (
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-500 text-white">
              Primary Focus
            </span>
          )}
        </div>
        <span className="text-xs font-semibold text-slate-400">
          Target: {plan.targetDurationSessions} sessions
        </span>
      </div>

      {/* Title & Objective */}
      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
        {plan.title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed font-medium">
        {plan.objective}
      </p>

      {/* Suggested Action Box */}
      <div className="mt-4 p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-start gap-2.5">
        <span className="text-base shrink-0">🎯</span>
        <div>
          <p className="text-xs font-bold text-sky-950 uppercase tracking-wide">Actionable Next Step</p>
          <p className="text-xs text-sky-900 mt-0.5 leading-relaxed font-medium">{plan.suggestedAction}</p>
        </div>
      </div>

      {/* Success & Rollback Criteria Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200/80">
          <p className="text-[11px] font-extrabold text-emerald-900 uppercase tracking-wide">✓ Success Criteria</p>
          <p className="text-xs font-bold text-emerald-950 mt-0.5">{plan.successCriteria.targetMetric}: {plan.successCriteria.threshold}</p>
          <p className="text-[11px] text-emerald-800 mt-0.5">{plan.successCriteria.description}</p>
        </div>

        <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/80">
          <p className="text-[11px] font-extrabold text-amber-900 uppercase tracking-wide">↩ Rollback Condition</p>
          <p className="text-xs font-bold text-amber-950 mt-0.5">{plan.rollbackCriteria.triggerCondition}</p>
          <p className="text-[11px] text-amber-800 mt-0.5">{plan.rollbackCriteria.fallbackAction}</p>
        </div>
      </div>

      {/* Conflict Resolution Note if present */}
      {plan.conflictResolutionNote && (
        <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium">
          ⚖️ <span className="font-bold">Conflict Resolution: </span>{plan.conflictResolutionNote}
        </div>
      )}

      {/* Evidence Chain Accordion */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <button
          onClick={() => setShowEvidenceChain(!showEvidenceChain)}
          className="text-xs font-bold text-sky-700 hover:text-sky-800 flex items-center gap-1.5 cursor-pointer"
        >
          <span>{showEvidenceChain ? "Hide Evidence Chain ▲" : "View Audit & Evidence Chain ▼"}</span>
        </button>

        {showEvidenceChain && (
          <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div>
              <span className="font-bold text-slate-700">1. Evidence: </span>
              <span className="text-slate-600">{plan.evidenceChain.evidence}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700">2. Diagnosis: </span>
              <span className="text-slate-600">{plan.evidenceChain.diagnosis}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700">3. Decision: </span>
              <span className="text-slate-600">{plan.evidenceChain.decision}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700">4. Action: </span>
              <span className="text-slate-600">{plan.evidenceChain.action}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700">5. Success Criteria: </span>
              <span className="text-slate-600">{plan.evidenceChain.successCriteria}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
