"use client";

import { Heart, MessageCircle, Trophy } from "lucide-react";
import type { EngagementData } from "@/lib/types";

interface Props {
  data: EngagementData;
  channelAName: string;
  channelBName: string;
}

function MetricRow({
  label,
  icon: Icon,
  valueA,
  valueB,
  channelAName,
  channelBName,
  format,
}: {
  label: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  valueA: number;
  valueB: number;
  channelAName: string;
  channelBName: string;
  format: (v: number) => string;
}) {
  const aWins = valueA > valueB;
  const bWins = valueB > valueA;
  const maxVal = Math.max(valueA, valueB);
  const barA = maxVal > 0 ? (valueA / maxVal) * 100 : 0;
  const barB = maxVal > 0 ? (valueB / maxVal) * 100 : 0;

  // Delta badge
  const gapPp = Math.abs((valueA - valueB) * 100);
  const winnerName = aWins ? channelAName : bWins ? channelBName : null;
  const relativeGap = maxVal > 0 ? Math.abs(valueA - valueB) / maxVal : 0;
  const isSignificant = relativeGap > 0.1;

  return (
    <div className="py-3">
      {/* Header: icon + label + delta badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-[var(--text-muted)]" />
          <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>
        </div>
        {winnerName && (
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded"
            style={{
              backgroundColor: isSignificant ? "var(--accent-dim)" : "rgba(136, 136, 170, 0.08)",
              color: isSignificant ? "var(--accent)" : "var(--text-muted)",
            }}
          >
            {winnerName} +{gapPp.toFixed(2)}pp
          </span>
        )}
      </div>

      {/* Channel A bar */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[11px] text-[var(--text-secondary)] w-20 truncate shrink-0">
          {channelAName}
        </span>
        <div className="flex-1 h-4 rounded-sm overflow-hidden bg-[var(--bg-elevated)]">
          <div
            className="h-full rounded-sm transition-all duration-500"
            style={{
              width: `${barA}%`,
              backgroundColor: aWins ? "var(--accent)" : "var(--text-muted)",
              opacity: aWins ? 0.8 : 0.3,
            }}
          />
        </div>
        <span className="data-readout text-[11px] w-14 text-right shrink-0">
          {format(valueA)}
        </span>
      </div>

      {/* Channel B bar */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[var(--text-secondary)] w-20 truncate shrink-0">
          {channelBName}
        </span>
        <div className="flex-1 h-4 rounded-sm overflow-hidden bg-[var(--bg-elevated)]">
          <div
            className="h-full rounded-sm transition-all duration-500"
            style={{
              width: `${barB}%`,
              backgroundColor: bWins ? "var(--accent)" : "var(--text-muted)",
              opacity: bWins ? 0.8 : 0.3,
            }}
          />
        </div>
        <span className="data-readout text-[11px] w-14 text-right shrink-0">
          {format(valueB)}
        </span>
      </div>
    </div>
  );
}

export default function EngagementRate({ data, channelAName, channelBName }: Props) {
  const fmt = (v: number) => `${(v * 100).toFixed(2)}%`;

  return (
    <div className="animate-fade-in-up" style={{ opacity: 0, animationDelay: "200ms" }}>
      <div className="label-mono mb-3">Engagement Rate Comparison</div>
      <div className="card p-4">
        <MetricRow
          label="Like Rate"
          icon={Heart}
          valueA={data.channelA.avgLikeRate}
          valueB={data.channelB.avgLikeRate}
          channelAName={channelAName}
          channelBName={channelBName}
          format={fmt}
        />

        <div className="border-t border-[var(--border)]" />

        <MetricRow
          label="Comment Rate"
          icon={MessageCircle}
          valueA={data.channelA.avgCommentRate}
          valueB={data.channelB.avgCommentRate}
          channelAName={channelAName}
          channelBName={channelBName}
          format={fmt}
        />

        <div className="border-t border-[var(--border)]" />

        <MetricRow
          label="Combined"
          icon={Trophy}
          valueA={data.channelA.combinedRate}
          valueB={data.channelB.combinedRate}
          channelAName={channelAName}
          channelBName={channelBName}
          format={fmt}
        />

        {data.winner !== "tie" && (
          <div className="mt-2 pt-2 border-t border-[var(--border)] text-center">
            <span className="text-[10px] uppercase tracking-wider text-[var(--positive)]">
              {data.winner === "a" ? channelAName : channelBName} leads in engagement
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
