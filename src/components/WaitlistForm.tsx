"use client";

import { useState, useEffect } from "react";
import { Mail, Check, AlertCircle } from "lucide-react";

const TOTAL_SPOTS = 500;

export default function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [spotsTaken, setSpotsTaken] = useState(0);

  // Fetch live spot count on mount (with timeout to prevent hanging)
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    fetch("/api/waitlist", { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => setSpotsTaken(d.count ?? 0))
      .catch(() => {})
      .finally(() => clearTimeout(timeout));
    return () => { controller.abort(); clearTimeout(timeout); };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong");
        setStatus("error");
        return;
      }

      if (data.message) {
        // "You're already on the list!"
        setErrorMsg(data.message);
        setStatus("success");
      } else {
        setStatus("success");
        setSpotsTaken((prev) => prev + 1);
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  const spotsRemaining = Math.max(0, TOTAL_SPOTS - spotsTaken);
  const progressPct = Math.min(100, (spotsTaken / TOTAL_SPOTS) * 100);

  return (
    <div className="max-w-md mx-auto">
      {status === "success" ? (
        <div className="text-center animate-fade-in-scale" style={{ opacity: 0 }}>
          <div className="w-14 h-14 rounded-2xl bg-[var(--positive-dim)] flex items-center justify-center mx-auto mb-4">
            <Check size={24} className="text-[var(--positive)]" />
          </div>
          <h3 className="text-lg font-bold mb-2">You&apos;re in.</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            {errorMsg || "We'll notify you when your spot opens up."}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className="input-field w-full pl-10 pr-4 py-3"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading" || !email.trim()}
              className="btn-primary px-6 py-3 text-sm whitespace-nowrap"
            >
              {status === "loading" ? "Joining..." : "Join Waitlist"}
            </button>
          </div>

          {status === "error" && errorMsg && (
            <div className="flex items-center gap-2 text-sm text-[var(--error)]">
              <AlertCircle size={14} />
              {errorMsg}
            </div>
          )}

          {/* Founding member progress */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                Founding member spots
              </span>
              <span className="data-readout text-xs">
                {spotsRemaining} of {TOTAL_SPOTS} remaining
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
