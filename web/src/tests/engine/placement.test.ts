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
    expect(placementResult([prob(4, true), prob(4, true), prob(5, true), prob(5, false), prob(6, false), prob(6, false)]).grade).toBe(5);
    expect(placementResult([prob(4, false), prob(4, false), prob(5, true), prob(5, true)]).grade).toBe(4);
  });
  it("one slip on a problem still counts it as right", () => {
    expect(placementResult([{ lessonId: one(2), wrong: 1, shown: 0 }, { lessonId: one(3), wrong: 1, shown: 0 }, { lessonId: one(4), wrong: 3, shown: 0 }]).grade).toBe(3);
  });
  it("everything right means the grade above the top one asked", () => {
    expect(placementResult([prob(6, true), prob(6, true), prob(7, true), prob(7, true)]).grade).toBe(8);
  });
});
