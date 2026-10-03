import { describe, expect, it } from "vitest";
import { LESSONS, dropDeadSlips } from "../../curriculum/registry";
import { createRng } from "../../curriculum/generators/rng";
import { eq } from "../../engine/evaluation/numbers";
import type { AnswerStep } from "../../curriculum/schemas/lesson";

const isAnswer = (s: AnswerStep, values: Record<string, number>) =>
  s.slots.every(x => (x.expected == null ? values[x.id] == null : eq(values[x.id], x.expected)));

describe("no slip a step knows about is the right answer", () => {
  it("drops a slip that equals the answer and keeps the rest", () => {
    const step: AnswerStep = {
      id: "x", label: "Square", prompt: [], slots: [{ id: "x", expected: 4 }], hint: "", explain: "", work: [],
      known: [{ values: { x: 4 }, kind: "Multiplied by 2", message: "2² means 2 × 2, not 2 × 2" }, { values: { x: 5 }, kind: "Off by one", message: "" }],
    };
    expect(dropDeadSlips({ steps: [step], finalParts: [-1] }).steps[0]!.known.map(k => k.kind)).toEqual(["Off by one"]);
  });
  for (const lesson of LESSONS) {
    it(lesson.id, () => {
      const rng = createRng(31), dead: string[] = [];
      for (let i = 0; i < 200; i++) {
        const p = lesson.generate(rng, i % 10);
        for (const s of lesson.answers(p).steps) for (const k of s.known) if (isAnswer(s, k.values) && dead.length < 3) dead.push(`${s.label}: ${k.kind}`);
      }
      expect(dead).toEqual([]);
    });
  }
});
