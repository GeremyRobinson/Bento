import type { Rng } from "../../../generators/rng";
import { ints, nz } from "../../_plane/kit";

/** Two points on a line; the slope is rise over run, second point minus first. */
export interface SlopeProblem {
  kind: "slope.twoPoints";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** (y2 − y1) ÷ (x2 − x1) */
  m: number;
}

export function createSlope(x1: number, y1: number, x2: number, y2: number): SlopeProblem {
  if (x2 === x1) throw new Error("the run can't be 0");
  if (y2 === y1) throw new Error("the rise can't be 0");
  return { kind: "slope.twoPoints", x1, y1, x2, y2, m: (y2 - y1) / (x2 - x1) };
}

/** Same ranges as the current app: x1 in −5..5, run 1..5, slope ±1..4, y1 in −6..6. */
export function generateSlope(rng: Rng): SlopeProblem {
  const x1 = rng.int(-5, 5), run = rng.int(1, 5), m = nz(rng, -4, 4), y1 = rng.int(-6, 6);
  return createSlope(x1, y1, x1 + run, y1 + m * run);
}

export function restoreSlope(raw: unknown): SlopeProblem | null {
  const r = ints(raw, ["x1", "y1", "x2", "y2"] as const);
  if (!r) return null;
  try {
    return createSlope(r.x1, r.y1, r.x2, r.y2);
  } catch {
    return null;
  }
}
