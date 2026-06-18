"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VizShell, ACCENT } from "./shell";
import { ArrowLeftToLine, ArrowRightToLine, Trash2 } from "lucide-react";

type Node = { id: number; value: number };
let nid = 200;

const seed: Node[] = [7, 13, 4, 21].map((v, i) => ({ id: i, value: v }));

export function LinkedListViz({ variant = "singly" }: { variant?: "singly" | "doubly" }) {
  const accent = "ds" as const;
  const [nodes, setNodes] = useState<Node[]>(seed);
  const [active, setActive] = useState<number | null>(null);
  const [note, setNote] = useState(
    variant === "doubly"
      ? "Each node links both ways — delete in O(1) without searching for the predecessor."
      : "Each node points to the next. Inserting is just rewiring a pointer.",
  );

  const rnd = () => Math.floor(Math.random() * 90) + 10;

  const insertHead = () => {
    const n = { id: nid++, value: rnd() };
    setNodes((c) => [n, ...c]);
    setActive(n.id);
    setNote(`insertHead(${n.value}) → new node's next points to old head. O(1).`);
  };
  const insertTail = () => {
    const n = { id: nid++, value: rnd() };
    setNodes((c) => [...c, n]);
    setActive(n.id);
    setNote(`insertTail(${n.value}) → old tail's next now points here. O(1) with a tail pointer.`);
  };
  const remove = (id: number) => {
    const node = nodes.find((n) => n.id === id);
    setNodes((c) => c.filter((n) => n.id !== id));
    setNote(
      `delete(${node?.value}) → ${
        variant === "doubly" ? "relink prev↔next around it" : "predecessor's next jumps over it"
      }.`,
    );
  };

  const arrowColor = ACCENT.ds.raw;

  return (
    <VizShell
      accent={accent}
      title={variant === "doubly" ? "doubly_linked_list" : "singly_linked_list"}
      status={`${nodes.length} nodes`}
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={insertHead}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ds/40 bg-ds/10 px-3 py-1.5 font-mono text-xs text-ds transition-colors hover:bg-ds/20"
          >
            <ArrowLeftToLine size={14} /> insertHead
          </button>
          <button
            onClick={insertTail}
            className="inline-flex items-center gap-1.5 rounded-lg border border-ds/40 bg-ds/10 px-3 py-1.5 font-mono text-xs text-ds transition-colors hover:bg-ds/20"
          >
            insertTail <ArrowRightToLine size={14} />
          </button>
          <span className="ml-auto font-mono text-2xs text-slate-500">tap ✕ to delete</span>
        </div>
      }
    >
      <div className="flex min-h-[150px] flex-wrap items-center gap-1 pt-4">
        <span className="mr-1 font-mono text-2xs uppercase tracking-wider text-slate-500">head</span>
        <ArrowGlyph color={arrowColor} />
        <AnimatePresence mode="popLayout">
          {nodes.map((node, i) => (
            <motion.div
              key={node.id}
              layout
              initial={{ opacity: 0, y: -24, scale: 0.7 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.2 } }}
              transition={{ type: "spring", stiffness: 460, damping: 30 }}
              onAnimationComplete={() => active === node.id && setActive(null)}
              className="group flex items-center"
            >
              <div className="relative">
                <div
                  className="flex overflow-hidden rounded-lg border shadow-lg transition-all"
                  style={{
                    borderColor: active === node.id ? arrowColor : "rgba(15,118,110,0.3)",
                    boxShadow: active === node.id ? `0 0 22px ${arrowColor}66` : "none",
                  }}
                >
                  <span className="grid place-items-center bg-ink-700/80 px-4 py-3 font-mono text-base font-semibold text-coal">
                    {node.value}
                  </span>
                  <span className="grid place-items-center border-l border-ds/30 bg-ds/10 px-2.5 font-mono text-2xs text-ds">
                    {variant === "doubly" ? "⇄" : "next"}
                  </span>
                </div>
                <button
                  onClick={() => remove(node.id)}
                  className="absolute -right-1.5 -top-1.5 z-10 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-white shadow-md md:hidden md:group-hover:grid"
                  aria-label="Delete node"
                >
                  <Trash2 size={11} />
                </button>
              </div>
              <ArrowGlyph color={i === nodes.length - 1 ? "#475569" : arrowColor} double={variant === "doubly" && i < nodes.length - 1} />
            </motion.div>
          ))}
        </AnimatePresence>
        <span className="font-mono text-sm text-slate-500">null</span>
      </div>

      <p className="mt-6 font-mono text-xs leading-relaxed text-slate-300">{note}</p>
    </VizShell>
  );
}

function ArrowGlyph({ color, double }: { color: string; double?: boolean }) {
  return (
    <svg width="40" height="22" viewBox="0 0 40 22" className="shrink-0">
      {double && <path d="M14 4 L7 11 L14 18" fill="none" stroke={color} strokeWidth="2" />}
      <line x1={double ? 7 : 2} y1="11" x2="32" y2="11" stroke={color} strokeWidth="2" />
      <path d="M32 6 L39 11 L32 16 Z" fill={color} />
    </svg>
  );
}
