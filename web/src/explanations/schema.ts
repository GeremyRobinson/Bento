import type { MathText } from "../curriculum/schemas/math-text";
import type { AreaDiagram } from "./diagrams/area-model/schema";

/** Every diagram family adds its model to this union. */
export type DiagramModel = AreaDiagram;

/** Animation is a list of named states; the renderer only needs the current index. */
export type AnimationState =
  | { phase: "factors" }
  | { phase: "split" }
  | { phase: "region"; index: number }
  | { phase: "sum" };

/** One beat of the explanation: what is said, the math shown, what lights up, and the answer it leads to. */
export interface ExplanationStep {
  id: string;
  narration: string;
  math: MathText;
  /** index into the timeline this step plays */
  state: number;
  /** answer-model step this beat explains, when there is one */
  answerStep?: string;
  /** value the beat arrives at; equals the answer model's expected value */
  result: number;
}

export interface Explanation {
  heading: string;
  /** the problem in one line, e.g. 47 × 36 = 47 × (30 + 6) */
  statement: MathText;
  diagram: DiagramModel;
  timeline: AnimationState[];
  steps: ExplanationStep[];
}
