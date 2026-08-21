"use client";

import { useState } from "react";
import { X, Sparkles, Sliders, Briefcase, Zap, Clock, BookOpen, Layers } from "lucide-react";
import {
  InterviewConfig,
  InterviewType,
  InterviewDifficulty,
  InterviewDuration,
  InterviewStyle,
} from "@/services/interview/interviewTypes";

interface InterviewConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (config: InterviewConfig) => void;
}

const INTERVIEW_TYPES: { id: InterviewType; label: string; desc: string }[] = [
  { id: "General DSA", label: "General DSA", desc: "Comprehensive algorithmic problem solving" },
  { id: "Arrays & Strings", label: "Arrays & Strings", desc: "Two pointers, sliding window, prefix sums, hashing" },
  { id: "Dynamic Programming", label: "Dynamic Programming", desc: "Memoization, tabulation, subproblems" },
  { id: "Trees", label: "Trees & BST", desc: "DFS, BFS, traversals, recursive decompositions" },
  { id: "Graphs", label: "Graphs & Matrix", desc: "Connected components, shortest paths, topological sort" },
  { id: "Linked Lists", label: "Linked Lists", desc: "Pointer manipulation, slow-fast pointers" },
  { id: "Interview Weakness Drill", label: "Weakness Drill", desc: "Targeted focus on your lowest-scoring topics" },
];

const DIFFICULTIES: { id: InterviewDifficulty; label: string; desc: string }[] = [
  { id: "Adaptive", label: "Adaptive", desc: "Dynamic adjustment based on real-time execution" },
  { id: "Easy", label: "Easy", desc: "Standard fundamentals & warm-ups" },
  { id: "Medium", label: "Medium", desc: "Standard technical interview benchmark" },
  { id: "Hard", label: "Hard", desc: "Complex multi-step optimizations" },
];

const DURATIONS: InterviewDuration[] = [15, 30, 45, 60];

const STYLES: { id: InterviewStyle; label: string; desc: string }[] = [
  { id: "Standard", label: "Standard", desc: "Balanced professional technical interview" },
  { id: "Strict", label: "Strict", desc: "High rigor, stringent complexity justification" },
  { id: "Coaching", label: "Coaching", desc: "Supportive nudges and collaborative hints" },
  { id: "Company Simulation", label: "Company Simulation", desc: "Simulates general big-tech style interview dynamics" },
];

export function InterviewConfigModal({
  isOpen,
  onClose,
  onProceed,
}: InterviewConfigModalProps) {
  const [type, setType] = useState<InterviewType>("General DSA");
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>("Adaptive");
  const [duration, setDuration] = useState<InterviewDuration>(30);
  const [questionCount, setQuestionCount] = useState<number>(1);
  const [style, setStyle] = useState<InterviewStyle>("Standard");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProceed({
      type,
      difficulty,
      durationMinutes: duration,
      questionCount,
      style,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center text-white">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">Configure Mock Interview</h2>
              <p className="text-xs text-slate-500">Tailor topics, difficulty, and interview persona</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* 1. Interview Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-sky-600" />
              1. Interview Focus / Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INTERVIEW_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    type === t.id
                      ? "bg-sky-50 border-sky-500 ring-2 ring-sky-300/40 shadow-xs"
                      : "bg-slate-50/60 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <p className={`text-xs font-bold ${type === t.id ? "text-sky-800" : "text-slate-800"}`}>
                    {t.label}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Difficulty */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              2. Target Difficulty
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDifficulty(d.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    difficulty === d.id
                      ? "bg-amber-50 border-amber-500 ring-2 ring-amber-300/40 shadow-xs"
                      : "bg-slate-50/60 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <p className={`text-xs font-bold ${difficulty === d.id ? "text-amber-900" : "text-slate-800"}`}>
                    {d.label}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Duration & Question Count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                3. Duration
              </label>
              <div className="flex gap-2">
                {DURATIONS.map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setDuration(dur)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                      duration === dur
                        ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-sky-300"
                    }`}
                  >
                    {dur}m
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-600" />
                4. Problem Count
              </label>
              <div className="flex gap-2">
                {[1, 2, 3].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                      questionCount === count
                        ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-purple-300"
                    }`}
                  >
                    {count} {count === 1 ? "Problem" : "Problems"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 5. Interview Style */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-slate-700" />
              5. Interview Style & Persona
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStyle(s.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    style === s.id
                      ? "bg-slate-800 text-white border-slate-800 shadow-xs"
                      : "bg-slate-50/60 border-slate-200 text-slate-800 hover:border-slate-300"
                  }`}
                >
                  <p className="text-xs font-bold">{s.label}</p>
                  <p className={`text-[11px] mt-0.5 ${style === s.id ? "text-slate-300" : "text-slate-500"}`}>
                    {s.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors shadow-sm"
            >
              Review Prep & Start
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
