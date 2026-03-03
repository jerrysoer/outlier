// ═══════════════════════════════════════
// OUTLIER — YouTube Channel Gap Analyzer
// Type definitions (PRD v1.1)
// ═══════════════════════════════════════

// ── YouTube Data ──

export interface ChannelMeta {
  id: string;
  title: string;
  handle: string;
  subscriberCount: number;
  videoCount: number;
  thumbnailUrl: string;
  uploadsPlaylistId: string;
}

export interface VideoData {
  id: string;
  title: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  thumbnailUrl: string;        // hqdefault (480x360) for Claude Vision
  thumbnailUrlHigh: string;    // maxresdefault for display, hqdefault fallback
  duration: string;
  tags: string[];
}

export interface ChannelData {
  meta: ChannelMeta;
  videos: VideoData[];
}

// ── Thumbnail Analysis (10 updated signals) ──

export type ThumbnailSignalName =
  | "close_up_face"
  | "eye_contact"
  | "high_energy_expression"
  | "text_overlay"
  | "text_legible"
  | "warm_color_temp"
  | "low_bg_complexity"
  | "logo_presence"
  | "before_after_framing"
  | "face_free";

export const SIGNAL_LABELS: Record<ThumbnailSignalName, string> = {
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

export interface ThumbnailSignal {
  name: ThumbnailSignalName;
  label: string;
  channelA: number;   // 0-1 percentage
  channelB: number;   // 0-1 percentage
  gap: number;        // percentage points (channelA - channelB)
  priority: "HIGHEST" | "HIGH" | "MEDIUM" | "LOW";
}

// ── Thumbnail Correlation ──

export type SignalCorrelation = "strong_positive" | "moderate_positive" | "neutral" | "negative";

export interface ThumbnailCorrelation {
  signal: ThumbnailSignalName;
  label: string;
  correlation: SignalCorrelation;
  topPresence: number;
  bottomPresence: number;
  gapPp: number;
}

// ── Outlier Videos ──

export interface OutlierVideo {
  id: string;
  title: string;
  viewCount: number;
  thumbnailUrl: string;
  multiplier: number;          // e.g. 4.2 means 4.2x channel average
  whyItWorked: string;         // AI explanation
}

// ── Title Intelligence (expanded from TitleAnalysis) ──

export interface TitleFormula {
  pattern: string;             // e.g. "How to [X] in [Time]"
  examples: string[];          // 2-3 real titles
  count: number;               // how many titles match
}

export interface TitleIntelligenceChannel {
  formulas: TitleFormula[];
  avgWordCount: number;
  emotionalToneMix: Record<string, number>;
  questionRatio: number;
  numberUsage: number;
  specificityScore: number;
  firstWordDistribution: { word: string; count: number }[];
  powerWordExamples: string[];
}

export interface TitleIntelligence {
  channelA: TitleIntelligenceChannel;
  channelB: TitleIntelligenceChannel;
}

// ── Engagement ──

export interface EngagementData {
  channelA: { avgLikeRate: number; avgCommentRate: number; combinedRate: number };
  channelB: { avgLikeRate: number; avgCommentRate: number; combinedRate: number };
  winner: "a" | "b" | "tie";
}

// ── Format Mix ──

export interface FormatBucket {
  label: string;
  count: number;
  percentage: number;
  avgViews: number;
}

export interface FormatMixChannel {
  buckets: FormatBucket[];
  verticalPct: number;
  horizontalPct: number;
  verticalAvgViews: number;
  horizontalAvgViews: number;
}

export interface FormatMixData {
  channelA: FormatMixChannel;
  channelB: FormatMixChannel;
}

// ── Upload Cadence (replaces ConsistencyData) ──

export interface UploadCadenceChannel {
  postsPerWeek: number;
  grade: string;
  trend: "up" | "down" | "stable";
  monthlyCounts: { month: string; count: number }[];
  longestGapDays: number;
  bestDayOfWeek: string;
  bestDayAvgViews: number;
  momentum: {
    recent30: number;
    prior30: number;
    ratio: number;
    label: "accelerating" | "decelerating" | "stable";
  };
  algorithmResetRisk: boolean;
}

export interface UploadCadenceData {
  channelA: UploadCadenceChannel;
  channelB: UploadCadenceChannel;
}

// ── View Velocity ──

export interface ViewVelocityChannel {
  quartiles: { label: string; avgViews: number; count: number }[];
  shape: "spiked" | "moderate" | "consistent";
  topBottomRatio: number;
}

export interface ViewVelocityData {
  channelA: ViewVelocityChannel;
  channelB: ViewVelocityChannel;
}

// ── Tag Strategy ──

export interface TagStrategyChannel {
  avgTagsPerVideo: number;
  totalUniqueTags: number;
  specificityMix: { broad: number; medium: number; niche: number };
  topCategories: string[];
}

export interface TagStrategyData {
  channelA: TagStrategyChannel;
  channelB: TagStrategyChannel;
  uniqueOpportunities: string[];
}

// ── Channel Grade ──

export interface ChannelGrade {
  letter: "A" | "B" | "C" | "D" | "F";
  rationale: string;
}

// ── Viral Outputs ──

export interface StealThisTactic {
  action: string;
  proof: string;
}

export interface RoastCards {
  forA: string;  // Roast aimed at Channel A
  forB: string;  // Roast aimed at Channel B
}

export interface ViralOutputs {
  roastCard: string | RoastCards;  // string for legacy audits, RoastCards for new
  stealThisStrategy: StealThisTactic[];
  tweetableCallout: string;
  grades: { channelA: ChannelGrade; channelB: ChannelGrade };
}

// Helper for backwards compat with old Supabase audits
export function getRoastCards(roastCard: string | RoastCards): RoastCards {
  if (typeof roastCard === "string") {
    return { forA: roastCard, forB: roastCard };
  }
  return roastCard;
}

// ── Structured Core Finding ──

export interface CoreFindingMetric {
  label: string;   // 2-3 words, e.g. "Engagement Gap"
  value: string;   // number/ratio, e.g. "3.2x"
  context: string; // max 8 words, e.g. "Ali wins but buries it in volume"
}

export interface CoreFindingStructured {
  headline: string;
  metrics: CoreFindingMetric[];
}

export function getCoreFinding(cf: string | CoreFindingStructured): CoreFindingStructured {
  if (typeof cf === "string") {
    return { headline: cf.split(". ")[0] || cf, metrics: [] };
  }
  return cf;
}

// ── Comparison Presets ──

export interface PresetData {
  channelA: string;
  channelB: string;
  channelAName: string;
  channelBName: string;
  teaser: string;
}

// ── Full Analysis Result ──

export interface AnalysisResult {
  channelA: ChannelData;
  channelB: ChannelData;
  signals: ThumbnailSignal[];
  coreFinding: string;
  coreFindingStructured?: CoreFindingStructured;
  outlierVideos: {
    channelA: OutlierVideo[];
    channelB: OutlierVideo[];
  };
  analyzedAt: string;

  // Expanded (replaced)
  titleIntelligence: TitleIntelligence;
  uploadCadence: UploadCadenceData;

  // New analysis
  thumbnailCorrelation: ThumbnailCorrelation[];
  engagement: EngagementData;
  formatMix: FormatMixData;
  viewVelocity: ViewVelocityData;
  tagStrategy: TagStrategyData;

  // New viral
  viral: ViralOutputs;

  // Shareable
  slug?: string;
}

// ── SSE Progress ──

export type AnalysisPhase =
  | "resolving_channels"
  | "fetching_videos"
  | "analyzing_thumbnails"
  | "computing_metrics"
  | "generating_insights"
  | "complete"
  | "error";

export interface ProgressEvent {
  phase: AnalysisPhase;
  message: string;
  data?: AnalysisResult;
  remaining?: number;  // Audits remaining for this IP today
  statusUrl?: string;  // Link to provider status page on transient errors
}
