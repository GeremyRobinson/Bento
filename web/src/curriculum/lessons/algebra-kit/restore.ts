// Reading a saved problem back (the current app saved plain objects of whole numbers), and small generator helpers.
import type { Rng } from "../../generators/rng";

/** The named fields of a saved problem, when every one is a whole number; otherwise null. */
export function readInts<K extends string>(raw: unknown, keys: readonly K[]): Record<K, number> | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const out = {} as Record<K, number>;
  for (const k of keys) {
    const v = r[k];
    if (typeof v !== "number" || !Number.isInteger(v)) return null;
    out[k] = v;
  }
  return out;
}

/** Builds the problem, or null when one of its rules doesn't hold. */
export function attempt<T>(make: () => T): T | null {
  try {
    return make();
  } catch {
    return null;
  }
}

/** Throws when a rule of the problem doesn't hold, so restore() turns bad saved data into null. */
export function rule(ok: boolean, what: string): void {
  if (!ok) throw new Error(`problem rule broken: ${what}`);
}

/** A whole number in [lo, hi] that isn't 0 (the current app's `nz`). */
export function nz(rng: Rng, lo: number, hi: number): number {
  let x: number;
  do x = rng.int(lo, hi);
  while (x === 0);
  return x;
}
