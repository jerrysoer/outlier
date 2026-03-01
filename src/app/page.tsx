import { Suspense } from "react";
import { BarChart3, Eye, Zap } from "lucide-react";
import ChannelInput from "@/components/ChannelInput";
import ComparisonPresets from "@/components/ComparisonPresets";

const features = [
  {
    icon: Eye,
    title: "10 Thumbnail Signals",
    description:
      "Face presence, eye contact, expression energy, text legibility, color temperature, and more — AI-analyzed across 50 videos per channel.",
  },
  {
    icon: BarChart3,
    title: "Gap Table + Priority",
    description:
      "See exactly where you're behind, by how much, and what to fix first. Priority-ranked from HIGHEST to LOW.",
  },
  {
    icon: Zap,
    title: "30-Second Analysis",
    description:
      "Paste two channel URLs. Get grades, roast cards, engagement rates, title intelligence, tag strategy — the full competitive picture.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ opacity: 0 }}>
          <div className="label-mono mb-4 text-[var(--accent)]">
            YouTube Channel Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.15] mb-4">
            See exactly how your YouTube channel compares to the ones beating you.
          </h1>
          <p className="text-[var(--text-secondary)] text-base sm:text-lg max-w-lg mx-auto">
            AI-analyzed thumbnail gaps, title formulas, and upload consistency.
            Free. No signup. 30 seconds.
          </p>
        </div>

        <div
          className="w-full max-w-lg animate-fade-in-up"
          style={{ opacity: 0, animationDelay: "200ms" }}
        >
          <Suspense>
            <ChannelInput />
          </Suspense>
        </div>

        {/* Comparison Presets */}
        <div className="w-full max-w-4xl mt-12">
          <ComparisonPresets />
        </div>
      </section>

      {/* Feature cards */}
      <section className="px-6 pb-16 sm:pb-24">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="card p-5 card-accent animate-fade-in-up"
              style={{ opacity: 0, animationDelay: `${300 + i * 100}ms` }}
            >
              <feature.icon
                size={20}
                className="text-[var(--accent)] mb-3"
              />
              <h3 className="text-sm font-bold mb-1.5 text-[var(--text-primary)]">
                {feature.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] px-6 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">
            Outlier — YouTube Channel Gap Analyzer
          </span>
          <a
            href="/waitlist"
            className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >
            Join waitlist
          </a>
        </div>
      </footer>
    </main>
  );
}
