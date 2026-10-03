// Adding within 10 by counting on (the current app's K_ADD).
import { num, op, text } from "../../../schemas/math-text";
import type { AnswerModel, LessonDefinition } from "../../../schemas/lesson";
import { beats, type Explanation } from "../../../../explanations/schema";
import { buildNumberLine, type Hop } from "../../../../explanations/diagrams/number-line/build";
import { dotGroups } from "../../../../explanations/diagrams/number-line/counters";
import { expectedOf, oneBox, restoreVia, wholeIn } from "../../_number-line/steps";

/** a dots and b more; the sum stays within 10 */
export interface CountOnProblem { a: number; b: number }

export function createCountOn(a: number, b: number): CountOnProblem {
  wholeIn("a", a, 1, 5);
  wholeIn("b", b, 1, 5);
  if (a + b > 10) throw new Error("the sum must stay within 10");
  return { a, b };
}

function answers({ a, b }: CountOnProblem): AnswerModel {
  return {
    steps: [
      oneBox({
        id: "first", label: "Count the first group", question: "How many dots are in the first group?",
        prompt: s => [s], ans: a,
        wrong: [[b, "Counted the wrong group", "That's the second group. Count the dots **before** the + sign."]],
        hint: "Touch each dot in the first group and count out loud.",
        explain: `There are ${a} dots in the first group.`,
        work: [text("First group: "), { t: "answer", id: "x", v: a }],
      }),
      oneBox({
        id: "count-on", label: "Count on", question: `Start at ${a}. Count on ${b} more.`,
        prompt: s => [num(a), op("+"), num(b), op("="), s], ans: a + b,
        wrong: [
          [a + b + 1, "Counting on", `One too many. Start after ${a}: say ${a + 1} for the first dot.`],
          [a + b - 1, "Counting on", "One short. Count every dot in the second group once."],
        ],
        hint: `Say ${a}, then count up one number for each dot in the second group.`,
        explain: `${a}, then ${Array.from({ length: b }, (_, i) => a + i + 1).join(", ")}.`,
      }),
    ],
    finalParts: [-1],
  };
}

function explain(p: CountOnProblem, model: AnswerModel): Explanation {
  const { a, b } = p, first = expectedOf(model, "first"), sum = expectedOf(model, "count-on");
  const counted = Array.from({ length: b }, (_, i) => a + i + 1);
  // the first group counted from 0 under the line, then one hop on top for every dot of the second group
  const hops: Hop[] = [
    ...Array.from({ length: a }, (_, i): Hop => ({ from: i, to: i + 1, below: true, beat: 0, delay: 0.25 * i, start: i === 0, land: i === a - 1 })),
    ...counted.map((v, i): Hop => ({ from: v - 1, to: v, label: String(v), beat: 1, delay: 0.45 * i, start: false })),
  ];
  return {
    heading: "Count on",
    idea: ["Count the first group. Then keep counting, one number for each dot in the second group."],
    statement: [num(a), op("+"), num(b)],
    diagram: buildNumberLine({ min: 0, max: 10, hops, alt: `Number line from 0 to 10: count ${a}, then hop on ${b} more to ${sum}.` }),
    caption: `Start at ${a} and count on ${b}: ${sum}.`,
    timeline: beats(2),
    steps: [
      { id: "first", narration: `Count the first group: **${first}** dots. That brings you to ${first}.`, math: [text("First group: "), num(first)], state: 0, answerStep: "first", result: first },
      { id: "count-on", narration: `Count on ${b} more, one hop for each dot: ${counted.join(", ")}.`, math: [num(a), op("+"), num(b), op("="), num(sum)], state: 1, answerStep: "count-on", result: sum },
    ],
  };
}

export const lesson: LessonDefinition<CountOnProblem> = {
  id: "k-add",
  grade: 0,
  unit: "Adding and subtracting",
  title: "Adding within 10",
  reference: createCountOn(3, 4), // the current app's picture: start at 3, count on 4
  generate: rng => { const a = rng.int(1, 5); return createCountOn(a, rng.int(1, Math.min(5, 10 - a))); },
  restore: raw => restoreVia(raw, ["a", "b"] as const, v => createCountOn(v.a, v.b)),
  display: p => [num(p.a), op("+"), num(p.b)],
  picture: p => dotGroups([p.a, p.b], `${p.a} dots plus ${p.b} dots`),
  answers,
  explain,
};
