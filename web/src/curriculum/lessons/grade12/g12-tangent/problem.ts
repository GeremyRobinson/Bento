import type { Rng } from "../../../generators/rng";
import { attempt, ints, nz } from "../../_plane/kit";

/** f(x) = a·x² + b·x and the point x = k where we want the tangent's slope. */
export interface TangentProblem {
  kind: "derivative.tangentSlope";
  a: number;
  b: number;
  k: number;
  /** f(k), where the tangent touches */
  fk: number;
  /** f′(k) = 2ak + b */
  slope: number;
}

export function createTangent(a: number, b: number, k: number): TangentProblem {
  if (a === 0) throw new Error("a must not be 0");
  return { kind: "derivative.tangentSlope", a, b, k, fk: a * k * k + b * k, slope: 2 * a * k + b };
}

/** Same ranges as the current app: a ±1..4, b ±1..9, k ±1..4. */
export const generateTangent = (rng: Rng) => createTangent(nz(rng, -4, 4), nz(rng, -9, 9), nz(rng, -4, 4));

export function restoreTangent(raw: unknown): TangentProblem | null {
  const r = ints(raw, ["a", "b", "k"] as const);
  return r && attempt(() => createTangent(r.a, r.b, r.k));
}
