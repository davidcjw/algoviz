import { describe, it, expect } from "vitest";
import { seeded, lerp } from "../lib/utils";

describe("seeded", () => {
  it("is deterministic for a fixed seed", () => {
    const a = seeded(123);
    const b = seeded(123);
    const seqA = Array.from({ length: 20 }, () => a());
    const seqB = Array.from({ length: 20 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it("stays within [0, 1)", () => {
    const rand = seeded(999);
    for (let i = 0; i < 1000; i++) {
      const v = rand();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe("lerp", () => {
  it("returns a at t=0", () => {
    expect(lerp(3, 9, 0)).toBe(3);
  });

  it("returns b at t=1", () => {
    expect(lerp(3, 9, 1)).toBe(9);
  });
});
