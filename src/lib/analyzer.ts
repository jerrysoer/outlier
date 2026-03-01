import Anthropic from "@anthropic-ai/sdk";
import type {
  ChannelData,
  ThumbnailSignal,
  ThumbnailSignalName,
  ThumbnailCorrelation,
  SignalCorrelation,
  OutlierVideo,
  AnalysisResult,
  TitleIntelligence,
  TagStrategyData,
  ViralOutputs,
} from "./types";
import { getSupabase } from "./supabase";
import {
  computeEngagement,
  computeFormatMix,
  computeUploadCadence,
  computeViewVelocity,
  computeTagStats,
  getTopBottomVideos,
  findOutlierVideos,
} from "./compute";
import { computeGrade } from "./grade";

// ── Singleton Anthropic client ──

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
    client = new Anthropic({ apiKey });
  }
  return client;
}

const MODEL_VISION = "claude-haiku-4-5-20251001"; // Thumbnail classification (cheap)
const MODEL_REASONING = "claude-sonnet-4-5-20250929"; // Comparative analysis (smart)

// ── Claude JSON helper ──

async function callClaudeJSON<T>(
  systemPrompt: string,
  content: Anthropic.Messages.ContentBlockParam[],
  options?: { maxTokens?: number; temperature?: number; model?: string }
): Promise<T> {
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: options?.model ?? MODEL_REASONING,
    max_tokens: options?.maxTokens ?? 4096,
    temperature: options?.temperature ?? 0.3,
    system: [{ type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  const cleaned = textBlock.text
    .replace(/^```(?:json)?\n?/gm, "")
    .replace(/\n?```$/gm, "")
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch (e) {
    throw new Error(
      `Failed to parse Claude JSON response: ${e instanceof Error ? e.message : "Unknown error"}\nRaw: ${cleaned.slice(0, 500)}`
    );
  }
}

// ── Thumbnail fetching ──

async function fetchThumbnailBase64(
  url: string
): Promise<{ data: string; mediaType: "image/jpeg" } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return { data: base64, mediaType: "image/jpeg" };
  } catch {
    return null;
  }
}

// ══════════════════════════════════════════
// CALL 1: VISION (Haiku) — Thumbnail Signals
// ══════════════════════════════════════════

interface ChannelThumbnailResult {
  all_videos: Record<ThumbnailSignalName, number>;
  top_10_videos: Record<ThumbnailSignalName, number>;
  bottom_10_videos: Record<ThumbnailSignalName, number>;
}

const THUMBNAIL_SYSTEM_PROMPT = `You are a YouTube thumbnail analyst. You analyze batches of thumbnail images and calculate what percentage contain specific visual signals.

You analyze three subsets: ALL thumbnails, the TOP 10 performing thumbnails (by views), and the BOTTOM 10 performing thumbnails (by views).

You must respond with ONLY valid JSON, no markdown fences, no explanation.`;

function buildThumbnailPrompt(
  channelName: string,
  count: number,
  videoContext: string
): string {
  return `Analyze these ${count} YouTube thumbnails from "${channelName}".

VIDEO CONTEXT (title + view count for each thumbnail, in order):
${videoContext}

The first 10 videos listed are the TOP 10 by views. The last 10 are the BOTTOM 10 by views.

For each signal below, calculate the percentage (0.0 to 1.0) of thumbnails that contain it, for THREE subsets: all_videos, top_10_videos, bottom_10_videos.

SIGNALS:
1. close_up_face — Face takes up >30% of thumbnail area
2. eye_contact — Person looking directly at camera/viewer
3. high_energy_expression — Strong visible emotion (surprise, excitement, shock, anger, joy)
4. text_overlay — Any text overlaid on the thumbnail
5. text_legible — Text overlay is clearly readable at small size
6. warm_color_temp — Predominantly warm color palette (reds, oranges, yellows)
7. low_bg_complexity — Clean/simple background (not cluttered)
8. logo_presence — Consistent visual branding (logo, recurring graphic elements)
9. before_after_framing — Split-screen or before/after comparison layout
10. face_free — No human face visible at all

Return ONLY this JSON:
{
  "all_videos": { "close_up_face": 0.XX, "eye_contact": 0.XX, "high_energy_expression": 0.XX, "text_overlay": 0.XX, "text_legible": 0.XX, "warm_color_temp": 0.XX, "low_bg_complexity": 0.XX, "logo_presence": 0.XX, "before_after_framing": 0.XX, "face_free": 0.XX },
  "top_10_videos": { "close_up_face": 0.XX, "eye_contact": 0.XX, "high_energy_expression": 0.XX, "text_overlay": 0.XX, "text_legible": 0.XX, "warm_color_temp": 0.XX, "low_bg_complexity": 0.XX, "logo_presence": 0.XX, "before_after_framing": 0.XX, "face_free": 0.XX },
  "bottom_10_videos": { "close_up_face": 0.XX, "eye_contact": 0.XX, "high_energy_expression": 0.XX, "text_overlay": 0.XX, "text_legible": 0.XX, "warm_color_temp": 0.XX, "low_bg_complexity": 0.XX, "logo_presence": 0.XX, "before_after_framing": 0.XX, "face_free": 0.XX }
}`;
}

async function analyzeThumbnails(
  channel: ChannelData
): Promise<ChannelThumbnailResult> {
  // Check cache first
  const latestVideoId = channel.videos[0]?.id ?? "";
  const cached = await getCachedSignals(channel.meta.id, latestVideoId);
  if (cached) return cached;

  const videos = channel.videos.slice(0, 50);

  // Sort by views to identify top/bottom 10
  const sorted = [...videos].sort((a, b) => b.viewCount - a.viewCount);
  const top10Ids = new Set(sorted.slice(0, 10).map((v) => v.id));
  const bottom10Ids = new Set(sorted.slice(-10).map((v) => v.id));

  // Build video context string (title + views for each)
  const videoContext = videos
    .map((v, i) => {
      const marker = top10Ids.has(v.id) ? " [TOP10]" : bottom10Ids.has(v.id) ? " [BOT10]" : "";
      return `${i + 1}. "${v.title}" — ${v.viewCount.toLocaleString()} views${marker}`;
    })
    .join("\n");

  // Fetch thumbnails as base64 (parallel)
  const thumbnailPromises = videos.map((v) =>
    fetchThumbnailBase64(v.thumbnailUrl)
  );
  const thumbnails = await Promise.all(thumbnailPromises);
  const validThumbnails = thumbnails.filter(
    (t): t is { data: string; mediaType: "image/jpeg" } => t !== null
  );

  if (validThumbnails.length === 0) {
    throw new Error(`No thumbnails could be fetched for ${channel.meta.title}`);
  }

  // Build content blocks
  const content: Anthropic.Messages.ContentBlockParam[] = [];

  for (const thumb of validThumbnails) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: thumb.mediaType,
        data: thumb.data,
      },
    });
  }

  content.push({
    type: "text",
    text: buildThumbnailPrompt(channel.meta.title, validThumbnails.length, videoContext),
  });

  const result = await callClaudeJSON<ChannelThumbnailResult>(
    THUMBNAIL_SYSTEM_PROMPT,
    content,
    { maxTokens: 1500, temperature: 0.2, model: MODEL_VISION }
  );

  // Write to cache (fire-and-forget)
  setCachedSignals(channel.meta.id, latestVideoId, result);

  return result;
}

// ── Thumbnail Signal Cache (Supabase) ──

async function getCachedSignals(
  channelId: string,
  latestVideoId: string
): Promise<ChannelThumbnailResult | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from("thumbnail_signal_cache")
      .select("signals")
      .eq("channel_id", channelId)
      .eq("latest_video_id", latestVideoId)
      .gte("created_at", cutoff)
      .single();

    // Validate new schema (must have all_videos key)
    if (data?.signals && typeof data.signals === "object" && "all_videos" in (data.signals as Record<string, unknown>)) {
      console.log(`[cache] HIT for channel ${channelId}`);
      return data.signals as ChannelThumbnailResult;
    }
  } catch {
    // Cache miss or query error
  }
  return null;
}

async function setCachedSignals(
  channelId: string,
  latestVideoId: string,
  signals: ChannelThumbnailResult
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  try {
    await supabase.from("thumbnail_signal_cache").upsert(
      {
        channel_id: channelId,
        latest_video_id: latestVideoId,
        signals,
        created_at: new Date().toISOString(),
      },
      { onConflict: "channel_id" }
    );
  } catch (e) {
    console.error("[cache] write failed:", e);
  }
}

// ══════════════════════════════════════════
// CALL 2: TEXT (Sonnet) — Comparative + Viral
// ══════════════════════════════════════════

interface TextCallResult {
  core_finding: {
    headline: string;
    metrics: Array<{ label: string; value: string; context: string }>;
  };
  outlier_videos_a: Array<{ video_id: string; why_it_worked: string }>;
  outlier_videos_b: Array<{ video_id: string; why_it_worked: string }>;
  title_intelligence: {
    channel_a: {
      formulas: Array<{ pattern: string; examples: string[]; count: number }>;
      emotional_tone_mix: Record<string, number>;
      question_ratio: number;
      number_usage: number;
      specificity_score: number;
      avg_word_count: number;
      first_word_distribution: Array<{ word: string; count: number }>;
      power_word_examples: string[];
    };
    channel_b: {
      formulas: Array<{ pattern: string; examples: string[]; count: number }>;
      emotional_tone_mix: Record<string, number>;
      question_ratio: number;
      number_usage: number;
      specificity_score: number;
      avg_word_count: number;
      first_word_distribution: Array<{ word: string; count: number }>;
      power_word_examples: string[];
    };
  };
  tag_analysis: {
    channel_a: { top_categories: string[] };
    channel_b: { top_categories: string[] };
    unique_opportunities: string[];
  };
  grades: {
    channel_a: { letter: string; rationale: string };
    channel_b: { letter: string; rationale: string };
  };
  roast_card_a: string;
  roast_card_b: string;
  steal_this_strategy: Array<{ action: string; proof: string }>;
  tweetable_callout: string;
}

const TEXT_SYSTEM_PROMPT = `You are an elite YouTube channel strategist and analyst. You deliver data-backed competitive analysis with a distinctive voice — part consultant, part friendly rival — witty but never cruel.

Be terse. Every word must earn its place. Prefer fragments over full sentences. Lead with numbers.

You must respond with ONLY valid JSON, no markdown fences, no explanation.`;

function buildTextPrompt(
  channelA: ChannelData,
  channelB: ChannelData,
  signalsA: ChannelThumbnailResult,
  signalsB: ChannelThumbnailResult,
  computedContext: string,
  outliersA: Array<{ id: string; title: string; multiplier: number }>,
  outliersB: Array<{ id: string; title: string; multiplier: number }>,
  topTagsA: string[],
  topTagsB: string[]
): string {
  const titlesA = channelA.videos.map((v) => `"${v.title}" (${v.viewCount.toLocaleString()} views)`).join("\n");
  const titlesB = channelB.videos.map((v) => `"${v.title}" (${v.viewCount.toLocaleString()} views)`).join("\n");

  return `Analyze these two YouTube channels and generate a comprehensive competitive report.

═══ CHANNEL A: "${channelA.meta.title}" ═══
Handle: ${channelA.meta.handle}
Subscribers: ${channelA.meta.subscriberCount.toLocaleString()}
Videos analyzed: ${channelA.videos.length}

Thumbnail signals (all/top10/bottom10):
${JSON.stringify(signalsA, null, 1)}

Top outlier videos:
${outliersA.map((v) => `- "${v.title}" (${v.multiplier.toFixed(1)}x average)`).join("\n")}

All titles + views:
${titlesA}

Top 20 tags: ${topTagsA.join(", ") || "No tags available"}

═══ CHANNEL B: "${channelB.meta.title}" ═══
Handle: ${channelB.meta.handle}
Subscribers: ${channelB.meta.subscriberCount.toLocaleString()}
Videos analyzed: ${channelB.videos.length}

Thumbnail signals (all/top10/bottom10):
${JSON.stringify(signalsB, null, 1)}

Top outlier videos:
${outliersB.map((v) => `- "${v.title}" (${v.multiplier.toFixed(1)}x average)`).join("\n")}

All titles + views:
${titlesB}

Top 20 tags: ${topTagsB.join(", ") || "No tags available"}

═══ COMPUTED METRICS ═══
${computedContext}

═══ INSTRUCTIONS ═══

Return this JSON structure:

{
  "core_finding": {
    "headline": "Max 12 words. The #1 thing Channel A must change. No filler.",
    "metrics": [
      { "label": "2-3 word metric name", "value": "Number or ratio", "context": "Max 8 words comparing channels" }
    ]
  },
  "NOTE_core_finding": "Return exactly 3 items in core_finding.metrics.",

  "outlier_videos_a": [
    { "video_id": "xxx", "why_it_worked": "1-2 sentence explanation referencing specific thumbnail/title/timing factors" }
  ],
  "outlier_videos_b": [
    { "video_id": "xxx", "why_it_worked": "1-2 sentence explanation" }
  ],

  "title_intelligence": {
    "channel_a": {
      "formulas": [{ "pattern": "How to [X] in [Time]", "examples": ["actual title 1", "actual title 2"], "count": 5 }],
      "emotional_tone_mix": { "educational": 40, "sensational": 20, "neutral": 40 },
      "question_ratio": 0.15,
      "number_usage": 0.30,
      "specificity_score": 7,
      "avg_word_count": 8,
      "first_word_distribution": [{ "word": "How", "count": 8 }, { "word": "Why", "count": 5 }],
      "power_word_examples": ["ultimate", "secret", "insane"]
    },
    "channel_b": { /* same structure */ }
  },

  "tag_analysis": {
    "channel_a": { "top_categories": ["category1", "category2", "category3"] },
    "channel_b": { "top_categories": ["category1", "category2", "category3"] },
    "unique_opportunities": ["tag opportunity Channel A should use but doesn't"]
  },

  "grades": {
    "channel_a": { "letter": "B", "rationale": "Max 8 words. Fragment OK. e.g. 'Strong engagement, weak upload cadence'" },
    "channel_b": { "letter": "A", "rationale": "Max 8 words. Fragment OK." }
  },

  "roast_card_a": "A playful, witty jab aimed ONLY at ${channelA.meta.title}, written in first person from ${channelB.meta.title}'s perspective. Think friendly rivalry, not mean-spirited. Address them as 'you'. Reference their specific metrics but keep it fun — something both creators would laugh at and want to share. Must NOT mention ${channelB.meta.title} by name. Max 2 sentences.",

  "roast_card_b": "A playful, witty jab aimed ONLY at ${channelB.meta.title}, written in first person from ${channelA.meta.title}'s perspective. Same lighthearted tone — data-backed but harmless. Address them as 'you'. Must NOT mention ${channelA.meta.title} by name. Max 2 sentences.",

  "steal_this_strategy": [
    { "action": "Imperative verb phrase, max 8 words.", "proof": "One stat, max 8 words." }
  ],

  "tweetable_callout": "A pre-written tweet under 240 chars comparing these channels. Use @${channelB.meta.handle} mention. Include a specific stat. Make it shareable and provocative."
}

Return top 3 formulas per channel, top 3 outlier explanations per channel, 3 steal-this tactics, and 3-5 tag categories per channel. Grades should be A/B/C/D/F with honest rationale.`;
}

// ── Priority assignment ──

function assignPriority(
  absGap: number
): "HIGHEST" | "HIGH" | "MEDIUM" | "LOW" {
  if (absGap >= 30) return "HIGHEST";
  if (absGap >= 20) return "HIGH";
  if (absGap >= 10) return "MEDIUM";
  return "LOW";
}

// ── Compute thumbnail correlations ──

function computeCorrelations(
  signalsA: ChannelThumbnailResult,
  signalsB: ChannelThumbnailResult
): ThumbnailCorrelation[] {
  const signalNames: ThumbnailSignalName[] = [
    "close_up_face", "eye_contact", "high_energy_expression", "text_overlay",
    "text_legible", "warm_color_temp", "low_bg_complexity", "logo_presence",
    "before_after_framing", "face_free",
  ];

  const signalLabels: Record<ThumbnailSignalName, string> = {
    close_up_face: "Close-Up Face",
    eye_contact: "Eye Contact",
    high_energy_expression: "High Energy Expression",
    text_overlay: "Text Overlay",
    text_legible: "Text Legible",
    warm_color_temp: "Warm Color Temperature",
    low_bg_complexity: "Low Background Complexity",
    logo_presence: "Logo Presence",
    before_after_framing: "Before/After Framing",
    face_free: "Face Free",
  };

  return signalNames.map((signal) => {
    // Average presence in top 10 vs bottom 10 across both channels
    const topAvg = ((signalsA.top_10_videos[signal] ?? 0) + (signalsB.top_10_videos[signal] ?? 0)) / 2;
    const bottomAvg = ((signalsA.bottom_10_videos[signal] ?? 0) + (signalsB.bottom_10_videos[signal] ?? 0)) / 2;
    const gapPp = Math.round((topAvg - bottomAvg) * 100);

    let correlation: SignalCorrelation;
    if (gapPp >= 25) correlation = "strong_positive";
    else if (gapPp >= 10) correlation = "moderate_positive";
    else if (gapPp >= -10) correlation = "neutral";
    else correlation = "negative";

    return {
      signal,
      label: signalLabels[signal],
      correlation,
      topPresence: Math.round(topAvg * 100),
      bottomPresence: Math.round(bottomAvg * 100),
      gapPp,
    };
  }).sort((a, b) => Math.abs(b.gapPp) - Math.abs(a.gapPp));
}

// ── Get top tags by frequency ──

function getTopTags(channel: ChannelData, n: number = 20): string[] {
  const tagCount: Record<string, number> = {};
  for (const v of channel.videos) {
    for (const tag of v.tags) {
      const lower = tag.toLowerCase();
      tagCount[lower] = (tagCount[lower] || 0) + 1;
    }
  }
  return Object.entries(tagCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([tag]) => tag);
}

// ══════════════════════════════════════════
// MAIN ANALYSIS PIPELINE
// ══════════════════════════════════════════

export async function runAnalysis(
  channelA: ChannelData,
  channelB: ChannelData,
  onProgress: (phase: string, message: string) => void
): Promise<AnalysisResult> {
  // ── Phase 1: Thumbnail Analysis (2 parallel Haiku Vision calls) ──
  const thumbCountA = Math.min(channelA.videos.length, 50);
  const thumbCountB = Math.min(channelB.videos.length, 50);
  onProgress(
    "analyzing_thumbnails",
    `Analyzing ${thumbCountA + thumbCountB} thumbnails with Claude Vision...`
  );

  const [signalsA, signalsB] = await Promise.all([
    analyzeThumbnails(channelA),
    analyzeThumbnails(channelB),
  ]);

  // ── Phase 2: Zero-cost compute ──
  onProgress(
    "computing_metrics",
    "Computing engagement, cadence, velocity, and format metrics..."
  );

  const outliersA = findOutlierVideos(channelA);
  const outliersB = findOutlierVideos(channelB);
  const engagement = computeEngagement(channelA, channelB);
  const formatMixA = computeFormatMix(channelA);
  const formatMixB = computeFormatMix(channelB);
  const cadenceA = computeUploadCadence(channelA);
  const cadenceB = computeUploadCadence(channelB);
  const velocityA = computeViewVelocity(channelA);
  const velocityB = computeViewVelocity(channelB);
  const tagStatsA = computeTagStats(channelA);
  const tagStatsB = computeTagStats(channelB);
  const topTagsA = getTopTags(channelA);
  const topTagsB = getTopTags(channelB);
  const correlations = computeCorrelations(signalsA, signalsB);

  // Build computed context summary for the Text call
  const computedContext = `
ENGAGEMENT:
  Channel A: ${(engagement.channelA.avgLikeRate * 100).toFixed(2)}% like rate, ${(engagement.channelA.avgCommentRate * 100).toFixed(3)}% comment rate, ${(engagement.channelA.combinedRate * 100).toFixed(2)}% combined
  Channel B: ${(engagement.channelB.avgLikeRate * 100).toFixed(2)}% like rate, ${(engagement.channelB.avgCommentRate * 100).toFixed(3)}% comment rate, ${(engagement.channelB.combinedRate * 100).toFixed(2)}% combined
  Winner: ${engagement.winner}

FORMAT MIX:
  Channel A: ${formatMixA.buckets.map((b) => `${b.label}: ${b.count} (${b.percentage}%, avg ${b.avgViews.toLocaleString()} views)`).join(", ")}
  Channel B: ${formatMixB.buckets.map((b) => `${b.label}: ${b.count} (${b.percentage}%, avg ${b.avgViews.toLocaleString()} views)`).join(", ")}

UPLOAD CADENCE:
  Channel A: ${cadenceA.postsPerWeek} posts/week, grade ${cadenceA.grade}, trend ${cadenceA.trend}, momentum ${cadenceA.momentum.label}, longest gap ${cadenceA.longestGapDays}d, best day ${cadenceA.bestDayOfWeek}
  Channel B: ${cadenceB.postsPerWeek} posts/week, grade ${cadenceB.grade}, trend ${cadenceB.trend}, momentum ${cadenceB.momentum.label}, longest gap ${cadenceB.longestGapDays}d, best day ${cadenceB.bestDayOfWeek}

VIEW VELOCITY:
  Channel A: shape=${velocityA.shape}, top/bottom ratio=${velocityA.topBottomRatio}x
  Channel B: shape=${velocityB.shape}, top/bottom ratio=${velocityB.topBottomRatio}x

THUMBNAIL CORRELATIONS (top vs bottom performers):
${correlations.slice(0, 5).map((c) => `  ${c.label}: ${c.correlation} (top ${c.topPresence}% vs bottom ${c.bottomPresence}%, gap ${c.gapPp}pp)`).join("\n")}

TAGS:
  Channel A: ${tagStatsA.totalUniqueTags} unique tags, ${tagStatsA.avgTagsPerVideo} avg/video
  Channel B: ${tagStatsB.totalUniqueTags} unique tags, ${tagStatsB.avgTagsPerVideo} avg/video`;

  // ── Phase 3: Text Analysis (Sonnet) ──
  const insightMessages = [
    "Teaching AI to judge thumbnails harder than your audience does...",
    "Crunching the numbers your competitors don't want you to see...",
    "Generating roasts, grades, and uncomfortable truths...",
    "Comparing upload schedules and questioning life choices...",
    "Analyzing who's actually winning (spoiler: it's complicated)...",
    "Building your competitive playbook from 100+ data points...",
  ];
  const msg = insightMessages[Math.floor(Math.random() * insightMessages.length)];
  onProgress("generating_insights", msg);

  const textResult = await callClaudeJSON<TextCallResult>(
    TEXT_SYSTEM_PROMPT,
    [
      {
        type: "text",
        text: buildTextPrompt(
          channelA,
          channelB,
          signalsA,
          signalsB,
          computedContext,
          outliersA,
          outliersB,
          topTagsA,
          topTagsB
        ),
      },
    ],
    { maxTokens: 4096, temperature: 0.5 }
  );

  // ── Assemble signal gaps (using all_videos scores) ──
  const signalNames: ThumbnailSignalName[] = [
    "close_up_face", "eye_contact", "high_energy_expression", "text_overlay",
    "text_legible", "warm_color_temp", "low_bg_complexity", "logo_presence",
    "before_after_framing", "face_free",
  ];

  const signalLabels: Record<ThumbnailSignalName, string> = {
    close_up_face: "Close-Up Face",
    eye_contact: "Eye Contact",
    high_energy_expression: "High Energy Expression",
    text_overlay: "Text Overlay",
    text_legible: "Text Legible",
    warm_color_temp: "Warm Color Temperature",
    low_bg_complexity: "Low Background Complexity",
    logo_presence: "Logo Presence",
    before_after_framing: "Before/After Framing",
    face_free: "Face Free",
  };

  const signals: ThumbnailSignal[] = signalNames
    .map((name) => {
      const a = signalsA.all_videos[name] ?? 0;
      const b = signalsB.all_videos[name] ?? 0;
      const gapPp = Math.round((a - b) * 100);
      return {
        name,
        label: signalLabels[name],
        channelA: a,
        channelB: b,
        gap: gapPp,
        priority: assignPriority(Math.abs(gapPp)),
      };
    })
    .sort((a, b) => Math.abs(b.gap) - Math.abs(a.gap));

  // ── Map outlier explanations ──
  const outlierVideosA: OutlierVideo[] = outliersA.map((o) => {
    const explanation = textResult.outlier_videos_a?.find((e) => e.video_id === o.id);
    return {
      ...o,
      whyItWorked: explanation?.why_it_worked || "High view velocity relative to channel average.",
    };
  });

  const outlierVideosB: OutlierVideo[] = outliersB.map((o) => {
    const explanation = textResult.outlier_videos_b?.find((e) => e.video_id === o.id);
    return {
      ...o,
      whyItWorked: explanation?.why_it_worked || "High view velocity relative to channel average.",
    };
  });

  // ── Map title intelligence ──
  const mapTitleChannel = (raw: TextCallResult["title_intelligence"]["channel_a"]) => ({
    formulas: raw?.formulas ?? [],
    avgWordCount: raw?.avg_word_count ?? 0,
    emotionalToneMix: raw?.emotional_tone_mix ?? {},
    questionRatio: raw?.question_ratio ?? 0,
    numberUsage: raw?.number_usage ?? 0,
    specificityScore: raw?.specificity_score ?? 5,
    firstWordDistribution: raw?.first_word_distribution ?? [],
    powerWordExamples: raw?.power_word_examples ?? [],
  });

  const titleIntelligence: TitleIntelligence = {
    channelA: mapTitleChannel(textResult.title_intelligence?.channel_a),
    channelB: mapTitleChannel(textResult.title_intelligence?.channel_b),
  };

  // ── Map tag strategy ──
  const tagStrategy: TagStrategyData = {
    channelA: {
      ...tagStatsA,
      topCategories: textResult.tag_analysis?.channel_a?.top_categories ?? [],
    },
    channelB: {
      ...tagStatsB,
      topCategories: textResult.tag_analysis?.channel_b?.top_categories ?? [],
    },
    uniqueOpportunities: textResult.tag_analysis?.unique_opportunities ?? [],
  };

  // ── Map viral outputs ──
  const viral: ViralOutputs = {
    roastCard: {
      forA: textResult.roast_card_a ?? "",
      forB: textResult.roast_card_b ?? "",
    },
    stealThisStrategy: textResult.steal_this_strategy ?? [],
    tweetableCallout: textResult.tweetable_callout ?? "",
    grades: {
      channelA: {
        letter: (textResult.grades?.channel_a?.letter as ViralOutputs["grades"]["channelA"]["letter"]) ?? "C",
        rationale: textResult.grades?.channel_a?.rationale ?? "",
      },
      channelB: {
        letter: (textResult.grades?.channel_b?.letter as ViralOutputs["grades"]["channelB"]["letter"]) ?? "C",
        rationale: textResult.grades?.channel_b?.rationale ?? "",
      },
    },
  };

  return {
    channelA,
    channelB,
    signals,
    coreFinding: {
      headline: textResult.core_finding?.headline ?? "",
      metrics: textResult.core_finding?.metrics ?? [],
    },
    outlierVideos: {
      channelA: outlierVideosA,
      channelB: outlierVideosB,
    },
    titleIntelligence,
    uploadCadence: {
      channelA: cadenceA,
      channelB: cadenceB,
    },
    thumbnailCorrelation: correlations,
    engagement,
    formatMix: {
      channelA: formatMixA,
      channelB: formatMixB,
    },
    viewVelocity: {
      channelA: velocityA,
      channelB: velocityB,
    },
    tagStrategy,
    viral,
    analyzedAt: new Date().toISOString(),
  };
}
