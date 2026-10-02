import type { Rng } from "../../../generators/rng";
import { attempt, ints } from "../../_plane/kit";

/** Two points whose midpoint has whole coordinates. */
export interface MidProblem {
  kind: "coordinate.midpoint";
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  mx: number;
  my: number;
}

export function createMid(x1: number, y1: number, x2: number, y2: number): MidProblem {
  if (x1 === x2 && y1 === y2) throw new Error("the points must differ");
  return { kind: "coordinate.midpoint", x1, y1, x2, y2, mx: (x1 + x2) / 2, my: (y1 + y2) / 2 };
}

/** Same ranges as the current app: coordinates −9..9 with even sums, so the midpoint is whole. */
export function generateMid(rng: Rng): MidProblem {
  let x1: number, x2: number, y1: number, y2: number;
  do { x1 = rng.int(-9, 9); x2 = rng.int(-9, 9); y1 = rng.int(-9, 9); y2 = rng.int(-9, 9); }
  while ((x1 + x2) % 2 || (y1 + y2) % 2 || (x1 === x2 && y1 === y2));
  return createMid(x1, y1, x2, y2);
}

export function restoreMid(raw: unknown): MidProblem | null {
  const v = ints(raw, ["x1", "y1", "x2", "y2"] as const);
  return v && attempt(() => createMid(v.x1, v.y1, v.x2, v.y2));
}
