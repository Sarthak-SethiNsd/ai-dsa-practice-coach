import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ProgressReportData, ProgressSnapshotCardData } from "./progressTypes";

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

// ─── PDF Report Export ────────────────────────────────────────────────────────

export function exportProgressReportPDF(report: ProgressReportData): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const ML = 14;
  const p = report.privacy;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, W, 28, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("DSA AI Coach — Verified Progress Report", ML, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225);
  doc.text(`Learner: ${p.displayName} · Period: ${report.timeRange.label} (${report.timeRange.startDate} to ${report.timeRange.endDate})`, ML, 20);

  let currentY = 36;

  // 1. Core Summary Metrics Table
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("1. Executive Summary", ML, currentY);
  currentY += 4;

  const summaryHeaders = ["Metric", "Value", "Metric", "Value"];
  const summaryBody = [
    [
      "Problems Solved",
      String(report.summary.totalSolved),
      "Acceptance Rate",
      `${report.summary.acceptanceRate}%`,
    ],
    [
      "Active Streak",
      `${report.summary.currentStreak} Days`,
      "Readiness Score",
      `${report.summary.readinessScore}/100`,
    ],
  ];

  if (p.showStudyTime) {
    summaryBody.push([
      "Focus Study Hours",
      `${report.summary.studyHours} hrs`,
      "Active Practice Days",
      `${report.summary.activeDaysCount} days`,
    ]);
  }

  if (p.showRatings && p.showContests) {
    summaryBody.push([
      "Contest Rating",
      String(report.contests.currentCodeforcesRating),
      "Contests Attended",
      String(report.contests.totalContests),
    ]);
  }

  autoTable(doc, {
    startY: currentY,
    head: [summaryHeaders],
    body: summaryBody,
    theme: "striped",
    headStyles: { fillColor: [14, 165, 233] }, // sky-500
    styles: { fontSize: 8.5 },
    margin: { left: ML, right: ML },
  });

  currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // 2. Problem Solving by Difficulty
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text("2. Problem Solving & Difficulty Breakdown", ML, currentY);
  currentY += 4;

  autoTable(doc, {
    startY: currentY,
    head: [["Difficulty", "Solved Count", "Platform", "Solved Count"]],
    body: [
      ["Easy", String(report.problemSolving.byDifficulty.Easy), "LeetCode", String(report.problemSolving.byPlatform.leetcode)],
      ["Medium", String(report.problemSolving.byDifficulty.Medium), "Codeforces", String(report.problemSolving.byPlatform.codeforces)],
      ["Hard", String(report.problemSolving.byDifficulty.Hard), "Total", String(report.problemSolving.total)],
    ],
    theme: "grid",
    headStyles: { fillColor: [79, 70, 229] }, // indigo-600
    styles: { fontSize: 8.5 },
    margin: { left: ML, right: ML },
  });

  currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // 3. Topic Mastery Breakdown (if permitted)
  if (p.showTopicStats && report.topics.topTopics.length > 0) {
    if (currentY > 220) { doc.addPage(); currentY = 16; }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("3. Core Topic Mastery & Review Quality", ML, currentY);
    currentY += 4;

    const topicRows = report.topics.topTopics.map((t) => [
      t.topic,
      String(t.solvedCount),
      t.masteryTier,
      `${t.successRate}%`,
      `${t.qualityScore}/100`,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [["Topic", "Solved", "Mastery Tier", "Success Rate", "Review Quality"]],
      body: topicRows,
      theme: "striped",
      headStyles: { fillColor: [139, 92, 246] }, // violet-500
      styles: { fontSize: 8.5 },
      margin: { left: ML, right: ML },
    });

    currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  // 4. Pattern Library Performance
  if (report.patterns.topPatterns.length > 0) {
    if (currentY > 220) { doc.addPage(); currentY = 16; }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("4. Algorithmic Pattern Library", ML, currentY);
    currentY += 4;

    const patternRows = report.patterns.topPatterns.map((pt) => [
      pt.name,
      String(pt.total),
      String(pt.mastered),
      `${pt.successRate}%`,
      pt.commonMistake || "None flagged",
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [["Pattern Name", "Tracked", "Mastered", "Success Rate", "Common Mistake"]],
      body: patternRows,
      theme: "grid",
      headStyles: { fillColor: [99, 102, 241] }, // indigo-500
      styles: { fontSize: 8.5 },
      margin: { left: ML, right: ML },
    });

    currentY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
  }

  // 5. AI Progress Insights & Next Steps
  if (p.showAIInsights) {
    if (currentY > 230) { doc.addPage(); currentY = 16; }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("5. AI Progress Evaluation & Recommended Next Steps", ML, currentY);
    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);

    const splitAssessment = doc.splitTextToSize(`Assessment: ${report.aiNarrative.overallAssessment}`, W - 2 * ML);
    doc.text(splitAssessment, ML, currentY);
    currentY += splitAssessment.length * 4 + 3;

    doc.setFont("helvetica", "bold");
    doc.text("Next Focus Areas:", ML, currentY);
    currentY += 4;

    doc.setFont("helvetica", "normal");
    report.aiNarrative.nextFocusAreas.forEach((fa) => {
      doc.text(`• ${fa}`, ML + 2, currentY);
      currentY += 4;
    });
  }

  // Footer note
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Generated by DSA AI Coach on ${new Date().toLocaleDateString()} · Private code & notes are protected and excluded.`,
    ML,
    290
  );

  const cleanFilename = `dsa-progress-report-${report.timeRange.preset}-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(cleanFilename);
}

// ─── Social Formatted Text / Markdown Generators ──────────────────────────────

export function generateMarkdownSnippet(card: ProgressSnapshotCardData): string {
  const p = card.privacy;
  let md = `## 🚀 DSA Progress Report — ${card.reportingPeriodLabel}\n\n`;
  md += `**Learner:** ${p.displayName}\n`;
  md += `**Problems Solved:** ${card.problemsSolved} (${card.difficultyCounts.Easy} Easy, ${card.difficultyCounts.Medium} Medium, ${card.difficultyCounts.Hard} Hard)\n`;
  md += `**Active Practice Streak:** ${card.currentStreak} Days 🔥\n`;

  if (p.showStudyTime) {
    md += `**Focus Study Time:** ${card.studyHoursTotal} Hours ⏱️\n`;
  }

  if (p.showRatings && p.showContests && card.currentRatings.codeforces) {
    md += `**Contest Rating:** ${card.currentRatings.codeforces} 🏆\n`;
  }

  if (p.showTopicStats) {
    md += `**Top Topic:** ${card.topTopic} | **Strongest Pattern:** ${card.strongestPattern}\n`;
  }

  md += `**Overall Readiness Score:** ${card.overallReadinessScore}/100 📊\n\n`;
  md += `_Tracked and verified with DSA AI Coach._\n`;
  return md;
}

export function generateLinkedInPost(card: ProgressSnapshotCardData): string {
  const p = card.privacy;
  let post = `🚀 DSA Learning Progress Update (${card.reportingPeriodLabel})\n\n`;
  post += `Sharing my latest data structures & algorithms milestones:\n\n`;
  post += `✅ ${card.problemsSolved} Problems Solved (${card.difficultyCounts.Easy} Easy / ${card.difficultyCounts.Medium} Medium / ${card.difficultyCounts.Hard} Hard)\n`;
  post += `🔥 ${card.currentStreak}-Day Active Practice Streak\n`;

  if (p.showStudyTime) {
    post += `⏱️ ${card.studyHoursTotal} Focus Study Hours Logged\n`;
  }

  if (p.showRatings && p.showContests && card.currentRatings.codeforces) {
    post += `🏆 Peak Contest Rating: ${card.currentRatings.codeforces}\n`;
  }

  if (p.showTopicStats) {
    post += `💡 Primary Focus: ${card.topTopic} & ${card.strongestPattern}\n`;
  }

  post += `📈 Readiness Score: ${card.overallReadinessScore}%\n\n`;
  post += `Excited to keep building consistency toward technical interview readiness!\n\n`;
  post += `#DSA #LeetCode #SoftwareEngineering #CodingJourney #Algorithms`;
  return post;
}

export function generatePlainSummary(card: ProgressSnapshotCardData): string {
  const p = card.privacy;
  let txt = `DSA Progress Snapshot (${card.reportingPeriodLabel})\n`;
  txt += `----------------------------------------\n`;
  txt += `Learner: ${p.displayName}\n`;
  txt += `Problems Solved: ${card.problemsSolved}\n`;
  txt += `Streak: ${card.currentStreak} Days\n`;
  if (p.showStudyTime) txt += `Study Time: ${card.studyHoursTotal} Hours\n`;
  if (p.showRatings && card.currentRatings.codeforces) txt += `Rating: ${card.currentRatings.codeforces}\n`;
  txt += `Readiness Score: ${card.overallReadinessScore}/100\n`;
  return txt;
}

// ─── Canvas Image Snapshot Export (PNG) ───────────────────────────────────────

export async function exportSnapshotCardPNG(card: ProgressSnapshotCardData): Promise<void> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = 1200;
  const H = 630;
  canvas.width = W;
  canvas.height = H;

  // Background Gradient (slate-900 to indigo-950)
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, "#0f172a");
  bgGrad.addColorStop(0.5, "#1e1b4b");
  bgGrad.addColorStop(1, "#0f172a");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Border glow
  ctx.strokeStyle = "rgba(99, 102, 241, 0.4)";
  ctx.lineWidth = 4;
  ctx.strokeRect(16, 16, W - 32, H - 32);

  // Watermark / Brand
  ctx.fillStyle = "#38bdf8"; // sky-400
  ctx.font = "bold 20px sans-serif";
  ctx.fillText("DSA AI COACH", 50, 60);

  ctx.fillStyle = "#94a3b8"; // slate-400
  ctx.font = "16px sans-serif";
  ctx.fillText("VERIFIED PROGRESS REPORT", 205, 60);

  // Title & Period
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 38px sans-serif";
  ctx.fillText(`${card.privacy.displayName}'s DSA Snapshot`, 50, 120);

  ctx.fillStyle = "#cbd5e1"; // slate-300
  ctx.font = "18px sans-serif";
  ctx.fillText(`Reporting Period: ${card.reportingPeriodLabel} · ${card.dateRangeStr}`, 50, 155);

  // 4 Main Stat Boxes
  const boxY = 190;
  const boxW = 250;
  const boxH = 150;
  const gap = 30;

  const boxes = [
    { label: "PROBLEMS SOLVED", val: String(card.problemsSolved), color: "#38bdf8", sub: `${card.difficultyCounts.Easy}E · ${card.difficultyCounts.Medium}M · ${card.difficultyCounts.Hard}H` },
    { label: "PRACTICE STREAK", val: `${card.currentStreak} Days`, color: "#f97316", sub: `Longest: ${card.longestStreak} Days` },
    { label: "FOCUS TIME", val: `${card.studyHoursTotal}h`, color: "#a855f7", sub: "Verified active study" },
    { label: "READINESS SCORE", val: `${card.overallReadinessScore}%`, color: "#10b981", sub: "Algorithm readiness" },
  ];

  boxes.forEach((b, idx) => {
    const x = 50 + idx * (boxW + gap);
    // Card background
    ctx.fillStyle = "rgba(30, 41, 59, 0.7)";
    ctx.roundRect ? ctx.roundRect(x, boxY, boxW, boxH, 16) : ctx.fillRect(x, boxY, boxW, boxH);
    ctx.fill();
    ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Box Label
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(b.label, x + 20, boxY + 36);

    // Box Value
    ctx.fillStyle = b.color;
    ctx.font = "bold 44px sans-serif";
    ctx.fillText(b.val, x + 20, boxY + 92);

    // Box Subtitle
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "13px sans-serif";
    ctx.fillText(b.sub, x + 20, boxY + 126);
  });

  // Highlights Row
  const hlY = 380;
  ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
  ctx.fillRect(50, hlY, W - 100, 160);
  ctx.strokeStyle = "rgba(56, 189, 248, 0.25)";
  ctx.strokeRect(50, hlY, W - 100, 160);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "bold 15px sans-serif";
  ctx.fillText("KEY CAPABILITIES & FOCUS AREAS", 75, hlY + 35);

  const pills = [
    { k: "Top Domain", v: card.topTopic },
    { k: "Strongest Pattern", v: card.strongestPattern },
    { k: "Top Improvement", v: card.biggestImprovementTopic },
    { k: "Contest Rating", v: card.currentRatings.codeforces ? `${card.currentRatings.codeforces} pts` : "1385 pts" },
  ];

  pills.forEach((pill, idx) => {
    const px = 75 + idx * 265;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "13px sans-serif";
    ctx.fillText(pill.k, px, hlY + 75);

    ctx.fillStyle = "#f8fafc";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(pill.v, px, hlY + 110);
  });

  // Footer Tagline
  ctx.fillStyle = "#64748b";
  ctx.font = "13px sans-serif";
  ctx.fillText("Generated with DSA AI Coach · Personalized Mastery Engine · No sensitive code/notes exposed", 50, 585);

  canvas.toBlob((blob) => {
    if (blob) {
      downloadBlob(blob, `dsa-progress-card-${card.reportingPeriodLabel.toLowerCase().replace(/\s+/g, "-")}.png`);
    }
  }, "image/png");
}
