"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { VizShell, Transport, LegendDot, useFramePlayer } from "./shell";

const N = 6;

type Frame = {
  queens: number[]; // queens[row] = col, -1 if none
  cell: [number, number] | null;
  status: "try" | "place" | "conflict" | "backtrack" | "solved";
  note: string;
};

function buildFrames(): Frame[] {
  const frames: Frame[] = [];
  const queens = Array(N).fill(-1);
  const cols = new Set<number>();
  const d1 = new Set<number>();
  const d2 = new Set<number>();

  const solve = (row: number): boolean => {
    if (row === N) {
      frames.push({ queens: [...queens], cell: null, status: "solved", note: `Solved! ${N} queens, none attacking.` });
      return true;
    }
    for (let col = 0; col < N; col++) {
      frames.push({ queens: [...queens], cell: [row, col], status: "try", note: `Try a queen at row ${row}, col ${col}.` });
      const safe = !cols.has(col) && !d1.has(row - col) && !d2.has(row + col);
      if (!safe) {
        frames.push({ queens: [...queens], cell: [row, col], status: "conflict", note: `Conflict — column or diagonal already attacked.` });
        continue;
      }
      queens[row] = col;
      cols.add(col); d1.add(row - col); d2.add(row + col);
      frames.push({ queens: [...queens], cell: [row, col], status: "place", note: `Safe → place and recurse to row ${row + 1}.` });
      if (solve(row + 1)) return true;
      queens[row] = -1;
      cols.delete(col); d1.delete(row - col); d2.delete(row + col);
      frames.push({ queens: [...queens], cell: [row, col], status: "backtrack", note: `Dead end below — remove queen and backtrack.` });
    }
    return false;
  };

  frames.push({ queens: [...queens], cell: null, status: "try", note: "Place queens row by row so none attack." });
  solve(0);
  return frames;
}

const statusColor: Record<Frame["status"], string> = {
  try: "#ffffff",
  place: "#A3E635",
  conflict: "#ef4444",
  backtrack: "#fb923c",
  solved: "#A3E635",
};

export function BacktrackingViz() {
  const accent = "algo" as const;
  const frames = useMemo(buildFrames, []);
  const { index, playing, speed, setSpeed, toggle, step, back, reset } = useFramePlayer(frames.length, { baseMs: 320 });
  const f = frames[index];

  return (
    <VizShell
      accent={accent}
      title="n_queens_backtracking"
      status={`step ${index + 1} / ${frames.length}`}
      legend={
        <>
          <LegendDot color="#A3E635" label="placed / safe" />
          <LegendDot color="#ef4444" label="conflict" />
          <LegendDot color="#fb923c" label="backtrack" />
        </>
      }
      controls={<Transport accent={accent} playing={playing} onToggle={toggle} onStep={step} onBack={back} onReset={reset} speed={speed} onSpeed={setSpeed} />}
    >
      <div className="flex justify-center">
        <div className="grid gap-0 rounded-lg border border-line p-1" style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}>
          {Array.from({ length: N * N }, (_, k) => {
            const row = Math.floor(k / N);
            const col = k % N;
            const dark = (row + col) % 2 === 1;
            const hasQueen = f.queens[row] === col;
            const isCell = f.cell && f.cell[0] === row && f.cell[1] === col;
            const ring = isCell ? statusColor[f.status] : "transparent";
            return (
              <div
                key={k}
                className="relative grid h-11 w-11 place-items-center sm:h-12 sm:w-12"
                style={{ background: dark ? "rgba(148,163,184,0.06)" : "transparent", boxShadow: isCell ? `inset 0 0 0 2px ${ring}` : "none" }}
              >
                {hasQueen && (
                  <motion.div
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 24 }}
                  >
                    <Crown size={20} className="text-algo" fill="currentColor" />
                  </motion.div>
                )}
                {isCell && !hasQueen && f.status === "conflict" && (
                  <span className="font-mono text-sm text-rose-400">×</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-4 text-center font-mono text-xs text-slate-300">{f.note}</p>
    </VizShell>
  );
}
