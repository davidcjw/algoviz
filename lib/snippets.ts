// Python code snippets for common interview scenarios, keyed by topic slug.
// Kept out of content.ts to keep the catalog readable; attached to each Topic
// at module load. Each snippet is a focused "how do I actually do X" example.

export interface CodeSnippet {
  label: string;
  code: string;
}

export const CODE_SNIPPETS: Record<string, CodeSnippet[]> = {
  array: [
    {
      label: "Insert & delete",
      code: `arr = [3, 1, 4, 1, 5]

arr.append(9)        # O(1) amortized — add to the end
arr.insert(0, 2)     # O(n) — shift everything right
arr[2] = 7           # O(1) — random access by index
val = arr.pop()      # O(1) — remove from the end
arr.pop(0)           # O(n) — remove from front, shifts left
arr.remove(4)        # O(n) — find, then delete first match`,
    },
    {
      label: "Search & iterate",
      code: `for i, x in enumerate(arr):
    print(i, x)

if 5 in arr:          # O(n) linear scan
    idx = arr.index(5)

sub = arr[1:4]        # slice — copies a window, O(k)`,
    },
  ],

  "linked-list": [
    {
      label: "Node",
      code: `class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next`,
    },
    {
      label: "Insert head",
      code: `def insert_head(head, val):
    # New node points at the old head; return it as the new head. O(1).
    return Node(val, head)`,
    },
    {
      label: "Insert tail",
      code: `def insert_tail(head, val):
    node = Node(val)
    if head is None:
        return node
    cur = head
    while cur.next:          # walk to the last node — O(n)
        cur = cur.next
    cur.next = node
    return head`,
    },
    {
      label: "Insert after",
      code: `def insert_after(node, val):
    # Splice between node and node.next — pure pointer surgery, O(1).
    node.next = Node(val, node.next)`,
    },
    {
      label: "Remove value",
      code: `def remove(head, val):
    dummy = Node(0, head)        # sentinel kills the head edge case
    prev = dummy
    while prev.next:
        if prev.next.val == val:
            prev.next = prev.next.next   # skip the target — O(1) splice
            break
        prev = prev.next
    return dummy.next`,
    },
    {
      label: "Reverse",
      code: `def reverse(head):
    prev = None
    while head:
        head.next, prev, head = prev, head, head.next
    return prev`,
    },
  ],

  "doubly-linked-list": [
    {
      label: "Node",
      code: `class Node:
    def __init__(self, val):
        self.val = val
        self.prev = None
        self.next = None`,
    },
    {
      label: "Insert after",
      code: `def insert_after(node, new):
    new.prev = node
    new.next = node.next
    if node.next:
        node.next.prev = new
    node.next = new`,
    },
    {
      label: "Remove node",
      code: `def remove(node):
    # With both pointers in hand, deletion is O(1) — no traversal needed.
    if node.prev:
        node.prev.next = node.next
    if node.next:
        node.next.prev = node.prev
    node.prev = node.next = None`,
    },
  ],

  stack: [
    {
      label: "Push / pop / peek",
      code: `stack = []

stack.append(10)     # push — O(1)
stack.append(20)
top = stack[-1]      # peek — O(1)
val = stack.pop()    # pop the top — O(1)
empty = not stack    # truthiness check for empty`,
    },
  ],

  queue: [
    {
      label: "Enqueue / dequeue",
      code: `from collections import deque

q = deque()

q.append(1)          # enqueue at the back — O(1)
q.append(2)
front = q[0]         # peek front — O(1)
val = q.popleft()    # dequeue from the front — O(1)
empty = not q

# Avoid list.pop(0) for a queue — it is O(n) because it shifts every element.`,
    },
  ],

  "hash-table": [
    {
      label: "Core ops",
      code: `table = {}

table["a"] = 1            # insert / update — O(1) average
val = table.get("a", 0)   # lookup with a default, no KeyError
if "a" in table:          # membership — O(1) average
    del table["a"]        # delete — O(1) average

for key, val in table.items():
    print(key, val)`,
    },
    {
      label: "defaultdict & Counter",
      code: `from collections import defaultdict, Counter

groups = defaultdict(list)
groups["even"].append(2)        # no KeyError on first touch

counts = Counter("banana")      # Counter({'a': 3, 'n': 2, 'b': 1})
counts.most_common(1)           # [('a', 3)]`,
    },
  ],

  "binary-search-tree": [
    {
      label: "Node & insert",
      code: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def insert(root, val):
    if root is None:
        return Node(val)
    if val < root.val:
        root.left = insert(root.left, val)
    else:
        root.right = insert(root.right, val)
    return root`,
    },
    {
      label: "Search",
      code: `def search(root, val):
    while root and root.val != val:
        root = root.left if val < root.val else root.right
    return root            # the node, or None`,
    },
    {
      label: "Inorder (sorted)",
      code: `def inorder(root, out):
    if root:
        inorder(root.left, out)
        out.append(root.val)     # visited in ascending order
        inorder(root.right, out)
    return out`,
    },
  ],

  heap: [
    {
      label: "Push / pop min",
      code: `import heapq

h = []
heapq.heappush(h, 5)      # O(log n)
heapq.heappush(h, 1)
heapq.heappush(h, 3)

smallest = h[0]           # peek min — O(1)
val = heapq.heappop(h)    # pop min — O(log n)

nums = [5, 1, 3, 8, 2]
heapq.heapify(nums)       # build a heap in place — O(n)`,
    },
    {
      label: "Max-heap & top-k",
      code: `import heapq

# Python's heapq is a min-heap — negate values for a max-heap.
h = []
heapq.heappush(h, -x)
largest = -heapq.heappop(h)

# k largest without fully sorting:
top3 = heapq.nlargest(3, nums)`,
    },
  ],

  trie: [
    {
      label: "Trie (dict of dicts)",
      code: `class Trie:
    def __init__(self):
        self.root = {}

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node["$"] = True          # mark end of a complete word

    def search(self, word):
        node = self.root
        for ch in word:
            if ch not in node:
                return False
            node = node[ch]
        return "$" in node

    def starts_with(self, prefix):
        node = self.root
        for ch in prefix:
            if ch not in node:
                return False
            node = node[ch]
        return True`,
    },
  ],

  graph: [
    {
      label: "Build adjacency list",
      code: `from collections import defaultdict

graph = defaultdict(list)
edges = [(0, 1), (0, 2), (1, 2)]
for u, v in edges:
    graph[u].append(v)
    graph[v].append(u)      # drop this line for a directed graph`,
    },
    {
      label: "Iterate neighbors",
      code: `for neighbor in graph[0]:
    print(neighbor)

degree = len(graph[0])      # number of edges touching node 0`,
    },
  ],

  "union-find": [
    {
      label: "Union-Find (DSU)",
      code: `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]  # path compression
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False           # already connected
        if self.rank[ra] < self.rank[rb]:
            ra, rb = rb, ra        # union by rank
        self.parent[rb] = ra
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1
        return True`,
    },
  ],

  "bubble-sort": [
    {
      label: "Bubble sort",
      code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:        # nothing moved — already sorted
            break
    return arr`,
    },
  ],

  "selection-sort": [
    {
      label: "Selection sort",
      code: `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        lo = i
        for j in range(i + 1, n):
            if arr[j] < arr[lo]:
                lo = j         # find the smallest in the unsorted part
        arr[i], arr[lo] = arr[lo], arr[i]
    return arr`,
    },
  ],

  "insertion-sort": [
    {
      label: "Insertion sort",
      code: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]    # shift larger elements right
            j -= 1
        arr[j + 1] = key           # drop key into its slot
    return arr`,
    },
  ],

  "merge-sort": [
    {
      label: "Merge sort",
      code: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)`,
    },
    {
      label: "Merge step",
      code: `def merge(a, b):
    out, i, j = [], 0, 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:           # <= keeps the sort stable
            out.append(a[i]); i += 1
        else:
            out.append(b[j]); j += 1
    out.extend(a[i:])
    out.extend(b[j:])
    return out`,
    },
  ],

  "quick-sort": [
    {
      label: "Quick sort",
      code: `def quick_sort(arr, lo=0, hi=None):
    if hi is None:
        hi = len(arr) - 1
    if lo >= hi:
        return arr
    p = partition(arr, lo, hi)
    quick_sort(arr, lo, p - 1)
    quick_sort(arr, p + 1, hi)
    return arr`,
    },
    {
      label: "Partition (Lomuto)",
      code: `def partition(arr, lo, hi):
    pivot = arr[hi]
    i = lo                         # boundary of the "< pivot" region
    for j in range(lo, hi):
        if arr[j] < pivot:
            arr[i], arr[j] = arr[j], arr[i]
            i += 1
    arr[i], arr[hi] = arr[hi], arr[i]
    return i`,
    },
  ],

  "linear-search": [
    {
      label: "Linear search",
      code: `def linear_search(arr, target):
    for i, x in enumerate(arr):
        if x == target:
            return i        # first matching index
    return -1               # not found`,
    },
  ],

  "binary-search": [
    {
      label: "Binary search",
      code: `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2     # avoids overflow in other languages
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
    },
    {
      label: "bisect module",
      code: `import bisect

i = bisect.bisect_left(arr, target)   # first index where arr[i] >= target
bisect.insort(arr, target)            # insert, keeping the list sorted`,
    },
  ],

  bfs: [
    {
      label: "BFS (queue)",
      code: `from collections import deque

def bfs(graph, start):
    visited = {start}
    q = deque([start])
    order = []
    while q:
        node = q.popleft()
        order.append(node)
        for nxt in graph[node]:
            if nxt not in visited:
                visited.add(nxt)     # mark on enqueue, not on dequeue
                q.append(nxt)
    return order`,
    },
  ],

  dfs: [
    {
      label: "DFS (recursive)",
      code: `def dfs(graph, node, visited=None):
    if visited is None:
        visited = set()
    visited.add(node)
    for nxt in graph[node]:
        if nxt not in visited:
            dfs(graph, nxt, visited)
    return visited`,
    },
    {
      label: "DFS (iterative)",
      code: `def dfs_iter(graph, start):
    visited, stack = set(), [start]
    while stack:
        node = stack.pop()           # LIFO drives the depth-first order
        if node in visited:
            continue
        visited.add(node)
        stack.extend(graph[node])
    return visited`,
    },
  ],

  dijkstra: [
    {
      label: "Dijkstra (heap)",
      code: `import heapq

def dijkstra(graph, start):
    # graph: {node: [(neighbor, weight), ...]}
    dist = {start: 0}
    pq = [(0, start)]
    while pq:
        d, node = heapq.heappop(pq)
        if d > dist.get(node, float("inf")):
            continue                     # stale entry — already improved
        for nxt, w in graph[node]:
            nd = d + w
            if nd < dist.get(nxt, float("inf")):
                dist[nxt] = nd
                heapq.heappush(pq, (nd, nxt))
    return dist`,
    },
  ],

  "two-pointers": [
    {
      label: "Pair sum (sorted)",
      code: `def two_sum_sorted(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo < hi:
        s = arr[lo] + arr[hi]
        if s == target:
            return (lo, hi)
        if s < target:
            lo += 1          # need a larger sum
        else:
            hi -= 1          # need a smaller sum
    return None`,
    },
    {
      label: "In-place dedup",
      code: `def remove_dups(arr):
    if not arr:
        return 0
    slow = 0
    for fast in range(1, len(arr)):
        if arr[fast] != arr[slow]:
            slow += 1
            arr[slow] = arr[fast]
    return slow + 1          # length of the deduped prefix`,
    },
  ],

  "sliding-window": [
    {
      label: "Fixed window",
      code: `def max_sum(arr, k):
    window = sum(arr[:k])
    best = window
    for i in range(k, len(arr)):
        window += arr[i] - arr[i - k]   # slide: add new, drop old
        best = max(best, window)
    return best`,
    },
    {
      label: "Variable window",
      code: `def longest_unique(s):
    seen = {}
    left = best = 0
    for right, ch in enumerate(s):
        if ch in seen and seen[ch] >= left:
            left = seen[ch] + 1     # jump past the duplicate
        seen[ch] = right
        best = max(best, right - left + 1)
    return best`,
    },
  ],

  recursion: [
    {
      label: "Base + recursive case",
      code: `def factorial(n):
    if n <= 1:           # base case stops the recursion
        return 1
    return n * factorial(n - 1)`,
    },
    {
      label: "Memoized fib",
      code: `from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)`,
    },
  ],

  backtracking: [
    {
      label: "Subsets",
      code: `def subsets(nums):
    res = []
    def backtrack(start, path):
        res.append(path[:])           # record a copy of the current choice
        for i in range(start, len(nums)):
            path.append(nums[i])      # choose
            backtrack(i + 1, path)
            path.pop()                # un-choose (backtrack)
    backtrack(0, [])
    return res`,
    },
    {
      label: "Permutations",
      code: `def permutations(nums):
    res = []
    def backtrack(path, used):
        if len(path) == len(nums):
            res.append(path[:])
            return
        for i, x in enumerate(nums):
            if used[i]:
                continue
            used[i] = True
            backtrack(path + [x], used)
            used[i] = False
    backtrack([], [False] * len(nums))
    return res`,
    },
  ],

  "dynamic-programming": [
    {
      label: "Bottom-up (tabulation)",
      code: `def coin_change(coins, amount):
    dp = [0] + [float("inf")] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] != float("inf") else -1`,
    },
    {
      label: "Top-down (memoization)",
      code: `def climb_stairs(n, memo=None):
    if memo is None:
        memo = {}
    if n <= 2:
        return n
    if n not in memo:
        memo[n] = climb_stairs(n - 1, memo) + climb_stairs(n - 2, memo)
    return memo[n]`,
    },
  ],

  "consistent-hashing": [
    {
      label: "Hash ring",
      code: `import bisect, hashlib

class HashRing:
    def __init__(self, nodes=(), replicas=100):
        self.replicas = replicas      # virtual nodes smooth the load
        self.ring = {}
        self.keys = []
        for n in nodes:
            self.add(n)

    def _hash(self, key):
        return int(hashlib.md5(key.encode()).hexdigest(), 16)

    def add(self, node):
        for i in range(self.replicas):
            h = self._hash(f"{node}:{i}")
            self.ring[h] = node
            bisect.insort(self.keys, h)

    def get(self, key):
        if not self.ring:
            return None
        h = self._hash(key)
        i = bisect.bisect(self.keys, h) % len(self.keys)  # walk clockwise
        return self.ring[self.keys[i]]`,
    },
  ],

  "rate-limiting": [
    {
      label: "Token bucket",
      code: `import time

class TokenBucket:
    def __init__(self, capacity, refill_rate):
        self.capacity = capacity        # max burst size
        self.refill_rate = refill_rate  # tokens added per second
        self.tokens = capacity
        self.last = time.monotonic()

    def allow(self, cost=1):
        now = time.monotonic()
        # refill based on elapsed time, never exceeding capacity
        self.tokens = min(self.capacity,
                          self.tokens + (now - self.last) * self.refill_rate)
        self.last = now
        if self.tokens >= cost:
            self.tokens -= cost
            return True
        return False                    # rate limited`,
    },
  ],
};
