"use client";

import * as React from "react";
import { StudySessionConfig, StudyFocusCategory } from "@/services/study/studyTypes";
import { Clock, Target, Play, ShieldAlert, Sparkles, Map, Award, Repeat } from "lucide-react";

interface Props {
  config: StudySessionConfig;
  onChangeConfig: (config: StudySessionConfig) => void;
  onStartSession: () => void;
}

const DURATIONS = [15, 30, 45, 60];

const FOCUS_CATEGORIES: {
  id: StudyFocusCategory;
  title: string;
  desc: string;
  icon: React.ElementType;
  color: string;
}[] = [
  {
    id: "balanced",
    title: "Balanced Session",
    desc: "Mix of SRS revisions, roadmap priorities, and new topic practice.",
    icon: Sparkles,
    color: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    id: "weak_topics",
    title: "Weak Topics Focus",
    desc: "Targets your lowest mastery DSA topics and recurring mistakes.",
    icon: ShieldAlert,
    color: "bg-amber-50 text-amber-700 border-amber-200",
  },
  {
    id: "revision",
    title: "Spaced Revision (SRS)",
    desc: "Priority queue of overdue and due Ebbinghaus SRS items.",
    icon: Repeat,
    color: "bg-violet-50 text-violet-700 border-violet-200",
  },
  {
    id: "roadmap_progress",
    title: "Roadmap Progress",
    desc: "Direct execution of your assigned daily roadmap missions.",
    icon: Map,
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    id: "contest_prep",
    title: "Contest Preparation",
    desc: "Timed speedrun on contest-style Medium/Hard problems.",
    icon: Award,
    color: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    id: "interview_prep",
    title: "Interview Speedrun",
    desc: "High-frequency interview questions with strict time limits.",
    icon: Target,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
];

export function SessionConfiguration({ config, onChangeConfig, onStartSession }: Props) {
  const [customMinutes, setCustomMinutes] = React.useState<string>("");

  const handleDurationClick = (mins: number) => {
    onChangeConfig({ ...config, durationMinutes: mins });
    setCustomMinutes("");
  };

  const handleCustomChange = (val: string) => {
    setCustomMinutes(val);
    const parsed = parseInt(val, 10);
    if (parsed && parsed > 0 && parsed <= 180) {
      onChangeConfig({ ...config, durationMinutes: parsed });
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8">
      {/* 1. Duration Picker */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
            1. Select Session Duration
          </h3>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {DURATIONS.map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => handleDurationClick(mins)}
              className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition-all cursor-pointer border ${
                config.durationMinutes === mins && !customMinutes
                  ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
              }`}
            >
              {mins} Minutes
            </button>
          ))}

          {/* Custom Duration Input */}
          <div className="flex items-center gap-2 pl-2">
            <input
              type="number"
              min="5"
              max="180"
              placeholder="Custom mins"
              value={customMinutes}
              onChange={(e) => handleCustomChange(e.target.value)}
              className="w-32 px-3 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Session Focus Picker */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-sky-600" />
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wide">
            2. Choose Session Focus
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FOCUS_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = config.focusCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onChangeConfig({ ...config, focusCategory: cat.id })}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-sky-50/80 border-sky-400 ring-2 ring-sky-300/50 shadow-xs"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-xl border ${cat.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-extrabold text-slate-900">
                    {cat.title}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {cat.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Launch Button */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="text-xs text-slate-400 font-semibold">
          Selected: <strong className="text-slate-800">{config.durationMinutes} mins</strong> · Focus: <strong className="text-slate-800 capitalize">{config.focusCategory.replace("_", " ")}</strong>
        </div>

        <button
          type="button"
          onClick={onStartSession}
          className="flex items-center gap-2 px-8 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5"
        >
          <Play className="w-4 h-4 fill-white" />
          Launch Focus Session
        </button>
      </div>
    </div>
  );
}
