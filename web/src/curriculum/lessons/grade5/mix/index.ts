import type { LessonDefinition } from "../../../schemas/lesson";
import { createUnlikeFractions, explainUnlike, generateUnlikeFractions, restoreUnlikeFractions, showUnlike, storyFor, unlikeAnswers, type UnlikeFractionsProblem } from "../../_tape-family/unlike";

export const lesson: LessonDefinition<UnlikeFractionsProblem> = {
  id: "mix",
  grade: 5,
  unit: "Fractions",
  title: "Adding and subtracting",
  pre: "add",
  // the current app's card: 2/3 + 1/4 and 2/3 − 1/4
  reference: createUnlikeFractions(2, 3, 1, 4, "+"),
  // plus on even problems, minus on odd ones, as the current app
  generate: (rng, i) => generateUnlikeFractions(rng, i, i % 2 ? "−" : "+"),
  restore: raw => restoreUnlikeFractions(raw, "+"),
  display: showUnlike,
  answers: unlikeAnswers,
  explain: explainUnlike("mix"),
  story: storyFor("mix"),
};
