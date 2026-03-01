"use client";

import { useState } from "react";

interface Props {
  src: string;
  name: string;
  className?: string;
}

export default function ChannelAvatar({ src, name, className = "w-8 h-8" }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div className={`${className} rounded-full bg-[var(--accent-dim)] flex items-center justify-center text-xs font-bold text-[var(--accent)]`}>
        {name.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={`${className} rounded-full object-cover`}
      onError={() => setFailed(true)}
    />
  );
}
