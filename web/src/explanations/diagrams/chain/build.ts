// Builds "chain" lesson pages: lines of math that appear beat by beat, each following from the one above
// (the current app's `steps(...)` pictures). Any lesson can use it; every line and beat comes from the problem.
import type { MathText } from "../../../curriculum/schemas/math-text";
import type { RichText } from "../../../curriculum/schemas/lesson";
import { beats, type Explanation, type ExplanationStep } from "../../schema";
import type { ChainDiagram } from "./schema";

/** A chain built straight from lines; a line without `from` appears one beat after the line above it. */
export function buildChain(lines: { math: MathText; from?: number }[], alt: string): ChainDiagram {
  let beat = -1;
  return {
    kind: "chain",
    lines: lines.map(l => {
      beat = l.from ?? beat + 1;
      return { math: l.math, from: beat };
    }),
    alt,
  };
}

/** One beat of a chain page: what is said, the math in the narration, and the chain lines it adds. */
export interface ChainBeat {
  id: string;
  narration: RichText;
  math: MathText;
  /** lines this beat adds to the chain (none is fine: the beat only talks about the lines already there) */
  lines: MathText[];
  answerStep?: string;
  result?: number;
}

/**
 * A whole lesson page as a chain: one timeline state per beat, and each beat's lines appear on its own state.
 * The caller computes every line, narration and result from the problem; this only wires them together.
 */
export function chainExplanation(o: {
  heading: string;
  idea?: RichText[];
  statement: MathText;
  caption?: RichText;
  alt: string;
  beats: ChainBeat[];
}): Explanation & { diagram: ChainDiagram } {
  if (!o.beats.length) throw new Error("a chain page needs at least one beat");
  const steps: ExplanationStep[] = o.beats.map((b, i) => ({
    id: b.id,
    narration: b.narration,
    math: b.math,
    state: i,
    ...(b.answerStep ? { answerStep: b.answerStep } : {}),
    ...(b.result != null ? { result: b.result } : {}),
  }));
  return {
    heading: o.heading,
    ...(o.idea ? { idea: o.idea } : {}),
    statement: o.statement,
    diagram: { kind: "chain", lines: o.beats.flatMap((b, i) => b.lines.map(math => ({ math, from: i }))), alt: o.alt },
    ...(o.caption ? { caption: o.caption } : {}),
    timeline: beats(o.beats.length),
    steps,
  };
}
