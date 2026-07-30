import { AiReviewRequest, AiReviewResponse, ReviewSession } from "./aiTypes";
import { FallbackAiProvider } from "./providers/fallbackProvider";

export class AiReviewService {
  private fallback = new FallbackAiProvider();

  /**
   * Validates submitted source code before sending to AI provider.
   */
  validateSourceCode(code: string, language?: string): { isValid: boolean; error?: string } {
    if (language) {
      // Language metadata noted for future parser rules
    }
    if (!code || typeof code !== "string") {
      return { isValid: false, error: "No code provided. Please paste source code or upload a code file." };
    }

    const trimmed = code.trim();

    if (trimmed.length === 0) {
      return { isValid: false, error: "Uploaded code is empty. Please enter valid source code." };
    }

    if (trimmed.length < 5) {
      return { isValid: false, error: "Uploaded content is too short to be valid source code." };
    }

    // Check for binary / unprintable non-text characters (e.g., null bytes or excessive non-printable chars)
    let nonPrintableCount = 0;
    for (let i = 0; i < Math.min(trimmed.length, 500); i++) {
      const codePoint = trimmed.charCodeAt(i);
      // Allow standard whitespace: tab (9), LF (10), CR (13), printable range [32..126]
      if (codePoint !== 9 && codePoint !== 10 && codePoint !== 13 && (codePoint < 32 || codePoint === 127)) {
        nonPrintableCount++;
      }
    }

    if (nonPrintableCount > 3) {
      return { isValid: false, error: "Uploaded file contains binary or unprintable data. Please upload a plain text source file." };
    }

    return { isValid: true };
  }

  /**
   * Factory to initialize a ReviewSession model.
   */
  createReviewSession(
    code: string,
    language: string,
    problemDetails?: { problemTitle?: string; problemUrl?: string; problemStatement?: string }
  ): ReviewSession {
    const randomHex = Math.random().toString(36).substring(2, 9);
    const sessionId = `rev_${Date.now()}_${randomHex}`;
    return {
      sessionId,
      uploadedCode: code,
      language,
      uploadedAt: new Date().toISOString(),
      problemTitle: problemDetails?.problemTitle,
      problemUrl: problemDetails?.problemUrl,
      problemStatement: problemDetails?.problemStatement
    };
  }

  /**
   * Evaluates solution code for a given category.
   */
  async generateReview(request: AiReviewRequest): Promise<AiReviewResponse> {
    const validation = this.validateSourceCode(request.code, request.language);
    if (!validation.isValid) {
      throw new Error(validation.error || "Invalid source code input");
    }

    // Ensure request has a session ID
    const enrichedRequest: AiReviewRequest = {
      ...request,
      sessionId: request.sessionId || `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    };

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enrichedRequest)
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }

      const data = await response.json();
      if (data && data.review && (data.review.overallFeedback || data.review.summary)) {
        return data.review;
      }
      throw new Error("Invalid review payload from API");
    } catch (err) {
      console.warn("AiReviewService client call failed, using fallback reviewer:", err);
      return this.fallback.generateReview(enrichedRequest);
    }
  }
}

export const aiReviewService = new AiReviewService();
