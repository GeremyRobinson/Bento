import { num, op } from "../../../schemas/math-text";
import type { LessonDefinition } from "../../../schemas/lesson";
import { splitMultiplicationAnswers } from "./answers";
import { explainSplitMultiplication } from "./explanation";
import { createSplitMultiplication, generateSplitMultiplication, restoreSplitMultiplication, type SplitMultiplicationProblem } from "./problem";

export const splitMultiplication: LessonDefinition<SplitMultiplicationProblem> = {
  id: "g5-mult2", // same id as the current app, so saved scores carry over
  grade: 5,
  unit: "Whole numbers",
  title: "Multiply two-digit numbers",
  reference: createSplitMultiplication(47, 36),
  generate: rng => generateSplitMultiplication(rng),
  restore: restoreSplitMultiplication,
  display: p => [num(p.firstFactor), op("×"), num(p.secondFactor)],
  answers: splitMultiplicationAnswers,
  explain: explainSplitMultiplication,
};
