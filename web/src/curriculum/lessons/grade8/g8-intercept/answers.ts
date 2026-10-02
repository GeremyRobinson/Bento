import { num, op, text } from "../../../schemas/math-text";
import type { AnswerModel } from "../../../schemas/lesson";
import { f, ms, ns, P } from "../../_plane/kit";
import type { InterceptProblem } from "./problem";

export function interceptAnswers({ m, x0, y0, b }: InterceptProblem): AnswerModel {
  return {
    steps: [
      ns({ id: "mx", label: "m times x", prompt: s => [...P(m), op("×"), ...P(x0), op("="), ...s], ans: m * x0, hint: "Multiply the slope by the point's x." }),
      ns({ id: "b", label: "Find b", prompt: s => [text("b"), op("="), num(y0), op("−"), ...P(m * x0), op("="), ...s], ans: b, hint: "b = y − mx.",
        wrong: [[y0 + m * x0, "Added instead of subtracted", "b = y − mx: subtract."]] }),
      ms({ id: "line", label: "Write the line", prompt: S => [text("y"), op("="), ...S.m!, text("x"), op("+"), ...S.b!], ans: { m, b }, hint: `m is ${f(m)} and b is ${f(b)}.` }),
    ],
    finalParts: [-1],
  };
}
