// Sort and count: count each kind of thing in a mixed-up pile, then say which group has the most (or the fewest).
import { num, text } from "../../../schemas/math-text";
import type { AnswerModel, LessonDefinition } from "../../../schemas/lesson";
import { beats, type Explanation } from "../../../../explanations/schema";
import { buildSort, type Glyph } from "../../../../explanations/diagrams/early-k/sort";
import { oneBox, wholeIn } from "../../_number-line/steps";
import { countUp, slips, tapStep, words } from "../kit";
import { count } from "../../../text";

interface Kind { glyph: Glyph; one: string; many: string }
const KINDS: Kind[][] = [
  [{ glyph: "button", one: "button", many: "buttons" }, { glyph: "leaf", one: "leaf", many: "leaves" }, { glyph: "block", one: "block", many: "blocks" }],
  [{ glyph: "circle", one: "circle", many: "circles" }, { glyph: "square", one: "square", many: "squares" }, { glyph: "triangle", one: "triangle", many: "triangles" }],
];
const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);

/** by 0 sorts kinds of things, 1 shapes; counts holds one count per kind; theme turns which kinds come first; ask 1 asks for the fewest */
export interface SortProblem { by: number; counts: number[]; theme: number; ask: number }

export function createSort(by: number, counts: number[], theme: number, ask: number): SortProblem {
  wholeIn("by", by, 0, 1);
  wholeIn("theme", theme, 0, 2);
  wholeIn("ask", ask, 0, 1);
  if (!Array.isArray(counts) || counts.length < 2 || counts.length > 3) throw new Error("two or three kinds");
  counts.forEach((c, i) => wholeIn(`counts[${i}]`, c, 1, 8));
  if (new Set(counts).size !== counts.length) throw new Error("every group has a different count");
  if (counts.reduce((a, b) => a + b, 0) > 15) throw new Error("15 things at most");
  return { by, counts: [...counts], theme, ask };
}

const kindsOf = (p: SortProblem) => { const all = KINDS[p.by]!; return p.counts.map((_, i) => all[(i + p.theme) % 3]!); };

function answers(p: SortProblem): AnswerModel {
  const kinds = kindsOf(p), total = p.counts.reduce((a, b) => a + b, 0);
  const pick = p.ask ? Math.min(...p.counts) : Math.max(...p.counts), other = p.ask ? Math.max(...p.counts) : Math.min(...p.counts);
  const right = p.counts.indexOf(pick), word = p.ask ? "fewest" : "most";
  return {
    steps: [
      ...p.counts.map((n, i) => {
        const k = kinds[i]!;
        return oneBox({
          id: `count${i}`, label: `Count the ${k.many}`, question: `How many ${k.many}?`,
          prompt: x => [text(`${cap(k.many)}: `), x], ans: n,
          wrong: slips(n, [
            [total, "Counted everything", `That's all of them. Count only the ${k.many}.`],
            [n - 1, "Skipped one", `One short. Touch each ${k.one} as you count.`],
            [n + 1, "Counted one twice", `One too many. Touch each ${k.one} only once.`],
          ]),
          hint: `Find every ${k.one}. Touch each one as you count.`,
          explain: `${countUp(1, n)}. There ${n === 1 ? "is" : "are"} ${count(n, k.one, k.many)}.`,
        });
      }),
      tapStep({
        id: "compare", label: `Which has the ${word}?`, question: `Which group has the ${word}?`,
        prompt: [...p.counts.flatMap((n, i) => [...(i ? [text(", ")] : []), num(n), text(` ${kinds[i]!.many}`)])],
        choices: kinds.map(k => cap(k.many)), right,
        wrong: i => p.counts[i] === other
          ? [`Picked the ${p.ask ? "most" : "fewest"}`, `That group has the ${p.ask ? "most" : "fewest"}. Which group has the ${word}?`]
          : ["Picked a middle group", `Look at the numbers again. The ${word} is ${pick}.`],
        hint: p.ask ? "The fewest is the smallest number." : "The most is the biggest number.",
        explain: `${pick} is the ${p.ask ? "smallest" : "biggest"} number, so the ${kinds[right]!.many} have the ${word}.`,
        work: [text(`The ${kinds[right]!.many} have the ${word}.`)],
      }),
    ],
    finalParts: [-1],
  };
}

const seedOf = (p: SortProblem) => p.counts.reduce((a, c) => a * 9 + c, p.by * 7 + p.theme * 3 + 1);
const altOf = (p: SortProblem) => { const total = p.counts.reduce((a, b) => a + b, 0); return `${total} ${p.by ? "shapes" : "things"} of different ${p.by ? "shapes" : "kinds"}, mixed up.`; };

function explain(p: SortProblem, model: AnswerModel): Explanation {
  const kinds = kindsOf(p), right = model.steps.at(-1)!.slots[0]!.expected!, word = p.ask ? "fewest" : "most";
  return {
    heading: "Sort, then count",
    idea: ["Put the things that match together. Then count each group and see which has more."],
    statement: words(`Which group has the ${word}?`),
    diagram: buildSort({ glyphs: kinds.map(k => k.glyph), counts: p.counts, seed: seedOf(p), mark: right, beats: { rows: 1, count: 2, mark: 3 },
      alt: `${altOf(p)} They slide into rows, one row for each kind: ${p.counts.map((n, i) => count(n, kinds[i]!.one, kinds[i]!.many)).join(", ")}.` }),
    caption: `The ${kinds[right]!.many} have the ${word}.`,
    timeline: beats(4),
    steps: [
      { id: "mixed", narration: "Everything is mixed up.", math: words("Mixed up"), state: 0 },
      { id: "rows", narration: "Put the things that match together, one row for each kind.", math: words("Sorted"), state: 1 },
      ...p.counts.map((n, i) => ({ id: `count${i}`, narration: `${countUp(1, n)}: **${count(n, kinds[i]!.one, kinds[i]!.many)}**.`, math: [text(`${cap(kinds[i]!.many)}: `), num(n)], state: 2, answerStep: `count${i}`, result: n })),
      { id: "compare", narration: `The ${p.ask ? "shortest" : "longest"} row has the ${word}: the **${kinds[right]!.many}**.`, math: [text(`The ${kinds[right]!.many} have the ${word}.`)], state: 3, answerStep: "compare", result: right },
    ],
  };
}

export const lesson: LessonDefinition<SortProblem> = {
  id: "k-sort",
  grade: 0,
  unit: "Shapes and measuring",
  title: "Sort and count",
  reference: createSort(0, [5, 3], 0, 0),
  generate: (rng, index) => {
    const early = index < 3, kinds = early ? 2 : 3, top = early ? 6 : 8, cap = early ? 8 : 15;
    for (;;) {
      const counts = rng.shuffle(Array.from({ length: top }, (_, i) => i + 1)).slice(0, kinds);
      if (counts.reduce((a, b) => a + b, 0) <= cap) return createSort(rng.int(0, 1), counts, rng.int(0, 2), index % 4 === 3 ? 1 : 0);
    }
  },
  restore: raw => {
    const r = raw as Partial<SortProblem> | null;
    if (!r || typeof r !== "object" || !Array.isArray(r.counts)) return null;
    try { return createSort(r.by as number, r.counts as number[], r.theme as number, r.ask as number); } catch { return null; }
  },
  display: p => words(`Sort them. Which group has the ${p.ask ? "fewest" : "most"}?`),
  picture: p => buildSort({ glyphs: kindsOf(p).map(k => k.glyph), counts: p.counts, seed: seedOf(p), alt: altOf(p) }),
  answers,
  explain,
  pre: "k-compare",
};
