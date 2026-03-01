"use client";

import { useState } from "react";
import { Twitter, Copy, Check } from "lucide-react";

interface Props {
  text: string;
  slug?: string;
}

export default function TweetableCallout({ text, slug }: Props) {
  const [copied, setCopied] = useState(false);

  // Replace [share_url] placeholder with actual URL
  const shareUrl = slug ? `https://getoutlier.com/results/${slug}` : "";
  const finalText = text.replace(/\[share_url\]/g, shareUrl);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(finalText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Fire analytics event
      fetch("/api/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "tweet_copied", properties: { slug } }),
      }).catch(() => {});
    } catch {
      // Clipboard API not available
    }
  }

  return (
    <div className="animate-fade-in-up" style={{ opacity: 0, animationDelay: "600ms" }}>
      <div className="label-mono mb-3">Tweetable Callout</div>
      <div className="card p-4">
        <div className="flex items-start gap-3">
          <Twitter size={18} className="text-[#1DA1F2] flex-shrink-0 mt-0.5" />
          <p className="text-sm text-[var(--text-primary)] leading-relaxed flex-1">
            {finalText}
          </p>
        </div>
        <div className="flex justify-end mt-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                       border border-[var(--border)] text-[var(--text-secondary)]
                       hover:border-[var(--accent-border)] hover:text-[var(--accent)]
                       transition-all"
          >
            {copied ? (
              <>
                <Check size={12} className="text-[var(--positive)]" />
                Copied
              </>
            ) : (
              <>
                <Copy size={12} />
                Copy tweet
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
