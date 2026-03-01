// ═══════════════════════════════════════
// OUTLIER — Zero-cost compute functions
// Pure math on YouTube API data — no AI calls
// ═══════════════════════════════════════

import type {
  ChannelData,
  VideoData,
  EngagementData,
  FormatMixChannel,
  UploadCadenceChannel,
  ViewVelocityChannel,
  TagStrategyChannel,
  OutlierVideo,
} from "./types";
import { parseDurationSeconds, classifyFormat, isVertical } from "./format";

// ── Engagement Rates ──

function computeChannelEngagement(videos: VideoData[]): {
  avgLikeRate: number;
  avgCommentRate: number;
  combinedRate: number;
} {
  if (videos.length === 0) {
    return { avgLikeRate: 0, avgCommentRate: 0, combinedRate: 0 };
  }

  let totalLikeRate = 0;
  let totalCommentRate = 0;
  let counted = 0;

  for (const v of videos) {
    if (v.viewCount === 0) continue;
    totalLikeRate += v.likeCount / v.viewCount;
    totalCommentRate += v.commentCount / v.viewCount;
    counted++;
  }

  if (counted === 0) {
    return { avgLikeRate: 0, avgCommentRate: 0, combinedRate: 0 };
  }

  const avgLikeRate = totalLikeRate / counted;
  const avgCommentRate = totalCommentRate / counted;
  return {
    avgLikeRate: Math.round(avgLikeRate * 10000) / 10000,
    avgCommentRate: Math.round(avgCommentRate * 10000) / 10000,
    combinedRate: Math.round((avgLikeRate + avgCommentRate) * 10000) / 10000,
  };
}

export function computeEngagement(
  channelA: ChannelData,
  channelB: ChannelData
): EngagementData {
  const a = computeChannelEngagement(channelA.videos);
  const b = computeChannelEngagement(channelB.videos);

  let winner: "a" | "b" | "tie";
  if (Math.abs(a.combinedRate - b.combinedRate) < 0.0005) winner = "tie";
  else if (a.combinedRate > b.combinedRate) winner = "a";
  else winner = "b";

  return { channelA: a, channelB: b, winner };
}

// ── Format Mix ──

export function computeFormatMix(channel: ChannelData): FormatMixChannel {
  const videos = channel.videos;
  const bucketMap: Record<string, { count: number; totalViews: number }> = {
    shorts: { count: 0, totalViews: 0 },
    mid: { count: 0, totalViews: 0 },
    standard: { count: 0, totalViews: 0 },
    longform: { count: 0, totalViews: 0 },
  };

  let verticalCount = 0;
  let verticalViews = 0;
  let horizontalCount = 0;
  let horizontalViews = 0;

  for (const v of videos) {
    const seconds = parseDurationSeconds(v.duration);
    const format = classifyFormat(seconds);
    bucketMap[format].count++;
    bucketMap[format].totalViews += v.viewCount;

    if (isVertical(seconds)) {
      verticalCount++;
      verticalViews += v.viewCount;
    } else {
      horizontalCount++;
      horizontalViews += v.viewCount;
    }
  }

  const total = videos.length || 1;
  const bucketLabels: Record<string, string> = {
    shorts: "Shorts (≤60s)",
    mid: "Mid (1-10m)",
    standard: "Standard (10-20m)",
    longform: "Long-form (20m+)",
  };

  const buckets = Object.entries(bucketMap).map(([key, val]) => ({
    label: bucketLabels[key],
    count: val.count,
    percentage: Math.round((val.count / total) * 100),
    avgViews: val.count > 0 ? Math.round(val.totalViews / val.count) : 0,
  }));

  return {
    buckets,
    verticalPct: Math.round((verticalCount / total) * 100),
    horizontalPct: Math.round((horizontalCount / total) * 100),
    verticalAvgViews: verticalCount > 0 ? Math.round(verticalViews / verticalCount) : 0,
    horizontalAvgViews: horizontalCount > 0 ? Math.round(horizontalViews / horizontalCount) : 0,
  };
}

// ── Upload Cadence ──

export function computeUploadCadence(channel: ChannelData): UploadCadenceChannel {
  const videos = channel.videos;
  if (videos.length < 2) {
    return {
      postsPerWeek: 0,
      grade: "F",
      trend: "stable",
      monthlyCounts: [],
      longestGapDays: 0,
      bestDayOfWeek: "N/A",
      bestDayAvgViews: 0,
      momentum: { recent30: 0, prior30: 0, ratio: 0, label: "stable" },
      algorithmResetRisk: false,
    };
  }

  const dates = videos
    .map((v) => new Date(v.publishedAt).getTime())
    .sort((a, b) => b - a);

  // Posts per week
  const rangeMs = dates[0] - dates[dates.length - 1];
  const rangeWeeks = rangeMs / (7 * 24 * 60 * 60 * 1000);
  const postsPerWeek =
    rangeWeeks > 0 ? Math.round((videos.length / rangeWeeks) * 10) / 10 : 0;

  // Consistency grade (coefficient of variation of gaps)
  const gaps: number[] = [];
  for (let i = 0; i < dates.length - 1; i++) {
    gaps.push(dates[i] - dates[i + 1]);
  }

  const avgGap = gaps.reduce((s, g) => s + g, 0) / gaps.length;
  const variance =
    gaps.reduce((s, g) => s + Math.pow(g - avgGap, 2), 0) / gaps.length;
  const cv = avgGap > 0 ? Math.sqrt(variance) / avgGap : 1;

  let grade: string;
  if (postsPerWeek >= 3 && cv < 0.5) grade = "A+";
  else if (postsPerWeek >= 2 && cv < 0.6) grade = "A";
  else if (postsPerWeek >= 1.5 && cv < 0.7) grade = "B+";
  else if (postsPerWeek >= 1 && cv < 0.8) grade = "B";
  else if (postsPerWeek >= 0.5 && cv < 1.0) grade = "C";
  else if (postsPerWeek >= 0.25) grade = "D";
  else grade = "F";

  // Trend: compare first half vs second half posting frequency
  const mid = Math.floor(dates.length / 2);
  const recentHalf = dates.slice(0, mid);
  const olderHalf = dates.slice(mid);

  const recentRange =
    recentHalf.length > 1
      ? (recentHalf[0] - recentHalf[recentHalf.length - 1]) / (7 * 24 * 60 * 60 * 1000)
      : 1;
  const olderRange =
    olderHalf.length > 1
      ? (olderHalf[0] - olderHalf[olderHalf.length - 1]) / (7 * 24 * 60 * 60 * 1000)
      : 1;

  const recentFreq = recentHalf.length / (recentRange || 1);
  const olderFreq = olderHalf.length / (olderRange || 1);
  const freqRatio = olderFreq > 0 ? recentFreq / olderFreq : 1;

  let trend: "up" | "down" | "stable";
  if (freqRatio > 1.2) trend = "up";
  else if (freqRatio < 0.8) trend = "down";
  else trend = "stable";

  // Monthly counts
  const monthMap: Record<string, number> = {};
  for (const v of videos) {
    const d = new Date(v.publishedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthMap[key] = (monthMap[key] || 0) + 1;
  }
  const monthlyCounts = Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  // Longest gap
  const gapDays = gaps.map((g) => g / (24 * 60 * 60 * 1000));
  const longestGapDays = Math.round(Math.max(...gapDays, 0));

  // Best day of week
  const dayViews: Record<string, { total: number; count: number }> = {};
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  for (const v of videos) {
    const day = dayNames[new Date(v.publishedAt).getDay()];
    if (!dayViews[day]) dayViews[day] = { total: 0, count: 0 };
    dayViews[day].total += v.viewCount;
    dayViews[day].count++;
  }
  let bestDay = "N/A";
  let bestDayAvg = 0;
  for (const [day, data] of Object.entries(dayViews)) {
    const avg = data.count > 0 ? data.total / data.count : 0;
    if (avg > bestDayAvg) {
      bestDay = day;
      bestDayAvg = avg;
    }
  }

  // Momentum: last 30 days vs prior 30 days
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const sixtyDaysAgo = now - 60 * 24 * 60 * 60 * 1000;

  const recent30 = videos.filter(
    (v) => new Date(v.publishedAt).getTime() >= thirtyDaysAgo
  ).length;
  const prior30 = videos.filter((v) => {
    const t = new Date(v.publishedAt).getTime();
    return t >= sixtyDaysAgo && t < thirtyDaysAgo;
  }).length;

  const momentumRatio = prior30 > 0 ? recent30 / prior30 : recent30 > 0 ? 2 : 0;
  let momentumLabel: "accelerating" | "decelerating" | "stable";
  if (momentumRatio > 1.3) momentumLabel = "accelerating";
  else if (momentumRatio < 0.7) momentumLabel = "decelerating";
  else momentumLabel = "stable";

  // Algorithm reset risk: gap > 14 days in last 60 days
  const recentGaps = [];
  const recentDates = dates.filter((d) => d >= sixtyDaysAgo);
  for (let i = 0; i < recentDates.length - 1; i++) {
    recentGaps.push((recentDates[i] - recentDates[i + 1]) / (24 * 60 * 60 * 1000));
  }
  const algorithmResetRisk = recentGaps.some((g) => g > 14);

  return {
    postsPerWeek,
    grade,
    trend,
    monthlyCounts,
    longestGapDays,
    bestDayOfWeek: bestDay,
    bestDayAvgViews: Math.round(bestDayAvg),
    momentum: {
      recent30,
      prior30,
      ratio: Math.round(momentumRatio * 100) / 100,
      label: momentumLabel,
    },
    algorithmResetRisk,
  };
}

// ── View Velocity ──

export function computeViewVelocity(channel: ChannelData): ViewVelocityChannel {
  const videos = [...channel.videos].sort((a, b) => b.viewCount - a.viewCount);
  const total = videos.length;

  if (total === 0) {
    return {
      quartiles: [],
      shape: "consistent",
      topBottomRatio: 1,
    };
  }

  const q1End = Math.ceil(total * 0.25);
  const q2End = Math.ceil(total * 0.5);
  const q3End = Math.ceil(total * 0.75);

  const slices = [
    { label: "Top 25%", videos: videos.slice(0, q1End) },
    { label: "25-50%", videos: videos.slice(q1End, q2End) },
    { label: "50-75%", videos: videos.slice(q2End, q3End) },
    { label: "Bottom 25%", videos: videos.slice(q3End) },
  ];

  const quartiles = slices.map((s) => ({
    label: s.label,
    avgViews:
      s.videos.length > 0
        ? Math.round(s.videos.reduce((sum, v) => sum + v.viewCount, 0) / s.videos.length)
        : 0,
    count: s.videos.length,
  }));

  const topAvg = quartiles[0]?.avgViews || 1;
  const bottomAvg = quartiles[3]?.avgViews || 1;
  const topBottomRatio = Math.round((topAvg / bottomAvg) * 10) / 10;

  let shape: "spiked" | "moderate" | "consistent";
  if (topBottomRatio > 10) shape = "spiked";
  else if (topBottomRatio > 4) shape = "moderate";
  else shape = "consistent";

  return { quartiles, shape, topBottomRatio };
}

// ── Tag Stats ──

export function computeTagStats(
  channel: ChannelData
): Omit<TagStrategyChannel, "topCategories"> {
  const videos = channel.videos;
  const allTags = new Set<string>();
  let totalTags = 0;
  let videosWithTags = 0;

  for (const v of videos) {
    if (v.tags && v.tags.length > 0) {
      videosWithTags++;
      totalTags += v.tags.length;
      for (const tag of v.tags) {
        allTags.add(tag.toLowerCase());
      }
    }
  }

  const avgTagsPerVideo =
    videosWithTags > 0
      ? Math.round((totalTags / videosWithTags) * 10) / 10
      : 0;

  // Classify specificity by word count: 1 word = broad, 2 = medium, 3+ = niche
  let broad = 0;
  let medium = 0;
  let niche = 0;
  for (const tag of allTags) {
    const wordCount = tag.split(/\s+/).length;
    if (wordCount <= 1) broad++;
    else if (wordCount === 2) medium++;
    else niche++;
  }

  const tagTotal = allTags.size || 1;

  return {
    avgTagsPerVideo,
    totalUniqueTags: allTags.size,
    specificityMix: {
      broad: Math.round((broad / tagTotal) * 100),
      medium: Math.round((medium / tagTotal) * 100),
      niche: Math.round((niche / tagTotal) * 100),
    },
  };
}

// ── Get Top/Bottom Videos ──

export function getTopBottomVideos(
  channel: ChannelData,
  n: number = 10
): { top: VideoData[]; bottom: VideoData[] } {
  const sorted = [...channel.videos].sort((a, b) => b.viewCount - a.viewCount);
  return {
    top: sorted.slice(0, n),
    bottom: sorted.slice(-n).reverse(),
  };
}

// ── Outlier Videos (kept from original) ──

export function findOutlierVideos(
  channel: ChannelData,
  count: number = 3
): Array<{
  id: string;
  title: string;
  viewCount: number;
  thumbnailUrl: string;
  multiplier: number;
}> {
  const videos = channel.videos;
  if (videos.length === 0) return [];

  const avgViews =
    videos.reduce((s, v) => s + v.viewCount, 0) / videos.length;
  if (avgViews === 0) return [];

  return videos
    .map((v) => ({
      id: v.id,
      title: v.title,
      viewCount: v.viewCount,
      thumbnailUrl: v.thumbnailUrlHigh,
      multiplier: Math.round((v.viewCount / avgViews) * 10) / 10,
    }))
    .sort((a, b) => b.multiplier - a.multiplier)
    .slice(0, count);
}
