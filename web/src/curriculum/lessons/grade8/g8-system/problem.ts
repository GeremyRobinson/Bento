import type { Rng } from "../../../generators/rng";
import { attempt, ints } from "../../_plane/kit";

/** y = k·x and x + y = s, solved by putting k·x in place of y. The lines cross at (x, k·x). */
export interface SystemProblem {
  kind: "system.substitution";
  k: number;
  x: number;
  /** x + y, the second equation's right side: (k + 1)·x */
  s: number;
  y: number;
}

export function createSystem(k: number, x: number): SystemProblem {
  if (k + 1 === 0) throw new Error("k + 1 can't be 0");
  return { kind: "system.substitution", k, x, s: (k + 1) * x, y: k * x };
}

/** Same ranges as the current app: k 2..5, x 1..10. */
export const generateSystem = (rng: Rng) => createSystem(rng.int(2, 5), rng.int(1, 10));

export function restoreSystem(raw: unknown): SystemProblem | null {
  const r = ints(raw, ["k", "x"] as const);
  return r && attempt(() => createSystem(r.k, r.x));
}
