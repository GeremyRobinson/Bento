import { num, op, text } from "../../../schemas/math-text";
import type { AnswerModel } from "../../../schemas/lesson";
import { f, ms, ns, P } from "../../_plane/kit";
import type { TwoPointProblem } from "./problem";

const round6 = (x: number) => Math.round(x * 1e6) / 1e6;

export function twoPointAnswers({ m, b, x1, x2, y1, y2 }: TwoPointProblem): AnswerModel {
  return {
    steps: [
      ns({ id: "m", label: "Slope", prompt: s => [text("m"), op("="), text("("), num(y2), op("−"), ...P(y1), text(")"), op("÷"), text("("), num(x2), op("−"), ...P(x1), text(")"), op("="), ...s],
        ans: m, hint: "Rise over run.", wrong: [[round6((x2 - x1) / (y2 - y1)), "Flipped rise and run", "The y change goes on top."]] }),
      ns({ id: "b", label: "Find b", prompt: s => [text("b"), op("="), num(y1), op("−"), ...P(m), op("×"), ...P(x1), op("="), ...s], ans: b, hint: "b = y − mx, using the first point." }),
      ms({ id: "line", label: "Write the line", prompt: S => [text("y"), op("="), ...S.m!, text("x"), op("+"), ...S.b!], ans: { m, b }, hint: `m = ${f(m)}, b = ${f(b)}.` }),
    ],
    finalParts: [-1],
  };
}
