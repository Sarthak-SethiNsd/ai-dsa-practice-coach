"use client";

import * as React from "react";
import { ContestEntry, ContestPlatform } from "@/services/contest/contestTypes";
import { X, Trophy, Loader2 } from "lucide-react";

interface Props {
  onClose: () => void;
  onSubmit: (entry: Omit<ContestEntry, "id" | "createdAt">) => Promise<void>;
}

const PLATFORMS: { value: ContestPlatform; label: string }[] = [
  { value: "codeforces", label: "Codeforces" },
  { value: "leetcode", label: "LeetCode" },
  { value: "atcoder", label: "AtCoder" },
  { value: "other", label: "Other" },
];

function computePerformanceScore(
  rank: number,
  totalParticipants: number,
  problemsSolved: number,
  totalProblems: number,
  timeEfficiency: number
): number {
  const rankPct = 1 - rank / Math.max(totalParticipants, 1);
  const solvePct = problemsSolved / Math.max(totalProblems, 1);
  return Math.round(rankPct * 40 + solvePct * 40 + (timeEfficiency / 100) * 20);
}

export function AddContestModal({ onClose, onSubmit }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    contestName: "",
    date: new Date().toISOString().split("T")[0],
    platform: "codeforces" as ContestPlatform,
    rank: "",
    totalParticipants: "",
    ratingBefore: "",
    ratingAfter: "",
    problemsSolved: "",
    totalProblems: "",
    easySolved: "",
    easyAttempted: "",
    mediumSolved: "",
    mediumAttempted: "",
    hardSolved: "",
    hardAttempted: "",
    timeSpentMinutes: "120",
    penaltyMinutes: "0",
    notes: "",
  });

  const set = (key: string, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const ratingChange =
    form.ratingBefore && form.ratingAfter
      ? parseInt(form.ratingAfter) - parseInt(form.ratingBefore)
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.contestName || !form.rank || !form.ratingBefore || !form.ratingAfter) {
      return;
    }
    setLoading(true);
    try {
      const rank = parseInt(form.rank) || 1;
      const totalParticipants = parseInt(form.totalParticipants) || 1000;
      const problemsSolved = parseInt(form.problemsSolved) || 0;
      const totalProblems = parseInt(form.totalProblems) || 6;
      const timeSpentMinutes = parseInt(form.timeSpentMinutes) || 120;
      const penaltyMinutes = parseInt(form.penaltyMinutes) || 0;
      const easySolved = parseInt(form.easySolved) || 0;
      const easyAttempted = parseInt(form.easyAttempted) || 0;
      const mediumSolved = parseInt(form.mediumSolved) || 0;
      const mediumAttempted = parseInt(form.mediumAttempted) || 0;
      const hardSolved = parseInt(form.hardSolved) || 0;
      const hardAttempted = parseInt(form.hardAttempted) || 0;
      const timeEfficiency = Math.max(
        0,
        Math.min(100, 100 - Math.round((penaltyMinutes / timeSpentMinutes) * 100))
      );
      const performanceScore = computePerformanceScore(
        rank,
        totalParticipants,
        problemsSolved,
        totalProblems,
        timeEfficiency
      );

      await onSubmit({
        contestName: form.contestName.trim(),
        date: form.date,
        platform: form.platform,
        rank,
        totalParticipants,
        ratingBefore: parseInt(form.ratingBefore),
        ratingAfter: parseInt(form.ratingAfter),
        ratingChange: parseInt(form.ratingAfter) - parseInt(form.ratingBefore),
        problemsSolved,
        totalProblems,
        timeSpentMinutes,
        performanceScore,
        problemBreakdown: {
          easySolved,
          easyAttempted,
          mediumSolved,
          mediumAttempted,
          hardSolved,
          hardAttempted,
          timeEfficiencyScore: timeEfficiency,
          penaltyMinutes,
          missedOpportunities: Math.max(
            0,
            totalProblems - problemsSolved - 1
          ),
          topicsAttempted: [],
        },
        notes: form.notes.trim() || undefined,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-extrabold text-slate-900">Log Contest</h2>
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
          {/* Contest Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Contest Name *
            </label>
            <input
              required
              type="text"
              value={form.contestName}
              onChange={(e) => set("contestName", e.target.value)}
              placeholder="e.g. Codeforces Round 950 (Div. 2)"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-300 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Date *
              </label>
              <input
                required
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-300 transition-all"
              />
            </div>

            {/* Platform */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Platform *
              </label>
              <select
                value={form.platform}
                onChange={(e) =>
                  set("platform", e.target.value as ContestPlatform)
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-300 transition-all bg-white"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Rank & Participants */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Your Rank *
              </label>
              <input
                required
                type="number"
                min="1"
                value={form.rank}
                onChange={(e) => set("rank", e.target.value)}
                placeholder="e.g. 1500"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-300 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Total Participants
              </label>
              <input
                type="number"
                min="1"
                value={form.totalParticipants}
                onChange={(e) => set("totalParticipants", e.target.value)}
                placeholder="e.g. 20000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-300 transition-all"
              />
            </div>
          </div>

          {/* Rating */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Rating Before *
              </label>
              <input
                required
                type="number"
                value={form.ratingBefore}
                onChange={(e) => set("ratingBefore", e.target.value)}
                placeholder="1200"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-300 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Rating After *
              </label>
              <input
                required
                type="number"
                value={form.ratingAfter}
                onChange={(e) => set("ratingAfter", e.target.value)}
                placeholder="1250"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-300 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Rating Change
              </label>
              <div
                className={`w-full px-4 py-2.5 rounded-xl border font-extrabold text-sm ${
                  ratingChange > 0
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : ratingChange < 0
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-slate-50 border-slate-200 text-slate-500"
                }`}
              >
                {ratingChange >= 0 ? "+" : ""}
                {ratingChange}
              </div>
            </div>
          </div>

          {/* Problems */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Problems Solved
              </label>
              <input
                type="number"
                min="0"
                value={form.problemsSolved}
                onChange={(e) => set("problemsSolved", e.target.value)}
                placeholder="3"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-300 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Total Problems
              </label>
              <input
                type="number"
                min="1"
                value={form.totalProblems}
                onChange={(e) => set("totalProblems", e.target.value)}
                placeholder="6"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-300 transition-all"
              />
            </div>
          </div>

          {/* Difficulty breakdown */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Difficulty Breakdown (Solved/Attempted)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(
                [
                  { label: "Easy", solvedKey: "easySolved", attemptedKey: "easyAttempted", color: "text-emerald-600" },
                  { label: "Medium", solvedKey: "mediumSolved", attemptedKey: "mediumAttempted", color: "text-amber-600" },
                  { label: "Hard", solvedKey: "hardSolved", attemptedKey: "hardAttempted", color: "text-rose-600" },
                ] as const
              ).map((diff) => (
                <div key={diff.label} className="space-y-1.5">
                  <p className={`text-xs font-extrabold ${diff.color}`}>
                    {diff.label}
                  </p>
                  <div className="flex gap-1.5">
                    <input
                      type="number"
                      min="0"
                      value={form[diff.solvedKey]}
                      onChange={(e) => set(diff.solvedKey, e.target.value)}
                      placeholder="Solved"
                      className="w-1/2 px-2 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                    />
                    <input
                      type="number"
                      min="0"
                      value={form[diff.attemptedKey]}
                      onChange={(e) => set(diff.attemptedKey, e.target.value)}
                      placeholder="Att."
                      className="w-1/2 px-2 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time & Penalty */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Time Spent (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={form.timeSpentMinutes}
                onChange={(e) => set("timeSpentMinutes", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-300 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Penalty (minutes)
              </label>
              <input
                type="number"
                min="0"
                value={form.penaltyMinutes}
                onChange={(e) => set("penaltyMinutes", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-300 transition-all"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Notes (optional)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              placeholder="What did you learn? What went well or poorly?"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-300 transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
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
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trophy className="w-4 h-4" />
              )}
              {loading ? "Saving..." : "Log Contest"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
