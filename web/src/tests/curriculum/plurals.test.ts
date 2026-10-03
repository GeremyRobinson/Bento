import { describe, expect, it } from "vitest";
import { LESSONS } from "../../curriculum/registry";
import { createRng } from "../../curriculum/generators/rng";

// words that end in s but aren't plurals
const OK = new Set(["is", "was", "has", "plus", "minus", "less", "its", "this", "as", "us", "times", "axis", "focus", "radius", "always", "yes", "gets", "goes", "makes", "fits", "means", "equals", "comes", "stays", "becomes", "shows", "takes", "gives", "lands", "moves", "points", "says", "needs", "uses", "counts", "jumps", "hops", "turns", "works", "matches", "fills", "does", "leaves", "keeps", "sits", "starts", "ends", "adds", "tells", "stands", "across", "less", "times"]);

const strings = (v: unknown, out: string[] = []): string[] => {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach(x => strings(x, out));
  else if (v && typeof v === "object") Object.values(v).forEach(x => strings(x, out));
  return out;
};

describe("no '1 dots' anywhere a child can see or hear it", () => {
  it.each(LESSONS.map(l => [l.id, l] as const))("%s", (_id, lesson) => {
    const rng = createRng(5), bad = new Set<string>();
    for (let i = 0; i < 60; i++) {
      const p = lesson.generate(rng, i % 10), model = lesson.answers(p);
      const texts = strings([
        model.steps.map(s => [s.question, s.hint, s.explain, s.note, s.known.map(k => k.message)]),
        lesson.explain(p, model), lesson.picture?.(p), lesson.story?.(p), lesson.displayNote?.(p),
      ]);
      for (const t of texts) for (const m of t.matchAll(/(?<![\d.,/\-−])\b1 ([a-z]+s)\b/g)) if (!OK.has(m[1]!)) bad.add(`${m[0]}  ←  ${t.slice(0, 90)}`);
    }
    expect([...bad]).toEqual([]);
  });
});

describe("singular", () => {
  it("fixes counts of one and leaves the rest", async () => {
    const { singular } = await import("../../curriculum/plural");
    expect(singular("Cross out 1 dots")).toBe("Cross out 1 dot");
    expect(singular("1 blocks are shaded, 1 are left")).toBe("1 block is shaded, 1 is left");
    expect(singular("4 groups of 1 pieces, 1 boxes, 1 copies")).toBe("4 groups of 1 piece, 1 box, 1 copy");
    expect(singular("11 dots, 0.1 tens, 9 + 1 makes 10, −1 dots")).toBe("11 dots, 0.1 tens, 9 + 1 makes 10, −1 dots");
  });
});
