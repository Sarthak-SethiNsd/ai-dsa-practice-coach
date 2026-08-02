/**
 * GET  /api/review/history  — Returns all review summaries, newest first.
 * DELETE /api/review/history — Clears all history.
 *
 * NOTE: reviewHistoryStorage uses localStorage (client-side only).
 * These routes are architectural stubs; for V1 the UI reads storage directly.
 * Replace LocalStorageReviewHistoryStorage with a DB-backed implementation
 * to make these routes fully functional server-side.
 */
import { NextResponse } from "next/server";

export async function GET() {
  // Server-side: localStorage is unavailable; return empty array.
  // The real data is served by the client-side useReviewHistory hook.
  return NextResponse.json({ summaries: [] });
}

export async function DELETE() {
  // Server-side: localStorage is unavailable; clearing is performed client-side.
  return NextResponse.json({ success: true });
}
