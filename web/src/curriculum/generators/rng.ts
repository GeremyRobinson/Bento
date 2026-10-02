// Seeded random numbers, so a problem can be reproduced from its seed in tests and bug reports.
export interface Rng {
  /** float in [0, 1) */
  next(): number;
  /** integer in [lo, hi], both ends included */
  int(lo: number, hi: number): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
}

// mulberry32: small, fast, and good enough for picking practice problems
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (lo: number, hi: number) => lo + Math.floor(next() * (hi - lo + 1));
  return {
    next,
    int,
    pick: items => {
      if (!items.length) throw new Error("pick from an empty list");
      return items[int(0, items.length - 1)]!;
    },
    shuffle: items => {
      const out = [...items];
      for (let i = out.length - 1; i > 0; i--) {
        const j = int(0, i);
        [out[i], out[j]] = [out[j]!, out[i]!];
      }
      return out;
    },
  };
}

export const randomSeed = () => Math.floor(Math.random() * 2 ** 32);
