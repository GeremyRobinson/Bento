import type { Rng } from "../generators/rng";
import type { MathText } from "./math-text";
import type { Explanation } from "../../explanations/schema";

export type GradeNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/** One box the student fills in, with the value the answer model expects. */
export interface AnswerSlot {
  id: string;
  expected: number;
}

/** A wrong answer we can predict from the problem, with the reason it happens. */
export interface KnownMistake {
  slot: string;
  value: number;
  kind: string;
  message: string;
}

/** One step of the derived answer model. Every number in it comes from the canonical problem. */
export interface AnswerStep {
  id: string;
  label: string;
  /** an optional instruction above the math */
  question?: string;
  /** the math with answer boxes in it */
  prompt: MathText;
  slots: AnswerSlot[];
  known: KnownMistake[];
  hint: string;
  /** what "Show me" says after filling the answer in */
  explain: string;
  /** the finished line that stays on screen once the step is done */
  work: MathText;
}

export interface AnswerModel {
  steps: AnswerStep[];
  /** which steps together make the final answer (negative counts from the end); default: the last step */
  finalParts: number[];
}

/**
 * A lesson is a pipeline: generate → canonical problem → answer model → explanation.
 * Nothing problem-specific is written anywhere else.
 */
export interface LessonDefinition<P = unknown> {
  id: string;
  grade: GradeNumber;
  unit: string;
  title: string;
  /** the worked example the learn screen opens on; "New example" generates more */
  reference: P;
  generate(rng: Rng, index: number): P;
  /** validates a stored or imported problem and returns it as a canonical model, or null */
  restore(raw: unknown): P | null;
  display(problem: P): MathText;
  answers(problem: P): AnswerModel;
  explain(problem: P, answers: AnswerModel): Explanation;
}

/** Erases the problem type so lessons of different kinds can live in one registry. */
export type AnyLesson = LessonDefinition<any>;
