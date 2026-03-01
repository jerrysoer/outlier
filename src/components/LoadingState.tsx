"use client";

import { Check } from "lucide-react";
import type { AnalysisPhase } from "@/lib/types";

const PHASES: { key: AnalysisPhase; label: string }[] = [
  { key: "resolving_channels", label: "Resolving channels" },
  { key: "fetching_videos", label: "Fetching videos" },
  { key: "analyzing_thumbnails", label: "Analyzing thumbnails" },
  { key: "computing_metrics", label: "Computing metrics" },
  { key: "generating_insights", label: "Generating insights" },
  { key: "complete", label: "Complete" },
];

const PHASE_ORDER: Record<AnalysisPhase, number> = {
  resolving_channels: 0,
  fetching_videos: 1,
  analyzing_thumbnails: 2,
  computing_metrics: 3,
  generating_insights: 4,
  complete: 5,
  error: -1,
};

interface LoadingStateProps {
  currentPhase: AnalysisPhase;
  message?: string;
}

export default function LoadingState({ currentPhase, message }: LoadingStateProps) {
  const currentIndex = PHASE_ORDER[currentPhase] ?? -1;

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="animate-pulse-dot w-3 h-3 rounded-full bg-[var(--accent)] mx-auto mb-4" />
        <p className="text-sm text-[var(--text-secondary)]">
          Usually takes 30-45 seconds
        </p>
      </div>

      <div className="space-y-3">
        {PHASES.map((phase, index) => {
          const isComplete = currentIndex > index;
          const isCurrent = currentIndex === index;

          return (
            <div
              key={phase.key}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isCurrent
                  ? "bg-[var(--accent-dim)] border border-[var(--accent-border)]"
                  : isComplete
                    ? "opacity-60"
                    : "opacity-30"
              }`}
            >
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                {isComplete ? (
                  <Check size={14} className="text-[var(--positive)]" />
                ) : isCurrent ? (
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse-dot" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
                )}
              </div>
              <span
                className={`text-sm font-medium ${
                  isCurrent
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)]"
                }`}
              >
                {phase.label}
              </span>
            </div>
          );
        })}
      </div>

      {message && (
        <p className="mt-6 text-center text-xs text-[var(--text-muted)] data-readout animate-fade-in">
          {message}
        </p>
      )}
    </div>
  );
}
