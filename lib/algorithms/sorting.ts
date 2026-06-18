export type SortItem = { id: number; value: number };

export interface SortFrame {
  items: SortItem[];
  compare?: number[]; // ids being compared
  active?: number[]; // ids being written/moved
  pivot?: number; // id of pivot
  sorted?: number[]; // ids locked in final position
  note: string;
}

export type SortKey =
  | "bubble-sort"
  | "selection-sort"
  | "insertion-sort"
  | "merge-sort"
  | "quick-sort";

const clone = (items: SortItem[]) => items.map((x) => ({ ...x }));

export function makeSortData(n = 11, seed = 7): SortItem[] {
  const vals: number[] = [];
  let s = seed;
  for (let i = 0; i < n; i++) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    vals.push((s % 90) + 8);
  }
  return vals.map((value, id) => ({ id, value }));
}

export function generateSortFrames(key: SortKey, input: SortItem[]): SortFrame[] {
  switch (key) {
    case "bubble-sort":
      return bubble(input);
    case "selection-sort":
      return selection(input);
    case "insertion-sort":
      return insertion(input);
    case "merge-sort":
      return merge(input);
    case "quick-sort":
      return quick(input);
  }
}

function bubble(input: SortItem[]): SortFrame[] {
  const a = clone(input);
  const frames: SortFrame[] = [];
  const sorted: number[] = [];
  frames.push({ items: clone(a), note: "Unsorted input. Compare each adjacent pair." });
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      frames.push({
        items: clone(a),
        compare: [a[j].id, a[j + 1].id],
        sorted: [...sorted],
        note: `Compare ${a[j].value} and ${a[j + 1].value}.`,
      });
      if (a[j].value > a[j + 1].value) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
        frames.push({
          items: clone(a),
          active: [a[j].id, a[j + 1].id],
          sorted: [...sorted],
          note: `Swap — ${a[j].value} bubbles right.`,
        });
      }
    }
    sorted.unshift(a[n - i - 1].id);
    if (!swapped) break;
  }
  frames.push({ items: clone(a), sorted: a.map((x) => x.id), note: "Sorted." });
  return frames;
}

function selection(input: SortItem[]): SortFrame[] {
  const a = clone(input);
  const frames: SortFrame[] = [];
  const sorted: number[] = [];
  const n = a.length;
  frames.push({ items: clone(a), note: "Find the minimum of the unsorted region." });
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      frames.push({
        items: clone(a),
        compare: [a[j].id, a[min].id],
        active: [a[min].id],
        sorted: [...sorted],
        note: `Scanning for min — current min is ${a[min].value}.`,
      });
      if (a[j].value < a[min].value) min = j;
    }
    if (min !== i) [a[i], a[min]] = [a[min], a[i]];
    sorted.push(a[i].id);
    frames.push({
      items: clone(a),
      active: [a[i].id],
      sorted: [...sorted],
      note: `Place ${a[i].value} at position ${i}.`,
    });
  }
  frames.push({ items: clone(a), sorted: a.map((x) => x.id), note: "Sorted." });
  return frames;
}

function insertion(input: SortItem[]): SortFrame[] {
  const a = clone(input);
  const frames: SortFrame[] = [];
  const n = a.length;
  frames.push({ items: clone(a), sorted: [a[0].id], note: "First element is a sorted region of one." });
  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    frames.push({
      items: clone(a),
      active: [key.id],
      sorted: a.slice(0, i).map((x) => x.id),
      note: `Take ${key.value}, slide it left into place.`,
    });
    while (j >= 0 && a[j].value > key.value) {
      frames.push({
        items: clone(a),
        compare: [a[j].id, key.id],
        active: [key.id],
        note: `${a[j].value} > ${key.value} — shift right.`,
      });
      a[j + 1] = a[j];
      j--;
    }
    a[j + 1] = key;
    frames.push({
      items: clone(a),
      active: [key.id],
      sorted: a.slice(0, i + 1).map((x) => x.id),
      note: `Insert ${key.value}.`,
    });
  }
  frames.push({ items: clone(a), sorted: a.map((x) => x.id), note: "Sorted." });
  return frames;
}

function merge(input: SortItem[]): SortFrame[] {
  const a = clone(input);
  const frames: SortFrame[] = [];
  frames.push({ items: clone(a), note: "Divide the array down to single elements, then merge." });

  function mergeSort(lo: number, hi: number) {
    if (hi - lo <= 1) return;
    const mid = (lo + hi) >> 1;
    frames.push({
      items: clone(a),
      active: range(lo, hi).map((i) => a[i].id),
      note: `Split [${lo}, ${hi - 1}] at ${mid}.`,
    });
    mergeSort(lo, mid);
    mergeSort(mid, hi);

    const left = a.slice(lo, mid);
    const right = a.slice(mid, hi);
    let i = 0,
      j = 0,
      k = lo;
    while (i < left.length && j < right.length) {
      frames.push({
        items: clone(a),
        compare: [left[i].id, right[j].id],
        note: `Merge: compare ${left[i].value} and ${right[j].value}.`,
      });
      if (left[i].value <= right[j].value) a[k++] = left[i++];
      else a[k++] = right[j++];
      frames.push({ items: clone(a), active: [a[k - 1].id], note: `Place ${a[k - 1].value}.` });
    }
    while (i < left.length) {
      a[k++] = left[i++];
      frames.push({ items: clone(a), active: [a[k - 1].id], note: `Place ${a[k - 1].value}.` });
    }
    while (j < right.length) {
      a[k++] = right[j++];
      frames.push({ items: clone(a), active: [a[k - 1].id], note: `Place ${a[k - 1].value}.` });
    }
    frames.push({
      items: clone(a),
      sorted: range(lo, hi).map((i2) => a[i2].id),
      note: `Merged [${lo}, ${hi - 1}].`,
    });
  }

  mergeSort(0, a.length);
  frames.push({ items: clone(a), sorted: a.map((x) => x.id), note: "Sorted." });
  return frames;
}

function quick(input: SortItem[]): SortFrame[] {
  const a = clone(input);
  const frames: SortFrame[] = [];
  const sorted: number[] = [];
  frames.push({ items: clone(a), note: "Pick a pivot (last element); partition around it." });

  function qs(lo: number, hi: number) {
    if (lo >= hi) {
      if (lo === hi) sorted.push(a[lo].id);
      return;
    }
    const pivot = a[hi];
    let i = lo;
    frames.push({
      items: clone(a),
      pivot: pivot.id,
      sorted: [...sorted],
      note: `Pivot = ${pivot.value}. Partition [${lo}, ${hi}].`,
    });
    for (let j = lo; j < hi; j++) {
      frames.push({
        items: clone(a),
        pivot: pivot.id,
        compare: [a[j].id, pivot.id],
        active: [a[i].id],
        sorted: [...sorted],
        note: `Is ${a[j].value} < ${pivot.value}?`,
      });
      if (a[j].value < pivot.value) {
        [a[i], a[j]] = [a[j], a[i]];
        frames.push({
          items: clone(a),
          pivot: pivot.id,
          active: [a[i].id],
          sorted: [...sorted],
          note: `Yes — move ${a[i].value} into the smaller region.`,
        });
        i++;
      }
    }
    [a[i], a[hi]] = [a[hi], a[i]];
    sorted.push(a[i].id);
    frames.push({
      items: clone(a),
      active: [a[i].id],
      sorted: [...sorted],
      note: `Pivot ${a[i].value} is now in its final position.`,
    });
    qs(lo, i - 1);
    qs(i + 1, hi);
  }

  qs(0, a.length - 1);
  frames.push({ items: clone(a), sorted: a.map((x) => x.id), note: "Sorted." });
  return frames;
}

function range(lo: number, hi: number) {
  return Array.from({ length: hi - lo }, (_, i) => lo + i);
}
