"use client";

import type { ThumbnailCorrelation as ThumbnailCorrelationType } from "@/lib/types";

interface Props {
  correlations: ThumbnailCorrelationType[];
}

const CORRELATION_CONFIG = {
  strong_positive: { color: "var(--positive)", label: "Strong +" },
  moderate_positive: { color: "#4B8BF5", label: "Moderate +" },
  neutral: { color: "var(--text-muted)", label: "Neutral" },
  negative: { color: "var(--negative)", label: "Negative" },
} as const;

function BarRow({ data, maxGap }: { data: ThumbnailCorrelationType; maxGap: number }) {
  const config = CORRELATION_CONFIG[data.correlation];
  const isNeutral = data.correlation === "neutral";
  const barWidth = maxGap > 0 ? (Math.abs(data.gapPp) / maxGap) * 100 : 0;
  const isPositive = data.gapPp >= 0;
  const prefix = isPositive ? "+" : "";

  return (
    <div
      className="grid items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
      style={{
        gridTemplateColumns: "140px 1fr 60px",
        opacity: isNeutral ? 0.6 : 1,
      }}
    >
      {/* Signal name + correlation dot */}
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: config.color }}
        />
        <span className="text-[13px] text-[var(--text-primary)] truncate">
          {data.label}
        </span>
      </div>

      {/* Diverging bar */}
      <div className="relative h-5 flex items-center">
        {/* Center axis */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[var(--border-bright)]" />

        {/* Bar: extends left (negative) or right (positive) from center */}
        {isPositive ? (
          <div
            className="absolute left-1/2 h-full rounded-r-sm transition-all duration-500"
            style={{
              width: `${barWidth / 2}%`,
              backgroundColor: config.color,
              opacity: 0.8,
            }}
          />
        ) : (
          <div
            className="absolute right-1/2 h-full rounded-l-sm transition-all duration-500"
            style={{
              width: `${barWidth / 2}%`,
              backgroundColor: config.color,
              opacity: 0.8,
            }}
          />
        )}
      </div>

      {/* Gap badge */}
      <div className="text-right">
        <span
          className="inline-block px-1.5 py-0.5 rounded text-[11px] font-mono"
          style={{
            backgroundColor: isNeutral
              ? "rgba(136, 136, 170, 0.1)"
              : `color-mix(in srgb, ${config.color} 12%, transparent)`,
            color: config.color,
          }}
        >
          {prefix}{data.gapPp}pp
        </span>
      </div>
    </div>
  );
}

export default function ThumbnailCorrelation({ correlations }: Props) {
  // Sort: strong signals first, neutral last
  const sortOrder = { strong_positive: 0, moderate_positive: 1, negative: 2, neutral: 3 };
  const sorted = [...correlations].sort(
    (a, b) => sortOrder[a.correlation] - sortOrder[b.correlation]
  );

  const maxGap = Math.max(...correlations.map((c) => Math.abs(c.gapPp)), 1);

  return (
    <div className="animate-fade-in-up" style={{ opacity: 0, animationDelay: "150ms" }}>
      <div className="label-mono mb-3">Thumbnail Performance Correlation</div>
      <p className="text-xs text-[var(--text-secondary)] mb-4">
        Across both channels: which visual signals appear more in top-performing videos vs bottom-performing ones?
      </p>

      <div className="card p-2">
        {/* Axis header */}
        <div
          className="grid items-center gap-3 px-3 py-2 border-b border-[var(--border)]"
          style={{ gridTemplateColumns: "140px 1fr 60px" }}
        >
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            Signal
          </span>
          <div className="flex justify-between text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            <span>◄ More in bottom 10</span>
            <span>More in top 10 ►</span>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] text-right">
            Gap
          </span>
        </div>

        {/* Rows */}
        {sorted.map((c) => (
          <BarRow key={c.signal} data={c} maxGap={maxGap} />
        ))}
      </div>
    </div>
  );
}
