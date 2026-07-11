"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { VizShell, Transport, LegendDot, useFramePlayer, ACCENT } from "./shell";

type GMode = "explore" | "bfs" | "dfs" | "dijkstra" | "prim" | "bellman-ford";

const NODES = [
  { id: "A", x: 50, y: 150 },
  { id: "B", x: 150, y: 55 },
  { id: "C", x: 150, y: 245 },
  { id: "D", x: 265, y: 115 },
  { id: "E", x: 265, y: 215 },
  { id: "F", x: 370, y: 155 },
];

const EDGES: [string, string, number][] = [
  ["A", "B", 4],
  ["A", "C", 3],
  ["B", "D", 5],
  ["C", "D", 8],
  ["C", "E", 7],
  ["D", "E", 2],
  ["D", "F", 6],
  ["E", "F", 4],
];

const adj: Record<string, { to: string; w: number }[]> = {};
NODES.forEach((n) => (adj[n.id] = []));
EDGES.forEach(([a, b, w]) => {
  adj[a].push({ to: b, w });
  adj[b].push({ to: a, w });
});
Object.values(adj).forEach((l) => l.sort((x, y) => x.to.localeCompare(y.to)));

type Frame = {
  visited: string[];
  frontier: string[];
  current: string | null;
  edge: [string, string] | null;
  dist?: Record<string, number>;
  path?: string[];
  tree?: [string, string][];
  note: string;
};

function edgeWeight(a: string, b: string): number {
  const e = EDGES.find(([x, y]) => (x === a && y === b) || (x === b && y === a));
  return e ? e[2] : 0;
}

function bfsFrames(src: string): Frame[] {
  const frames: Frame[] = [];
  const visited: string[] = [];
  const queue = [src];
  const seen = new Set([src]);
  frames.push({ visited: [], frontier: [...queue], current: null, edge: null, note: `Start BFS at ${src}. Enqueue it.` });
  while (queue.length) {
    const cur = queue.shift()!;
    visited.push(cur);
    frames.push({ visited: [...visited], frontier: [...queue], current: cur, edge: null, note: `Dequeue ${cur} → visit it.` });
    for (const { to } of adj[cur]) {
      if (!seen.has(to)) {
        seen.add(to);
        queue.push(to);
        frames.push({ visited: [...visited], frontier: [...queue], current: cur, edge: [cur, to], note: `Discover ${to} → enqueue. First visit = shortest hops.` });
      }
    }
  }
  frames.push({ visited: [...visited], frontier: [], current: null, edge: null, note: `Done. Visited order: ${visited.join(" → ")}.` });
  return frames;
}

function dfsFrames(src: string): Frame[] {
  const frames: Frame[] = [];
  const visited: string[] = [];
  const seen = new Set<string>();
  const stack: string[] = [];
  function dfs(cur: string, from: string | null) {
    seen.add(cur);
    visited.push(cur);
    stack.push(cur);
    frames.push({
      visited: [...visited],
      frontier: [...stack],
      current: cur,
      edge: from ? [from, cur] : null,
      note: `Go deep into ${cur}.`,
    });
    for (const { to } of adj[cur]) {
      if (!seen.has(to)) dfs(to, cur);
    }
    stack.pop();
    frames.push({ visited: [...visited], frontier: [...stack], current: from, edge: null, note: `Dead end at ${cur} — backtrack.` });
  }
  frames.push({ visited: [], frontier: [], current: null, edge: null, note: `Start DFS at ${src}.` });
  dfs(src, null);
  frames.push({ visited: [...visited], frontier: [], current: null, edge: null, note: `Done. Visited order: ${visited.join(" → ")}.` });
  return frames;
}

function dijkstraFrames(src: string, target: string): Frame[] {
  const frames: Frame[] = [];
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  NODES.forEach((n) => { dist[n.id] = Infinity; prev[n.id] = null; });
  dist[src] = 0;
  const settled = new Set<string>();
  frames.push({ visited: [], frontier: [], current: null, edge: null, dist: { ...dist }, note: `dist[${src}] = 0, all others ∞.` });

  while (settled.size < NODES.length) {
    let u: string | null = null;
    let best = Infinity;
    for (const n of NODES) if (!settled.has(n.id) && dist[n.id] < best) { best = dist[n.id]; u = n.id; }
    if (u === null) break;
    settled.add(u);
    frames.push({ visited: [...settled], frontier: [], current: u, edge: null, dist: { ...dist }, note: `Settle ${u} (nearest unvisited, dist ${dist[u]}).` });
    for (const { to, w } of adj[u]) {
      if (settled.has(to)) continue;
      const nd = dist[u] + w;
      const better = nd < dist[to];
      frames.push({
        visited: [...settled], frontier: [], current: u, edge: [u, to], dist: { ...dist },
        note: `Relax ${u}→${to}: ${dist[u]} + ${w} = ${nd}${better ? ` < ${dist[to] === Infinity ? "∞" : dist[to]} ✓` : " (no improvement)"}.`,
      });
      if (better) { dist[to] = nd; prev[to] = u; }
    }
  }
  // reconstruct path
  const path: string[] = [];
  let cur: string | null = target;
  while (cur) { path.unshift(cur); cur = prev[cur]; }
  frames.push({ visited: NODES.map((n) => n.id), frontier: [], current: null, edge: null, dist: { ...dist }, path, note: `Shortest ${src}→${target} = ${dist[target]} via ${path.join(" → ")}.` });
  return frames;
}

function primFrames(src: string): Frame[] {
  const frames: Frame[] = [];
  const inTree = new Set<string>([src]);
  const tree: [string, string][] = [];
  frames.push({ visited: [src], frontier: [], current: src, edge: null, tree: [], note: `Start Prim's at ${src}. Grow one cheapest crossing edge at a time.` });

  while (inTree.size < NODES.length) {
    let best: { a: string; b: string; w: number } | null = null;
    for (const a of inTree) {
      for (const { to, w } of adj[a]) {
        if (!inTree.has(to) && (best === null || w < best.w)) best = { a, b: to, w };
      }
    }
    if (!best) break;
    frames.push({ visited: [...inTree], frontier: [best.b], current: best.a, edge: [best.a, best.b], tree: [...tree], note: `Cheapest edge crossing the cut: ${best.a}–${best.b} (weight ${best.w}). Add it.` });
    inTree.add(best.b);
    tree.push([best.a, best.b]);
    frames.push({ visited: [...inTree], frontier: [], current: best.b, edge: null, tree: [...tree], note: `${best.b} joins the tree. ${tree.length} of ${NODES.length - 1} edges chosen.` });
  }

  const total = tree.reduce((s, [a, b]) => s + edgeWeight(a, b), 0);
  frames.push({ visited: NODES.map((n) => n.id), frontier: [], current: null, edge: null, tree: [...tree], note: `MST complete — ${tree.length} edges, total weight ${total}.` });
  return frames;
}

function bellmanFordFrames(src: string, target: string): Frame[] {
  const frames: Frame[] = [];
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  NODES.forEach((n) => { dist[n.id] = Infinity; prev[n.id] = null; });
  dist[src] = 0;
  const V = NODES.length;
  const finite = () => NODES.filter((n) => dist[n.id] < Infinity).map((n) => n.id);
  frames.push({ visited: finite(), frontier: [], current: src, edge: null, dist: { ...dist }, note: `dist[${src}] = 0, all others ∞. Relax every edge, repeat V−1 = ${V - 1} times.` });

  // Undirected graph → relax each edge in both directions.
  const edgeList: [string, string, number][] = [];
  EDGES.forEach(([a, b, w]) => { edgeList.push([a, b, w]); edgeList.push([b, a, w]); });

  for (let pass = 1; pass < V; pass++) {
    let changed = false;
    frames.push({ visited: finite(), frontier: [], current: null, edge: null, dist: { ...dist }, note: `Pass ${pass} of ${V - 1}: sweep all edges.` });
    for (const [a, b, w] of edgeList) {
      if (dist[a] === Infinity) continue;
      const nd = dist[a] + w;
      if (nd < dist[b]) {
        dist[b] = nd;
        prev[b] = a;
        changed = true;
        frames.push({ visited: finite(), frontier: [b], current: a, edge: [a, b], dist: { ...dist }, note: `Relax ${a}→${b}: ${nd < Infinity ? nd : "∞"} improves dist[${b}] ✓.` });
      }
    }
    if (!changed) {
      frames.push({ visited: finite(), frontier: [], current: null, edge: null, dist: { ...dist }, note: `Pass ${pass} changed nothing — converged early, stop.` });
      break;
    }
  }

  const path: string[] = [];
  let cur: string | null = target;
  while (cur) { path.unshift(cur); cur = prev[cur]; }
  frames.push({ visited: NODES.map((n) => n.id), frontier: [], current: null, edge: null, dist: { ...dist }, path, note: `Shortest ${src}→${target} = ${dist[target]} via ${path.join(" → ")}. Handles negative edges too.` });
  return frames;
}

export function GraphViz({ mode = "explore" }: { mode?: GMode }) {
  const isAlgo = mode !== "explore";
  const accent = isAlgo ? "algo" : "ds";
  const [algo, setAlgo] = useState<Exclude<GMode, "explore">>(mode === "explore" ? "bfs" : mode);
  const weighted = algo === "dijkstra" || algo === "prim" || algo === "bellman-ford";

  const frames = useMemo(() => {
    if (algo === "bfs") return bfsFrames("A");
    if (algo === "dfs") return dfsFrames("A");
    if (algo === "prim") return primFrames("A");
    if (algo === "bellman-ford") return bellmanFordFrames("A", "F");
    return dijkstraFrames("A", "F");
  }, [algo]);

  const { index, playing, speed, setSpeed, toggle, step, back, reset, setIndex } = useFramePlayer(frames.length, { baseMs: 720 });
  const f = frames[index];

  const nodeColor = (id: string) => {
    if (f.path?.includes(id)) return "#4D7C0F";
    if (f.current === id) return "#161A22";
    if (f.visited.includes(id)) return ACCENT[accent].raw;
    if (f.frontier.includes(id)) return "#38bdf8";
    return "#3f4a63";
  };
  const inTreeEdge = (a: string, b: string) =>
    !!f.tree?.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  const edgeActive = (a: string, b: string) =>
    (f.edge && ((f.edge[0] === a && f.edge[1] === b) || (f.edge[0] === b && f.edge[1] === a))) ||
    (f.path && pathHasEdge(f.path, a, b)) ||
    inTreeEdge(a, b);

  return (
    <VizShell
      accent={accent as "ds" | "algo"}
      title={`graph_${algo}`}
      status={`step ${index + 1} / ${frames.length}`}
      legend={
        <>
          <LegendDot color="#38bdf8" label={algo === "dijkstra" ? "in queue" : algo === "prim" ? "candidate" : algo === "bellman-ford" ? "relaxing" : "frontier"} />
          <LegendDot color="#161A22" label="current" />
          <LegendDot color={ACCENT[accent].raw} label={algo === "prim" ? "in tree" : "visited"} />
          {weighted && <LegendDot color="#4D7C0F" label={algo === "prim" ? "MST edge" : "shortest path"} />}
        </>
      }
      controls={
        <Transport
          accent={accent as "ds" | "algo"}
          playing={playing}
          onToggle={toggle}
          onStep={step}
          onBack={back}
          onReset={reset}
          speed={speed}
          onSpeed={setSpeed}
          extra={
            mode === "explore" ? (
              <div className="flex flex-wrap gap-1">
                {([["bfs", "BFS"], ["dfs", "DFS"], ["dijkstra", "Dijkstra"], ["prim", "Prim"], ["bellman-ford", "Bellman"]] as const).map(([m, label]) => (
                  <button
                    key={m}
                    onClick={() => { setAlgo(m); reset(); setIndex(0); }}
                    className={`rounded-md px-2.5 py-1 font-mono text-2xs uppercase transition-colors ${algo === m ? "bg-algo text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : null
          }
        />
      }
    >
      <div className="flex justify-center">
        <svg viewBox="0 0 420 300" className="w-full max-w-xl">
          {EDGES.map(([a, b, w]) => {
            const na = NODES.find((n) => n.id === a)!;
            const nb = NODES.find((n) => n.id === b)!;
            const on = edgeActive(a, b);
            const green = (f.path && pathHasEdge(f.path, a, b)) || inTreeEdge(a, b);
            return (
              <g key={`${a}${b}`}>
                <line
                  x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                  stroke={green ? "#4D7C0F" : on ? "#161A22" : "rgba(100,116,139,0.30)"}
                  strokeWidth={on ? 3 : 2}
                />
                {weighted && (
                  <g>
                    <circle cx={(na.x + nb.x) / 2} cy={(na.y + nb.y) / 2} r="11" fill="#0c111d" stroke="rgba(148,163,184,0.3)" />
                    <text x={(na.x + nb.x) / 2} y={(na.y + nb.y) / 2 + 3.5} textAnchor="middle" className="fill-slate-300 font-mono" fontSize="10">{w}</text>
                  </g>
                )}
              </g>
            );
          })}
          {NODES.map((n) => {
            const c = nodeColor(n.id);
            const light = c === "#38bdf8";
            return (
              <g key={n.id}>
                <motion.circle
                  cx={n.x} cy={n.y} r="20"
                  animate={{ fill: c, filter: f.current === n.id ? "drop-shadow(0 0 6px rgba(22,26,34,0.45))" : "none" }}
                  stroke="rgba(22,26,34,0.15)" strokeWidth="1.5"
                />
                <text x={n.x} y={n.y + 4.5} textAnchor="middle" fontSize="13" fontWeight="700" fill={light ? "#06121f" : "#f4f6f8"} className="font-mono">{n.id}</text>
                {f.dist && (
                  <text x={n.x} y={n.y - 27} textAnchor="middle" fontSize="10" className="fill-slate-600 font-mono">
                    {f.dist[n.id] === Infinity ? "∞" : f.dist[n.id]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-3 text-center font-mono text-xs text-slate-300">{f.note}</p>
    </VizShell>
  );
}

function pathHasEdge(path: string[], a: string, b: string) {
  for (let i = 0; i < path.length - 1; i++) {
    if ((path[i] === a && path[i + 1] === b) || (path[i] === b && path[i + 1] === a)) return true;
  }
  return false;
}
