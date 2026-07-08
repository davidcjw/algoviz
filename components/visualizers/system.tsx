"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Server, Database, Box, Cpu, User, Globe, Monitor } from "lucide-react";
import { VizShell, ACCENT, Transport, useFramePlayer } from "./shell";
import { cn } from "@/lib/utils";

const sys = "sys" as const;
const AMBER = ACCENT.sys.raw;

/* ───────────────── Load Balancing ───────────────── */

export function LoadBalancingViz() {
  const reduce = useReducedMotion();
  const [strategy, setStrategy] = useState<"round-robin" | "least-conn" | "random">("round-robin");
  const [loads, setLoads] = useState([0, 0, 0]);
  const [packets, setPackets] = useState<{ id: number; server: number }[]>([]);
  const rr = useRef(0);
  const pid = useRef(0);
  const stratRef = useRef(strategy);
  stratRef.current = strategy;

  useEffect(() => {
    if (reduce) return;
    const send = setInterval(() => {
      setLoads((prev) => {
        let target: number;
        if (stratRef.current === "round-robin") { target = rr.current % 3; rr.current++; }
        else if (stratRef.current === "least-conn") target = prev.indexOf(Math.min(...prev));
        else target = Math.floor(Math.random() * 3);
        const id = pid.current++;
        setPackets((p) => [...p, { id, server: target }]);
        setTimeout(() => setPackets((p) => p.filter((x) => x.id !== id)), 650);
        const next = [...prev];
        next[target] = Math.min(next[target] + 26, 100);
        return next;
      });
    }, 850);
    const decay = setInterval(() => setLoads((p) => p.map((l) => Math.max(0, l - 7))), 500);
    return () => { clearInterval(send); clearInterval(decay); };
  }, [reduce]);

  const servers = [22, 50, 78];

  return (
    <VizShell
      accent={sys}
      title="load_balancer"
      status={strategy}
      controls={
        <div className="flex flex-wrap gap-1.5">
          {(["round-robin", "least-conn", "random"] as const).map((s) => (
            <button key={s} onClick={() => setStrategy(s)}
              className={`rounded-md px-3 py-1.5 font-mono text-2xs uppercase transition-colors ${strategy === s ? "bg-sys text-white" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}>
              {s}
            </button>
          ))}
        </div>
      }
    >
      <div className="relative h-64 w-full">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 256" preserveAspectRatio="none">
          <line x1="40" y1="128" x2="180" y2="128" stroke="rgba(148,163,184,0.3)" strokeWidth="2" />
          {servers.map((y, i) => (
            <line key={i} x1="220" y1="128" x2="340" y2={y * 2.56} stroke="rgba(180,83,9,0.25)" strokeWidth="2" />
          ))}
        </svg>

        <Node className="absolute left-[2%] top-1/2 -translate-y-1/2" icon={<User size={18} />} label="clients" />
        <Node className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" icon={<Box size={18} />} label="LB" accent />

        {servers.map((y, i) => (
          <div key={i} className="absolute right-[2%]" style={{ top: `${y}%`, transform: "translateY(-50%)" }}>
            <div className="flex items-center gap-2">
              <div className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-ink-700/80 text-slate-200">
                <Server size={16} />
              </div>
              <div className="h-11 w-2 overflow-hidden rounded-full bg-ink-600">
                <motion.div className="w-full rounded-full" animate={{ height: `${loads[i]}%` }}
                  style={{ background: loads[i] > 75 ? "#ef4444" : AMBER, marginTop: `${100 - loads[i]}%` }} />
              </div>
            </div>
          </div>
        ))}

        <AnimatePresence>
          {packets.map((p) => (
            <motion.div key={p.id}
              initial={{ left: "50%", top: "50%", opacity: 0 }}
              animate={{ left: "88%", top: `${servers[p.server]}%`, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sys shadow-[0_0_10px] shadow-sys" />
          ))}
        </AnimatePresence>
      </div>
      <p className="mt-2 text-center font-mono text-xs text-slate-300">
        Requests spread across the pool — no single server becomes a hotspot.
      </p>
    </VizShell>
  );
}

/* ───────────────── Caching ───────────────── */

/* ── shared cache-strategy flow primitives ── */
type Seg = "client" | "cache" | "db";
type Step = { from: Seg; to: Seg; label: string; tone: "read" | "miss" | "write" | "ack" | "async" };

const ANCHOR: Record<Seg, string> = { client: "14%", cache: "50%", db: "86%" };
const TONE: Record<Step["tone"], string> = {
  read: "#34d399", miss: "#f43f5e", write: AMBER, ack: "#34d399", async: "#4d7c0f",
};
const TONE_TEXT: Record<Step["tone"] | "idle", string> = {
  read: "text-emerald-300", miss: "text-rose-300", write: "text-sys",
  ack: "text-emerald-300", async: "text-lime-300", idle: "text-slate-400",
};
type Cap = { tone: Step["tone"] | "idle"; t: string };

function useFlowRunner(stepMs: number) {
  const [active, setActive] = useState<(Step & { seq: number }) | null>(null);
  const [running, setRunning] = useState(false);
  const timers = useRef<number[]>([]);
  const seq = useRef(0);
  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);
  const run = (steps: Step[], onStep?: (i: number, s: Step) => void) => {
    if (running) return false;
    setRunning(true);
    steps.forEach((s, i) => {
      timers.current.push(window.setTimeout(() => { setActive({ ...s, seq: seq.current++ }); onStep?.(i, s); }, i * stepMs));
    });
    timers.current.push(window.setTimeout(() => { setActive(null); setRunning(false); }, steps.length * stepMs));
    return true;
  };
  return { active, running, run };
}

function NodeCol({ anchor, dim, children }: { anchor: string; dim?: boolean; children: React.ReactNode }) {
  return (
    <motion.div className="absolute top-0 z-10 flex -translate-x-1/2 flex-col items-center gap-1.5"
      style={{ left: anchor }} animate={{ opacity: dim ? 0.4 : 1 }}>
      {children}
    </motion.div>
  );
}

function FlowStage({ active, stepMs, reduce, cacheSlot, dbSlot }: {
  active: (Step & { seq: number }) | null; stepMs: number; reduce: boolean | null;
  cacheSlot?: React.ReactNode; dbSlot?: React.ReactNode;
}) {
  const dbActive = active?.from === "db" || active?.to === "db";
  return (
    <div className="relative mx-auto h-[150px] max-w-md">
      <div className="absolute left-[14%] right-[14%] top-[24px] border-t border-dashed border-line" />
      <AnimatePresence>
        {active && (
          <motion.span key={active.seq} className="absolute top-[24px] z-20 h-3 w-3 rounded-full"
            style={{ background: TONE[active.tone], boxShadow: `0 0 12px ${TONE[active.tone]}` }}
            initial={{ left: ANCHOR[active.from], opacity: 0, scale: 0.5, y: "-50%" }}
            animate={{ left: ANCHOR[active.to], opacity: 1, scale: 1, y: "-50%" }} exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : stepMs / 1000, ease: "easeInOut" }} />
        )}
      </AnimatePresence>
      <NodeCol anchor="14%"><Node icon={<User size={18} />} label="client" /></NodeCol>
      <NodeCol anchor="50%"><Node icon={<Box size={18} />} label="cache" accent />{cacheSlot}</NodeCol>
      <NodeCol anchor="86%" dim={!dbActive}><Node icon={<Database size={18} />} label="database" />{dbSlot}</NodeCol>
    </div>
  );
}

function ValBadge({ text, stale }: { text: string; stale?: boolean }) {
  return <span className={`rounded px-1.5 py-0.5 font-mono text-2xs ${stale ? "bg-white/5 text-slate-500 line-through" : "bg-sys/15 text-sys"}`}>{text}</span>;
}

function Caption({ cap }: { cap: Cap }) {
  return <p className={`mt-3 text-center font-mono text-xs ${TONE_TEXT[cap.tone]}`}>{cap.t}</p>;
}

const CACHE_STRATS = [
  { key: "aside", label: "Cache-Aside" },
  { key: "read", label: "Read-Through" },
  { key: "write", label: "Write-Through" },
  { key: "behind", label: "Write-Behind" },
] as const;
type CacheStrat = (typeof CACHE_STRATS)[number]["key"];

export function CachingViz() {
  const [strat, setStrat] = useState<CacheStrat>("aside");
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {CACHE_STRATS.map((s) => (
          <button key={s.key} onClick={() => setStrat(s.key)}
            className={`rounded-lg border px-3 py-1.5 font-mono text-2xs uppercase tracking-wider transition-colors ${
              strat === s.key ? "border-sys/40 bg-sys/15 text-sys" : "border-line bg-white/5 text-slate-400 hover:bg-white/10"
            }`}>
            {s.label}
          </button>
        ))}
      </div>
      {strat === "aside" && <CacheAsideViz />}
      {strat === "read" && <ReadThroughViz />}
      {strat === "write" && <WriteThroughViz />}
      {strat === "behind" && <WriteBehindViz />}
    </div>
  );
}

const cacheKeys = (cache: number[]) => (
  <div className="flex max-w-[130px] flex-wrap justify-center gap-1">
    <AnimatePresence mode="popLayout">
      {cache.map((k) => (
        <motion.span key={k} layout initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
          className="rounded bg-sys/15 px-1.5 py-0.5 font-mono text-2xs text-sys">{k}</motion.span>
      ))}
    </AnimatePresence>
  </div>
);

/* Cache-aside (lazy load): the APP checks the cache, reads the DB on a miss, and back-fills the cache itself. */
function CacheAsideViz() {
  const reduce = useReducedMotion();
  const STEP = 720;
  const { active, running, run } = useFlowRunner(STEP);
  const [cache, setCache] = useState<number[]>([12, 7]);
  const [stats, setStats] = useState({ hits: 0, total: 0 });
  const [cap, setCap] = useState<Cap>({ tone: "idle", t: "app checks cache, falls back to DB" });

  const hot = () => {
    const key = cache[0] ?? 12;
    const ok = run([
      { from: "client", to: "cache", label: `GET ${key} → cache`, tone: "read" },
      { from: "cache", to: "client", label: "HIT — served from cache", tone: "ack" },
    ], (_i, s) => setCap({ tone: s.tone, t: s.label }));
    if (ok) setStats((p) => ({ hits: p.hits + 1, total: p.total + 1 }));
  };
  const cold = () => {
    const key = Math.floor(Math.random() * 90) + 20;
    const steps: Step[] = [
      { from: "client", to: "cache", label: `GET ${key} → cache`, tone: "read" },
      { from: "cache", to: "client", label: "MISS", tone: "miss" },
      { from: "client", to: "db", label: "app queries the DB", tone: "miss" },
      { from: "db", to: "client", label: "row returned", tone: "read" },
      { from: "client", to: "cache", label: "app back-fills cache", tone: "write" },
    ];
    const ok = run(steps, (i, s) => {
      setCap({ tone: s.tone, t: s.label });
      if (i === steps.length - 1) setCache((c) => [key, ...c.filter((x) => x !== key)].slice(0, 4));
    });
    if (ok) setStats((p) => ({ hits: p.hits, total: p.total + 1 }));
  };
  const ratio = stats.total ? Math.round((stats.hits / stats.total) * 100) : 0;

  return (
    <VizShell accent={sys} title="cache_aside" status={`hit ratio ${ratio}%`}
      controls={
        <div className="flex flex-wrap gap-2">
          <button onClick={hot} disabled={running} className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 font-mono text-xs text-emerald-300 hover:bg-emerald-400/20 disabled:opacity-40">request hot key</button>
          <button onClick={cold} disabled={running} className={`${rlBtn} disabled:opacity-40`}>request cold key</button>
          <button onClick={() => { setStats({ hits: 0, total: 0 }); setCache([12, 7]); setCap({ tone: "idle", t: "app checks cache, falls back to DB" }); }} className={rlReset}>reset</button>
        </div>
      }>
      <FlowStage active={active} stepMs={STEP} reduce={reduce} cacheSlot={cacheKeys(cache)} />
      <Caption cap={cap} />
      <p className="mt-1 text-center font-mono text-2xs text-slate-500">App owns the logic: on a miss it reads the DB and writes the value back into the cache itself.</p>
    </VizShell>
  );
}

/* Read-through: the app only talks to the CACHE; the cache loads from the DB on a miss and stores it transparently. */
function ReadThroughViz() {
  const reduce = useReducedMotion();
  const STEP = 720;
  const { active, running, run } = useFlowRunner(STEP);
  const [cache, setCache] = useState<number[]>([12, 7]);
  const [stats, setStats] = useState({ hits: 0, total: 0 });
  const [cap, setCap] = useState<Cap>({ tone: "idle", t: "app reads only the cache" });

  const hot = () => {
    const key = cache[0] ?? 12;
    const ok = run([
      { from: "client", to: "cache", label: `GET ${key} → cache`, tone: "read" },
      { from: "cache", to: "client", label: "HIT — served from cache", tone: "ack" },
    ], (_i, s) => setCap({ tone: s.tone, t: s.label }));
    if (ok) setStats((p) => ({ hits: p.hits + 1, total: p.total + 1 }));
  };
  const cold = () => {
    const key = Math.floor(Math.random() * 90) + 20;
    const steps: Step[] = [
      { from: "client", to: "cache", label: `GET ${key} → cache`, tone: "read" },
      { from: "cache", to: "db", label: "cache loads from DB", tone: "miss" },
      { from: "db", to: "cache", label: "cache stores value", tone: "write" },
      { from: "cache", to: "client", label: "value returned", tone: "ack" },
    ];
    const ok = run(steps, (i, s) => {
      setCap({ tone: s.tone, t: s.label });
      if (i === 2) setCache((c) => [key, ...c.filter((x) => x !== key)].slice(0, 4));
    });
    if (ok) setStats((p) => ({ hits: p.hits, total: p.total + 1 }));
  };
  const ratio = stats.total ? Math.round((stats.hits / stats.total) * 100) : 0;

  return (
    <VizShell accent={sys} title="read_through" status={`hit ratio ${ratio}%`}
      controls={
        <div className="flex flex-wrap gap-2">
          <button onClick={hot} disabled={running} className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 font-mono text-xs text-emerald-300 hover:bg-emerald-400/20 disabled:opacity-40">request hot key</button>
          <button onClick={cold} disabled={running} className={`${rlBtn} disabled:opacity-40`}>request cold key</button>
          <button onClick={() => { setStats({ hits: 0, total: 0 }); setCache([12, 7]); setCap({ tone: "idle", t: "app reads only the cache" }); }} className={rlReset}>reset</button>
        </div>
      }>
      <FlowStage active={active} stepMs={STEP} reduce={reduce} cacheSlot={cacheKeys(cache)} />
      <Caption cap={cap} />
      <p className="mt-1 text-center font-mono text-2xs text-slate-500">The cache library fetches and stores on a miss — the app never touches the DB directly.</p>
    </VizShell>
  );
}

/* Write-through: every write goes to cache AND DB synchronously, so the two never diverge — at the cost of write latency. */
function WriteThroughViz() {
  const reduce = useReducedMotion();
  const STEP = 720;
  const { active, running, run } = useFlowRunner(STEP);
  const [cacheVal, setCacheVal] = useState<number | null>(null);
  const [dbVal, setDbVal] = useState<number | null>(null);
  const [cap, setCap] = useState<Cap>({ tone: "idle", t: "writes hit cache and DB together" });
  const next = useRef(1);

  const write = () => {
    const v = next.current++;
    run([
      { from: "client", to: "cache", label: `PUT x=${v} → cache`, tone: "write" },
      { from: "cache", to: "db", label: "write through to DB", tone: "write" },
      { from: "db", to: "cache", label: "DB acknowledges", tone: "ack" },
      { from: "cache", to: "client", label: "OK — cache & DB consistent", tone: "ack" },
    ], (i, s) => {
      setCap({ tone: s.tone, t: s.label });
      if (i === 0) setCacheVal(v);
      if (i === 1) setDbVal(v);
    });
  };

  return (
    <VizShell accent={sys} title="write_through" status="sync · always consistent"
      controls={
        <div className="flex flex-wrap gap-2">
          <button onClick={write} disabled={running} className={`${rlBtn} disabled:opacity-40`}>write x</button>
          <button onClick={() => { setCacheVal(null); setDbVal(null); next.current = 1; setCap({ tone: "idle", t: "writes hit cache and DB together" }); }} className={rlReset}>reset</button>
        </div>
      }>
      <FlowStage active={active} stepMs={STEP} reduce={reduce}
        cacheSlot={cacheVal !== null ? <ValBadge text={`x=${cacheVal}`} /> : null}
        dbSlot={dbVal !== null ? <ValBadge text={`x=${dbVal}`} /> : null} />
      <Caption cap={cap} />
      <p className="mt-1 text-center font-mono text-2xs text-slate-500">Cache and DB always match — reads after a write are safe. Cost: every write pays the DB round-trip.</p>
    </VizShell>
  );
}

/* Write-behind (write-back): writes ack from the cache immediately and flush to the DB in async batches — fast, but a crash loses unflushed writes. */
function WriteBehindViz() {
  const reduce = useReducedMotion();
  const STEP = 620;
  const FLUSH_MS = 2600;
  const { active, running, run } = useFlowRunner(STEP);
  const [cacheVal, setCacheVal] = useState<number | null>(null);
  const [dbVal, setDbVal] = useState<number | null>(null);
  const [dirty, setDirty] = useState(0);
  const [cap, setCap] = useState<Cap>({ tone: "idle", t: "ack instantly, flush to DB later" });
  const next = useRef(1);
  const cacheRef = useRef<number | null>(null);
  const dirtyRef = useRef(0);
  const runRef = useRef(run);
  runRef.current = run;

  const write = () => {
    const v = next.current++;
    setCacheVal(v); cacheRef.current = v;
    setDirty((d) => d + 1); dirtyRef.current += 1;
    run([
      { from: "client", to: "cache", label: `PUT x=${v} → cache`, tone: "write" },
      { from: "cache", to: "client", label: "OK (DB not written yet)", tone: "ack" },
    ], (_i, s) => setCap({ tone: s.tone, t: s.label }));
  };

  useEffect(() => {
    const t = setInterval(() => {
      if (dirtyRef.current === 0) return;
      const flushed = dirtyRef.current;
      runRef.current([{ from: "cache", to: "db", label: `flush ${flushed} write(s) → DB`, tone: "async" }], () => {
        setDbVal(cacheRef.current);
        setDirty(0); dirtyRef.current = 0;
        setCap({ tone: "async", t: "DB caught up (batched flush)" });
      });
    }, FLUSH_MS);
    return () => clearInterval(t);
  }, []);

  const stale = dbVal !== cacheVal;
  return (
    <VizShell accent={sys} title="write_behind" status={`dirty ${dirty} · async flush`}
      controls={
        <div className="flex flex-wrap gap-2">
          <button onClick={write} disabled={running} className={`${rlBtn} disabled:opacity-40`}>write x</button>
          <button onClick={() => { setCacheVal(null); setDbVal(null); setDirty(0); dirtyRef.current = 0; cacheRef.current = null; next.current = 1; setCap({ tone: "idle", t: "ack instantly, flush to DB later" }); }} className={rlReset}>reset</button>
        </div>
      }>
      <FlowStage active={active} stepMs={STEP} reduce={reduce}
        cacheSlot={
          <div className="flex flex-col items-center gap-1">
            {cacheVal !== null && <ValBadge text={`x=${cacheVal}`} />}
            {dirty > 0 && <span className="rounded bg-amber-400/15 px-1.5 py-0.5 font-mono text-2xs text-amber-300">dirty: {dirty}</span>}
          </div>
        }
        dbSlot={dbVal !== null ? <ValBadge text={`x=${dbVal}`} stale={stale} /> : null} />
      <Caption cap={cap} />
      <p className="mt-1 text-center font-mono text-2xs text-slate-500">Writes ack from the cache instantly and flush to the DB in batches. Fastest writes — but a crash before flush loses data.</p>
    </VizShell>
  );
}

/* ───────────────── Sharding ───────────────── */

export function ShardingViz() {
  const [shards, setShards] = useState<number[][]>([[], [], []]);
  const [pending, setPending] = useState<{ key: number; shard: number } | null>(null);

  const insert = () => {
    const key = Math.floor(Math.random() * 900) + 100;
    const shard = key % 3;
    setPending({ key, shard });
    setTimeout(() => {
      setShards((s) => { const c = s.map((x) => [...x]); c[shard] = [key, ...c[shard]].slice(0, 5); return c; });
      setPending(null);
    }, 700);
  };

  return (
    <VizShell accent={sys} title="hash_sharding" status="shard = key % 3"
      controls={
        <div className="flex gap-2">
          <button onClick={insert} className="rounded-lg border border-sys/40 bg-sys/10 px-3 py-1.5 font-mono text-xs text-sys hover:bg-sys/20">insert row</button>
          <button onClick={() => setShards([[], [], []])} className="rounded-lg border border-line bg-white/5 px-3 py-1.5 font-mono text-xs text-slate-400 hover:bg-white/10">clear</button>
        </div>
      }>
      <div className="flex h-10 items-center justify-center">
        <AnimatePresence>
          {pending && (
            <motion.div key={pending.key} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              className="rounded-lg border border-white/40 bg-white/10 px-3 py-1 font-mono text-sm text-coal">
              row {pending.key} → shard {pending.shard}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {shards.map((rows, i) => (
          <motion.div key={i} animate={{ borderColor: pending?.shard === i ? AMBER : "rgba(148,163,184,0.15)" }}
            className="rounded-xl border bg-ink-800/50 p-3">
            <div className="flex items-center gap-2 font-mono text-2xs uppercase text-sys">
              <Database size={13} /> shard {i}
            </div>
            <div className="mt-2 space-y-1">
              <AnimatePresence mode="popLayout">
                {rows.map((r) => (
                  <motion.div key={r} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="rounded bg-ink-700/70 px-2 py-1 font-mono text-2xs text-slate-200">{r}</motion.div>
                ))}
              </AnimatePresence>
              {rows.length === 0 && <span className="font-mono text-2xs text-slate-600">empty</span>}
            </div>
          </motion.div>
        ))}
      </div>
      <p className="mt-4 text-center font-mono text-xs text-slate-300">
        Each row lives on exactly one shard — writes and storage scale horizontally.
      </p>
    </VizShell>
  );
}

/* ───────────────── Consistent Hashing ───────────────── */

export function ConsistentHashingViz() {
  const [nodes, setNodes] = useState([30, 150, 270]);
  const keys = useRef<number[]>([10, 75, 120, 200, 230, 320, 345]);
  const [note, setNote] = useState("Each key maps to the next node clockwise around the ring.");

  const owner = (angle: number) => {
    const sorted = [...nodes].sort((a, b) => a - b);
    for (const n of sorted) if (n >= angle) return n;
    return sorted[0];
  };
  const addNode = () => {
    const n = Math.floor(Math.random() * 360);
    setNodes((p) => [...p, n]);
    setNote(`Added node @${n}° — only keys in its arc remap. Minimal reshuffle.`);
  };
  const removeNode = () => {
    if (nodes.length <= 2) return;
    setNodes((p) => p.slice(0, -1));
    setNote("Removed a node — only its keys move to the next node clockwise.");
  };

  const R = 92, cx = 130, cy = 130;
  const pt = (deg: number, r = R) => [cx + r * Math.cos((deg - 90) * Math.PI / 180), cy + r * Math.sin((deg - 90) * Math.PI / 180)];
  const colors = ["#B45309", "#0F766E", "#4D7C0F", "#f472b6", "#38bdf8", "#c084fc"];
  const sortedNodes = [...nodes].sort((a, b) => a - b);
  const colorOf = (n: number) => colors[sortedNodes.indexOf(n) % colors.length];

  return (
    <VizShell accent={sys} title="consistent_hashing" status={`${nodes.length} nodes`}
      controls={
        <div className="flex gap-2">
          <button onClick={addNode} className="rounded-lg border border-sys/40 bg-sys/10 px-3 py-1.5 font-mono text-xs text-sys hover:bg-sys/20">add node</button>
          <button onClick={removeNode} className="rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 font-mono text-xs text-rose-300 hover:bg-rose-400/20">remove node</button>
        </div>
      }>
      <div className="flex justify-center">
        <svg viewBox="0 0 260 260" className="w-full max-w-xs">
          <circle cx={cx} cy={cy} r={R} fill="none" stroke="rgba(148,163,184,0.25)" strokeWidth="2" strokeDasharray="3 4" />
          {keys.current.map((k, i) => {
            const [x, y] = pt(k, R);
            const o = owner(k);
            const [ox, oy] = pt(o, R);
            return (
              <g key={i}>
                <line x1={x} y1={y} x2={ox} y2={oy} stroke={colorOf(o)} strokeWidth="1" opacity="0.4" />
                <motion.circle cx={x} cy={y} r="4" animate={{ fill: colorOf(o) }} />
              </g>
            );
          })}
          <AnimatePresence>
            {nodes.map((n) => {
              const [x, y] = pt(n, R);
              return (
                <motion.g key={n} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <circle cx={x} cy={y} r="9" fill={colorOf(n)} stroke="#0b0e16" strokeWidth="2" />
                  <text x={x} y={y + 3} textAnchor="middle" fontSize="8" fontWeight="700" fill="#0b0e16" className="font-mono">N</text>
                </motion.g>
              );
            })}
          </AnimatePresence>
          <text x={cx} y={cy - 4} textAnchor="middle" className="fill-slate-500 font-mono" fontSize="9">hash</text>
          <text x={cx} y={cy + 8} textAnchor="middle" className="fill-slate-500 font-mono" fontSize="9">ring</text>
        </svg>
      </div>
      <p className="mt-2 text-center font-mono text-xs text-slate-300">{note}</p>
    </VizShell>
  );
}

/* ───────────────── Message Queue ───────────────── */

export function MessageQueueViz() {
  const reduce = useReducedMotion();
  const [queue, setQueue] = useState<number[]>([1, 2, 3]);
  const [rate, setRate] = useState<{ prod: number; cons: number }>({ prod: 700, cons: 1100 });
  const mid = useRef(4);
  const queueRef = useRef(queue);
  queueRef.current = queue;

  useEffect(() => {
    if (reduce) return;
    const prod = setInterval(() => setQueue((q) => (q.length < 12 ? [...q, mid.current++] : q)), rate.prod);
    const cons = setInterval(() => setQueue((q) => q.slice(1)), rate.cons);
    return () => { clearInterval(prod); clearInterval(cons); };
  }, [rate, reduce]);

  return (
    <VizShell accent={sys} title="message_queue" status={`depth ${queue.length}`}
      controls={
        <div className="flex flex-wrap items-center gap-3">
          <RateCtl label="producer" value={rate.prod} onChange={(v) => setRate((r) => ({ ...r, prod: v }))} />
          <RateCtl label="consumer" value={rate.cons} onChange={(v) => setRate((r) => ({ ...r, cons: v }))} />
        </div>
      }>
      <div className="flex items-center gap-3">
        <Node className="static" icon={<Cpu size={18} />} label="producer" accent />
        <div className="flex h-16 flex-1 items-center gap-1.5 overflow-hidden rounded-xl border border-line bg-ink-900/50 px-3">
          <AnimatePresence mode="popLayout">
            {queue.map((m) => (
              <motion.div key={m} layout initial={{ opacity: 0, x: 20, scale: 0.7 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -20, scale: 0.7 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-sys/40 bg-sys/15 font-mono text-2xs text-sys">
                {m}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <Node className="static" icon={<Server size={18} />} label="consumer" />
      </div>
      <p className="mt-5 text-center font-mono text-xs text-slate-300">
        {queue.length >= 10 ? "Queue backing up — the buffer absorbs the spike so the consumer never drops work." : "The queue decouples producer from consumer; each runs at its own pace."}
      </p>
    </VizShell>
  );
}

function RateCtl({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center gap-2 font-mono text-2xs text-slate-400">
      {label}
      <input type="range" min={400} max={1600} step={100} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-ink-600" style={{ accentColor: AMBER }} />
    </label>
  );
}

/* ───────────────── Rate Limiting ───────────────── */

type LogEntry = { id: number; ok: boolean };

const RL_METHODS = [
  { key: "token", label: "Token Bucket" },
  { key: "leaky", label: "Leaky Bucket" },
  { key: "fixed", label: "Fixed Window" },
  { key: "sliding", label: "Sliding Window" },
] as const;
type RLMethod = (typeof RL_METHODS)[number]["key"];

export function RateLimitingViz() {
  const [method, setMethod] = useState<RLMethod>("token");
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {RL_METHODS.map((m) => (
          <button key={m.key} onClick={() => setMethod(m.key)}
            className={`rounded-lg border px-3 py-1.5 font-mono text-2xs uppercase tracking-wider transition-colors ${
              method === m.key
                ? "border-sys/40 bg-sys/15 text-sys"
                : "border-line bg-white/5 text-slate-400 hover:bg-white/10"
            }`}>
            {m.label}
          </button>
        ))}
      </div>
      {method === "token" && <TokenBucketViz />}
      {method === "leaky" && <LeakyBucketViz />}
      {method === "fixed" && <FixedWindowViz />}
      {method === "sliding" && <SlidingWindowViz />}
    </div>
  );
}

/* shared request-log strip — 200 (accepted) vs 429 (rejected) */
function ReqLog({ log }: { log: LogEntry[] }) {
  return (
    <div className="w-full max-w-[180px]">
      <div className="font-mono text-2xs uppercase tracking-wider text-slate-500">request log</div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <AnimatePresence mode="popLayout">
          {log.map((r) => (
            <motion.span key={r.id} layout initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className={`grid h-7 w-7 place-items-center rounded-md font-mono text-2xs ${r.ok ? "bg-emerald-400/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
              {r.ok ? "200" : "429"}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

const rlBtn = "rounded-lg border border-sys/40 bg-sys/10 px-3 py-1.5 font-mono text-xs text-sys hover:bg-sys/20";
const rlReset = "rounded-lg border border-line bg-white/5 px-3 py-1.5 font-mono text-xs text-slate-400 hover:bg-white/10";

/* Token bucket — tokens refill at a fixed rate; requests spend them; bursts allowed up to capacity. */
function TokenBucketViz() {
  const reduce = useReducedMotion();
  const CAP = 6;
  const [tokens, setTokens] = useState(CAP);
  const [log, setLog] = useState<LogEntry[]>([]);
  const lid = useRef(0);

  useEffect(() => {
    if (reduce) return;
    const refill = setInterval(() => setTokens((t) => Math.min(CAP, t + 1)), 900);
    return () => clearInterval(refill);
  }, [reduce]);

  const request = () => {
    setTokens((t) => {
      const ok = t > 0;
      const id = lid.current++;
      setLog((l) => [{ id, ok }, ...l].slice(0, 10));
      return ok ? t - 1 : 0;
    });
  };

  return (
    <VizShell accent={sys} title="token_bucket" status={`${tokens}/${CAP} tokens`}
      controls={
        <div className="flex gap-2">
          <button onClick={request} className={rlBtn}>send request</button>
          <button onClick={() => { setTokens(CAP); setLog([]); }} className={rlReset}>reset</button>
        </div>
      }>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-12">
        <div className="flex flex-col items-center">
          <div className="flex h-32 w-24 flex-col-reverse items-center justify-start gap-1.5 rounded-b-xl border-2 border-t-0 border-sys/40 bg-ink-900/40 p-2">
            <AnimatePresence>
              {Array.from({ length: tokens }).map((_, i) => (
                <motion.div key={i} layout initial={{ scale: 0, y: -10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0 }}
                  className="h-5 w-5 rounded-full bg-sys shadow-[0_0_10px] shadow-sys" />
              ))}
            </AnimatePresence>
          </div>
          <span className="mt-2 font-mono text-2xs uppercase text-slate-500">bucket · refills +1/0.9s</span>
        </div>
        <ReqLog log={log} />
      </div>
      <p className="mt-5 text-center font-mono text-xs text-slate-300">
        Each request spends a token. Empty bucket → <span className="text-rose-300">429</span>. Bursts allowed up to capacity.
      </p>
    </VizShell>
  );
}

/* Leaky bucket — requests queue, then drain at a constant rate; overflow is rejected, output is smoothed. */
function LeakyBucketViz() {
  const reduce = useReducedMotion();
  const CAP = 6;
  const LEAK_MS = 1100;
  const [queue, setQueue] = useState<number[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const lid = useRef(0);
  const qid = useRef(0);

  useEffect(() => {
    const leak = setInterval(() => setQueue((q) => (q.length ? q.slice(1) : q)), LEAK_MS);
    return () => clearInterval(leak);
  }, []);

  const request = () => {
    setQueue((q) => {
      const ok = q.length < CAP;
      const id = lid.current++;
      setLog((l) => [{ id, ok }, ...l].slice(0, 10));
      return ok ? [...q, qid.current++] : q;
    });
  };

  return (
    <VizShell accent={sys} title="leaky_bucket" status={`${queue.length}/${CAP} queued`}
      controls={
        <div className="flex gap-2">
          <button onClick={request} className={rlBtn}>send request</button>
          <button onClick={() => { setQueue([]); setLog([]); }} className={rlReset}>reset</button>
        </div>
      }>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-12">
        <div className="flex flex-col items-center">
          <div className="flex h-32 w-24 flex-col-reverse items-center justify-start gap-1.5 rounded-b-xl border-2 border-t-0 border-sys/40 bg-ink-900/40 p-2">
            <AnimatePresence>
              {queue.map((q) => (
                <motion.div key={q} layout initial={{ scale: 0, y: -10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0, opacity: 0 }}
                  className="h-5 w-5 rounded-full bg-sys shadow-[0_0_10px] shadow-sys" />
              ))}
            </AnimatePresence>
          </div>
          <div className="relative mt-0.5 h-6 w-3 rounded-b-sm border-x-2 border-b-2 border-sys/30">
            {!reduce && (
              <motion.span className="absolute left-1/2 top-0 h-2 w-2 rounded-full bg-sys"
                initial={{ x: "-50%" }}
                animate={{ x: "-50%", y: [0, 22], opacity: [1, 0] }} transition={{ duration: LEAK_MS / 1000, repeat: Infinity, ease: "easeIn" }} />
            )}
          </div>
          <span className="mt-1.5 font-mono text-2xs uppercase text-slate-500">drains 1/1.1s · constant</span>
        </div>
        <ReqLog log={log} />
      </div>
      <p className="mt-5 text-center font-mono text-xs text-slate-300">
        Requests queue and leak out at a fixed rate, so output is smooth. Full bucket → <span className="text-rose-300">429</span>.
      </p>
    </VizShell>
  );
}

/* Fixed window — a counter per fixed interval that resets on the boundary; simple but allows edge bursts. */
function FixedWindowViz() {
  const reduce = useReducedMotion();
  const LIMIT = 5;
  const WINDOW_MS = 4000;
  const [count, setCount] = useState(0);
  const [windowId, setWindowId] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const lid = useRef(0);

  useEffect(() => {
    const t = setInterval(() => { setCount(0); setWindowId((w) => w + 1); }, WINDOW_MS);
    return () => clearInterval(t);
  }, []);

  const request = () => {
    setCount((c) => {
      const ok = c < LIMIT;
      const id = lid.current++;
      setLog((l) => [{ id, ok }, ...l].slice(0, 10));
      return ok ? c + 1 : c;
    });
  };

  return (
    <VizShell accent={sys} title="fixed_window" status={`${count}/${LIMIT} this window`}
      controls={
        <div className="flex gap-2">
          <button onClick={request} className={rlBtn}>send request</button>
          <button onClick={() => { setCount(0); setLog([]); }} className={rlReset}>reset</button>
        </div>
      }>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-between font-mono text-2xs uppercase tracking-wider text-slate-500">
            <span>window #{windowId}</span><span>resets every {WINDOW_MS / 1000}s</span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full border border-line bg-ink-900/60">
            <motion.div key={windowId} className="h-full bg-sys/40"
              initial={{ width: "0%" }} animate={{ width: "100%" }}
              transition={{ duration: reduce ? 0 : WINDOW_MS / 1000, ease: "linear" }} />
          </div>
          <div className="mt-4 flex gap-1.5">
            {Array.from({ length: LIMIT }).map((_, i) => (
              <div key={i} className={`h-9 flex-1 rounded-md border transition-colors ${i < count ? "border-sys/40 bg-sys/20" : "border-line bg-white/5"}`} />
            ))}
          </div>
        </div>
        <ReqLog log={log} />
      </div>
      <p className="mt-5 text-center font-mono text-xs text-slate-300">
        Counts hits per fixed window, then resets. Cheap, but a burst across the boundary can hit <span className="text-amber-300">2× the limit</span>.
      </p>
    </VizShell>
  );
}

/* Sliding window — counts requests in the trailing window; each mark ages out, so no boundary burst. */
function SlidingWindowViz() {
  const reduce = useReducedMotion();
  const LIMIT = 5;
  const WINDOW_MS = 4000;
  const [marks, setMarks] = useState<number[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const lid = useRef(0);
  const mid = useRef(0);

  const request = () => {
    const ok = marks.length < LIMIT;
    const id = lid.current++;
    setLog((l) => [{ id, ok }, ...l].slice(0, 10));
    if (!ok) return;
    const markId = mid.current++;
    setMarks((m) => [...m, markId]);
    window.setTimeout(() => setMarks((cur) => cur.filter((x) => x !== markId)), WINDOW_MS);
  };

  return (
    <VizShell accent={sys} title="sliding_window" status={`${marks.length}/${LIMIT} in window`}
      controls={
        <div className="flex gap-2">
          <button onClick={request} className={rlBtn}>send request</button>
          <button onClick={() => { setMarks([]); setLog([]); }} className={rlReset}>reset</button>
        </div>
      }>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10">
        <div className="w-full max-w-sm">
          <div className="flex items-center justify-between font-mono text-2xs uppercase tracking-wider text-slate-500">
            <span>trailing {WINDOW_MS / 1000}s</span><span className="text-sys">now →</span>
          </div>
          <div className="relative mt-3 h-14 w-full overflow-hidden rounded-lg border border-line bg-ink-900/40">
            <div className="absolute right-0 top-0 h-full w-px bg-sys/50" />
            <AnimatePresence>
              {marks.map((m) => (
                <motion.span key={m} className="absolute top-1/2 h-7 w-1.5 rounded-full bg-sys shadow-[0_0_8px] shadow-sys"
                  initial={{ left: "calc(100% - 6px)", y: "-50%" }}
                  animate={{ left: reduce ? "calc(100% - 6px)" : "0%", y: "-50%" }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: reduce ? 0 : WINDOW_MS / 1000, ease: "linear" }} />
              ))}
            </AnimatePresence>
          </div>
          <span className="mt-2 block font-mono text-2xs uppercase text-slate-500">requests age out at the left edge</span>
        </div>
        <ReqLog log={log} />
      </div>
      <p className="mt-5 text-center font-mono text-xs text-slate-300">
        Counts only requests inside the rolling window. Smoother and fairer than fixed window — no edge bursts, more state to track.
      </p>
    </VizShell>
  );
}

/* ───────────────── CAP Theorem ───────────────── */

type CapMode = "CP" | "AP";
type CapLogEntry = { id: number; text: string; tone: "ok" | "bad" | "warn" };

export function CapTheoremViz() {
  const [mode, setMode] = useState<CapMode>("CP");
  const [partitioned, setPartitioned] = useState(false);
  const [values, setValues] = useState({ A: 1, B: 1, C: 1 });
  const [diverged, setDiverged] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [log, setLog] = useState<CapLogEntry[]>([]);
  const lid = useRef(0);

  const pushLog = (text: string, tone: CapLogEntry["tone"]) =>
    setLog((l) => [{ id: lid.current++, text, tone }, ...l].slice(0, 5));

  const togglePartition = () => {
    if (partitioned) {
      if (mode === "AP" && diverged) pushLog("Partition healed — conflict resolved (last write wins), C re-synced.", "warn");
      else pushLog("Partition healed — cluster back in sync.", "ok");
      setValues((v) => ({ ...v, C: v.A }));
      setDiverged(false);
      setPartitioned(false);
    } else {
      pushLog("Network partition — C is cut off from A and B.", "bad");
      setPartitioned(true);
    }
  };

  const writeMajority = () => {
    const next = values.A + 1;
    setValues((v) => ({ A: next, B: next, C: partitioned ? v.C : next }));
    pushLog(`write x=${next} on A → replicated to B` + (partitioned ? "" : " and C"), "ok");
  };

  const writeIsolated = () => {
    if (mode === "CP") {
      setBlocked(true);
      window.setTimeout(() => setBlocked(false), 450);
      pushLog("write on C → blocked (can't guarantee consistency while partitioned)", "bad");
    } else {
      const next = values.C + 1;
      setValues((v) => ({ ...v, C: next }));
      setDiverged(true);
      pushLog(`write x=${next} on C → accepted locally, now diverged from A/B`, "warn");
    }
  };

  const reset = () => {
    setValues({ A: 1, B: 1, C: 1 });
    setPartitioned(false);
    setDiverged(false);
    setBlocked(false);
    setLog([]);
  };

  return (
    <VizShell
      accent={sys}
      title="cap_theorem"
      status={mode === "CP" ? "consistency + partition tolerance" : "availability + partition tolerance"}
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={togglePartition} className={rlBtn}>
            {partitioned ? "heal partition" : "simulate partition"}
          </button>
          <button onClick={writeMajority} className={rlReset}>
            write on A/B
          </button>
          <button
            onClick={writeIsolated}
            disabled={!partitioned}
            className={cn(rlReset, "disabled:cursor-not-allowed disabled:opacity-30")}
          >
            write on C{partitioned ? " (isolated)" : ""}
          </button>
          <button onClick={reset} className={rlReset}>
            reset
          </button>
        </div>
      }
    >
      <div className="flex flex-col items-center gap-5">
        <div className="flex gap-1.5 rounded-lg border border-line bg-white/5 p-1">
          {(["CP", "AP"] as CapMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "rounded-md px-3 py-1 font-mono text-2xs uppercase tracking-wider transition-colors",
                mode === m ? "bg-sys/20 text-sys" : "text-slate-400 hover:text-coal",
              )}
            >
              {m === "CP" ? "CP — consistency" : "AP — availability"}
            </button>
          ))}
        </div>

        <div className="relative" style={{ width: 300, height: 210 }}>
          <svg className="absolute inset-0" width={300} height={210}>
            <line x1={70} y1={170} x2={230} y2={170} stroke={`${AMBER}59`} strokeWidth="2" />
            <line
              x1={70} y1={170} x2={150} y2={36}
              stroke={partitioned ? "#f43f5e" : "rgba(148,163,184,0.3)"}
              strokeWidth="2"
              strokeDasharray={partitioned ? "5 5" : undefined}
            />
            <line
              x1={230} y1={170} x2={150} y2={36}
              stroke={partitioned ? "#f43f5e" : "rgba(148,163,184,0.3)"}
              strokeWidth="2"
              strokeDasharray={partitioned ? "5 5" : undefined}
            />
          </svg>
          <CapNode x={150} y={36} label="C" value={values.C} isolated={partitioned} diverged={diverged} blocked={blocked} />
          <CapNode x={70} y={170} label="A" value={values.A} />
          <CapNode x={230} y={170} label="B" value={values.B} />
        </div>

        <p className="max-w-md text-center font-mono text-2xs leading-relaxed text-slate-400">
          {partitioned
            ? mode === "CP"
              ? "C is cut off. In CP mode, writes on C are rejected outright rather than risk an inconsistent read."
              : "C is cut off but still accepting writes. It can now silently diverge from A/B until the partition heals."
            : "All three replicas agree. Trigger a partition to see the CAP tradeoff in action."}
        </p>

        <CapLog log={log} />
      </div>
    </VizShell>
  );
}

function CapNode({
  x, y, label, value, isolated, diverged, blocked,
}: {
  x: number; y: number; label: string; value: number; isolated?: boolean; diverged?: boolean; blocked?: boolean;
}) {
  return (
    <div className="absolute" style={{ left: x, top: y, transform: "translate(-50%, -50%)" }}>
      <motion.div
        animate={blocked ? { x: [0, -6, 6, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-1"
      >
        <div
          className={cn(
            "grid h-14 w-14 place-items-center rounded-full border-2 transition-colors duration-300",
            blocked
              ? "border-rose-400 bg-rose-400/25"
              : isolated
                ? "border-rose-400/60 bg-rose-400/10"
                : "border-sys/40 bg-sys/10",
          )}
        >
          <Database size={18} className={isolated ? "text-rose-300" : "text-sys"} />
        </div>
        <span className="font-mono text-2xs text-slate-500">{label}</span>
        <span className={cn("font-mono text-2xs font-semibold", diverged ? "text-amber-300" : "text-slate-200")}>
          x={value}
          {diverged && " *"}
        </span>
      </motion.div>
    </div>
  );
}

function CapLog({ log }: { log: CapLogEntry[] }) {
  const toneClass: Record<CapLogEntry["tone"], string> = {
    ok: "text-emerald-300",
    bad: "text-rose-300",
    warn: "text-amber-300",
  };
  return (
    <div className="w-full max-w-md space-y-1">
      <AnimatePresence mode="popLayout">
        {log.map((l) => (
          <motion.div
            key={l.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className={cn("font-mono text-2xs", toneClass[l.tone])}
          >
            → {l.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ───────────────── DNS Resolution ───────────────── */

type DnsFrame = { active: string[]; note: string; tone?: "ok" | "info" };
const DNS_TTL = 8;

function dnsMissFrames(): DnsFrame[] {
  return [
    { active: [], note: "Browser needs the IP for example.com." },
    { active: ["browser", "resolver"], note: "Ask the recursive resolver — nothing cached yet." },
    { active: ["resolver", "root"], note: "Resolver asks a root server: who handles .com?" },
    { active: ["resolver", "tld"], note: "Root refers it to the .com TLD server." },
    { active: ["resolver", "auth"], note: "TLD refers it to example.com's authoritative name server." },
    { active: ["resolver", "auth"], note: "Authoritative NS returns the A record: 93.184.216.34." },
    { active: ["browser", "resolver"], note: `Resolver caches the answer for ${DNS_TTL}s and replies to the browser.` },
    { active: ["browser"], note: "Browser connects directly to 93.184.216.34.", tone: "ok" },
  ];
}

function dnsHitFrames(): DnsFrame[] {
  return [
    { active: [], note: "Browser needs the IP for example.com again." },
    { active: ["browser", "resolver"], note: "Still cached — no root / TLD / authoritative round trip needed." },
    { active: ["browser"], note: "Browser connects directly to 93.184.216.34.", tone: "ok" },
  ];
}

const IDLE_DNS_FRAME: DnsFrame[] = [{ active: [], note: "Click resolve to look up example.com." }];

export function DnsViz() {
  const [script, setScript] = useState<"idle" | "miss" | "hit">("idle");
  const frames = script === "miss" ? dnsMissFrames() : script === "hit" ? dnsHitFrames() : IDLE_DNS_FRAME;
  const { index, setIndex, playing, setPlaying, speed, setSpeed, step, back, toggle } = useFramePlayer(frames.length, { baseMs: 750 });
  const [cached, setCached] = useState(false);
  const [ttl, setTtl] = useState(0);
  const cachedTriggered = useRef(false);

  useEffect(() => {
    cachedTriggered.current = false;
  }, [script]);

  useEffect(() => {
    if (script === "miss" && frames.length > 1 && index === frames.length - 1 && !playing && !cachedTriggered.current) {
      cachedTriggered.current = true;
      setCached(true);
      setTtl(DNS_TTL);
    }
  }, [index, playing, script, frames.length]);

  useEffect(() => {
    if (!cached) return;
    if (ttl <= 0) {
      setCached(false);
      return;
    }
    const t = setTimeout(() => setTtl((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cached, ttl]);

  const resolve = () => {
    setScript(cached && ttl > 0 ? "hit" : "miss");
    setIndex(0);
    setPlaying(true);
  };

  const reset = () => {
    setScript("idle");
    setIndex(0);
    setPlaying(false);
    setCached(false);
    setTtl(0);
  };

  // Play has nothing to play until a request has been made — kick one off instead of no-op'ing.
  const handleToggle = () => (script === "idle" ? resolve() : toggle());

  const frame = frames[Math.min(index, frames.length - 1)];
  const isActive = (key: string) => frame.active.includes(key);
  const edgeColor = (a: string, b: string) => (isActive(a) && isActive(b) ? AMBER : "rgba(148,163,184,0.25)");

  return (
    <VizShell
      accent={sys}
      title="dns_resolution"
      status={cached ? `cached · expires in ${ttl}s` : "not cached"}
      controls={
        <Transport
          accent={sys}
          playing={playing}
          onToggle={handleToggle}
          onStep={step}
          onBack={back}
          onReset={reset}
          speed={speed}
          onSpeed={setSpeed}
          extra={
            <button onClick={resolve} disabled={playing} className={cn(rlBtn, "disabled:cursor-not-allowed disabled:opacity-30")}>
              resolve example.com
            </button>
          }
        />
      }
    >
      <div className="relative h-56 w-full">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 420 220" preserveAspectRatio="none">
          <line x1="60" y1="110" x2="185" y2="110" stroke={edgeColor("browser", "resolver")} strokeWidth="2" />
          <line x1="185" y1="110" x2="360" y2="46" stroke={edgeColor("resolver", "root")} strokeWidth="2" />
          <line x1="185" y1="110" x2="360" y2="110" stroke={edgeColor("resolver", "tld")} strokeWidth="2" />
          <line x1="185" y1="110" x2="360" y2="174" stroke={edgeColor("resolver", "auth")} strokeWidth="2" />
        </svg>
        <Node className="absolute left-[8%] top-1/2 -translate-x-1/2 -translate-y-1/2" icon={<Monitor size={18} />} label="browser" accent={isActive("browser")} />
        <Node className="absolute left-[44%] top-1/2 -translate-x-1/2 -translate-y-1/2" icon={<Server size={18} />} label="resolver" accent={isActive("resolver")} />
        <Node className="absolute left-[86%] top-[21%] -translate-x-1/2 -translate-y-1/2" icon={<Globe size={18} />} label="root ." accent={isActive("root")} />
        <Node className="absolute left-[86%] top-1/2 -translate-x-1/2 -translate-y-1/2" icon={<Globe size={18} />} label=".com TLD" accent={isActive("tld")} />
        <Node className="absolute left-[86%] top-[79%] -translate-x-1/2 -translate-y-1/2" icon={<Database size={18} />} label="authoritative" accent={isActive("auth")} />
      </div>
      <p className={cn("mt-2 text-center font-mono text-xs", frame.tone === "ok" ? "text-emerald-300" : "text-slate-300")}>
        {frame.note}
      </p>
    </VizShell>
  );
}

/* ───────────────── Content Delivery Network ───────────────── */

type CdnFrame = { active: string[]; note: string; tone?: "ok" | "warn" };
const CDN_TTL = 6;

function cdnMissFrames(): CdnFrame[] {
  return [
    { active: [], note: "Client requests /logo.png." },
    { active: ["client", "edge"], note: "Nearest edge checks its cache — cold, nothing there yet." },
    { active: ["edge", "origin"], note: "Edge pulls the asset from the origin server.", tone: "warn" },
    { active: ["edge"], note: `Edge caches the response for ${CDN_TTL}s.` },
    { active: ["client", "edge"], note: "Edge returns the asset — a full round trip, ~180ms." },
  ];
}

function cdnHitFrames(): CdnFrame[] {
  return [
    { active: [], note: "Client requests /logo.png again." },
    { active: ["client", "edge"], note: "Edge already has it cached — no origin trip.", tone: "ok" },
    { active: ["client", "edge"], note: "Edge returns the asset — ~12ms round trip.", tone: "ok" },
  ];
}

function cdnPushHitFrames(): CdnFrame[] {
  return [
    { active: [], note: "Client requests /logo.png." },
    { active: ["client", "edge"], note: "Content was pushed to every edge ahead of time — always a hit.", tone: "ok" },
    { active: ["client", "edge"], note: "Edge returns the asset — ~12ms round trip.", tone: "ok" },
  ];
}

function cdnPushUpdateFrames(): CdnFrame[] {
  return [
    { active: [], note: "You publish a new /logo.png on the origin." },
    { active: ["origin", "edge"], note: "It's uploaded straight to every edge — no client request needed.", tone: "ok" },
    { active: ["edge"], note: "Every edge is warm before the first user ever asks for it.", tone: "ok" },
  ];
}

const IDLE_CDN_FRAME: CdnFrame[] = [{ active: [], note: "Click 'request asset' to fetch /logo.png." }];

export function CdnViz() {
  const [mode, setMode] = useState<"pull" | "push">("pull");
  const [cached, setCached] = useState(false);
  const [ttl, setTtl] = useState(0);
  const [script, setScript] = useState<"idle" | "miss" | "hit" | "push-hit" | "push-update">("idle");
  const frames =
    script === "miss" ? cdnMissFrames()
    : script === "hit" ? cdnHitFrames()
    : script === "push-hit" ? cdnPushHitFrames()
    : script === "push-update" ? cdnPushUpdateFrames()
    : IDLE_CDN_FRAME;
  const { index, setIndex, playing, setPlaying, speed, setSpeed, step, back, toggle } = useFramePlayer(frames.length, { baseMs: 750 });
  const cachedTriggered = useRef(false);

  useEffect(() => {
    cachedTriggered.current = false;
  }, [script]);

  useEffect(() => {
    if (script === "miss" && frames.length > 1 && index === frames.length - 1 && !playing && !cachedTriggered.current) {
      cachedTriggered.current = true;
      setCached(true);
      setTtl(CDN_TTL);
    }
  }, [index, playing, script, frames.length]);

  useEffect(() => {
    if (!cached) return;
    if (ttl <= 0) {
      setCached(false);
      return;
    }
    const t = setTimeout(() => setTtl((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cached, ttl]);

  const switchMode = (m: "pull" | "push") => {
    setMode(m);
    setScript("idle");
    setIndex(0);
    setPlaying(false);
    setCached(false);
    setTtl(0);
  };

  const request = () => {
    setScript(mode === "push" ? "push-hit" : cached && ttl > 0 ? "hit" : "miss");
    setIndex(0);
    setPlaying(true);
  };

  const pushUpdate = () => {
    setScript("push-update");
    setIndex(0);
    setPlaying(true);
  };

  const reset = () => {
    setScript("idle");
    setIndex(0);
    setPlaying(false);
    setCached(false);
    setTtl(0);
  };

  // Play has nothing to play until a request has been made — kick one off instead of no-op'ing.
  const handleToggle = () => (script === "idle" ? request() : toggle());

  const frame = frames[Math.min(index, frames.length - 1)];
  const isActive = (key: string) => frame.active.includes(key);
  const edgeColor = (a: string, b: string) => (isActive(a) && isActive(b) ? AMBER : "rgba(148,163,184,0.25)");

  return (
    <VizShell
      accent={sys}
      title="cdn"
      status={mode === "push" ? "edge: always warm (pushed)" : cached ? `edge: cached · expires in ${ttl}s` : "edge: cold"}
      controls={
        <Transport
          accent={sys}
          playing={playing}
          onToggle={handleToggle}
          onStep={step}
          onBack={back}
          onReset={reset}
          speed={speed}
          onSpeed={setSpeed}
          extra={
            <div className="flex items-center gap-2">
              <button onClick={request} disabled={playing} className={cn(rlBtn, "disabled:cursor-not-allowed disabled:opacity-30")}>
                request asset
              </button>
              {mode === "push" && (
                <button onClick={pushUpdate} disabled={playing} className={cn(rlReset, "disabled:cursor-not-allowed disabled:opacity-30")}>
                  push update
                </button>
              )}
            </div>
          }
        />
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-1.5 rounded-lg border border-line bg-white/5 p-1 self-center">
          {(["pull", "push"] as const).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={cn(
                "rounded-md px-3 py-1 font-mono text-2xs uppercase tracking-wider transition-colors",
                mode === m ? "bg-sys/20 text-sys" : "text-slate-400 hover:text-coal",
              )}
            >
              {m === "pull" ? "pull CDN" : "push CDN"}
            </button>
          ))}
        </div>

        <div className="relative h-32 w-full">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 130" preserveAspectRatio="none">
            <line x1="50" y1="65" x2="200" y2="65" stroke={edgeColor("client", "edge")} strokeWidth="2" />
            <line x1="200" y1="65" x2="350" y2="65" stroke={edgeColor("edge", "origin")} strokeWidth="2" />
          </svg>
          <Node className="absolute left-[12%] top-1/2 -translate-x-1/2 -translate-y-1/2" icon={<Monitor size={18} />} label="client" accent={isActive("client")} />
          <Node className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" icon={<Box size={18} />} label="edge" accent={isActive("edge")} />
          <Node className="absolute left-[88%] top-1/2 -translate-x-1/2 -translate-y-1/2" icon={<Database size={18} />} label="origin" accent={isActive("origin")} />
        </div>

        <p className={cn("text-center font-mono text-xs", frame.tone === "ok" ? "text-emerald-300" : frame.tone === "warn" ? "text-amber-300" : "text-slate-300")}>
          {frame.note}
        </p>
      </div>
    </VizShell>
  );
}

/* ───────────────── Reverse Proxy ───────────────── */

type ProxyFrame = { active: string[]; note: string; tone?: "ok" | "info" };

function proxyDynamicFrames(): ProxyFrame[] {
  return [
    { active: [], note: "Client sends HTTPS GET /api/orders to the proxy's public IP." },
    { active: ["client", "proxy"], note: "Proxy terminates SSL — decrypts once so backends don't have to.", tone: "info" },
    { active: ["proxy", "backend"], note: "Proxy forwards the request to a backend the client never sees." },
    { active: ["proxy", "backend"], note: "The backend handles it and replies to the proxy." },
    { active: ["client", "proxy"], note: "Proxy re-encrypts and returns the response.", tone: "ok" },
  ];
}

function proxyCachedFrames(): ProxyFrame[] {
  return [
    { active: [], note: "Client requests /api/orders again." },
    { active: ["client", "proxy"], note: "Proxy already has this response cached.", tone: "ok" },
    { active: ["client", "proxy"], note: "Served straight from the proxy — the backend is never touched.", tone: "ok" },
  ];
}

function proxyStaticFrames(): ProxyFrame[] {
  return [
    { active: [], note: "Client requests /logo.png." },
    { active: ["client", "proxy"], note: "Proxy serves the static file directly from its own disk.", tone: "ok" },
    { active: ["client", "proxy"], note: "No backend involved for static assets.", tone: "ok" },
  ];
}

const IDLE_PROXY_FRAME: ProxyFrame[] = [{ active: [], note: "Pick a request type below to send it through the proxy." }];

export function ReverseProxyViz() {
  const [script, setScript] = useState<"idle" | "dynamic" | "cached" | "static">("idle");
  const frames =
    script === "dynamic" ? proxyDynamicFrames()
    : script === "cached" ? proxyCachedFrames()
    : script === "static" ? proxyStaticFrames()
    : IDLE_PROXY_FRAME;
  const { index, playing, setIndex, setPlaying, speed, setSpeed, step, back, toggle } = useFramePlayer(frames.length, { baseMs: 750 });

  const send = (s: "dynamic" | "cached" | "static") => {
    setScript(s);
    setIndex(0);
    setPlaying(true);
  };

  const reset = () => {
    setScript("idle");
    setIndex(0);
    setPlaying(false);
  };

  // Play has nothing to play until a request has been sent — default to the dynamic-request flow.
  const handleToggle = () => (script === "idle" ? send("dynamic") : toggle());

  const frame = frames[Math.min(index, frames.length - 1)];
  const isActive = (key: string) => frame.active.includes(key);
  const edgeColor = (a: string, b: string) => (isActive(a) && isActive(b) ? AMBER : "rgba(148,163,184,0.25)");

  return (
    <VizShell
      accent={sys}
      title="reverse_proxy"
      status="single public entry point"
      controls={
        <Transport
          accent={sys}
          playing={playing}
          onToggle={handleToggle}
          onStep={step}
          onBack={back}
          onReset={reset}
          speed={speed}
          onSpeed={setSpeed}
          extra={
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => send("dynamic")} disabled={playing} className={cn(rlBtn, "disabled:cursor-not-allowed disabled:opacity-30")}>
                dynamic request
              </button>
              <button onClick={() => send("cached")} disabled={playing} className={cn(rlReset, "disabled:cursor-not-allowed disabled:opacity-30")}>
                cached request
              </button>
              <button onClick={() => send("static")} disabled={playing} className={cn(rlReset, "disabled:cursor-not-allowed disabled:opacity-30")}>
                static asset
              </button>
            </div>
          }
        />
      }
    >
      <div className="flex flex-col gap-4">
        <div className="relative h-32 w-full">
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 130" preserveAspectRatio="none">
            <line x1="50" y1="65" x2="200" y2="65" stroke={edgeColor("client", "proxy")} strokeWidth="2" />
            <line x1="200" y1="65" x2="350" y2="65" stroke={edgeColor("proxy", "backend")} strokeWidth="2" />
          </svg>
          <Node className="absolute left-[12%] top-1/2 -translate-x-1/2 -translate-y-1/2" icon={<Monitor size={18} />} label="client" accent={isActive("client")} />
          <Node className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" icon={<Box size={18} />} label="reverse proxy" accent={isActive("proxy")} />
          <Node className="absolute left-[88%] top-1/2 -translate-x-1/2 -translate-y-1/2" icon={<Server size={18} />} label="backend pool" accent={isActive("backend")} />
        </div>

        <p className={cn("text-center font-mono text-xs", frame.tone === "ok" ? "text-emerald-300" : frame.tone === "info" ? "text-sys" : "text-slate-300")}>
          {frame.note}
        </p>
        <p className="text-center font-mono text-2xs text-slate-500">
          The client only ever addresses the proxy — it can&apos;t tell how many backends exist, or which one answered.
        </p>
      </div>
    </VizShell>
  );
}

/* ───────────────── Database Replication ───────────────── */

type ReplMode = "master-slave" | "master-master";
type ReplLogEntry = { id: number; text: string; tone: "ok" | "bad" | "warn" };

export function DatabaseReplicationViz() {
  const [mode, setMode] = useState<ReplMode>("master-slave");
  const [log, setLog] = useState<ReplLogEntry[]>([]);
  const lid = useRef(0);
  const pushLog = (text: string, tone: ReplLogEntry["tone"]) =>
    setLog((l) => [{ id: lid.current++, text, tone }, ...l].slice(0, 5));

  // master-slave state
  const [master, setMaster] = useState(1);
  const [slaves, setSlaves] = useState<[number, number]>([1, 1]);
  const [masterDown, setMasterDown] = useState(false);
  const [promoted, setPromoted] = useState<0 | 1 | null>(null);
  const [replicating, setReplicating] = useState<[boolean, boolean]>([false, false]);

  const writeMaster = () => {
    if (masterDown) {
      pushLog("No master — promote a slave before accepting writes.", "bad");
      return;
    }
    const next = master + 1;
    setMaster(next);
    pushLog(`write x=${next} on master — replicating to both slaves.`, "ok");
    [0, 1].forEach((i) => {
      const delay = i === 0 ? 350 : 700;
      setReplicating((r) => (i === 0 ? [true, r[1]] : [r[0], true]));
      window.setTimeout(() => {
        setSlaves((s) => (i === 0 ? [next, s[1]] : [s[0], next]));
        setReplicating((r) => (i === 0 ? [false, r[1]] : [r[0], false]));
      }, delay);
    });
  };

  const failMaster = () => {
    setMasterDown(true);
    pushLog("Master failed — reads still served by slaves; writes are blocked until promotion.", "bad");
  };

  const promoteSlave = (i: 0 | 1) => {
    setMaster(slaves[i]);
    setMasterDown(false);
    setPromoted(i);
    pushLog(`Slave ${i + 1} promoted to master.`, "warn");
  };

  const resetMS = () => {
    setMaster(1);
    setSlaves([1, 1]);
    setMasterDown(false);
    setPromoted(null);
    setReplicating([false, false]);
    setLog([]);
  };

  // master-master state
  const [mmA, setMmA] = useState(1);
  const [mmB, setMmB] = useState(1);
  const [dirtyA, setDirtyA] = useState(false);
  const [dirtyB, setDirtyB] = useState(false);
  const [lastWriter, setLastWriter] = useState<"A" | "B" | null>(null);

  const writeA = () => {
    const next = mmA + 1;
    setMmA(next);
    setDirtyA(true);
    setLastWriter("A");
    pushLog(`write x=${next} on A — not yet synced to B.`, "ok");
  };
  const writeB = () => {
    const next = mmB + 1;
    setMmB(next);
    setDirtyB(true);
    setLastWriter("B");
    pushLog(`write x=${next} on B — not yet synced to A.`, "ok");
  };
  const sync = () => {
    if (dirtyA && dirtyB) {
      const winner = lastWriter === "A" ? mmA : mmB;
      setMmA(winner);
      setMmB(winner);
      pushLog(
        mmA === mmB
          ? `Conflict — both wrote concurrently (converged on the same value by coincidence). Last write (${lastWriter}) wins: x=${winner}.`
          : `Conflict — both wrote different values. Last write (${lastWriter}) wins: x=${winner}.`,
        "warn",
      );
    } else if (dirtyA) {
      setMmB(mmA);
      pushLog("A → B replicated.", "ok");
    } else if (dirtyB) {
      setMmA(mmB);
      pushLog("B → A replicated.", "ok");
    } else {
      pushLog("Already in sync.", "ok");
    }
    setDirtyA(false);
    setDirtyB(false);
  };

  const resetMM = () => {
    setMmA(1);
    setMmB(1);
    setDirtyA(false);
    setDirtyB(false);
    setLastWriter(null);
    setLog([]);
  };

  const switchMode = (m: ReplMode) => {
    setMode(m);
    setLog([]);
  };

  return (
    <VizShell
      accent={sys}
      title="database_replication"
      status={mode === "master-slave" ? (masterDown ? "master down" : "healthy") : dirtyA && dirtyB ? "conflict pending" : "in sync"}
      controls={
        mode === "master-slave" ? (
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={writeMaster} disabled={masterDown} className={cn(rlBtn, "disabled:cursor-not-allowed disabled:opacity-30")}>
              write on master
            </button>
            {!masterDown ? (
              <button onClick={failMaster} className={rlReset}>simulate master failure</button>
            ) : (
              <>
                <button onClick={() => promoteSlave(0)} className={rlReset}>promote slave 1</button>
                <button onClick={() => promoteSlave(1)} className={rlReset}>promote slave 2</button>
              </>
            )}
            <button onClick={resetMS} className={rlReset}>reset</button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={writeA} className={rlBtn}>write on A</button>
            <button onClick={writeB} className={rlBtn}>write on B</button>
            <button onClick={sync} className={rlReset}>sync</button>
            <button onClick={resetMM} className={rlReset}>reset</button>
          </div>
        )
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-1.5 rounded-lg border border-line bg-white/5 p-1 self-center">
          {(["master-slave", "master-master"] as ReplMode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={cn(
                "rounded-md px-3 py-1 font-mono text-2xs uppercase tracking-wider transition-colors",
                mode === m ? "bg-sys/20 text-sys" : "text-slate-400 hover:text-coal",
              )}
            >
              {m === "master-slave" ? "master-slave" : "master-master"}
            </button>
          ))}
        </div>

        {mode === "master-slave" ? (
          <div className="relative h-48 w-full">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 192" preserveAspectRatio="none">
              <line x1="60" y1="96" x2="330" y2="42" stroke={replicating[0] ? AMBER : "rgba(148,163,184,0.25)"} strokeWidth="2" />
              <line x1="60" y1="96" x2="330" y2="150" stroke={replicating[1] ? AMBER : "rgba(148,163,184,0.25)"} strokeWidth="2" />
            </svg>
            <Node
              className="absolute left-[15%] top-1/2 -translate-x-1/2 -translate-y-1/2"
              icon={<Database size={18} />}
              label={`${masterDown ? "master (down)" : "master"} · x=${master}`}
              accent={!masterDown}
            />
            <Node
              className="absolute left-[83%] top-[22%] -translate-x-1/2 -translate-y-1/2"
              icon={<Database size={18} />}
              label={`${promoted === 0 ? "slave 1 (master ★)" : "slave 1"} · x=${slaves[0]}`}
              accent={replicating[0] || promoted === 0}
            />
            <Node
              className="absolute left-[83%] top-[78%] -translate-x-1/2 -translate-y-1/2"
              icon={<Database size={18} />}
              label={`${promoted === 1 ? "slave 2 (master ★)" : "slave 2"} · x=${slaves[1]}`}
              accent={replicating[1] || promoted === 1}
            />
          </div>
        ) : (
          <div className="relative h-36 w-full">
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 144" preserveAspectRatio="none">
              <line x1="90" y1="72" x2="310" y2="72" stroke={dirtyA || dirtyB ? AMBER : "rgba(148,163,184,0.25)"} strokeWidth="2" />
            </svg>
            <Node className="absolute left-[22%] top-1/2 -translate-x-1/2 -translate-y-1/2" icon={<Database size={18} />} label={`master A · x=${mmA}${dirtyA ? " *" : ""}`} accent={dirtyA} />
            <Node className="absolute left-[78%] top-1/2 -translate-x-1/2 -translate-y-1/2" icon={<Database size={18} />} label={`master B · x=${mmB}${dirtyB ? " *" : ""}`} accent={dirtyB} />
          </div>
        )}

        <CapLog log={log} />
      </div>
    </VizShell>
  );
}

/* ───────────────── shared node chip ───────────────── */

function Node({ className, icon, label, accent }: { className?: string; icon: React.ReactNode; label: string; accent?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 ${className ?? ""}`}>
      <div className={`grid h-12 w-12 place-items-center rounded-xl border ${accent ? "border-sys/50 bg-sys/10 text-sys" : "border-line bg-ink-700/80 text-slate-200"}`}>
        {icon}
      </div>
      <span className="font-mono text-2xs uppercase tracking-wider text-slate-500">{label}</span>
    </div>
  );
}
