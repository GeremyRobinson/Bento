import type { Rng } from "../../../generators/rng";
import { attempt, ints, nz } from "../../_plane/kit";

/** f(x) = a·x + b, evaluated at x. */
export interface FuncProblem {
  kind: "function.evaluateLinear";
  a: number;
  b: number;
  x: number;
  /** f(x) */
  value: number;
}

export function createFunc(a: number, b: number, x: number): FuncProblem {
  if (a === 0) throw new Error("a must not be 0");
  return { kind: "function.evaluateLinear", a, b, x, value: a * x + b };
}

/** Same ranges as the current app: a −6..9 and b −12..12 (neither 0), x −6..6. */
export const generateFunc = (rng: Rng) => createFunc(nz(rng, -6, 9), nz(rng, -12, 12), rng.int(-6, 6));

export function restoreFunc(raw: unknown): FuncProblem | null {
  const r = ints(raw, ["a", "b", "x"] as const);
  return r && attempt(() => createFunc(r.a, r.b, r.x));
}
