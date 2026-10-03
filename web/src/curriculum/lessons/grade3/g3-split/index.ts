import { answer, num, op } from "../../../schemas/math-text";
import type { AnswerModel, LessonDefinition } from "../../../schemas/lesson";
import type { Rng } from "../../../generators/rng";
import { beats, type Explanation } from "../../../../explanations/schema";
import { buildAreaGrid } from "../../../../explanations/diagrams/area-model/grid";
import { expectedOf, numStep, readNumbers } from "../../area-common/steps";
import { count, aNum, cap } from "../../../text";

/** a × b, with b split into 5 + (b − 5). */
export interface SplitFactProblem { a: number; b: number }

export function createSplitFact(a: number, b: number): SplitFactProblem {
  if (!Number.isInteger(a) || a < 1 || !Number.isInteger(b) || b < 6) throw new Error("a × b needs a whole a and b of 6 or more");
  return { a, b };
}

/** Same as the current app: a 3–9, b 6–9. */
export const generateSplitFact = (rng: Rng): SplitFactProblem => ({ a: rng.int(3, 9), b: rng.int(6, 9) });

export function splitFactAnswers({ a, b }: SplitFactProblem): AnswerModel {
  const r = b - 5;
  return {
    steps: [
      numStep({ id: "five", label: "Multiply by 5", prompt: x => [num(a), op("×"), num(5), op("="), x], ans: a * 5,
        wrong: [[a + 5, "Added instead of multiplied", `× means ${count(a, "group")} of 5, not ${a} + 5.`]],
        hint: `Count by 5s, ${a} times.`, explain: `${a} × 5 = ${a * 5}.`, work: [num(a), op("×"), num(5), op("="), num(a * 5)] }),
      numStep({ id: "rest", label: `Multiply by ${r}`, prompt: x => [num(a), op("×"), num(r), op("="), x], ans: a * r,
        wrong: [[a + r, "Added instead of multiplied", `× means ${count(a, "group")} of ${r}.`]],
        hint: `${count(a, "group")} of ${r}.`, explain: `${a} × ${r} = ${a * r}.`, work: [num(a), op("×"), num(r), op("="), num(a * r)] }),
      numStep({ id: "sum", label: "Add the parts", prompt: x => [num(a * 5), op("+"), num(a * r), op("="), x], ans: a * b,
        hint: `${b} is 5 + ${r}, so add the two answers.`, explain: `${a * 5} + ${a * r} = ${a * b}.`, work: [num(a), op("×"), num(b), op("="), answer("x", a * b)] }),
    ],
    finalParts: [-1],
  };
}

export function explainSplitFact(p: SplitFactProblem, answers: AnswerModel): Explanation {
  const { a, b } = p, r = b - 5;
  const five = expectedOf(answers.steps, "five"), rest = expectedOf(answers.steps, "rest"), sum = expectedOf(answers.steps, "sum");
  return {
    heading: "Break a hard fact apart",
    idea: ["Split the second number into 5 and what is left. Multiply each part, then add."],
    statement: [num(a), op("×"), num(b), op("="), num(a), op("×"), num(5), op("+"), num(a), op("×"), num(r)],
    diagram: buildAreaGrid({
      cols: [{ label: "5", size: 5 }, { label: String(r), size: r }],
      rows: [{ label: String(a), size: a }],
      cells: [[{ text: String(five), from: 1, focus: [1] }, { text: String(rest), from: 2, focus: [2] }]],
      units: 0,
      lines: [{ text: `${a} × ${b} = ${five} + ${rest} = ${sum}`, from: 3 }],
      alt: `${cap(aNum(a))} by ${b} rectangle cut into ${a} by 5 = ${five} and ${a} by ${r} = ${rest}. Together ${sum}.`,
    }),
    caption: `${b} is 5 + ${r}, so the ${a} by ${b} rectangle splits into two easy parts.`,
    timeline: beats(4),
    steps: [
      { id: "five", narration: `${count(a, "row")} of 5: ${a} × 5 = ${five}.`, math: [num(a), op("×"), num(5), op("="), num(five)], state: 1, answerStep: "five", result: five },
      { id: "rest", narration: `${count(a, "row")} of ${r}: ${a} × ${r} = ${rest}.`, math: [num(a), op("×"), num(r), op("="), num(rest)], state: 2, answerStep: "rest", result: rest },
      { id: "sum", narration: `Put the parts back together: ${five} + ${rest} = ${sum}.`, math: [num(five), op("+"), num(rest), op("="), num(sum)], state: 3, answerStep: "sum", result: sum },
    ],
  };
}

export const lesson: LessonDefinition<SplitFactProblem> = {
  id: "g3-split",
  grade: 3,
  unit: "Multiplication and division",
  title: "Multiply by breaking apart",
  reference: createSplitFact(7, 8),
  generate: rng => generateSplitFact(rng),
  restore: raw => { const r = readNumbers(raw, ["a", "b"] as const); try { return r && createSplitFact(r.a, r.b); } catch { return null; } },
  display: p => [num(p.a), op("×"), num(p.b)],
  answers: splitFactAnswers,
  explain: explainSplitFact,
  story: ({ a, b }) => ({ op: "×", text: `There are **${a}** bags. Each bag has **${b}** apples. How many apples are there?` }),
};
