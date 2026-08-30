"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAppContext } from "@/context/AppContext";
import { SessionQuestionItem } from "@/services/types";
import { Search, Filter, BookOpen, ExternalLink, CheckCircle2, FastForward, PlayCircle, Zap } from "lucide-react";
import { ErrorState } from "@/components/ui/ErrorState";

// Adaptive Practice Session Engine imports
import { PracticeSessionConfigurator } from "@/components/practice/PracticeSessionConfigurator";
import { PracticeSessionView } from "@/components/practice/PracticeSessionView";
import { PracticeSessionReport } from "@/components/practice/PracticeSessionReport";
import { PracticeSessionHistory } from "@/components/practice/PracticeSessionHistory";

import {
  PracticeSession,
  PracticeSessionConfig,
  PracticeSessionScore,
  PracticeSessionAnalytics,
} from "@/services/practice/practiceTypes";
import {
  startPracticeSession,
  restoreSession,
  pauseSession,
  resumeSession,
  getCurrentProblem,
  submitOutcome,
  finishSession,
  abandonSession,
} from "@/services/practice/practiceSessionEngine";
import { computeSessionScore, computeSessionAnalytics } from "@/services/practice/practiceSessionScoring";

// ─── Practice Page ─────────────────────────────────────────────────────────────

type PageView = "adaptive" | "configure" | "session" | "report" | "history" | "daily";

function PracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    selectedTopics,
    selectedLanguage,
    dailySession,
    selectReviewProblem,
    startPractice,
    markCompleted,
    skipProblem,
    loading,
    error,
    retryProblems,
  } = useAppContext();

  // ─── View State ───────────────────────────────────────────────────────────
  const [view, setView] = React.useState<PageView>("adaptive");
  const [activeTab, setActiveTab] = React.useState<"session" | "history" | "daily">("session");

  // ─── Adaptive Session State ───────────────────────────────────────────────
  const [activeSession, setActiveSession] = React.useState<PracticeSession | null>(null);
  const [completedSession, setCompletedSession] = React.useState<PracticeSession | null>(null);
  const [isStarting, setIsStarting] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Daily session state
  const [searchQuery, setSearchQuery] = React.useState("");
  const sessionQuestions = dailySession?.questions || [];
  const filteredQuestions = sessionQuestions.filter(
    (q) =>
      q.problemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const questionsByPlatform = React.useMemo(() => {
    const map: Record<string, SessionQuestionItem[]> = {};
    filteredQuestions.forEach((q) => {
      if (!map[q.platform]) map[q.platform] = [];
      map[q.platform].push(q);
    });
    return map;
  }, [filteredQuestions]);
  const platformKeys = Object.keys(questionsByPlatform);

  // ─── Restore active session on mount ──────────────────────────────────────
  React.useEffect(() => {
    try {
      const restored = restoreSession();
      if (restored) {
        if (restored.status === "ACTIVE" || restored.status === "PAUSED") {
          // eslint-disable-next-line react-hooks/set-state-in-effect -- Client-side localStorage session synchronization on mount to restore active/paused/completed practice session state without breaking SSR hydration
          setActiveSession(restored);
          setView("session");
        } else if (restored.status === "EXPIRED" || restored.status === "COMPLETED") {
          const score = computeSessionScore(restored);
          const analytics = computeSessionAnalytics(restored);
          // eslint-disable-next-line react-hooks/set-state-in-effect -- Client-side localStorage session synchronization on mount to restore active/paused/completed practice session state without breaking SSR hydration
          setCompletedSession({ ...restored, score, analytics });
          setView("report");
        }
      }
    } catch {}
  }, []);

  // ─── Check for planner launch parameters ──────────────────────────────────
  React.useEffect(() => {
    const mode = searchParams?.get("mode") as PracticeSessionConfig["mode"] | null;
    const duration = searchParams?.get("duration");
    if (mode || duration) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Synchronizes view mode with Next.js navigation search params
      setView("adaptive");
    }
  }, [searchParams]);

  // ─── Session Handlers ─────────────────────────────────────────────────────

  const handleStartSession = async (config: PracticeSessionConfig) => {
    setIsStarting(true);
    setSubmitError(null);
    try {
      const session = await startPracticeSession(config);
      setActiveSession(session);
      setView("session");
    } catch (err) {
      setSubmitError("Failed to build session plan. Please try again.");
      console.error("[Practice] Start session error:", err);
    } finally {
      setIsStarting(false);
    }
  };

  const handleSolvedIndependently = async () => {
    if (!activeSession) return;
    setIsSubmitting(true);
    try {
      const problem = getCurrentProblem(activeSession);
      const elapsed = problem
        ? Math.floor(
            (Date.now() - new Date(activeSession.timerStartedAt).getTime()) / 1000 -
              activeSession.totalPausedMs / 1000
          )
        : 0;
      const { session: updated } = await submitOutcome(
        activeSession,
        "SOLVED_INDEPENDENTLY",
        Math.min(elapsed, problem?.timeEstimate.estimatedMinutes ? problem.timeEstimate.estimatedMinutes * 60 * 3 : 3600),
        0
      );
      setActiveSession(updated);
      if (updated.status === "COMPLETED") {
        setCompletedSession(updated);
        setView("report");
      }
    } catch (e) {
      console.error("[Practice] Submit outcome error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSolvedWithHints = async (hintCount: number) => {
    if (!activeSession) return;
    setIsSubmitting(true);
    try {
      const problem = getCurrentProblem(activeSession);
      const elapsed = problem ? problem.timeEstimate.estimatedMinutes * 60 * 1.5 : 2700;
      const { session: updated } = await submitOutcome(
        activeSession,
        "SOLVED_WITH_HINTS",
        Math.round(elapsed),
        hintCount
      );
      setActiveSession(updated);
      if (updated.status === "COMPLETED") {
        setCompletedSession(updated);
        setView("report");
      }
    } catch (e) {
      console.error("[Practice] Submit outcome error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFailed = async () => {
    if (!activeSession) return;
    setIsSubmitting(true);
    try {
      const problem = getCurrentProblem(activeSession);
      const { session: updated } = await submitOutcome(
        activeSession,
        "FAILED",
        problem ? problem.timeEstimate.estimatedMinutes * 60 : 1800,
        0
      );
      setActiveSession(updated);
      if (updated.status === "COMPLETED") {
        setCompletedSession(updated);
        setView("report");
      }
    } catch (e) {
      console.error("[Practice] Submit outcome error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!activeSession) return;
    setIsSubmitting(true);
    try {
      const { session: updated } = await submitOutcome(activeSession, "SKIPPED", 0, 0);
      setActiveSession(updated);
      if (updated.status === "COMPLETED") {
        setCompletedSession(updated);
        setView("report");
      }
    } catch (e) {
      console.error("[Practice] Skip error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTimeout = async () => {
    if (!activeSession) return;
    try {
      const { session: updated } = await submitOutcome(
        activeSession,
        "TIMED_OUT",
        activeSession.durationMinutes * 60,
        0
      );
      setActiveSession(updated);
      if (updated.status === "COMPLETED") {
        setCompletedSession(updated);
        setView("report");
      }
    } catch (e) {
      console.error("[Practice] Timeout error:", e);
    }
  };

  const handlePause = () => {
    if (!activeSession) return;
    setActiveSession(pauseSession(activeSession));
  };

  const handleResume = () => {
    if (!activeSession) return;
    setActiveSession(resumeSession(activeSession));
  };

  const handleEndSession = () => {
    if (!activeSession) return;
    const finished = finishSession(activeSession);
    setCompletedSession(finished);
    setActiveSession(null);
    setView("report");
  };

  const handleNewSession = () => {
    setActiveSession(null);
    setCompletedSession(null);
    setView("adaptive");
  };

  const handleAbandon = () => {
    if (!activeSession) return;
    const abandoned = abandonSession(activeSession);
    setCompletedSession(abandoned);
    setActiveSession(null);
    setView("report");
  };

  // ─── Daily Practice helpers ───────────────────────────────────────────────
  const handleOpenClick = (problemId: number, currentStatus: string) => {
    if (currentStatus === "Not Started") startPractice(problemId);
    selectReviewProblem(problemId);
    router.push("/review");
  };

  const getDifficultyVariant = (difficulty: string) => {
    if (difficulty === "Easy") return "success" as const;
    if (difficulty === "Medium") return "primary" as const;
    return "warning" as const;
  };

  const getStatusBadge = (status: string) => {
    if (status === "In Progress") return <Badge variant="primary" className="text-xs">In Progress</Badge>;
    if (status === "Completed") return <Badge variant="success" className="text-xs">Completed</Badge>;
    if (status === "Skipped") return <Badge variant="neutral" className="text-xs text-slate-400">Skipped</Badge>;
    return <Badge variant="secondary" className="text-xs">Not Started</Badge>;
  };

  // ─── RENDER: Active Session ────────────────────────────────────────────────
  if (view === "session" && activeSession) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-4">
        <PracticeSessionView
          session={activeSession}
          onSolvedIndependently={handleSolvedIndependently}
          onSolvedWithHints={handleSolvedWithHints}
          onFailed={handleFailed}
          onSkip={handleSkip}
          onPause={handlePause}
          onResume={handleResume}
          onEndSession={handleEndSession}
          onTimeout={handleTimeout}
          isSubmitting={isSubmitting}
        />
      </div>
    );
  }

  // ─── RENDER: Session Report ───────────────────────────────────────────────
  if (view === "report" && completedSession && completedSession.score && completedSession.analytics) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-4">
        <PracticeSessionReport
          session={completedSession}
          score={completedSession.score}
          analytics={completedSession.analytics}
          onNewSession={handleNewSession}
          onViewHistory={() => { setView("adaptive"); setActiveTab("history"); }}
        />
      </div>
    );
  }

  // ─── RENDER: Main Page with Tabs ─────────────────────────────────────────
  return (
    <div className="space-y-6 select-none">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Adaptive Practice
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed">
          Structured, time-bounded practice sessions that adapt to your performance, integrate your Learning Graph, and route feedback to every subsystem.
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl w-fit">
        {(["session", "history", "daily"] as const).map((tab) => {
          const labels = { session: "🧠 Start Session", history: "📋 History", daily: "📅 Daily Queue" };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer ${
                activeTab === tab
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* Session Configurator Tab */}
      {activeTab === "session" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="w-4 h-4 text-sky-600" />
              Configure Adaptive Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submitError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-semibold">
                {submitError}
              </div>
            )}
            <PracticeSessionConfigurator
              onStart={handleStartSession}
              isLoading={isStarting}
              initialDurationMinutes={
                searchParams?.get("duration")
                  ? parseInt(searchParams.get("duration")!, 10)
                  : undefined
              }
              initialMode={
                (searchParams?.get("mode") as PracticeSessionConfig["mode"]) ?? undefined
              }
            />
          </CardContent>
        </Card>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <PracticeSessionHistory />
      )}

      {/* Daily Queue Tab */}
      {activeTab === "daily" && (
        <div className="space-y-8">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-bold text-slate-800">Today&apos;s Practice Queue</h2>
            <p className="text-slate-500 text-sm">Daily practice session from your Knowledge Profile and platform recommendation settings.</p>
          </div>

          {error ? (
            <Card>
              <CardContent className="py-12">
                <ErrorState message={error} onRetry={retryProblems} />
              </CardContent>
            </Card>
          ) : selectedTopics.length === 0 ? (
            <Card>
              <CardContent className="py-16 flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-500">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="text-base font-bold text-slate-800">Knowledge Profile Incomplete</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Complete your Permanent Knowledge Profile to receive personalized daily recommendations.
                  </p>
                </div>
                <Button href="/profile" variant="primary" size="md" className="mt-2 font-medium">
                  Go to Profile
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {dailySession?.metadata?.recommendationReason && (
                <Card className="border-sky-100 bg-sky-50/40 shadow-xs">
                  <CardContent className="p-4 sm:p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold text-xs">AI</div>
                        <h3 className="text-sm font-bold text-slate-800">AI Recommendation Strategy</h3>
                      </div>
                      {dailySession.metadata.strengthsMatched && dailySession.metadata.strengthsMatched.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[11px] font-semibold text-slate-500 mr-1">Matched Skills:</span>
                          {dailySession.metadata.strengthsMatched.map((s) => (
                            <Badge key={s} variant="primary" className="text-[10px]">{s}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {dailySession.metadata.recommendationReason}
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search recommendations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-slate-50/50 text-slate-700 font-medium"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600">
                    <Filter className="w-3.5 h-3.5 text-sky-600" />
                    <span>Language: {selectedLanguage}</span>
                  </div>
                  <Badge variant="neutral" className="px-3 py-1.5 text-xs font-semibold">
                    {filteredQuestions.length} Today&apos;s Problem{filteredQuestions.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </div>

              {loading ? (
                <Card>
                  <CardContent className="py-12 text-center text-slate-400 text-sm font-medium">
                    Generating today&apos;s recommendations...
                  </CardContent>
                </Card>
              ) : platformKeys.length > 0 ? (
                <div className="space-y-10">
                  {platformKeys.map((platformKey) => {
                    const platformQuestions = questionsByPlatform[platformKey];
                    const platformDisplayName =
                      platformKey === "leetcode" ? "LeetCode" : platformKey === "codeforces" ? "Codeforces" : platformKey;
                    return (
                      <div key={platformKey} className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                          <div className="flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">{platformDisplayName}</h2>
                            <Badge variant="secondary" className="text-xs font-bold">
                              {platformQuestions.length} Question{platformQuestions.length !== 1 ? "s" : ""}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {platformQuestions.map((q) => (
                            <Card key={q.problemId} className="flex flex-col justify-between hover:border-slate-300 transition-all">
                              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <div className="space-y-1">
                                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    {platformDisplayName} Question
                                  </span>
                                  <CardTitle className="text-sm font-bold text-slate-800">{q.problemTitle}</CardTitle>
                                </div>
                                <Badge variant={getDifficultyVariant(q.difficulty)} className="text-xs">
                                  {q.difficulty}
                                </Badge>
                              </CardHeader>
                              <CardContent className="space-y-4 pt-4 flex-1">
                                <div className="flex justify-between items-start gap-2">
                                  <div className="space-y-1.5 min-w-0">
                                    <div className="flex flex-wrap gap-1">
                                      {q.topics.slice(0, 3).map((topic) => (
                                        <Badge key={topic} variant="secondary" className="text-[10px] font-medium">
                                          {topic}
                                        </Badge>
                                      ))}
                                      {q.topics.length > 3 && (
                                        <Badge variant="neutral" className="text-[10px]">+{q.topics.length - 3}</Badge>
                                      )}
                                    </div>
                                  </div>
                                  {getStatusBadge(q.status)}
                                </div>
                                <div className="p-3 rounded-xl bg-slate-900 text-slate-400 font-mono text-xs overflow-hidden">
                                  <p className="truncate text-slate-300 font-semibold">
                                    {`// ${selectedLanguage} - ${q.problemTitle}`}
                                  </p>
                                  <p className="text-slate-500 mt-0.5">
                                    {`// Time: ${q.complexity?.time || "O(N)"}  Space: ${q.complexity?.space || "O(1)"}`}
                                  </p>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                                  <span className="text-xs text-slate-400 font-medium">Est: {q.estimated}</span>
                                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => handleOpenClick(q.problemId, q.status)}
                                      className="cursor-pointer text-xs flex items-center gap-1.5"
                                    >
                                      {q.status === "In Progress" ? (
                                        <><PlayCircle className="w-3.5 h-3.5 text-sky-600" /><span>Continue</span></>
                                      ) : (
                                        <><ExternalLink className="w-3.5 h-3.5 text-slate-500" /><span>Open</span></>
                                      )}
                                    </Button>
                                    {q.status !== "Completed" && (
                                      <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() => markCompleted(q.problemId)}
                                        className="cursor-pointer text-xs flex items-center gap-1.5"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Mark Complete</span>
                                      </Button>
                                    )}
                                    {q.status !== "Completed" && q.status !== "Skipped" && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => skipProblem(q.problemId)}
                                        className="cursor-pointer text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                                        title="Skip this question for today"
                                      >
                                        <FastForward className="w-3.5 h-3.5" />
                                        <span>Skip</span>
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-sm text-slate-500 font-medium">No recommendations match your search filter.</p>
                    <p className="text-xs text-slate-400 mt-1">Try searching a different topic or title.</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Practice() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 py-12 text-center text-slate-400 text-sm font-medium animate-pulse">
          Loading practice session...
        </div>
      }
    >
      <PracticeContent />
    </React.Suspense>
  );
}