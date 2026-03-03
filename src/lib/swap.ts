import type { AnalysisResult } from "./types";

/**
 * Swap channelA and channelB in a result object.
 * Mirrors the server-side swap in api/analyze/route.ts (cache-hit path).
 */
export function swapChannels(result: AnalysisResult): AnalysisResult {
  return {
    ...result,
    channelA: result.channelB,
    channelB: result.channelA,
    signals: result.signals.map((s) => ({
      ...s,
      channelA: s.channelB,
      channelB: s.channelA,
      gap: -s.gap,
    })),
    outlierVideos: {
      channelA: result.outlierVideos.channelB,
      channelB: result.outlierVideos.channelA,
    },
    titleIntelligence: {
      channelA: result.titleIntelligence.channelB,
      channelB: result.titleIntelligence.channelA,
    },
    engagement: {
      channelA: result.engagement.channelB,
      channelB: result.engagement.channelA,
      winner:
        result.engagement.winner === "a" ? "b"
        : result.engagement.winner === "b" ? "a"
        : "tie",
    },
    formatMix: {
      channelA: result.formatMix.channelB,
      channelB: result.formatMix.channelA,
    },
    uploadCadence: {
      channelA: result.uploadCadence.channelB,
      channelB: result.uploadCadence.channelA,
    },
    viewVelocity: {
      channelA: result.viewVelocity.channelB,
      channelB: result.viewVelocity.channelA,
    },
    tagStrategy: {
      ...result.tagStrategy,
      channelA: result.tagStrategy.channelB,
      channelB: result.tagStrategy.channelA,
    },
    viral: {
      ...result.viral,
      grades: {
        channelA: result.viral.grades.channelB,
        channelB: result.viral.grades.channelA,
      },
    },
    // Unchanged: thumbnailCorrelation, coreFinding, slug,
    // viral.stealThisStrategy, viral.tweetableCallout, viral.roastCard
  };
}
