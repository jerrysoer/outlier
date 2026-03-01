// ═══════════════════════════════════════
// OUTLIER — Channel grading
// Weighted composite score → A/B/C/D/F
// ═══════════════════════════════════════

import type { ChannelGrade, UploadCadenceChannel } from "./types";

/**
 * Compute a channel grade from weighted metrics.
 * Weighting: thumbnails 40%, engagement 20%, consistency 20%, title specificity 20%.
 * Thresholds: A = 80+, B = 65+, C = 50+, D = 35+, F = <35.
 */
export function computeGrade(
  thumbnailGapScore: number,   // 0-100 based on signal gap severity
  engagementRate: number,      // combined like+comment rate (0-1 scale)
  cadence: UploadCadenceChannel,
  titleSpecificity: number     // 1-10 from AI
): ChannelGrade {
  // Normalize engagement rate to 0-100 (5% combined rate = 100 score)
  const engagementScore = Math.min(100, (engagementRate / 0.05) * 100);

  // Normalize cadence grade to 0-100
  const gradeMap: Record<string, number> = {
    "A+": 100, "A": 90, "B+": 80, "B": 70, "C": 55, "D": 35, "F": 15,
  };
  const cadenceScore = gradeMap[cadence.grade] ?? 30;

  // Normalize title specificity (1-10) to 0-100
  const titleScore = titleSpecificity * 10;

  // Weighted composite
  const composite =
    thumbnailGapScore * 0.4 +
    engagementScore * 0.2 +
    cadenceScore * 0.2 +
    titleScore * 0.2;

  let letter: ChannelGrade["letter"];
  if (composite >= 80) letter = "A";
  else if (composite >= 65) letter = "B";
  else if (composite >= 50) letter = "C";
  else if (composite >= 35) letter = "D";
  else letter = "F";

  // Generate rationale
  const parts: string[] = [];
  if (thumbnailGapScore >= 70) parts.push("strong thumbnail strategy");
  else if (thumbnailGapScore < 40) parts.push("weak thumbnail execution");

  if (engagementScore >= 70) parts.push("high audience engagement");
  else if (engagementScore < 30) parts.push("low engagement rates");

  if (cadenceScore >= 70) parts.push("consistent upload schedule");
  else if (cadenceScore < 40) parts.push("inconsistent posting");

  if (titleScore >= 70) parts.push("specific, compelling titles");
  else if (titleScore < 40) parts.push("generic title patterns");

  const rationale =
    parts.length > 0
      ? parts.join(", ").replace(/^./, (c) => c.toUpperCase()) + "."
      : `Overall score: ${Math.round(composite)}/100.`;

  return { letter, rationale };
}
