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
      "L4 balances on IP/port; L7 understands HTTP paths and cookies.",
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
      "A cache hit skips the database; a miss falls through and back-fills.",
      "Eviction (LRU/LFU/TTL) decides what to drop when the cache is full.",
      "Stale data is the price of speed — invalidation is the hard part.",
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
      "Leaky bucket smooths output to a constant drain rate.",
      "Limits live at the edge (API gateway) keyed by IP, user, or API key.",
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
