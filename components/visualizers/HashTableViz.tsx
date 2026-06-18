"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VizShell, ACCENT } from "./shell";

const BUCKETS = 8;
type Entry = { id: number; key: number };
let hid = 500;

export function HashTableViz() {
  const accent = "ds" as const;
  const [buckets, setBuckets] = useState<Entry[][]>(() => {
    const b: Entry[][] = Array.from({ length: BUCKETS }, () => []);
    [23, 8, 16, 42].forEach((key) => b[key % BUCKETS].push({ id: hid++, key }));
    return b;
  });
  const [pending, setPending] = useState<{ key: number; bucket: number } | null>(null);
  const [note, setNote] = useState("hash(key) = key % 8 picks the bucket. Collisions chain.");

  const insert = (forceCollision = false) => {
    let key = Math.floor(Math.random() * 99) + 1;
    if (forceCollision) {
      // find a non-empty bucket and craft a colliding key
      const idx = buckets.findIndex((b) => b.length > 0);
      if (idx >= 0) key = idx + BUCKETS * (Math.floor(Math.random() * 11) + 1);
    }
    const bucket = key % BUCKETS;
    setPending({ key, bucket });
    setNote(`hash(${key}) = ${key} % ${BUCKETS} = ${bucket}`);
    setTimeout(() => {
      setBuckets((prev) => {
        const copy = prev.map((b) => [...b]);
        const collision = copy[bucket].length > 0;
        copy[bucket].push({ id: hid++, key });
        setNote(
          collision
            ? `Bucket ${bucket} already occupied → chain ${key} (collision). Still O(1) avg.`
            : `Stored ${key} in empty bucket ${bucket}. O(1).`,
        );
        return copy;
      });
      setPending(null);
    }, 720);
  };

  const reset = () => {
    setBuckets(Array.from({ length: BUCKETS }, () => []));
    setNote("Cleared. Insert keys to watch them hash into buckets.");
  };

  const load = buckets.reduce((s, b) => s + b.length, 0) / BUCKETS;

  return (
    <VizShell
      accent={accent}
      title="hash_table"
      status={`load factor ${load.toFixed(2)}`}
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => insert(false)}
            className="rounded-lg border border-ds/40 bg-ds/10 px-3 py-1.5 font-mono text-xs text-ds hover:bg-ds/20"
          >
            insert random
          </button>
          <button
            onClick={() => insert(true)}
            className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 font-mono text-xs text-amber-300 hover:bg-amber-400/20"
          >
            force collision
          </button>
          <button
            onClick={reset}
            className="rounded-lg border border-line bg-white/5 px-3 py-1.5 font-mono text-xs text-slate-300 hover:bg-white/10"
          >
            clear
          </button>
        </div>
      }
    >
      {/* incoming key */}
      <div className="flex h-12 items-center justify-center">
        <AnimatePresence>
          {pending && (
            <motion.div
              key={pending.key}
              initial={{ opacity: 0, y: -10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              className="rounded-lg border border-white/40 bg-white/10 px-4 py-1.5 font-mono text-sm text-coal shadow-sm"
            >
              key {pending.key} → bucket {pending.bucket}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-2 space-y-1.5">
        {buckets.map((bucket, i) => {
          const targeted = pending?.bucket === i;
          return (
            <div key={i} className="flex items-center gap-2">
              <div
                className="grid h-9 w-9 shrink-0 place-items-center rounded-md border font-mono text-xs transition-all"
                style={{
                  borderColor: targeted ? ACCENT.ds.raw : "rgba(148,163,184,0.18)",
                  background: targeted ? "rgba(15,118,110,0.16)" : "rgba(22,26,34,0.05)",
                  color: targeted ? "#161A22" : "#64748b",
                  boxShadow: targeted ? `0 0 16px ${ACCENT.ds.raw}55` : "none",
                }}
              >
                {i}
              </div>
              <div className="flex flex-1 items-center gap-1.5 overflow-x-auto rounded-md border border-line bg-ink-900/40 px-2 py-1.5">
                <AnimatePresence mode="popLayout">
                  {bucket.map((e, j) => (
                    <motion.div
                      key={e.id}
                      layout
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ type: "spring", stiffness: 460, damping: 28 }}
                      className="flex items-center gap-1.5"
                    >
                      {j > 0 && <span className="text-ds">→</span>}
                      <span className="rounded bg-ds/15 px-2 py-1 font-mono text-xs text-ds">
                        {e.key}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {bucket.length === 0 && (
                  <span className="font-mono text-2xs text-slate-600">empty</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 font-mono text-xs text-slate-300">{note}</p>
    </VizShell>
  );
}
