import { num, op, text } from "../../../schemas/math-text";
import type { AnswerModel } from "../../../schemas/lesson";
import { ms } from "../../_plane/kit";
import type { SolveFactorProblem } from "./problem";

export function solveFactorAnswers({ p, r }: SolveFactorProblem): AnswerModel {
  return {
    steps: [
      ms({ id: "factor", label: "Factor", prompt: S => [text("(x − "), ...S.m!, text(")(x − "), ...S.n!, text(")"), op("="), num(0)], ans: { m: p, n: r }, anyOrder: true,
        hint: `Two numbers that multiply to ${p * r} and add to ${p + r}.` }),
      ms({ id: "roots", label: "Solutions", prompt: S => [text("x"), op("="), ...S.m!, text(" or x"), op("="), ...S.n!], ans: { m: p, n: r }, anyOrder: true,
        hint: "Set each factor to 0.", wrong: [[{ m: -p, n: -r }, "Flipped the signs", `x − ${p} = 0 means x = ${p}.`]] }),
    ],
    finalParts: [-1],
  };
}
