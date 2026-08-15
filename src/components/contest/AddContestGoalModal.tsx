"use client";

import * as React from "react";
import {
  ContestGoal,
  ContestGoalCategory,
} from "@/services/contest/contestTypes";
import { X, Target, Loader2 } from "lucide-react";

interface Props {
  onClose: () => void;
  onSubmit: (
    goal: Omit<ContestGoal, "id" | "createdAt" | "completionPercentage" | "status">
  ) => Promise<void>;
}

const CATEGORIES: { value: ContestGoalCategory; label: string; desc: string }[] = [
  { value: "rating", label: "Rating Goal", desc: "Reach a specific Codeforces/LeetCode rating" },
  { value: "participation", label: "Participation Goal", desc: "Participate in a number of contests" },
  { value: "topic_mastery", label: "Topic Mastery", desc: "Achieve success rate in a topic" },
  { value: "consistency", label: "Consistency Goal", desc: "Contest frequency per month" },
];

const CATEGORY_UNITS: Record<ContestGoalCategory, string> = {
  rating: "rating",
  participation: "contests",
  topic_mastery: "% success rate",
  consistency: "contests/month",
};

export function AddContestGoalModal({ onClose, onSubmit }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState(() => ({
    title: "",
    category: "rating" as ContestGoalCategory,
    targetValue: "",
    currentValue: "0",
    targetDate: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    predictedSuccessPercentage: "75",
  }));

  const set = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const selectedCategory = CATEGORIES.find((c) => c.value === form.category)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.targetValue) return;
    setLoading(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        category: form.category,
        targetValue: parseFloat(form.targetValue),
        currentValue: parseFloat(form.currentValue) || 0,
        unit: CATEGORY_UNITS[form.category],
        targetDate: form.targetDate,
        estimatedCompletionDate: form.targetDate,
        predictedSuccessPercentage: parseInt(form.predictedSuccessPercentage) || 75,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-extrabold text-slate-900">Add Contest Goal</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Goal Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Goal Title *
            </label>
            <input
              required
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Reach Rating 1500"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Category *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => set("category", cat.value)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    form.category === cat.value
                      ? "bg-sky-50 border-sky-300 text-sky-800"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <p className="text-xs font-extrabold">{cat.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">{cat.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Target & Current */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Target ({CATEGORY_UNITS[form.category]}) *
              </label>
              <input
                required
                type="number"
                min="1"
                value={form.targetValue}
                onChange={(e) => set("targetValue", e.target.value)}
                placeholder={
                  form.category === "rating"
                    ? "1500"
                    : form.category === "participation"
                    ? "20"
                    : "75"
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Current Value
              </label>
              <input
                type="number"
                min="0"
                value={form.currentValue}
                onChange={(e) => set("currentValue", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              />
            </div>
          </div>

          {/* Target Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Target Date *
            </label>
            <input
              required
              type="date"
              value={form.targetDate}
              onChange={(e) => set("targetDate", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
            />
          </div>

          {/* Category description */}
          <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl">
            <p className="text-xs text-sky-700 font-medium">{selectedCategory.desc}</p>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white text-sm font-extrabold transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Target className="w-4 h-4" />}
              {loading ? "Saving..." : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
