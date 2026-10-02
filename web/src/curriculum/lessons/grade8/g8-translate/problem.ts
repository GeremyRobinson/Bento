import type { Rng } from "../../../generators/rng";
import { attempt, ints, nz } from "../../_plane/kit";

/** A point slid dx across (right is +) and dy up (up is +). */
export interface TranslateProblem {
  kind: "translate.point";
  x: number;
  y: number;
  dx: number;
  dy: number;
  /** where it lands */
  x2: number;
  y2: number;
}

export function createTranslate(x: number, y: number, dx: number, dy: number): TranslateProblem {
  if (dx === 0 || dy === 0) throw new Error("both moves must be non-zero");
  return { kind: "translate.point", x, y, dx, dy, x2: x + dx, y2: y + dy };
}

/** Same ranges as the current app: the point in −8..8, each move ±1..6. */
export const generateTranslate = (rng: Rng) => createTranslate(rng.int(-8, 8), rng.int(-8, 8), nz(rng, -6, 6), nz(rng, -6, 6));

export function restoreTranslate(raw: unknown): TranslateProblem | null {
  const r = ints(raw, ["x", "y", "dx", "dy"] as const);
  return r && attempt(() => createTranslate(r.x, r.y, r.dx, r.dy));
}
