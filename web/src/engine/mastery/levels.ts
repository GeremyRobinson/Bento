/** 0–4 proficiency, like a standards-based report card. */
export const LEVELS = ["Not yet", "Beginning", "Approaching", "Proficient", "Advanced"] as const;
export type Level = 0 | 1 | 2 | 3 | 4;

/** 4 at 90% of step points, 3 at 75%, 2 at 50%, 1 at 25%. */
export const levelOf = (pct: number): Level => (pct >= 0.9 ? 4 : pct >= 0.75 ? 3 : pct >= 0.5 ? 2 : pct >= 0.25 ? 1 : 0);

/** XP for one grade level on the grade badge ring. */
export const LEVEL_XP = 300;

/** Points toward the score for one finished step. */
export function stepPoints(o: { shown: boolean; test: boolean; misses: number; hinted: boolean }): number {
  if (o.shown) return 0;
  if (o.test) return 1;
  if (o.misses === 0) return o.hinted ? 0.5 : 1;
  return o.misses === 1 ? 0.5 : 0.25;
}

/** XP for one finished problem. */
export function problemXp(o: { test: boolean; wrong: number; hints: number; shown: number }): number {
  if (o.test) return o.wrong ? 5 : 15;
  return o.shown ? 5 : o.wrong ? 10 : o.hints ? 12 : 15;
}
