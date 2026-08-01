"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAppContext } from "@/context/AppContext";
import { aiReviewService } from "@/services/ai/aiReviewService";
import { ReviewCategory, ReviewSession, AiReviewResponse } from "@/services/ai/aiTypes";
import {
  Code2,
  Upload,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Zap,
  BookOpen,
  Lightbulb,
  ShieldCheck,
  Layers,
  ArrowLeft,
  Copy,
  Check,
  Loader2,
  X,
  FileText
} from "lucide-react";

interface CategoryMeta {
  key: ReviewCategory;
  title: string;
  shortDesc: string;
  icon: React.ElementType;
  color: string;
}

const REVIEW_CATEGORIES: CategoryMeta[] = [
  {
    key: "OPTIMAL_COMPLEXITY",
    title: "Optimal Complexity",
    shortDesc: "Theoretical minimum time & space bounds",
    icon: Zap,
    color: "sky"
  },
  {
    key: "OPTIMAL_HINTS",
    title: "Optimal Hints",
    shortDesc: "Step-by-step guidance to reach optimal solution",
    icon: Lightbulb,
    color: "amber"
  },
  {
    key: "OPTIMAL_FULL_SOLUTION",
    title: "Optimal Full Solution",
    shortDesc: "Complete reference optimal code & implementation",
    icon: FileCode,
    color: "emerald"
  },
  {
    key: "MY_COMPLEXITY",
    title: "My Complexity",
    shortDesc: "Exact time & space complexity of uploaded code",
    icon: Layers,
    color: "indigo"
  },
  {
    key: "CORRECTNESS_CHECK",
    title: "Correctness Check",
    shortDesc: "Bug audit, off-by-one errors & correctness verdict",
    icon: ShieldCheck,
    color: "purple"
  },
  {
    key: "EDGE_CASE_ANALYSIS",
    title: "Edge Case Analysis",
    shortDesc: "Boundary inputs, overflow & extreme constraints",
    icon: AlertTriangle,
    color: "rose"
  },
  {
    key: "MY_HINTS",
    title: "My Hints",
    shortDesc: "Targeted hints to fix and refine your current code",
    icon: BookOpen,
    color: "blue"
  },
  {
    key: "FULL_CODE_REVIEW",
    title: "Full Code Review",
    shortDesc: "Comprehensive evaluation of quality, logic & tips",
    icon: Sparkles,
    color: "violet"
  }
];

const SUPPORTED_LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "C++",
  "Java",
  "Go",
  "Rust"
];

export default function ReviewPage() {
  const { selectedReviewProblem, selectedLanguage, reviewQuotaStatus, refreshReviewQuota } = useAppContext();
  const problem = selectedReviewProblem;

  // Quota calculation helpers
  const isQuotaExhausted = React.useMemo(() => {
    if (!reviewQuotaStatus) return false;
    const tokensExhausted = reviewQuotaStatus.limits.remainingTokens <= 0;
    const reqsExhausted =
      reviewQuotaStatus.limits.remainingRequests !== null &&
      reviewQuotaStatus.limits.remainingRequests <= 0;
    return tokensExhausted || reqsExhausted;
  }, [reviewQuotaStatus]);

  const isQuotaLow = React.useMemo(() => {
    if (!reviewQuotaStatus || isQuotaExhausted) return false;
    const ratio =
      reviewQuotaStatus.limits.remainingTokens / reviewQuotaStatus.limits.weeklyTokenLimit;
    return ratio < 0.1;
  }, [reviewQuotaStatus, isQuotaExhausted]);

  // Language state
  const [language, setLanguage] = React.useState<string>(selectedLanguage || "JavaScript");

  // Initial code derived from selected problem
  const defaultProblemCode = React.useMemo(() => {
    if (!problem) return "";
    return (
      problem.solutions[language] ??
      problem.solutions["TypeScript"] ??
      Object.values(problem.solutions)[0] ??
      `// Paste or upload your ${language} code here`
    );
  }, [problem, language]);

  // Explicit user edited/uploaded code (null = use default problem code)
  const [customCode, setCustomCode] = React.useState<string | null>(null);
  const code = customCode !== null ? customCode : defaultProblemCode;

  const [uploadedFileName, setUploadedFileName] = React.useState<string | null>(null);

  // Review Session Model
  const [session, setSession] = React.useState<ReviewSession | null>(null);

  // Category Selection & AI Response state
  const [selectedCategory, setSelectedCategory] = React.useState<ReviewCategory | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [reviewResult, setReviewResult] = React.useState<AiReviewResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedCode, setCopiedCode] = React.useState<boolean>(false);

  // Real-time Code Validation check
  const validation = React.useMemo(() => {
    return aiReviewService.validateSourceCode(code, language);
  }, [code, language]);

  // Handle Code change and update session model
  const handleCodeChange = (newCode: string) => {
    setCustomCode(newCode);
    setError(null);

    const val = aiReviewService.validateSourceCode(newCode, language);
    if (val.isValid) {
      const newSession = aiReviewService.createReviewSession(newCode, language, {
        problemTitle: problem?.title,
        problemUrl: problem?.url
      });
      setSession(newSession);
    } else {
      setSession(null);
    }
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);

    // Auto-detect language from extension
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "py") setLanguage("Python");
    else if (ext === "cpp" || ext === "cc" || ext === "cxx") setLanguage("C++");
    else if (ext === "java") setLanguage("Java");
    else if (ext === "js") setLanguage("JavaScript");
    else if (ext === "ts" || ext === "tsx") setLanguage("TypeScript");
    else if (ext === "go") setLanguage("Go");
    else if (ext === "rs") setLanguage("Rust");

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text !== undefined) {
        handleCodeChange(text);
      }
    };
    reader.readAsText(file);
  };

  // Handle clear/remove uploaded file
  const handleClearCode = () => {
    setCustomCode("");
    setUploadedFileName(null);
    setSession(null);
    setReviewResult(null);
    setSelectedCategory(null);
    setError(null);
  };

  // Execute AI Review Request for a selected category
  const executeReviewCategory = async (category: ReviewCategory) => {
    if (!validation.isValid || isQuotaExhausted) return;

    setSelectedCategory(category);
    setIsLoading(true);
    setError(null);

    const activeSessionId = session?.sessionId || "rev_active_session";

    try {
      const response = await aiReviewService.generateReview({
        sessionId: activeSessionId,
        code: code.trim(),
        language,
        category,
        problemTitle: problem?.title || "Custom Code Review",
        problemUrl: problem?.url,
        difficulty: problem?.difficulty,
        topics: problem?.topics
      });

      setReviewResult(response);
      refreshReviewQuota();
    } catch (err) {
      console.error("AI Review execution failed:", err);
      refreshReviewQuota();
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate review. Please verify network connectivity and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Copy code helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const lineCount = React.useMemo(() => {
    if (!code) return 0;
    return code.split("\n").length;
  }, [code]);

  return (
    <div className="space-y-8 select-none max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        {problem && (
          <div className="flex items-center gap-3 mb-1">
            <Link href="/practice" passHref legacyBehavior>
              <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-sky-600 transition-colors cursor-pointer">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Practice
              </button>
            </Link>
          </div>
        )}

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl flex items-center gap-3">
              <span>AI Review</span>
              {session && (
                <Badge variant="neutral" className="text-[10px] font-mono font-normal">
                  Session: {session.sessionId.substring(0, 16)}...
                </Badge>
              )}
            </h1>
            <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed mt-1">
              Upload source code, select a targeted review category, and receive instant AI analysis.
            </p>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Language:
            </label>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                if (code) handleCodeChange(code);
              }}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 cursor-pointer shadow-sm"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Weekly Quota Card */}
      {reviewQuotaStatus && (
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Review AI Weekly Quota</h3>
              </div>
              <div className="flex items-center gap-2">
                {isQuotaExhausted ? (
                  <Badge variant="warning" className="bg-red-50 text-red-700 border-red-200 font-bold">
                    Quota Exhausted
                  </Badge>
                ) : isQuotaLow ? (
                  <Badge variant="warning" className="bg-amber-50 text-amber-700 border-amber-200 font-bold">
                    Quota Low (&lt;10%)
                  </Badge>
                ) : (
                  <Badge variant="success" className="text-xs font-semibold">
                    Active Quota
                  </Badge>
                )}
              </div>
            </div>

            {/* Quota Progress Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>Tokens Used</span>
                <span>
                  {reviewQuotaStatus.usage.totalTokens.toLocaleString()} / {reviewQuotaStatus.limits.weeklyTokenLimit.toLocaleString()} Tokens
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isQuotaExhausted ? "bg-red-500" : isQuotaLow ? "bg-amber-500" : "bg-sky-500"
                  }`}
                  style={{
                    width: `${Math.min(100, (reviewQuotaStatus.usage.totalTokens / reviewQuotaStatus.limits.weeklyTokenLimit) * 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Quota Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remaining Tokens</span>
                <span className="text-sm font-bold text-slate-800">{reviewQuotaStatus.limits.remainingTokens.toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Requests Used</span>
                <span className="text-sm font-bold text-slate-800">{reviewQuotaStatus.usage.totalRequests}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Weekly Limit</span>
                <span className="text-sm font-bold text-slate-800">{reviewQuotaStatus.limits.weeklyTokenLimit.toLocaleString()}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resets On</span>
                <span className="text-xs font-semibold text-slate-700">
                  {new Date(reviewQuotaStatus.period.weekEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            </div>

            {/* Quota Exhausted Warning Banner */}
            {isQuotaExhausted && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium flex items-center gap-2 mt-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>
                  Weekly quota exceeded. Your <strong>{reviewQuotaStatus.limits.weeklyTokenLimit.toLocaleString()}</strong> Review AI token limit has been exhausted. All category reviews are disabled until <strong>{new Date(reviewQuotaStatus.period.weekEnd).toLocaleDateString()}</strong>.
                </span>
              </div>
            )}

            {/* Quota Low Warning Banner */}
            {isQuotaLow && !isQuotaExhausted && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium flex items-center gap-2 mt-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Warning: Less than 10% of your weekly Review AI token quota remains (<strong>{reviewQuotaStatus.limits.remainingTokens.toLocaleString()}</strong> tokens left). Quota resets on {new Date(reviewQuotaStatus.period.weekEnd).toLocaleDateString()}.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SECTION 1: UPLOAD CODE */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <CardTitle className="text-base">Upload Code</CardTitle>
              <p className="text-xs text-slate-400">
                Paste source code or upload a file. The active session remains available when switching categories.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {uploadedFileName && (
              <Badge variant="primary" className="gap-1 text-xs">
                <FileText className="w-3 h-3" />
                <span>{uploadedFileName}</span>
              </Badge>
            )}
            {code.trim().length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleClearCode}
                className="gap-1 text-xs"
              >
                <X className="w-3.5 h-3.5" /> Clear
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {/* File Upload Zone */}
          <div className="flex flex-col sm:flex-row items-center gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-dashed border-slate-300">
            <label className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer transition-colors shadow-sm shrink-0">
              <Upload className="w-4 h-4 text-sky-600" />
              <span>Choose File</span>
              <input
                type="file"
                accept=".py,.js,.ts,.cpp,.c,.cc,.java,.go,.rs,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <span className="text-xs text-slate-400 font-medium">
              Supported file types: .py, .js, .ts, .cpp, .java, .go, .rs, .txt
            </span>
          </div>

          {/* Code Textarea Input */}
          <div className="relative">
            <textarea
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder={`// Paste or type your ${language} solution code here...\n\nfunction solution() {\n  // Your implementation\n}`}
              rows={10}
              className="w-full bg-slate-900 text-slate-200 font-mono text-xs p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/40 shadow-inner resize-y leading-relaxed"
            />
            <div className="absolute bottom-3 right-4 text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
              {lineCount} lines | {code.length} chars
            </div>
          </div>

          {/* Real-time Code Validation Warning */}
          {!validation.isValid && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{validation.error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* SECTION 2: REVIEW CATEGORIES */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <CardTitle className="text-base">Select ONE Review Category</CardTitle>
              <p className="text-xs text-slate-400">
                Clicking a category immediately triggers Review AI for that specific perspective.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {REVIEW_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.key;
              const disabled = !validation.isValid || isLoading || isQuotaExhausted;

              return (
                <button
                  key={cat.key}
                  onClick={() => executeReviewCategory(cat.key)}
                  disabled={disabled}
                  className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between gap-2.5 cursor-pointer ${
                    disabled
                      ? "opacity-50 cursor-not-allowed bg-slate-50 border-slate-200"
                      : isSelected
                      ? "bg-sky-50/90 border-sky-400 shadow-md ring-2 ring-sky-500/20"
                      : "bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/30 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && isLoading && (
                      <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
                    )}
                    {isSelected && !isLoading && (
                      <CheckCircle2 className="w-4 h-4 text-sky-600" />
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{cat.title}</h4>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                      {cat.shortDesc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* SECTION 3: RESPONSE UI */}
      <Card className="border-slate-200 shadow-sm min-h-[300px]">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <CardTitle className="text-base">Review Response</CardTitle>
              <p className="text-xs text-slate-400">
                AI evaluation output generated for your active code session.
              </p>
            </div>
          </div>

          {reviewResult?.usage && (
            <div className="flex items-center gap-2">
              <Badge variant="neutral" className="text-[10px]">
                {reviewResult.usage.service}
              </Badge>
              <Badge variant="primary" className="text-[10px]">
                Tokens: {reviewResult.usage.totalTokens}
              </Badge>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-6">
          {/* 1. Loading State */}
          {isLoading && (
            <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Evaluating {selectedCategory ? selectedCategory.replace("_", " ") : "Code"}...
              </h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Running independent Review AI inference. Token usage is recorded for this request.
              </p>
            </div>
          )}

          {/* 2. Error State with Retry Button */}
          {!isLoading && error && (
            <div className="p-6 rounded-2xl bg-red-50/70 border border-red-200 text-center space-y-4">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-red-900">Review Request Failed</h4>
                <p className="text-xs text-red-700 max-w-md mx-auto">{error}</p>
              </div>
              {selectedCategory && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => executeReviewCategory(selectedCategory)}
                  className="gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Review</span>
                </Button>
              )}
            </div>
          )}

          {/* 3. Empty / Initial State */}
          {!isLoading && !error && !reviewResult && (
            <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <Code2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">No Category Selected</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Upload your code above and click any of the 8 review categories to get instant AI analysis.
              </p>
            </div>
          )}

          {/* 4. Active AI Response Display */}
          {!isLoading && !error && reviewResult && (
            <div className="space-y-6">
              {/* Result Header Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-4 rounded-xl bg-sky-50/60 border border-sky-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-bold text-sky-900">
                    {reviewResult.categoryTitle || selectedCategory}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Stateless Request • {reviewResult.usage?.totalTokens || 0} tokens
                </span>
              </div>

              {/* Summary / High level overview if available */}
              {reviewResult.summary && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Summary Overview
                  </span>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">
                    {reviewResult.summary}
                  </p>
                </div>
              )}

              {/* Complexity Badges */}
              {(reviewResult.timeComplexity || reviewResult.spaceComplexity) && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-100">
                    <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider mb-1">
                      Time Complexity
                    </p>
                    <p className="text-lg font-extrabold text-slate-900 font-mono">
                      {reviewResult.timeComplexity}
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">
                      Space Complexity
                    </p>
                    <p className="text-lg font-extrabold text-slate-900 font-mono">
                      {reviewResult.spaceComplexity}
                    </p>
                  </div>
                </div>
              )}

              {/* Hints Section */}
              {reviewResult.hints && reviewResult.hints.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>Progressive Hints</span>
                  </h4>
                  <div className="space-y-2">
                    {reviewResult.hints.map((hint, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-xs text-amber-950 font-medium leading-relaxed flex gap-2.5 items-start"
                      >
                        <span className="w-5 h-5 rounded-full bg-amber-200/80 text-amber-800 flex items-center justify-center shrink-0 text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span>{hint}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optimal Reference Code Block */}
              {reviewResult.optimalCode && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-emerald-600" />
                      <span>Optimal Reference Solution ({language})</span>
                    </h4>
                    <button
                      onClick={() => copyToClipboard(reviewResult.optimalCode || "")}
                      className="flex items-center gap-1 text-[11px] font-bold text-sky-600 hover:text-sky-700 cursor-pointer"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="bg-slate-900 text-slate-200 font-mono text-xs p-4 rounded-xl overflow-x-auto leading-relaxed shadow-inner">
                    <code>{reviewResult.optimalCode}</code>
                  </pre>
                </div>
              )}

              {/* Main Analysis & Feedback */}
              {reviewResult.overallFeedback && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Overall Evaluation &amp; Feedback
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {reviewResult.overallFeedback}
                  </p>
                </div>
              )}

              {/* Correctness Analysis */}
              {reviewResult.correctnessAnalysis && (
                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Correctness &amp; Logic Audit
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {reviewResult.correctnessAnalysis}
                  </p>
                </div>
              )}

              {/* Edge Cases List */}
              {reviewResult.edgeCases && reviewResult.edgeCases.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Edge Cases &amp; Boundary Conditions
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {reviewResult.edgeCases.map((ec, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-100 text-xs text-slate-700 leading-relaxed flex gap-2 items-start"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                        <span>{ec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optimization Suggestions */}
              {reviewResult.optimizationSuggestions &&
                reviewResult.optimizationSuggestions.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Optimization Suggestions
                    </span>
                    <ul className="space-y-1.5">
                      {reviewResult.optimizationSuggestions.map((opt, i) => (
                        <li key={i} className="flex gap-2 items-start text-xs text-slate-600 leading-relaxed">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                          <span>{opt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Learning Tips */}
              {reviewResult.learningTips && reviewResult.learningTips.length > 0 && (
                <div className="p-4 rounded-xl bg-indigo-50/30 border border-indigo-100 space-y-2">
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> Learning Takeaways
                  </span>
                  <ul className="space-y-1">
                    {reviewResult.learningTips.map((tip, idx) => (
                      <li key={idx} className="flex gap-2 items-start text-xs text-slate-700 leading-relaxed">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}