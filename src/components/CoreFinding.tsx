"use client";

import { Lightbulb } from "lucide-react";

interface CoreFindingProps {
  finding: string;
}

export default function CoreFinding({ finding }: CoreFindingProps) {
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
          <p className="text-[15px] leading-relaxed text-[var(--text-primary)]">
            {finding}
          </p>
        </div>
      </div>
    </div>
  );
}
