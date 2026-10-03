// Every word a child can see or hear, from 60 generated problems per lesson, checked for the slips a teacher would
// mark: "1 dots", "there are 1", "a 8", "x + −1", "1x", "undefined". Ported from the Curriculum team's text check.
import { describe, it } from "vitest";
import { LESSONS } from "../../curriculum/registry";
import { createRng } from "../../curriculum/generators/rng";
import { aOrAn } from "../../curriculum/text";

/** A math line as plain text: fractions n/d, powers ^n, boxes [ ]. */
const plain = (v: unknown): string => {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (Array.isArray(v)) return v.map(plain).join(" ");
  const o = v as { t?: string; v?: unknown; n?: unknown; d?: unknown };
  if (o.t) {
    if (o.t === "frac") return `${plain(o.n)}/${plain(o.d)}`;
    if (o.t === "sup") return `^${plain(o.v)}`;
    if (o.t === "sub") return `_${plain(o.v)}`;
    if (o.t === "slot") return "[ ]";
    if (o.t === "br") return " | ";
    return plain(o.v);
  }
  return "";
};
const strings = (v: unknown, out: string[] = []): string[] => {
  if (typeof v === "string") out.push(v);
  else if (Array.isArray(v)) v.forEach(x => strings(x, out));
  else if (v && typeof v === "object") Object.values(v).forEach(x => strings(x, out));
  return out;
};

// words ending in s after "1" that aren't plural nouns
const OK = new Set(["is", "was", "has", "plus", "minus", "less", "its", "this", "as", "us", "times", "axis", "focus", "radius", "always", "yes", "across", "does", "goes",
  "stays", "makes", "equals", "means", "gets", "fits", "comes", "becomes", "shows", "takes", "gives", "lands", "moves", "says", "needs", "uses", "counts", "turns", "works",
  "fills", "leaves", "keeps", "sits", "starts", "ends", "adds", "tells", "stands", "matches", "points", "hops", "jumps", "is", "carries", "lies", "divides", "heads", "drops"]);

/**
 * "5 tens and 1 one make 51": a compound subject takes the plural verb, so a match right after "and " is fine. So is
 * a 1 that's the object of a preposition ("groups of 1 cm are", "the jumps past 1 are").
 */
const compound = (t: string, i: number) => /\b(and( the same)?|of|past|than|to|from|over|under|after|before|above|below|at) $/.test(t.slice(Math.max(0, i - 16), i));
const all = (t: string, re: RegExp, keep: (m: RegExpMatchArray) => boolean = () => true) => [...t.matchAll(re)].filter(keep).map(m => m[0]);

const RULES: [string, (t: string) => string[]][] = [
  // "1 tens rod", "1 ones cube": the name of the block, not a count of tens
  ["1 with a plural noun", t => all(t, /(?<![\d.,/\-−^])\b1 ([a-z]+s)\b(?! (rod|cube)\b)/g, m => !OK.has(m[1]!))],
  ["1 … are", t => all(t, /(?<![\d.,/\-−])\b1 (\w+ )?are\b/g, m => !compound(t, m.index!) && m[1] !== "there ")],
  ["there are 1", t => all(t, /[Tt]here are 1\b(?![\d.,]| [+−×])/g)],
  ["1 with a plural verb", t => all(t, /\b1 (one|ten|hundred|thousand|group|row|jump|piece|part|box|dot|block)s? (stay|are|were|have|make|go|fit)\b/g, m => !compound(t, m.index!))],
  ["a or an before a number", t => all(t, /\b(an?) (\d[\d,]*)(?![\d.])/gi, m => m[1]!.toLowerCase() !== aOrAn(+m[2]!.replace(/,/g, "")))],
  ["doubled word", t => all(t, /\b(\w+) \1\b/gi, m => isNaN(+m[1]!))],
  ["undefined or NaN", t => all(t, /undefined|NaN|\[object|Infinity|\bnull\b/g)],
  ["double space", t => (/[a-z]{2,} [a-z]{2,}.*[.?!]$/.test(t) ? all(t, /\S {2,}\S/g) : [])],
  ["space before punctuation", t => all(t, /\w \.(?!\d)|\w ,/g)],
  ["negative zero", t => all(t, /(?<![\w-])[−-]0\b(?![.,]\d)/g)],
  ["sign after a sign", t => all(t, /[+−-] ?[−-]\d/g)],
  ["coefficient of 1", t => all(t, /(?<![\d.,^])\b1([a-z])\b(?!\^)/g, m => m[0] !== "1s" && !/\bx is 1x\b/.test(t))],
  ["long decimal", t => all(t, /\d\.\d{6,}/g)],
];

const SPACING = new Set(["double space", "space before punctuation"]);

describe("lesson text reads right", () => {
  it.each(LESSONS.map(l => [l.id, l] as const))("%s", (_id, lesson) => {
    const rng = createRng(11), bad = new Set<string>();
    for (let i = 0; i < 60; i++) {
      const p = lesson.generate(rng, i % 10), m = lesson.answers(p);
      // math lines are joined token by token, so their spacing isn't checked; written sentences are
      const math = [plain(lesson.display(p)), ...m.steps.map(s => plain(s.prompt))];
      const words = [
        ...strings([m.steps.map(s => [s.label, s.question, s.hint, s.explain, s.note, s.known.map(k => k.message)]), lesson.explain(p, m), lesson.picture?.(p), lesson.story?.(p), lesson.displayNote?.(p), lesson.lead?.(p)]),
      ];
      const check = (t: string, spacing: boolean) => { for (const [rule, find] of RULES) if (spacing || !SPACING.has(rule)) for (const x of find(t)) if (bad.size < 12) bad.add(`${rule}: «${x}» in "${t.slice(0, 110)}"`); };
      math.forEach(t => check(t, false));
      words.forEach(t => check(t, true));
    }
    if (bad.size) throw new Error(`\n${[...bad].join("\n")}`);
  });
});
