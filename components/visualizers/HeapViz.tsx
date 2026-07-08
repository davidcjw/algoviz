"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { VizShell, ACCENT } from "./shell";

type Frame = { heap: number[]; hi: number[]; note: string };

function siftUpFrames(start: number[], value: number): Frame[] {
  const heap = [...start, value];
  const frames: Frame[] = [{ heap: [...heap], hi: [heap.length - 1], note: `insert(${value}) at the end.` }];
  let i = heap.length - 1;
  while (i > 0) {
    const parent = (i - 1) >> 1;
    frames.push({ heap: [...heap], hi: [i, parent], note: `Compare ${heap[i]} with parent ${heap[parent]}.` });
    if (heap[i] < heap[parent]) {
      [heap[i], heap[parent]] = [heap[parent], heap[i]];
      frames.push({ heap: [...heap], hi: [i, parent], note: `Smaller — sift up.` });
      i = parent;
    } else break;
  }
  frames.push({ heap: [...heap], hi: [], note: `Heap property restored.` });
  return frames;
}

function extractFrames(start: number[]): Frame[] {
  if (start.length === 0) return [{ heap: [], hi: [], note: "Heap is empty." }];
  const heap = [...start];
  const min = heap[0];
  const frames: Frame[] = [{ heap: [...heap], hi: [0], note: `extractMin() → remove root ${min}.` }];
  const last = heap.pop()!;
  if (heap.length) {
    heap[0] = last;
    frames.push({ heap: [...heap], hi: [0], note: `Move last element ${last} to the root.` });
    let i = 0;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < heap.length && heap[l] < heap[smallest]) smallest = l;
      if (r < heap.length && heap[r] < heap[smallest]) smallest = r;
      if (smallest === i) break;
      frames.push({ heap: [...heap], hi: [i, smallest], note: `Swap with smaller child.` });
      [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
      i = smallest;
    }
  }
  frames.push({ heap: [...heap], hi: [], note: `Done — root is the new minimum.` });
  return frames;
}

export function HeapViz() {
  const accent = "ds" as const;
  const [heap, setHeap] = useState<number[]>([4, 13, 9, 27, 18, 21]);
  const [hi, setHi] = useState<number[]>([]);
  const [note, setNote] = useState("A min-heap keeps the smallest value at the root.");
  const busy = useRef(false);

  const play = (frames: Frame[]) => {
    if (busy.current) return;
    busy.current = true;
    frames.forEach((f, idx) => {
      setTimeout(() => {
        setHeap(f.heap);
        setHi(f.hi);
        setNote(f.note);
        if (idx === frames.length - 1) busy.current = false;
      }, idx * 620);
    });
  };

  const insert = () => play(siftUpFrames(heap, Math.floor(Math.random() * 40) + 1));
  const extract = () => play(extractFrames(heap));

  // tree layout from array indices (complete binary tree)
  const levels = heap.length ? Math.floor(Math.log2(heap.length)) + 1 : 0;
  const W = Math.max(2 ** (levels - 1) * 64, 240);
  const nodePos = (i: number) => {
    const level = Math.floor(Math.log2(i + 1));
    const posInLevel = i - (2 ** level - 1);
    const count = 2 ** level;
    return { x: ((posInLevel + 0.5) / count) * W, y: 34 + level * 70 };
  };
  const H = Math.max(levels * 70, 100);

  return (
    <VizShell
      accent={accent}
      title="min_heap"
      status={`size ${heap.length}`}
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={insert} className="rounded-lg border border-ds/40 bg-ds/10 px-3 py-1.5 font-mono text-xs text-ds hover:bg-ds/20">
            insert
          </button>
          <button onClick={extract} className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 font-mono text-xs text-rose-300 hover:bg-rose-400/20">
            extractMin
          </button>
          <button
            onClick={() => { setHeap([4, 13, 9, 27, 18, 21]); setHi([]); setNote("Reset."); }}
            className="rounded-lg border border-line bg-white/5 px-3 py-1.5 font-mono text-xs text-slate-400 hover:bg-white/10"
          >
            reset
          </button>
        </div>
      }
    >
      {/* tree view */}
      <div className="flex justify-center overflow-x-auto">
        <div className="relative" style={{ width: W, height: H }}>
          <svg className="absolute inset-0" width={W} height={H}>
            {heap.map((_, i) => {
              if (i === 0) return null;
              const p = nodePos((i - 1) >> 1);
              const c = nodePos(i);
              return <line key={i} x1={p.x} y1={p.y} x2={c.x} y2={c.y} stroke="rgba(148,163,184,0.22)" strokeWidth="2" />;
            })}
          </svg>
          {heap.map((v, i) => {
            const { x, y } = nodePos(i);
            const on = hi.includes(i);
            return (
              <motion.div
                key={i}
                layout
                className="absolute grid h-10 w-10 place-items-center rounded-full border font-mono text-sm font-semibold"
                animate={{
                  x: "-50%",
                  y: "-50%",
                  borderColor: on ? "#161A22" : "rgba(15,118,110,0.35)",
                  backgroundColor: i === 0 ? "rgba(15,118,110,0.25)" : on ? "rgba(22,26,34,0.10)" : "rgba(22,26,34,0.05)",
                  boxShadow: on ? `0 0 18px rgba(22,26,34,0.28)` : i === 0 ? `0 0 16px ${ACCENT.ds.raw}55` : "none",
                }}
                style={{ left: x, top: y, color: "#161A22" }}
              >
                {v}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* array view */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-1">
        <span className="mr-1 font-mono text-2xs uppercase text-slate-500">array</span>
        {heap.map((v, i) => (
          <div key={i} className="flex flex-col items-center">
            <motion.div
              animate={{
                backgroundColor: hi.includes(i) ? "rgba(22,26,34,0.10)" : "rgba(22,26,34,0.05)",
                borderColor: hi.includes(i) ? "#161A22" : "rgba(148,163,184,0.18)",
              }}
              className="grid h-8 w-8 place-items-center rounded border font-mono text-xs text-coal"
            >
              {v}
            </motion.div>
            <span className="font-mono text-2xs text-slate-600">{i}</span>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center font-mono text-xs text-slate-300">{note}</p>
    </VizShell>
  );
}
