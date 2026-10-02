import type { Rng } from "../../../generators/rng";
import { attempt, ints } from "../../_plane/kit";

/** x² − (p + r)x + p·r = 0, which factors as (x − p)(x − r) = 0. */
export interface SolveFactorProblem {
  kind: "quadratic.solveByFactoring";
  p: number;
  r: number;
  /** the middle and last coefficients: x² + b·x + c */
  b: number;
  c: number;
}

export function createSolveFactor(p: number, r: number): SolveFactorProblem {
  if (p === r) throw new Error("the two roots must differ");
  return { kind: "quadratic.solveByFactoring", p, r, b: -(p + r), c: p * r };
}

/** Same ranges as the current app: two different roots from 1 to 9. */
export function generateSolveFactor(rng: Rng): SolveFactorProblem {
  let p: number, r: number;
  do { p = rng.int(1, 9); r = rng.int(1, 9); } while (p === r);
  return createSolveFactor(p, r);
}

export function restoreSolveFactor(raw: unknown): SolveFactorProblem | null {
  const v = ints(raw, ["p", "r"] as const);
  return v && attempt(() => createSolveFactor(v.p, v.r));
}
