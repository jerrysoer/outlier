"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import type { PresetData } from "@/lib/types";

const PRESETS: PresetData[] = [
  {
    channelA: "@gregisenberg",
    channelB: "@ColeMedin",
    channelAName: "Greg Isenberg",
    channelBName: "Cole Medin",
    teaser: "Startup ideas vs hands-on AI agents",
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
    channelA: "@Jesser",
    channelB: "@GoodGood",
    channelAName: "Jesser",
    channelBName: "Good Good",
    teaser: "Court vs course — sports content clash",
  },
  {
    channelA: "@michellekhare",
    channelB: "@yestheory",
    channelAName: "Michelle Khare",
    channelBName: "Yes Theory",
    teaser: "Extreme challenges — solo grit vs squad energy",
  },
  {
    channelA: "@johnnyharris",
    channelB: "@wendoverproductions",
    channelAName: "Johnny Harris",
    channelBName: "Wendover",
    teaser: "Explainer kings — style vs substance",
  },
  {
    channelA: "@SaturdayNightLive",
    channelB: "@buzzfeedvideo",
    channelAName: "SNL",
    channelBName: "BuzzFeed Video",
    teaser: "Sketch comedy meets internet entertainment",
  },
  {
    channelA: "@veritasium",
    channelB: "@markrober",
    channelAName: "Veritasium",
    channelBName: "Mark Rober",
    teaser: "Science deep dives vs science spectacle",
  },
  {
    channelA: "@jubilee",
    channelB: "@cut",
    channelAName: "Jubilee",
    channelBName: "Cut",
    teaser: "Social experiments — debate vs dare",
  },
  // ── New presets (YouTubers) ──────────────────────────
  {
    channelA: "@mrbeast",
    channelB: "@dudeperfect",
    channelAName: "MrBeast",
    channelBName: "Dude Perfect",
    teaser: "Philanthropy stunts vs trick-shot empire",
  },
  {
    channelA: "@nikkietutorials",
    channelB: "@jackieaina",
    channelAName: "NikkieTutorials",
    channelBName: "Jackie Aina",
    teaser: "Glam powerhouses — precision meets bold energy",
  },
  {
    channelA: "@joshuaweissman",
    channelB: "@babishculinaryuniverse",
    channelAName: "Joshua Weissman",
    channelBName: "Babish",
    teaser: "Kitchen rivals — technique nerd vs comfort food",
  },
  {
    channelA: "@chloeting",
    channelB: "@blogilates",
    channelAName: "Chloe Ting",
    channelBName: "Blogilates",
    teaser: "Home workout queens — viral challenges vs Pilates empire",
  },
  {
    channelA: "@kurzgesagt",
    channelB: "@teded",
    channelAName: "Kurzgesagt",
    channelBName: "TED-Ed",
    teaser: "Animation-first education — indie studio vs institution",
  },
  {
    channelA: "@karaandnate",
    channelB: "@lostleblanc",
    channelAName: "Kara and Nate",
    channelBName: "Lost LeBlanc",
    teaser: "Full-time travelers — couple vlog vs solo cinematic",
  },
  {
    channelA: "@colinandsamir",
    channelB: "@mattdavella",
    channelAName: "Colin and Samir",
    channelBName: "Matt D'Avella",
    teaser: "Creator economy duo vs minimalist filmmaker",
  },
  // ── New presets (Businesses) ─────────────────────────
  {
    channelA: "@redbull",
    channelB: "@gopro",
    channelAName: "Red Bull",
    channelBName: "GoPro",
    teaser: "Adrenaline marketing — energy drink vs camera lifestyle",
  },
  {
    channelA: "@hubspot",
    channelB: "@shopify",
    channelAName: "HubSpot",
    channelBName: "Shopify",
    teaser: "SaaS content machines — who wins educational marketing?",
  },
  {
    channelA: "@nike",
    channelB: "@gymshark",
    channelAName: "Nike",
    channelBName: "Gymshark",
    teaser: "Legacy athletic giant vs DTC disruptor",
  },
  {
    channelA: "@LennysPodcast",
    channelB: "@howiaipodcast",
    channelAName: "Lenny Rachitsky",
    channelBName: "Claire Vo",
    teaser: "PM podcast titans — newsletter empire vs AI-native builder",
  },
];

function pickRandom(arr: PresetData[], count: number): PresetData[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export default function ComparisonPresets() {
  const router = useRouter();
  const [presets] = useState(() => pickRandom(PRESETS, 5));

  function handleClick(preset: PresetData) {
    router.push(`/results?a=${encodeURIComponent(preset.channelA)}&b=${encodeURIComponent(preset.channelB)}`);
  }

  return (
    <div className="animate-fade-in-up" style={{ opacity: 0, animationDelay: "400ms" }}>
      <div className="label-mono mb-3 text-center">Famous Matchups</div>
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {presets.map((preset) => (
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
