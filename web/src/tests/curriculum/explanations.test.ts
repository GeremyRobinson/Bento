// Every rebuilt lesson's lesson page is built from its problem: the beats fit the timeline, the picture's numbers are real,
// beat results agree with the answer model, and a different problem draws a different picture.
import { LESSONS } from "../../curriculum/registry";
import { createRng } from "../../curriculum/generators/rng";
import { toPlainText } from "../../curriculum/schemas/math-text";
import type { DiagramModel } from "../../explanations/schema";

const numbersOf = (d: DiagramModel): number[] =>
  d.kind === "scene" ? d.items.flatMap(i => Object.entries(i).filter(([k, v]) => typeof v === "number" && k !== "from" && k !== "until" && k !== "delay").map(([, v]) => v as number).concat(i.type === "polygon" ? i.points.flat() : []))
    : [];

describe.each(LESSONS.map(l => [l.id, l] as const))("%s lesson page", (_id, lesson) => {
  const rng = createRng(7);
  const problems = [lesson.reference, ...Array.from({ length: 6 }, (_, i) => lesson.generate(rng, i))];

  it.each(problems.map((p, i) => [i, p] as const))("is derived from problem %i", (_i, p) => {
    const model = lesson.answers(p), ex = lesson.explain(p, model);
    expect(ex.timeline.length).toBeGreaterThan(0);
    expect(ex.steps.length).toBeGreaterThan(0);
    for (const s of ex.steps) {
      expect(s.state).toBeGreaterThanOrEqual(0);
      expect(s.state).toBeLessThan(ex.timeline.length);
      if (s.answerStep && s.result != null) {
        const step = model.steps.find(a => a.id === s.answerStep);
        expect(step, `beat ${s.id} names answer step ${s.answerStep}`).toBeDefined();
        expect(step!.slots.map(x => x.expected)).toContain(s.result);
      }
    }
    if (ex.diagram) {
      if (ex.diagram.kind !== "areaModel") expect(ex.diagram.alt.length).toBeGreaterThan(0);
      for (const n of numbersOf(ex.diagram)) expect(Number.isFinite(n)).toBe(true);
      if (ex.diagram.kind === "scene") for (const i of ex.diagram.items) expect(i.from ?? 0).toBeLessThan(ex.timeline.length);
      if (ex.diagram.kind === "chain") for (const l of ex.diagram.lines) expect(l.from).toBeLessThan(ex.timeline.length);
    }
  });

  it("draws a different picture for a different problem", () => {
    const shown = new Set(problems.map(p => toPlainText(lesson.display(p))));
    if (shown.size < 2) return; // a lesson whose problems all look alike
    const pics = new Set(problems.map(p => JSON.stringify(lesson.explain(p, lesson.answers(p)).diagram ?? null)));
    if (pics.has("null") && pics.size === 1) return; // no picture at all
    expect(pics.size).toBeGreaterThan(1);
  });
});
