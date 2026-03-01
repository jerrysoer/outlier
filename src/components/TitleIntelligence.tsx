"use client";

import { useState } from "react";
import type { TitleIntelligence as TitleIntelligenceType } from "@/lib/types";

interface Props {
  data: TitleIntelligenceType;
  channelAName: string;
  channelBName: string;
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">{label}:</span>
      <span className="text-xs font-bold text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

function FormulaCard({ formula }: { formula: { pattern: string; examples: string[]; count: number } }) {
  return (
    <div className="card p-4 card-accent">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[var(--text-primary)] font-mono">{formula.pattern}</span>
        <span className="data-readout text-xs">{formula.count} videos</span>
      </div>
      <div className="space-y-1">
        {formula.examples.slice(0, 2).map((example, i) => (
          <p key={i} className="text-xs text-[var(--text-secondary)] pl-3 border-l border-[var(--border)]">
            &ldquo;{example}&rdquo;
          </p>
        ))}
      </div>
    </div>
  );
}

export default function TitleIntelligence({ data, channelAName, channelBName }: Props) {
  const [activeTab, setActiveTab] = useState<"a" | "b">("a");
  const channel = activeTab === "a" ? data.channelA : data.channelB;

  // Top 5 emotional tones
  const tones = Object.entries(channel.emotionalToneMix)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="animate-fade-in-up" style={{ opacity: 0, animationDelay: "500ms" }}>
      <div className="label-mono mb-3">Title Intelligence (7D Analysis)</div>

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

      {/* Stats row */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <StatPill label="Avg words" value={String(channel.avgWordCount)} />
        <StatPill label="Questions" value={`${Math.round(channel.questionRatio * 100)}%`} />
        <StatPill label="Numbers" value={`${Math.round(channel.numberUsage * 100)}%`} />
        <StatPill label="Specificity" value={`${channel.specificityScore}/10`} />
      </div>

      {/* Emotional tone mix */}
      {tones.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Emotional Tone Mix
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {tones.map(([tone, pct]) => (
              <span
                key={tone}
                className="px-2 py-1 rounded bg-[var(--bg-elevated)] text-xs text-[var(--text-secondary)] border border-[var(--border)]"
              >
                {tone} <span className="text-[var(--accent)] font-bold">{pct}%</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* First word distribution */}
      {channel.firstWordDistribution.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Most Common First Words
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {channel.firstWordDistribution.slice(0, 6).map((fw) => (
              <span
                key={fw.word}
                className="px-2 py-0.5 rounded-full bg-[var(--accent-dim)] text-[var(--accent)] text-[10px] font-medium border border-[var(--accent-border)]"
              >
                &ldquo;{fw.word}&rdquo; ({fw.count})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Power words */}
      {channel.powerWordExamples.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Power Words
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {channel.powerWordExamples.map((word) => (
              <span
                key={word}
                className="px-2 py-0.5 rounded-full bg-[var(--accent-dim)] text-[var(--accent)] text-[10px] font-medium border border-[var(--accent-border)]"
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Formula cards */}
      <div className="space-y-3">
        {channel.formulas.length > 0 ? (
          channel.formulas.map((formula, i) => (
            <FormulaCard key={i} formula={formula} />
          ))
        ) : (
          <p className="text-sm text-[var(--text-muted)]">No clear title patterns detected.</p>
        )}
      </div>
    </div>
  );
}
