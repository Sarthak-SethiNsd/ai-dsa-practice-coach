import { NextResponse } from "next/server";
import { reviewUsageService } from "@/services/ai/reviewUsageService";

export async function GET() {
  try {
    const quotaStatus = reviewUsageService.getQuotaStatus();
    return NextResponse.json(quotaStatus);
  } catch (error) {
    console.error("API GET /api/review/usage error:", error);
    return NextResponse.json(
      { error: "Failed to fetch review quota status" },
      { status: 500 }
    );
  }
}
