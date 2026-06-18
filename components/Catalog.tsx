"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Search } from "lucide-react";
import { PILLARS, TOPICS, type Pillar } from "@/lib/content";
import { cn } from "@/lib/utils";

const VALID_PILLARS: Pillar[] = ["data-structures", "algorithms", "system-design"];

const accentText: Record<Pillar, string> = {
  "data-structures": "text-ds",
  algorithms: "text-algo",
  "system-design": "text-sys",
};
const accentHover: Record<Pillar, string> = {
  "data-structures": "hover:border-ds/50 hover:shadow-[0_0_30px_-10px_#2DD4BF]",
  algorithms: "hover:border-algo/50 hover:shadow-[0_0_30px_-10px_#A3E635]",
  "system-design": "hover:border-sys/50 hover:shadow-[0_0_30px_-10px_#FBBF24]",
};
const pillBg: Record<Pillar | "all", string> = {
  all: "data-[on=true]:bg-white data-[on=true]:text-ink",
  "data-structures": "data-[on=true]:bg-ds data-[on=true]:text-ink",
  algorithms: "data-[on=true]:bg-algo data-[on=true]:text-ink",
  "system-design": "data-[on=true]:bg-sys data-[on=true]:text-ink",
};

export function Catalog() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState("");

  // URL is the single source of truth so navbar links and pills stay in sync
  const param = searchParams.get("pillar");
  const pillar: Pillar | "all" = VALID_PILLARS.includes(param as Pillar)
    ? (param as Pillar)
    : "all";

  const setPillar = (p: Pillar | "all") => {
    const next = new URLSearchParams(searchParams.toString());
    if (p === "all") next.delete("pillar");
    else next.set("pillar", p);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return TOPICS.filter((t) => {
      const okPillar = pillar === "all" || t.pillar === pillar;
      const okQ =
        !query ||
        t.title.toLowerCase().includes(query) ||
        t.tagline.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query);
      return okPillar && okQ;
    });
  }, [pillar, q]);

  const pills: (Pillar | "all")[] = ["all", "data-structures", "algorithms", "system-design"];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {pills.map((p) => (
            <button
              key={p}
              data-on={pillar === p}
              onClick={() => setPillar(p)}
              className={cn(
                "rounded-lg border border-line px-3.5 py-2 font-mono text-xs uppercase tracking-wide text-slate-300 transition-all hover:bg-white/5",
                pillBg[p],
              )}
            >
              {p === "all" ? "All" : PILLARS[p].name}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search topics…"
            className="w-full rounded-lg border border-line bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-slate-500 sm:w-64"
          />
        </div>
      </div>

      <div className="mt-3 font-mono text-2xs uppercase tracking-wider text-slate-500">
        {filtered.length} topic{filtered.length === 1 ? "" : "s"}
      </div>

      <motion.div layout className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((t) => (
            <motion.div
              key={t.slug}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
            >
              <Link
                href={`/${t.pillar}/${t.slug}`}
                className={cn(
                  "group flex h-full flex-col rounded-2xl border border-line bg-ink-800/40 p-5 transition-all duration-300",
                  accentHover[t.pillar],
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn("font-mono text-2xs uppercase tracking-wider", accentText[t.pillar])}>
                    {PILLARS[t.pillar].glyph} {t.category}
                  </span>
                  {t.live ? (
                    <span className="inline-flex items-center gap-1 font-mono text-2xs text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-algo" /> live
                    </span>
                  ) : (
                    <span className="font-mono text-2xs text-slate-600">soon</span>
                  )}
                </div>
                <h3 className="mt-4 text-lg font-bold transition-colors group-hover:text-white">{t.title}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate-400">{t.tagline}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-mono text-2xs uppercase tracking-wider text-slate-500">{t.difficulty}</span>
                  <ArrowUpRight size={16} className="text-slate-600 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <div className="mt-12 text-center font-mono text-sm text-slate-500">
          No topics match “{q}”.
        </div>
      )}
    </div>
  );
}
