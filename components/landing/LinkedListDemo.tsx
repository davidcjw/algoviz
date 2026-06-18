"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const VALUES = [7, 13, 4, 21, 9];

export function LinkedListDemo() {
  const [count, setCount] = useState(VALUES.length);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) {
      setCount(VALUES.length);
      return;
    }
    let n = 0;
    setCount(0);
    const id = setInterval(() => {
      n += 1;
      if (n > VALUES.length + 2) {
        n = 0;
      }
      setCount(Math.min(n, VALUES.length));
    }, 900);
    return () => clearInterval(id);
  }, [reduce]);

  const nodes = VALUES.slice(0, count);

  return (
    <div className="card relative overflow-hidden p-6">
      <div className="flex items-center justify-between">
        <span className="font-mono text-2xs uppercase tracking-widest text-ds">
          singly_linked_list
        </span>
        <span className="font-mono text-2xs text-slate-500">head → … → null</span>
      </div>

      <div className="mt-8 flex min-h-[88px] flex-wrap items-center gap-1">
        <span className="mr-1 font-mono text-2xs uppercase text-slate-500">head</span>
        <AnimatePresence mode="popLayout">
          {nodes.map((v, i) => (
            <motion.div
              key={`${v}-${i}`}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              className="flex items-center"
            >
              <div className="flex overflow-hidden rounded-lg border border-ds/40 bg-ink-700/70 font-mono text-sm shadow-lg shadow-ds/10">
                <span className="px-3 py-2 font-semibold text-coal">{v}</span>
                <span className="grid place-items-center border-l border-ds/30 bg-ds/10 px-2 text-ds">
                  ●
                </span>
              </div>
              <Arrow last={i === nodes.length - 1} />
            </motion.div>
          ))}
        </AnimatePresence>
        <span className="font-mono text-sm text-slate-500">null</span>
      </div>

      <p className="mt-6 font-mono text-xs leading-relaxed text-slate-400">
        <span className="text-ds">node.next</span> points to the next node in memory —
        inserting is just rewiring a pointer.
      </p>
    </div>
  );
}

function Arrow({ last }: { last: boolean }) {
  return (
    <motion.svg
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ delay: 0.15, duration: 0.3 }}
      width="34"
      height="20"
      viewBox="0 0 34 20"
      className="origin-left"
    >
      <line x1="0" y1="10" x2="26" y2="10" stroke={last ? "#475569" : "#0F766E"} strokeWidth="2" />
      <path d="M26 5 L33 10 L26 15 Z" fill={last ? "#475569" : "#0F766E"} />
    </motion.svg>
  );
}
