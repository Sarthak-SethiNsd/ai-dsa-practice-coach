/**
 * reviewCompareExportService.ts
 *
 * Exports a side-by-side comparison of two ReviewHistoryEntry objects.
 * Three formats: PDF (jsPDF + autotable), Markdown, Plain Text.
 *
 * Zero AI imports. Zero history storage imports. Completely standalone.
 */

import { ReviewHistoryEntry, ReviewCategory } from "@/services/ai/aiTypes";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Category Labels ──────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<ReviewCategory, string> = {
  OPTIMAL_COMPLEXITY:    "Optimal Complexity",
  OPTIMAL_HINTS:         "Optimal Hints",
  OPTIMAL_FULL_SOLUTION: "Optimal Full Solution",
  MY_COMPLEXITY:         "My Complexity",
  CORRECTNESS_CHECK:     "Correctness Check",
  EDGE_CASE_ANALYSIS:    "Edge Case Analysis",
  MY_HINTS:              "My Hints",
  FULL_CODE_REVIEW:      "Full Code Review",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });
}

function buildStem(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const dd   = String(d.getDate()).padStart(2, "0");
  const hh   = String(d.getHours()).padStart(2, "0");
  const min  = String(d.getMinutes()).padStart(2, "0");
  return `review-comparison-${yyyy}-${mm}-${dd}-${hh}${min}`;
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

// ─── PDF constants ────────────────────────────────────────────────────────────

const PG = {
  W: 297,      // A4 landscape mm
  H: 210,
  ML: 12,
  MR: 12,
  CONTENT_W: 297 - 24,
  COL_W: (297 - 24 - 4) / 2, // two columns with 4mm gutter
};

function addPageNumbers(doc: jsPDF): void {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${total}`, PG.W / 2, PG.H - 6, { align: "center" });
  }
}

function ensurePageSpace(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > PG.H - 15) {
    doc.addPage();
    return 18;
  }
  return y;
}

function addSectionHeading(doc: jsPDF, text: string, y: number): number {
  y = ensurePageSpace(doc, y, 14);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(14, 116, 144);
  doc.text(text, PG.ML, y);
  doc.setDrawColor(14, 116, 144);
  doc.setLineWidth(0.3);
  doc.line(PG.ML, y + 1.5, PG.W - PG.MR, y + 1.5);
  return y + 8;
}

function addColumnHeaders(doc: jsPDF, y: number, leftLabel: string, rightLabel: string): number {
  const midX = PG.ML + PG.COL_W + 4;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);

  doc.setFillColor(14, 116, 144);
  doc.roundedRect(PG.ML, y, PG.COL_W, 7, 1, 1, "F");
  doc.text(leftLabel, PG.ML + 3, y + 4.5);

  doc.setFillColor(79, 70, 229);
  doc.roundedRect(midX, y, PG.COL_W, 7, 1, 1, "F");
  doc.text(rightLabel, midX + 3, y + 4.5);

  return y + 10;
}

function addSideBySideText(doc: jsPDF, leftText: string, rightText: string, y: number): number {
  const midX = PG.ML + PG.COL_W + 4;
  const maxW = PG.COL_W - 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);

  const lLines = doc.splitTextToSize(leftText || "—", maxW);
  const rLines = doc.splitTextToSize(rightText || "—", maxW);
  const maxLines = Math.max(lLines.length, rLines.length);
  const blockH = maxLines * 4.2 + 6;

  y = ensurePageSpace(doc, y, blockH + 2);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.roundedRect(PG.ML, y, PG.COL_W, blockH, 1.5, 1.5, "FD");
  doc.roundedRect(midX, y, PG.COL_W, blockH, 1.5, 1.5, "FD");

  lLines.forEach((line: string, i: number) => {
    doc.text(line, PG.ML + 3, y + 4 + i * 4.2);
  });
  rLines.forEach((line: string, i: number) => {
    doc.text(line, midX + 3, y + 4 + i * 4.2);
  });

  return y + blockH + 3;
}

function addSideBySideCode(doc: jsPDF, leftCode: string, rightCode: string, y: number): number {
  const midX = PG.ML + PG.COL_W + 4;
  const maxW = PG.COL_W - 6;

  doc.setFont("courier", "normal");
  doc.setFontSize(7);
  doc.setTextColor(200, 200, 220);

  const lLines = doc.splitTextToSize(leftCode || "(none)", maxW);
  const rLines = doc.splitTextToSize(rightCode || "(none)", maxW);
  const maxLines = Math.max(lLines.length, rLines.length);
  const blockH = Math.min(maxLines * 4 + 6, PG.H - y - 20);

  y = ensurePageSpace(doc, y, blockH + 2);

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(PG.ML, y, PG.COL_W, blockH, 1.5, 1.5, "F");
  doc.roundedRect(midX, y, PG.COL_W, blockH, 1.5, 1.5, "F");

  lLines.slice(0, Math.floor((blockH - 6) / 4)).forEach((line: string, i: number) => {
    doc.text(line, PG.ML + 3, y + 4.5 + i * 4);
  });
  rLines.slice(0, Math.floor((blockH - 6) / 4)).forEach((line: string, i: number) => {
    doc.text(line, midX + 3, y + 4.5 + i * 4);
  });

  return y + blockH + 4;
}

// ─── PDF Export ───────────────────────────────────────────────────────────────

export function exportComparisonPDF(left: ReviewHistoryEntry, right: ReviewHistoryEntry): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const lR = left.response;
  const rR = right.response;

  // Cover header
  doc.setFillColor(14, 116, 144);
  doc.rect(0, 0, PG.W, 24, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text("AI Review Comparison", PG.ML, 11);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(186, 230, 253);
  doc.text(`Generated ${new Date().toLocaleString()}`, PG.ML, 18);

  let y = 32;
  const leftLabel  = `Review A · ${CATEGORY_LABELS[left.category]}`;
  const rightLabel = `Review B · ${CATEGORY_LABELS[right.category]}`;

  // ── Metadata Table ──────────────────────────────────────────────────────────
  y = addSectionHeading(doc, "Metadata Comparison", y);

  autoTable(doc, {
    startY: y,
    head: [["Field", "Review A", "Review B"]],
    body: [
      ["Date",      formatDate(left.timestamp), formatDate(right.timestamp)],
      ["Language",  left.language,              right.language],
      ["Category",  CATEGORY_LABELS[left.category], CATEGORY_LABELS[right.category]],
      ["Provider",  left.model,                 right.model],
      ["Tokens",    String(left.usage?.totalTokens ?? "—"),  String(right.usage?.totalTokens ?? "—")],
      ["Duration",  `${(left.durationMs / 1000).toFixed(2)}s`, `${(right.durationMs / 1000).toFixed(2)}s`],
    ],
    theme: "grid",
    headStyles: { fillColor: [14, 116, 144], textColor: 255, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 32 } },
    margin: { left: PG.ML, right: PG.MR },
    tableLineColor: [200, 200, 210],
    tableLineWidth: 0.2,
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // ── Submitted Code ──────────────────────────────────────────────────────────
  y = ensurePageSpace(doc, y, 20);
  y = addSectionHeading(doc, "Submitted Code", y);
  y = addColumnHeaders(doc, y, leftLabel, rightLabel);
  y = addSideBySideCode(doc, left.code, right.code, y);

  // ── AI Review Fields ────────────────────────────────────────────────────────
  const textFields: Array<{ title: string; lVal: string; rVal: string }> = [
    { title: "Summary",             lVal: lR.summary ?? "",          rVal: rR.summary ?? "" },
    { title: "Overall Feedback",    lVal: lR.overallFeedback,        rVal: rR.overallFeedback },
    { title: "Correctness Analysis",lVal: lR.correctnessAnalysis,    rVal: rR.correctnessAnalysis },
    { title: "Time Complexity",     lVal: lR.timeComplexity,         rVal: rR.timeComplexity },
    { title: "Space Complexity",    lVal: lR.spaceComplexity,        rVal: rR.spaceComplexity },
  ];

  for (const { title, lVal, rVal } of textFields) {
    y = ensurePageSpace(doc, y, 20);
    y = addSectionHeading(doc, title, y);
    y = addColumnHeaders(doc, y, leftLabel, rightLabel);
    y = addSideBySideText(doc, lVal, rVal, y);
  }

  // ── Lists ───────────────────────────────────────────────────────────────────
  const listFields: Array<{ title: string; lItems: string[]; rItems: string[] }> = [
    { title: "Optimization Suggestions", lItems: lR.optimizationSuggestions, rItems: rR.optimizationSuggestions },
    { title: "Edge Cases",               lItems: lR.edgeCases,               rItems: rR.edgeCases },
    { title: "Learning Tips",            lItems: lR.learningTips,             rItems: rR.learningTips },
  ];

  for (const { title, lItems, rItems } of listFields) {
    const lText = lItems.map((s, i) => `${i + 1}. ${s}`).join("\n") || "(none)";
    const rText = rItems.map((s, i) => `${i + 1}. ${s}`).join("\n") || "(none)";
    y = ensurePageSpace(doc, y, 20);
    y = addSectionHeading(doc, title, y);
    y = addColumnHeaders(doc, y, leftLabel, rightLabel);
    y = addSideBySideText(doc, lText, rText, y);
  }

  // ── Optimal Code ────────────────────────────────────────────────────────────
  if (lR.optimalCode || rR.optimalCode) {
    y = ensurePageSpace(doc, y, 20);
    y = addSectionHeading(doc, "Optimal Reference Solution", y);
    y = addColumnHeaders(doc, y, leftLabel, rightLabel);
    y = addSideBySideCode(doc, lR.optimalCode ?? "(not available)", rR.optimalCode ?? "(not available)", y);
  }

  addPageNumbers(doc);
  doc.save(`${buildStem()}.pdf`);
}

// ─── Markdown Export ──────────────────────────────────────────────────────────

export function exportComparisonMarkdown(left: ReviewHistoryEntry, right: ReviewHistoryEntry): void {
  const lR = left.response;
  const rR = right.response;

  const lines: string[] = [];

  lines.push("# AI Review Comparison");
  lines.push("");
  lines.push(`> Generated ${new Date().toLocaleString()}`);
  lines.push("");

  // Metadata
  lines.push("## Metadata");
  lines.push("");
  lines.push("| Field | Review A | Review B |");
  lines.push("|---|---|---|");
  lines.push(`| **Date** | ${formatDate(left.timestamp)} | ${formatDate(right.timestamp)} |`);
  lines.push(`| **Language** | ${left.language} | ${right.language} |`);
  lines.push(`| **Category** | ${CATEGORY_LABELS[left.category]} | ${CATEGORY_LABELS[right.category]} |`);
  lines.push(`| **Provider** | ${left.model} | ${right.model} |`);
  lines.push(`| **Total Tokens** | ${left.usage?.totalTokens ?? "—"} | ${right.usage?.totalTokens ?? "—"} |`);
  lines.push(`| **Duration** | ${(left.durationMs / 1000).toFixed(2)}s | ${(right.durationMs / 1000).toFixed(2)}s |`);
  lines.push("");

  // Helper for side-by-side text sections
  const addMdSection = (title: string, lVal: string | undefined, rVal: string | undefined) => {
    lines.push(`## ${title}`);
    lines.push("");
    lines.push("### Review A");
    lines.push("");
    lines.push(lVal?.trim() || "_Not available_");
    lines.push("");
    lines.push("### Review B");
    lines.push("");
    lines.push(rVal?.trim() || "_Not available_");
    lines.push("");
  };

  const addMdCodeSection = (title: string, lCode: string | undefined, rCode: string | undefined, lang: string) => {
    lines.push(`## ${title}`);
    lines.push("");
    lines.push("### Review A");
    lines.push("");
    lines.push(`\`\`\`${lang}`);
    lines.push(lCode?.trim() || "(none)");
    lines.push("```");
    lines.push("");
    lines.push("### Review B");
    lines.push("");
    lines.push(`\`\`\`${lang}`);
    lines.push(rCode?.trim() || "(none)");
    lines.push("```");
    lines.push("");
  };

  const addMdListSection = (title: string, lItems: string[], rItems: string[]) => {
    lines.push(`## ${title}`);
    lines.push("");
    lines.push("### Review A");
    lines.push("");
    if (lItems.length > 0) lItems.forEach(i => lines.push(`- ${i}`));
    else lines.push("_None_");
    lines.push("");
    lines.push("### Review B");
    lines.push("");
    if (rItems.length > 0) rItems.forEach(i => lines.push(`- ${i}`));
    else lines.push("_None_");
    lines.push("");
  };

  const codeLang = left.language.toLowerCase();

  addMdCodeSection("Submitted Code", left.code, right.code, codeLang);
  addMdSection("Summary", lR.summary, rR.summary);
  addMdSection("Overall Feedback", lR.overallFeedback, rR.overallFeedback);
  addMdSection("Correctness Analysis", lR.correctnessAnalysis, rR.correctnessAnalysis);
  addMdSection("Time Complexity", lR.timeComplexity, rR.timeComplexity);
  addMdSection("Space Complexity", lR.spaceComplexity, rR.spaceComplexity);
  addMdListSection("Optimization Suggestions", lR.optimizationSuggestions, rR.optimizationSuggestions);
  addMdListSection("Edge Cases", lR.edgeCases, rR.edgeCases);
  addMdListSection("Learning Tips", lR.learningTips, rR.learningTips);

  if (lR.hints?.length || rR.hints?.length) {
    addMdListSection("Progressive Hints", lR.hints ?? [], rR.hints ?? []);
  }
  if (lR.optimalCode || rR.optimalCode) {
    addMdCodeSection("Optimal Reference Solution", lR.optimalCode, rR.optimalCode, codeLang);
  }

  const content = lines.join("\n");
  downloadBlob(new Blob([content], { type: "text/markdown;charset=utf-8" }), `${buildStem()}.md`);
}

// ─── Plain Text Export ────────────────────────────────────────────────────────

function sep(char = "=", len = 80): string { return char.repeat(len); }
function sec(title: string): string { return `\n${sep()}\n${title.toUpperCase()}\n${sep()}\n`; }
function sub(title: string): string { return `\n${title}\n${"-".repeat(title.length)}\n`; }

export function exportComparisonText(left: ReviewHistoryEntry, right: ReviewHistoryEntry): void {
  const lR = left.response;
  const rR = right.response;
  const lines: string[] = [];

  lines.push("AI REVIEW COMPARISON");
  lines.push(sep());
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push("");

  lines.push(sec("Metadata"));
  const meta = [
    ["Date",      formatDate(left.timestamp),                       formatDate(right.timestamp)],
    ["Language",  left.language,                                    right.language],
    ["Category",  CATEGORY_LABELS[left.category],                   CATEGORY_LABELS[right.category]],
    ["Provider",  left.model,                                       right.model],
    ["Tokens",    String(left.usage?.totalTokens ?? "—"),           String(right.usage?.totalTokens ?? "—")],
    ["Duration",  `${(left.durationMs / 1000).toFixed(2)}s`,       `${(right.durationMs / 1000).toFixed(2)}s`],
  ];
  meta.forEach(([field, lv, rv]) => {
    lines.push(`  ${field.padEnd(12)}: Review A = ${lv}`);
    lines.push(`  ${" ".repeat(12)}  Review B = ${rv}`);
    lines.push("");
  });

  const addTxtSection = (title: string, lVal: string | undefined, rVal: string | undefined) => {
    lines.push(sec(title));
    lines.push(sub("Review A"));
    lines.push(lVal?.trim() || "(not available)");
    lines.push(sub("Review B"));
    lines.push(rVal?.trim() || "(not available)");
    lines.push("");
  };

  const addTxtList = (title: string, lItems: string[], rItems: string[]) => {
    lines.push(sec(title));
    lines.push(sub("Review A"));
    if (lItems.length > 0) lItems.forEach((item, i) => lines.push(`  ${i + 1}. ${item}`));
    else lines.push("  (none)");
    lines.push(sub("Review B"));
    if (rItems.length > 0) rItems.forEach((item, i) => lines.push(`  ${i + 1}. ${item}`));
    else lines.push("  (none)");
    lines.push("");
  };

  addTxtSection("Submitted Code",      left.code,              right.code);
  addTxtSection("Summary",             lR.summary,             rR.summary);
  addTxtSection("Overall Feedback",    lR.overallFeedback,     rR.overallFeedback);
  addTxtSection("Correctness Analysis",lR.correctnessAnalysis, rR.correctnessAnalysis);
  addTxtSection("Time Complexity",     lR.timeComplexity,      rR.timeComplexity);
  addTxtSection("Space Complexity",    lR.spaceComplexity,     rR.spaceComplexity);
  addTxtList("Optimization Suggestions", lR.optimizationSuggestions, rR.optimizationSuggestions);
  addTxtList("Edge Cases",               lR.edgeCases,               rR.edgeCases);
  addTxtList("Learning Tips",            lR.learningTips,             rR.learningTips);

  if (lR.hints?.length || rR.hints?.length) {
    addTxtList("Progressive Hints", lR.hints ?? [], rR.hints ?? []);
  }
  if (lR.optimalCode || rR.optimalCode) {
    addTxtSection("Optimal Reference Solution", lR.optimalCode, rR.optimalCode);
  }

  lines.push(sep());
  lines.push("Generated by DSA AI Coach — Review Comparison Export");
  lines.push(sep());

  downloadBlob(new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }), `${buildStem()}.txt`);
}
