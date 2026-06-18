import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-10 mt-32 border-t border-line">
      <div className="mx-auto max-w-content px-4 py-12 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-extrabold">
                Algo<span className="text-gradient">Viz</span>
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              The visual playground for mastering data structures, algorithms, and
              system design. Built to be watched, not memorized.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterCol
              title="Data Structures"
              links={[
                ["Array", "/data-structures/array"],
                ["Linked List", "/data-structures/linked-list"],
                ["Hash Table", "/data-structures/hash-table"],
                ["Heap", "/data-structures/heap"],
              ]}
            />
            <FooterCol
              title="Algorithms"
              links={[
                ["Binary Search", "/algorithms/binary-search"],
                ["Merge Sort", "/algorithms/merge-sort"],
                ["BFS / DFS", "/algorithms/bfs"],
                ["Dijkstra", "/algorithms/dijkstra"],
              ]}
            />
            <FooterCol
              title="System Design"
              links={[
                ["Load Balancing", "/system-design/load-balancing"],
                ["Caching", "/system-design/caching"],
                ["Sharding", "/system-design/sharding"],
                ["Rate Limiting", "/system-design/rate-limiting"],
              ]}
            />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-slate-500 sm:flex-row">
          <p className="font-mono">© {new Date().getFullYear()} AlgoViz — learn by seeing.</p>
          <p className="font-mono">Crafted with Next.js · Framer Motion</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="font-mono text-2xs uppercase tracking-wider text-slate-500">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link
              href={href}
              className="text-sm text-slate-300 transition-colors hover:text-coal"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
