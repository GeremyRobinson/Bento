import type { LessonDefinition } from "../../../schemas/lesson";
import { solveFactorAnswers } from "./answers";
import { explainSolveFactor, solveFactorMath } from "./explanation";
import { createSolveFactor, generateSolveFactor, restoreSolveFactor, type SolveFactorProblem } from "./problem";

export const lesson: LessonDefinition<SolveFactorProblem> = {
  id: "g9-solvefactor",
  grade: 9,
  unit: "Polynomials and quadratics",
  title: "Solve by factoring",
  reference: createSolveFactor(2, 3),
  generate: rng => generateSolveFactor(rng),
  restore: restoreSolveFactor,
  display: solveFactorMath,
  answers: solveFactorAnswers,
  explain: explainSolveFactor,
};
