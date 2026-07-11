// One self-contained, runnable Python program per topic, keyed by slug.
// Each is copy-paste runnable in any Python 3 environment (stdlib only) and
// prints the operations it demonstrates. Inline `# =>` comments show the
// expected output. Verified by executing every program (see scripts).

export const CODE_SNIPPETS: Record<string, string> = {
  array: `
# Array operations on a Python list. Run as-is.
arr = [3, 1, 4, 1, 5]

arr.append(9)        # add to the end       -> O(1) amortized
arr.insert(0, 2)     # insert at the front  -> O(n), shifts right
arr[2] = 7           # overwrite by index   -> O(1)
arr.pop()            # remove from the end  -> O(1)
arr.pop(0)           # remove from front    -> O(n)
arr.remove(4)        # remove first 4       -> O(n)

print(arr)                      # => [3, 7, 1, 5]
print(len(arr))                 # => 4
print(5 in arr, arr.index(5))   # => True 3
`,

  "linked-list": `
# Singly linked list — insert, delete, search, reverse. Run as-is.
class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

class LinkedList:
    def __init__(self):
        self.head = None

    def insert_head(self, val):           # O(1)
        self.head = Node(val, self.head)

    def insert_tail(self, val):           # O(n)
        node = Node(val)
        if not self.head:
            self.head = node
            return
        cur = self.head
        while cur.next:
            cur = cur.next
        cur.next = node

    def remove(self, val):                # O(n) — sentinel avoids the head edge case
        dummy = Node(0, self.head)
        prev = dummy
        while prev.next:
            if prev.next.val == val:
                prev.next = prev.next.next
                break
            prev = prev.next
        self.head = dummy.next

    def search(self, val):                # O(n)
        cur = self.head
        while cur:
            if cur.val == val:
                return True
            cur = cur.next
        return False

    def reverse(self):                    # O(n)
        prev, cur = None, self.head
        while cur:
            cur.next, prev, cur = prev, cur, cur.next
        self.head = prev

    def to_list(self):
        out, cur = [], self.head
        while cur:
            out.append(cur.val)
            cur = cur.next
        return out

ll = LinkedList()
ll.insert_tail(1)
ll.insert_tail(2)
ll.insert_head(0)        # 0 -> 1 -> 2
print(ll.to_list())      # => [0, 1, 2]
ll.remove(1)             # 0 -> 2
print(ll.to_list())      # => [0, 2]
print(ll.search(2))      # => True
ll.reverse()             # 2 -> 0
print(ll.to_list())      # => [2, 0]
`,

  "doubly-linked-list": `
# Doubly linked list — O(1) removal once you hold the node.
class Node:
    def __init__(self, val):
        self.val = val
        self.prev = None
        self.next = None

class DoublyLinkedList:
    def __init__(self):
        self.head = None
        self.tail = None

    def push_back(self, val):
        node = Node(val)
        if not self.tail:
            self.head = self.tail = node
        else:
            node.prev = self.tail
            self.tail.next = node
            self.tail = node
        return node

    def remove(self, node):               # O(1) — rewire both neighbours
        if node.prev:
            node.prev.next = node.next
        else:
            self.head = node.next
        if node.next:
            node.next.prev = node.prev
        else:
            self.tail = node.prev

    def to_list(self):
        out, cur = [], self.head
        while cur:
            out.append(cur.val)
            cur = cur.next
        return out

dll = DoublyLinkedList()
dll.push_back(10)
mid = dll.push_back(20)
dll.push_back(30)
print(dll.to_list())     # => [10, 20, 30]
dll.remove(mid)          # unlink the middle node in O(1)
print(dll.to_list())     # => [10, 30]
`,

  stack: `
# Stack (LIFO) on a Python list.
stack = []
stack.append(10)     # push
stack.append(20)
stack.append(30)

print(stack[-1])     # peek => 30
print(stack.pop())   # => 30
print(stack.pop())   # => 20
print(stack)         # => [10]
print(not stack)     # empty? => False
`,

  queue: `
# Queue (FIFO) with collections.deque — O(1) at both ends.
from collections import deque

q = deque()
q.append(1)          # enqueue
q.append(2)
q.append(3)

print(q[0])          # peek front => 1
print(q.popleft())   # dequeue => 1
print(q.popleft())   # => 2
print(list(q))       # => [3]
`,

  "hash-table": `
# Hash table (dict) plus the handy collections helpers.
from collections import defaultdict, Counter

table = {}
table["a"] = 1
table["b"] = 2
table["a"] = 9            # update in place
print(table.get("a"))     # => 9
print(table.get("z", 0))  # missing key, default => 0
del table["b"]
print("b" in table)       # => False

groups = defaultdict(list)
for word in ["ant", "bee", "ax"]:
    groups[word[0]].append(word)
print(dict(groups))       # => {'a': ['ant', 'ax'], 'b': ['bee']}

print(Counter("banana"))  # => Counter({'a': 3, 'n': 2, 'b': 1})
`,

  "binary-search-tree": `
# Binary search tree — insert, search, in-order (sorted) traversal.
class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def insert(root, val):
    if root is None:
        return Node(val)
    if val < root.val:
        root.left = insert(root.left, val)
    elif val > root.val:
        root.right = insert(root.right, val)
    return root

def search(root, val):
    while root and root.val != val:
        root = root.left if val < root.val else root.right
    return root is not None

def inorder(root, out):
    if root:
        inorder(root.left, out)
        out.append(root.val)
        inorder(root.right, out)
    return out

root = None
for v in [5, 3, 8, 1, 4, 7]:
    root = insert(root, v)

print(inorder(root, []))   # => [1, 3, 4, 5, 7, 8]
print(search(root, 4))     # => True
print(search(root, 6))     # => False
`,

  heap: `
# Heap / priority queue with heapq (a min-heap).
import heapq

h = []
for x in [5, 1, 8, 3, 2]:
    heapq.heappush(h, x)

print(h[0])                  # peek min => 1
print(heapq.heappop(h))      # => 1
print(heapq.heappop(h))      # => 2
print(heapq.nlargest(2, h))  # => [8, 5]

# Max-heap trick: negate the values.
mh = []
for x in [5, 1, 8]:
    heapq.heappush(mh, -x)
print(-heapq.heappop(mh))    # => 8
`,

  trie: `
# Trie (prefix tree) built from nested dicts.
class Trie:
    def __init__(self):
        self.root = {}

    def insert(self, word):
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node["$"] = True            # end-of-word marker

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
        return True

t = Trie()
for w in ["cat", "car", "dog"]:
    t.insert(w)

print(t.search("cat"))        # => True
print(t.search("ca"))         # => False (prefix, not a full word)
print(t.starts_with("ca"))    # => True
print(t.starts_with("do"))    # => True
`,

  graph: `
# Graph as an adjacency list, with BFS and DFS traversals.
from collections import defaultdict, deque

graph = defaultdict(list)
for u, v in [(0, 1), (0, 2), (1, 3), (2, 3)]:
    graph[u].append(v)
    graph[v].append(u)          # undirected: link both ways

def bfs(start):
    seen, q, order = {start}, deque([start]), []
    while q:
        node = q.popleft()
        order.append(node)
        for nxt in graph[node]:
            if nxt not in seen:
                seen.add(nxt)
                q.append(nxt)
    return order

def dfs(node, seen, order):
    seen.add(node)
    order.append(node)
    for nxt in graph[node]:
        if nxt not in seen:
            dfs(nxt, seen, order)
    return order

print(bfs(0))             # => [0, 1, 2, 3]
print(dfs(0, set(), []))  # => [0, 1, 3, 2]
`,

  "union-find": `
# Union-Find (disjoint set) with path compression + union by rank.
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]   # path compression
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False           # already connected
        if self.rank[ra] < self.rank[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1
        return True

uf = UnionFind(5)
uf.union(0, 1)
uf.union(2, 3)
uf.union(1, 3)
print(uf.find(0) == uf.find(2))   # => True  (0-1-3-2 all joined)
print(uf.find(0) == uf.find(4))   # => False (4 stands alone)
print(uf.union(0, 2))             # already joined => False
`,

  "bubble-sort": `
# Bubble sort — repeatedly swap adjacent out-of-order pairs, with early exit.
def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:        # nothing moved this pass -> already sorted
            break
    return arr

print(bubble_sort([5, 2, 9, 1, 5, 6]))   # => [1, 2, 5, 5, 6, 9]
`,

  "selection-sort": `
# Selection sort — each pass selects the smallest remaining element.
def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        lo = i
        for j in range(i + 1, n):
            if arr[j] < arr[lo]:
                lo = j
        arr[i], arr[lo] = arr[lo], arr[i]
    return arr

print(selection_sort([64, 25, 12, 22, 11]))   # => [11, 12, 22, 25, 64]
`,

  "insertion-sort": `
# Insertion sort — grow a sorted prefix, inserting each element into place.
def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]    # shift larger elements right
            j -= 1
        arr[j + 1] = key
    return arr

print(insertion_sort([5, 2, 4, 6, 1, 3]))   # => [1, 2, 3, 4, 5, 6]
`,

  "merge-sort": `
# Merge sort — divide in half, sort each, merge. Stable, O(n log n).
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(a, b):
    out, i, j = [], 0, 0
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:           # <= keeps equal elements stable
            out.append(a[i]); i += 1
        else:
            out.append(b[j]); j += 1
    out.extend(a[i:])
    out.extend(b[j:])
    return out

print(merge_sort([5, 2, 9, 1, 5, 6]))   # => [1, 2, 5, 5, 6, 9]
`,

  "quick-sort": `
# Quick sort — partition around a pivot (Lomuto scheme), recurse on halves.
def quick_sort(arr, lo=0, hi=None):
    if hi is None:
        hi = len(arr) - 1
    if lo >= hi:
        return arr
    p = partition(arr, lo, hi)
    quick_sort(arr, lo, p - 1)
    quick_sort(arr, p + 1, hi)
    return arr

def partition(arr, lo, hi):
    pivot = arr[hi]
    i = lo                         # boundary of the "< pivot" region
    for j in range(lo, hi):
        if arr[j] < pivot:
            arr[i], arr[j] = arr[j], arr[i]
            i += 1
    arr[i], arr[hi] = arr[hi], arr[i]
    return i

print(quick_sort([5, 2, 9, 1, 5, 6]))   # => [1, 2, 5, 5, 6, 9]
`,

  "linear-search": `
# Linear search — scan until found.
def linear_search(arr, target):
    for i, x in enumerate(arr):
        if x == target:
            return i        # first matching index
    return -1

nums = [4, 2, 7, 1, 9, 3]
print(linear_search(nums, 7))    # => 2
print(linear_search(nums, 5))    # => -1 (not present)
`,

  "binary-search": `
# Binary search — halve the range each step. Requires a sorted array.
def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2
        if arr[mid] == target:
            return mid
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

arr = [1, 3, 5, 7, 9, 11]
print(binary_search(arr, 7))     # => 3
print(binary_search(arr, 8))     # => -1 (not present)
`,

  bfs: `
# Breadth-first search — explores level by level using a queue.
from collections import deque

graph = {
    0: [1, 2],
    1: [0, 3, 4],
    2: [0, 4],
    3: [1],
    4: [1, 2],
}

def bfs(start):
    seen, q, order = {start}, deque([start]), []
    while q:
        node = q.popleft()
        order.append(node)
        for nxt in graph[node]:
            if nxt not in seen:
                seen.add(nxt)        # mark on enqueue, not dequeue
                q.append(nxt)
    return order

print(bfs(0))    # => [0, 1, 2, 3, 4]
`,

  dfs: `
# Depth-first search — recursive and iterative versions agree.
graph = {
    0: [1, 2],
    1: [0, 3, 4],
    2: [0, 4],
    3: [1],
    4: [1, 2],
}

def dfs(node, seen, order):
    seen.add(node)
    order.append(node)
    for nxt in graph[node]:
        if nxt not in seen:
            dfs(nxt, seen, order)
    return order

def dfs_iter(start):
    seen, stack, order = set(), [start], []
    while stack:
        node = stack.pop()
        if node in seen:
            continue
        seen.add(node)
        order.append(node)
        for nxt in reversed(graph[node]):   # reversed -> lowest neighbour first
            stack.append(nxt)
    return order

print(dfs(0, set(), []))   # => [0, 1, 3, 4, 2]
print(dfs_iter(0))         # => [0, 1, 3, 4, 2]
`,

  dijkstra: `
# Dijkstra's shortest paths from a source (non-negative weights).
import heapq

graph = {
    "A": [("B", 1), ("C", 4)],
    "B": [("C", 2), ("D", 5)],
    "C": [("D", 1)],
    "D": [],
}

def dijkstra(start):
    dist = {start: 0}
    pq = [(0, start)]
    while pq:
        d, node = heapq.heappop(pq)
        if d > dist.get(node, float("inf")):
            continue                       # stale entry — already improved
        for nxt, w in graph[node]:
            nd = d + w
            if nd < dist.get(nxt, float("inf")):
                dist[nxt] = nd
                heapq.heappush(pq, (nd, nxt))
    return dist

print(dijkstra("A"))   # => {'A': 0, 'B': 1, 'C': 3, 'D': 4}
`,

  "bellman-ford": `
# Bellman-Ford — shortest paths with possible negative edges.
# edges: list of (u, v, weight); relax all edges V-1 times.

def bellman_ford(nodes, edges, start):
    dist = {n: float("inf") for n in nodes}
    dist[start] = 0
    for _ in range(len(nodes) - 1):
        changed = False
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                changed = True
        if not changed:
            break                          # converged early
    # one more pass: any relaxation ⇒ negative cycle
    for u, v, w in edges:
        if dist[u] + w < dist[v]:
            raise ValueError("negative cycle")
    return dist

nodes = ["A", "B", "C", "D"]
edges = [("A", "B", 1), ("B", "C", -2), ("A", "C", 4), ("C", "D", 2)]
print(bellman_ford(nodes, edges, "A"))   # => {'A': 0, 'B': 1, 'C': -1, 'D': 1}
`,

  prim: `
# Prim's MST — grow a tree by always taking the cheapest crossing edge.
import heapq

graph = {
    "A": [("B", 4), ("C", 3)],
    "B": [("A", 4), ("D", 5)],
    "C": [("A", 3), ("D", 8)],
    "D": [("B", 5), ("C", 8)],
}

def prim(start):
    in_tree = {start}
    pq = [(w, start, to) for to, w in graph[start]]   # (weight, from, to)
    heapq.heapify(pq)
    mst, total = [], 0
    while pq and len(in_tree) < len(graph):
        w, a, b = heapq.heappop(pq)
        if b in in_tree:
            continue                        # stale — both ends already in
        in_tree.add(b)
        mst.append((a, b, w))
        total += w
        for to, ww in graph[b]:
            if to not in in_tree:
                heapq.heappush(pq, (ww, b, to))
    return mst, total

print(prim("A"))   # => ([('A', 'C', 3), ('A', 'B', 4), ('B', 'D', 5)], 12)
`,

  "two-pointers": `
# Two pointers — pair sum in a sorted array, and in-place dedup.
def two_sum_sorted(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo < hi:
        s = arr[lo] + arr[hi]
        if s == target:
            return (lo, hi)
        if s < target:
            lo += 1          # need a larger sum
        else:
            hi -= 1          # need a smaller sum
    return None

def dedup(arr):
    if not arr:
        return 0
    slow = 0
    for fast in range(1, len(arr)):
        if arr[fast] != arr[slow]:
            slow += 1
            arr[slow] = arr[fast]
    return slow + 1          # length of the deduped prefix

print(two_sum_sorted([1, 2, 4, 7, 11], 9))   # => (1, 3)
nums = [1, 1, 2, 2, 2, 3]
k = dedup(nums)
print(k, nums[:k])                           # => 3 [1, 2, 3]
`,

  "sliding-window": `
# Sliding window — fixed-size max sum, and longest substring without repeats.
def max_sum(arr, k):
    window = sum(arr[:k])
    best = window
    for i in range(k, len(arr)):
        window += arr[i] - arr[i - k]   # slide: add the new, drop the old
        best = max(best, window)
    return best

def longest_unique(s):
    seen = {}
    left = best = 0
    for right, ch in enumerate(s):
        if ch in seen and seen[ch] >= left:
            left = seen[ch] + 1     # jump past the duplicate
        seen[ch] = right
        best = max(best, right - left + 1)
    return best

print(max_sum([2, 1, 5, 1, 3, 2], 3))   # => 9  (window [5, 1, 3])
print(longest_unique("abcabcbb"))       # => 3  ("abc")
`,

  recursion: `
# Recursion — base case + recursive case, plus memoized Fibonacci.
from functools import lru_cache

def factorial(n):
    if n <= 1:           # base case stops the recursion
        return 1
    return n * factorial(n - 1)

@lru_cache(maxsize=None)
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(factorial(5))                  # => 120
print([fib(i) for i in range(10)])   # => [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
`,

  backtracking: `
# Backtracking — generate every subset and every permutation.
def subsets(nums):
    res = []
    def backtrack(start, path):
        res.append(path[:])           # record a copy of the current choice
        for i in range(start, len(nums)):
            path.append(nums[i])      # choose
            backtrack(i + 1, path)
            path.pop()                # un-choose
    backtrack(0, [])
    return res

def permutations(nums):
    res = []
    def backtrack(path, used):
        if len(path) == len(nums):
            res.append(path[:])
            return
        for i in range(len(nums)):
            if used[i]:
                continue
            used[i] = True
            backtrack(path + [nums[i]], used)
            used[i] = False
    backtrack([], [False] * len(nums))
    return res

print(subsets([1, 2, 3]))
# => [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]
print(permutations([1, 2, 3]))
# => [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]
`,

  "dynamic-programming": `
# Dynamic programming — bottom-up coin change and top-down climbing stairs.
def coin_change(coins, amount):
    dp = [0] + [float("inf")] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a:
                dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] != float("inf") else -1

def climb_stairs(n, memo=None):
    if memo is None:
        memo = {}
    if n <= 2:
        return n
    if n not in memo:
        memo[n] = climb_stairs(n - 1, memo) + climb_stairs(n - 2, memo)
    return memo[n]

print(coin_change([1, 2, 5], 11))   # => 3   (5 + 5 + 1)
print(climb_stairs(10))             # => 89
`,

  dns: `
# Toy DNS resolver with a TTL-based cache — the second lookup skips the walk.
import time

class DnsCache:
    def __init__(self):
        self.store = {}  # name -> (ip, expires_at)

    def resolve(self, name, walk_hierarchy):
        hit = self.store.get(name)
        if hit and hit[1] > time.monotonic():
            return hit[0], "cache hit"
        ip, ttl = walk_hierarchy(name)   # root -> TLD -> authoritative NS
        self.store[name] = (ip, time.monotonic() + ttl)
        return ip, "cache miss — walked the hierarchy and cached"

def walk_hierarchy(name):
    return "93.184.216.34", 8   # pretend authoritative answer, 8s TTL

cache = DnsCache()
print(cache.resolve("example.com", walk_hierarchy))  # => ('93.184.216.34', 'cache miss — walked the hierarchy and cached')
print(cache.resolve("example.com", walk_hierarchy))  # => ('93.184.216.34', 'cache hit')
`,

  "consistent-hashing": `
# Consistent hashing ring with virtual nodes (replicas) for even spread.
import bisect, hashlib

class HashRing:
    def __init__(self, nodes=(), replicas=100):
        self.replicas = replicas
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
        i = bisect.bisect(self.keys, h) % len(self.keys)   # first node clockwise
        return self.ring[self.keys[i]]

ring = HashRing(["node-A", "node-B", "node-C"])
print(ring.get("user-42"))                            # => node-C (deterministic)
print(ring.get("user-42") == ring.get("user-42"))     # => True (stable mapping)
`,

  "rate-limiting": `
# Token bucket rate limiter — refills over time, allows controlled bursts.
import time

class TokenBucket:
    def __init__(self, capacity, refill_rate):
        self.capacity = capacity        # max burst size
        self.refill_rate = refill_rate  # tokens added per second
        self.tokens = capacity
        self.last = time.monotonic()

    def allow(self, cost=1):
        now = time.monotonic()
        # refill based on elapsed time, capped at capacity
        self.tokens = min(self.capacity,
                          self.tokens + (now - self.last) * self.refill_rate)
        self.last = now
        if self.tokens >= cost:
            self.tokens -= cost
            return True
        return False                    # rate limited

bucket = TokenBucket(capacity=3, refill_rate=1)   # 3 burst, ~1 token/sec
print([bucket.allow() for _ in range(5)])   # => [True, True, True, False, False]
`,
};
