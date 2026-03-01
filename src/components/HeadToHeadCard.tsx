"use client";

import { useRef, useState } from "react";
import { Download, Loader2, Check } from "lucide-react";
import { toPng } from "html-to-image";
import type { AnalysisResult } from "@/lib/types";

interface Props {
  result: AnalysisResult;
}

function gradeColor(letter: string): string {
  switch (letter) {
    case "A": return "#00D4AA";
    case "B": return "#4B8BF5";
    case "C": return "#F5C542";
    case "D": return "#FF8C42";
    case "F": return "#FF4D4D";
    default: return "#666";
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
  winnerA: boolean;
  winnerB: boolean;
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
        pixelRatio: 2,
        backgroundColor: "#0A0A0F",
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

      {/* Card */}
      <div
        ref={cardRef}
        style={{
          aspectRatio: "1 / 1",
          background: "linear-gradient(180deg, #0A0A0F 0%, #0D0D18 100%)",
          border: "1px solid rgba(255, 77, 0, 0.15)",
        }}
        className="rounded-xl overflow-hidden flex flex-col"
      >
        {/* Glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(255, 77, 0, 0.06), transparent 70%)" }}
        />

        {/* Header — channel names */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-6 pb-4">
          <div className="text-left flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{channelAName}</p>
            <p className="text-[10px] text-[#888] uppercase tracking-wider mt-0.5">
              {result.channelA.meta.subscriberCount.toLocaleString()} subs
            </p>
          </div>
          <div className="flex-shrink-0 mx-4">
            <span className="text-xs font-bold tracking-widest text-[#555] uppercase">VS</span>
          </div>
          <div className="text-right flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{channelBName}</p>
            <p className="text-[10px] text-[#888] uppercase tracking-wider mt-0.5">
              {result.channelB.meta.subscriberCount.toLocaleString()} subs
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-[#1A1A2E]" />

        {/* Metric rows */}
        <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-4 gap-3">
          {metrics.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              {/* Value A */}
              <div className="flex-1 flex items-center justify-end gap-2">
                <span
                  className="text-base font-bold font-mono"
                  style={{ color: row.winnerA ? "#FF4D00" : "#888" }}
                >
                  {row.valueA}
                </span>
                {row.winnerA && (
                  <div className="w-5 h-5 rounded-full bg-[#FF4D00] flex items-center justify-center flex-shrink-0">
                    <Check size={12} color="#fff" strokeWidth={3} />
                  </div>
                )}
                {!row.winnerA && <div className="w-5 h-5 flex-shrink-0" />}
              </div>

              {/* Label */}
              <div className="w-[130px] text-center flex-shrink-0">
                <span className="text-[11px] text-[#666] uppercase tracking-wide">
                  {row.label}
                </span>
              </div>

              {/* Value B */}
              <div className="flex-1 flex items-center gap-2">
                {row.winnerB && (
                  <div className="w-5 h-5 rounded-full bg-[#FF4D00] flex items-center justify-center flex-shrink-0">
                    <Check size={12} color="#fff" strokeWidth={3} />
                  </div>
                )}
                {!row.winnerB && <div className="w-5 h-5 flex-shrink-0" />}
                <span
                  className="text-base font-bold font-mono"
                  style={{ color: row.winnerB ? "#FF4D00" : "#888" }}
                >
                  {row.valueB}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mx-6 h-px bg-[#1A1A2E]" />

        {/* Grades + Watermark */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span
              className="text-3xl font-bold font-mono leading-none"
              style={{ color: gradeColor(gradeA.letter) }}
            >
              {gradeA.letter}
            </span>
            <span className="text-[10px] text-[#555] uppercase tracking-wider">Grade</span>
          </div>
          <span className="text-[10px] text-[#444] uppercase tracking-widest">
            Analyzed by Outlier
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#555] uppercase tracking-wider">Grade</span>
            <span
              className="text-3xl font-bold font-mono leading-none"
              style={{ color: gradeColor(gradeB.letter) }}
            >
              {gradeB.letter}
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
