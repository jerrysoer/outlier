"use client";

import { useState } from "react";
import type { FormatMixData } from "@/lib/types";

interface Props {
  data: FormatMixData;
  channelAName: string;
  channelBName: string;
}

function FormatBar({ percentage, color }: { percentage: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-3 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <span className="data-readout text-xs w-10 text-right">{percentage}%</span>
    </div>
  );
}

export default function FormatBreakdown({ data, channelAName, channelBName }: Props) {
  const [activeTab, setActiveTab] = useState<"a" | "b">("a");
  const channel = activeTab === "a" ? data.channelA : data.channelB;

  return (
    <div className="animate-fade-in-up" style={{ opacity: 0, animationDelay: "250ms" }}>
      <div className="label-mono mb-3">Format & Duration Breakdown</div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-4 p-1 rounded-lg bg-[var(--bg-surface)] inline-flex">
        <button
          onClick={() => setActiveTab("a")}
          className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
            activeTab === "a"
              ? "bg-[var(--bg-elevated)] text-[var(--text-primary)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          }`}
        >
          {channelAName}
        </button>
        <button
          onClick={() => setActiveTab("b")}
          className={`px-4 py-2 rounded-md text-xs font-medium transition-all ${
            activeTab === "b"
              ? "bg-[var(--bg-elevated)] text-[var(--text-primary)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          }`}
        >
          {channelBName}
        </button>
      </div>

      {/* Format buckets */}
      <div className="space-y-3">
        {channel.buckets.map((bucket) => (
          <div key={bucket.label} className="card p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[var(--text-primary)]">{bucket.label}</span>
              <span className="data-readout text-xs">{bucket.count} videos</span>
            </div>
            <FormatBar percentage={bucket.percentage} color="var(--accent)" />
            {bucket.count > 0 && (
              <div className="mt-1 text-right">
                <span className="text-[10px] text-[var(--text-muted)]">
                  Avg: {bucket.avgViews.toLocaleString()} views
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Vertical vs Horizontal */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="card p-3 text-center">
          <div className="text-lg font-bold text-[var(--text-primary)]">{channel.verticalPct}%</div>
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Vertical (Shorts)</div>
          {channel.verticalAvgViews > 0 && (
            <div className="text-[10px] text-[var(--text-secondary)] mt-1">
              {channel.verticalAvgViews.toLocaleString()} avg views
            </div>
          )}
        </div>
        <div className="card p-3 text-center">
          <div className="text-lg font-bold text-[var(--text-primary)]">{channel.horizontalPct}%</div>
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Horizontal</div>
          {channel.horizontalAvgViews > 0 && (
            <div className="text-[10px] text-[var(--text-secondary)] mt-1">
              {channel.horizontalAvgViews.toLocaleString()} avg views
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
