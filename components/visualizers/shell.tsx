"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Code2, Eye, Pause, Play, RotateCcw, SkipBack, SkipForward, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/CodeBlock";
import type { CodeSnippet } from "@/lib/snippets";

export type Accent = "ds" | "algo" | "sys";

/** Topic Python snippets, injected by the <Visualizer> registry so the shell can
 *  offer a "<>" code tab without every visualizer threading the prop through. */
export const VizCodeContext = createContext<CodeSnippet[] | null>(null);

export const ACCENT: Record<
  Accent,
  { text: string; bg: string; border: string; ring: string; glow: string; raw: string }
> = {
  ds: {
    text: "text-ds",
    bg: "bg-ds",
    border: "border-ds/40",
    ring: "ring-ds/40",
    glow: "glow-ds",
    raw: "#0F766E",
  },
  algo: {
    text: "text-algo",
    bg: "bg-algo",
    border: "border-algo/40",
    ring: "ring-algo/40",
    glow: "glow-algo",
    raw: "#4D7C0F",
  },
  sys: {
    text: "text-sys",
    bg: "bg-sys",
    border: "border-sys/40",
    ring: "ring-sys/40",
    glow: "glow-sys",
    raw: "#B45309",
  },
};

/** Presentational frame for every visualizer: chrome, canvas, controls, status. */
export function VizShell({
  accent,
  title,
  status,
  children,
  controls,
  legend,
  className,
}: {
  accent: Accent;
  title: string;
  status?: ReactNode;
  children: ReactNode;
  controls?: ReactNode;
  legend?: ReactNode;
  className?: string;
}) {
  const a = ACCENT[accent];
  const code = useContext(VizCodeContext);
  const hasCode = !!code?.length;
  const [view, setView] = useState<"viz" | "code">("viz");
  const showCode = hasCode && view === "code";

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className={cn("h-2 w-2 shrink-0 rounded-full", a.bg)} />
          <span className="truncate font-mono text-xs uppercase tracking-wider text-slate-300">
            {title}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {!showCode && status && (
            <div className="hidden font-mono text-2xs text-slate-400 sm:block">{status}</div>
          )}
          {hasCode && (
            <div className="flex items-center rounded-lg border border-line p-0.5">
              <ViewTab active={view === "viz"} accent={accent} title="Visualization" onClick={() => setView("viz")}>
                <Eye size={14} />
              </ViewTab>
              <ViewTab active={view === "code"} accent={accent} title="Python code" onClick={() => setView("code")}>
                <Code2 size={14} />
              </ViewTab>
            </div>
          )}
        </div>
      </div>

      {showCode ? (
        <div className="min-h-[260px] bg-[#13161d]">
          <CodeBlock snippets={code!} embedded />
        </div>
      ) : (
        <div className={cn("relative min-h-[260px] p-5 sm:p-6", className)}>{children}</div>
      )}

      {legend && !showCode && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line px-4 py-2.5 font-mono text-2xs text-slate-400">
          {legend}
        </div>
      )}

      {controls && !showCode && (
        <div className="border-t border-line bg-ink-900/40 px-4 py-3">{controls}</div>
      )}
    </div>
  );
}

function ViewTab({
  active,
  accent,
  title,
  onClick,
  children,
}: {
  active: boolean;
  accent: Accent;
  title: string;
  onClick: () => void;
  children: ReactNode;
}) {
  const a = ACCENT[accent];
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={cn(
        "grid h-7 w-8 place-items-center rounded-md transition-colors",
        active ? cn(a.bg, "text-white") : "text-slate-400 hover:text-coal",
      )}
    >
      {children}
    </button>
  );
}

export function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
}

/* ───────────────── control bar ───────────────── */

export function ControlButton({
  onClick,
  disabled,
  title,
  active,
  children,
  accent = "ds",
}: {
  onClick?: () => void;
  disabled?: boolean;
  title: string;
  active?: boolean;
  children: ReactNode;
  accent?: Accent;
}) {
  const a = ACCENT[accent];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-lg border border-line bg-white/5 text-slate-200 transition-all",
        "hover:bg-white/10 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30",
        active && cn(a.bg, "border-transparent text-white hover:opacity-90"),
      )}
    >
      {children}
    </button>
  );
}

/** Standard transport controls for frame-based players. */
export function Transport({
  accent,
  playing,
  onToggle,
  onStep,
  onBack,
  onReset,
  onShuffle,
  speed,
  onSpeed,
  extra,
}: {
  accent: Accent;
  playing: boolean;
  onToggle: () => void;
  onStep?: () => void;
  onBack?: () => void;
  onReset?: () => void;
  onShuffle?: () => void;
  speed?: number;
  onSpeed?: (v: number) => void;
  extra?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ControlButton accent={accent} title={playing ? "Pause" : "Play"} onClick={onToggle} active={playing}>
        {playing ? <Pause size={15} /> : <Play size={15} />}
      </ControlButton>
      {onBack && (
        <ControlButton accent={accent} title="Step back" onClick={onBack}>
          <SkipBack size={15} />
        </ControlButton>
      )}
      {onStep && (
        <ControlButton accent={accent} title="Step forward" onClick={onStep}>
          <SkipForward size={15} />
        </ControlButton>
      )}
      {onReset && (
        <ControlButton accent={accent} title="Reset" onClick={onReset}>
          <RotateCcw size={15} />
        </ControlButton>
      )}
      {onShuffle && (
        <ControlButton accent={accent} title="Shuffle / new data" onClick={onShuffle}>
          <Shuffle size={15} />
        </ControlButton>
      )}

      {onSpeed && (
        <div className="ml-1 flex items-center gap-2">
          <span className="font-mono text-2xs uppercase text-slate-500">speed</span>
          <input
            type="range"
            min={0.25}
            max={3}
            step={0.25}
            value={speed}
            onChange={(e) => onSpeed(Number(e.target.value))}
            className="h-1 w-24 cursor-pointer appearance-none rounded-full bg-ink-600 accent-current"
            style={{ color: ACCENT[accent].raw }}
          />
          <span className="w-8 font-mono text-2xs text-slate-400">{speed}×</span>
        </div>
      )}

      {extra && <div className="ml-auto flex items-center gap-2">{extra}</div>}
    </div>
  );
}

/* ───────────────── frame player hook ───────────────── */

export function useFramePlayer(total: number, opts?: { baseMs?: number }) {
  const base = opts?.baseMs ?? 600;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  useEffect(() => {
    if (!playing) return;
    if (index >= total - 1) {
      setPlaying(false);
      return;
    }
    timer.current = setTimeout(() => setIndex((i) => Math.min(i + 1, total - 1)), base / speed);
    return clear;
  }, [playing, index, total, base, speed]);

  // reset index if the frame set shrinks
  useEffect(() => {
    setIndex((i) => Math.min(i, Math.max(0, total - 1)));
  }, [total]);

  const toggle = useCallback(() => {
    if (index >= total - 1) {
      setIndex(0);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  }, [index, total]);

  const step = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.min(i + 1, total - 1));
  }, [total]);

  const back = useCallback(() => {
    setPlaying(false);
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setPlaying(false);
    setIndex(0);
  }, []);

  return { index, setIndex, playing, setPlaying, speed, setSpeed, toggle, step, back, reset };
}
