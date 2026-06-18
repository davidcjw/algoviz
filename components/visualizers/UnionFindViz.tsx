"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { VizShell, ACCENT } from "./shell";

const N = 8;
const COLORS = ["#2DD4BF", "#A3E635", "#FBBF24", "#f472b6", "#38bdf8", "#c084fc", "#fb923c", "#4ade80"];

const pos = (i: number) => ({ x: 60 + (i % 4) * 100, y: i < 4 ? 70 : 165 });

export function UnionFindViz() {
  const accent = "ds" as const;
  const [parent, setParent] = useState<number[]>(() => Array.from({ length: N }, (_, i) => i));
  const [rank, setRank] = useState<number[]>(() => Array(N).fill(0));
  const [flash, setFlash] = useState<number[]>([]);
  const [note, setNote] = useState("Each element starts in its own set. Union merges; find returns the root.");

  const find = (p: number[], x: number): number => {
    while (p[x] !== x) x = p[x];
    return x;
  };

  const doFind = () => {
    const x = Math.floor(Math.random() * N);
    const path: number[] = [];
    let cur = x;
    while (parent[cur] !== cur) { path.push(cur); cur = parent[cur]; }
    path.push(cur);
    setFlash(path);
    // path compression
    const np = [...parent];
    path.forEach((node) => (np[node] = cur));
    setTimeout(() => { setParent(np); setNote(`find(${x}) → root ${cur}. Path compressed: every node now points straight to the root.`); }, 400);
    setNote(`find(${x}) walks up: ${path.join(" → ")}.`);
    setTimeout(() => setFlash([]), 1100);
  };

  const doUnion = () => {
    const a = Math.floor(Math.random() * N);
    let b = Math.floor(Math.random() * N);
    if (a === b) b = (b + 1) % N;
    const ra = find(parent, a);
    const rb = find(parent, b);
    if (ra === rb) { setNote(`union(${a}, ${b}) → already in the same set. No-op.`); setFlash([ra]); setTimeout(() => setFlash([]), 800); return; }
    const np = [...parent];
    const nr = [...rank];
    if (nr[ra] < nr[rb]) np[ra] = rb;
    else if (nr[ra] > nr[rb]) np[rb] = ra;
    else { np[rb] = ra; nr[ra]++; }
    setParent(np);
    setRank(nr);
    setFlash([ra, rb]);
    setNote(`union(${a}, ${b}) → attach the shorter tree under the taller root (union by rank).`);
    setTimeout(() => setFlash([]), 900);
  };

  const reset = () => {
    setParent(Array.from({ length: N }, (_, i) => i));
    setRank(Array(N).fill(0));
    setFlash([]);
    setNote("Reset — eight singleton sets.");
  };

  const rootColor = (i: number) => COLORS[find(parent, i) % COLORS.length];

  return (
    <VizShell
      accent={accent}
      title="union_find"
      status={`${new Set(parent.map((_, i) => find(parent, i))).size} sets`}
      legend={<span>arrows point to parent · color = connected component</span>}
      controls={
        <div className="flex flex-wrap gap-2">
          <button onClick={doUnion} className="rounded-lg border border-ds/40 bg-ds/10 px-3 py-1.5 font-mono text-xs text-ds hover:bg-ds/20">union(a, b)</button>
          <button onClick={doFind} className="rounded-lg border border-line bg-white/5 px-3 py-1.5 font-mono text-xs text-slate-200 hover:bg-white/10">find(x)</button>
          <button onClick={reset} className="rounded-lg border border-line bg-white/5 px-3 py-1.5 font-mono text-xs text-slate-400 hover:bg-white/10">reset</button>
        </div>
      }
    >
      <div className="flex justify-center">
        <svg viewBox="0 0 420 230" className="w-full max-w-xl">
          {parent.map((p, i) => {
            if (p === i) return null;
            const a = pos(i);
            const b = pos(p);
            return (
              <motion.line
                key={`e-${i}`}
                initial={false}
                animate={{ x1: a.x, y1: a.y, x2: b.x, y2: b.y }}
                stroke={flash.includes(i) ? "#fff" : "rgba(148,163,184,0.4)"}
                strokeWidth={flash.includes(i) ? 2.5 : 1.5}
                markerEnd="url(#uf-arrow)"
              />
            );
          })}
          <defs>
            <marker id="uf-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="rgba(148,163,184,0.6)" />
            </marker>
          </defs>
          {Array.from({ length: N }, (_, i) => {
            const { x, y } = pos(i);
            const isRoot = parent[i] === i;
            const c = rootColor(i);
            const lit = flash.includes(i);
            return (
              <g key={i}>
                <motion.circle cx={x} cy={y} r="18" animate={{ fill: c, scale: lit ? 1.15 : 1 }}
                  stroke={isRoot ? "#fff" : "rgba(11,14,22,0.8)"} strokeWidth={isRoot ? 2.5 : 2} style={{ transformOrigin: `${x}px ${y}px` }} />
                <text x={x} y={y + 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="#06121f" className="font-mono">{i}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-3 text-center font-mono text-xs text-slate-300">{note}</p>
    </VizShell>
  );
}
