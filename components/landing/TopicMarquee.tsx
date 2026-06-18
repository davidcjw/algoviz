"use client";

import { TOPICS } from "@/lib/content";

export function TopicMarquee() {
  const labels = TOPICS.map((t) => t.title);
  const row = [...labels, ...labels];

  return (
    <div className="relative z-10 border-y border-line py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink to-transparent" />
      <div className="flex w-max animate-marquee items-center gap-8 will-change-transform">
        {row.map((label, i) => (
          <div key={i} className="flex items-center gap-8">
            <span className="whitespace-nowrap font-mono text-sm uppercase tracking-wider text-slate-400">
              {label}
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
          </div>
        ))}
      </div>
    </div>
  );
}
