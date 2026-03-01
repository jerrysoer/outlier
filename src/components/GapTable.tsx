"use client";

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

function PercentageBar({ value, color }: { value: number; color: string }) {
  const pct = Math.round(value * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="data-readout text-xs w-10 text-right">{pct}%</span>
    </div>
  );
}

function GapNumber({ gap }: { gap: number }) {
  const isPositive = gap > 0;
  const color = isPositive ? "var(--positive)" : gap < 0 ? "var(--negative)" : "var(--text-muted)";
  const prefix = gap > 0 ? "+" : "";

  return (
    <span
      className="font-mono text-lg font-bold tabular-nums"
      style={{ color }}
    >
      {prefix}{gap}pp
    </span>
  );
}

export default function GapTable({
  signals,
  channelAName,
  channelBName,
}: GapTableProps) {
  return (
    <div className="animate-fade-in-up" style={{ opacity: 0 }}>
      <div className="label-mono mb-3">Thumbnail Signal Gap Analysis</div>

      {/* Desktop table */}
      <div
        className="hidden md:block card overflow-hidden"
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                Signal
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider w-40">
                {channelAName}
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider w-40">
                {channelBName}
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider w-24">
                Gap
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider w-24">
                Priority
              </th>
            </tr>
          </thead>
          <tbody>
            {signals.map((signal, i) => (
              <tr
                key={signal.name}
                className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-elevated)] transition-colors"
                style={{
                  animationDelay: `${i * 50}ms`,
                }}
              >
                <td className="px-4 py-3 text-sm font-medium text-[var(--text-primary)]">
                  {signal.label}
                </td>
                <td className="px-4 py-3">
                  <PercentageBar value={signal.channelA} color="var(--text-secondary)" />
                </td>
                <td className="px-4 py-3">
                  <PercentageBar value={signal.channelB} color="var(--accent)" />
                </td>
                <td className="px-4 py-3 text-center">
                  <GapNumber gap={signal.gap} />
                </td>
                <td className="px-4 py-3 text-center">
                  <PriorityPill priority={signal.priority} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {signals.map((signal, i) => (
          <div
            key={signal.name}
            className="card p-4 animate-fade-in"
            style={{ opacity: 0, animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {signal.label}
              </span>
              <PriorityPill priority={signal.priority} />
            </div>

            <div className="space-y-2">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  {channelAName}
                </div>
                <PercentageBar value={signal.channelA} color="var(--text-secondary)" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">
                  {channelBName}
                </div>
                <PercentageBar value={signal.channelB} color="var(--accent)" />
              </div>
            </div>

            <div className="mt-3 text-center">
              <GapNumber gap={signal.gap} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
