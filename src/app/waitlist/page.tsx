import Link from "next/link";
import WaitlistForm from "@/components/WaitlistForm";

export default function WaitlistPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="text-center max-w-md mx-auto mb-8 animate-fade-in-up" style={{ opacity: 0 }}>
        <div className="label-mono mb-4 text-[var(--accent)]">Early Access</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Get early access
        </h1>
        <p className="text-[var(--text-secondary)] text-sm sm:text-base">
          Join the founding members. Be first to get unlimited audits, new features,
          and permanent perks.
        </p>
      </div>

      <div
        className="w-full max-w-md animate-fade-in-up"
        style={{ opacity: 0, animationDelay: "150ms" }}
      >
        <WaitlistForm />
      </div>

      <div
        className="mt-12 text-center animate-fade-in"
        style={{ opacity: 0, animationDelay: "300ms" }}
      >
        <Link
          href="/"
          className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
        >
          &larr; Back to Outlier
        </Link>
      </div>
    </main>
  );
}
