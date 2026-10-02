import { op, text } from "../../../schemas/math-text";
import type { LessonDefinition } from "../../../schemas/lesson";
import { perpAnswers, slopeMath } from "./answers";
import { explainPerp } from "./explanation";
import { createPerp, generatePerp, restorePerp, type PerpProblem } from "./problem";

export const lesson: LessonDefinition<PerpProblem> = {
  id: "g10-perp",
  grade: 10,
  unit: "Coordinate geometry",
  title: "Perpendicular slopes",
  reference: createPerp(2, 3),
  generate: rng => generatePerp(rng),
  restore: restorePerp,
  display: q => [text("m"), op("="), ...slopeMath(q)],
  displayNote: () => "Find the slope of a perpendicular line.",
  answers: perpAnswers,
  explain: explainPerp,
};
