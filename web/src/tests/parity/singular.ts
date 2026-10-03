// The current (legacy) app wrote "1 dots"; the rebuild says "1 dot". Parity squashes both sides through this so
// the comparison is about the math, not that slip.
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

