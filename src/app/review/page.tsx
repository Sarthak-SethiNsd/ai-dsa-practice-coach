"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAppContext } from "@/context/AppContext";
import {
  MessageSquare,
  Code2,
  Lightbulb,
  ArrowLeft,
  Edit2,
  Trash2,
  Save
} from "lucide-react";

export default function Review() {
  const {
    selectedReviewProblem,
    selectedLanguage,
    notes,
    updateNote,
    deleteNote
  } = useAppContext();

  // Fallback: no problem selected
  if (!selectedReviewProblem) {
    return (
      <div className="space-y-8 select-none">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            AI Review
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed">
            Deep-dive code evaluations and optimization recommendations generated for your submitted solutions.
          </p>
        </div>
        <Card>
          <CardContent className="py-20 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-400">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-base font-bold text-slate-800">No Problem Selected</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Select a problem from Practice or History to view the AI coach analysis and code review.
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <Link href="/practice" passHref legacyBehavior>
                <Button variant="primary" size="sm">
                  Browse Practice
                </Button>
              </Link>
              <Link href="/history" passHref legacyBehavior>
                <Button variant="secondary" size="sm">
                  View History
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const problem = selectedReviewProblem;
  const problemIdStr = problem.id.toString();
  const currentNote = notes[problemIdStr] || "";

  // Pick the solution for the current selected language, fallback to TypeScript, then first available
  const solutionCode =
    problem.solutions[selectedLanguage] ??
    problem.solutions["TypeScript"] ??
    Object.values(problem.solutions)[0] ??
    "// No solution available for this language.";

  const getDifficultyVariant = (difficulty: string) => {
    if (difficulty === "Easy") return "success" as const;
    if (difficulty === "Medium") return "primary" as const;
    return "warning" as const;
  };

  const handleSaveNote = (_e: React.FormEvent<HTMLFormElement>) => {
    _e.preventDefault();
    const textarea = document.getElementById(`note-textarea-${problem.id}`) as HTMLTextAreaElement | null;
    if (textarea) {
      const noteText = textarea.value;
      updateNote(problem.id, noteText);
      // We intentionally do not clear the textarea after saving to allow for further edits.
    }
  };

  const handleDeleteNote = () => {
    deleteNote(problem.id);
    // Optionally, we could clear the textarea, but the note state will update and the textarea will be cleared via the value prop.
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 mb-1">
          <Link href="/practice" passHref legacyBehavior>
            <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-sky-600 transition-colors cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Practice
            </button>
          </Link>
        </div>
        <div className="flex flex-wrap items-start gap-3">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl flex-1">
            AI Review
          </h1>
          <Badge variant={getDifficultyVariant(problem.difficulty)} className="mt-1.5">
            {problem.difficulty}
          </Badge>
        </div>
        <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed">
          Deep-dive code evaluation for <span className="font-semibold text-slate-700">{problem.title}</span> in {selectedLanguage}.
        </p>
      </div>

      {/* Review Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left column: Code Snippet */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Code2 className="w-4 h-4 text-slate-500" />
                </div>
                <CardTitle>Submitted Solution</CardTitle>
              </div>
              <Badge variant="neutral">{selectedLanguage}</Badge>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 text-slate-300 font-mono text-sm p-5 rounded-xl overflow-x-auto shadow-inner min-h-[220px] max-h-[480px]">
                <pre className="whitespace-pre">{solutionCode}</pre>
              </div>
            </CardContent>
          </Card>

          {/* Complexity Analysis Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Complexity Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-100/60">
                  <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider mb-1.5">Time Complexity</p>
                  <p className="text-xl font-extrabold text-slate-900 font-mono">{problem.complexity.time}</p>
                </div>
                <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100/60">
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1.5">Space Complexity</p>
                  <p className="text-xl font-extrabold text-slate-900 font-mono">{problem.complexity.space}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Coach Analysis */}
        <div className="space-y-6">
          <Card className="border-sky-100 bg-sky-50/25">
            <CardHeader className="flex flex-row items-center gap-2.5 pb-2">
              <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600">
                <MessageSquare className="w-4 h-4" />
              </div>
              <CardTitle className="text-base">Coach Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Topics Covered</span>
                <div className="flex flex-wrap gap-1.5">
                  {problem.topics.map((topic) => (
                    <Badge key={topic} variant="primary" className="text-[10px]">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="w-full h-px bg-sky-100/80" />

              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Key Takeaways</span>
                {problem.takeaways.map((tip, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start text-sm text-slate-600 leading-relaxed">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0 mt-1.5" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Optimization suggestions */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2.5 pb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                <Lightbulb className="w-4 h-4" />
              </div>
              <CardTitle className="text-sm">Optimization Hints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2.5 items-start text-xs text-slate-600 leading-relaxed">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1" />
                <span>Consider edge cases: empty inputs, single-element arrays, or overflow boundaries.</span>
              </div>
              <div className="flex gap-2.5 items-start text-xs text-slate-600 leading-relaxed">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1" />
                <span>Verify your solution handles both minimum and maximum constraint values within time limits.</span>
              </div>
            </CardContent>
          </Card>

          {/* Personal Notes Card */}
          <Card className="border-slate-200 bg-slate-50">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Edit2 className="w-4 h-4 text-slate-600" />
                </div>
                <CardTitle className="text-base">Personal Notes</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                {currentNote.trim() ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDeleteNote}
                  >
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <form onSubmit={handleSaveNote} className="space-y-2">
                <textarea
                  id={`note-textarea-${problem.id}`}
                  value={currentNote}
                  onChange={() => {
                    // We don't update state here to avoid excessive re-renders; we'll update on submit
                  }}
                  placeholder="Add your personal notes, insights, or questions about this problem..."
                  className="w-full min-h-[100px] resize-y border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white"
                  rows={4}
                />
                <button type="submit" className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:bg-sky-50/50">
                  Save Note
                  <Save className="h-4 w-4" />
                </button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5 space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                AI-powered deep feedback, memory trace diagrams, and personalized hints will be available in the next version.
              </p>
              <Button size="sm" className="w-full cursor-not-allowed" disabled>
                Ask Coach a Question
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}