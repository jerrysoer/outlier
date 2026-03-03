"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { swapChannels } from "@/lib/swap";
import GapTable from "@/components/GapTable";
import CoreFinding from "@/components/CoreFinding";
import OutlierCallout from "@/components/OutlierCallout";
import GradesBadge from "@/components/GradesBadge";
import HeadToHeadCard from "@/components/HeadToHeadCard";
import StealThis from "@/components/StealThis";
import ThumbnailCorrelation from "@/components/ThumbnailCorrelation";
import EngagementRate from "@/components/EngagementRate";
import ViewVelocity from "@/components/ViewVelocity";
import FormatBreakdown from "@/components/FormatBreakdown";
import UploadCadence from "@/components/UploadCadence";
import TitleIntelligence from "@/components/TitleIntelligence";
import TagStrategy from "@/components/TagStrategy";
import TweetableCallout from "@/components/TweetableCallout";
import ShareButton from "@/components/ShareButton";
import ChannelAvatar from "@/components/ChannelAvatar";
import OutlierWatermark from "@/components/OutlierWatermark";
import { ArrowLeftRight, ExternalLink } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";

function youtubeUrl(handle: string, title: string) {
  if (handle) return `https://youtube.com/${handle.startsWith("@") ? handle : `@${handle}`}`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`;
}

interface Props {
  result: AnalysisResult;
}

export default function SharedResultView({ result }: Props) {
  const router = useRouter();
  const [displayResult, setDisplayResult] = useState(result);
  const channelAName = displayResult.channelA.meta.title;
  const channelBName = displayResult.channelB.meta.title;

  return (
    <main className="min-h-screen px-6 sm:px-10 py-8 sm:py-12">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-[13px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Try your own
          </button>
          <span className="label-mono text-[var(--accent)]">Outlier</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Channel headers */}
        <div className="flex items-center gap-3 flex-wrap animate-fade-in" style={{ opacity: 0 }}>
          <div className="flex items-center gap-2">
            <ChannelAvatar src={displayResult.channelA.meta.thumbnailUrl} name={channelAName} />
            <a
              href={youtubeUrl(displayResult.channelA.meta.handle, channelAName)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1 text-sm font-medium hover:text-[var(--accent)] transition-colors"
            >
              {channelAName}
              <ExternalLink size={11} className="opacity-0 group-hover:opacity-60 transition-opacity" />
            </a>
            <span className="data-readout text-xs">
              {displayResult.channelA.meta.subscriberCount.toLocaleString()} subs
            </span>
          </div>
          <button
            onClick={() => setDisplayResult(prev => swapChannels(prev))}
            className="px-1.5 py-1 rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-dim)] transition-all"
            title="Swap channels"
          >
            <ArrowLeftRight size={14} />
          </button>
          <div className="flex items-center gap-2">
            <ChannelAvatar src={displayResult.channelB.meta.thumbnailUrl} name={channelBName} />
            <a
              href={youtubeUrl(displayResult.channelB.meta.handle, channelBName)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1 text-sm font-medium hover:text-[var(--accent)] transition-colors"
            >
              {channelBName}
              <ExternalLink size={11} className="opacity-0 group-hover:opacity-60 transition-opacity" />
            </a>
            <span className="data-readout text-xs">
              {displayResult.channelB.meta.subscriberCount.toLocaleString()} subs
            </span>
          </div>
          {displayResult.slug && (
            <div className="ml-auto">
              <ShareButton slug={displayResult.slug} channelAName={channelAName} channelBName={channelBName} />
            </div>
          )}
        </div>

        {/* Grade + Roast */}
        <GradesBadge grades={displayResult.viral.grades} channelAName={channelAName} channelBName={channelBName} />
        <HeadToHeadCard result={displayResult} />

        <div className="section-divider" />

        {/* Strategic Insights */}
        <CoreFinding finding={displayResult.coreFinding} structured={displayResult.coreFindingStructured} />
        <StealThis tactics={displayResult.viral.stealThisStrategy} channelAName={channelAName} />

        <div className="section-divider" />

        {/* Thumbnail Analysis */}
        <GapTable signals={displayResult.signals} channelAName={channelAName} channelBName={channelBName} />
        <ThumbnailCorrelation correlations={displayResult.thumbnailCorrelation} />
        <OutlierCallout channelAName={channelAName} channelBName={channelBName} outliersA={displayResult.outlierVideos.channelA} outliersB={displayResult.outlierVideos.channelB} />

        <div className="section-divider" />

        {/* Content Performance */}
        <EngagementRate data={displayResult.engagement} channelAName={channelAName} channelBName={channelBName} />
        <ViewVelocity data={displayResult.viewVelocity} channelAName={channelAName} channelBName={channelBName} />
        <FormatBreakdown data={displayResult.formatMix} channelAName={channelAName} channelBName={channelBName} />

        <div className="section-divider" />

        {/* Content Strategy */}
        <UploadCadence data={displayResult.uploadCadence} channelAName={channelAName} channelBName={channelBName} />
        <TitleIntelligence data={displayResult.titleIntelligence} channelAName={channelAName} channelBName={channelBName} />
        <TagStrategy data={displayResult.tagStrategy} channelAName={channelAName} channelBName={channelBName} />

        <div className="section-divider" />

        {/* Share + Viral */}
        <TweetableCallout text={displayResult.viral.tweetableCallout} slug={displayResult.slug} />
        {displayResult.slug && (
          <div className="flex justify-center">
            <ShareButton slug={displayResult.slug} channelAName={channelAName} channelBName={channelBName} />
          </div>
        )}
        <OutlierWatermark />

        {/* CTA */}
        <div className="text-center mb-8">
          <button
            onClick={() => router.push("/")}
            className="btn-primary px-6 py-3 text-[14px]"
          >
            Analyze your own channels
          </button>
        </div>
      </div>
    </main>
  );
}
