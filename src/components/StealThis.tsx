"use client";

import { Crosshair } from "lucide-react";
import type { StealThisTactic } from "@/lib/types";

interface Props {
  tactics: StealThisTactic[];
  channelAName: string;
}

export default function StealThis({ tactics, channelAName }: Props) {
  if (tactics.length === 0) return null;

  return (
    <div className="animate-fade-in-up" style={{ opacity: 0, animationDelay: "200ms" }}>
      <div className="label-mono mb-3">
        Steal This from {channelAName}
      </div>

      <div className="space-y-3">
        {tactics.map((tactic, i) => (
          <div key={i} className="card p-4 card-accent">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[var(--accent-dim)] flex items-center justify-center mt-0.5">
                <Crosshair size={16} className="text-[var(--accent)]" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  {tactic.action}
                </p>
                <p className="mt-1 text-xs font-mono text-[var(--accent)]">
                  {tactic.proof}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
