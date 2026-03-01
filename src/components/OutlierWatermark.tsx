"use client";

export default function OutlierWatermark() {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <svg width="16" height="16" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="9" stroke="#06D6A0" strokeWidth="3" fill="none" />
        <circle cx="24" cy="8" r="2" fill="#06D6A0" />
      </svg>
      <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
        Analyzed by Outlier
      </span>
    </div>
  );
}
