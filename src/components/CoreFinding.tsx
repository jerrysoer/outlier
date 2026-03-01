"use client";

import { Lightbulb } from "lucide-react";
import type { CoreFindingStructured } from "@/lib/types";
import { getCoreFinding } from "@/lib/types";

interface CoreFindingProps {
  finding: string;
  structured?: CoreFindingStructured;
}

export default function CoreFinding({ finding, structured }: CoreFindingProps) {
  const { headline, metrics } = structured ?? getCoreFinding(finding);

  return (
    <div
      className="animate-fade-in-up"
      style={{ opacity: 0, animationDelay: "200ms" }}
    >
      <div className="label-mono mb-3">Core Finding</div>
      <div className="bg-[var(--bg-surface)] border-l-4 border-[var(--accent)] rounded-r-lg p-5">
        <div className="flex gap-3">
          <Lightbulb
            size={18}
            className="text-[var(--accent)] flex-shrink-0 mt-0.5"
          />
          <div className="flex-1">
            <p className="text-[17px] font-bold leading-snug text-[var(--text-primary)]">
              {headline}
            </p>
            {metrics.length > 0 && (
              <div className="mt-3 space-y-2">
                {metrics.map((m, i) => (
                  <div key={i} className="flex items-baseline gap-3 text-sm">
                    <span className="text-[var(--text-muted)] w-[120px] flex-shrink-0 text-xs uppercase tracking-wide">
                      {m.label}
                    </span>
                    <span className="font-bold font-mono text-[var(--accent)]">
                      {m.value}
                    </span>
                    <span className="text-[var(--text-secondary)] text-xs">
                      {m.context}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
