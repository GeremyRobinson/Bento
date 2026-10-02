import { num, op, text } from "../../../schemas/math-text";
import type { AnswerModel } from "../../../schemas/lesson";
import { f, ms, ns, P } from "../../_plane/kit";
import type { TangentProblem } from "./problem";

export function tangentAnswers({ a, b, k }: TangentProblem): AnswerModel {
  return {
    steps: [
      ms({ id: "derivative", label: "Derivative", prompt: S => [text("f′(x)"), op("="), ...S.p!, text("x"), op("+"), ...S.r!], ans: { p: 2 * a, r: b },
        hint: `2 × ${f(a)} for x², and ${f(b)} for the x term.` }),
      ns({ id: "slope", label: "Plug in", prompt: s => [num(2 * a), op("·"), ...P(k), op("+"), ...P(b), op("="), ...s], ans: 2 * a * k + b,
        hint: "The slope of the tangent line is f′ at that point.", wrong: [[a * k * k + b * k, "Used f instead of f′", "Slope comes from the derivative, not f itself."]] }),
    ],
    finalParts: [-1],
  };
}
