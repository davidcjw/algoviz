"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { VizShell, Transport, LegendDot, useFramePlayer, ACCENT } from "./shell";

type GMode = "explore" | "bfs" | "dfs" | "dijkstra";

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
  note: string;
};

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

export function GraphViz({ mode = "explore" }: { mode?: GMode }) {
  const isAlgo = mode !== "explore";
  const accent = isAlgo ? "algo" : "ds";
  const [algo, setAlgo] = useState<Exclude<GMode, "explore">>(mode === "explore" ? "bfs" : mode);
  const weighted = algo === "dijkstra";

  const frames = useMemo(() => {
    if (algo === "bfs") return bfsFrames("A");
    if (algo === "dfs") return dfsFrames("A");
    return dijkstraFrames("A", "F");
  }, [algo]);

  const { index, playing, speed, setSpeed, toggle, step, back, reset, setIndex } = useFramePlayer(frames.length, { baseMs: 720 });
  const f = frames[index];

  const nodeColor = (id: string) => {
    if (f.path?.includes(id)) return "#A3E635";
    if (f.current === id) return "#ffffff";
    if (f.visited.includes(id)) return ACCENT[accent].raw;
    if (f.frontier.includes(id)) return "#38bdf8";
    return "#3f4a63";
  };
  const edgeActive = (a: string, b: string) =>
    (f.edge && ((f.edge[0] === a && f.edge[1] === b) || (f.edge[0] === b && f.edge[1] === a))) ||
    (f.path && pathHasEdge(f.path, a, b));

  return (
    <VizShell
      accent={accent as "ds" | "algo"}
      title={`graph_${algo}`}
      status={`step ${index + 1} / ${frames.length}`}
      legend={
        <>
          <LegendDot color="#38bdf8" label={algo === "dijkstra" ? "in queue" : "frontier"} />
          <LegendDot color="#ffffff" label="current" />
          <LegendDot color={ACCENT[accent].raw} label="visited" />
          {algo === "dijkstra" && <LegendDot color="#A3E635" label="shortest path" />}
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
              <div className="flex gap-1">
                {(["bfs", "dfs", "dijkstra"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setAlgo(m); reset(); setIndex(0); }}
                    className={`rounded-md px-2.5 py-1 font-mono text-2xs uppercase transition-colors ${algo === m ? "bg-algo text-ink" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
                  >
                    {m}
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
            const inPath = f.path && pathHasEdge(f.path, a, b);
            return (
              <g key={`${a}${b}`}>
                <line
                  x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                  stroke={inPath ? "#A3E635" : on ? "#ffffff" : "rgba(148,163,184,0.25)"}
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
            const light = c === "#ffffff" || c === "#A3E635" || c === ACCENT[accent].raw;
            return (
              <g key={n.id}>
                <motion.circle
                  cx={n.x} cy={n.y} r="20"
                  animate={{ fill: c, filter: f.current === n.id ? "drop-shadow(0 0 8px #fff)" : "none" }}
                  stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"
                />
                <text x={n.x} y={n.y + 4.5} textAnchor="middle" fontSize="13" fontWeight="700" fill={light ? "#06121f" : "#e7ecf5"} className="font-mono">{n.id}</text>
                {f.dist && (
                  <text x={n.x} y={n.y - 27} textAnchor="middle" fontSize="10" className="fill-slate-400 font-mono">
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
