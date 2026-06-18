"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Bar = { id: number; value: number };

const COUNT = 18;

function makeBars(seed: number): Bar[] {
  // deterministic shuffle of 1..COUNT so SSR and first client render match
  const vals = Array.from({ length: COUNT }, (_, i) => i + 1);
  let s = seed;
  for (let i = vals.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [vals[i], vals[j]] = [vals[j], vals[i]];
  }
  return vals.map((v, i) => ({ id: i, value: v }));
}

function barColor(value: number) {
  // teal → lime → amber gradient across the value range
  const t = (value - 1) / (COUNT - 1);
  if (t < 0.5) {
    const k = t / 0.5;
    return lerpColor([45, 212, 191], [163, 230, 53], k);
  }
  const k = (t - 0.5) / 0.5;
  return lerpColor([163, 230, 53], [251, 191, 36], k);
}
function lerpColor(a: number[], b: number[], t: number) {
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

export function HeroVisual() {
  const [bars, setBars] = useState<Bar[]>(() => makeBars(42));
  const [active, setActive] = useState<[number, number] | null>(null);
  const [sortedFrom, setSortedFrom] = useState(COUNT);
  const reduce = useReducedMotion();

  // bubble-sort state held in refs so the interval mutates smoothly
  const i = useRef(0);
  const j = useRef(0);
  const boundary = useRef(COUNT - 1);
  const seed = useRef(43);

  useEffect(() => {
    if (reduce) return;
    const tick = () => {
      setBars((prev) => {
        const arr = [...prev];
        const a = j.current;
        const b = j.current + 1;
        if (b <= boundary.current) {
          if (arr[a].value > arr[b].value) {
            [arr[a], arr[b]] = [arr[b], arr[a]];
          }
          setActive([a, b]);
          j.current += 1;
        } else {
          j.current = 0;
          boundary.current -= 1;
          setSortedFrom(boundary.current + 1);
          if (boundary.current <= 0) {
            // sorted — pause, then reshuffle for an endless loop
            setActive(null);
            setTimeout(() => {
              seed.current += 7;
              boundary.current = COUNT - 1;
              j.current = 0;
              setSortedFrom(COUNT);
              setBars(makeBars(seed.current));
            }, 1100);
          }
        }
        return arr;
      });
    };
    const id = setInterval(tick, 150);
    return () => clearInterval(id);
  }, [reduce]);

  const max = COUNT;

  return (
    <div className="relative">
      {/* glow base */}
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-ds/20 via-algo/10 to-sys/20 blur-2xl" />

      <div className="card overflow-hidden p-1 shadow-2xl shadow-black/50">
        {/* terminal chrome */}
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <span className="font-mono text-2xs uppercase tracking-widest text-slate-400">
            bubble_sort.run()
          </span>
          <span className="font-mono text-2xs text-slate-500">live</span>
        </div>

        {/* bars */}
        <div className="relative flex h-72 items-end gap-1.5 px-4 pb-4 pt-8 sm:h-80 sm:gap-2 sm:px-6">
          {bars.map((bar, idx) => {
            const isActive = active && (active[0] === idx || active[1] === idx);
            const isSorted = idx >= sortedFrom;
            return (
              <motion.div
                key={bar.id}
                layout
                transition={{ type: "spring", stiffness: 520, damping: 34 }}
                className="relative flex-1 rounded-t-md"
                style={{
                  height: `${(bar.value / max) * 100}%`,
                  background: isSorted
                    ? barColor(bar.value)
                    : `${barColor(bar.value)}`,
                  opacity: isActive ? 1 : isSorted ? 1 : 0.78,
                  boxShadow: isActive
                    ? `0 0 22px ${barColor(bar.value)}`
                    : isSorted
                      ? `0 0 10px ${barColor(bar.value)}55`
                      : "none",
                }}
              >
                {isActive && (
                  <motion.span
                    layoutId="scan-dot"
                    className="absolute -top-3 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white"
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* floating stat chips */}
      {!reduce && (
        <>
          <FloatingChip
            className="-left-4 top-10 sm:-left-8"
            label="O(n log n)"
            accent="text-algo"
            delay={0}
          />
          <FloatingChip
            className="-right-3 bottom-16 sm:-right-6"
            label="visited[ ]"
            accent="text-ds"
            delay={1.2}
          />
        </>
      )}
    </div>
  );
}

function FloatingChip({
  className,
  label,
  accent,
  delay,
}: {
  className: string;
  label: string;
  accent: string;
  delay: number;
}) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay }}
      className={`glass absolute z-20 rounded-xl px-3 py-2 font-mono text-xs shadow-lg ${accent} ${className}`}
    >
      {label}
    </motion.div>
  );
}
