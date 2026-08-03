/**
 * reviewExportService.ts
 *
 * Standalone export service for AI Review entries.
 * Accepts ReviewHistoryEntry exclusively.
 *
 * Exports three formats:
 *   - PDF  (via jsPDF + jspdf-autotable)
 *   - Markdown (.md)
 *   - Plain Text (.txt)
 *
 * Zero imports from: AI providers, generators, history UI, recommendation code.
 */

import { ReviewHistoryEntry, ReviewCategory } from "@/services/ai/aiTypes";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Category labels ──────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<ReviewCategory, string> = {
  OPTIMAL_COMPLEXITY:     "Optimal Complexity",
  OPTIMAL_HINTS:          "Optimal Hints",
  OPTIMAL_FULL_SOLUTION:  "Optimal Full Solution",
  MY_COMPLEXITY:          "My Complexity",
  CORRECTNESS_CHECK:      "Correctness Check",
  EDGE_CASE_ANALYSIS:     "Edge Case Analysis",
  MY_HINTS:               "My Hints",
  FULL_CODE_REVIEW:       "Full Code Review",
};

// ─── File naming ──────────────────────────────────────────────────────────────

/**
 * Generates a filename stem like "review-full-code-review-2026-08-03-1945"
 */
function buildFileStem(entry: ReviewHistoryEntry): string {
  const categorySlug = CATEGORY_LABELS[entry.category]
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const d = new Date(entry.timestamp);
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const dd   = String(d.getDate()).padStart(2, "0");
  const hh   = String(d.getHours()).padStart(2, "0");
  const min  = String(d.getMinutes()).padStart(2, "0");

  return `review-${categorySlug}-${yyyy}-${mm}-${dd}-${hh}${min}`;
}

// ─── Browser download helper ──────────────────────────────────────────────────

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

// ─── Shared metadata rows builder ────────────────────────────────────────────

interface MetaRow { label: string; value: string }

function buildMetaRows(entry: ReviewHistoryEntry): MetaRow[] {
  const d = new Date(entry.timestamp);
  const rows: MetaRow[] = [
    { label: "Review Category",   value: CATEGORY_LABELS[entry.category] },
    { label: "Problem",           value: entry.problemTitle ?? "—" },
    { label: "Language",          value: entry.language },
    { label: "Timestamp",         value: d.toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" }) },
    { label: "AI Provider",       value: entry.model },
    { label: "Total Tokens",      value: entry.usage?.totalTokens?.toLocaleString()    ?? "—" },
    { label: "Prompt Tokens",     value: entry.usage?.promptTokens?.toLocaleString()   ?? "—" },
    { label: "Completion Tokens", value: entry.usage?.completionTokens?.toLocaleString() ?? "—" },
    { label: "Response Duration", value: `${(entry.durationMs / 1000).toFixed(2)} s` },
  ];
  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF Export
// ─────────────────────────────────────────────────────────────────────────────

/** Point size helpers */
const PTS = {
  PAGE_W:    210,   // A4 mm
  PAGE_H:    297,
  MARGIN_L:  14,
  MARGIN_R:  14,
  CONTENT_W: 210 - 14 - 14,
};

/** Adds a section heading and returns the new Y position */
function addHeading(doc: jsPDF, text: string, y: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text(text, PTS.MARGIN_L, y);
  doc.setDrawColor(180, 180, 200);
  doc.setLineWidth(0.3);
  doc.line(PTS.MARGIN_L, y + 1.5, PTS.PAGE_W - PTS.MARGIN_R, y + 1.5);
  return y + 8;
}

/** Adds body text with wrapping, returns new Y */
function addBodyText(doc: jsPDF, text: string, y: number): number {
  if (!text) return y;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const lines = doc.splitTextToSize(text, PTS.CONTENT_W);
  const lineH = 5;
  lines.forEach((line: string) => {
    if (y > PTS.PAGE_H - 20) { doc.addPage(); y = 20; }
    doc.text(line, PTS.MARGIN_L, y);
    y += lineH;
  });
  return y + 3;
}

/** Adds a monospace code block, returns new Y */
function addCodeBlock(doc: jsPDF, code: string, y: number): number {
  if (!code) return y;
  doc.setFont("courier", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(200, 200, 220);

  // Background box — drawn before text
  const lines = doc.splitTextToSize(code, PTS.CONTENT_W - 6);
  const blockH = Math.min(lines.length * 4.2 + 6, PTS.PAGE_H - y - 20);

  doc.setFillColor(20, 20, 40);
  doc.roundedRect(PTS.MARGIN_L, y, PTS.CONTENT_W, blockH, 2, 2, "F");

  let ty = y + 5;
  for (const line of lines) {
    if (ty > y + blockH - 4) break;   // stay within box
    if (ty > PTS.PAGE_H - 20) {
      doc.addPage();
      y = 20;
      ty = y + 5;
      doc.setFillColor(20, 20, 40);
      doc.roundedRect(PTS.MARGIN_L, y, PTS.CONTENT_W, Math.min(lines.length * 4.2 + 6, PTS.PAGE_H - 40), 2, 2, "F");
    }
    doc.text(line, PTS.MARGIN_L + 3, ty);
    ty += 4.2;
  }

  // If code didn't fit, add continuation on new pages
  const fittedLines = Math.floor((blockH - 6) / 4.2);
  if (lines.length > fittedLines) {
    let startIdx = fittedLines;
    while (startIdx < lines.length) {
      doc.addPage();
      const pageY = 20;
      const remainingLines = lines.slice(startIdx);
      const pageBlockH = Math.min(remainingLines.length * 4.2 + 6, PTS.PAGE_H - pageY - 20);
      doc.setFillColor(20, 20, 40);
      doc.roundedRect(PTS.MARGIN_L, pageY, PTS.CONTENT_W, pageBlockH, 2, 2, "F");
      doc.setTextColor(200, 200, 220);
      let lty = pageY + 5;
      for (let i = 0; i < remainingLines.length; i++) {
        if (lty > pageY + pageBlockH - 4) { startIdx += i; break; }
        if (i === remainingLines.length - 1) startIdx = lines.length;
        doc.text(remainingLines[i], PTS.MARGIN_L + 3, lty);
        lty += 4.2;
      }
      y = pageY + pageBlockH;
    }
    return y + 6;
  }

  return y + blockH + 6;
}

/** Adds a bullet list, returns new Y */
function addBulletList(doc: jsPDF, items: string[], y: number): number {
  if (!items || items.length === 0) return y;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  for (const item of items) {
    if (y > PTS.PAGE_H - 20) { doc.addPage(); y = 20; }
    const lines = doc.splitTextToSize(`• ${item}`, PTS.CONTENT_W - 4);
    lines.forEach((line: string, i: number) => {
      if (y > PTS.PAGE_H - 20) { doc.addPage(); y = 20; }
      doc.text(line, PTS.MARGIN_L + (i > 0 ? 4 : 0), y);
      y += 5;
    });
  }
  return y + 3;
}

/** Adds numbered hints, returns new Y */
function addNumberedList(doc: jsPDF, items: string[], y: number): number {
  if (!items || items.length === 0) return y;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  items.forEach((item, idx) => {
    const lines = doc.splitTextToSize(`${idx + 1}. ${item}`, PTS.CONTENT_W - 4);
    lines.forEach((line: string, i: number) => {
      if (y > PTS.PAGE_H - 20) { doc.addPage(); y = 20; }
      doc.text(line, PTS.MARGIN_L + (i > 0 ? 6 : 0), y);
      y += 5;
    });
  });
  return y + 3;
}

/** Adds page numbers to all pages */
function addPageNumbers(doc: jsPDF): void {
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${total}`,
      PTS.PAGE_W / 2,
      PTS.PAGE_H - 8,
      { align: "center" }
    );
  }
}

export function exportPDF(entry: ReviewHistoryEntry): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const review = entry.response;
  const metaRows = buildMetaRows(entry);

  // ── Cover / Title ─────────────────────────────────────────────────────────
  doc.setFillColor(14, 116, 144);   // sky-700
  doc.rect(0, 0, PTS.PAGE_W, 28, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("AI Code Review", PTS.MARGIN_L, 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(186, 230, 253);   // sky-200
  doc.text(CATEGORY_LABELS[entry.category], PTS.MARGIN_L, 21);

  let y = 38;

  // ── Section 1: Review Information ────────────────────────────────────────
  y = addHeading(doc, "Review Information", y);

  autoTable(doc, {
    startY: y,
    head: [["Field", "Value"]],
    body: metaRows.map(r => [r.label, r.value]),
    theme: "grid",
    headStyles: {
      fillColor: [14, 116, 144],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 30, 30],
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 52 },
      1: { cellWidth: "auto" },
    },
    margin: { left: PTS.MARGIN_L, right: PTS.MARGIN_R },
    tableLineColor: [200, 200, 210],
    tableLineWidth: 0.2,
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // ── Section 2: Source Code ────────────────────────────────────────────────
  if (y > PTS.PAGE_H - 40) { doc.addPage(); y = 20; }
  y = addHeading(doc, "Source Code", y);
  y = addCodeBlock(doc, entry.code, y);

  // ── Section 3: AI Review ─────────────────────────────────────────────────
  if (y > PTS.PAGE_H - 40) { doc.addPage(); y = 20; }
  y = addHeading(doc, "AI Review", y);

  if (review.summary) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    if (y > PTS.PAGE_H - 20) { doc.addPage(); y = 20; }
    doc.text("Summary", PTS.MARGIN_L, y); y += 5;
    y = addBodyText(doc, review.summary, y);
  }

  if (review.timeComplexity || review.spaceComplexity) {
    if (y > PTS.PAGE_H - 20) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(80, 80, 80);
    doc.text("Complexity", PTS.MARGIN_L, y); y += 5;
    y = addBodyText(doc, `Time: ${review.timeComplexity}   |   Space: ${review.spaceComplexity}`, y);
  }

  if (review.hints && review.hints.length > 0) {
    if (y > PTS.PAGE_H - 20) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(80, 80, 80);
    doc.text("Progressive Hints", PTS.MARGIN_L, y); y += 5;
    y = addNumberedList(doc, review.hints, y);
  }

  if (review.optimalCode) {
    if (y > PTS.PAGE_H - 40) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(80, 80, 80);
    doc.text("Optimal Reference Solution", PTS.MARGIN_L, y); y += 5;
    y = addCodeBlock(doc, review.optimalCode, y);
  }

  if (review.overallFeedback) {
    if (y > PTS.PAGE_H - 20) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(80, 80, 80);
    doc.text("Overall Evaluation", PTS.MARGIN_L, y); y += 5;
    y = addBodyText(doc, review.overallFeedback, y);
  }

  if (review.correctnessAnalysis) {
    if (y > PTS.PAGE_H - 20) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(80, 80, 80);
    doc.text("Correctness & Logic Audit", PTS.MARGIN_L, y); y += 5;
    y = addBodyText(doc, review.correctnessAnalysis, y);
  }

  if (review.edgeCases && review.edgeCases.length > 0) {
    if (y > PTS.PAGE_H - 20) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(80, 80, 80);
    doc.text("Edge Cases & Boundary Conditions", PTS.MARGIN_L, y); y += 5;
    y = addBulletList(doc, review.edgeCases, y);
  }

  if (review.optimizationSuggestions && review.optimizationSuggestions.length > 0) {
    if (y > PTS.PAGE_H - 20) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(80, 80, 80);
    doc.text("Optimization Suggestions", PTS.MARGIN_L, y); y += 5;
    y = addBulletList(doc, review.optimizationSuggestions, y);
  }

  if (review.learningTips && review.learningTips.length > 0) {
    if (y > PTS.PAGE_H - 20) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(80, 80, 80);
    doc.text("Learning Tips", PTS.MARGIN_L, y); y += 5;
    y = addBulletList(doc, review.learningTips, y);
  }

  // Page numbers
  addPageNumbers(doc);

  doc.save(`${buildFileStem(entry)}.pdf`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Markdown Export
// ─────────────────────────────────────────────────────────────────────────────

export function exportMarkdown(entry: ReviewHistoryEntry): void {
  const review = entry.response;
  const metaRows = buildMetaRows(entry);
  const lang = entry.language.toLowerCase();

  const lines: string[] = [];

  // Title
  lines.push(`# AI Code Review — ${CATEGORY_LABELS[entry.category]}`);
  lines.push("");

  // Metadata table
  lines.push("## Review Information");
  lines.push("");
  lines.push("| Field | Value |");
  lines.push("|---|---|");
  metaRows.forEach(r => lines.push(`| **${r.label}** | ${r.value} |`));
  lines.push("");

  // Source Code
  lines.push("## Source Code");
  lines.push("");
  lines.push(`\`\`\`${lang}`);
  lines.push(entry.code);
  lines.push("```");
  lines.push("");

  // AI Review
  lines.push("## AI Review");
  lines.push("");

  if (review.summary) {
    lines.push("### Summary");
    lines.push("");
    lines.push(review.summary);
    lines.push("");
  }

  if (review.timeComplexity || review.spaceComplexity) {
    lines.push("### Complexity");
    lines.push("");
    lines.push(`| | Complexity |`);
    lines.push(`|---|---|`);
    if (review.timeComplexity) lines.push(`| **Time** | \`${review.timeComplexity}\` |`);
    if (review.spaceComplexity) lines.push(`| **Space** | \`${review.spaceComplexity}\` |`);
    lines.push("");
  }

  if (review.hints && review.hints.length > 0) {
    lines.push("### Progressive Hints");
    lines.push("");
    review.hints.forEach((h, i) => lines.push(`${i + 1}. ${h}`));
    lines.push("");
  }

  if (review.optimalCode) {
    lines.push("### Optimal Reference Solution");
    lines.push("");
    lines.push(`\`\`\`${lang}`);
    lines.push(review.optimalCode);
    lines.push("```");
    lines.push("");
  }

  if (review.overallFeedback) {
    lines.push("### Overall Evaluation");
    lines.push("");
    lines.push(review.overallFeedback);
    lines.push("");
  }

  if (review.correctnessAnalysis) {
    lines.push("### Correctness & Logic Audit");
    lines.push("");
    lines.push(review.correctnessAnalysis);
    lines.push("");
  }

  if (review.edgeCases && review.edgeCases.length > 0) {
    lines.push("### Edge Cases & Boundary Conditions");
    lines.push("");
    review.edgeCases.forEach(ec => lines.push(`- ${ec}`));
    lines.push("");
  }

  if (review.optimizationSuggestions && review.optimizationSuggestions.length > 0) {
    lines.push("### Optimization Suggestions");
    lines.push("");
    review.optimizationSuggestions.forEach(s => lines.push(`- ${s}`));
    lines.push("");
  }

  if (review.learningTips && review.learningTips.length > 0) {
    lines.push("### Learning Tips");
    lines.push("");
    review.learningTips.forEach(t => lines.push(`- ${t}`));
    lines.push("");
  }

  const content = lines.join("\n");
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  downloadBlob(blob, `${buildFileStem(entry)}.md`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Plain Text Export
// ─────────────────────────────────────────────────────────────────────────────

function separator(char = "=", len = 70): string {
  return char.repeat(len);
}

function section(title: string): string {
  return `\n${separator()}\n${title.toUpperCase()}\n${separator()}\n`;
}

function subSection(title: string): string {
  return `\n${title}\n${"-".repeat(title.length)}\n`;
}

function indentCode(code: string): string {
  return code
    .split("\n")
    .map(l => `    ${l}`)
    .join("\n");
}

function bulletList(items: string[]): string {
  return items.map(i => `  * ${i}`).join("\n");
}

function numberedList(items: string[]): string {
  return items.map((item, i) => `  ${i + 1}. ${item}`).join("\n");
}

export function exportText(entry: ReviewHistoryEntry): void {
  const review = entry.response;
  const metaRows = buildMetaRows(entry);

  const lines: string[] = [];

  lines.push("AI CODE REVIEW");
  lines.push(separator());
  lines.push("");

  // Metadata
  lines.push(section("Review Information"));
  metaRows.forEach(r => lines.push(`  ${r.label.padEnd(22)}: ${r.value}`));
  lines.push("");

  // Source Code
  lines.push(section("Source Code"));
  lines.push(indentCode(entry.code));
  lines.push("");

  // AI Review
  lines.push(section("AI Review"));

  if (review.summary) {
    lines.push(subSection("Summary"));
    lines.push(review.summary);
    lines.push("");
  }

  if (review.timeComplexity || review.spaceComplexity) {
    lines.push(subSection("Complexity"));
    if (review.timeComplexity) lines.push(`  Time:  ${review.timeComplexity}`);
    if (review.spaceComplexity) lines.push(`  Space: ${review.spaceComplexity}`);
    lines.push("");
  }

  if (review.hints && review.hints.length > 0) {
    lines.push(subSection("Progressive Hints"));
    lines.push(numberedList(review.hints));
    lines.push("");
  }

  if (review.optimalCode) {
    lines.push(subSection("Optimal Reference Solution"));
    lines.push(indentCode(review.optimalCode));
    lines.push("");
  }

  if (review.overallFeedback) {
    lines.push(subSection("Overall Evaluation"));
    lines.push(review.overallFeedback);
    lines.push("");
  }

  if (review.correctnessAnalysis) {
    lines.push(subSection("Correctness & Logic Audit"));
    lines.push(review.correctnessAnalysis);
    lines.push("");
  }

  if (review.edgeCases && review.edgeCases.length > 0) {
    lines.push(subSection("Edge Cases & Boundary Conditions"));
    lines.push(bulletList(review.edgeCases));
    lines.push("");
  }

  if (review.optimizationSuggestions && review.optimizationSuggestions.length > 0) {
    lines.push(subSection("Optimization Suggestions"));
    lines.push(bulletList(review.optimizationSuggestions));
    lines.push("");
  }

  if (review.learningTips && review.learningTips.length > 0) {
    lines.push(subSection("Learning Tips"));
    lines.push(bulletList(review.learningTips));
    lines.push("");
  }

  lines.push(separator());
  lines.push("Generated by DSA AI Coach — AI Review Export");
  lines.push(separator());

  const content = lines.join("\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  downloadBlob(blob, `${buildFileStem(entry)}.txt`);
}
