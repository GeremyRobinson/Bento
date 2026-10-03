// Small helpers the 2nd grade lessons share. This file is not a lesson (the registry only loads <id>/index.ts).
import type { RichText } from "../../schemas/lesson";

export type Slip = [number, string, RichText];

/**
 * Keeps only the slips a student could really type: whole, not negative, not the right answer,
 * and not a value an earlier slip already explains.
 */
export function slips(ans: number, list: (Slip | false | null | undefined)[]): Slip[] {
  const seen = new Set<number>([ans]);
  const out: Slip[] = [];
  for (const s of list) {
    if (!s) continue;
    const [v] = s;
    if (!Number.isInteger(v) || v < 0 || seen.has(v)) continue;
    seen.add(v);
    out.push(s);
  }
  return out;
}

/** "1 ten", "3 tens". */
export const count = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
