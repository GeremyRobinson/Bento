import type { Rng } from "../../../generators/rng";
import { attempt, gcd, ints, nz } from "../../_plane/kit";

/** A slope p/r in lowest terms (r > 0); the perpendicular slope is −r/p. */
export interface PerpProblem {
  kind: "slope.perpendicular";
  p: number;
  r: number;
}

export function createPerp(p: number, r: number): PerpProblem {
  if (p === 0 || r <= 0 || gcd(Math.abs(p), r) !== 1) throw new Error("need p ≠ 0, r > 0 and p/r in lowest terms");
  return { kind: "slope.perpendicular", p, r };
}

/** Same ranges as the current app: p ±1..6, r 1..6, in lowest terms. */
export function generatePerp(rng: Rng): PerpProblem {
  let p: number, r: number;
  do { p = nz(rng, -6, 6); r = rng.int(1, 6); } while (gcd(Math.abs(p), r) !== 1);
  return createPerp(p, r);
}

export function restorePerp(raw: unknown): PerpProblem | null {
  const v = ints(raw, ["p", "r"] as const);
  return v && attempt(() => createPerp(v.p, v.r));
}
