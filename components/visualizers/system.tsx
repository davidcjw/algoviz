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
              className={`rounded-md px-3 py-1.5 font-mono text-2xs uppercase transition-colors ${strategy === s ? "bg-sys text-ink" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}>
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
            <line key={i} x1="220" y1="128" x2="340" y2={y * 2.56} stroke="rgba(251,191,36,0.25)" strokeWidth="2" />
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

export function CachingViz() {
  const [state, setState] = useState<"idle" | "checking" | "hit" | "miss" | "fill">("idle");
  const [cache, setCache] = useState<number[]>([12, 7]);
  const [stats, setStats] = useState({ hits: 0, total: 0 });
  const busy = useRef(false);

  const request = (key: number) => {
    if (busy.current) return;
    busy.current = true;
    setState("checking");
    setTimeout(() => {
      const hit = cache.includes(key);
      setStats((s) => ({ hits: s.hits + (hit ? 1 : 0), total: s.total + 1 }));
      if (hit) { setState("hit"); setTimeout(() => { setState("idle"); busy.current = false; }, 900); }
      else {
        setState("miss");
        setTimeout(() => {
          setState("fill");
          setCache((c) => [key, ...c].slice(0, 4));
          setTimeout(() => { setState("idle"); busy.current = false; }, 700);
        }, 800);
      }
    }, 600);
  };

  const ratio = stats.total ? Math.round((stats.hits / stats.total) * 100) : 0;

  return (
    <VizShell accent={sys} title="cache_aside" status={`hit ratio ${ratio}%`}
      controls={
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => request(cache[Math.floor(Math.random() * cache.length)] ?? 1)}
            className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 font-mono text-xs text-emerald-300 hover:bg-emerald-400/20">
            request hot key
          </button>
          <button onClick={() => request(Math.floor(Math.random() * 90) + 20)}
            className="rounded-lg border border-sys/40 bg-sys/10 px-3 py-1.5 font-mono text-xs text-sys hover:bg-sys/20">
            request cold key
          </button>
          <button onClick={() => { setStats({ hits: 0, total: 0 }); setCache([12, 7]); }}
            className="rounded-lg border border-line bg-white/5 px-3 py-1.5 font-mono text-xs text-slate-400 hover:bg-white/10">reset</button>
        </div>
      }>
      <div className="grid grid-cols-3 items-center gap-3">
        <Node className="static mx-auto" icon={<User size={18} />} label="client" />
        <div className="flex flex-col items-center">
          <motion.div animate={{ borderColor: state === "hit" ? "#34d399" : state === "miss" ? "#ef4444" : AMBER, boxShadow: state === "checking" ? `0 0 20px ${AMBER}55` : "none" }}
            className="w-full rounded-xl border-2 bg-ink-800/70 p-3">
            <div className="font-mono text-2xs uppercase tracking-wider text-sys">cache</div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <AnimatePresence mode="popLayout">
                {cache.map((k) => (
                  <motion.span key={k} layout initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="rounded bg-sys/15 px-2 py-1 font-mono text-xs text-sys">{k}</motion.span>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
          <div className="mt-1 font-mono text-2xs text-slate-500">
            {state === "hit" && <span className="text-emerald-400">HIT — fast path ✓</span>}
            {state === "miss" && <span className="text-rose-400">MISS → query DB</span>}
            {state === "fill" && <span className="text-sys">back-fill cache</span>}
            {state === "checking" && "looking up…"}
            {state === "idle" && "ready"}
          </div>
        </div>
        <motion.div animate={{ opacity: state === "miss" || state === "fill" ? 1 : 0.4 }}>
          <Node className="static mx-auto" icon={<Database size={18} />} label="database" />
        </motion.div>
      </div>
      <p className="mt-5 text-center font-mono text-xs text-slate-300">
        A hit returns instantly; a miss falls through to the slow store, then warms the cache.
      </p>
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
              className="rounded-lg border border-white/40 bg-white/10 px-3 py-1 font-mono text-sm text-white">
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
  const colors = ["#FBBF24", "#2DD4BF", "#A3E635", "#f472b6", "#38bdf8", "#c084fc"];
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

export function RateLimitingViz() {
  const reduce = useReducedMotion();
  const CAP = 6;
  const [tokens, setTokens] = useState(CAP);
  const [log, setLog] = useState<{ id: number; ok: boolean }[]>([]);
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
          <button onClick={request} className="rounded-lg border border-sys/40 bg-sys/10 px-3 py-1.5 font-mono text-xs text-sys hover:bg-sys/20">send request</button>
          <button onClick={() => { setTokens(CAP); setLog([]); }} className="rounded-lg border border-line bg-white/5 px-3 py-1.5 font-mono text-xs text-slate-400 hover:bg-white/10">reset</button>
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
      </div>
      <p className="mt-5 text-center font-mono text-xs text-slate-300">
        Each request spends a token. Empty bucket → <span className="text-rose-300">429 Too Many Requests</span>. Bursts are allowed up to capacity.
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
