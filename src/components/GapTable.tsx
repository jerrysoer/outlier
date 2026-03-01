"use client";

import { useState } from "react";
import type { ThumbnailSignal } from "@/lib/types";

interface GapTableProps {
  signals: ThumbnailSignal[];
  channelAName: string;
  channelBName: string;
}

function PriorityPill({ priority }: { priority: string }) {
  const cls =
    priority === "HIGHEST"
      ? "priority-highest"
      : priority === "HIGH"
        ? "priority-high"
        : priority === "MEDIUM"
          ? "priority-medium"
          : "priority-low";

  return (
    <span
      className={`${cls} inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase`}
    >
      {priority}
    </span>
  );
}

function ButterflyRow({
  signal,
  maxPct,
}: {
  signal: ThumbnailSignal;
  maxPct: number;
}) {
  const [hovered, setHovered] = useState(false);
  const pctA = Math.round(signal.channelA * 100);
  const pctB = Math.round(signal.channelB * 100);
  const isHigh = signal.priority === "HIGH" || signal.priority === "HIGHEST";

  // Scale bars relative to the maximum percentage across all signals
  const scaleA = maxPct > 0 ? (pctA / maxPct) * 100 : 0;
  const scaleB = maxPct > 0 ? (pctB / maxPct) * 100 : 0;

  return (
    <div
      className={`butterfly-row ${isHigh ? "butterfly-row--high" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Channel A bar — grows right-to-left */}
      <div className="butterfly-bar-left">
        <div
          className="butterfly-fill"
          style={{ flexBasis: `${scaleA}%` }}
        />
        {hovered && (
          <span className="data-readout text-[11px] ml-2 tabular-nums shrink-0">
            {pctA}%
          </span>
        )}
      </div>

      {/* Center axis — signal name */}
      <div className="butterfly-axis">
        <span>{signal.label}</span>
      </div>

      {/* Channel B bar — grows left-to-right */}
      <div className="butterfly-bar-right">
        {hovered && (
          <span className="data-readout text-[11px] mr-2 tabular-nums shrink-0">
            {pctB}%
          </span>
        )}
        <div
          className="butterfly-fill"
          style={{ flexBasis: `${scaleB}%` }}
        />
      </div>

      {/* Priority pill — only for HIGH+ */}
      <div className="shrink-0 w-20 text-right">
        {isHigh ? (
          <PriorityPill priority={signal.priority} />
        ) : hovered ? (
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
            {signal.priority}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function GapTable({
  signals,
  channelAName,
  channelBName,
}: GapTableProps) {
  // Sort by absolute gap descending — biggest differences at top
  const sorted = [...signals].sort(
    (a, b) => Math.abs(b.gap) - Math.abs(a.gap)
  );

  // Find the maximum percentage for bar scaling
  const maxPct = Math.max(
    ...signals.map((s) => Math.max(Math.round(s.channelA * 100), Math.round(s.channelB * 100)))
  );

  // Actionable callouts: only HIGH/HIGHEST priority signals
  const actionable = sorted.filter(
    (s) => s.priority === "HIGH" || s.priority === "HIGHEST"
  );

  return (
    <div className="animate-fade-in-up" style={{ opacity: 0 }}>
      <div className="label-mono mb-3">Thumbnail Signal Gap Analysis</div>

      {/* Butterfly chart */}
      <div className="card overflow-hidden">
        {/* Header row */}
        <div className="flex items-center px-3 py-2 border-b border-[var(--border)]">
          <div className="flex-1 text-right">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              {channelAName}
            </span>
          </div>
          <div className="butterfly-axis">
            <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
              Signal
            </span>
          </div>
          <div className="flex-1">
            <span className="text-[10px] uppercase tracking-wider text-[var(--accent)]">
              {channelBName}
            </span>
          </div>
          <div className="shrink-0 w-20" />
        </div>

        {/* Signal rows */}
        {sorted.map((signal) => (
          <ButterflyRow
            key={signal.name}
            signal={signal}
            maxPct={maxPct}
          />
        ))}
      </div>

      {/* Compact actionable callouts */}
      {actionable.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {actionable.map((s) => {
            const winner = s.gap > 0 ? channelAName : channelBName;
            return (
              <div
                key={s.name}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--accent-dim)] border border-[var(--accent-border)] text-[12px]"
              >
                <span className="font-medium text-[var(--text-primary)]">
                  {s.label}
                </span>
                <span className="text-[var(--accent)] font-mono font-bold tabular-nums">
                  {s.gap > 0 ? "+" : ""}{s.gap}pp
                </span>
                <span className="text-[var(--text-muted)]">
                  → {winner}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
