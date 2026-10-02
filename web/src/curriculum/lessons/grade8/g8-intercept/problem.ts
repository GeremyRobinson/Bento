import type { Rng } from "../../../generators/rng";
import { attempt, ints, nz } from "../../_plane/kit";

/** A line with slope m through (x0, y0); its y-intercept is b = y0 − m·x0. */
export interface InterceptProblem {
  kind: "line.slopePoint";
  m: number;
  x0: number;
  y0: number;
  b: number;
}

export function createIntercept(m: number, x0: number, y0: number): InterceptProblem {
  return { kind: "line.slopePoint", m, x0, y0, b: y0 - m * x0 };
}

/** Same ranges as the current app: m ±1..5, x0 ±1..5, y0 −10..10. */
export const generateIntercept = (rng: Rng) => createIntercept(nz(rng, -5, 5), nz(rng, -5, 5), rng.int(-10, 10));

export function restoreIntercept(raw: unknown): InterceptProblem | null {
  const r = ints(raw, ["m", "x0", "y0"] as const);
  return r && attempt(() => createIntercept(r.m, r.x0, r.y0));
}
