"use client";

import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import type { PresetData } from "@/lib/types";

const PRESETS: PresetData[] = [
  {
    channelA: "@MrBeast",
    channelB: "@midtiergaming",
    channelAName: "MrBeast",
    channelBName: "Mid-tier Gaming",
    teaser: "The gap that built a $500M empire",
  },
  {
    channelA: "@aliabdaal",
    channelB: "@ThomasFrankExplains",
    channelAName: "Ali Abdaal",
    channelBName: "Thomas Frank",
    teaser: "Productivity titans go head-to-head",
  },
  {
    channelA: "@mkbhd",
    channelB: "@LinusTechTips",
    channelAName: "MKBHD",
    channelBName: "Linus Tech Tips",
    teaser: "Clean vs chaos — which thumbnails win?",
  },
  {
    channelA: "@GrahamStephan",
    channelB: "@AndreiJikh",
    channelAName: "Graham Stephan",
    channelBName: "Andrei Jikh",
    teaser: "Finance YouTube's closest rivalry",
  },
  {
    channelA: "@JeffNippard",
    channelB: "@midtierfitness",
    channelAName: "Jeff Nippard",
    channelBName: "Mid-tier Fitness",
    teaser: "Science vs bro — the thumbnail truth",
  },
];

export default function ComparisonPresets() {
  const router = useRouter();

  function handleClick(preset: PresetData) {
    router.push(`/results?a=${encodeURIComponent(preset.channelA)}&b=${encodeURIComponent(preset.channelB)}`);
  }

  return (
    <div className="animate-fade-in-up" style={{ opacity: 0, animationDelay: "400ms" }}>
      <div className="label-mono mb-3 text-center">Famous Matchups</div>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.channelA}
            onClick={() => handleClick(preset)}
            className="card p-3 card-accent text-left hover:border-[var(--accent-border)] transition-all group"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Zap size={10} className="text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-[10px] text-[var(--accent)] font-bold uppercase tracking-wider">
                {preset.channelAName} vs {preset.channelBName}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              {preset.teaser}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
