import { describe, expect, it } from "vitest";
import { todayPlan } from "../../app/today";
import { entriesInGrade, isReady } from "../../app/curriculum";
import { emptyProgress, type Progress } from "../../engine/mastery/progress";

const now = Date.UTC(2026, 9, 3, 15);
const base = (p: Partial<Progress> = {}): Progress => ({ ...emptyProgress(), grade: 5, chosen: true, ...p });

describe("today's plan", () => {
  it("starts with the first lesson not done yet", () => {
    const plan = todayPlan(base(), 5, now, false);
    const first = entriesInGrade(5).find(c => isReady(c.id))!;
    expect(plan).toEqual([expect.objectContaining({ kind: "lesson", id: first.id, done: false })]);
  });
  it("marks today's lesson done and adds review when there's enough to review", () => {
    const first = entriesInGrade(5).find(c => isReady(c.id))!;
    const p = base({ lessons: { [first.id]: 1 }, log: [{ key: first.id, mode: "practice", title: first.title, date: now - 3600e3, level: 3, total: 8, hints: 0, shown: 0, cats: {}, rushed: 0 }] });
    const plan = todayPlan(p, 5, now, true);
    expect(plan[0]).toEqual(expect.objectContaining({ kind: "lesson", id: first.id, done: true }));
    expect(plan[1]).toEqual(expect.objectContaining({ kind: "review", done: false }));
  });
  it("offers a unit test once every lesson in a unit is done", () => {
    const unit = entriesInGrade(5).filter(c => c.unit === entriesInGrade(5)[0]!.unit);
    const p = base({ lessons: Object.fromEntries(unit.map(c => [c.id, 1])) });
    expect(todayPlan(p, 5, now, false).some(i => i.kind === "test" && i.unit === unit[0]!.unit)).toBe(true);
  });
});
