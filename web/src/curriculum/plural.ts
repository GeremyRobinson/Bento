import type { AnyLesson } from "./schemas/lesson";

// "1 dots" → "1 dot". Lesson text is written with counts filled in ("${n} dots"), so when a count comes out as 1
// the noun (and an "are" right after it) is put back in the singular here, once, for every lesson.
const IRREGULAR: Record<string, string> = { boxes: "box", copies: "copy", inches: "inch", matches: "match", wholes: "whole", pieces: "piece", halves: "half", fourths: "fourth" };
const NOUNS = /(^|[^\d.,/\-−])\b1 ([a-z]+)s\b( are\b)?/g;
// words ending in s that aren't plural nouns ("1 is", "1 makes 10", "1 across")
const KEEP = new Set(["is", "was", "has", "plus", "minus", "less", "its", "this", "as", "us", "times", "axis", "focus", "radius", "always", "yes", "gets", "goes", "makes", "fits", "means", "equals", "comes", "stays", "becomes", "shows", "takes", "gives", "lands", "moves", "points", "says", "needs", "uses", "counts", "jumps", "hops", "turns", "works", "matches", "fills", "does", "leaves", "keeps", "sits", "starts", "ends", "adds", "tells", "stands", "across"]);

export function singular(text: string): string {
  if (!text.includes("1 ")) return text;
  return text.replace(NOUNS, (all, pre: string, stem: string, are: string | undefined) => {
    const word = `${stem}s`;
    if (KEEP.has(word)) return all;
    const one = IRREGULAR[word] ?? (word.endsWith("ies") ? word.slice(0, -3) + "y" : word.endsWith("xes") || word.endsWith("ches") || word.endsWith("shes") ? word.slice(0, -2) : stem);
    return `${pre}1 ${one}${are ? " is" : ""}`;
  }).replace(/(^|[^\d.,/\-−])\b1 are\b/g, (_m, pre: string) => `${pre}1 is`);
}

/** Every string inside a lesson's output, singular where the count is 1. Functions (a step's own check) are wrapped too. */
function deep<T>(v: T): T {
  if (typeof v === "string") return singular(v) as T;
  if (typeof v === "function") return ((...a: unknown[]) => deep((v as (...a: unknown[]) => unknown)(...a))) as T;
  if (Array.isArray(v)) return v.map(deep) as T;
  if (v && typeof v === "object" && Object.getPrototypeOf(v) === Object.prototype) {
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) out[k] = deep(x);
    return out as T;
  }
  return v;
}

/** The lesson with all of its words, pictures, stories and explanations put through `singular`. */
export function withSingulars(l: AnyLesson): AnyLesson {
  const wrap = <F extends ((...a: never[]) => unknown) | undefined>(f: F): F =>
    (f ? ((...a: never[]) => deep(f(...a))) : f) as F;
  return {
    ...l,
    answers: wrap(l.answers),
    explain: wrap(l.explain),
    display: wrap(l.display),
    ...(l.picture ? { picture: wrap(l.picture) } : {}),
    ...(l.story ? { story: wrap(l.story) } : {}),
    ...(l.displayNote ? { displayNote: wrap(l.displayNote) } : {}),
    ...(l.lead ? { lead: wrap(l.lead) } : {}),
  } as AnyLesson;
}
