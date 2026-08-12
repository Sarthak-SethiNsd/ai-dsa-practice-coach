"use client";

import * as React from "react";
import { useQuestionRecommendations } from "@/hooks/useQuestionRecommendations";
import { QuestionRecommendationOverview } from "@/components/questions/QuestionRecommendationOverview";
import { RecommendedQuestionsGrid } from "@/components/questions/RecommendedQuestionsGrid";
import { StretchChallengePanel } from "@/components/questions/StretchChallengePanel";
import { ConfidenceBuilderPanel } from "@/components/questions/ConfidenceBuilderPanel";
import { RecommendationAnalyticsPanel } from "@/components/questions/RecommendationAnalyticsPanel";
import { RecommendationHistoryPanel } from "@/components/questions/RecommendationHistoryPanel";
import { Loader2, Target } from "lucide-react";

export default function QuestionsPage() {
  const {
    loading,
    refreshing,
    batch,
    questions,
    filteredQuestions,
    stretchChallenges,
    confidenceBuilders,
    analytics,
    filters,
    setFilters,
    refreshRecommendations,
    markSolved,
    markSkipped,
    markViewed,
    clearHistory,
  } = useQuestionRecommendations();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
          <p className="text-sm font-medium">Selecting personalized coding questions...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="questions-page max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* SEO Title */}
      <title>Question Recommendations · DSA AI Coach</title>

      {/* Page Title Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2.5 rounded-xl bg-violet-100 text-violet-600">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Coding Question Engine</h1>
          <p className="text-sm text-slate-500">
            Personalized coding problems selected from LeetCode & Codeforces tailored to your weakness, readiness, and roadmap.
          </p>
        </div>
      </div>

      {/* Overview Section */}
      <QuestionRecommendationOverview
        batch={batch}
        analytics={analytics}
        refreshing={refreshing}
        onRefresh={refreshRecommendations}
      />

      {/* Main Recommended Questions Grid */}
      <RecommendedQuestionsGrid
        questions={filteredQuestions}
        filters={filters}
        setFilters={setFilters}
        onMarkSolved={markSolved}
        onMarkSkipped={markSkipped}
        onMarkViewed={markViewed}
      />

      {/* Stretch Challenges Section */}
      <StretchChallengePanel
        challenges={stretchChallenges}
        onMarkSolved={markSolved}
        onMarkViewed={markViewed}
      />

      {/* Confidence Builders Section */}
      <ConfidenceBuilderPanel
        builders={confidenceBuilders}
        onMarkSolved={markSolved}
        onMarkViewed={markViewed}
      />

      {/* Analytics Section */}
      <RecommendationAnalyticsPanel analytics={analytics} />

      {/* History Section */}
      <RecommendationHistoryPanel questions={questions} onClearHistory={clearHistory} />
    </main>
  );
}
