import type { AnswerModel, LessonDefinition } from "../../../schemas/lesson";
import { beats, type Explanation } from "../../../../explanations/schema";
import { buildAngle } from "../../../../explanations/diagrams/angle/build";
import { asRecord, expected, mt, ns, numberField } from "../../_geometry/kit";

/** Two angles that make a straight line (st) or a right angle; a is the one we know. */
export interface AnglePartsProblem {
  kind: "geometry.angleParts";
  st: boolean;
  a: number;
}

export function createAngleParts(st: boolean, a: number): AnglePartsProblem {
  const T = st ? 180 : 90;
  if (!Number.isInteger(a) || a <= 0 || a >= T) throw new Error(`the known part must be between 0 and ${T}`);
  return { kind: "geometry.angleParts", st, a };
}

export function restoreAngleParts(raw: unknown): AnglePartsProblem | null {
  const r = asRecord(raw);
  const a = r && numberField(r, "a");
  if (a == null || typeof r!.st !== "boolean") return null;
  try { return createAngleParts(r!.st, a); } catch { return null; }
}

export function anglePartsAnswers({ st, a }: AnglePartsProblem): AnswerModel {
  const T = st ? 180 : 90;
  return {
    steps: [
      ns({ id: "whole", label: "The whole angle", question: st ? "How many degrees is a straight line?" : "How many degrees is a right angle?", prompt: s => mt`${s}°`, ans: T,
        hint: "A right angle is a square corner: 90°. A straight line is two of them: 180°.", wrong: [[st ? 90 : 180, "Mixed up right and straight", "Right angle = 90°. Straight line = 180°."]] }),
      ns({ id: "missing", label: "The missing part", prompt: s => mt`${T} − ${a} = ${s}°`, ans: T - a, hint: `Take ${a} away from ${T}.` }),
    ],
    finalParts: [-1],
  };
}

export function explainAngleParts(p: AnglePartsProblem, answers: AnswerModel): Explanation {
  const T = expected(answers, "whole"), rest = expected(answers, "missing"), { a, st } = p;
  const name = st ? "A straight line" : "A right angle";
  return {
    heading: "Angle parts add up",
    idea: ["A right angle is a square corner: 90°. A straight line is 180°.", "Take the part you know away from the whole."],
    statement: mt`${a}° + ? = ${T}°`,
    caption: `${a}° and ${rest}° together make ${T}°.`,
    diagram: buildAngle({ total: st ? 180 : 90, part: a, wholeBeat: 1, missingBeat: 2, wholeNote: `${name} is ${T}°`, alt: `An angle of ${a}° and the missing ${rest}° together make ${st ? "a straight line" : "a right angle"}, ${T}°.` }),
    timeline: beats(3),
    steps: [
      { id: "parts", narration: `Two angles share a corner. One of them is ${a}°.`, math: mt`${a}° + ? = ${T}°`, state: 0 },
      { id: "whole", narration: `Together they make ${st ? "a straight line" : "a right angle"}, which is ${T}°.`, math: mt`${T}°`, state: 1, answerStep: "whole", result: T },
      { id: "missing", narration: `The missing part is what's left: ${T} − ${a} = ${rest}°.`, math: mt`${T} − ${a} = ${rest}°`, state: 2, answerStep: "missing", result: rest },
    ],
  };
}

export const lesson: LessonDefinition<AnglePartsProblem> = {
  id: "g4-angles",
  grade: 4,
  unit: "Measurement",
  title: "Angles add up",
  reference: createAngleParts(false, 35),
  generate: rng => { const st = rng.next() < 0.5; return createAngleParts(st, st ? rng.int(20, 160) : rng.int(15, 75)); },
  restore: restoreAngleParts,
  display: p => mt`${p.a}° + ? = ${p.st ? 180 : 90}°`,
  displayNote: p => (p.st ? "Two angles make a straight line." : "Two angles make a right angle."),
  answers: anglePartsAnswers,
  explain: explainAngleParts,
};
