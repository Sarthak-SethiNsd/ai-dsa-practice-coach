/**
 * GET    /api/review/history/:id — Returns a single review entry.
 * DELETE /api/review/history/:id — Deletes a single review entry.
 *
 * See /api/review/history/route.ts for V1 architecture note.
 */
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing review id" }, { status: 400 });
  }
  // Server-side: localStorage unavailable; return 404.
  // Client-side hook uses reviewHistoryStorage.getById() directly.
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing review id" }, { status: 400 });
  }
  // Deletion is performed client-side via reviewHistoryStorage.deleteById().
  return NextResponse.json({ success: true });
}
