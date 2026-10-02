import { num, op, text, type MathText } from "../../../schemas/math-text";
import type { AnswerModel } from "../../../schemas/lesson";
import { ns, P } from "../../_plane/kit";
import type { MidProblem } from "./problem";

/** (−4 + (−2)) ÷ 2 */
export const halfSum = (a: number, b: number): MathText => [text("("), num(a), op("+"), ...P(b), text(")"), op("÷"), num(2)];

export function midAnswers({ x1, y1, x2, y2 }: MidProblem): AnswerModel {
  return {
    steps: [
      ns({ id: "mx", label: "Average the x's", prompt: s => [...halfSum(x1, x2), op("="), ...s], ans: (x1 + x2) / 2, hint: "Add the x values and halve.",
        wrong: [[x1 + x2, "Forgot to halve", "The midpoint is the average: divide by 2."]] }),
      ns({ id: "my", label: "Average the y's", prompt: s => [...halfSum(y1, y2), op("="), ...s], ans: (y1 + y2) / 2, hint: "Add the y values and halve.",
        wrong: [[y1 + y2, "Forgot to halve", "Divide by 2."]] }),
    ],
    finalParts: [-2, -1],
  };
}
