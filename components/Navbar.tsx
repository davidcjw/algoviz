"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/learn", label: "Learn" },
  { href: "/learn?pillar=data-structures", label: "Data Structures" },
  { href: "/learn?pillar=algorithms", label: "Algorithms" },
  { href: "/learn?pillar=system-design", label: "System Design" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "py-2" : "py-4",
      )}
    >
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div
          className={cn(
            "flex items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-300",
            scrolled ? "glass shadow-lg shadow-black/40" : "border border-transparent",
          )}
        >
          <Link href="/" className="group flex items-center gap-2.5">
            <Logo />
            <span className="font-display text-lg font-extrabold tracking-tight">
              Algo<span className="text-gradient">Viz</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/learn"
              className="hidden rounded-xl bg-white px-4 py-2 text-sm font-semibold text-ink transition-transform hover:scale-[1.03] active:scale-95 sm:block"
            >
              Start learning
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              className="rounded-lg p-2 text-slate-200 hover:bg-white/5 md:hidden"
              aria-label="Toggle menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="glass mt-2 flex flex-col gap-1 rounded-2xl p-3 md:hidden"
            >
              {links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-white/5"
                >
                  {l.label}
                </Link>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <svg width="30" height="30" viewBox="0 0 64 64" className="shrink-0">
      <line x1="18" y1="20" x2="32" y2="38" stroke="#2DD4BF" strokeWidth="3" strokeLinecap="round" />
      <line x1="46" y1="20" x2="32" y2="38" stroke="#A3E635" strokeWidth="3" strokeLinecap="round" />
      <line x1="32" y1="38" x2="32" y2="50" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" />
      <circle cx="18" cy="20" r="6" fill="#2DD4BF" />
      <circle cx="46" cy="20" r="6" fill="#A3E635" />
      <circle cx="32" cy="38" r="7" fill="#E7ECF5" />
      <circle cx="32" cy="50" r="5" fill="#FBBF24" />
    </svg>
  );
}
