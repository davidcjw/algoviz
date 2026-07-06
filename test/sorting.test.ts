import { describe, it, expect } from "vitest";
import {
  generateSortFrames,
  makeSortData,
  type SortKey,
  type SortItem,
} from "../lib/algorithms/sorting";

const KEYS: SortKey[] = [
  "bubble-sort",
  "selection-sort",
  "insertion-sort",
  "merge-sort",
  "quick-sort",
];

const isSortedAscending = (items: SortItem[]) =>
  items.every((x, i) => i === 0 || items[i - 1].value <= x.value);

const idMultiset = (items: SortItem[]) => [...items.map((x) => x.id)].sort((a, b) => a - b);

describe("generateSortFrames", () => {
  for (const key of KEYS) {
    describe(key, () => {
      const input = makeSortData();
      const frames = generateSortFrames(key, input);

      it("produces at least one frame", () => {
        expect(frames.length).toBeGreaterThan(0);
      });

      it("ends with items sorted ascending by value", () => {
        const final = frames[frames.length - 1];
        expect(isSortedAscending(final.items)).toBe(true);
      });

      it("preserves the exact multiset of input ids in the final frame", () => {
        const final = frames[frames.length - 1];
        expect(idMultiset(final.items)).toEqual(idMultiset(input));
      });

      it("keeps the same length across every frame", () => {
        for (const frame of frames) {
          expect(frame.items.length).toBe(input.length);
        }
      });
    });
  }
});

describe("makeSortData", () => {
  it("is deterministic for a fixed seed", () => {
    expect(makeSortData(11, 42)).toEqual(makeSortData(11, 42));
  });

  it("honours n", () => {
    expect(makeSortData(5, 7)).toHaveLength(5);
    expect(makeSortData(20, 7)).toHaveLength(20);
  });

  it("produces different output for different seeds", () => {
    expect(makeSortData(11, 1)).not.toEqual(makeSortData(11, 2));
  });
});
