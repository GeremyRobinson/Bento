import { num, op, sqrt, text, type MathText } from "../../../schemas/math-text";
import type { AnswerModel } from "../../../schemas/lesson";
import { f, fP, ms, ns, P } from "../../_plane/kit";
import type { QuadFormProblem } from "./problem";

/** b² − 4ac = 3² − 4(1)(2) */
export const discriminantMath = ({ b, c }: QuadFormProblem): MathText =>
  [text("b² − 4ac"), op("="), ...P(b), text("²"), op("−"), text("4(1)("), num(c), text(")")];

export function quadFormAnswers(p: QuadFormProblem): AnswerModel {
  const { r1, r2, b, c, D } = p, s = Math.sqrt(D);
  return {
    steps: [
      ns({ id: "D", label: "Discriminant", prompt: x => [...discriminantMath(p), op("="), ...x], ans: D, hint: `${b * b} − ${fP(4 * c)}.`,
        wrong: [[b * b + 4 * c, "Sign slip", `Careful: − 4ac with c = ${f(c)}.`]] }),
      ns({ id: "root", label: "Square root", prompt: x => [sqrt(D), op("="), ...x], ans: s, hint: `What number times itself is ${D}?` }),
      ms({ id: "roots", label: "Both answers", prompt: S => [text("x"), op("="), ...S.m!, text(" or x"), op("="), ...S.n!], ans: { m: r1, n: r2 }, anyOrder: true,
        hint: `(${f(-b)} + ${s}) ÷ 2 and (${f(-b)} − ${s}) ÷ 2.` }),
    ],
    finalParts: [-1],
  };
}
