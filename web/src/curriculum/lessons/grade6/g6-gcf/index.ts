import { num, op, text } from "../../../schemas/math-text";
import type { AnswerModel, LessonDefinition } from "../../../schemas/lesson";
import type { Rng } from "../../../generators/rng";
import { beats, type Explanation } from "../../../../explanations/schema";
import { buildAreaGrid } from "../../../../explanations/diagrams/area-model/grid";
import { expectedOf, gcd, ms, ns, readNumbers, type Wrong } from "../../area-common/steps";

/** g·m + g·n, where m and n share no factor, so g is the greatest common factor. */
export interface GcfProblem { g: number; m: number; n: number }

export function createGcf(g: number, m: number, n: number): GcfProblem {
  if (![g, m, n].every(v => Number.isInteger(v) && v > 0)) throw new Error("whole numbers only");
  if (gcd(m, n) !== 1) throw new Error("m and n must share no factor");
  return { g, m, n };
}

/** Same as the current app: m, n 1–9, different and sharing no factor; g 2–9. */
export function generateGcf(rng: Rng): GcfProblem {
  let m: number, n: number;
  do { m = rng.int(1, 9); n = rng.int(1, 9); } while (m === n || gcd(m, n) !== 1);
  return { g: rng.int(2, 9), m, n };
}

export function gcfAnswers({ g, m, n }: GcfProblem): AnswerModel {
  const A = g * m, B = g * n;
  const smaller: Wrong[] = [];
  for (let f = 2; f < g; f++) if (g % f === 0) smaller.push([f, "Common factor, but not the greatest", `${f} works, but there's a bigger one.`]);
  return {
    steps: [
      ns({ id: "gcf", label: "Greatest common factor", prompt: x => [text("GCF("), num(A), text(", "), num(B), text(")"), op("="), x], ans: g,
        hint: `The biggest number that divides both ${A} and ${B}.`, wrong: smaller }),
      ms({ id: "factor", label: "Factor it out", prompt: s => [num(A), op("+"), num(B), op("="), num(g), text("("), s.m!, op("+"), s.n!, text(")")], ans: { m, n },
        hint: `${A} ÷ ${g} and ${B} ÷ ${g}.` }),
    ],
    finalParts: [-1],
  };
}

export function explainGcf(p: GcfProblem, answers: AnswerModel): Explanation {
  const { m, n } = p, g = expectedOf(answers.steps, "gcf"), A = g * m, B = g * n;
  const fm = expectedOf(answers.steps, "factor", "m"), fn = expectedOf(answers.steps, "factor", "n");
  return {
    heading: "Pull out the biggest shared factor",
    idea: ["Find the biggest number that divides both. Write it outside, and what is left of each number inside."],
    statement: [num(A), op("+"), num(B), op("="), num(g), text("("), num(fm), op("+"), num(fn), text(")")],
    diagram: buildAreaGrid({
      cols: [{ label: String(fm), size: m, from: 2 }, { label: String(fn), size: n, from: 2 }],
      rows: [{ label: String(g), size: g, from: 1, cls: "acc" }],
      cells: [[{ text: String(A) }, { text: String(B) }]],
      units: 1,
      lines: [{ text: `${A} + ${B} = ${g}(${fm} + ${fn})`, from: 2 }],
      alt: `Two rectangles of ${A} and ${B} squares with the same height ${g}: ${g} by ${fm} and ${g} by ${fn}.`,
    }),
    caption: `${A} and ${B} are both ${g} rows tall: ${g} rows of ${fm} and ${g} rows of ${fn}.`,
    timeline: beats(3),
    steps: [
      { id: "gcf", narration: `${g} is the biggest number that divides both ${A} and ${B}.`, math: [text("GCF("), num(A), text(", "), num(B), text(")"), op("="), num(g)], state: 1, answerStep: "gcf", result: g },
      { id: "factor", narration: `${A} ÷ ${g} = ${fm} and ${B} ÷ ${g} = ${fn}, so ${A} + ${B} = ${g}(${fm} + ${fn}).`, math: [num(A), op("+"), num(B), op("="), num(g), text("("), num(fm), op("+"), num(fn), text(")")], state: 2, answerStep: "factor", result: fm },
    ],
  };
}

export const lesson: LessonDefinition<GcfProblem> = {
  id: "g6-gcf",
  grade: 6,
  unit: "Number system",
  title: "Factor out the GCF",
  reference: createGcf(12, 2, 3),
  generate: rng => generateGcf(rng),
  restore: raw => { const r = readNumbers(raw, ["g", "m", "n"] as const); try { return r && createGcf(r.g, r.m, r.n); } catch { return null; } },
  display: p => [num(p.g * p.m), op("+"), num(p.g * p.n)],
  displayNote: () => "Factor out the greatest common factor.",
  answers: gcfAnswers,
  explain: explainGcf,
};
