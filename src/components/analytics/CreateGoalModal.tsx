"use client";

import * as React from "react";
import { AnalyticsGoal, GoalCategory } from "@/services/analytics/performanceAnalyticsTypes";
import { X, Target } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CreateGoalModalProps {
  onClose: () => void;
  onSubmit: (goal: Omit<AnalyticsGoal, "id" | "createdAt" | "completionPercentage" | "status">) => Promise<AnalyticsGoal>;
}

export function CreateGoalModal({ onClose, onSubmit }: CreateGoalModalProps) {
  const [title, setTitle] = React.useState("");
  const [category, setCategory] = React.useState<GoalCategory>("weekly_problems");
  const [targetValue, setTargetValue] = React.useState<number>(10);
  const [unit, setUnit] = React.useState("problems");
  const [targetTopic, setTargetTopic] = React.useState("");
  const [targetDate, setTargetDate] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleCategoryChange = (cat: GoalCategory) => {
    setCategory(cat);
    if (cat === "weekly_problems") {
      setUnit("problems");
      if (!title || title.startsWith("Solve")) setTitle("Solve 10 Problems This Week");
    } else if (cat === "monthly_reviews") {
      setUnit("reviews");
      if (!title || title.startsWith("Solve")) setTitle("Complete 15 AI Reviews");
    } else if (cat === "streak") {
      setUnit("days");
      if (!title || title.startsWith("Solve")) setTitle("Maintain 14-Day Streak");
    } else if (cat === "topic_mastery") {
      setUnit("% mastery");
      if (!title || title.startsWith("Solve")) setTitle("Master Dynamic Programming");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a goal title.");
      return;
    }
    if (targetValue <= 0) {
      setError("Target value must be greater than 0.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        category,
        targetValue,
        currentValue: 0,
        unit,
        targetTopic: category === "topic_mastery" ? (targetTopic.trim() || "Dynamic Programming") : undefined,
        targetDate,
        estimatedCompletionDate: targetDate,
        predictedSuccessPercentage: 80,
      });
      onClose();
    } catch (err) {
      console.error("[CreateGoalModal] Error:", err);
      setError("Failed to create goal.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Create Performance Goal</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700">
              {error}
            </div>
          )}

          {/* Goal Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Goal Type</label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as GoalCategory)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            >
              <option value="weekly_problems">Weekly Problems Solved</option>
              <option value="monthly_reviews">Monthly AI Reviews</option>
              <option value="topic_mastery">Topic Mastery Target</option>
              <option value="streak">Practice Streak Days</option>
            </select>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Goal Title</label>
            <input
              type="text"
              placeholder="e.g. Solve 15 Medium Problems"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          {category === "topic_mastery" && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Target Topic</label>
              <input
                type="text"
                placeholder="e.g. Dynamic Programming"
                value={targetTopic}
                onChange={(e) => setTargetTopic(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          )}

          {/* Target Value & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Target Value</label>
              <input
                type="number"
                min="1"
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Unit Label</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>

          {/* Target Date */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Target Target Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Create Goal"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
