"use client";

import { useState, useEffect } from "react";
import {
  PreparationGoal,
  PreparationGoalType,
  SkillLevel,
} from "@/services/preparation/preparationTypes";
import { Platform, Difficulty } from "@/services/types";
import {
  Target,
  X,
  Calendar,
  Clock,
  Layers,
  Sparkles,
  Trophy,
  Briefcase,
  CheckCircle2,
} from "lucide-react";

interface PreparationGoalModalProps {
  isOpen: boolean;
  editingGoal: PreparationGoal | null;
  onSave: (goal: PreparationGoal) => void;
  onClose: () => void;
}

const GOAL_TYPES: { label: string; value: PreparationGoalType; desc: string }[] = [
  { label: "DSA Interview Preparation", value: "dsa_interview", desc: "Comprehensive Big Tech coding interview mastery" },
  { label: "Competitive Programming", value: "competitive_programming", desc: "Codeforces/LeetCode speed and rating push" },
  { label: "Placement Preparation", value: "placement_prep", desc: "Campus hiring and online assessment readiness" },
  { label: "Technical Interview", value: "technical_interview", desc: "Specific target company technical rounds" },
  { label: "Coding Assessment", value: "coding_assessment", desc: "HackerRank / Codesignal OA benchmark sprint" },
  { label: "General DSA Improvement", value: "general_improvement", desc: "Consistent foundational and pattern growth" },
  { label: "Custom Goal", value: "custom", desc: "User-defined timeline and milestones" },
];

const SKILL_LEVELS: { label: string; value: SkillLevel }[] = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

const DIFFICULTIES: { label: string; value: Difficulty | "Mixed" }[] = [
  { label: "Mixed (Progressive)", value: "Mixed" },
  { label: "Easy", value: "Easy" },
  { label: "Medium", value: "Medium" },
  { label: "Hard", value: "Hard" },
];

const DEFAULT_TOPICS = [
  "Arrays",
  "Strings",
  "Two Pointers",
  "Sliding Window",
  "Binary Search",
  "Linked Lists",
  "Trees",
  "Graphs",
  "Dynamic Programming",
  "Greedy",
  "Heap / Priority Queue",
  "Stack",
];

function getDefaultFutureDate(days = 45): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function PreparationGoalModal({
  isOpen,
  editingGoal,
  onSave,
  onClose,
}: PreparationGoalModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<PreparationGoalType>("dsa_interview");
  const [targetDate, setTargetDate] = useState(getDefaultFutureDate(45));
  const [dailyMinutes, setDailyMinutes] = useState(60);
  const [daysPerWeek, setDaysPerWeek] = useState(6);
  const [platforms, setPlatforms] = useState<Platform[]>(["leetcode"]);
  const [currentSkillLevel, setCurrentSkillLevel] = useState<SkillLevel>("intermediate");
  const [targetDifficulty, setTargetDifficulty] = useState<Difficulty | "Mixed">("Medium");
  const [priorityTopics, setPriorityTopics] = useState<string[]>([
    "Graphs",
    "Dynamic Programming",
    "Trees",
    "Binary Search",
  ]);
  const [targetContestRating, setTargetContestRating] = useState<number | undefined>(1500);
  const [targetInterviewScore, setTargetInterviewScore] = useState<number | undefined>(85);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (editingGoal) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Populates editable local form state from editingGoal prop on modal open
      setName(editingGoal.name);
      setType(editingGoal.type);
      setTargetDate(editingGoal.targetDate);
      setDailyMinutes(editingGoal.dailyMinutes);
      setDaysPerWeek(editingGoal.daysPerWeek);
      setPlatforms(editingGoal.preferredPlatforms);
      setCurrentSkillLevel(editingGoal.currentSkillLevel);
      setTargetDifficulty(editingGoal.targetDifficulty);
      setPriorityTopics(editingGoal.priorityTopics);
      setTargetContestRating(editingGoal.targetContestRating);
      setTargetInterviewScore(editingGoal.targetInterviewScore);
      setNotes(editingGoal.notes || "");
    } else {
      setName("Big Tech Technical Interview Prep");
      setType("dsa_interview");
      setTargetDate(getDefaultFutureDate(45));
      setDailyMinutes(60);
      setDaysPerWeek(6);
      setPlatforms(["leetcode"]);
      setCurrentSkillLevel("intermediate");
      setTargetDifficulty("Medium");
      setPriorityTopics(["Graphs", "Dynamic Programming", "Trees", "Binary Search"]);
      setTargetContestRating(1500);
      setTargetInterviewScore(85);
      setNotes("");
    }
  }, [editingGoal, isOpen]);

  if (!isOpen) return null;

  const toggleTopic = (topic: string) => {
    if (priorityTopics.includes(topic)) {
      setPriorityTopics(priorityTopics.filter((t) => t !== topic));
    } else {
      setPriorityTopics([...priorityTopics, topic]);
    }
  };

  const togglePlatform = (p: Platform) => {
    if (platforms.includes(p)) {
      if (platforms.length > 1) {
        setPlatforms(platforms.filter((item) => item !== p));
      }
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = editingGoal ? editingGoal.id : `prep_goal_${Date.now()}`;
    const now = new Date().toISOString();

    const goal: PreparationGoal = {
      id,
      name: name.trim() || "Preparation Goal",
      type,
      targetDate,
      dailyMinutes,
      daysPerWeek,
      preferredPlatforms: platforms,
      currentSkillLevel,
      targetDifficulty,
      priorityTopics: priorityTopics.length > 0 ? priorityTopics : ["Arrays", "Dynamic Programming"],
      targetContestRating: type === "competitive_programming" ? targetContestRating : undefined,
      targetInterviewScore:
        type === "dsa_interview" || type === "technical_interview" || type === "placement_prep"
          ? targetInterviewScore
          : undefined,
      notes: notes.trim(),
      createdAt: editingGoal ? editingGoal.createdAt : now,
      updatedAt: now,
    };

    onSave(goal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:px-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {editingGoal ? "Edit Preparation Goal" : "Create New Preparation Goal"}
              </h2>
              <p className="text-xs text-slate-500">
                Define your target date, daily time commitment, and priority domains.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Goal Name */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">
              Goal Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. SDE-2 Interview Prep, Summer Placement Sprint"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
              required
            />
          </div>

          {/* Goal Type */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">
              Goal Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {GOAL_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    type === t.value
                      ? "bg-sky-50/80 border-sky-500 text-sky-950 ring-2 ring-sky-400/20"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div className="font-bold text-xs">{t.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Target Date & Daily Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase text-[11px] tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Target Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase text-[11px] tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Daily Minutes
              </label>
              <select
                value={dailyMinutes}
                onChange={(e) => setDailyMinutes(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value={15}>15 mins / day (Quick review)</option>
                <option value={30}>30 mins / day (Steady pace)</option>
                <option value={45}>45 mins / day (Standard)</option>
                <option value={60}>60 mins / day (Recommended)</option>
                <option value={90}>90 mins / day (Intensive)</option>
                <option value={120}>120 mins / day (Full sprint)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">
                Days Per Week
              </label>
              <select
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                <option value={4}>4 days / week</option>
                <option value={5}>5 days / week</option>
                <option value={6}>6 days / week</option>
                <option value={7}>7 days / week</option>
              </select>
            </div>
          </div>

          {/* Skill Level & Target Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">
                Current Skill Level
              </label>
              <select
                value={currentSkillLevel}
                onChange={(e) => setCurrentSkillLevel(e.target.value as SkillLevel)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                {SKILL_LEVELS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">
                Target Difficulty
              </label>
              <select
                value={targetDifficulty}
                onChange={(e) => setTargetDifficulty(e.target.value as Difficulty | "Mixed")}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority Topics */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">
              Priority Topics to Master ({priorityTopics.length} selected)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_TOPICS.map((topic) => {
                const isSelected = priorityTopics.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {isSelected && "✓ "}
                    {topic}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Platforms */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">
              Preferred Practice Platforms
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => togglePlatform("leetcode")}
                className={`flex-1 p-3 rounded-2xl border text-left transition-all ${
                  platforms.includes("leetcode")
                    ? "bg-amber-50/80 border-amber-500 text-amber-950 ring-2 ring-amber-400/20"
                    : "bg-white border-slate-200 text-slate-700"
                }`}
              >
                <div className="font-bold text-xs">LeetCode</div>
                <div className="text-[11px] text-slate-500">Standard interview archetypes</div>
              </button>

              <button
                type="button"
                onClick={() => togglePlatform("codeforces")}
                className={`flex-1 p-3 rounded-2xl border text-left transition-all ${
                  platforms.includes("codeforces")
                    ? "bg-blue-50/80 border-blue-500 text-blue-950 ring-2 ring-blue-400/20"
                    : "bg-white border-slate-200 text-slate-700"
                }`}
              >
                <div className="font-bold text-xs">Codeforces</div>
                <div className="text-[11px] text-slate-500">Competitive speed & math challenges</div>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase text-[11px] tracking-wider">
              Goal Notes & Focus Areas (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Focus heavily on graphs and DP. Aiming for Google/Meta interviews."
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400 resize-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-all cursor-pointer"
            >
              {editingGoal ? "Update Goal" : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
