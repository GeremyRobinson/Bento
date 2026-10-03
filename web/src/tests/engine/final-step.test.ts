import { describe, expect, it } from "vitest";
import { finalPartsOf, finalStep } from "../../engine/evaluation/steps";
import { lessonById } from "../../curriculum/registry";
import { createRng } from "../../curriculum/generators/rng";

describe("skipping to the final answer", () => {
  it.each(["g4-fraccompare", "g4-deccompare"])("keeps the tap buttons when the last step is a tap (%s)", id => {
    const l = lessonById(id)!;
    const p = l.generate(createRng(7), 3);
    const model = l.answers(p);
    const last = model.steps[model.steps.length - 1]!;
    expect(last.choices).toBeTruthy();
    const f = finalStep(finalPartsOf(model.steps, model.finalParts));
    expect(f.choices).toEqual(last.choices);
  });
});
