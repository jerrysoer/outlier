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
  format,
}: {
  label: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  valueA: number;
  valueB: number;
  format: (v: number) => string;
}) {
  const aWins = valueA > valueB;
  const bWins = valueB > valueA;

  return (
    <div className="flex items-center gap-3 py-2">
      <Icon size={14} className="text-[var(--text-muted)] flex-shrink-0" />
      <span className="text-xs text-[var(--text-secondary)] w-24">{label}</span>
      <span className={`data-readout text-xs flex-1 text-right ${aWins ? "text-[var(--positive)] font-bold" : ""}`}>
        {format(valueA)}
      </span>
      <span className={`data-readout text-xs flex-1 text-right ${bWins ? "text-[var(--positive)] font-bold" : ""}`}>
        {format(valueB)}
      </span>
    </div>
  );
}

export default function EngagementRate({ data, channelAName, channelBName }: Props) {
  const fmt = (v: number) => `${(v * 100).toFixed(2)}%`;

  return (
    <div className="animate-fade-in-up" style={{ opacity: 0, animationDelay: "200ms" }}>
      <div className="label-mono mb-3">Engagement Rate Comparison</div>
      <div className="card p-4">
        {/* Header */}
        <div className="flex items-center gap-3 pb-2 border-b border-[var(--border)] mb-2">
          <div className="w-24" />
          <div className="flex-1 text-right text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            {channelAName}
          </div>
          <div className="flex-1 text-right text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            {channelBName}
          </div>
        </div>

        <MetricRow label="Like Rate" icon={Heart} valueA={data.channelA.avgLikeRate} valueB={data.channelB.avgLikeRate} format={fmt} />
        <MetricRow label="Comment Rate" icon={MessageCircle} valueA={data.channelA.avgCommentRate} valueB={data.channelB.avgCommentRate} format={fmt} />

        <div className="border-t border-[var(--border)] mt-2 pt-2">
          <MetricRow label="Combined" icon={Trophy} valueA={data.channelA.combinedRate} valueB={data.channelB.combinedRate} format={fmt} />
        </div>

        {data.winner !== "tie" && (
          <div className="mt-3 text-center">
            <span className="text-[10px] uppercase tracking-wider text-[var(--positive)]">
              {data.winner === "a" ? channelAName : channelBName} leads in engagement
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
