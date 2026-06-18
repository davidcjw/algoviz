"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { VizShell, ACCENT } from "./shell";

type TrieNode = {
  id: number;
  char: string;
  end: boolean;
  children: Record<string, TrieNode>;
};
let trid = 700;

const makeRoot = (): TrieNode => ({ id: trid++, char: "", end: false, children: {} });

function insert(root: TrieNode, word: string) {
  let cur = root;
  for (const ch of word) {
    if (!cur.children[ch]) cur.children[ch] = { id: trid++, char: ch, end: false, children: {} };
    cur = cur.children[ch];
  }
  cur.end = true;
}

function pathFor(root: TrieNode, word: string): number[] {
  const ids = [root.id];
  let cur = root;
  for (const ch of word) {
    if (!cur.children[ch]) break;
    cur = cur.children[ch];
    ids.push(cur.id);
  }
  return ids;
}

type Pos = { node: TrieNode; x: number; y: number; parentId: number | null };

function layout(root: TrieNode) {
  const positions: Pos[] = [];
  let col = 0;
  const assign = (node: TrieNode, depth: number, parentId: number | null): number => {
    const kids = Object.values(node.children).sort((a, b) => a.char.localeCompare(b.char));
    let x: number;
    if (kids.length === 0) x = col++;
    else {
      const xs = kids.map((k) => assign(k, depth + 1, node.id));
      x = (xs[0] + xs[xs.length - 1]) / 2;
    }
    positions.push({ node, x, y: depth, parentId });
    return x;
  };
  assign(root, 0, null);
  const cols = Math.max(col, 1);
  const depth = positions.reduce((m, p) => Math.max(m, p.y), 0) + 1;
  return { positions, cols, depth };
}

const WORDS = ["cat", "car", "card", "dog", "do", "dot", "code"];

export function TrieViz() {
  const accent = "ds" as const;
  const [root, setRoot] = useState<TrieNode>(() => {
    const r = makeRoot();
    ["cat", "car", "dog"].forEach((w) => insert(r, w));
    return r;
  });
  const [hi, setHi] = useState<number[]>([]);
  const [note, setNote] = useState("A path from the root spells a prefix. Lookup is O(word length).");
  const tick = useRef(0);

  const { positions, cols, depth } = useMemo(() => layout(root), [root, tick.current]);
  const posMap = useMemo(() => new Map(positions.map((p) => [p.node.id, p])), [positions]);

  const W = Math.max(cols * 56, 200);
  const H = depth * 70;
  const px = (x: number) => 28 + x * 56;
  const py = (y: number) => 30 + y * 70;

  const animate = (ids: number[], note: string) => {
    setHi([]);
    ids.forEach((id, i) =>
      setTimeout(() => {
        setHi((h) => [...h, id]);
        if (i === ids.length - 1) setNote(note);
      }, i * 280),
    );
  };

  const addWord = () => {
    const existing = positions.length;
    const word = WORDS[(existing * 3) % WORDS.length];
    const next = structuredClone(root);
    insert(next, word);
    setRoot(next);
    tick.current++;
    setTimeout(() => animate(pathFor(next, word), `insert("${word}") → reused shared prefix, added new chars.`), 60);
  };

  const searchPrefix = () => {
    const prefixes = ["ca", "do", "cod"];
    const p = prefixes[tick.current % prefixes.length];
    tick.current++;
    animate(pathFor(root, p), `search prefix "${p}" → walked ${p.length} edges.`);
  };

  return (
    <VizShell
      accent={accent}
      title="trie"
      status={`${positions.length - 1} chars`}
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={addWord} className="rounded-lg border border-ds/40 bg-ds/10 px-3 py-1.5 font-mono text-xs text-ds hover:bg-ds/20">
            insert word
          </button>
          <button onClick={searchPrefix} className="rounded-lg border border-line bg-white/5 px-3 py-1.5 font-mono text-xs text-slate-200 hover:bg-white/10">
            search prefix
          </button>
          <button
            onClick={() => { const r = makeRoot(); ["cat", "car", "dog"].forEach((w) => insert(r, w)); setRoot(r); tick.current++; setHi([]); setNote("Reset."); }}
            className="rounded-lg border border-line bg-white/5 px-3 py-1.5 font-mono text-xs text-slate-400 hover:bg-white/10"
          >
            reset
          </button>
        </div>
      }
    >
      <div className="flex justify-center overflow-x-auto">
        <div className="relative" style={{ width: W, height: Math.max(H, 100) }}>
          <svg className="absolute inset-0" width={W} height={Math.max(H, 100)}>
            {positions.map((p) =>
              p.parentId !== null ? (
                <line
                  key={`e-${p.node.id}`}
                  x1={px(posMap.get(p.parentId)!.x)}
                  y1={py(posMap.get(p.parentId)!.y)}
                  x2={px(p.x)}
                  y2={py(p.y)}
                  stroke={hi.includes(p.node.id) && hi.includes(p.parentId) ? ACCENT.ds.raw : "rgba(148,163,184,0.22)"}
                  strokeWidth="2"
                />
              ) : null,
            )}
          </svg>
          {positions.map((p) => {
            const on = hi.includes(p.node.id);
            const isRoot = p.parentId === null;
            return (
              <motion.div
                key={p.node.id}
                layout
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 440, damping: 26 }}
                className="absolute grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border font-mono text-sm font-semibold"
                style={{
                  left: px(p.x),
                  top: py(p.y),
                  borderColor: on ? ACCENT.ds.raw : p.node.end ? "rgba(163,230,53,0.6)" : "rgba(148,163,184,0.3)",
                  background: isRoot ? "rgba(148,163,184,0.15)" : on ? "rgba(45,212,191,0.22)" : "rgba(18,24,38,0.85)",
                  color: "#fff",
                  boxShadow: on ? `0 0 16px ${ACCENT.ds.raw}66` : p.node.end ? "0 0 10px rgba(163,230,53,0.4)" : "none",
                }}
              >
                {isRoot ? "•" : p.node.char}
              </motion.div>
            );
          })}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-center gap-4 font-mono text-2xs text-slate-500">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full border border-algo/60" /> word end</span>
      </div>
      <p className="mt-2 text-center font-mono text-xs text-slate-300">{note}</p>
    </VizShell>
  );
}
