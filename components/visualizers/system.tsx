"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Server, Database, Box, Cpu, User } from "lucide-react";
import { VizShell, ACCENT } from "./shell";

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
