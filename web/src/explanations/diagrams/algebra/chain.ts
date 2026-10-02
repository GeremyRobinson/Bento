// Equation chains for the algebra lessons whose original picture was a "steps" list:
// each beat says one thing about this problem, and (usually) adds one line of math to the chain.
import type { MathText } from "../../../curriculum/schemas/math-text";
import type { RichText } from "../../../curriculum/schemas/lesson";
import { beats, type Explanation, type ExplanationStep } from "../../schema";
import type { ChainDiagram } from "../chain/schema";
import type { DiagramModel } from "../../schema";

export interface ChainBeat {
  id: string;
  narration: RichText;
  /** the math shown with the narration */
  math: MathText;
  /** the line this beat adds to the chain; defaults to `math`; null adds no line */
  line?: MathText | null;
  /** several lines added at once (instead of `line`) */
  lines?: MathText[];
  /** the answer-model step this beat arrives at, and its value */
  answerStep?: string;
  result?: number;
}

/** Lines of the chain, one per beat that adds one, each appearing at its own beat. */
export function buildChain(steps: ChainBeat[], alt: string): ChainDiagram {
  const lines = steps.flatMap((b, i) => (b.lines ?? (b.line === null ? [] : [b.line ?? b.math])).map(math => ({ math, from: i })));
  return { kind: "chain", lines, alt };
}

/** An explanation whose beats play one after another; the picture is the chain unless another diagram is given. */
export function beatExplanation(o: {
  heading: string;
  idea?: RichText[];
  statement: MathText;
  caption?: RichText;
  steps: ChainBeat[];
  alt: string;
  diagram?: DiagramModel;
}): Explanation {
  const steps: ExplanationStep[] = o.steps.map((b, i) => ({
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
    diagram: o.diagram ?? buildChain(o.steps, o.alt),
    ...(o.caption ? { caption: o.caption } : {}),
    timeline: beats(o.steps.length),
    steps,
  };
}
