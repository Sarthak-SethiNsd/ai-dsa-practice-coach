"use client";

import { PreparationRisk } from "@/services/preparation/preparationTypes";
import Link from "next/link";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  EyeOff,
} from "lucide-react";

interface RiskDetectionPanelProps {
  risks: PreparationRisk[];
  onAcknowledge: (riskId: string) => void;
}

const SEVERITY_STYLES = {
  critical: {
    badge: "bg-rose-600 text-white",
    border: "border-rose-300 bg-rose-50/40",
    icon: ShieldAlert,
    iconColor: "text-rose-600",
  },
  high: {
    badge: "bg-amber-600 text-white",
    border: "border-amber-300 bg-amber-50/40",
    icon: AlertTriangle,
    iconColor: "text-amber-600",
  },
  medium: {
    badge: "bg-sky-600 text-white",
    border: "border-sky-200 bg-sky-50/30",
    icon: AlertTriangle,
    iconColor: "text-sky-600",
  },
  low: {
    badge: "bg-slate-600 text-white",
    border: "border-slate-200 bg-slate-50",
    icon: AlertTriangle,
    iconColor: "text-slate-500",
  },
};

export function RiskDetectionPanel({
  risks,
  onAcknowledge,
}: RiskDetectionPanelProps) {
  const activeRisks = risks.filter((r) => !r.acknowledged);

  if (activeRisks.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400 space-y-2">
        <ShieldCheck className="w-10 h-10 mx-auto text-emerald-500" />
        <h3 className="text-sm font-bold text-slate-800">
          All Preparation Systems Healthy
        </h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          No critical risks detected across study consistency, difficulty progression, revision backlog, or simulation pace.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Cross-System Risk Detection Engine
            </h3>
            <p className="text-xs text-slate-500">
              Deterministic anomalies and bottlenecks detected across existing subsystem telemetry
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
          {activeRisks.length} Active Risks
        </span>
      </div>

      {/* Risk Cards */}
      <div className="space-y-4">
        {activeRisks.map((risk) => {
          const style = SEVERITY_STYLES[risk.severity] || SEVERITY_STYLES.medium;
          const Icon = style.icon;

          return (
            <div
              key={risk.id}
              className={`p-5 rounded-2xl border transition-all space-y-3 ${style.border}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${style.badge}`}
                  >
                    {risk.severity}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {risk.title}
                  </h4>
                </div>

                <button
                  onClick={() => onAcknowledge(risk.id)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors"
                  title="Acknowledge and dismiss"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Acknowledge</span>
                </button>
              </div>

              {/* Evidence & Impact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white/80 rounded-xl border border-slate-200/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Observed Evidence
                  </span>
                  <p className="text-slate-700 leading-relaxed font-sans">
                    {risk.evidence}
                  </p>
                </div>

                <div className="p-3 bg-white/80 rounded-xl border border-slate-200/60 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Projected Impact
                  </span>
                  <p className="text-slate-700 leading-relaxed font-sans">
                    {risk.impactDescription}
                  </p>
                </div>
              </div>

              {/* Recommended Action Footer */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/60 text-xs">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <span className="font-bold text-slate-900">Action:</span>
                  <span>{risk.recommendedCorrection}</span>
                </div>

                <Link
                  href={risk.quickActionHref}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xs"
                >
                  <span>{risk.quickActionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
