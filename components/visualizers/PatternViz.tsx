"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { VizShell, Transport, LegendDot, useFramePlayer, ACCENT } from "./shell";

type TPFrame = { left: number; right: number; sum: number; found: boolean; note: string };
type SWFrame = { left: number; right: number; best: [number, number]; note: string };

function twoPointerFrames(arr: number[], target: number): TPFrame[] {
  const frames: TPFrame[] = [];
  let l = 0,
    r = arr.length - 1;
  while (l < r) {
    const sum = arr[l] + arr[r];
    if (sum === target) {
      frames.push({ left: l, right: r, sum, found: true, note: `${arr[l]} + ${arr[r]} = ${target} ✓ Found the pair!` });
      break;
    }
    frames.push({
      left: l, right: r, sum, found: false,
      note: `${arr[l]} + ${arr[r]} = ${sum} ${sum < target ? `< ${target} → move left pointer right` : `> ${target} → move right pointer left`}.`,
    });
    if (sum < target) l++;
    else r--;
  }
  return frames;
}

function slidingWindowFrames(s: string): SWFrame[] {
  const frames: SWFrame[] = [];
  const seen = new Map<string, number>();
  let l = 0;
  let best: [number, number] = [0, 0];
  for (let r = 0; r < s.length; r++) {
    const ch = s[r];
    if (seen.has(ch) && seen.get(ch)! >= l) {
      frames.push({ left: l, right: r, best, note: `'${ch}' repeats → shrink: move left past previous '${ch}'.` });
      l = seen.get(ch)! + 1;
    }
    seen.set(ch, r);
    if (r - l > best[1] - best[0]) best = [l, r];
    frames.push({ left: l, right: r, best, note: `Window "${s.slice(l, r + 1)}" — longest so far: "${s.slice(best[0], best[1] + 1)}" (${best[1] - best[0] + 1}).` });
  }
  return frames;
}

export function PatternViz({ mode }: { mode: "two-pointers" | "sliding-window" }) {
  const accent = "algo" as const;
  const arr = useMemo(() => [2, 5, 8, 12, 15, 21, 26, 30], []);
  const target = 33;
  const str = "abcabcbb";

  const frames = useMemo(
    () => (mode === "two-pointers" ? twoPointerFrames(arr, target) : slidingWindowFrames(str)),
    [mode, arr],
  );
  const { index, playing, speed, setSpeed, toggle, step, back, reset } = useFramePlayer(frames.length, { baseMs: 800 });
  const f = frames[index] as TPFrame & SWFrame;

  const items = mode === "two-pointers" ? arr.map(String) : str.split("");

  return (
    <VizShell
      accent={accent}
      title={mode === "two-pointers" ? "two_pointers" : "sliding_window"}
      status={`step ${index + 1} / ${frames.length}`}
      legend={
        mode === "two-pointers" ? (
          <>
            <LegendDot color="#38bdf8" label="left / right pointer" />
            <LegendDot color={ACCENT.algo.raw} label="match" />
            <span>target = {target}</span>
          </>
        ) : (
          <>
            <LegendDot color="#38bdf8" label="window" />
            <LegendDot color={ACCENT.algo.raw} label="best window" />
          </>
        )
      }
      controls={
        <Transport accent={accent} playing={playing} onToggle={toggle} onStep={step} onBack={back} onReset={reset} speed={speed} onSpeed={setSpeed} />
      }
    >
      <div className="flex flex-wrap items-end justify-center gap-2 pt-8">
        {items.map((v, i) => {
          const inWindow = mode === "sliding-window" && i >= f.left && i <= f.right;
          const inBest = mode === "sliding-window" && i >= f.best[0] && i <= f.best[1];
          const isPtr = mode === "two-pointers" && (i === f.left || i === f.right);
          const matched = mode === "two-pointers" && f.found && (i === f.left || i === f.right);
          let bg = "rgba(22,26,34,0.05)";
          let border = "rgba(148,163,184,0.18)";
          if (matched) { bg = ACCENT.algo.raw; border = ACCENT.algo.raw; }
          else if (isPtr) { bg = "rgba(56,189,248,0.18)"; border = "#38bdf8"; }
          else if (inBest) { bg = "rgba(77,124,15,0.16)"; border = ACCENT.algo.raw; }
          else if (inWindow) { bg = "rgba(56,189,248,0.14)"; border = "#38bdf8"; }
          return (
            <div key={i} className="relative flex flex-col items-center">
              {isPtr && (
                <motion.div layoutId={i === f.left ? "lptr" : "rptr"} className="absolute -top-7 font-mono text-2xs text-sky-300">
                  {i === f.left ? "L" : "R"}
                </motion.div>
              )}
              <motion.div
                animate={{ backgroundColor: bg, borderColor: border, boxShadow: isPtr || matched ? `0 0 14px ${border}` : "none" }}
                className="grid h-12 w-11 place-items-center rounded-lg border font-mono text-base font-semibold"
                style={{ color: matched ? "#f4f6f8" : "#161A22" }}
              >
                {v}
              </motion.div>
              <span className="mt-1 font-mono text-2xs text-slate-600">{i}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-7 text-center font-mono text-xs text-slate-300">{f.note}</p>
    </VizShell>
  );
}
