import { NextResponse } from "next/server";
import { getReviewProvider } from "@/services/ai/aiFactory";
import { AiReviewRequest } from "@/services/ai/aiTypes";
import { aiReviewService } from "@/services/ai/aiReviewService";
import { reviewUsageService } from "@/services/ai/reviewUsageService";

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

    // Weekly Quota Enforcement Check
    if (!reviewUsageService.canGenerateReview()) {
      const quotaStatus = reviewUsageService.getQuotaStatus();
      return NextResponse.json(
        {
          error: "Weekly AI Review quota exceeded",
          code: "QUOTA_EXCEEDED",
          quotaStatus
        },
        { status: 429 }
      );
    }

    const provider = getReviewProvider();
    const review = await provider.generateReview(body);

    // Record token usage if present
    if (review && review.usage) {
      reviewUsageService.recordReviewUsage(review.usage);
    }

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
