"use client";

import * as React from "react";
import { AnalyticsGoal } from "@/services/analytics/performanceAnalyticsTypes";
import { Target, Plus, CheckCircle2, TrendingUp, Trash2, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface GoalTrackingPanelProps {
  goals: AnalyticsGoal[];
  onOpenCreateModal: () => void;
  onUpdateGoal: (id: string, updates: Partial<AnalyticsGoal>) => Promise<AnalyticsGoal | null>;
  onDeleteGoal: (id: string) => Promise<boolean>;
}

export function GoalTrackingPanel({
  goals,
  onOpenCreateModal,
  onUpdateGoal,
  onDeleteGoal,
}: GoalTrackingPanelProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleToggleComplete = async (g: AnalyticsGoal) => {
    const isComp = g.status === "completed";
    await onUpdateGoal(g.id, {
      status: isComp ? "in_progress" : "completed",
      currentValue: isComp ? Math.max(0, g.targetValue - 1) : g.targetValue,
    });
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDeleteGoal(id);
    setDeletingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-sky-600" /> Dynamic Goal Tracking & Success Predictions
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Set and track custom targets for weekly problems, monthly AI reviews, topic mastery, and practice streaks with AI completion forecasts.
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={onOpenCreateModal} className="gap-1.5 shrink-0">
          <Plus className="w-4 h-4" /> Create New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
            <Target className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-800">No active performance goals</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Create goals for problem counts, review totals, or streak milestones to stay focused and track your completion velocity.
          </p>
          <Button variant="primary" size="sm" onClick={onOpenCreateModal} className="mt-1">
            Create First Goal
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => {
            const isCompleted = g.status === "completed";
            const isAtRisk = g.status === "at_risk";

            return (
              <div
                key={g.id}
                className={`bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all ${
                  isCompleted
                    ? "border-emerald-200 bg-emerald-50/20"
                    : isAtRisk
                    ? "border-amber-200 bg-amber-50/20"
                    : "border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                        {g.category.replace("_", " ")}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug">{g.title}</h4>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleComplete(g)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-colors ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isCompleted ? "Completed" : "Mark Done"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(g.id)}
                        disabled={deletingId === g.id}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Progress ({g.currentValue} / {g.targetValue} {g.unit})</span>
                      <span className={isCompleted ? "text-emerald-700" : "text-sky-700"}>{g.completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${isCompleted ? "bg-emerald-500" : "bg-sky-600"}`}
                        style={{ width: `${g.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* AI Prediction Footer */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-[11px] font-semibold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Est. Finish: <strong className="text-slate-800">{g.estimatedCompletionDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Predicted Success: <strong className="text-emerald-700">{g.predictedSuccessPercentage}%</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
