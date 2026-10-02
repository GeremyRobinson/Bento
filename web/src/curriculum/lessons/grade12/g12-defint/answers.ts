import { num, op, sup, text, type MathText } from "../../../schemas/math-text";
import type { AnswerModel } from "../../../schemas/lesson";
import { ms, ns } from "../../_plane/kit";
import type { DefIntProblem } from "./problem";

/** c·k^(n+1) − c·0^(n+1) */
export const topMinusBottom = ({ c, k, n }: DefIntProblem): MathText =>
  [num(c), op("·"), num(k), sup(n + 1), op("−"), num(c), op("·"), num(0), sup(n + 1)];

export function defIntAnswers(p: DefIntProblem): AnswerModel {
  const { n, a, k, c } = p;
  return {
    steps: [
      ms({ id: "anti", label: "Antiderivative", prompt: S => [...S.c!, text("x"), sup(S.e!)], ans: { c, e: n + 1 }, small: ["e"], hint: `Raise ${n} to ${n + 1}, then ${a} ÷ ${n + 1}.` }),
      ns({ id: "area", label: "Top minus bottom", prompt: s => [...topMinusBottom(p), op("="), ...s], ans: c * k ** (n + 1),
        hint: `Plug in ${k}, then subtract the value at 0 (which is 0).` }),
    ],
    finalParts: [-1],
  };
}
