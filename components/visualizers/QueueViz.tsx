"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VizShell, ACCENT } from "./shell";
import { LogIn, LogOut } from "lucide-react";

type Item = { id: number; value: number };
let qid = 400;

export function QueueViz() {
  const accent = "ds" as const;
  const [items, setItems] = useState<Item[]>([3, 8, 15].map((v, i) => ({ id: i, value: v })));
  const [note, setNote] = useState("FIFO — elements leave in the exact order they arrived.");
  const [leaving, setLeaving] = useState<number | null>(null);

  const enqueue = () => {
    const v = Math.floor(Math.random() * 90) + 10;
    setItems((c) => [...c, { id: qid++, value: v }]);
    setNote(`enqueue(${v}) → joins the back of the line. O(1).`);
  };
  const dequeue = () => {
    if (!items.length) return setNote("Queue is empty.");
    const front = items[0];
    setLeaving(front.id);
    setNote(`dequeue() → ${front.value} leaves from the front. O(1).`);
    setTimeout(() => {
      setItems((c) => c.slice(1));
      setLeaving(null);
    }, 260);
  };

  return (
    <VizShell
      accent={accent}
      title="queue"
      status={`size ${items.length}`}
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={enqueue}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ds/40 bg-ds/10 px-3 py-1.5 font-mono text-xs text-ds hover:bg-ds/20"
          >
            <LogIn size={14} /> enqueue()
          </button>
          <button
            onClick={dequeue}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 font-mono text-xs text-rose-300 hover:bg-rose-400/20"
          >
            <LogOut size={14} /> dequeue()
          </button>
        </div>
      }
    >
      <div className="flex items-center justify-between font-mono text-2xs uppercase tracking-wider text-slate-500">
        <span>← front (dequeue)</span>
        <span>back (enqueue) →</span>
      </div>
      <div className="mt-3 flex min-h-[120px] items-center gap-2 overflow-x-auto pb-2">
        <AnimatePresence mode="popLayout">
          {items.map((it, i) => {
            const isFront = i === 0;
            const isBack = i === items.length - 1;
            return (
              <motion.div
                key={it.id}
                layout
                initial={{ opacity: 0, x: 36, scale: 0.8 }}
                animate={{
                  opacity: leaving === it.id ? 0 : 1,
                  x: leaving === it.id ? -36 : 0,
                  scale: leaving === it.id ? 0.8 : 1,
                }}
                exit={{ opacity: 0, x: -36, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 460, damping: 30 }}
                className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border font-mono text-base font-semibold"
                style={{
                  borderColor: isFront ? ACCENT.ds.raw : isBack ? "rgba(15,118,110,0.4)" : "rgba(148,163,184,0.18)",
                  background: isFront ? "rgba(15,118,110,0.14)" : "rgba(22,26,34,0.05)",
                  color: "#161A22",
                  boxShadow: isFront ? `0 0 18px ${ACCENT.ds.raw}44` : "none",
                }}
              >
                {it.value}
              </motion.div>
            );
          })}
          {items.length === 0 && (
            <span className="font-mono text-sm text-slate-600">empty</span>
          )}
        </AnimatePresence>
      </div>
      <p className="mt-3 font-mono text-xs text-slate-300">{note}</p>
    </VizShell>
  );
}
