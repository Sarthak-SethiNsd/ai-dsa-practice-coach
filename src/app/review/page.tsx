"use client";

import * as React from "react";
import { Cpu, Code2, RefreshCw, Zap, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAppContext } from "@/context/AppContext";
import { aiReviewService } from "@/services/ai/aiReviewService";
import { ReviewCategory, ReviewSession, AiReviewResponse, ReviewHistoryEntry } from "@/services/ai/aiTypes";
import { reviewHistoryStorage } from "@/services/reviewHistoryStorage";
import { Problem } from "@/services/types";

// Modular UI Components
import { ProblemSelectorModal } from "@/components/review/ProblemSelectorModal";
import { CodeSubmissionPanel } from "@/components/review/CodeSubmissionPanel";
import { AIFeedbackPanel } from "@/components/review/AIFeedbackPanel";
import { ComplexityAnalysisPanel } from "@/components/review/ComplexityAnalysisPanel";
import { LearningTakeawaysPanel } from "@/components/review/LearningTakeawaysPanel";
import { WeaknessInsightsPanel } from "@/components/review/WeaknessInsightsPanel";
import { ReviewAnalyticsPanel } from "@/components/review/ReviewAnalyticsPanel";

export default function ReviewPage() {
  const {
    selectedReviewProblem,
    selectedLanguage,
    problems,
    showToast,
  } = useAppContext();

  // Selected problem state
  const [activeProblem, setActiveProblem] = React.useState<Problem | null>(selectedReviewProblem || null);
  const [isProblemModalOpen, setIsProblemModalOpen] = React.useState(false);

  // Sync with context if selectedReviewProblem changes
  React.useEffect(() => {
    if (selectedReviewProblem) {
      setActiveProblem(selectedReviewProblem);
    }
  }, [selectedReviewProblem]);

  // Language state (Java default as primary)
  const [language, setLanguage] = React.useState<string>(selectedLanguage || "Java");

  // Initial code derived from active problem
  const defaultProblemCode = React.useMemo(() => {
    if (!activeProblem) {
      return `public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Paste or write your Java solution here\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (map.containsKey(diff)) {\n                return new int[] { map.get(diff), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}`;
    }
    return (
      activeProblem.solutions[language] ??
      activeProblem.solutions["Java"] ??
      activeProblem.solutions["JavaScript"] ??
      Object.values(activeProblem.solutions)[0] ??
      `// Paste or write your ${language} solution code here`
    );
  }, [activeProblem, language]);

  // Code state
  const [customCode, setCustomCode] = React.useState<string | null>(null);
  const code = customCode !== null ? customCode : defaultProblemCode;
  const [uploadedFileName, setUploadedFileName] = React.useState<string | null>(null);

  // Session & Review AI State
  const [session, setSession] = React.useState<ReviewSession | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<ReviewCategory | null>("FULL_CODE_REVIEW");
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [reviewResult, setReviewResult] = React.useState<AiReviewResponse | null>(null);
  const [historyEntries, setHistoryEntries] = React.useState<ReviewHistoryEntry[]>([]);

  // Load review history entries for analytics and weakness profile
  const loadHistory = React.useCallback(async () => {
    try {
      const data = await reviewHistoryStorage.getAllEntries();
      setHistoryEntries(data);
    } catch (err) {
      console.error("[ReviewPage] Load history error:", err);
    }
  }, []);

  React.useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Source code validation
  const validation = React.useMemo(() => {
    return aiReviewService.validateSourceCode(code, language);
  }, [code, language]);

  // Handle code change
  const handleCodeChange = (newCode: string) => {
    setCustomCode(newCode);
    const val = aiReviewService.validateSourceCode(newCode, language);
    if (val.isValid) {
      const newSession = aiReviewService.createReviewSession(newCode, language, {
        problemTitle: activeProblem?.title,
        problemUrl: activeProblem?.url,
      });
      setSession(newSession);
    } else {
      setSession(null);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "java") setLanguage("Java");
    else if (ext === "py") setLanguage("Python");
    else if (ext === "cpp" || ext === "cc" || ext === "cxx") setLanguage("C++");
    else if (ext === "js") setLanguage("JavaScript");
    else if (ext === "ts" || ext === "tsx") setLanguage("TypeScript");
    else if (ext === "go") setLanguage("Go");
    else if (ext === "rs") setLanguage("Rust");

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        handleCodeChange(content);
        showToast?.(`Loaded ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  // Submit AI Review request
  const handleSubmitReview = async (cat: ReviewCategory) => {
    if (!validation.isValid) return;

    setIsLoading(true);
    setSelectedCategory(cat);

    try {
      const result = await aiReviewService.generateReview({
        sessionId: session?.sessionId,
        problemTitle: activeProblem?.title || "Custom Problem Solution",
        problemUrl: activeProblem?.url,
        code,
        language,
        category: cat,
      });

      setReviewResult(result);
      showToast?.("AI review generated & saved to history!");
      await loadHistory();
    } catch (err: any) {
      console.error("[ReviewPage] Review generation error:", err);
      showToast?.(err.message || "Failed to generate review");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="review-page max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* SEO Title */}
      <title>AI Problem Review & Feedback · DSA AI Coach</title>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-100 text-violet-600">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">AI Problem Review Workspace</h1>
            <p className="text-sm text-slate-500">
              Get instant Big-O complexity analysis, correctness checks, and adaptive feedback on solved coding problems.
            </p>
          </div>
        </div>

        <Button
          variant="secondary"
          onClick={() => setIsProblemModalOpen(true)}
          className="gap-2 cursor-pointer shrink-0"
        >
          <Code2 className="w-4 h-4" />
          <span>{activeProblem ? "Change Solved Problem" : "Select Solved Problem"}</span>
        </Button>
      </div>

      {/* Active Problem Metadata Banner */}
      {activeProblem && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-100 text-violet-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base">{activeProblem.title}</span>
                <span className="capitalize text-xs font-bold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                  {activeProblem.platform}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    activeProblem.difficulty === "Easy"
                      ? "bg-emerald-100 text-emerald-800"
                      : activeProblem.difficulty === "Medium"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {activeProblem.difficulty}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Topics: {activeProblem.topics.join(", ")}
              </p>
            </div>
          </div>

          {activeProblem.url && (
            <a
              href={activeProblem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-violet-600 hover:text-violet-700 hover:underline"
            >
              View on {activeProblem.platform} →
            </a>
          )}
        </div>
      )}

      {/* Code Submission Editor */}
      <CodeSubmissionPanel
        code={code}
        language={language}
        onCodeChange={handleCodeChange}
        onLanguageChange={setLanguage}
        onFileUpload={handleFileUpload}
        uploadedFileName={uploadedFileName}
        validation={validation}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        onSubmitReview={handleSubmitReview}
        isLoading={isLoading}
        disabled={false}
      />

      {/* AI Feedback & Results */}
      <AIFeedbackPanel
        reviewResult={reviewResult}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          handleSubmitReview(cat);
        }}
        isLoading={isLoading}
      />

      {/* Complexity Analysis Panel */}
      <ComplexityAnalysisPanel reviewResult={reviewResult} />

      {/* Learning Takeaways & Edge Cases Panel */}
      <LearningTakeawaysPanel reviewResult={reviewResult} />

      {/* Weakness Insights & Adaptive Feedback Loop */}
      <WeaknessInsightsPanel entries={historyEntries} />

      {/* Historical Review Analytics Panel */}
      <ReviewAnalyticsPanel entries={historyEntries} />

      {/* Problem Selector Modal */}
      <ProblemSelectorModal
        isOpen={isProblemModalOpen}
        onClose={() => setIsProblemModalOpen(false)}
        onSelectProblem={(prob) => {
          setActiveProblem(prob);
          setCustomCode(null);
        }}
        availableProblems={problems}
      />
    </main>
  );
}