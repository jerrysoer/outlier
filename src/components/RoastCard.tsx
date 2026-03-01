"use client";

import { useRef, useState } from "react";
import { Flame, Download, Loader2 } from "lucide-react";
import { toPng } from "html-to-image";
import type { RoastCards } from "@/lib/types";
import { getRoastCards } from "@/lib/types";

interface Props {
  roastCard: string | RoastCards;
  channelAName: string;
  channelBName: string;
  slug?: string;
}

function SingleRoastCard({
  text,
  targetName,
  cardRef,
}: {
  text: string;
  targetName: string;
  cardRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={cardRef}
      className="card p-6 relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0A0A0F 0%, #0A1A15 100%)",
        border: "1px solid rgba(6, 214, 160, 0.2)",
        aspectRatio: "1 / 1",
      }}
    >
      {/* Glow effect */}
      <div
        className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top right, rgba(6, 214, 160, 0.08), transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Flame size={18} style={{ color: "#06D6A0" }} />
          <span
            className="text-[11px] uppercase tracking-widest font-bold"
            style={{ color: "#06D6A0" }}
          >
            Roasting {targetName}
          </span>
        </div>

        {/* Roast text */}
        <p className="text-lg sm:text-xl font-bold leading-snug text-[var(--text-primary)] flex-1 flex items-center py-4">
          &ldquo;{text}&rdquo;
        </p>

        {/* Watermark */}
        <div className="flex items-center justify-end">
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
            Analyzed by Outlier
          </span>
        </div>
      </div>
    </div>
  );
}

export default function RoastCard({
  roastCard,
  channelAName,
  channelBName,
}: Props) {
  const cards = getRoastCards(roastCard);
  const refA = useRef<HTMLDivElement>(null);
  const refB = useRef<HTMLDivElement>(null);
  const [downloadingA, setDownloadingA] = useState(false);
  const [downloadingB, setDownloadingB] = useState(false);

  async function handleDownload(
    ref: React.RefObject<HTMLDivElement | null>,
    channelName: string,
    setLoading: (v: boolean) => void
  ) {
    if (!ref.current) return;
    setLoading(true);
    try {
      const dataUrl = await toPng(ref.current, {
        width: 1080,
        height: 1080,
        pixelRatio: 2,
        backgroundColor: "#0A0A0F",
      });
      const link = document.createElement("a");
      link.download = `outlier-roast-${channelName.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = dataUrl;
      link.click();

      // Fire analytics event
      fetch("/api/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "roast_downloaded", properties: { channel: channelName } }),
      }).catch(() => {});
    } catch {
      // Download failed silently
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="animate-fade-in-up"
      style={{ opacity: 0, animationDelay: "100ms" }}
    >
      <div className="label-mono mb-3">The Roast</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Card roasting Channel A */}
        <div>
          <SingleRoastCard
            text={cards.forA}
            targetName={channelAName}
            cardRef={refA}
          />
          <button
            onClick={() => handleDownload(refA, channelAName, setDownloadingA)}
            disabled={downloadingA}
            className="flex items-center gap-2 mt-3 mx-auto px-3 py-1.5 rounded-md text-xs
                       text-[var(--text-muted)] hover:text-[var(--text-secondary)]
                       border border-[var(--border)] hover:border-[var(--border-bright)]
                       transition-all duration-200 disabled:opacity-50"
          >
            {downloadingA ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            Save as image
          </button>
        </div>

        {/* Card roasting Channel B */}
        <div>
          <SingleRoastCard
            text={cards.forB}
            targetName={channelBName}
            cardRef={refB}
          />
          <button
            onClick={() => handleDownload(refB, channelBName, setDownloadingB)}
            disabled={downloadingB}
            className="flex items-center gap-2 mt-3 mx-auto px-3 py-1.5 rounded-md text-xs
                       text-[var(--text-muted)] hover:text-[var(--text-secondary)]
                       border border-[var(--border)] hover:border-[var(--border-bright)]
                       transition-all duration-200 disabled:opacity-50"
          >
            {downloadingB ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
            Save as image
          </button>
        </div>
      </div>
    </div>
  );
}
