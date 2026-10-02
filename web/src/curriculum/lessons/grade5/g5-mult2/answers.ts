import { answer, num, op, slot, type MathText } from "../../../schemas/math-text";
import type { AnswerModel, AnswerStep } from "../../../schemas/lesson";
import { leadingDigit, placeName } from "../../../generators/place-value";
import { formatNumber as f } from "../../../schemas/math-text";
import type { SplitMultiplicationProblem } from "./problem";

const plusChain = (values: number[]): MathText =>
  values.flatMap((v, i) => (i ? [op("+"), num(v)] : [num(v)]));

/**
 * The derived answer model. Step labels, hints and the known place-value slip
 * keep the current app's wording; every number comes from the problem.
 */
export function splitMultiplicationAnswers(p: SplitMultiplicationProblem): AnswerModel {
  const a = p.firstFactor;
  const steps: AnswerStep[] = p.parts.map((part, i) => {
    const expected = p.partialProducts[i]!;
    const zeros = String(part).length - 1;
    const digit = leadingDigit(part);
    const hint = zeros === 0
      ? `${f(a)} × ${f(part)}.`
      : `Do ${f(a)} × ${f(digit)}, then add ${zeros === 1 ? "a zero" : `${zeros} zeros`}.`;
    return {
      id: `partial-${i}`,
      label: `Multiply by the ${placeName(part)}`,
      prompt: [num(a), op("×"), num(part), op("="), slot("x")],
      slots: [{ id: "x", expected }],
      known: zeros === 0 ? [] : [{
        values: { x: a * digit },
        kind: "Lost the place value",
        message: `That's ${f(a)} × ${f(digit)}. The ${placeName(part)} digit stands for ${f(part)}, so add ${zeros === 1 ? "a zero" : `${zeros} zeros`}.`,
      }],
      hint,
      explain: `${hint} That makes ${f(expected)}.`,
      work: [num(a), op("×"), num(part), op("="), answer("x", expected)],
    };
  });
  if (p.parts.length > 1) {
    const hint = p.parts.length === 2 ? "Add the two partial products." : "Add the partial products.";
    steps.push({
      id: "sum",
      label: "Add the parts",
      prompt: [...plusChain(p.partialProducts), op("="), slot("x")],
      slots: [{ id: "x", expected: p.product }],
      known: [],
      hint,
      explain: `${hint} That makes ${f(p.product)}.`,
      work: [...plusChain(p.partialProducts), op("="), answer("x", p.product)],
    });
  }
  return { steps, finalParts: [-1] };
}
