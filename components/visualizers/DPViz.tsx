"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { VizShell, Transport, LegendDot, useFramePlayer, ACCENT } from "./shell";

const N = 11;

type Frame = { dp: (number | null)[]; deps: number[]; current: number | null; note: string };

function buildFrames(): Frame[] {
  const frames: Frame[] = [];
  const dp: (number | null)[] = Array(N).fill(null);
  dp[0] = 0;
  frames.push({ dp: [...dp], deps: [], current: 0, note: "Base case: dp[0] = 0." });
  dp[1] = 1;
  frames.push({ dp: [...dp], deps: [], current: 1, note: "Base case: dp[1] = 1." });
  for (let i = 2; i < N; i++) {
    frames.push({ dp: [...dp], deps: [i - 1, i - 2], current: null, note: `Compute dp[${i}] = dp[${i - 1}] + dp[${i - 2}].` });
    dp[i] = (dp[i - 1] as number) + (dp[i - 2] as number);
    frames.push({ dp: [...dp], deps: [i - 1, i - 2], current: i, note: `dp[${i}] = ${dp[i - 1]} + ${dp[i - 2]} = ${dp[i]}. Stored once, reused forever.` });
  }
  frames.push({ dp: [...dp], deps: [], current: null, note: `fib(${N - 1}) = ${dp[N - 1]} in ${N} steps — vs an exponential recursion tree.` });
  return frames;
}

export function DPViz() {
  const accent = "algo" as const;
  const frames = useMemo(buildFrames, []);
  const { index, playing, speed, setSpeed, toggle, step, back, reset } = useFramePlayer(frames.length, { baseMs: 600 });
  const f = frames[index];

  return (
    <VizShell
      accent={accent}
      title="fibonacci_tabulation"
      status={`step ${index + 1} / ${frames.length}`}
      legend={
        <>
          <LegendDot color="#38bdf8" label="dependencies" />
          <LegendDot color={ACCENT.algo.raw} label="just computed" />
          <span>dp[i] = dp[i-1] + dp[i-2]</span>
        </>
      }
      controls={<Transport accent={accent} playing={playing} onToggle={toggle} onStep={step} onBack={back} onReset={reset} speed={speed} onSpeed={setSpeed} />}
    >
      <div className="flex flex-wrap items-end justify-center gap-1.5 pt-10 sm:gap-2">
        {f.dp.map((v, i) => {
          const dep = f.deps.includes(i);
          const cur = f.current === i;
          let bg = "rgba(22,26,34,0.05)";
          let border = "rgba(148,163,184,0.18)";
          let color = "#64748b";
          if (cur) { bg = "rgba(77,124,15,0.18)"; border = ACCENT.algo.raw; color = "#161A22"; }
          else if (dep) { bg = "rgba(56,189,248,0.16)"; border = "#38bdf8"; color = "#161A22"; }
          else if (v !== null) { color = "#161A22"; }
          return (
            <div key={i} className="relative flex flex-col items-center">
              {cur && f.deps.length > 0 && (
                <motion.span initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-7 font-mono text-2xs text-algo">
                  +
                </motion.span>
              )}
              <motion.div
                animate={{ backgroundColor: bg, borderColor: border, boxShadow: cur ? `0 0 16px ${ACCENT.algo.raw}55` : dep ? `0 0 12px #38bdf855` : "none" }}
                className="grid h-12 w-12 place-items-center rounded-lg border font-mono text-base font-semibold"
                style={{ color }}
              >
                {v === null ? "·" : v}
              </motion.div>
              <span className="mt-1 font-mono text-2xs text-slate-600">dp[{i}]</span>
            </div>
          );
        })}
      </div>
      <p className="mt-8 text-center font-mono text-xs text-slate-300">{f.note}</p>
    </VizShell>
  );
}
