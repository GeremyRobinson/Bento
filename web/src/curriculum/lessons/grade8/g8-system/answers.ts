import { num, op, text } from "../../../schemas/math-text";
import type { AnswerModel } from "../../../schemas/lesson";
import { ns } from "../../_plane/kit";
import type { SystemProblem } from "./problem";

export function systemAnswers({ k, x, s }: SystemProblem): AnswerModel {
  return {
    steps: [
      ns({ id: "sub", label: "Substitute", prompt: b => [text("x"), op("+"), num(k), text("x"), op("="), ...b, text("x")], ans: k + 1,
        hint: `Put ${k}x in place of y. x is 1x.`, wrong: [[k, "Forgot the x", `x is 1x, so x + ${k}x = ${k + 1}x.`]] }),
      ns({ id: "x", label: "Solve for x", prompt: b => [num(k + 1), text("x"), op("="), num(s), text(", so x"), op("="), ...b], ans: x, hint: `${s} ÷ ${k + 1}.` }),
      ns({ id: "y", label: "Find y", prompt: b => [text("y"), op("="), num(k), op("×"), num(x), op("="), ...b], ans: k * x, hint: `Use y = ${k}x.` }),
    ],
    finalParts: [-2, -1],
  };
}
