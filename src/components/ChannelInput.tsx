"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";

const URL_PATTERN = /(@[\w.-]+|youtube\.com\/@[\w.-]+|youtube\.com\/channel\/UC[\w-]+|UC[\w-]{20,})/;

export default function ChannelInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [channelA, setChannelA] = useState("");
  const [channelB, setChannelB] = useState("");
  const [error, setError] = useState("");

  // Capture admin secret from URL and persist to sessionStorage
  useEffect(() => {
    const adminParam = searchParams.get("admin");
    if (adminParam) {
      sessionStorage.setItem("outlier_admin", adminParam);
    }
  }, [searchParams]);

  function validate(input: string): boolean {
    const trimmed = input.trim();
    if (!trimmed) return false;
    // Accept @handle, full URL, or channel ID starting with UC
    return (
      trimmed.startsWith("@") ||
      trimmed.startsWith("UC") ||
      trimmed.includes("youtube.com/") ||
      trimmed.includes("youtu.be/") ||
      trimmed.length > 2 // Fallback: treat as handle
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!validate(channelA)) {
      setError("Enter a valid YouTube channel for 'Your Channel'");
      return;
    }
    if (!validate(channelB)) {
      setError("Enter a valid YouTube channel for 'Competitor Channel'");
      return;
    }

    const params = new URLSearchParams({
      a: channelA.trim(),
      b: channelB.trim(),
    });
    router.push(`/results?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto relative z-10">
      <div className="space-y-4">
        <div>
          <label className="label-mono block mb-2">Your Channel</label>
          <input
            type="text"
            value={channelA}
            onChange={(e) => setChannelA(e.target.value)}
            placeholder="@yourchannel or paste URL"
            className="input-field w-full px-4 py-3"
          />
        </div>

        <div>
          <label className="label-mono block mb-2">Competitor Channel</label>
          <input
            type="text"
            value={channelB}
            onChange={(e) => setChannelB(e.target.value)}
            placeholder="@competitor or paste URL"
            className="input-field w-full px-4 py-3"
          />
        </div>

        {error && (
          <p className="text-sm text-[var(--error)]">{error}</p>
        )}

        <button
          type="submit"
          disabled={!channelA.trim() || !channelB.trim()}
          className="btn-primary w-full py-3.5 text-[15px] flex items-center justify-center gap-2 relative z-10"
        >
          Analyze Gap
          <ArrowRight size={16} />
        </button>
      </div>
    </form>
  );
}
