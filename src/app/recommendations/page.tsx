"use client";

import * as React from "react";
import { useRecommendations } from "@/hooks/useRecommendations";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AdaptiveRecommendationsView } from "@/components/recommendations/AdaptiveRecommendationsView";
import { RecommendationsOverview } from "@/components/recommendations/RecommendationsOverview";
import { WeakAreasPanel } from "@/components/recommendations/WeakAreasPanel";
import { LearningPlanCard } from "@/components/recommendations/LearningPlanCard";
import { SmartActionCardsGrid } from "@/components/recommendations/SmartActionCardsGrid";
import { ReadinessScoresGrid } from "@/components/recommendations/ReadinessScoresGrid";
import { TrendAnalysisCard } from "@/components/recommendations/TrendAnalysisCard";
import { RecommendationCharts } from "@/components/recommendations/RecommendationCharts";
import { RecommendationSnapshotModal } from "@/components/recommendations/RecommendationSnapshotModal";
import { GlobalLoading } from "@/components/ui/GlobalLoading";

export default function RecommendationsPage() {
  const {
    loading,
    recommendation,
    snapshots,
    comparison,
    selectedBaselineId,
    actionCards,
    saveCurrentSnapshot,
    deleteSnapshot,
    selectBaselineForComparison,
    toggleActionCard,
    refresh,
  } = useRecommendations();

  const [isHistoryModalOpen, setIsHistoryModalOpen] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    refresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  }, [refresh]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <GlobalLoading />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Synthesizing personalized AI recommendations...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const renderReadinessAnalytics = () => (
    <div className="space-y-8">
      {/* SECTION 1: OVERVIEW */}
      <section id="overview">
        <RecommendationsOverview
          overallScore={recommendation.overallReadinessScore}
          confidenceScore={recommendation.weakTopics.confidenceScore}
          totalReviewsAnalyzed={recommendation.trendAnalysis.totalReviewsAnalyzed}
          lastUpdated={recommendation.timestamp}
          isRefreshing={isRefreshing}
          onRefresh={handleRefresh}
          onSaveSnapshot={saveCurrentSnapshot}
          onOpenHistory={() => setIsHistoryModalOpen(true)}
        />
      </section>

      {/* SECTION 2: WEAK AREAS (Weak Topic Detection) */}
      <section id="weak-areas">
        <WeakAreasPanel analysis={recommendation.weakTopics} />
      </section>

      {/* SECTION 3: SUGGESTED FOCUS & LEARNING PLAN */}
      <section id="learning-plan">
        <LearningPlanCard plan={recommendation.learningPlan} />
      </section>

      {/* SECTION 4: SMART ACTION CARDS (Action Items) */}
      <section id="action-items">
        <SmartActionCardsGrid
          actionCards={actionCards}
          onToggleCard={toggleActionCard}
        />
      </section>

      {/* SECTION 5: READINESS SCORES (0-100) */}
      <section id="readiness-scores">
        <ReadinessScoresGrid scores={recommendation.readinessScores} />
      </section>

      {/* SECTION 6: TREND ANALYSIS */}
      <section id="trend-analysis">
        <TrendAnalysisCard metrics={recommendation.trendAnalysis} />
      </section>

      {/* SECTION 7: VISUALIZATIONS (Recharts Charts) */}
      <section id="visualizations">
        <RecommendationCharts
          topicPerformance={recommendation.topicPerformance}
          readinessScores={recommendation.readinessScores}
          trendAnalysis={recommendation.trendAnalysis}
          actionCards={actionCards}
        />
      </section>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="pb-12">
        <AdaptiveRecommendationsView
          renderReadinessAnalytics={renderReadinessAnalytics}
        />
      </div>

      {/* HISTORY & COMPARISON SNAPSHOT MODAL */}
      <RecommendationSnapshotModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        snapshots={snapshots}
        currentSnapshot={recommendation}
        comparison={comparison}
        selectedBaselineId={selectedBaselineId}
        onSelectBaseline={selectBaselineForComparison}
        onDeleteSnapshot={deleteSnapshot}
      />
    </DashboardLayout>
  );
}
