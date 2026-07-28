import { NextResponse } from "next/server";
import { getRecommendationProvider } from "@/services/ai/aiFactory";
import { AiRecommendationRequest } from "@/services/ai/aiTypes";

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

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("API /api/recommendations error:", error);
    return NextResponse.json(
      { error: "Failed to rank recommendations" },
      { status: 500 }
    );
  }
}
