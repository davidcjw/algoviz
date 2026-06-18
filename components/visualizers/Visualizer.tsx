"use client";

import { motion } from "framer-motion";
import { ArrayViz } from "./ArrayViz";
import { LinkedListViz } from "./LinkedListViz";
import { StackViz } from "./StackViz";
import { QueueViz } from "./QueueViz";
import { HashTableViz } from "./HashTableViz";
import { BSTViz } from "./BSTViz";
import { HeapViz } from "./HeapViz";
import { TrieViz } from "./TrieViz";
import { GraphViz } from "./GraphViz";
import { SortVisualizer } from "./SortVisualizer";
import { SearchVisualizer } from "./SearchVisualizer";
import { PatternViz } from "./PatternViz";
import { RecursionViz } from "./RecursionViz";
import { UnionFindViz } from "./UnionFindViz";
import { BacktrackingViz } from "./BacktrackingViz";
import { DPViz } from "./DPViz";
import {
  LoadBalancingViz,
  CachingViz,
  ShardingViz,
  ConsistentHashingViz,
  MessageQueueViz,
  RateLimitingViz,
} from "./system";
import type { SortKey } from "@/lib/algorithms/sorting";
import { CODE_SNIPPETS } from "@/lib/snippets";
import { VizCodeContext } from "./shell";

const sortKeys: SortKey[] = [
  "bubble-sort",
  "selection-sort",
  "insertion-sort",
  "merge-sort",
  "quick-sort",
];

export function Visualizer({ slug }: { slug: string }) {
  return (
    <VizCodeContext.Provider value={CODE_SNIPPETS[slug] ?? null}>
      {renderViz(slug)}
    </VizCodeContext.Provider>
  );
}

function renderViz(slug: string) {
  if (sortKeys.includes(slug as SortKey)) return <SortVisualizer algorithm={slug as SortKey} />;

  switch (slug) {
    case "array":
      return <ArrayViz />;
    case "linked-list":
      return <LinkedListViz variant="singly" />;
    case "doubly-linked-list":
      return <LinkedListViz variant="doubly" />;
    case "stack":
      return <StackViz />;
    case "queue":
      return <QueueViz />;
    case "hash-table":
      return <HashTableViz />;
    case "binary-search-tree":
      return <BSTViz />;
    case "heap":
      return <HeapViz />;
    case "trie":
      return <TrieViz />;
    case "graph":
      return <GraphViz mode="explore" />;
    case "bfs":
      return <GraphViz mode="bfs" />;
    case "dfs":
      return <GraphViz mode="dfs" />;
    case "dijkstra":
      return <GraphViz mode="dijkstra" />;
    case "linear-search":
      return <SearchVisualizer mode="linear" />;
    case "binary-search":
      return <SearchVisualizer mode="binary" />;
    case "two-pointers":
      return <PatternViz mode="two-pointers" />;
    case "sliding-window":
      return <PatternViz mode="sliding-window" />;
    case "recursion":
      return <RecursionViz />;
    case "union-find":
      return <UnionFindViz />;
    case "backtracking":
      return <BacktrackingViz />;
    case "dynamic-programming":
      return <DPViz />;
    case "load-balancing":
      return <LoadBalancingViz />;
    case "caching":
      return <CachingViz />;
    case "sharding":
      return <ShardingViz />;
    case "consistent-hashing":
      return <ConsistentHashingViz />;
    case "message-queue":
      return <MessageQueueViz />;
    case "rate-limiting":
      return <RateLimitingViz />;
    default:
      return <ComingSoon />;
  }
}

function ComingSoon() {
  return (
    <div className="card grid min-h-[280px] place-items-center p-8 text-center">
      <div>
        <div className="relative mx-auto h-20 w-20">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full border border-algo/40"
              animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
            />
          ))}
          <span className="absolute inset-0 grid place-items-center font-mono text-2xl text-algo">
            ƒ
          </span>
        </div>
        <h3 className="mt-6 font-display text-lg font-bold">Interactive visualizer in the lab</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-400">
          The full concept breakdown below is ready now — the animated playground for this
          topic is being crafted next.
        </p>
      </div>
    </div>
  );
}
