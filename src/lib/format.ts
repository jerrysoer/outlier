// ═══════════════════════════════════════
// OUTLIER — Duration utilities
// ═══════════════════════════════════════

/**
 * Parse ISO 8601 duration (PT1H2M3S) to total seconds.
 */
export function parseDurationSeconds(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Classify video format by duration.
 * ≤60s = shorts, 61-600s = mid, 601-1200s = standard, >1200s = longform
 */
export function classifyFormat(
  durationSeconds: number
): "shorts" | "mid" | "standard" | "longform" {
  if (durationSeconds <= 60) return "shorts";
  if (durationSeconds <= 600) return "mid";
  if (durationSeconds <= 1200) return "standard";
  return "longform";
}

/**
 * Shorts (≤60s) are typically vertical format.
 */
export function isVertical(durationSeconds: number): boolean {
  return durationSeconds <= 60;
}
