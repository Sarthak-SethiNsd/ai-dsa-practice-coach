"use client";

import * as React from "react";
import { PracticeSessionProblem } from "@/services/practice/practiceTypes";

interface PracticeHintModalProps {
  problem: PracticeSessionProblem;
  hintLevel: number; // 1, 2, 3+
  onRequestMoreHint: () => void;
  onClose: () => void;
}

function getHintContent(
  problem: PracticeSessionProblem,
  level: number
): { title: string; content: string } {
  const { difficulty, primaryPattern, targetSkill, topics } = problem;

  // Hint 1: Concept & Invariant Clue
  if (level <= 1) {
    return {
      title: "💡 Concept & Invariant Clue",
      content:
        `This problem involves ${primaryPattern} on ${targetSkill}. ` +
        `Think about: What property or invariant must hold throughout? ` +
        `Related concepts: ${topics.slice(0, 3).join(", ")}. ` +
        `Don't jump to code — first identify what changes and what stays the same.`,
    };
  }

  // Hint 2: Algorithmic Approach
  if (level <= 2) {
    const approach =
      difficulty === "Easy"
        ? `For an Easy problem, the brute force approach often leads you to the optimal solution. Try O(n) or O(n log n).`
        : difficulty === "Medium"
        ? `Consider a two-pass or single-pass approach. ${primaryPattern} problems often use auxiliary data structures.`
        : `Hard problems typically combine multiple techniques. Consider if ${primaryPattern} can be layered with DP or greedy choices.`;

    return {
      title: "🗺️ Algorithmic Approach Hint",
      content:
        `${approach} ` +
        `For this ${primaryPattern} problem: think about the state you need to track and how to transition between states. ` +
        `Complexity goal: O(n) or O(n log n) space & time.`,
    };
  }

  // Hint 3: Step-by-step blueprint
  return {
    title: "📋 Step-by-Step Blueprint",
    content:
      `Pattern: ${primaryPattern}\n\n` +
      `1. Parse the problem constraints — what is n? What edge cases exist?\n` +
      `2. Sketch the algorithm: define your data structure (${targetSkill} usually involves specific structures).\n` +
      `3. Handle the base case / empty input.\n` +
      `4. Implement the core loop using the ${primaryPattern} technique.\n` +
      `5. Validate your solution against the provided examples before submitting.\n\n` +
      `Note: If you still can't proceed, mark this as "Failed" and review a solution — then practice a simpler version.`,
  };
}

export function PracticeHintModal({
  problem,
  hintLevel,
  onRequestMoreHint,
  onClose,
}: PracticeHintModalProps) {
  const hint = getHintContent(problem, hintLevel);
  const canGetMoreHints = hintLevel < 3;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-amber-50 border-b border-amber-100">
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wide">
              Hint {hintLevel}/3 · {problem.title}
            </p>
            <p className="text-sm font-bold text-amber-900 mt-0.5">{hint.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-amber-600 hover:text-amber-900 text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Hint content */}
        <div className="px-5 py-4">
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{hint.content}</p>
        </div>

        {/* Hint counter progress */}
        <div className="px-5 pb-2">
          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full ${i <= hintLevel ? "bg-amber-400" : "bg-slate-100"}`}
              />
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {hintLevel >= 3 ? "All hints revealed." : `${3 - hintLevel} hint${3 - hintLevel !== 1 ? "s" : ""} remaining.`}
          </p>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-slate-100 flex gap-2">
          {canGetMoreHints && (
            <button
              onClick={onRequestMoreHint}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition-colors cursor-pointer"
            >
              Next Hint →
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {canGetMoreHints ? "Got it, back to problem" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
