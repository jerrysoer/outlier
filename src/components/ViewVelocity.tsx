"use client";

import { useState } from "react";
import type { ViewVelocityData } from "@/lib/types";

interface Props {
  data: ViewVelocityData;
  channelAName: string;
  channelBName: string;
}

function ShapeBadge({ shape }: { shape: string }) {
  const config: Record<string, { color: string; label: string }> = {
    spiked: { color: "var(--negative)", label: "Spiked" },
    moderate: { color: "var(--caution)", label: "Moderate" },
    consistent: { color: "var(--positive)", label: "Consistent" },
  };
  const c = config[shape] ?? config.moderate;

  return (
    <span
      className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
      style={{ color: c.color, background: `color-mix(in srgb, ${c.color} 10%, transparent)` }}
    >
      {c.label}
    </span>
  );
}

export default function ViewVelocity({ data, channelAName, channelBName }: Props) {
  const [activeTab, setActiveTab] = useState<"a" | "b">("a");
  const channel = activeTab === "a" ? data.channelA : data.channelB;

  // Find max for bar scaling
  const maxViews = Math.max(...channel.quartiles.map((q) => q.avgViews), 1);

  return (
    <div className="animate-fade-in-up" style={{ opacity: 0, animationDelay: "300ms" }}>
      <div className="label-mono mb-3">View Velocity Distribution</div>

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

      <div className="card p-4">
        {/* Shape + ratio header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShapeBadge shape={channel.shape} />
            <span className="text-xs text-[var(--text-secondary)]">distribution</span>
          </div>
          <span className="data-readout text-xs">
            Top/Bottom ratio: <span className="text-[var(--text-primary)] font-bold">{channel.topBottomRatio}x</span>
          </span>
        </div>

        {/* Quartile bars */}
        <div className="space-y-3">
          {channel.quartiles.map((q) => {
            const pct = Math.round((q.avgViews / maxViews) * 100);
            return (
              <div key={q.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[var(--text-secondary)]">{q.label}</span>
                  <span className="data-readout text-xs">{q.avgViews.toLocaleString()} avg views</span>
                </div>
                <div className="h-3 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: "var(--accent)" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
