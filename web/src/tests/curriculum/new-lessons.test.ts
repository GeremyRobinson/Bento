// Lessons the current app never had (the K–4 full years) have no parity recording, so they meet a contract instead:
// every generated problem round-trips, every step's own answer passes, every known slip is caught with its reason,
// and nothing on screen is empty.
import { CATALOG } from "../../curriculum/catalog";
import { lessonById } from "../../curriculum/registry";
import { createRng } from "../../curriculum/generators/rng";
import { toPlainText } from "../../curriculum/schemas/math-text";
import { checkAnswerStep } from "../../engine/evaluation/steps";

const recorded = new Set(Object.keys(import.meta.glob("../fixtures/legacy/*.json")).map(k => k.split("/").pop()!.replace(".json", "")));
const fresh = CATALOG.filter(c => !recorded.has(c.id) && lessonById(c.id));

if (!fresh.length) it("has no new lessons yet", () => expect(fresh).toEqual([]));
else describe.each(fresh.map(c => [c.id, c] as const))("%s (new lesson)", (id, entry) => {
  const lesson = lessonById(id)!;
  const rng = createRng(11);
  const problems = [lesson.reference, ...Array.from({ length: 40 }, (_, i) => lesson.generate(rng, i % 10))];

  it("sits where the catalog puts it", () => {
    expect({ grade: lesson.grade, unit: lesson.unit, title: lesson.title, pre: lesson.pre ?? null })
      .toEqual({ grade: entry.grade, unit: entry.unit, title: entry.title, pre: entry.pre });
    expect(lesson.answers(lesson.reference).finalParts).toEqual(entry.final);
  });

  it("makes varied problems", () => {
    expect(new Set(problems.map(p => JSON.stringify(p))).size).toBeGreaterThan(5);
  });

  it.each(problems.map((p, i) => [i, p] as const))("problem %i is sound", (_i, p) => {
    expect(lesson.restore(JSON.parse(JSON.stringify(p)))).toEqual(p);
    expect(toPlainText(lesson.display(p)).trim().length).toBeGreaterThan(0);
    const model = lesson.answers(p);
    expect(model.steps.length).toBeGreaterThan(0);
    for (const s of model.steps) {
      const ctx = `${s.id} of ${JSON.stringify(p)}`;
      expect(s.label.length, ctx).toBeGreaterThan(0);
      expect(s.hint.length, ctx).toBeGreaterThan(0);
      expect(s.explain.length, ctx).toBeGreaterThan(0);
      for (const sl of s.slots) if (sl.expected != null) expect(Number.isFinite(sl.expected), ctx).toBe(true);
      if (s.choices) {
        const c = s.slots.find(x => x.id === "c")!.expected!;
        expect(s.choices[c], ctx).toBeDefined();
        expect(new Set(s.choices).size, ctx).toBe(s.choices.length);
      }
      const right = Object.fromEntries(s.slots.map(x => [x.id, x.expected]));
      expect(checkAnswerStep(s, right).ok, ctx).toBe(true);
      for (const k of s.known) {
        const typed = { ...right, ...k.values };
        const r = checkAnswerStep(s, typed);
        expect(r.ok, `${ctx}: slip ${JSON.stringify(k.values)} must not pass`).toBe(false);
        if (!r.ok && !r.soft) expect(r.message.length, ctx).toBeGreaterThan(0);
      }
    }
    const ex = lesson.explain(p, model);
    expect(ex.heading.length).toBeGreaterThan(0);
  });
});
