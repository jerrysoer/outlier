"use client";

import { Tag, Lightbulb } from "lucide-react";
import type { TagStrategyData } from "@/lib/types";

interface Props {
  data: TagStrategyData;
  channelAName: string;
  channelBName: string;
}

function SpecificityBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider w-14">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 bg-[var(--accent)]"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="data-readout text-xs w-10 text-right">{value}%</span>
    </div>
  );
}

function ChannelTagCard({
  name,
  data,
}: {
  name: string;
  data: Props["data"]["channelA"];
}) {
  return (
    <div className="card p-4">
      <div className="text-sm font-medium text-[var(--text-primary)] mb-3">{name}</div>

      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <Tag size={12} className="text-[var(--text-muted)]" />
          <span className="data-readout text-xs">
            {data.avgTagsPerVideo} tags/video
          </span>
        </div>
        <span className="data-readout text-xs">
          {data.totalUniqueTags} unique
        </span>
      </div>

      {/* Specificity mix */}
      <div className="space-y-1.5 mb-3">
        <SpecificityBar label="Broad" value={data.specificityMix.broad} />
        <SpecificityBar label="Medium" value={data.specificityMix.medium} />
        <SpecificityBar label="Niche" value={data.specificityMix.niche} />
      </div>

      {/* Top categories */}
      {data.topCategories.length > 0 && (
        <div>
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
            Top Categories
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {data.topCategories.map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-xs text-[var(--text-secondary)] border border-[var(--border)]"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TagStrategy({ data, channelAName, channelBName }: Props) {
  return (
    <div className="animate-fade-in-up" style={{ opacity: 0, animationDelay: "550ms" }}>
      <div className="label-mono mb-3">Tag Strategy</div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ChannelTagCard name={channelAName} data={data.channelA} />
        <ChannelTagCard name={channelBName} data={data.channelB} />
      </div>

      {/* Unique opportunities */}
      {data.uniqueOpportunities.length > 0 && (
        <div className="card p-4 mt-3">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={14} className="text-[var(--accent)]" />
            <span className="text-sm font-medium text-[var(--text-primary)]">Tag Opportunities</span>
          </div>
          <div className="space-y-1">
            {data.uniqueOpportunities.map((opp, i) => (
              <p key={i} className="text-xs text-[var(--text-secondary)] pl-3 border-l border-[var(--accent-border)]">
                {opp}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
