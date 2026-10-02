import { num, op } from "../../../schemas/math-text";
import type { AnswerModel } from "../../../schemas/lesson";
import { ns } from "../../_plane/kit";
import type { TranslateProblem } from "./problem";

export function translateAnswers({ x, y, dx, dy }: TranslateProblem): AnswerModel {
  return {
    steps: [
      ns({ id: "x", label: "New x", prompt: s => [num(x), op(dx > 0 ? "+" : "−"), num(Math.abs(dx)), op("="), ...s], ans: x + dx,
        hint: dx > 0 ? "Right adds to x." : "Left subtracts from x.", wrong: [[x - dx, "Moved the wrong way", dx > 0 ? "Right means add." : "Left means subtract."]] }),
      ns({ id: "y", label: "New y", prompt: s => [num(y), op(dy > 0 ? "+" : "−"), num(Math.abs(dy)), op("="), ...s], ans: y + dy,
        hint: dy > 0 ? "Up adds to y." : "Down subtracts from y.", wrong: [[y - dy, "Moved the wrong way", dy > 0 ? "Up means add." : "Down means subtract."]] }),
    ],
    finalParts: [-2, -1],
  };
}
