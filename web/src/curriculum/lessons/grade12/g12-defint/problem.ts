import type { Rng } from "../../../generators/rng";
import { attempt, ints } from "../../_plane/kit";

/** ∫ from 0 to k of a·xⁿ dx, with a a multiple of n + 1 so the antiderivative's coefficient is whole. */
export interface DefIntProblem {
  kind: "integral.definitePower";
  n: number;
  a: number;
  k: number;
  /** a ÷ (n + 1), the antiderivative's coefficient */
  c: number;
  /** c·k^(n+1): the area */
  area: number;
}

export function createDefInt(n: number, a: number, k: number): DefIntProblem {
  if (n < 1 || k < 1 || a === 0 || a % (n + 1)) throw new Error("need n ≥ 1, k ≥ 1 and a a multiple of n + 1");
  const c = a / (n + 1);
  return { kind: "integral.definitePower", n, a, k, c, area: c * k ** (n + 1) };
}

/** Same ranges as the current app: n 1..3, a = (n + 1) × 1..3, k 1..3. */
export function generateDefInt(rng: Rng): DefIntProblem {
  const n = rng.int(1, 3);
  return createDefInt(n, (n + 1) * rng.int(1, 3), rng.int(1, 3));
}

export function restoreDefInt(raw: unknown): DefIntProblem | null {
  const r = ints(raw, ["n", "a", "k"] as const);
  return r && attempt(() => createDefInt(r.n, r.a, r.k));
}
