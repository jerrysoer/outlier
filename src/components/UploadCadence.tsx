"use client";

import { TrendingUp, TrendingDown, Minus, AlertTriangle, Calendar, Clock } from "lucide-react";
import type { UploadCadenceData, UploadCadenceChannel } from "@/lib/types";

interface Props {
  data: UploadCadenceData;
  channelAName: string;
  channelBName: string;
}

function GradeCircle({ grade }: { grade: string }) {
  let color: string;
  if (grade.startsWith("A")) color = "var(--positive)";
  else if (grade.startsWith("B")) color = "#4B8BF5";
  else if (grade.startsWith("C")) color = "var(--caution)";
  else if (grade.startsWith("D")) color = "var(--warning)";
  else color = "var(--negative)";

  return (
    <div
      className="w-12 h-12 rounded-full flex items-center justify-center border-2 font-mono font-bold text-lg"
      style={{ borderColor: color, color }}
    >
      {grade}
    </div>
  );
}

function TrendArrow({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return <TrendingUp size={14} className="text-[var(--positive)]" />;
  if (trend === "down") return <TrendingDown size={14} className="text-[var(--negative)]" />;
  return <Minus size={14} className="text-[var(--text-muted)]" />;
}

function MomentumBadge({ label }: { label: string }) {
  const cls = label === "accelerating"
    ? "text-[var(--positive)] bg-[var(--positive-dim)]"
    : label === "decelerating"
      ? "text-[var(--negative)] bg-[var(--error-dim)]"
      : "text-[var(--text-muted)] bg-[var(--bg-elevated)]";

  return (
    <span className={`${cls} px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider`}>
      {label}
    </span>
  );
}

function ChannelCadenceCard({ name, data }: { name: string; data: UploadCadenceChannel }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-4 mb-3">
        <GradeCircle grade={data.grade} />
        <div className="flex-1">
          <div className="text-sm font-medium text-[var(--text-primary)] mb-1">{name}</div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="data-readout text-xs">{data.postsPerWeek} posts/week</span>
            <div className="flex items-center gap-1">
              <TrendArrow trend={data.trend} />
              <span className="text-[10px] text-[var(--text-muted)] uppercase">{data.trend}</span>
            </div>
            <MomentumBadge label={data.momentum.label} />
          </div>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
          <Calendar size={12} className="text-[var(--text-muted)]" />
          Best day: <span className="text-[var(--text-primary)] font-medium">{data.bestDayOfWeek}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
          <Clock size={12} className="text-[var(--text-muted)]" />
          Longest gap: <span className="text-[var(--text-primary)] font-medium">{data.longestGapDays}d</span>
        </div>
      </div>

      {data.algorithmResetRisk && (
        <div className="flex items-center gap-1.5 mt-2 text-[var(--warning)] text-xs">
          <AlertTriangle size={12} />
          Algorithm reset risk detected (14+ day gap recently)
        </div>
      )}

      {/* Momentum detail */}
      <div className="mt-3 pt-3 border-t border-[var(--border)]">
        <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">
          30-Day Momentum
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
          <span>Last 30d: <span className="text-[var(--text-primary)] font-bold">{data.momentum.recent30}</span> videos</span>
          <span>Prior 30d: <span className="text-[var(--text-primary)] font-bold">{data.momentum.prior30}</span> videos</span>
          <span>Ratio: <span className="text-[var(--text-primary)] font-bold">{data.momentum.ratio}x</span></span>
        </div>
      </div>
    </div>
  );
}

export default function UploadCadence({ data, channelAName, channelBName }: Props) {
  return (
    <div className="animate-fade-in-up" style={{ opacity: 0, animationDelay: "400ms" }}>
      <div className="label-mono mb-3">Upload Cadence & Momentum</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ChannelCadenceCard name={channelAName} data={data.channelA} />
        <ChannelCadenceCard name={channelBName} data={data.channelB} />
      </div>
    </div>
  );
}
