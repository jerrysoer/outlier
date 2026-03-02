"use client";

import { useRef, useState } from "react";
import { Download, Loader2, Check } from "lucide-react";
import { toPng } from "html-to-image";
import type { AnalysisResult } from "@/lib/types";

interface Props {
  result: AnalysisResult;
}

function gradeColor(letter: string): string {
  switch (letter[0]) {
    case "A": return "#0D9373";
    case "B": return "#3B7DD8";
    case "C": return "#B8860B";
    case "D": return "#C27A1A";
    case "F": return "#DC4A3E";
    default: return "#A8A29E";
  }
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return n.toString();
}

interface MetricRow {
  label: string;
  valueA: string;
  valueB: string;
  rawA: number;
  rawB: number;
  winnerA: boolean;
  winnerB: boolean;
}

function barWidth(raw: number, max: number): number {
  if (max === 0) return 50;
  return (raw / max) * 100;
}

function deriveMetrics(result: AnalysisResult): MetricRow[] {
  const rows: MetricRow[] = [];

  // 1. Engagement Rate
  const engA = result.engagement.channelA.combinedRate * 100;
  const engB = result.engagement.channelB.combinedRate * 100;
  rows.push({
    label: "Engagement Rate",
    valueA: `${engA.toFixed(2)}%`,
    valueB: `${engB.toFixed(2)}%`,
    rawA: engA,
    rawB: engB,
    winnerA: engA > engB,
    winnerB: engB > engA,
  });

  // 2. Avg Views
  const avgViewsA = result.channelA.videos.length > 0
    ? result.channelA.videos.reduce((s, v) => s + v.viewCount, 0) / result.channelA.videos.length
    : 0;
  const avgViewsB = result.channelB.videos.length > 0
    ? result.channelB.videos.reduce((s, v) => s + v.viewCount, 0) / result.channelB.videos.length
    : 0;
  rows.push({
    label: "Avg Views",
    valueA: formatCompact(Math.round(avgViewsA)),
    valueB: formatCompact(Math.round(avgViewsB)),
    rawA: avgViewsA,
    rawB: avgViewsB,
    winnerA: avgViewsA > avgViewsB,
    winnerB: avgViewsB > avgViewsA,
  });

  // 3. Upload Frequency
  const freqA = result.uploadCadence.channelA.postsPerWeek;
  const freqB = result.uploadCadence.channelB.postsPerWeek;
  rows.push({
    label: "Upload Frequency",
    valueA: `${freqA}/wk`,
    valueB: `${freqB}/wk`,
    rawA: freqA,
    rawB: freqB,
    winnerA: freqA > freqB,
    winnerB: freqB > freqA,
  });

  // 4. Top Signal Gap (biggest absolute gap signal)
  if (result.signals.length > 0) {
    const topSig = result.signals[0];
    const pctA = Math.round(topSig.channelA * 100);
    const pctB = Math.round(topSig.channelB * 100);
    rows.push({
      label: topSig.label,
      valueA: `${pctA}%`,
      valueB: `${pctB}%`,
      rawA: pctA,
      rawB: pctB,
      winnerA: pctA > pctB,
      winnerB: pctB > pctA,
    });
  }

  // 5. Tags / Video
  const tagsA = result.tagStrategy.channelA.avgTagsPerVideo;
  const tagsB = result.tagStrategy.channelB.avgTagsPerVideo;
  rows.push({
    label: "Tags / Video",
    valueA: `${tagsA}`,
    valueB: `${tagsB}`,
    rawA: tagsA,
    rawB: tagsB,
    winnerA: tagsA > tagsB,
    winnerB: tagsB > tagsA,
  });

  return rows;
}

export default function HeadToHeadCard({ result }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const channelAName = result.channelA.meta.title;
  const channelBName = result.channelB.meta.title;
  const gradeA = result.viral.grades.channelA;
  const gradeB = result.viral.grades.channelB;
  const metrics = deriveMetrics(result);

  async function handleDownload() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        width: 1080,
        height: 1080,
        pixelRatio: 1,
        backgroundColor: "#FAF9F6",
      });
      const link = document.createElement("a");
      link.download = `outlier-h2h-${channelAName.toLowerCase().replace(/\s+/g, "-")}-vs-${channelBName.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();

      fetch("/api/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "h2h_downloaded", properties: { channelA: channelAName, channelB: channelBName } }),
      }).catch(() => {});
    } catch {
      // Download failed silently
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="animate-fade-in-up" style={{ opacity: 0, animationDelay: "100ms" }}>
      <div className="label-mono mb-3">Head to Head</div>

      {/* Card — constrained for display, toPng forces 1080×1080 on export */}
      <div className="max-w-md mx-auto">
        <div
          ref={cardRef}
          style={{
            aspectRatio: "1 / 1",
            background: "linear-gradient(180deg, #FAF9F6 0%, #FFFFFF 100%)",
            border: "2px solid #E0DDD6",
          }}
          className="relative rounded-xl overflow-hidden flex flex-col px-10 py-8"
        >
          {/* Zone 1: Header — grades as hero + channel names + sub count */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span
                className="text-5xl font-bold font-mono leading-none flex-shrink-0"
                style={{ color: gradeColor(gradeA.letter) }}
              >
                {gradeA.letter}
              </span>
              <div className="min-w-0">
                <p className="text-lg font-bold text-[#2C2924] truncate">{channelAName}</p>
                <p className="text-xs text-[#A8A29E] uppercase tracking-wider">
                  {formatCompact(result.channelA.meta.subscriberCount)} subscribers
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 mx-3">
              <span className="text-sm font-bold tracking-widest text-[#C8C4BC] uppercase">VS</span>
            </div>
            <div className="flex items-center gap-3 flex-1 min-w-0 justify-end">
              <div className="min-w-0 text-right">
                <p className="text-lg font-bold text-[#2C2924] truncate">{channelBName}</p>
                <p className="text-xs text-[#A8A29E] uppercase tracking-wider">
                  {formatCompact(result.channelB.meta.subscriberCount)} subscribers
                </p>
              </div>
              <span
                className="text-5xl font-bold font-mono leading-none flex-shrink-0"
                style={{ color: gradeColor(gradeB.letter) }}
              >
                {gradeB.letter}
              </span>
            </div>
          </div>
          <div className="h-0.5 bg-[#E0DDD6] my-5" />

          {/* Zone 2: Bar charts — flex-1 to fill space, centered vertically */}
          <div className="relative z-10 flex-1 flex flex-col justify-center">
            <div className="flex flex-col gap-4">
              {metrics.map((row, i) => {
                const max = Math.max(row.rawA, row.rawB);
                const widthA = barWidth(row.rawA, max);
                const widthB = barWidth(row.rawB, max);

                return (
                  <div key={i} className="flex flex-col gap-1.5">
                    {/* Metric label */}
                    <span className="text-xs text-[#6B6560] uppercase tracking-wide font-medium">
                      {row.label}
                    </span>

                    {/* Channel A bar row */}
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-xs text-[#2C2924] truncate font-medium flex-shrink-0">
                        {channelAName}
                      </span>
                      <div className="flex-1 h-4 rounded-sm overflow-hidden" style={{ backgroundColor: "#E8E5E0" }}>
                        <div
                          className="h-full rounded-sm transition-all"
                          style={{
                            width: `${widthA}%`,
                            backgroundColor: row.winnerA ? "#0D9373" : "#D6D3CE",
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-mono font-bold flex-shrink-0 w-14 text-right"
                        style={{ color: row.winnerA ? "#0D9373" : "#A8A29E" }}
                      >
                        {row.valueA}
                      </span>
                      {row.winnerA ? (
                        <div className="w-4 h-4 rounded-full bg-[#0D9373] flex items-center justify-center flex-shrink-0">
                          <Check size={10} color="#fff" strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-4 h-4 flex-shrink-0" />
                      )}
                    </div>

                    {/* Channel B bar row */}
                    <div className="flex items-center gap-2">
                      <span className="w-16 text-xs text-[#2C2924] truncate font-medium flex-shrink-0">
                        {channelBName}
                      </span>
                      <div className="flex-1 h-4 rounded-sm overflow-hidden" style={{ backgroundColor: "#E8E5E0" }}>
                        <div
                          className="h-full rounded-sm transition-all"
                          style={{
                            width: `${widthB}%`,
                            backgroundColor: row.winnerB ? "#0D9373" : "#D6D3CE",
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-mono font-bold flex-shrink-0 w-14 text-right"
                        style={{ color: row.winnerB ? "#0D9373" : "#A8A29E" }}
                      >
                        {row.valueB}
                      </span>
                      {row.winnerB ? (
                        <div className="w-4 h-4 rounded-full bg-[#0D9373] flex items-center justify-center flex-shrink-0">
                          <Check size={10} color="#fff" strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-4 h-4 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Zone 3: Footer watermark */}
          <div className="h-0.5 bg-[#E0DDD6] my-5" />
          <div className="relative z-10 text-center">
            <span className="text-xs text-[#C8C4BC] uppercase tracking-widest">
              Analyzed by Outlier · getoutlier.app
            </span>
          </div>
        </div>
      </div>

      {/* Download button */}
      <div className="flex justify-center mt-3">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs
                     text-[var(--text-muted)] hover:text-[var(--text-secondary)]
                     border border-[var(--border)] hover:border-[var(--border-bright)]
                     transition-all duration-200 disabled:opacity-50"
        >
          {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          Download card (1080×1080)
        </button>
      </div>
    </div>
  );
}
