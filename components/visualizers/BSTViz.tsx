"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { VizShell, ACCENT } from "./shell";

type TNode = { id: number; value: number; left: TNode | null; right: TNode | null };
let tnid = 600;

function insertNode(root: TNode | null, value: number): TNode {
  if (!root) return { id: tnid++, value, left: null, right: null };
  if (value < root.value) root.left = insertNode(root.left, value);
  else if (value > root.value) root.right = insertNode(root.right, value);
  return root;
}

function pathTo(root: TNode | null, value: number): number[] {
  const path: number[] = [];
  let cur = root;
  while (cur) {
    path.push(cur.id);
    if (value === cur.value) break;
    cur = value < cur.value ? cur.left : cur.right;
  }
  return path;
}

type Pos = { node: TNode; x: number; y: number; parent: TNode | null };

function layout(root: TNode | null) {
  const positions: Pos[] = [];
  let col = 0;
  const visit = (node: TNode | null, depth: number, parent: TNode | null) => {
    if (!node) return;
    visit(node.left, depth + 1, node);
    positions.push({ node, x: col++, y: depth, parent });
    visit(node.right, depth + 1, node);
  };
  visit(root, 0, null);
  const cols = Math.max(col, 1);
  const depth = positions.reduce((m, p) => Math.max(m, p.y), 0) + 1;
  return { positions, cols, depth };
}

function build(values: number[]) {
  let root: TNode | null = null;
  values.forEach((v) => (root = insertNode(root, v)));
  return root;
}

export function BSTViz() {
  const accent = "ds" as const;
  const [root, setRoot] = useState<TNode | null>(() => build([50, 30, 70, 20, 40, 60]));
  const [highlight, setHighlight] = useState<number[]>([]);
  const [target, setTarget] = useState<number | null>(null);
  const [note, setNote] = useState("Left < node < right. Search discards half the tree each step.");
  const counter = useRef(0);

  const { positions, cols, depth } = useMemo(() => layout(root), [root, counter.current]);
  const posMap = useMemo(() => new Map(positions.map((p) => [p.node.id, p])), [positions]);

  const W = Math.max(cols * 64, 200);
  const H = depth * 78;
  const px = (x: number) => 32 + x * 64;
  const py = (y: number) => 36 + y * 78;

  const animatePath = (path: number[], done?: () => void) => {
    setHighlight([]);
    path.forEach((id, i) => {
      setTimeout(() => {
        setHighlight((h) => [...h, id]);
        if (i === path.length - 1) done?.();
      }, i * 380);
    });
  };

  const insertRandom = (sorted = false) => {
    const all = positions.map((p) => p.node.value);
    let v = sorted
      ? Math.max(0, ...all) + Math.floor(Math.random() * 12) + 4
      : Math.floor(Math.random() * 99) + 1;
    if (all.includes(v)) v += 1;
    const path = pathTo(root, v);
    setTarget(v);
    animatePath([...path], () => {
      setRoot((r) => {
        const copy = structuredClone(r);
        const nr = insertNode(copy, v);
        return nr;
      });
      counter.current++;
      setNote(`insert(${v}) → walked ${path.length} node(s) down. ${sorted ? "Sorted input skews the tree!" : ""}`);
    });
  };

  const search = () => {
    const all = positions.map((p) => p.node.value);
    if (!all.length) return;
    const v = all[Math.floor(Math.random() * all.length)];
    setTarget(v);
    const path = pathTo(root, v);
    animatePath(path, () => setNote(`search(${v}) → found in ${path.length} comparisons. O(log n) when balanced.`));
  };

  const reset = () => {
    setRoot(build([50, 30, 70, 20, 40, 60]));
    setHighlight([]);
    setTarget(null);
    counter.current++;
    setNote("Balanced BST restored.");
  };

  return (
    <VizShell
      accent={accent}
      title="binary_search_tree"
      status={`${positions.length} nodes · height ${depth}`}
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => insertRandom(false)} className="rounded-lg border border-ds/40 bg-ds/10 px-3 py-1.5 font-mono text-xs text-ds hover:bg-ds/20">
            insert random
          </button>
          <button onClick={() => insertRandom(true)} className="rounded-lg border border-amber-400/30 bg-amber-400/10 px-3 py-1.5 font-mono text-xs text-amber-300 hover:bg-amber-400/20">
            insert ascending
          </button>
          <button onClick={search} className="rounded-lg border border-line bg-white/5 px-3 py-1.5 font-mono text-xs text-slate-200 hover:bg-white/10">
            search
          </button>
          <button onClick={reset} className="rounded-lg border border-line bg-white/5 px-3 py-1.5 font-mono text-xs text-slate-400 hover:bg-white/10">
            reset
          </button>
        </div>
      }
    >
      <div className="flex justify-center overflow-x-auto">
        <div className="relative" style={{ width: W, height: Math.max(H, 120) }}>
          <svg className="absolute inset-0" width={W} height={Math.max(H, 120)}>
            {positions.map((p) =>
              p.parent ? (
                <line
                  key={`e-${p.node.id}`}
                  x1={px(posMap.get(p.parent.id)!.x)}
                  y1={py(posMap.get(p.parent.id)!.y)}
                  x2={px(p.x)}
                  y2={py(p.y)}
                  stroke={highlight.includes(p.node.id) && highlight.includes(p.parent.id) ? ACCENT.ds.raw : "rgba(148,163,184,0.25)"}
                  strokeWidth="2"
                />
              ) : null,
            )}
          </svg>
          {positions.map((p) => {
            const on = highlight.includes(p.node.id);
            const isTarget = target === p.node.value && on;
            return (
              <motion.div
                key={p.node.id}
                layout
                initial={{ scale: 0, opacity: 0, x: "-50%", y: "-50%" }}
                animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
                transition={{ type: "spring", stiffness: 420, damping: 26 }}
                className="absolute grid h-10 w-10 place-items-center rounded-full border font-mono text-sm font-semibold"
                style={{
                  left: px(p.x),
                  top: py(p.y),
                  borderColor: isTarget ? "#161A22" : on ? ACCENT.ds.raw : "rgba(15,118,110,0.35)",
                  background: isTarget ? ACCENT.ds.raw : on ? "rgba(15,118,110,0.2)" : "rgba(22,26,34,0.05)",
                  color: isTarget ? "#f4f6f8" : "#161A22",
                  boxShadow: on ? `0 0 18px ${ACCENT.ds.raw}66` : "none",
                }}
              >
                {p.node.value}
              </motion.div>
            );
          })}
        </div>
      </div>
      <p className="mt-4 text-center font-mono text-xs text-slate-300">{note}</p>
    </VizShell>
  );
}
