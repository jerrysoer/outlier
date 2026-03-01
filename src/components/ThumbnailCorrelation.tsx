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

function DumbbellTile({ data }: { data: ThumbnailCorrelationType }) {
  const config = CORRELATION_CONFIG[data.correlation];

  // Positions on a 0-100% horizontal scale
  const bottomPos = Math.max(0, Math.min(100, data.bottomPresence));
  const topPos = Math.max(0, Math.min(100, data.topPresence));
  const leftPos = Math.min(bottomPos, topPos);
  const rightPos = Math.max(bottomPos, topPos);

  // Determine left border color by correlation type
  const borderColor = data.correlation === "neutral"
    ? "var(--border)"
    : config.color;

  const isNeutral = data.correlation === "neutral";

  return (
    <div
      className="card p-3"
      style={{
        borderLeftWidth: 3,
        borderLeftColor: borderColor,
        opacity: isNeutral ? 0.7 : 1,
      }}
    >
      {/* Header: signal name + correlation dot */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[13px] font-medium text-[var(--text-primary)] truncate">
          {data.label}
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="correlation-dot"
            style={{ backgroundColor: config.color }}
          />
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
            {config.label}
          </span>
        </div>
      </div>

      {/* Dumbbell track */}
      <div className="dumbbell-track">
        {/* Connecting line */}
        <div
          className="dumbbell-line"
          style={{
            left: `${leftPos}%`,
            width: `${rightPos - leftPos}%`,
            backgroundColor: config.color,
            opacity: 0.4,
          }}
        />

        {/* Bottom-10 dot (left conceptually) */}
        <div
          className="dumbbell-dot"
          style={{
            left: `${bottomPos}%`,
            backgroundColor: isNeutral ? "var(--bg-elevated)" : config.color,
            opacity: 0.6,
          }}
        />
        <span
          className="dumbbell-label"
          style={{ left: `${bottomPos}%` }}
        >
          {data.bottomPresence}%
        </span>

        {/* Top-10 dot (right conceptually) */}
        <div
          className="dumbbell-dot"
          style={{
            left: `${topPos}%`,
            backgroundColor: config.color,
          }}
        />
        <span
          className="dumbbell-label"
          style={{ left: `${topPos}%` }}
        >
          {data.topPresence}%
        </span>
      </div>

      {/* Scale labels */}
      <div className="flex justify-between mt-4">
        <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">
          Bottom 10
        </span>
        <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">
          Top 10
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

  return (
    <div className="animate-fade-in-up" style={{ opacity: 0, animationDelay: "150ms" }}>
      <div className="label-mono mb-3">Thumbnail Performance Correlation</div>
      <p className="text-xs text-[var(--text-secondary)] mb-4">
        Which visual signals appear more in top-performing videos vs bottom-performing ones?
      </p>

      {/* 2-column grid — 1-col on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {sorted.map((c) => (
          <DumbbellTile key={c.signal} data={c} />
        ))}
      </div>
    </div>
  );
}
