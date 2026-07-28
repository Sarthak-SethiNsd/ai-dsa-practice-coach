import { AiReviewRequest, AiReviewResponse } from "./aiTypes";
import { FallbackAiProvider } from "./providers/fallbackProvider";

export class AiReviewService {
  private fallback = new FallbackAiProvider();

  /**
   * Evaluates solution code along with optional problem statement/link.
   */
  async generateReview(request: AiReviewRequest): Promise<AiReviewResponse> {
    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }

      const data = await response.json();
      if (data && data.review && data.review.overallFeedback) {
        return data.review;
      }
      throw new Error("Invalid review payload from API");
    } catch (err) {
      console.warn("AiReviewService client call failed, using fallback reviewer:", err);
      return this.fallback.generateReview(request);
    }
  }
}

export const aiReviewService = new AiReviewService();
