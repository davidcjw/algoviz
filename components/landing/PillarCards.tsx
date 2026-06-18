"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { pillarStats, type Pillar } from "@/lib/content";
import { Reveal } from "@/components/Reveal";

const accentMap: Record<
  Pillar,
  { ring: string; text: string; glow: string; bar: string }
> = {
  "data-structures": {
    ring: "group-hover:border-ds/50",
    text: "text-ds",
    glow: "group-hover:glow-ds",
    bar: "bg-ds",
  },
  algorithms: {
    ring: "group-hover:border-algo/50",
    text: "text-algo",
    glow: "group-hover:glow-algo",
    bar: "bg-algo",
  },
  "system-design": {
    ring: "group-hover:border-sys/50",
    text: "text-sys",
    glow: "group-hover:glow-sys",
    bar: "bg-sys",
  },
};

export function PillarCards() {
  const stats = pillarStats();
  return (
    <section className="relative z-10 mx-auto max-w-content px-4 py-20 sm:px-6">
      <Reveal>
        <p className="chip text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-algo" /> Three pillars
        </p>
        <h2 className="mt-4 max-w-2xl text-balance text-3xl font-bold sm:text-4xl md:text-5xl">
          Everything an engineer needs to{" "}
          <span className="text-gradient">truly understand</span>.
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {stats.map((s, i) => {
          const a = accentMap[s.pillar];
          return (
            <Reveal i={i} key={s.pillar}>
              <Link
                href={`/learn?pillar=${s.pillar}`}
                className={`group relative block h-full overflow-hidden rounded-2xl border border-line bg-ink-800/40 p-6 transition-all duration-300 ${a.ring} ${a.glow}`}
              >
                <div className="flex items-start justify-between">
                  <span className={`font-mono text-4xl ${a.text}`}>{s.glyph}</span>
                  <ArrowUpRight
                    className="text-slate-500 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-coal"
                    size={22}
                  />
                </div>
                <h3 className="mt-6 text-xl font-bold">{s.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{s.blurb}</p>

                <div className="mt-6 flex items-center gap-4 font-mono text-2xs uppercase tracking-wider text-slate-500">
                  <span className={a.text}>{s.count} topics</span>
                  <span>·</span>
                  <span>{s.live} interactive</span>
                </div>

                {/* animated underline bar */}
                <motion.span
                  className={`absolute bottom-0 left-0 h-0.5 ${a.bar}`}
                  initial={{ width: "0%" }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                />
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
