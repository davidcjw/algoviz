"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  generateSortFrames,
  makeSortData,
  type SortKey,
} from "@/lib/algorithms/sorting";
import { VizShell, Transport, LegendDot, useFramePlayer, ACCENT } from "./shell";

export function SortVisualizer({ algorithm }: { algorithm: SortKey }) {
  const accent = "algo" as const;
  const [seed, setSeed] = useState(7);
  const data = useMemo(() => makeSortData(11, seed), [seed]);
  const frames = useMemo(() => generateSortFrames(algorithm, data), [algorithm, data]);

  const { index, playing, speed, setSpeed, toggle, step, back, reset } = useFramePlayer(
    frames.length,
    { baseMs: 520 },
  );

  const frame = frames[index];
  const maxVal = useMemo(() => Math.max(...data.map((d) => d.value)), [data]);

  const colorFor = (id: number) => {
    if (frame.sorted?.includes(id)) return ACCENT.algo.raw;
    if (frame.pivot === id) return "#f472b6";
    if (frame.active?.includes(id)) return "#ffffff";
    if (frame.compare?.includes(id)) return "#38bdf8";
    return "#3f4a63";
  };

  return (
    <VizShell
      accent={accent}
      title={algorithm.replace("-", "_")}
      status={`step ${index + 1} / ${frames.length}`}
      legend={
        <>
          <LegendDot color="#38bdf8" label="comparing" />
          <LegendDot color="#ffffff" label="moving" />
          {algorithm === "quick-sort" && <LegendDot color="#f472b6" label="pivot" />}
          <LegendDot color={ACCENT.algo.raw} label="sorted" />
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
          onShuffle={() => setSeed((s) => s + 13)}
          speed={speed}
          onSpeed={setSpeed}
        />
      }
    >
      <div className="flex h-56 items-end justify-center gap-1 sm:h-64 sm:gap-2">
        {frame.items.map((item) => {
          const c = colorFor(item.id);
          const highlighted =
            frame.compare?.includes(item.id) ||
            frame.active?.includes(item.id) ||
            frame.pivot === item.id;
          return (
            <motion.div
              key={item.id}
              layout
              transition={{ type: "spring", stiffness: 600, damping: 38 }}
              className="relative flex w-5 flex-col items-center justify-end sm:w-9"
              style={{ height: "100%" }}
            >
              <motion.div
                className="w-full rounded-t-md"
                animate={{
                  height: `${(item.value / maxVal) * 100}%`,
                  backgroundColor: c,
                  boxShadow: highlighted ? `0 0 18px ${c}` : "none",
                }}
                transition={{ duration: 0.25 }}
                style={{ minHeight: 6 }}
              />
              <span className="mt-1.5 font-mono text-2xs text-slate-400">{item.value}</span>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-4 text-center font-mono text-xs text-slate-300">{frame.note}</p>
    </VizShell>
  );
}
