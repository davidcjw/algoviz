"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { VizShell, Transport, LegendDot, useFramePlayer, ACCENT } from "./shell";

type FNode = { id: number; n: number; children: FNode[]; x: number; y: number };

function buildTree() {
  let id = 0;
  let col = 0;
  const build = (n: number, depth: number): FNode => {
    const node: FNode = { id: id++, n, children: [], x: 0, y: depth };
    if (n > 1) node.children = [build(n - 1, depth + 1), build(n - 2, depth + 1)];
    if (node.children.length === 0) node.x = col++;
    else node.x = (node.children[0].x + node.children[node.children.length - 1].x) / 2;
    return node;
  };
  const root = build(5, 0);
  const all: FNode[] = [];
  const collect = (nd: FNode) => { all.push(nd); nd.children.forEach(collect); };
  collect(root);
  return { root, all, cols: col };
}

type Frame = { called: number[]; active: number[]; returned: Record<number, number>; note: string };

function buildFrames(root: FNode): Frame[] {
  const frames: Frame[] = [];
  const called: number[] = [];
  const stack: number[] = [];
  const returned: Record<number, number> = {};
  const computed = new Set<number>();
  const run = (node: FNode): number => {
    called.push(node.id);
    stack.push(node.id);
    const repeat = computed.has(node.n) && node.n >= 2;
    frames.push({
      called: [...called], active: [...stack], returned: { ...returned },
      note: `call fib(${node.n})${repeat ? ` — already computed elsewhere! Wasted work.` : ""}`,
    });
    let val: number;
    if (node.n <= 1) val = node.n;
    else val = run(node.children[0]) + run(node.children[1]);
    returned[node.id] = val;
    computed.add(node.n);
    stack.pop();
    frames.push({ called: [...called], active: [...stack], returned: { ...returned }, note: `fib(${node.n}) returns ${val}.` });
    return val;
  };
  run(root);
  frames.push({ called: [...called], active: [], returned: { ...returned }, note: `fib(5) = ${returned[root.id]}. Notice the repeated subtrees — memoization caches them.` });
  return frames;
}

export function RecursionViz() {
  const accent = "algo" as const;
  const { root, all, cols } = useMemo(buildTree, []);
  const frames = useMemo(() => buildFrames(root), [root]);
  const { index, playing, speed, setSpeed, toggle, step, back, reset } = useFramePlayer(frames.length, { baseMs: 560 });
  const f = frames[index];

  const W = Math.max(cols * 52, 240);
  const depth = all.reduce((m, n) => Math.max(m, n.y), 0) + 1;
  const H = depth * 60;
  const px = (x: number) => 26 + x * 52;
  const py = (y: number) => 26 + y * 60;
  const posMap = new Map(all.map((n) => [n.id, n]));

  return (
    <VizShell
      accent={accent}
      title="fibonacci_recursion"
      status={`step ${index + 1} / ${frames.length}`}
      legend={
        <>
          <LegendDot color="#ffffff" label="on call stack" />
          <LegendDot color={ACCENT.algo.raw} label="returned" />
          <LegendDot color="#3f4a63" label="pending" />
        </>
      }
      controls={<Transport accent={accent} playing={playing} onToggle={toggle} onStep={step} onBack={back} onReset={reset} speed={speed} onSpeed={setSpeed} />}
    >
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="flex flex-1 justify-center overflow-x-auto">
          <div className="relative" style={{ width: W, height: H }}>
            <svg className="absolute inset-0" width={W} height={H}>
              {all.map((n) =>
                n.children.map((c) => {
                  const lit = f.active.includes(n.id) && f.active.includes(c.id);
                  return (
                    <line key={`${n.id}-${c.id}`} x1={px(n.x)} y1={py(n.y)} x2={px(c.x)} y2={py(c.y)} stroke={lit ? "#fff" : "rgba(148,163,184,0.2)"} strokeWidth={lit ? 2.5 : 1.5} />
                  );
                }),
              )}
            </svg>
            {all.map((n) => {
              const visible = f.called.includes(n.id);
              const active = f.active.includes(n.id);
              const ret = f.returned[n.id] !== undefined;
              return (
                <motion.div
                  key={n.id}
                  initial={false}
                  animate={{
                    opacity: visible ? 1 : 0.18,
                    scale: active ? 1.12 : 1,
                    borderColor: active ? "#fff" : ret ? ACCENT.algo.raw : "rgba(148,163,184,0.3)",
                    backgroundColor: active ? "rgba(255,255,255,0.16)" : ret ? "rgba(163,230,53,0.16)" : "rgba(18,24,38,0.85)",
                  }}
                  className="absolute grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border font-mono text-2xs font-semibold text-white"
                  style={{ left: px(n.x), top: py(n.y) }}
                >
                  {ret ? f.returned[n.id] : n.n}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* call stack */}
        <div className="w-full shrink-0 lg:w-44">
          <div className="font-mono text-2xs uppercase tracking-wider text-slate-500">call stack</div>
          <div className="mt-2 flex flex-col-reverse gap-1">
            {f.active.map((id) => (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-md border border-white/30 bg-white/5 px-3 py-1.5 font-mono text-xs text-white"
              >
                fib({posMap.get(id)?.n})
              </motion.div>
            ))}
            {f.active.length === 0 && <span className="font-mono text-2xs text-slate-600">empty</span>}
          </div>
        </div>
      </div>
      <p className="mt-3 text-center font-mono text-xs text-slate-300">{f.note}</p>
    </VizShell>
  );
}
