import { NextResponse } from "next/server";
import { getRecommendationProvider } from "@/services/ai/aiFactory";
import { AiRecommendationRequest } from "@/services/ai/aiTypes";

interface RecommendationMetaExt {
  recommendationReason?: string;
  strengthsMatched?: string[];
  suggestedLearningOrder?: string[];
}

export async function POST(req: Request) {
  try {
    const body: AiRecommendationRequest = await req.json();

    if (!body || !body.candidateProblems || !Array.isArray(body.candidateProblems)) {
      return NextResponse.json(
        { error: "Invalid candidateProblems list" },
        { status: 400 }
      );
    }

    const provider = getRecommendationProvider();
    const recommendations = await provider.rankRecommendations(body);
    const meta = recommendations as unknown as RecommendationMetaExt;

    const recommendationReason =
      meta.recommendationReason ||
      `Curated practice problem set matching ${body.selectedTopics?.join(", ") || "selected topics"}.`;
    const strengthsMatched =
      meta.strengthsMatched || body.selectedTopics || [];
    const suggestedLearningOrder =
      meta.suggestedLearningOrder || [];

    return NextResponse.json({
      recommendations,
      recommendationReason,
      strengthsMatched,
      suggestedLearningOrder
    });
  } catch (error) {
    console.error("API /api/recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to rank recommendations" },
      { status: 500 }
    );
  }
}
