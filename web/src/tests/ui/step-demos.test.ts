import { describe, expect, it } from "vitest";
import { createRng } from "../../curriculum/generators/rng";
import { SLIPS, SOLVES } from "../../components/StepDemos";

describe("landing step demos", () => {
  it("every random demo is well formed, and slips are really wrong", () => {
    for (let seed = 1; seed <= 300; seed++) {
      const rng = createRng(seed);
      for (const make of SOLVES) { const d = make(rng); expect(d.rows.length).toBeGreaterThanOrEqual(2); expect(JSON.stringify(d)).not.toMatch(/NaN|Infinity/); }
      for (const make of SLIPS) { const d = make(rng); expect(JSON.stringify(d.wrong)).not.toBe(JSON.stringify(d.right)); expect(JSON.stringify(d)).not.toMatch(/NaN|Infinity/); }
    }
  });
});
