import type { Rng } from "../../../generators/rng";
import { attempt, ints } from "../../_plane/kit";

/** P bacteria multiply by r every hour, for t hours: P × rᵗ. */
export interface GrowthProblem {
  kind: "exponential.growth";
  P: number;
  r: number;
  t: number;
  /** rᵗ */
  factor: number;
  /** P × rᵗ */
  total: number;
}

export function createGrowth(P: number, r: number, t: number): GrowthProblem {
  if (P <= 0 || r < 2 || t < 1) throw new Error("need a positive start, r ≥ 2 and t ≥ 1");
  return { kind: "exponential.growth", P, r, t, factor: r ** t, total: P * r ** t };
}

/** Same choices as the current app: start 10, 20, 50, 100, 200 or 500; doubling or tripling; 2 to 5 hours. */
export const generateGrowth = (rng: Rng) => createGrowth(rng.pick([10, 20, 50, 100, 200, 500]), rng.int(2, 3), rng.int(2, 5));

export function restoreGrowth(raw: unknown): GrowthProblem | null {
  const r = ints(raw, ["P", "r", "t"] as const);
  return r && attempt(() => createGrowth(r.P, r.r, r.t));
}
