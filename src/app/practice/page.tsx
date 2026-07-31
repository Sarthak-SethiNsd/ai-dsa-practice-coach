"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAppContext } from "@/context/AppContext";
import { SessionQuestionItem } from "@/services/types";
import { Search, Filter, BookOpen, ExternalLink, CheckCircle2, FastForward, PlayCircle } from "lucide-react";
import { ErrorState } from "@/components/ui/ErrorState";

export default function Practice() {
  const router = useRouter();
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
    retryProblems
  } = useAppContext();

  const [searchQuery, setSearchQuery] = React.useState("");

  const sessionQuestions = dailySession?.questions || [];

  const filteredQuestions = sessionQuestions.filter((q) =>
    q.problemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group questions by platform
  const questionsByPlatform = React.useMemo(() => {
    const map: Record<string, SessionQuestionItem[]> = {};
    filteredQuestions.forEach(q => {
      if (!map[q.platform]) {
        map[q.platform] = [];
      }
      map[q.platform].push(q);
    });
    return map;
  }, [filteredQuestions]);

  const platformKeys = Object.keys(questionsByPlatform);

  const handleOpenClick = (problemId: number, currentStatus: string) => {
    if (currentStatus === "Not Started") {
      startPractice(problemId);
    }
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

  return (
    <div className="space-y-8 select-none">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Today&apos;s Practice
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed">
          Daily practice session automatically generated from your Permanent Knowledge Profile and platform recommendation settings.
        </p>
      </div>

      {/* Error State */}
      {error ? (
        <Card>
          <CardContent className="py-12">
            <ErrorState message={error} onRetry={retryProblems} />
          </CardContent>
        </Card>
      ) : selectedTopics.length === 0 ? (
        /* Empty State: Profile Not Completed */
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
            <Button
              href="/profile"
              variant="primary"
              size="md"
              className="mt-2 font-medium"
            >
              Go to Profile
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* AI Recommendation Insights Card */}
          {dailySession?.metadata?.recommendationReason && (
            <Card className="border-sky-100 bg-sky-50/40 shadow-xs">
              <CardContent className="p-4 sm:p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold text-xs">
                      AI
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">AI Recommendation Strategy</h3>
                  </div>
                  {dailySession.metadata.strengthsMatched && dailySession.metadata.strengthsMatched.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[11px] font-semibold text-slate-500 mr-1">Matched Skills:</span>
                      {dailySession.metadata.strengthsMatched.map(s => (
                        <Badge key={s} variant="primary" className="text-[10px]">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {dailySession.metadata.recommendationReason}
                </p>

                {dailySession.metadata.suggestedLearningOrder && dailySession.metadata.suggestedLearningOrder.length > 0 && (
                  <div className="pt-2 border-t border-sky-100/80 space-y-1.5">
                    <span className="text-[10px] font-bold text-sky-700 uppercase tracking-wider block">
                      Suggested Learning Order
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {dailySession.metadata.suggestedLearningOrder.map((step, idx) => (
                        <div key={idx} className="text-xs text-slate-600 bg-white/80 border border-sky-100 px-2.5 py-1 rounded-lg">
                          {step}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Search & Filter Header Bar */}
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

          {/* Loading Indicator */}
          {loading ? (
            <Card>
              <CardContent className="py-12 text-center text-slate-400 text-sm font-medium">
                Generating today&apos;s recommendations...
              </CardContent>
            </Card>
          ) : platformKeys.length > 0 ? (
            /* Recommendations Grouped by Platform */
            <div className="space-y-10">
              {platformKeys.map((platformKey) => {
                const platformQuestions = questionsByPlatform[platformKey];
                const platformDisplayName = platformKey === "leetcode" ? "LeetCode" : platformKey === "codeforces" ? "Codeforces" : platformKey;

                return (
                  <div key={platformKey} className="space-y-4">
                    {/* Platform Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                          {platformDisplayName}
                        </h2>
                        <Badge variant="secondary" className="text-xs font-bold">
                          {platformQuestions.length} Question{platformQuestions.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    </div>

                    {/* Platform Problems Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {platformQuestions.map((q) => {
                        return (
                          <Card key={q.problemId} className="flex flex-col justify-between hover:border-slate-300 transition-all">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                              <div className="space-y-1">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                  {platformDisplayName} Question
                                </span>
                                <CardTitle className="text-sm font-bold text-slate-800">{q.problemTitle}</CardTitle>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={getDifficultyVariant(q.difficulty)} className="text-xs">
                                  {q.difficulty}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4 flex-1">
                              {/* Topics & Status */}
                              <div className="flex justify-between items-start gap-2">
                                <div className="space-y-1.5 min-w-0">
                                  <div className="flex flex-wrap gap-1">
                                    {q.topics.slice(0, 3).map((topic) => (
                                      <Badge key={topic} variant="secondary" className="text-[10px] font-medium">
                                        {topic}
                                      </Badge>
                                    ))}
                                    {q.topics.length > 3 && (
                                      <Badge variant="neutral" className="text-[10px]">
                                        +{q.topics.length - 3}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                {getStatusBadge(q.status)}
                              </div>

                              {/* Code snippet preview */}
                              <div className="p-3 rounded-xl bg-slate-900 text-slate-400 font-mono text-xs overflow-hidden">
                                <p className="truncate text-slate-300 font-semibold">
                                  {`// ${selectedLanguage} - ${q.problemTitle}`}
                                </p>
                                <p className="text-slate-500 mt-0.5">
                                  {`// Time: ${q.complexity?.time || "O(N)"}  Space: ${q.complexity?.space || "O(1)"}`}
                                </p>
                              </div>

                              {/* Footer Details & Action Buttons */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                                <span className="text-xs text-slate-400 font-medium">
                                  Est: {q.estimated}
                                </span>
                                
                                {/* Action Buttons: Open, Mark Complete, Skip */}
                                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                                  {/* Open Button */}
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleOpenClick(q.problemId, q.status)}
                                    className="cursor-pointer text-xs flex items-center gap-1.5"
                                  >
                                    {q.status === "In Progress" ? (
                                      <>
                                        <PlayCircle className="w-3.5 h-3.5 text-sky-600" />
                                        <span>Continue</span>
                                      </>
                                    ) : (
                                      <>
                                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                                        <span>Open</span>
                                      </>
                                    )}
                                  </Button>

                                  {/* Mark Complete Button */}
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

                                  {/* Skip Button */}
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
                        );
                      })}
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
  );
}