import { describe, expect, it } from "vitest";
import { unitsInGrade, isReady } from "../../app/curriculum";
import { createRng } from "../../curriculum/generators/rng";
import { pickShowcase, showcasePicture } from "../../screens/Welcome";

const tall = (d: { kind: string }) => d.kind === "chain";

describe("showcase pictures", () => {
  it("never puts a ladder of math lines on a landing or year-page tile", () => {
    for (let seed = 1; seed <= 40; seed++) {
      const rng = createRng(seed);
      for (const s of pickShowcase(rng)) expect(tall(s.ex.diagram as never)).toBe(false);
      for (let g = 0; g <= 12; g++) for (const u of unitsInGrade(g)) for (const c of u.entries) {
        const pic = isReady(c.id) ? showcasePicture(c.id, rng) : null;
        if (pic) expect(tall(pic.diagram as never)).toBe(false);
      }
    }
  });
  it("still finds a picture for nearly every unit", () => {
    const rng = createRng(7);
    const missing: string[] = [];
    for (let g = 0; g <= 12; g++) for (const u of unitsInGrade(g))
      if (!u.entries.some(c => isReady(c.id) && showcasePicture(c.id, rng))) missing.push(`${g} ${u.name}`);
    expect(missing.length).toBeLessThanOrEqual(3);
  });
});
