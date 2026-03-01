"use client";

import { useRouter } from "next/navigation";
import GapTable from "@/components/GapTable";
import CoreFinding from "@/components/CoreFinding";
import OutlierCallout from "@/components/OutlierCallout";
import GradesBadge from "@/components/GradesBadge";
import RoastCard from "@/components/RoastCard";
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
import { ArrowLeftRight } from "lucide-react";
import type { AnalysisResult } from "@/lib/types";

interface Props {
  result: AnalysisResult;
}

export default function SharedResultView({ result }: Props) {
  const router = useRouter();
  const channelAName = result.channelA.meta.title;
  const channelBName = result.channelB.meta.title;

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
            <ChannelAvatar src={result.channelA.meta.thumbnailUrl} name={channelAName} />
            <span className="text-sm font-medium">{channelAName}</span>
            <span className="data-readout text-xs">
              {result.channelA.meta.subscriberCount.toLocaleString()} subs
            </span>
          </div>
          <button
            onClick={() => {
              const handleA = result.channelA.meta.handle || channelAName;
              const handleB = result.channelB.meta.handle || channelBName;
              window.location.href = `/results?a=${encodeURIComponent(handleB)}&b=${encodeURIComponent(handleA)}`;
            }}
            className="px-1.5 py-1 rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-dim)] transition-all"
            title="Swap channels"
          >
            <ArrowLeftRight size={14} />
          </button>
          <div className="flex items-center gap-2">
            <ChannelAvatar src={result.channelB.meta.thumbnailUrl} name={channelBName} />
            <span className="text-sm font-medium">{channelBName}</span>
            <span className="data-readout text-xs">
              {result.channelB.meta.subscriberCount.toLocaleString()} subs
            </span>
          </div>
          {result.slug && (
            <div className="ml-auto">
              <ShareButton slug={result.slug} channelAName={channelAName} channelBName={channelBName} />
            </div>
          )}
        </div>

        {/* Grade + Roast */}
        <GradesBadge grades={result.viral.grades} channelAName={channelAName} channelBName={channelBName} />
        <RoastCard roastCard={result.viral.roastCard} channelAName={channelAName} channelBName={channelBName} slug={result.slug} />

        <div className="section-divider" />

        {/* Strategic Insights */}
        <CoreFinding finding={result.coreFinding} />
        <StealThis tactics={result.viral.stealThisStrategy} channelBName={channelBName} />

        <div className="section-divider" />

        {/* Thumbnail Analysis */}
        <GapTable signals={result.signals} channelAName={channelAName} channelBName={channelBName} />
        <ThumbnailCorrelation correlations={result.thumbnailCorrelation} />
        <OutlierCallout channelAName={channelAName} channelBName={channelBName} outliersA={result.outlierVideos.channelA} outliersB={result.outlierVideos.channelB} />

        <div className="section-divider" />

        {/* Content Performance */}
        <EngagementRate data={result.engagement} channelAName={channelAName} channelBName={channelBName} />
        <ViewVelocity data={result.viewVelocity} channelAName={channelAName} channelBName={channelBName} />
        <FormatBreakdown data={result.formatMix} channelAName={channelAName} channelBName={channelBName} />

        <div className="section-divider" />

        {/* Content Strategy */}
        <UploadCadence data={result.uploadCadence} channelAName={channelAName} channelBName={channelBName} />
        <TitleIntelligence data={result.titleIntelligence} channelAName={channelAName} channelBName={channelBName} />
        <TagStrategy data={result.tagStrategy} channelAName={channelAName} channelBName={channelBName} />

        <div className="section-divider" />

        {/* Share + Viral */}
        <TweetableCallout text={result.viral.tweetableCallout} slug={result.slug} />
        {result.slug && (
          <div className="flex justify-center">
            <ShareButton slug={result.slug} channelAName={channelAName} channelBName={channelBName} />
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
