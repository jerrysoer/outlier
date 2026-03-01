"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface Props {
  slug: string;
  channelAName?: string;
  channelBName?: string;
}

export default function ShareButton({ slug, channelAName, channelBName }: Props) {
  const [copied, setCopied] = useState(false);
  const url = `https://getoutlier.com/results/${slug}`;
  const shareTitle = channelAName && channelBName
    ? `${channelAName} vs ${channelBName} — Outlier Analysis`
    : "YouTube Channel Analysis — Outlier";
  const shareText = channelAName && channelBName
    ? `Check out this YouTube channel comparison: ${channelAName} vs ${channelBName}`
    : "Check out this YouTube channel analysis";

  async function handleShare() {
    // Try Web Share API first (mobile native share sheet)
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url });
        fetch("/api/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "share_native", properties: { slug } }),
        }).catch(() => {});
        return;
      } catch {
        // User cancelled or API failed — fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      fetch("/api/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "share_copied", properties: { slug } }),
      }).catch(() => {});
    } catch {
      // Clipboard API not available
    }
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium
                   border border-[var(--border)] text-[var(--text-secondary)]
                   hover:border-[var(--accent-border)] hover:text-[var(--accent)]
                   hover:bg-[var(--accent-dim)] transition-all duration-200"
      >
        {copied ? (
          <>
            <Check size={14} className="text-[var(--positive)]" />
            Link copied!
          </>
        ) : (
          <>
            <Share2 size={14} />
            Share results
          </>
        )}
      </button>

      {/* Platform share icons */}
      <div className="flex items-center gap-1.5">
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-8 h-8 rounded-md
                     border border-[var(--border)] text-[var(--text-muted)]
                     hover:border-[var(--border-bright)] hover:text-[var(--text-secondary)]
                     transition-all duration-200"
          title="Share on X (Twitter)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-8 h-8 rounded-md
                     border border-[var(--border)] text-[var(--text-muted)]
                     hover:border-[var(--border-bright)] hover:text-[var(--text-secondary)]
                     transition-all duration-200"
          title="Share on LinkedIn"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
