import { describe, it, expect } from "vitest";
import {
  PILLARS,
  TOPICS,
  TOPICS_BY_SLUG,
  topicsByPillar,
  pillarStats,
  type Pillar,
} from "../lib/content";

const PILLAR_KEYS = Object.keys(PILLARS) as Pillar[];

describe("content", () => {
  it("has a unique slug for every topic", () => {
    const slugs = TOPICS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("assigns every topic a pillar that is one of the three PILLARS keys", () => {
    expect(PILLAR_KEYS).toHaveLength(3);
    for (const t of TOPICS) {
      expect(PILLAR_KEYS).toContain(t.pillar);
    }
  });

  it("has a TOPICS_BY_SLUG entry for every topic", () => {
    for (const t of TOPICS) {
      expect(TOPICS_BY_SLUG[t.slug]).toBe(t);
    }
    expect(Object.keys(TOPICS_BY_SLUG)).toHaveLength(TOPICS.length);
  });

  it("returns only topics of the requested pillar from topicsByPillar", () => {
    for (const p of PILLAR_KEYS) {
      const topics = topicsByPillar(p);
      expect(topics.length).toBeGreaterThan(0);
      for (const t of topics) {
        expect(t.pillar).toBe(p);
      }
    }
  });

  it("has pillarStats counts that sum to TOPICS.length", () => {
    const total = pillarStats().reduce((sum, s) => sum + s.count, 0);
    expect(total).toBe(TOPICS.length);
  });
});
