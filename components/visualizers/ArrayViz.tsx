"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VizShell, ControlButton, ACCENT } from "./shell";
import { Plus, Search } from "lucide-react";

type Cell = { id: number; value: number };
let nextId = 100;

const initial: Cell[] = [42, 17, 8, 91, 23].map((v, i) => ({ id: i, value: v }));

export function ArrayViz() {
  const accent = "ds" as const;
  const [cells, setCells] = useState<Cell[]>(initial);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [note, setNote] = useState("Arrays give O(1) access by index — the address is pure math.");
  const [insertAt, setInsertAt] = useState(2);

  const flash = (id: number, msg: string) => {
    setHighlight(id);
    setNote(msg);
    setTimeout(() => setHighlight((h) => (h === id ? null : h)), 1200);
  };

  const push = () => {
    const value = Math.floor(Math.random() * 90) + 10;
    const id = nextId++;
    setCells((c) => [...c, { id, value }]);
    flash(id, `push(${value}) → appended at index ${cells.length}. Amortized O(1).`);
  };

  const insert = () => {
    const at = Math.min(insertAt, cells.length);
    const value = Math.floor(Math.random() * 90) + 10;
    const id = nextId++;
    setCells((c) => {
      const copy = [...c];
      copy.splice(at, 0, { id, value });
      return copy;
    });
    flash(id, `insert(${at}, ${value}) → every element from index ${at} shifts right. O(n).`);
  };

  const removeAt = (at: number) => {
    const removed = cells[at];
    setCells((c) => c.filter((_, i) => i !== at));
    setNote(`delete(${at}) removed ${removed.value} — elements after it shift left. O(n).`);
  };

  const access = (at: number) => {
    flash(cells[at].id, `arr[${at}] = ${cells[at].value} — found in one step via base + ${at} × size.`);
  };

  return (
    <VizShell
      accent={accent}
      title="array"
      status={`length ${cells.length}`}
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <ControlButton accent={accent} title="Append element" onClick={push}>
            <Plus size={15} />
          </ControlButton>
          <div className="flex items-center gap-1.5 rounded-lg border border-line bg-white/5 px-2 py-1">
            <span className="font-mono text-2xs text-slate-500">at</span>
            <input
              type="number"
              min={0}
              max={cells.length}
              value={insertAt}
              onChange={(e) => setInsertAt(Math.max(0, Math.min(cells.length, Number(e.target.value))))}
              className="w-10 bg-transparent font-mono text-sm text-coal outline-none"
            />
          </div>
          <button
            onClick={insert}
            className="rounded-lg border border-ds/40 bg-ds/10 px-3 py-1.5 font-mono text-xs text-ds transition-colors hover:bg-ds/20"
          >
            insert(at)
          </button>
          <span className="ml-auto font-mono text-2xs text-slate-500">
            tap a cell to access · ✕ to delete
          </span>
        </div>
      }
    >
      <div className="flex min-h-[140px] flex-wrap items-center justify-center gap-1.5 pt-4">
        <AnimatePresence mode="popLayout">
          {cells.map((cell, i) => {
            const active = highlight === cell.id;
            return (
              <motion.div
                key={cell.id}
                layout
                initial={{ opacity: 0, y: -20, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
                className="group relative flex flex-col items-center"
              >
                <button
                  onClick={() => access(i)}
                  className="relative grid h-14 w-14 place-items-center rounded-lg border font-mono text-lg font-semibold transition-all"
                  style={{
                    borderColor: active ? ACCENT.ds.raw : "rgba(148,163,184,0.18)",
                    background: active ? "rgba(15,118,110,0.14)" : "rgba(22,26,34,0.05)",
                    boxShadow: active ? `0 0 22px ${ACCENT.ds.raw}55` : "none",
                    color: active ? "#161A22" : "#161A22",
                  }}
                >
                  {cell.value}
                </button>
                <span className="mt-1.5 font-mono text-2xs text-slate-500">[{i}]</span>
                <button
                  onClick={() => removeAt(i)}
                  className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-rose-500/90 text-2xs text-white md:hidden md:group-hover:grid"
                  aria-label={`Delete index ${i}`}
                >
                  ✕
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-center gap-2 font-mono text-xs text-slate-300">
        <Search size={13} className="text-ds" />
        {note}
      </div>
    </VizShell>
  );
}
