export type Pillar = "data-structures" | "algorithms" | "system-design";

export type Difficulty = "Core" | "Intermediate" | "Advanced";

export interface Complexity {
  label: string;
  value: string;
  note?: string;
}

export interface Topic {
  slug: string;
  title: string;
  pillar: Pillar;
  category: string;
  tagline: string;
  summary: string;
  difficulty: Difficulty;
  /** Whether a bespoke interactive visualizer exists. */
  live: boolean;
  /** Big-O table rows. */
  complexity?: Complexity[];
  /** Key insights / mental models. */
  insights?: string[];
  /** "Reach for it when…" */
  useCases?: string[];
  /** Real interview-flavored gotchas. */
  pitfalls?: string[];
}

export const PILLARS: Record<
  Pillar,
  { name: string; accent: string; hex: string; blurb: string; glyph: string }
> = {
  "data-structures": {
    name: "Data Structures",
    accent: "ds",
    hex: "#2DD4BF",
    blurb: "How information is shaped, stored, and connected in memory.",
    glyph: "{ }",
  },
  algorithms: {
    name: "Algorithms",
    accent: "algo",
    hex: "#A3E635",
    blurb: "Step-by-step procedures that transform inputs into answers.",
    glyph: "ƒ(x)",
  },
  "system-design": {
    name: "System Design",
    accent: "sys",
    hex: "#FBBF24",
    blurb: "Architecting services that scale to millions of users.",
    glyph: "⬡",
  },
};

export const TOPICS: Topic[] = [
  // ───────────────────────── Data Structures ─────────────────────────
  {
    slug: "array",
    title: "Array",
    pillar: "data-structures",
    category: "Linear",
    tagline: "Contiguous memory, O(1) random access.",
    summary:
      "An array stores elements in one continuous block of memory. Because every slot is the same size, the address of any index is pure arithmetic — base + i × size — giving constant-time access. The trade-off: inserting or deleting in the middle shifts everything after it.",
    difficulty: "Core",
    live: true,
    complexity: [
      { label: "Access", value: "O(1)" },
      { label: "Search", value: "O(n)" },
      { label: "Insert (end)", value: "O(1)*", note: "amortized for dynamic arrays" },
      { label: "Insert (middle)", value: "O(n)", note: "shifts elements" },
      { label: "Delete", value: "O(n)" },
      { label: "Space", value: "O(n)" },
    ],
    insights: [
      "Index access is math, not a search — base address plus offset.",
      "Cache-friendly: contiguous layout means the CPU prefetches neighbors.",
      "Dynamic arrays double capacity on overflow → amortized O(1) appends.",
    ],
    useCases: [
      "You know the size up front or it grows mostly at the end.",
      "You need fast index lookups and tight memory locality.",
    ],
    pitfalls: [
      "Inserting at the front is O(n) — every element shifts right.",
      "Resizing copies the whole array; a single append can briefly be O(n).",
    ],
  },
  {
    slug: "linked-list",
    title: "Linked List",
    pillar: "data-structures",
    category: "Linear",
    tagline: "Nodes chained by pointers, O(1) splices.",
    summary:
      "A linked list strings nodes together, each holding a value and a pointer to the next. Nodes live anywhere in memory, so inserting or removing is just rewiring pointers — no shifting. The cost: no random access, and pointer-chasing is cache-unfriendly.",
    difficulty: "Core",
    live: true,
    complexity: [
      { label: "Access", value: "O(n)" },
      { label: "Search", value: "O(n)" },
      { label: "Insert (head)", value: "O(1)" },
      { label: "Insert (tail)", value: "O(1)", note: "with tail pointer" },
      { label: "Delete (known node)", value: "O(1)" },
      { label: "Space", value: "O(n)" },
    ],
    insights: [
      "Insertion is pointer surgery: link the new node, relink the neighbor.",
      "No contiguous memory — you trade random access for cheap splicing.",
      "A dummy/sentinel head node erases edge cases for empty lists.",
    ],
    useCases: [
      "Frequent inserts/deletes at the ends or at a known position.",
      "Building blocks for stacks, queues, adjacency lists, LRU caches.",
    ],
    pitfalls: [
      "Losing the next pointer before relinking drops the rest of the list.",
      "Reversing in place needs three pointers: prev, curr, next.",
    ],
  },
  {
    slug: "doubly-linked-list",
    title: "Doubly Linked List",
    pillar: "data-structures",
    category: "Linear",
    tagline: "Two-way pointers for O(1) backward traversal.",
    summary:
      "Each node carries both a next and a prev pointer, so you can walk the list in either direction and delete a node in O(1) given only a reference to it. This is the backbone of LRU caches and browser history.",
    difficulty: "Intermediate",
    live: true,
    complexity: [
      { label: "Access", value: "O(n)" },
      { label: "Insert", value: "O(1)", note: "given the node" },
      { label: "Delete", value: "O(1)", note: "given the node" },
      { label: "Traverse back", value: "O(1) per step" },
      { label: "Space", value: "O(n)", note: "extra pointer per node" },
    ],
    insights: [
      "Deleting a node needs no predecessor search — prev is already there.",
      "Sentinel head and tail nodes remove almost every boundary check.",
    ],
    useCases: ["LRU caches", "Undo/redo & browser history", "Music playlists"],
  },
  {
    slug: "stack",
    title: "Stack",
    pillar: "data-structures",
    category: "Linear",
    tagline: "Last-In-First-Out. Push, pop, peek.",
    summary:
      "A stack is a LIFO collection: the last thing you push is the first thing you pop. It mirrors the call stack your program already runs on, and it's the secret engine behind undo, expression parsing, and backtracking.",
    difficulty: "Core",
    live: true,
    complexity: [
      { label: "Push", value: "O(1)" },
      { label: "Pop", value: "O(1)" },
      { label: "Peek", value: "O(1)" },
      { label: "Search", value: "O(n)" },
      { label: "Space", value: "O(n)" },
    ],
    insights: [
      "Only the top is reachable — that constraint is the feature.",
      "Recursion is a stack: each call frame pushes, each return pops.",
    ],
    useCases: [
      "Undo/redo, browser back button.",
      "Balanced-parentheses & expression evaluation.",
      "DFS and backtracking without recursion.",
    ],
  },
  {
    slug: "queue",
    title: "Queue",
    pillar: "data-structures",
    category: "Linear",
    tagline: "First-In-First-Out. Enqueue, dequeue.",
    summary:
      "A queue is FIFO: elements leave in the order they arrived, like a line at a checkout. Implemented with a ring buffer or linked list, both ends are O(1). It powers schedulers, BFS, and every producer/consumer pipeline.",
    difficulty: "Core",
    live: true,
    complexity: [
      { label: "Enqueue", value: "O(1)" },
      { label: "Dequeue", value: "O(1)" },
      { label: "Peek", value: "O(1)" },
      { label: "Search", value: "O(n)" },
      { label: "Space", value: "O(n)" },
    ],
    insights: [
      "Two pointers — head and tail — move forward; the middle never shifts.",
      "A circular buffer reuses freed slots so memory stays bounded.",
    ],
    useCases: ["BFS traversal", "Task & job scheduling", "Streaming / buffering"],
  },
  {
    slug: "hash-table",
    title: "Hash Table",
    pillar: "data-structures",
    category: "Associative",
    tagline: "Key → bucket via a hash function. O(1) average.",
    summary:
      "A hash table maps keys to array slots through a hash function. Average-case insert, lookup, and delete are O(1). Collisions — two keys landing in the same bucket — are resolved by chaining or open addressing, and a good load factor keeps things fast.",
    difficulty: "Core",
    live: true,
    complexity: [
      { label: "Insert", value: "O(1) avg", note: "O(n) worst case" },
      { label: "Lookup", value: "O(1) avg" },
      { label: "Delete", value: "O(1) avg" },
      { label: "Space", value: "O(n)" },
    ],
    insights: [
      "hash(key) % capacity picks the bucket — collisions are inevitable.",
      "Chaining stores a list per bucket; open addressing probes for a free slot.",
      "Resizing when the load factor passes ~0.75 keeps lookups near O(1).",
    ],
    useCases: ["Caches & memoization", "De-duplication / sets", "Counting frequencies"],
    pitfalls: [
      "Worst case is O(n) when every key collides into one bucket.",
      "Iteration order is not insertion order (unless the map guarantees it).",
    ],
  },
  {
    slug: "binary-search-tree",
    title: "Binary Search Tree",
    pillar: "data-structures",
    category: "Tree",
    tagline: "Left < node < right. Ordered O(log n) search.",
    summary:
      "A BST keeps elements ordered: every left descendant is smaller, every right descendant larger. That invariant turns search, insert, and delete into a single root-to-leaf walk — O(log n) when balanced, but O(n) if it degenerates into a line.",
    difficulty: "Intermediate",
    live: true,
    complexity: [
      { label: "Search", value: "O(log n)", note: "O(n) if unbalanced" },
      { label: "Insert", value: "O(log n)" },
      { label: "Delete", value: "O(log n)" },
      { label: "In-order walk", value: "O(n)", note: "yields sorted order" },
      { label: "Space", value: "O(n)" },
    ],
    insights: [
      "At each node you discard half the tree — that's the log n.",
      "In-order traversal (left, node, right) prints values sorted.",
      "Self-balancing variants (AVL, Red-Black) guarantee log n height.",
    ],
    useCases: ["Ordered maps / sets", "Range queries", "Auto-complete prefixes"],
    pitfalls: ["Inserting sorted data builds a linked list — O(n) operations."],
  },
  {
    slug: "heap",
    title: "Heap / Priority Queue",
    pillar: "data-structures",
    category: "Tree",
    tagline: "Complete binary tree; root is always min/max.",
    summary:
      "A binary heap is a complete tree where every parent dominates its children (min-heap: smaller; max-heap: larger). Stored compactly in an array, it gives O(1) peek at the extreme and O(log n) insert/extract via sift-up and sift-down.",
    difficulty: "Intermediate",
    live: true,
    complexity: [
      { label: "Peek min/max", value: "O(1)" },
      { label: "Insert", value: "O(log n)", note: "sift up" },
      { label: "Extract", value: "O(log n)", note: "sift down" },
      { label: "Build heap", value: "O(n)" },
      { label: "Space", value: "O(n)" },
    ],
    insights: [
      "Array indexing: children of i are 2i+1 and 2i+2 — no pointers needed.",
      "Insert at the end, then bubble up until the heap property holds.",
      "Extract swaps root with last, shrinks, then sinks the new root down.",
    ],
    useCases: ["Dijkstra & A*", "Top-K problems", "Event-driven schedulers"],
  },
  {
    slug: "trie",
    title: "Trie (Prefix Tree)",
    pillar: "data-structures",
    category: "Tree",
    tagline: "Shared-prefix tree for fast string lookup.",
    summary:
      "A trie stores strings character-by-character along tree edges, so words with shared prefixes share a path. Lookup and insert cost O(L) in the word's length — independent of how many words are stored — making it the engine behind autocomplete and spell-check.",
    difficulty: "Intermediate",
    live: true,
    complexity: [
      { label: "Insert", value: "O(L)", note: "L = word length" },
      { label: "Search", value: "O(L)" },
      { label: "Prefix query", value: "O(P)", note: "P = prefix length" },
      { label: "Space", value: "O(N·Σ)", note: "nodes × alphabet" },
    ],
    insights: [
      "A path from the root spells a prefix; a flagged node ends a word.",
      "Lookup time depends on the word, not the dictionary size.",
    ],
    useCases: ["Autocomplete & typeahead", "Spell checkers", "IP routing tables"],
  },
  {
    slug: "graph",
    title: "Graph",
    pillar: "data-structures",
    category: "Graph",
    tagline: "Nodes and edges modeling any relationship.",
    summary:
      "A graph is a set of vertices connected by edges — the most general data structure. It models social networks, maps, dependencies, and the web. Represented as an adjacency list (sparse) or matrix (dense), it's the substrate for traversal and shortest-path algorithms.",
    difficulty: "Intermediate",
    live: true,
    complexity: [
      { label: "Adj. list space", value: "O(V + E)" },
      { label: "Adj. matrix space", value: "O(V²)" },
      { label: "Edge lookup (list)", value: "O(degree)" },
      { label: "Edge lookup (matrix)", value: "O(1)" },
    ],
    insights: [
      "Adjacency list for sparse graphs; matrix when edges are dense.",
      "Directed vs undirected, weighted vs unweighted, cyclic vs acyclic.",
    ],
    useCases: ["Social & road networks", "Dependency resolution", "Recommendation systems"],
  },
  {
    slug: "union-find",
    title: "Union-Find (DSU)",
    pillar: "data-structures",
    category: "Graph",
    tagline: "Near-constant merge & connectivity checks.",
    summary:
      "Disjoint-Set Union tracks elements partitioned into groups, answering 'are these two connected?' and 'merge these groups' in almost O(1) using path compression and union by rank. It's the heart of Kruskal's MST and cycle detection.",
    difficulty: "Advanced",
    live: true,
    complexity: [
      { label: "Find", value: "O(α(n))", note: "inverse Ackermann ≈ 1" },
      { label: "Union", value: "O(α(n))" },
      { label: "Space", value: "O(n)" },
    ],
    insights: [
      "Path compression flattens trees on every find.",
      "Union by rank attaches the smaller tree under the larger.",
    ],
    useCases: ["Kruskal's MST", "Connected components", "Cycle detection"],
  },

  // ───────────────────────── Algorithms ─────────────────────────
  {
    slug: "bubble-sort",
    title: "Bubble Sort",
    pillar: "algorithms",
    category: "Sorting",
    tagline: "Adjacent swaps bubble the largest to the end.",
    summary:
      "Bubble sort repeatedly walks the list, swapping any out-of-order neighbors. After each pass the next-largest element 'bubbles' to its final spot. Simple and stable, but O(n²) — a teaching tool more than a production sort.",
    difficulty: "Core",
    live: true,
    complexity: [
      { label: "Best", value: "O(n)", note: "already sorted, with early exit" },
      { label: "Average", value: "O(n²)" },
      { label: "Worst", value: "O(n²)" },
      { label: "Space", value: "O(1)", note: "in-place" },
    ],
    insights: [
      "Each pass guarantees one more element reaches its final position.",
      "A 'no swaps this pass' flag lets it exit early on sorted input.",
    ],
  },
  {
    slug: "selection-sort",
    title: "Selection Sort",
    pillar: "algorithms",
    category: "Sorting",
    tagline: "Repeatedly pick the minimum, place it at the front.",
    summary:
      "Selection sort scans for the smallest remaining element and swaps it into place, growing a sorted prefix one element at a time. It always does O(n²) comparisons but only O(n) swaps — useful when writes are expensive.",
    difficulty: "Core",
    live: true,
    complexity: [
      { label: "Best", value: "O(n²)" },
      { label: "Average", value: "O(n²)" },
      { label: "Worst", value: "O(n²)" },
      { label: "Swaps", value: "O(n)" },
      { label: "Space", value: "O(1)" },
    ],
    insights: [
      "Minimizes the number of swaps — at most n−1.",
      "Comparisons are fixed regardless of input order.",
    ],
  },
  {
    slug: "insertion-sort",
    title: "Insertion Sort",
    pillar: "algorithms",
    category: "Sorting",
    tagline: "Build a sorted region one card at a time.",
    summary:
      "Insertion sort grows a sorted prefix by taking each new element and sliding it left into position — exactly how you sort a hand of cards. It's O(n²) worst case but blazing on nearly-sorted or small inputs, which is why hybrids fall back to it.",
    difficulty: "Core",
    live: true,
    complexity: [
      { label: "Best", value: "O(n)", note: "nearly sorted" },
      { label: "Average", value: "O(n²)" },
      { label: "Worst", value: "O(n²)" },
      { label: "Space", value: "O(1)" },
    ],
    insights: [
      "Adaptive: the closer to sorted, the faster it runs.",
      "Stable and in-place — production sorts use it for small subarrays.",
    ],
  },
  {
    slug: "merge-sort",
    title: "Merge Sort",
    pillar: "algorithms",
    category: "Sorting",
    tagline: "Divide in half, sort, merge. Guaranteed O(n log n).",
    summary:
      "Merge sort splits the array in half recursively until single elements remain, then merges sorted halves back together. The merge step is linear and the recursion is log n deep, giving a rock-solid O(n log n) in every case — at the cost of O(n) extra space.",
    difficulty: "Intermediate",
    live: true,
    complexity: [
      { label: "Best", value: "O(n log n)" },
      { label: "Average", value: "O(n log n)" },
      { label: "Worst", value: "O(n log n)" },
      { label: "Space", value: "O(n)" },
    ],
    insights: [
      "Divide-and-conquer: log n levels, O(n) merge work per level.",
      "Stable, and the go-to for sorting linked lists and external data.",
    ],
  },
  {
    slug: "quick-sort",
    title: "Quick Sort",
    pillar: "algorithms",
    category: "Sorting",
    tagline: "Partition around a pivot, recurse on each side.",
    summary:
      "Quick sort picks a pivot, partitions elements into smaller-than and larger-than groups, then recurses. In practice it's the fastest comparison sort thanks to in-place partitioning and cache friendliness — averaging O(n log n), with an O(n²) worst case tamed by good pivot choice.",
    difficulty: "Intermediate",
    live: true,
    complexity: [
      { label: "Best", value: "O(n log n)" },
      { label: "Average", value: "O(n log n)" },
      { label: "Worst", value: "O(n²)", note: "bad pivots" },
      { label: "Space", value: "O(log n)", note: "recursion stack" },
    ],
    insights: [
      "Partitioning places the pivot in its final sorted position.",
      "Randomized or median-of-three pivots avoid the O(n²) trap.",
    ],
  },
  {
    slug: "linear-search",
    title: "Linear Search",
    pillar: "algorithms",
    category: "Searching",
    tagline: "Check each element until you find the target.",
    summary:
      "Linear search walks the collection one element at a time. It needs no ordering and works on anything iterable, but it's O(n) — the baseline every faster search is measured against.",
    difficulty: "Core",
    live: true,
    complexity: [
      { label: "Best", value: "O(1)" },
      { label: "Average", value: "O(n)" },
      { label: "Worst", value: "O(n)" },
      { label: "Space", value: "O(1)" },
    ],
    insights: ["The only option on unsorted data.", "No preprocessing required."],
  },
  {
    slug: "binary-search",
    title: "Binary Search",
    pillar: "algorithms",
    category: "Searching",
    tagline: "Halve the search space every step. O(log n).",
    summary:
      "Binary search exploits sorted order: compare the middle, then discard half the array each step. Twenty comparisons suffice to find any item among a million. The idea generalizes far beyond arrays — 'binary search on the answer' solves whole classes of problems.",
    difficulty: "Core",
    live: true,
    complexity: [
      { label: "Best", value: "O(1)" },
      { label: "Average", value: "O(log n)" },
      { label: "Worst", value: "O(log n)" },
      { label: "Space", value: "O(1)", note: "iterative" },
    ],
    insights: [
      "Requires sorted input — the invariant that makes halving valid.",
      "Watch the boundaries: low ≤ high, and mid = low + (high−low)/2.",
    ],
    pitfalls: [
      "Off-by-one in the loop bound causes infinite loops or missed elements.",
      "mid = (low+high)/2 can overflow in fixed-width integers.",
    ],
  },
  {
    slug: "bfs",
    title: "Breadth-First Search",
    pillar: "algorithms",
    category: "Graph",
    tagline: "Explore level by level with a queue.",
    summary:
      "BFS explores a graph in expanding rings: all neighbors at distance 1, then distance 2, and so on, using a queue. On unweighted graphs it finds the shortest path in edges, and it's the basis for level-order tree traversal.",
    difficulty: "Intermediate",
    live: true,
    complexity: [
      { label: "Time", value: "O(V + E)" },
      { label: "Space", value: "O(V)", note: "queue + visited" },
    ],
    insights: [
      "A FIFO queue enforces the level-by-level order.",
      "First time you reach a node is the shortest unweighted path.",
    ],
    useCases: ["Shortest path (unweighted)", "Level-order traversal", "Web crawling"],
  },
  {
    slug: "dfs",
    title: "Depth-First Search",
    pillar: "algorithms",
    category: "Graph",
    tagline: "Plunge down one path before backtracking.",
    summary:
      "DFS dives as deep as possible along each branch before backtracking, using a stack (or recursion). It's the workhorse for cycle detection, topological sort, connected components, and maze solving.",
    difficulty: "Intermediate",
    live: true,
    complexity: [
      { label: "Time", value: "O(V + E)" },
      { label: "Space", value: "O(V)", note: "recursion / stack" },
    ],
    insights: [
      "Recursion uses the call stack; iterative DFS uses an explicit one.",
      "Pre/post-order around the recursive call power many graph algorithms.",
    ],
    useCases: ["Cycle detection", "Topological sort", "Connected components"],
  },
  {
    slug: "dijkstra",
    title: "Dijkstra's Shortest Path",
    pillar: "algorithms",
    category: "Graph",
    tagline: "Greedy shortest paths with a priority queue.",
    summary:
      "Dijkstra's algorithm finds the shortest path from a source to every node in a weighted graph with non-negative edges. It greedily settles the closest unvisited node, relaxing its neighbors, using a min-heap to always pick the nearest frontier vertex.",
    difficulty: "Advanced",
    live: true,
    complexity: [
      { label: "Time", value: "O((V + E) log V)", note: "binary heap" },
      { label: "Space", value: "O(V)" },
    ],
    insights: [
      "Relaxation: if dist[u] + w < dist[v], you found a shorter route.",
      "Once a node is settled, its distance is final — that's the greedy step.",
    ],
    pitfalls: ["Fails with negative edges — use Bellman-Ford instead."],
    useCases: ["GPS routing", "Network latency", "Game pathfinding"],
  },
  {
    slug: "two-pointers",
    title: "Two Pointers",
    pillar: "algorithms",
    category: "Patterns",
    tagline: "Two indices converging or chasing through data.",
    summary:
      "The two-pointer pattern uses a pair of indices — moving toward each other or one chasing the other — to solve array and string problems in a single O(n) pass instead of O(n²) nested loops. Classic on sorted arrays for pair-sum and reversal.",
    difficulty: "Intermediate",
    live: true,
    complexity: [
      { label: "Time", value: "O(n)" },
      { label: "Space", value: "O(1)" },
    ],
    insights: [
      "On a sorted array, move the pointer that brings the sum toward target.",
      "Fast/slow pointers detect cycles and find midpoints.",
    ],
    useCases: ["Pair-sum on sorted arrays", "Palindrome checks", "In-place dedup"],
  },
  {
    slug: "sliding-window",
    title: "Sliding Window",
    pillar: "algorithms",
    category: "Patterns",
    tagline: "A moving range that grows and shrinks in O(n).",
    summary:
      "The sliding-window pattern maintains a contiguous range that expands and contracts as it scans, reusing work instead of recomputing each subarray. It turns brute-force O(n·k) substring and subarray problems into a single O(n) sweep.",
    difficulty: "Intermediate",
    live: true,
    complexity: [
      { label: "Time", value: "O(n)" },
      { label: "Space", value: "O(k)", note: "window contents" },
    ],
    insights: [
      "Expand the right edge to include; shrink the left to stay valid.",
      "Each element enters and leaves the window at most once → O(n).",
    ],
    useCases: ["Longest substring problems", "Max sum subarray of size k", "Rate limiting"],
  },
  {
    slug: "recursion",
    title: "Recursion & The Call Stack",
    pillar: "algorithms",
    category: "Patterns",
    tagline: "Functions that call themselves, one frame at a time.",
    summary:
      "Recursion solves a problem by reducing it to smaller versions of itself until a base case stops the descent. Each call stacks a frame; each return unwinds one. Understanding the call stack demystifies memoization, backtracking, and tree algorithms.",
    difficulty: "Intermediate",
    live: true,
    complexity: [
      { label: "Time", value: "varies", note: "by recurrence" },
      { label: "Space", value: "O(depth)", note: "call stack" },
    ],
    insights: [
      "Every recursion needs a base case or it overflows the stack.",
      "Naive recursion recomputes subproblems — memoization fixes it.",
    ],
    useCases: ["Tree/graph traversal", "Divide & conquer", "Backtracking"],
  },
  {
    slug: "backtracking",
    title: "Backtracking",
    pillar: "algorithms",
    category: "Patterns",
    tagline: "Try, fail, undo, try again — search a decision tree.",
    summary:
      "Backtracking explores a tree of partial solutions, abandoning a branch the moment it can't lead to a valid answer ('pruning'). It systematically generates permutations, subsets, and constraint solutions like N-Queens and Sudoku.",
    difficulty: "Advanced",
    live: true,
    complexity: [
      { label: "Time", value: "O(b^d)", note: "branching ^ depth" },
      { label: "Space", value: "O(d)" },
    ],
    insights: [
      "Choose → explore → un-choose. The undo step is what makes it backtracking.",
      "Pruning invalid branches early is the difference between fast and hopeless.",
    ],
    useCases: ["N-Queens & Sudoku", "Permutations / combinations", "Constraint solving"],
  },
  {
    slug: "dynamic-programming",
    title: "Dynamic Programming",
    pillar: "algorithms",
    category: "Patterns",
    tagline: "Solve once, remember, reuse. Overlapping subproblems.",
    summary:
      "Dynamic programming breaks a problem into overlapping subproblems and stores each answer so it's computed only once — via top-down memoization or bottom-up tabulation. It collapses exponential recursion into polynomial time.",
    difficulty: "Advanced",
    live: true,
    complexity: [
      { label: "Time", value: "O(states × work)" },
      { label: "Space", value: "O(states)", note: "often reducible" },
    ],
    insights: [
      "Two ingredients: optimal substructure + overlapping subproblems.",
      "Memoization caches recursion; tabulation fills a table iteratively.",
    ],
    useCases: ["Knapsack", "Edit distance", "Longest common subsequence"],
  },

  // ───────────────────────── System Design ─────────────────────────
  {
    slug: "cap-theorem",
    title: "CAP Theorem",
    pillar: "system-design",
    category: "Fundamentals",
    tagline: "Pick two: Consistency, Availability, Partition tolerance.",
    summary:
      "In a distributed system, you can only guarantee two of Consistency, Availability, and Partition tolerance at once. Networks fail, so partition tolerance isn't really optional — the real choice happens during a partition: block/error to stay consistent (CP), or keep answering with data that might be stale (AP).",
    difficulty: "Core",
    live: true,
    insights: [
      "Partition tolerance isn't optional — networks fail, so you're really choosing between C and A when they do.",
      "CP blocks or errors during a partition rather than risk returning stale data — good for atomic reads and writes.",
      "AP keeps answering during a partition, possibly with stale data — good when eventual consistency is acceptable.",
      "CAP only describes behavior during a partition — most of the time, with no partition, you get both C and A.",
      "NoSQL's BASE model (basically available, soft state, eventually consistent) is the AP side of this tradeoff; RDBMS transactions lean CP.",
    ],
    pitfalls: [
      "CAP is binary in theory but real systems tune consistency per-operation, not system-wide.",
      "Choosing AP doesn't mean 'no consistency' — eventual consistency still needs a conflict-resolution strategy for when replicas disagree.",
      "Latency and consistency trade off even without a partition (see PACELC) — CAP alone doesn't describe normal-operation behavior.",
    ],
    useCases: [
      "Choosing a database's consistency model",
      "Justifying a strong- vs eventual-consistency design decision",
      "Explaining why a distributed system rejected requests during an outage",
    ],
  },
  {
    slug: "dns",
    title: "DNS Resolution",
    pillar: "system-design",
    category: "Networking",
    tagline: "Translate a domain name into an IP address.",
    summary:
      "DNS resolves human-readable domain names into IP addresses through a hierarchical lookup chain — a recursive resolver, root servers, TLD servers, and finally the domain's authoritative name server. Once resolved, the answer is cached according to its TTL, so almost every real-world lookup skips the full chain.",
    difficulty: "Core",
    live: true,
    insights: [
      "Resolution walks a hierarchy: root → TLD (.com) → authoritative name server, each pointing to the next.",
      "A resolver caches the answer for the record's TTL — most lookups never leave the cache.",
      "A records map a name to an IP; CNAME records alias one name to another; NS records delegate a zone to its name servers.",
      "Weighted round robin, latency-based, and geolocation-based routing let a single domain answer differently per client.",
      "DNS runs on eventual consistency at internet scale — propagation delay after a change is normal, not a bug.",
    ],
    pitfalls: [
      "Every uncached lookup adds a full round trip before the 'real' request can even start — TTL tuning is a real latency lever.",
      "Lowering TTL for faster failover means more traffic hits your authoritative servers and more exposure to their outages.",
      "DNS is a centralized dependency — an outage or DDoS against your resolver takes down every service behind that domain, even if the services themselves are healthy.",
    ],
    useCases: ["Every domain lookup on the internet", "Blue/green traffic shifting via weighted records", "Geographic / latency-based routing"],
  },
  {
    slug: "cdn",
    title: "Content Delivery Network",
    pillar: "system-design",
    category: "Performance",
    tagline: "Serve content from a location close to the user.",
    summary:
      "A CDN is a globally distributed network of edge servers that cache content closer to users, so requests don't have to cross the world to the origin. Push CDNs are pre-loaded with content ahead of time; pull CDNs fetch and cache lazily on first request, trading a slower first hit for far simpler operations.",
    difficulty: "Intermediate",
    live: true,
    insights: [
      "Two wins at once: users get content from a nearby edge, and your origin serves fewer requests overall.",
      "Push CDNs: you upload content ahead of time — a good fit for small or rarely-updated sites.",
      "Pull CDNs: the edge fetches on first request and caches it for the TTL — better for heavy or long-tail traffic, since only what's actually requested gets stored.",
      "DNS resolution is what routes a client to its nearest edge in the first place.",
      "Static assets (HTML/CSS/JS, images, video) are the classic fit; some CDNs also front dynamic content.",
    ],
    pitfalls: [
      "A pull CDN's first request per edge is a full origin round trip — a cold edge is exactly as slow as no CDN at all.",
      "Content can go stale if it changes before the TTL expires — cache invalidation costs real money and complexity (versioned URLs help).",
      "Every static asset URL now points at the CDN — swapping providers later means rewriting URLs everywhere.",
    ],
    useCases: ["Static asset delivery at global scale", "Video / image-heavy sites", "Offloading origin servers from read traffic"],
  },
  {
    slug: "reverse-proxy",
    title: "Reverse Proxy",
    pillar: "system-design",
    category: "Networking",
    tagline: "One front door that hides and protects everything behind it.",
    summary:
      "A reverse proxy sits in front of one or more backend servers, forwarding client requests and returning the response as if it came from the proxy itself. It centralizes SSL termination, compression, caching, and static file serving — and hides backend topology from the outside world, which pays off even with a single server.",
    difficulty: "Intermediate",
    live: true,
    insights: [
      "Clients only ever see the proxy's IP — you can add, remove, or reconfigure backend servers without clients noticing.",
      "SSL termination happens once at the proxy, so backend servers skip the expensive decrypt/encrypt work.",
      "The proxy can serve cached responses and static files directly, without ever bothering a backend.",
      "Unlike a load balancer, a reverse proxy earns its keep even with a single backend — security and SSL termination alone justify it.",
      "NGINX and HAProxy commonly do both jobs at once: layer 7 reverse proxying and load balancing.",
    ],
    pitfalls: [
      "It's a new single point of failure — pair it with a standby, same as a load balancer.",
      "Terminating SSL at the proxy often means plaintext traffic to the backend — fine inside a trusted network, a real gap if it isn't.",
      "Forward proxy and reverse proxy solve opposite problems: a forward proxy hides clients from servers, a reverse proxy hides servers from clients — don't mix them up.",
    ],
    useCases: ["Hiding backend topology from the internet", "Centralizing SSL termination and compression", "Serving cached or static content without hitting the app tier"],
  },
  {
    slug: "database-replication",
    title: "Database Replication",
    pillar: "system-design",
    category: "Reliability",
    tagline: "Keep copies of your data in sync — and keep serving if one goes down.",
    summary:
      "Replication keeps multiple copies of a database in sync so a single node failure doesn't take down reads or writes. Master-slave sends all writes through one master and fans reads out to read-only replicas; master-master lets writes land on either node, trading a single write bottleneck for conflict-resolution risk.",
    difficulty: "Advanced",
    live: true,
    insights: [
      "Master-slave: one master serves writes and replicates them to slaves that serve reads only — simple, but a single write bottleneck.",
      "Master-master: both nodes accept writes and sync with each other — no single write bottleneck, but conflicts are now your problem.",
      "If the master goes down in master-slave, the system can keep serving reads until a slave is promoted or a new master is provisioned.",
      "Replication lag is real: the more read replicas, the more there is to replicate, and reads can briefly see stale data.",
      "This is the same fail-over pattern as active-passive (master-slave) vs active-active (master-master) load balancing — same tradeoff, different layer.",
    ],
    pitfalls: [
      "Losing the master before a write replicates means that write is gone — replication doesn't replace backups.",
      "Master-master either loosens consistency (violates strict ACID) or pays a latency tax to synchronize writes across nodes.",
      "Promoting a slave to master isn't automatic — someone, or some system, has to detect the failure and do it correctly, fast.",
    ],
    useCases: ["Read-heavy workloads that need to scale reads horizontally", "High-availability requirements where the DB can't be a single point of failure", "Geo-distributed writes (master-master)"],
  },
  {
    slug: "load-balancing",
    title: "Load Balancing",
    pillar: "system-design",
    category: "Scaling",
    tagline: "Spread traffic across servers, no single hotspot.",
    summary:
      "A load balancer sits in front of a server pool and distributes incoming requests so no one machine is overwhelmed. Strategies range from round-robin to least-connections to weighted routing, with health checks that pull dead nodes out of rotation.",
    difficulty: "Core",
    live: true,
    insights: [
      "Round-robin, least-connections, IP-hash, and weighted are the staples.",
      "Health checks + automatic failover keep traffic off dead servers.",
      "L4 balances on IP/port (fast, just forwards packets); L7 reads HTTP paths, headers, and cookies to route smarter.",
      "SSL termination at the LB means backend servers skip the expensive decrypt/encrypt work.",
      "Horizontal scaling only works if servers are stateless — sessions belong in a shared store, not local memory.",
    ],
    pitfalls: [
      "The load balancer itself is a new single point of failure — pair it with a standby in active-passive or active-active mode.",
      "Sticky sessions reintroduce state into a 'stateless' fleet; prefer a centralized session store (Redis, DB) instead.",
      "An underprovisioned or misconfigured LB becomes the bottleneck it was meant to prevent.",
    ],
    useCases: ["Horizontal scaling", "Zero-downtime deploys", "Geographic routing"],
  },
  {
    slug: "caching",
    title: "Caching",
    pillar: "system-design",
    category: "Performance",
    tagline: "Keep hot data close to cut latency.",
    summary:
      "Caching stores frequently accessed data in a fast layer — memory, a CDN edge, or a Redis cluster — so repeat requests skip the slow path. The art is in invalidation, eviction policy (LRU/LFU), and choosing between cache-aside, write-through, and write-back.",
    difficulty: "Intermediate",
    live: true,
    insights: [
      "Cache-aside: the app reads the DB on a miss and back-fills the cache itself.",
      "Read-through: the cache loads from the DB transparently — the app only sees the cache.",
      "Write-through keeps cache and DB consistent; write-behind acks first and flushes async (faster, riskier).",
      "Refresh-ahead proactively re-fetches hot keys before they expire, trading extra load for fewer cold misses.",
      "Eviction (LRU/LFU/TTL) decides what to drop when the cache is full.",
      "Stale data is the price of speed — invalidation is the hard part.",
    ],
    pitfalls: [
      "Cache and source of truth can drift — every write path needs an explicit invalidation story.",
      "A cold cache after a deploy or crash sends a thundering herd of requests straight at the database.",
      "Caching adds an operational dependency (Redis/Memcached) and a whole new failure mode to reason about.",
    ],
    useCases: ["Read-heavy workloads", "Session storage", "Rendered-page caching"],
  },
  {
    slug: "sharding",
    title: "Database Sharding",
    pillar: "system-design",
    category: "Scaling",
    tagline: "Split one big database into many smaller ones.",
    summary:
      "Sharding partitions data horizontally across multiple database nodes by a shard key, so each holds only a slice. It scales writes and storage past a single machine's limits — at the cost of cross-shard queries and rebalancing complexity.",
    difficulty: "Advanced",
    live: true,
    insights: [
      "The shard key determines which node owns each row — choose it carefully.",
      "Range, hash, and directory-based sharding trade locality for balance.",
      "Cross-shard joins and transactions are the expensive parts.",
      "Federation (splitting by function — users, products, forums) is the lighter-weight sibling: fewer, coarser databases instead of many uniform shards.",
      "Smaller shards mean more of the working set fits in memory, which is often the real performance win.",
    ],
    pitfalls: [
      "A skewed shard key creates hot shards — a handful of power users can overload one node while others idle.",
      "Rebalancing after adding a shard means moving data live; hashing the key (ideally with consistent hashing) limits how much has to move.",
      "Application code now has to know which shard to query — 'just add an index' no longer applies uniformly.",
    ],
    useCases: ["Write-heavy scale-out", "Multi-tenant isolation", "Geo-partitioning"],
  },
  {
    slug: "consistent-hashing",
    title: "Consistent Hashing",
    pillar: "system-design",
    category: "Scaling",
    tagline: "Add or remove nodes without reshuffling everything.",
    summary:
      "Consistent hashing maps both keys and servers onto a ring, so each key belongs to the next server clockwise. Adding or removing a node only moves the keys in one arc — not the whole keyspace — making it ideal for distributed caches and sharded stores.",
    difficulty: "Advanced",
    live: true,
    insights: [
      "Keys and nodes share one hash ring; a key goes to the next node clockwise.",
      "Virtual nodes smooth out uneven key distribution.",
      "Removing a node only reassigns its arc — minimal data movement.",
      "This is what makes sharding rebalancing cheap: only ~1/n of the keyspace moves when a node joins or leaves, not all of it.",
    ],
    pitfalls: [
      "Too few virtual nodes per physical node and the ring stays lumpy — some nodes still get more traffic than others.",
      "The lookup structure (sorted ring) still needs O(log n) search per key — not free, just far cheaper than a full reshuffle.",
    ],
    complexity: [
      { label: "Key lookup", value: "O(log n)", note: "binary search over sorted ring positions" },
      { label: "Add / remove node", value: "O(k/n)", note: "k = total keys, n = nodes — only the node's arc moves" },
    ],
    useCases: ["Distributed caches", "Sharded databases", "P2P / DHT systems"],
  },
  {
    slug: "message-queue",
    title: "Message Queues",
    pillar: "system-design",
    category: "Reliability",
    tagline: "Decouple producers from consumers with a buffer.",
    summary:
      "A message queue lets services communicate asynchronously: producers publish messages, consumers process them at their own pace. It absorbs traffic spikes, decouples components, and adds durability and retries — the backbone of event-driven architecture.",
    difficulty: "Intermediate",
    live: true,
    insights: [
      "Asynchronous decoupling: the producer doesn't wait for the consumer.",
      "Queues buffer bursts so a spike doesn't topple downstream services.",
      "At-least-once delivery + idempotent consumers handle retries safely.",
      "Task queues (Celery-style) are a close cousin — they run scheduled or computationally heavy jobs and return a result, not just fire-and-forget messages.",
      "Back pressure caps queue growth: once it's full, reject new work (HTTP 503) instead of drowning in an unbounded backlog.",
    ],
    pitfalls: [
      "An unbounded queue can grow past memory, spilling to disk and slowing every job behind it — cap it and apply back pressure.",
      "Not every workflow benefits from async — cheap, latency-sensitive operations just pay the queue's overhead for nothing.",
      "Rejected clients should retry with exponential backoff, or a recovering queue gets immediately re-slammed.",
    ],
    useCases: ["Background jobs", "Event-driven microservices", "Spike smoothing"],
  },
  {
    slug: "rate-limiting",
    title: "Rate Limiting",
    pillar: "system-design",
    category: "Reliability",
    tagline: "Cap request rates to protect your service.",
    summary:
      "Rate limiting caps how many requests a client can make in a window, protecting services from abuse and overload. Token bucket, leaky bucket, and sliding-window counters each balance burst tolerance against strictness.",
    difficulty: "Intermediate",
    live: true,
    insights: [
      "Token bucket refills at a fixed rate and allows controlled bursts.",
      "Leaky bucket queues requests and drains at a constant rate, smoothing output.",
      "Fixed window is cheap but lets a boundary burst hit up to 2× the limit.",
      "Sliding window counts the trailing interval — fairer, but tracks more state.",
      "Limits live at the edge (API gateway) keyed by IP, user, or API key.",
    ],
    pitfalls: [
      "Per-instance counters undercount across a fleet — distributed rate limiting needs shared state (Redis) or the real limit is (per-instance limit × instance count).",
      "Rejecting with a bare error invites retry storms; return 429 with a Retry-After header so well-behaved clients back off.",
      "Too strict and you throttle legitimate bursty usage; too loose and one bad actor can still degrade the service for everyone else.",
    ],
    useCases: ["API abuse prevention", "Fair multi-tenant usage", "DDoS mitigation"],
  },
];

export const TOPICS_BY_SLUG: Record<string, Topic> = Object.fromEntries(
  TOPICS.map((t) => [t.slug, t]),
);

export function topicsByPillar(pillar: Pillar) {
  return TOPICS.filter((t) => t.pillar === pillar);
}

export function pillarStats() {
  return (Object.keys(PILLARS) as Pillar[]).map((p) => ({
    pillar: p,
    ...PILLARS[p],
    count: topicsByPillar(p).length,
    live: topicsByPillar(p).filter((t) => t.live).length,
  }));
}
