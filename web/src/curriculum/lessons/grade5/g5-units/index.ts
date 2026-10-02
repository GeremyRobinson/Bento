import { num, op, text, type MathText } from "../../../schemas/math-text";
import type { AnswerModel, LessonDefinition } from "../../../schemas/lesson";
import type { Rng } from "../../../generators/rng";
import { beats, type Explanation } from "../../../../explanations/schema";
import { buildTape } from "../../../../explanations/diagrams/tape/build";
import { expectedOf, ns } from "../../_tape-family/steps";

/** [one big unit, many big units, small units, small units in one big unit] */
export type UnitPair = [string, string, string, number];

/** The current app's conversions. */
export const UNITS: UnitPair[] = [
  ["foot", "feet", "inches", 12], ["yard", "yards", "feet", 3], ["meter", "meters", "centimeters", 100], ["kilogram", "kilograms", "grams", 1000],
  ["hour", "hours", "minutes", 60], ["gallon", "gallons", "quarts", 4], ["pound", "pounds", "ounces", 16],
];

/** n big units = ? small units. */
export interface UnitConversionProblem { u: UnitPair; n: number }

export function createUnitConversion(one: string, n: number): UnitConversionProblem {
  const u = UNITS.find(x => x[0] === one);
  if (!u || !Number.isInteger(n) || n < 1) throw new Error(`not a unit conversion: ${n} ${one}`);
  return { u, n };
}

/** Same ranges as the current app: any of its conversions, 2–12 big units. */
export function generateUnitConversion(rng: Rng): UnitConversionProblem {
  const u = rng.pick(UNITS);
  return createUnitConversion(u[0], rng.int(2, 12));
}

function answers({ u: [one, , small, f], n }: UnitConversionProblem): AnswerModel {
  return {
    steps: [
      ns({ id: "one", l: "How many in one?", q: `1 ${one} = how many ${small}?`, a: s => s, ans: f, h: `1 ${one} is ${f} ${small}.` }),
      ns({ id: "multiply", l: "Multiply", a: s => [num(n), op("×"), num(f), op("="), ...s], ans: n * f, h: "Big unit to small unit: multiply.",
        w: [[n + f, "Added instead of multiplied", `Each ${one} is ${f} ${small}, so multiply.`]] }),
    ],
    finalParts: [-1],
  };
}

/** A bar of n parts, one per big unit. Beat 1 fills the first with f small units; beat 2 fills them all and adds them up. */
export function unitConversionPicture({ u: [one, many, small, f], n }: UnitConversionProblem) {
  return buildTape({
    rows: [{
      length: 1, parts: n, fills: [{ a: 0, b: 1 / n, tone: "on", from: 1 }, { a: 1 / n, b: 1, tone: "on", from: 2 }],
      each: [{ text: () => `1`, until: 0 }, { text: () => `${f}`, from: 1, until: 1, only: i => i === 0 }, { text: () => `${f}`, from: 2 }],
    }],
    brackets: [
      { row: 0, a: 0, b: 1, text: `${n} ${n === 1 ? one : many}`, side: "above" },
      { row: 0, a: 0, b: 1 / n, text: `1 ${one} = ${f} ${small}`, side: "below", from: 1, until: 1 },
      { row: 0, a: 0, b: 1, text: `${n} × ${f} = ${n * f} ${small}`, side: "below", from: 2, acc: true },
    ],
    alt: `A bar of ${n} ${many}, each ${f} ${small}: ${n * f} ${small} in all.`,
  });
}

function explain(p: UnitConversionProblem, model: AnswerModel): Explanation {
  const { u: [one, many, small], n } = p, f = expectedOf(model.steps, "one"), all = expectedOf(model.steps, "multiply");
  return {
    heading: "Big to small: multiply",
    statement: [num(n), text(` ${many}`), op("="), text(`? ${small}`)],
    diagram: unitConversionPicture(p),
    caption: `1 ${one} is ${f} ${small}, so ${n} ${many} is ${n} × ${f} = ${all} ${small}.`,
    timeline: beats(3),
    steps: [
      { id: "one", state: 1, answerStep: "one", result: f, math: [num(1), text(` ${one}`), op("="), num(f), text(` ${small}`)],
        narration: `Start with one: 1 ${one} is ${f} ${small}.` },
      { id: "multiply", state: 2, answerStep: "multiply", result: all, math: [num(n), op("×"), num(f), op("="), num(all)],
        narration: `Every ${one} is another ${f} ${small}, so multiply: ${n} × ${f} = ${all} ${small}.` },
    ],
  };
}

/** A story that fits what the unit measures (the current app said "a rope is 8 kilograms long" for every unit). */
function story({ u: [one, many, small], n }: UnitConversionProblem) {
  const N = `**${n}** ${n === 1 ? one : many}`;
  const text = ["kilogram", "pound"].includes(one) ? `A bag of flour weighs ${N}. How many ${small} is that?`
    : one === "hour" ? `A road trip takes ${N}. How many ${small} is that?`
    : one === "gallon" ? `A fish tank holds ${N} of water. How many ${small} is that?`
    : `A rope is ${N} long. How many ${small} long is it?`;
  return { op: "×" as const, text };
}

export const lesson: LessonDefinition<UnitConversionProblem> = {
  id: "g5-units",
  grade: 5,
  unit: "Measurement",
  title: "Converting units",
  // the current app's card and picture: 3 feet = 36 inches
  reference: createUnitConversion("foot", 3),
  generate: rng => generateUnitConversion(rng),
  restore: raw => {
    if (!raw || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>, u = r.u;
    const one = Array.isArray(u) ? u[0] : u;
    if (typeof one !== "string" || typeof r.n !== "number") return null;
    try { return createUnitConversion(one, r.n); } catch { return null; }
  },
  display: (p): MathText => [num(p.n), text(` ${p.u[1]}`), op("="), text(`? ${p.u[2]}`)],
  answers,
  explain,
  story,
};
