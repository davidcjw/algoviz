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
    if (frame.active?.includes(id)) return "#161A22";
    if (frame.compare?.includes(id)) return "#38bdf8";
    return "#94a3b8";
  };

  return (
    <VizShell
      accent={accent}
      title={algorithm.replace("-", "_")}
      status={`step ${index + 1} / ${frames.length}`}
      legend={
        <>
          <LegendDot color="#38bdf8" label="comparing" />
          <LegendDot color="#161A22" label="moving" />
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
      <div
        className="relative mx-auto h-56 w-full sm:h-64"
        style={{
          maxWidth: `clamp(${data.length * 24}px, ${data.length * 5}vw, ${data.length * 44}px)`,
        }}
      >
        {data.map((original) => {
          const idx = frame.items.findIndex((it) => it.id === original.id);
          const c = colorFor(original.id);
          const highlighted =
            frame.compare?.includes(original.id) ||
            frame.active?.includes(original.id) ||
            frame.pivot === original.id;
          return (
            <motion.div
              key={original.id}
              animate={{ left: `${(idx * 100) / data.length}%` }}
              transition={{ type: "spring", stiffness: 600, damping: 38 }}
              className="absolute bottom-0 flex h-full flex-col items-center justify-end"
              style={{ width: `${100 / data.length}%` }}
            >
              <motion.div
                className="w-5 rounded-t-md sm:w-9"
                animate={{
                  height: `${(original.value / maxVal) * 100}%`,
                  backgroundColor: c,
                  boxShadow: highlighted ? "0 2px 10px rgba(22,26,34,0.18)" : "none",
                }}
                transition={{ duration: 0.25 }}
                style={{ minHeight: 6 }}
              />
              <span className="mt-1.5 font-mono text-2xs text-slate-400">{original.value}</span>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-4 text-center font-mono text-xs text-slate-300">{frame.note}</p>
    </VizShell>
  );
}
