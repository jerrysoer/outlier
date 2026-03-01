"use client";

import { Crosshair } from "lucide-react";
import type { StealThisTactic } from "@/lib/types";

interface Props {
  tactics: StealThisTactic[];
  channelBName: string;
}

export default function StealThis({ tactics, channelBName }: Props) {
  if (tactics.length === 0) return null;

  return (
    <div className="animate-fade-in-up" style={{ opacity: 0, animationDelay: "200ms" }}>
      <div className="label-mono mb-3">
        Steal This from {channelBName}
      </div>

      <div className="space-y-3">
        {tactics.map((tactic, i) => (
          <div key={i} className="card p-4 card-accent">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--accent-dim)] flex items-center justify-center">
                <Crosshair size={16} className="text-[var(--accent)]" />
              </div>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {tactic.action}
              </p>
              <span className="ml-auto flex-shrink-0 max-w-[200px] truncate rounded-full bg-[var(--accent-dim)] px-3 py-1 text-xs font-mono text-[var(--accent)]">
                {tactic.proof}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
