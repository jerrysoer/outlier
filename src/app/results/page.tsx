"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import LoadingState from "@/components/LoadingState";
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
import type { AnalysisPhase, ProgressEvent, AnalysisResult } from "@/lib/types";

function youtubeUrl(handle: string, title: string) {
  if (handle) return `https://youtube.com/${handle.startsWith("@") ? handle : `@${handle}`}`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(title)}`;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const channelA = searchParams.get("a") || "";
  const channelB = searchParams.get("b") || "";

  // Capture admin secret from URL if present
  useEffect(() => {
    const adminParam = searchParams.get("admin");
    if (adminParam) {
      sessionStorage.setItem("outlier_admin", adminParam);
    }
  }, [searchParams]);

  const [phase, setPhase] = useState<AnalysisPhase>("resolving_channels");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);

  const runAnalysis = useCallback(async () => {
    if (!channelA || !channelB) return;

    try {
      // Include admin secret if present (persisted from ?admin= URL param)
      const adminSecret = typeof window !== "undefined"
        ? sessionStorage.getItem("outlier_admin")
        : null;

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channelA,
          channelB,
          ...(adminSecret && { adminSecret }),
        }),
      });

      if (response.status === 429) {
        setRateLimited(true);
        const data = await response.json();
        setError(data.error || "Rate limit reached");
        return;
      }

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // Cache hit: server returns JSON instead of SSE stream
      const contentType = response.headers.get("Content-Type") || "";
      if (contentType.includes("application/json")) {
        const json = await response.json();
        if (json.cached && json.data) {
          setResult(json.data);
          if (json.data.slug) {
            window.history.pushState({}, "", `/results/${json.data.slug}`);
          }
          return;
        }
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6);

          try {
            const event: ProgressEvent = JSON.parse(jsonStr);
            setPhase(event.phase);
            setMessage(event.message);

            if (event.phase === "error") {
              setError(event.message);
              return;
            }

            if (event.phase === "complete" && event.data) {
              setResult(event.data);
              // Push shareable URL if slug available
              if (event.data.slug) {
                window.history.pushState({}, "", `/results/${event.data.slug}`);
              }
              return;
            }
          } catch {
            // Skip malformed events
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred");
    }
  }, [channelA, channelB]);

  useEffect(() => {
    if (channelA && channelB) {
      runAnalysis();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleTryAnother() {
    router.push("/");
  }

  // No channels in URL — but skip if we already have a result or error
  // (pushState to /results/[slug] clears query params before React re-renders)
  if ((!channelA || !channelB) && !result && !error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-3 tracking-tight">
            No channels specified
          </h1>
          <p className="text-[var(--text-secondary)] mb-6">
            Go back and enter two YouTube channel URLs to compare.
          </p>
          <button onClick={handleTryAnother} className="btn-primary px-6 py-3 text-[14px]">
            Back to Outlier
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 sm:px-10 py-8 sm:py-12">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleTryAnother}
            className="flex items-center gap-2 text-[13px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            New analysis
          </button>
          <span className="label-mono text-[var(--accent)]">Outlier</span>
        </div>
      </div>

      {/* Loading State */}
      {!result && !error && (
        <div className="max-w-4xl mx-auto py-12">
          <LoadingState currentPhase={phase} message={message} />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="max-w-lg mx-auto text-center py-12 animate-fade-in-scale" style={{ opacity: 0 }}>
          <div className="w-14 h-14 rounded-2xl bg-[var(--error-dim)] flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="var(--error)" strokeWidth="1.5" />
              <path d="M12 8V13" stroke="var(--error)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="16" r="0.5" fill="var(--error)" stroke="var(--error)" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2 tracking-tight">
            {rateLimited ? "Daily limit reached" : "Analysis failed"}
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)] mb-6 max-w-sm mx-auto">
            {error}
          </p>
          <div className="flex gap-3 justify-center">
            {rateLimited ? (
              <button
                onClick={() => router.push("/waitlist")}
                className="btn-primary px-5 py-2.5 text-[14px]"
              >
                Join waitlist for more
              </button>
            ) : (
              <button
                onClick={() => {
                  setError(null);
                  setPhase("resolving_channels");
                  setMessage("");
                  runAnalysis();
                }}
                className="btn-primary px-5 py-2.5 text-[14px]"
              >
                Try again
              </button>
            )}
            <button
              onClick={handleTryAnother}
              className="px-5 py-2.5 text-[14px] rounded-lg border border-[var(--border)] text-[var(--text-secondary)]
                         hover:border-[var(--border-bright)] hover:text-[var(--text-primary)] transition-all"
            >
              New analysis
            </button>
          </div>
        </div>
      )}

      {/* Results Display */}
      {result && <ResultsDisplay result={result} onTryAnother={handleTryAnother} />}
    </main>
  );
}

function ResultsDisplay({ result, onTryAnother }: { result: AnalysisResult; onTryAnother: () => void }) {
  const router = useRouter();
  const channelAName = result.channelA.meta.title;
  const channelBName = result.channelB.meta.title;

  function handleFlip() {
    const handleA = result.channelA.meta.handle || channelAName;
    const handleB = result.channelB.meta.handle || channelBName;
    // Full navigation needed: pushState to /results/[slug] desynchronizes
    // the Next.js router, and the analysis useEffect has [] deps (mount-only)
    window.location.href = `/results?a=${encodeURIComponent(handleB)}&b=${encodeURIComponent(handleA)}`;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Channel headers */}
      <div className="flex items-center gap-3 flex-wrap animate-fade-in" style={{ opacity: 0 }}>
        <div className="flex items-center gap-2">
          <ChannelAvatar src={result.channelA.meta.thumbnailUrl} name={channelAName} />
          <a
            href={youtubeUrl(result.channelA.meta.handle, channelAName)}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1 text-sm font-medium hover:text-[var(--accent)] transition-colors"
          >
            {channelAName}
            <ExternalLink size={11} className="opacity-0 group-hover:opacity-60 transition-opacity" />
          </a>
          <span className="data-readout text-xs">
            {result.channelA.meta.subscriberCount.toLocaleString()} subs
          </span>
        </div>
        <button
          onClick={handleFlip}
          className="px-1.5 py-1 rounded-md text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent-dim)] transition-all"
          title="Swap channels"
        >
          <ArrowLeftRight size={14} />
        </button>
        <div className="flex items-center gap-2">
          <ChannelAvatar src={result.channelB.meta.thumbnailUrl} name={channelBName} />
          <a
            href={youtubeUrl(result.channelB.meta.handle, channelBName)}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1 text-sm font-medium hover:text-[var(--accent)] transition-colors"
          >
            {channelBName}
            <ExternalLink size={11} className="opacity-0 group-hover:opacity-60 transition-opacity" />
          </a>
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

      {/* ═══ Grade + Roast (hero zone) ═══ */}
      <GradesBadge
        grades={result.viral.grades}
        channelAName={channelAName}
        channelBName={channelBName}
      />
      <HeadToHeadCard result={result} />

      <div className="section-divider" />

      {/* ═══ Strategic Insights ═══ */}
      <CoreFinding finding={result.coreFinding} structured={result.coreFindingStructured} />
      <StealThis
        tactics={result.viral.stealThisStrategy}
        channelBName={channelBName}
      />

      <div className="section-divider" />

      {/* ═══ Thumbnail Analysis ═══ */}
      <div className="animate-fade-in" style={{ opacity: 0 }}>
        <h3 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">
          Thumbnail DNA
        </h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          How your visual signals compare across 50 videos per channel
        </p>
      </div>
      <GapTable
        signals={result.signals}
        channelAName={channelAName}
        channelBName={channelBName}
      />
      <ThumbnailCorrelation correlations={result.thumbnailCorrelation} />
      <OutlierCallout
        channelAName={channelAName}
        channelBName={channelBName}
        outliersA={result.outlierVideos.channelA}
        outliersB={result.outlierVideos.channelB}
      />

      <div className="section-divider" />

      {/* ═══ Content Performance ═══ */}
      <EngagementRate
        data={result.engagement}
        channelAName={channelAName}
        channelBName={channelBName}
      />
      <ViewVelocity
        data={result.viewVelocity}
        channelAName={channelAName}
        channelBName={channelBName}
      />
      <FormatBreakdown
        data={result.formatMix}
        channelAName={channelAName}
        channelBName={channelBName}
      />

      <div className="section-divider" />

      {/* ═══ Content Strategy ═══ */}
      <UploadCadence
        data={result.uploadCadence}
        channelAName={channelAName}
        channelBName={channelBName}
      />
      <TitleIntelligence
        data={result.titleIntelligence}
        channelAName={channelAName}
        channelBName={channelBName}
      />
      <TagStrategy
        data={result.tagStrategy}
        channelAName={channelAName}
        channelBName={channelBName}
      />

      <div className="section-divider" />

      {/* ═══ Share + Viral ═══ */}
      <TweetableCallout
        text={result.viral.tweetableCallout}
        slug={result.slug}
      />

      {result.slug && (
        <div className="flex justify-center">
          <ShareButton slug={result.slug} />
        </div>
      )}

      <OutlierWatermark />

      {/* CTA */}
      <div className="text-center mb-8 animate-fade-in" style={{ opacity: 0, animationDelay: "700ms" }}>
        <button
          onClick={onTryAnother}
          className="px-6 py-3 rounded-lg border border-[var(--border)] text-[14px]
                     text-[var(--text-secondary)] hover:border-[var(--accent-border)]
                     hover:text-[var(--accent)] hover:bg-[var(--accent-dim)]
                     transition-all duration-200"
        >
          Analyze different channels
        </button>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse-dot w-3 h-3 rounded-full bg-[var(--accent)]" />
        </main>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
