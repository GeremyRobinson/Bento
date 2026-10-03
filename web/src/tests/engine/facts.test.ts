import { describe, expect, it } from "vitest";
import { TABLES, factKey, tablesForGrade } from "../../engine/facts/tables";
import { KNOWN, finishSprint, pickSprint, updateFact } from "../../engine/facts/mastery";
import { createRng } from "../../curriculum/generators/rng";
import { emptyProgress } from "../../engine/mastery/progress";
import { todayPlan } from "../../app/today";

const DAY = 864e5;

describe("fact tables", () => {
  it("every fact's answer matches its question", () => {
    for (const t of TABLES) for (const f of t.facts) {
      const q = f.ask.replace(/−/g, "-").replace(/×/g, "*").replace(/÷/g, "/").replace(/[()]/g, "");
      if (/^-?\d+ [-+*/] -?\d+$/.test(q)) expect(eval(q), `${t.id} ${f.ask}`).toBe(f.answer); // eslint-disable-line no-eval
      expect(Number.isInteger(f.answer), `${t.id} ${f.ask}`).toBe(true);
    }
  });
  it("ids are unique inside each table, and every grade K to 12 has tables", () => {
    for (const t of TABLES) expect(new Set(t.facts.map(f => f.id)).size).toBe(t.facts.length);
    for (let g = 0; g <= 12; g++) expect(tablesForGrade(g).length, `grade ${g}`).toBeGreaterThan(0);
  });
  it("the times table has 144 facts and its twins share answers", () => {
    const t = TABLES.find(x => x.id === "times")!;
    expect(t.facts).toHaveLength(144);
    for (const f of t.facts) expect(t.facts.find(x => x.r === f.c && x.c === f.r)!.answer).toBe(f.answer);
  });
});

describe("learning a fact", () => {
  it("climbs on quick right answers, holds on slow ones, and drops to the start when missed", () => {
    let r = updateFact(undefined, true, 1500, 0);
    expect(r.s).toBe(1);
    r = updateFact(r, true, 9000, 0);
    expect(r.s).toBe(1);
    r = updateFact(updateFact(r, true, 1000, 0), true, 1000, 0);
    expect(r.s).toBe(KNOWN);
    expect(r.due).toBeGreaterThan(DAY);
    expect(updateFact(r, false, 1000, 0)).toMatchObject({ s: 0, due: 0 });
  });
  it("a sprint asks due facts first and only a few new ones", () => {
    const t = TABLES.find(x => x.id === "times")!, f0 = t.facts[50]!;
    const facts = { [factKey(t, f0)]: { s: 0, due: 0, n: 1 } };
    const q = pickSprint(facts, t, 20, 10 * DAY, createRng(1));
    expect(q).toHaveLength(20);
    expect(q).toContain(f0);
  });
  it("saving a sprint updates facts, XP and the day's streak, and Today shows it done", () => {
    const now = Date.parse("2026-10-03T10:00:00");
    const t = TABLES.find(x => x.id === "times")!;
    const p0 = { ...emptyProgress(), grade: 3 };
    const p = finishSprint(p0, "times", 3, [{ key: factKey(t, t.facts[0]!), right: true, ms: 1000 }, { key: factKey(t, t.facts[1]!), right: false, ms: 3000 }], now);
    expect(p.facts[factKey(t, t.facts[0]!)]!.s).toBe(1);
    expect(p.xp).toBe(1);
    expect(p.streak).toBe(1);
    expect(p.sprints).toHaveLength(1);
    expect(todayPlan(p0, 3, now, false).find(i => i.kind === "facts")?.done).toBe(false);
    expect(todayPlan(p, 3, now, false).find(i => i.kind === "facts")?.done).toBe(true);
  });
});
