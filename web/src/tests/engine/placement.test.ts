import { describe, expect, it } from "vitest";
import { placementGrades, placementResult, startTest, placeKey } from "../../engine/session/practice";
import { lessonsInGrade } from "../../curriculum/registry";
import { emptyProgress } from "../../engine/mastery/progress";
import { createRng } from "../../curriculum/generators/rng";

const one = (g: number) => lessonsInGrade(g)[0]!.id;
const prob = (g: number, right: boolean) => ({ lessonId: one(g), wrong: right ? 0 : 2, shown: 0 });

describe("find my level", () => {
  it("asks three problems from each grade around the one picked, easiest first", () => {
    const s = startTest(placeKey(6), emptyProgress(), { rng: createRng(3), now: 0 } as never);
    expect(s.title).toBe("Find my level");
    expect(s.items).toHaveLength(placementGrades(6).length * 3);
    expect(s.hintsLeft).toBe(0);
  });
  it("lands on the last grade before the right answers stop", () => {
    expect(placementResult([prob(4, true), prob(4, true), prob(5, true), prob(5, false), prob(6, false), prob(6, false)]).grade).toBe(4);
    expect(placementResult([prob(4, true), prob(4, true), prob(5, true), prob(5, true), prob(6, false), prob(6, false)]).grade).toBe(5);
  });
  it("a grade needs 2 of its 3 right", () => {
    const rows = (r5: number) => [prob(4, true), prob(4, true), prob(4, true), ...[0, 1, 2].map(i => prob(5, i < r5)), prob(6, false), prob(6, false), prob(6, false)];
    expect(placementResult(rows(1)).grade).toBe(4);
    expect(placementResult(rows(2)).grade).toBe(5);
  });
  it("one slip counts only on a long problem", () => {
    const slip = (g: number, steps: number) => ({ lessonId: one(g), wrong: 1, shown: 0, work: Array(steps).fill(0) });
    expect(placementResult([slip(3, 2), slip(3, 2), slip(3, 2)]).rows[0]!.right).toBe(0);
    expect(placementResult([slip(3, 4), slip(3, 4), slip(3, 4)]).rows[0]!.right).toBe(3);
    expect(placementResult([{ lessonId: one(3), wrong: 0, shown: 1 }]).rows[0]!.right).toBe(0);
  });
  it("a 2nd grader who slips on every problem no longer climbs to 4th grade", () => {
    // three-step problems with one wrong step each: none count as right
    const p = (g: number) => ({ lessonId: one(g), wrong: 1, shown: 0, work: [0, 0, 0] });
    const run = [0, 1, 2, 3].flatMap(g => [p(g), p(g), p(g)]);
    expect(placementResult(run, 2)).toMatchObject({ grade: 1, next: null });
    // right on the easier grades, the same slips from 2nd grade up
    const mixed = [0, 1].flatMap(g => [prob(g, true), prob(g, true), prob(g, true)]).concat([2, 3].flatMap(g => [prob(g, true), p(g), prob(g, true)]));
    expect(placementResult(mixed, 2)).toMatchObject({ grade: 3, next: null });
  });
  it("a perfect run lands one grade above the pick, and offers the next grade instead of jumping to it", () => {
    const run = [0, 1, 2, 3].flatMap(g => [prob(g, true), prob(g, true), prob(g, true)]);
    expect(placementResult(run, 2)).toMatchObject({ grade: 3, next: 4 });
    expect(placementResult([prob(6, true), prob(6, true), prob(7, true), prob(7, true)]).grade).toBe(7);
  });
  it("missing everything drops one grade below the pick, not two", () => {
    const run = [0, 1, 2, 3].flatMap(g => [prob(g, false), prob(g, false), prob(g, false)]);
    expect(placementResult(run, 2).grade).toBe(1);
    const kOnly = [0, 1].flatMap(g => [prob(g, false), prob(g, false), prob(g, false)]);
    expect(placementResult(kOnly, 0).grade).toBe(0);
  });
});
