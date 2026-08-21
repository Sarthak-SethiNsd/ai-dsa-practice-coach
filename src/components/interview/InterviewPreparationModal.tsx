"use client";

import {
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Brain,
  MessageSquare,
  Clock,
} from "lucide-react";
import { InterviewConfig } from "@/services/interview/interviewTypes";

interface InterviewPreparationModalProps {
  isOpen: boolean;
  config: InterviewConfig | null;
  onClose: () => void;
  onConfirmStart: () => void;
}

export function InterviewPreparationModal({
  isOpen,
  config,
  onClose,
  onConfirmStart,
}: InterviewPreparationModalProps) {
  if (!isOpen || !config) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            Interview Preparation
          </div>
          <h2 className="text-xl font-bold">Before You Begin</h2>
          <p className="text-xs text-slate-300 mt-1">
            {config.type} · {config.difficulty} · {config.durationMinutes} minutes ({config.style} Style)
          </p>
        </div>

        {/* Mindset Checklist */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Treat this as a real technical interview. Follow these four foundational habits:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-sky-50/70 border border-sky-100 text-xs text-sky-900">
              <MessageSquare className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Think Aloud Continuously: </span>
                Explain your thought process before writing code. Silent coding reduces your Communication score.
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-purple-900">
              <Brain className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">State Complexity Upfront: </span>
                Discuss Time and Space big-O trade-offs before typing code lines.
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50/70 border border-amber-100 text-xs text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Test Edge Cases Proactively: </span>
                Identify boundary scenarios (empty array, nulls, duplicates) before declaring your code complete.
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
              <Clock className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Pace Your Time: </span>
                Aim for 5m problem understanding, 10m algorithm design, 10m coding, and 5m verification.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            Adjust Config
          </button>
          <button
            type="button"
            onClick={onConfirmStart}
            className="px-6 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold hover:bg-sky-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <span>I'm Ready — Start Timer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
