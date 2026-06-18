"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VizShell, ACCENT } from "./shell";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

type Item = { id: number; value: number };
let sid = 300;

export function StackViz() {
  const accent = "ds" as const;
  const [items, setItems] = useState<Item[]>([12, 5, 27].map((v, i) => ({ id: i, value: v })));
  const [note, setNote] = useState("LIFO — the last value pushed is the first popped.");
  const [popping, setPopping] = useState<number | null>(null);

  const push = () => {
    const v = Math.floor(Math.random() * 90) + 10;
    const it = { id: sid++, value: v };
    setItems((c) => [...c, it]);
    setNote(`push(${v}) → lands on top. O(1).`);
  };
  const pop = () => {
    if (!items.length) return setNote("Stack is empty — nothing to pop.");
    const top = items[items.length - 1];
    setPopping(top.id);
    setNote(`pop() → removes ${top.value} from the top. O(1).`);
    setTimeout(() => {
      setItems((c) => c.slice(0, -1));
      setPopping(null);
    }, 260);
  };

  return (
    <VizShell
      accent={accent}
      title="stack"
      status={`size ${items.length}`}
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={push}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ds/40 bg-ds/10 px-3 py-1.5 font-mono text-xs text-ds hover:bg-ds/20"
          >
            <ArrowDownToLine size={14} /> push()
          </button>
          <button
            onClick={pop}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 font-mono text-xs text-rose-300 hover:bg-rose-400/20"
          >
            <ArrowUpFromLine size={14} /> pop()
          </button>
          <span className="ml-auto font-mono text-2xs text-slate-500">top of stack ↑</span>
        </div>
      }
    >
      <div className="flex min-h-[200px] flex-col items-center justify-end gap-1.5 pb-2">
        <AnimatePresence mode="popLayout">
          {items.map((it, i) => {
            const isTop = i === items.length - 1;
            return (
              <motion.div
                key={it.id}
                layout
                initial={{ opacity: 0, y: -36, scale: 0.8 }}
                animate={{
                  opacity: popping === it.id ? 0 : 1,
                  y: popping === it.id ? -36 : 0,
                  scale: popping === it.id ? 0.8 : 1,
                }}
                exit={{ opacity: 0, y: -36, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 480, damping: 30 }}
                className="grid h-12 w-44 place-items-center rounded-lg border font-mono text-base font-semibold"
                style={{
                  borderColor: isTop ? ACCENT.ds.raw : "rgba(148,163,184,0.18)",
                  background: isTop ? "rgba(45,212,191,0.12)" : "rgba(18,24,38,0.7)",
                  color: "#fff",
                  boxShadow: isTop ? `0 0 18px ${ACCENT.ds.raw}44` : "none",
                }}
              >
                {it.value}
                {isTop && <span className="ml-2 text-2xs text-ds">← top</span>}
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div className="mt-1 h-1 w-52 rounded-full bg-ink-600" />
      </div>
      <p className="mt-3 text-center font-mono text-xs text-slate-300">{note}</p>
    </VizShell>
  );
}
