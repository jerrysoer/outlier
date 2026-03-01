"use client";

import { useState } from "react";
import { TrendingUp, Play } from "lucide-react";
import type { OutlierVideo } from "@/lib/types";

interface OutlierCalloutProps {
  channelAName: string;
  channelBName: string;
  outliersA: OutlierVideo[];
  outliersB: OutlierVideo[];
}

function OutlierCard({ video }: { video: OutlierVideo }) {
  return (
    <div className="card p-4 card-accent">
      <div className="flex gap-3">
        {/* Thumbnail */}
        <div className="relative flex-shrink-0 w-32 h-18 rounded-lg overflow-hidden bg-[var(--bg-elevated)]">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          {/* Play icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
            <Play size={20} className="text-white" />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-[var(--text-primary)] line-clamp-2 mb-1">
            {video.title}
          </h4>
          <div className="flex items-center gap-2 mb-2">
            <span className="data-readout text-xs">
              {video.viewCount.toLocaleString()} views
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--positive-dim)] text-[var(--positive)] text-[10px] font-bold">
              <TrendingUp size={10} />
              {video.multiplier}x avg
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {video.whyItWorked}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OutlierCallout({
  channelAName,
  channelBName,
  outliersA,
  outliersB,
}: OutlierCalloutProps) {
  const [activeTab, setActiveTab] = useState<"a" | "b">("a");

  const outliers = activeTab === "a" ? outliersA : outliersB;

  return (
    <div
      className="animate-fade-in-up"
      style={{ opacity: 0, animationDelay: "300ms" }}
    >
      <div className="label-mono mb-3">View Velocity Outliers</div>

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

      {/* Outlier cards */}
      <div className="space-y-3">
        {outliers.length > 0 ? (
          outliers.map((video) => (
            <OutlierCard key={video.id} video={video} />
          ))
        ) : (
          <p className="text-sm text-[var(--text-muted)]">
            No significant outliers detected.
          </p>
        )}
      </div>
    </div>
  );
}
