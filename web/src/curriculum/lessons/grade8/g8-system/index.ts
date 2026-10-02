import type { LessonDefinition } from "../../../schemas/lesson";
import { systemAnswers } from "./answers";
import { explainSystem, systemMath } from "./explanation";
import { createSystem, generateSystem, restoreSystem, type SystemProblem } from "./problem";

export const lesson: LessonDefinition<SystemProblem> = {
  id: "g8-system",
  grade: 8,
  unit: "Linear equations",
  title: "Systems by substitution",
  reference: createSystem(2, 5),
  generate: rng => generateSystem(rng),
  restore: restoreSystem,
  display: systemMath,
  answers: systemAnswers,
  explain: explainSystem,
};
