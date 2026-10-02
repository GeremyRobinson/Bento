import { num, op } from "../../../schemas/math-text";
import type { AnswerModel } from "../../../schemas/lesson";
import { call, f, ns, P } from "../../_plane/kit";
import type { FuncProblem } from "./problem";

export function funcAnswers({ a, b, x }: FuncProblem): AnswerModel {
  return {
    steps: [
      ns({ id: "ax", label: "Multiply", prompt: s => [...P(a), op("×"), ...P(x), op("="), ...s], ans: a * x, hint: `Put ${f(x)} in for x.` }),
      ns({ id: "value", label: "Add the number", prompt: s => [...call("f", x), op("="), num(a * x), op("+"), ...P(b), op("="), ...s], ans: a * x + b, hint: "Add the constant." }),
    ],
    finalParts: [-1],
  };
}
