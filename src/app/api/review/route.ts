import { NextResponse } from "next/server";
import { getReviewProvider } from "@/services/ai/aiFactory";
import { AiReviewRequest } from "@/services/ai/aiTypes";
import { aiReviewService } from "@/services/ai/aiReviewService";

export async function POST(req: Request) {
  try {
    const body: AiReviewRequest = await req.json();

    if (!body || !body.code) {
      return NextResponse.json(
        { error: "Missing source code in review request" },
        { status: 400 }
      );
    }

    const validation = aiReviewService.validateSourceCode(body.code, body.language);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || "Invalid source code" },
        { status: 400 }
      );
    }

    const provider = getReviewProvider();
    const review = await provider.generateReview(body);

    const response = NextResponse.json({ review });
    response.headers.set("X-AI-Service", "ReviewAI");
    return response;
  } catch (error) {
    console.error("API /api/review error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI code review" },
      { status: 500 }
    );
  }
}
