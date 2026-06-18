"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { VizShell, Transport, LegendDot, useFramePlayer, ACCENT } from "./shell";

type Frame = {
  lo?: number;
  hi?: number;
  mid?: number;
  cursor?: number;
  found?: number;
  eliminated: boolean[];
  note: string;
};

function makeArray(seed: number) {
  const set = new Set<number>();
  let s = seed;
  while (set.size < 13) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    set.add((s % 95) + 4);
  }
  return [...set].sort((a, b) => a - b);
}

function binaryFrames(arr: number[], target: number): Frame[] {
  const frames: Frame[] = [];
  const elim = arr.map(() => false);
  let lo = 0,
    hi = arr.length - 1;
  frames.push({ lo, hi, eliminated: [...elim], note: `Search ${target} in a sorted array.` });
  while (lo <= hi) {
    const mid = lo + ((hi - lo) >> 1);
    frames.push({ lo, hi, mid, eliminated: [...elim], note: `mid = ${arr[mid]}. Compare with ${target}.` });
    if (arr[mid] === target) {
      frames.push({ lo, hi, mid, found: mid, eliminated: [...elim], note: `Found ${target} at index ${mid}.` });
      return frames;
    }
    if (arr[mid] < target) {
      for (let k = lo; k <= mid; k++) elim[k] = true;
      lo = mid + 1;
      frames.push({ lo, hi, eliminated: [...elim], note: `${arr[mid]} < ${target} — discard the left half.` });
    } else {
      for (let k = mid; k <= hi; k++) elim[k] = true;
      hi = mid - 1;
      frames.push({ lo, hi, eliminated: [...elim], note: `${arr[mid]} > ${target} — discard the right half.` });
    }
  }
  frames.push({ eliminated: elim.map(() => true), note: `${target} not present.` });
  return frames;
}

function linearFrames(arr: number[], target: number): Frame[] {
  const frames: Frame[] = [];
  const elim = arr.map(() => false);
  frames.push({ eliminated: [...elim], note: `Scan left to right for ${target}.` });
  for (let i = 0; i < arr.length; i++) {
    frames.push({ cursor: i, eliminated: [...elim], note: `Check index ${i}: ${arr[i]}.` });
    if (arr[i] === target) {
      frames.push({ cursor: i, found: i, eliminated: [...elim], note: `Found ${target} at index ${i}.` });
      return frames;
    }
    elim[i] = true;
  }
  frames.push({ eliminated: elim.map(() => true), note: `${target} not present.` });
  return frames;
}

export function SearchVisualizer({ mode }: { mode: "binary" | "linear" }) {
  const accent = "algo" as const;
  const [seed, setSeed] = useState(11);
  const arr = useMemo(() => makeArray(seed), [seed]);
  const target = useMemo(() => arr[(seed * 7) % arr.length], [arr, seed]);
  const frames = useMemo(
    () => (mode === "binary" ? binaryFrames(arr, target) : linearFrames(arr, target)),
    [arr, target, mode],
  );

  const { index, playing, speed, setSpeed, toggle, step, back, reset } = useFramePlayer(
    frames.length,
    { baseMs: 700 },
  );
  const f = frames[index];

  const colorFor = (i: number) => {
    if (f.found === i) return ACCENT.algo.raw;
    if (f.mid === i || f.cursor === i) return "#161A22";
    if (mode === "binary" && f.lo !== undefined && f.hi !== undefined && i >= f.lo && i <= f.hi)
      return "#38bdf8";
    if (f.eliminated[i]) return "#cbd5e1";
    return "#94a3b8";
  };

  return (
    <VizShell
      accent={accent}
      title={mode === "binary" ? "binary_search" : "linear_search"}
      status={`step ${index + 1} / ${frames.length}`}
      legend={
        <>
          {mode === "binary" && <LegendDot color="#38bdf8" label="active range" />}
          <LegendDot color="#161A22" label={mode === "binary" ? "mid" : "cursor"} />
          <LegendDot color="#cbd5e1" label="eliminated" />
          <LegendDot color={ACCENT.algo.raw} label="found" />
        </>
      }
      controls={
        <Transport
          accent={accent}
          playing={playing}
          onToggle={toggle}
          onStep={step}
          onBack={back}
          onReset={reset}
          onShuffle={() => setSeed((s) => s + 5)}
          speed={speed}
          onSpeed={setSpeed}
          extra={
            <span className="font-mono text-2xs text-slate-400">
              target = <span className="text-algo">{target}</span>
            </span>
          }
        />
      }
    >
      <div className="flex flex-wrap items-end justify-center gap-1.5 pt-6 sm:gap-2">
        {arr.map((v, i) => {
          const c = colorFor(i);
          const isMid = f.mid === i || f.cursor === i;
          return (
            <div key={i} className="relative flex flex-col items-center">
              {(f.lo === i || f.hi === i || isMid) && (
                <div className="absolute -top-6 font-mono text-2xs text-slate-400">
                  {isMid ? (mode === "binary" ? "mid" : "i") : f.lo === i ? "lo" : "hi"}
                </div>
              )}
              <motion.div
                animate={{ backgroundColor: c, boxShadow: isMid ? "0 2px 10px rgba(22,26,34,0.20)" : "none" }}
                className="grid h-11 w-9 place-items-center rounded-md font-mono text-sm font-semibold sm:h-12 sm:w-11"
                style={{ color: c === "#161A22" || c === ACCENT.algo.raw ? "#f4f6f8" : "#1f2937" }}
              >
                {v}
              </motion.div>
              <span className="mt-1 font-mono text-2xs text-slate-600">{i}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-8 text-center font-mono text-xs text-slate-300">{f.note}</p>
    </VizShell>
  );
}
