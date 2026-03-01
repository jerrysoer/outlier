"use client";

import type { ThumbnailCorrelation as ThumbnailCorrelationType } from "@/lib/types";

interface Props {
  correlations: ThumbnailCorrelationType[];
}

function CorrelationBadge({ correlation }: { correlation: ThumbnailCorrelationType["correlation"] }) {
  const config = {
    strong_positive: { label: "Strong +", cls: "text-[var(--positive)] bg-[var(--positive-dim)] border-[var(--positive)]" },
    moderate_positive: { label: "Moderate +", cls: "text-[#4B8BF5] bg-[rgba(75,139,245,0.08)] border-[#4B8BF5]" },
    neutral: { label: "Neutral", cls: "text-[var(--text-muted)] bg-[var(--bg-elevated)] border-[var(--border)]" },
    negative: { label: "Negative", cls: "text-[var(--negative)] bg-[var(--error-dim)] border-[var(--negative)]" },
  };
  const c = config[correlation];
  return (
    <span className={`${c.cls} inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border`}>
      {c.label}
    </span>
  );
}

export default function ThumbnailCorrelation({ correlations }: Props) {
  return (
    <div className="animate-fade-in-up" style={{ opacity: 0, animationDelay: "150ms" }}>
      <div className="label-mono mb-3">Thumbnail Performance Correlation</div>
      <p className="text-xs text-[var(--text-secondary)] mb-4">
        Which visual signals appear more in top-performing videos vs bottom-performing ones?
      </p>

      <div className="space-y-2">
        {correlations.map((c) => (
          <div key={c.signal} className="card p-3 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-[var(--text-primary)]">{c.label}</div>
              <div className="flex items-center gap-3 mt-1">
                <span className="data-readout text-xs">
                  Top 10: <span className="text-[var(--text-primary)] font-bold">{c.topPresence}%</span>
                </span>
                <span className="data-readout text-xs">
                  Bottom 10: <span className="text-[var(--text-primary)] font-bold">{c.bottomPresence}%</span>
                </span>
                <span className="data-readout text-xs">
                  Gap: <span className={c.gapPp > 0 ? "text-[var(--positive)] font-bold" : c.gapPp < 0 ? "text-[var(--negative)] font-bold" : ""}>{c.gapPp > 0 ? "+" : ""}{c.gapPp}pp</span>
                </span>
              </div>
            </div>
            <CorrelationBadge correlation={c.correlation} />
          </div>
        ))}
      </div>
    </div>
  );
}
