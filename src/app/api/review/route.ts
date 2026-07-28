import { NextResponse } from "next/server";
import { getReviewProvider } from "@/services/ai/aiFactory";
import { AiReviewRequest } from "@/services/ai/aiTypes";

export async function POST(req: Request) {
  try {
    const body: AiReviewRequest = await req.json();

    if (!body || !body.code || !body.problemTitle) {
      return NextResponse.json(
        { error: "Missing code or problemTitle in review request" },
        { status: 400 }
      );
    }

    const provider = getReviewProvider();
    const review = await provider.generateReview(body);

    return NextResponse.json({ review });
  } catch (error) {
    console.error("API /api/review error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI code review" },
      { status: 500 }
    );
  }
}
