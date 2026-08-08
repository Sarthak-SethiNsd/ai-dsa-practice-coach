import {
  DashboardStats,
  Distributions,
  ImprovementAnalytics,
  CollectionAnalytics,
  AchievementBadge,
} from "./dashboardTypes";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function buildTimestamp(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `ai-progress-dashboard-${yyyy}-${mm}-${dd}`;
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

export function exportDashboardPDF(
  stats: DashboardStats,
  distributions: Distributions,
  improvements: ImprovementAnalytics,
  collections: CollectionAnalytics,
  achievements: AchievementBadge[]
): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = 297;
  const H = 210;
  const ML = 12;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, W, 26, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("DSA AI Coach — AI Progress Dashboard Report", ML, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`Exported on ${new Date().toLocaleString()} · Total Reviews Analyzed: ${stats.totalReviews}`, ML, 20);

  let y = 32;

  // Core Metrics Table
  autoTable(doc, {
    startY: y,
    head: [
      [
        "Total Reviews",
        "This Week",
        "This Month",
        "Avg Score",
        "Best Score",
        "Avg Tokens",
        "Avg Duration",
        "Active Language",
      ],
    ],
    body: [
      [
        String(stats.totalReviews),
        String(stats.reviewsThisWeek),
        String(stats.reviewsThisMonth),
        `${stats.avgScore} pts`,
        `${stats.bestScore} pts`,
        stats.avgTokens.toLocaleString(),
        `${(stats.avgDurationMs / 1000).toFixed(2)}s`,
        stats.mostActiveLanguage,
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [14, 116, 144], textColor: 255, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: ML, right: ML },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // Improvement Analytics Table
  autoTable(doc, {
    startY: y,
    head: [["Score Improvement", "Last 7 Trend", "Most Improved Category", "Suggested Focus"]],
    body: [
      [
        `${improvements.scoreImprovementPct >= 0 ? "+" : ""}${improvements.scoreImprovementPct}%`,
        `${improvements.avgImprovementLast7 >= 0 ? "+" : ""}${improvements.avgImprovementLast7} pts`,
        improvements.mostImprovedCategory,
        improvements.suggestedNextFocus,
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: ML, right: ML },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // Distributions Breakdown Table
  autoTable(doc, {
    startY: y,
    head: [["Top Languages", "Top Categories", "Top Time Complexities", "Top Models"]],
    body: [
      [
        distributions.languages.slice(0, 3).map((l) => `${l.name} (${l.count})`).join(", ") || "—",
        distributions.categories.slice(0, 3).map((c) => `${c.name} (${c.count})`).join(", ") || "—",
        distributions.timeComplexities.slice(0, 3).map((tc) => `${tc.name} (${tc.count})`).join(", ") || "—",
        distributions.models.slice(0, 3).map((m) => `${m.name} (${m.count})`).join(", ") || "—",
      ],
    ],
    theme: "grid",
    headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: ML, right: ML },
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // Achievements Summary
  const unlockedBadges = achievements.filter((a) => a.unlocked).map((a) => a.title).join(", ");
  autoTable(doc, {
    startY: y,
    head: [["Unlocked Achievements", "Total Badges"]],
    body: [[unlockedBadges || "None unlocked yet", `${achievements.filter((a) => a.unlocked).length} / ${achievements.length}`]],
    theme: "grid",
    headStyles: { fillColor: [217, 119, 6], textColor: 255, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: ML, right: ML },
  });

  // Footer page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${totalPages}`, W / 2, H - 6, { align: "center" });
  }

  doc.save(`${buildTimestamp()}.pdf`);
}

export function exportDashboardMarkdown(
  stats: DashboardStats,
  distributions: Distributions,
  improvements: ImprovementAnalytics,
  collections: CollectionAnalytics,
  achievements: AchievementBadge[]
): void {
  const lines: string[] = [];

  lines.push("# AI Progress Dashboard Report");
  lines.push("");
  lines.push(`> Generated on ${new Date().toLocaleString()}`);
  lines.push("");

  lines.push("## Executive Summary");
  lines.push(`- **Total AI Reviews**: ${stats.totalReviews}`);
  lines.push(`- **Reviews This Week**: ${stats.reviewsThisWeek}`);
  lines.push(`- **Reviews This Month**: ${stats.reviewsThisMonth}`);
  lines.push(`- **Average AI Score**: ${stats.avgScore} pts`);
  lines.push(`- **Best AI Score**: ${stats.bestScore} pts`);
  lines.push(`- **Average Tokens per Review**: ${stats.avgTokens.toLocaleString()}`);
  lines.push(`- **Average Response Duration**: ${(stats.avgDurationMs / 1000).toFixed(2)}s`);
  lines.push(`- **Most Active Language**: ${stats.mostActiveLanguage}`);
  lines.push(`- **Most Active Category**: ${stats.mostActiveCategory}`);
  lines.push("");

  lines.push("## Improvement Analytics");
  lines.push(`- **Score Improvement**: ${improvements.scoreImprovementPct}%`);
  lines.push(`- **Last 7 Reviews Trend**: ${improvements.avgImprovementLast7 >= 0 ? "+" : ""}${improvements.avgImprovementLast7} pts`);
  lines.push(`- **Most Improved Category**: ${improvements.mostImprovedCategory}`);
  lines.push(`- **Suggested Focus Area**: ${improvements.suggestedNextFocus}`);
  lines.push("");

  if (improvements.weakestTopics.length > 0) {
    lines.push("### Weakest Topics");
    improvements.weakestTopics.forEach((t) => lines.push(`- ${t}`));
    lines.push("");
  }

  if (improvements.strongestTopics.length > 0) {
    lines.push("### Strongest Topics");
    improvements.strongestTopics.forEach((t) => lines.push(`- ${t}`));
    lines.push("");
  }

  lines.push("## Distributions");
  lines.push("### Languages");
  distributions.languages.forEach((l) => lines.push(`- **${l.name}**: ${l.count} reviews (${l.percentage}%)`));
  lines.push("");

  lines.push("### Categories");
  distributions.categories.forEach((c) => lines.push(`- **${c.name}**: ${c.count} reviews (${c.percentage}%)`));
  lines.push("");

  lines.push("## Achievements Summary");
  achievements.forEach((a) => {
    lines.push(`- [${a.unlocked ? "x" : " "}] **${a.title}**: ${a.description} (${a.criteria})`);
  });
  lines.push("");

  downloadBlob(new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" }), `${buildTimestamp()}.md`);
}

export function exportDashboardJSON(
  stats: DashboardStats,
  distributions: Distributions,
  improvements: ImprovementAnalytics,
  collections: CollectionAnalytics,
  achievements: AchievementBadge[]
): void {
  const data = {
    exportedAt: new Date().toISOString(),
    stats,
    distributions,
    improvements,
    collections,
    achievements,
  };

  const jsonStr = JSON.stringify(data, null, 2);
  downloadBlob(new Blob([jsonStr], { type: "application/json;charset=utf-8" }), `${buildTimestamp()}.json`);
}
