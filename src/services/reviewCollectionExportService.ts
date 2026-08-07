/**
 * reviewCollectionExportService.ts
 *
 * Exports an entire collection of ReviewHistoryEntry items.
 * Formats: PDF (jsPDF + autoTable landscape), Markdown (.md), Text (.txt), JSON (.json).
 *
 * Standalone export service. Zero AI provider or history storage dependencies.
 */

import { ReviewCollection, CollectionStats } from "./collectionTypes";
import { ReviewHistoryEntry, ReviewCategory } from "@/services/ai/aiTypes";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CATEGORY_LABELS: Record<ReviewCategory, string> = {
  OPTIMAL_COMPLEXITY: "Optimal Complexity",
  OPTIMAL_HINTS: "Optimal Hints",
  OPTIMAL_FULL_SOLUTION: "Optimal Full Solution",
  MY_COMPLEXITY: "My Complexity",
  CORRECTNESS_CHECK: "Correctness Check",
  EDGE_CASE_ANALYSIS: "Edge Case Analysis",
  MY_HINTS: "My Hints",
  FULL_CODE_REVIEW: "Full Code Review",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

function buildStem(col: ReviewCollection): string {
  const nameSlug = col.name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `collection-${nameSlug}-${yyyy}-${mm}-${dd}`;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── PDF Export ───────────────────────────────────────────────────────────────

export function exportCollectionPDF(
  collection: ReviewCollection,
  entries: ReviewHistoryEntry[],
  stats: CollectionStats
): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;
  const ML = 12;

  // Title Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, W, 26, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(`Collection: ${collection.name}`, ML, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(
    `${collection.description || "Saved AI Review Collection"} · ${entries.length} Review(s)`,
    ML,
    20
  );

  let y = 32;

  // Stats Table
  autoTable(doc, {
    startY: y,
    head: [["Total Reviews", "Languages", "Categories Covered", "Avg Tokens", "Avg Duration"]],
    body: [
      [
        String(stats.totalReviews),
        stats.languagesUsed.join(", ") || "—",
        stats.categoriesCovered.map((c) => CATEGORY_LABELS[c as ReviewCategory] || c).join(", ") || "—",
        stats.avgTokens.toLocaleString(),
        `${(stats.avgDurationMs / 1000).toFixed(2)}s`,
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [14, 116, 144], textColor: 255, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: ML, right: ML },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // Summary Table of Entries
  autoTable(doc, {
    startY: y,
    head: [["#", "Date", "Category", "Language", "Model", "Tokens", "Duration"]],
    body: entries.map((e, idx) => [
      String(idx + 1),
      formatDate(e.timestamp),
      CATEGORY_LABELS[e.category] || e.category,
      e.language,
      e.model,
      String(e.usage?.totalTokens ?? "—"),
      `${(e.durationMs / 1000).toFixed(2)}s`,
    ]),
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: ML, right: ML },
  });

  // Page Numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${totalPages}`, W / 2, H - 6, { align: "center" });
  }

  doc.save(`${buildStem(collection)}.pdf`);
}

// ─── Markdown Export ──────────────────────────────────────────────────────────

export function exportCollectionMarkdown(
  collection: ReviewCollection,
  entries: ReviewHistoryEntry[],
  stats: CollectionStats
): void {
  const lines: string[] = [];

  lines.push(`# Collection: ${collection.name}`);
  lines.push("");
  if (collection.description) {
    lines.push(`> ${collection.description}`);
    lines.push("");
  }
  lines.push(`- **Exported**: ${new Date().toLocaleString()}`);
  lines.push(`- **Total Reviews**: ${stats.totalReviews}`);
  lines.push(`- **Languages**: ${stats.languagesUsed.join(", ") || "—"}`);
  lines.push(`- **Avg Tokens**: ${stats.avgTokens.toLocaleString()}`);
  lines.push(`- **Avg Duration**: ${(stats.avgDurationMs / 1000).toFixed(2)}s`);
  lines.push("");

  lines.push("## Contained Reviews");
  lines.push("");

  entries.forEach((e, idx) => {
    lines.push(`### ${idx + 1}. ${CATEGORY_LABELS[e.category] || e.category} (${e.language})`);
    lines.push("");
    lines.push(`- **Date**: ${formatDate(e.timestamp)}`);
    lines.push(`- **Model**: ${e.model}`);
    lines.push(`- **Tokens**: ${e.usage?.totalTokens ?? "—"}`);
    lines.push(`- **Duration**: ${(e.durationMs / 1000).toFixed(2)}s`);
    lines.push("");
    lines.push("#### Code");
    lines.push(`\`\`\`${e.language.toLowerCase()}`);
    lines.push(e.code.trim());
    lines.push("```");
    lines.push("");
    lines.push("#### Overall Feedback");
    lines.push(e.response.overallFeedback);
    lines.push("");
    if (e.response.optimizationSuggestions.length > 0) {
      lines.push("#### Optimization Suggestions");
      e.response.optimizationSuggestions.forEach((s) => lines.push(`- ${s}`));
      lines.push("");
    }
    lines.push("---");
    lines.push("");
  });

  const content = lines.join("\n");
  downloadBlob(new Blob([content], { type: "text/markdown;charset=utf-8" }), `${buildStem(collection)}.md`);
}

// ─── Plain Text Export ────────────────────────────────────────────────────────

export function exportCollectionText(
  collection: ReviewCollection,
  entries: ReviewHistoryEntry[],
  stats: CollectionStats
): void {
  const lines: string[] = [];

  lines.push("================================================================================");
  lines.push(`COLLECTION: ${collection.name.toUpperCase()}`);
  lines.push("================================================================================");
  if (collection.description) {
    lines.push(`Description: ${collection.description}`);
  }
  lines.push(`Exported: ${new Date().toLocaleString()}`);
  lines.push(`Total Reviews: ${stats.totalReviews}`);
  lines.push(`Languages: ${stats.languagesUsed.join(", ") || "—"}`);
  lines.push(`Avg Tokens: ${stats.avgTokens.toLocaleString()}`);
  lines.push(`Avg Duration: ${(stats.avgDurationMs / 1000).toFixed(2)}s`);
  lines.push("================================================================================");
  lines.push("");

  entries.forEach((e, idx) => {
    lines.push(`REVIEW ${idx + 1}: ${CATEGORY_LABELS[e.category] || e.category} [${e.language}]`);
    lines.push(`Date: ${formatDate(e.timestamp)} | Model: ${e.model}`);
    lines.push(`Tokens: ${e.usage?.totalTokens ?? "—"} | Duration: ${(e.durationMs / 1000).toFixed(2)}s`);
    lines.push("--------------------------------------------------------------------------------");
    lines.push("Submitted Code:");
    lines.push(e.code.trim());
    lines.push("");
    lines.push("Overall Feedback:");
    lines.push(e.response.overallFeedback);
    lines.push("");
    if (e.response.optimizationSuggestions.length > 0) {
      lines.push("Optimization Suggestions:");
      e.response.optimizationSuggestions.forEach((s, i) => lines.push(`  ${i + 1}. ${s}`));
      lines.push("");
    }
    lines.push("================================================================================");
    lines.push("");
  });

  downloadBlob(new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }), `${buildStem(collection)}.txt`);
}

// ─── JSON Export ──────────────────────────────────────────────────────────────

export function exportCollectionJSON(collection: ReviewCollection, entries: ReviewHistoryEntry[]): void {
  const data = {
    collection: {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      color: collection.color,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    },
    exportedAt: new Date().toISOString(),
    reviewCount: entries.length,
    reviews: entries,
  };

  const jsonStr = JSON.stringify(data, null, 2);
  downloadBlob(new Blob([jsonStr], { type: "application/json;charset=utf-8" }), `${buildStem(collection)}.json`);
}
