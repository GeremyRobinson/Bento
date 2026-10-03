// How well each fact is known, and which ones a sprint should ask. A fact climbs one level each time it's answered
// right and quickly, and drops back to the start when it's missed; higher levels come back less often (1, 2, 4, 8
// days), so time goes to the facts that need it. Level 3 or more counts as known.
import type { Rng } from "../../curriculum/generators/rng";
import { factKey, tableById, type Fact, type FactTable } from "./tables";

export interface FactRecord {
  /** 0 new … 5 solid */
  s: number;
  /** when it should come back (ms) */
  due: number;
  /** times asked */
  n: number;
}

/** One finished sprint, for the grown-up page and the daily plan. */
export interface SprintRecord {
  date: number;
  table: string;
  right: number;
  total: number;
  ms: number;
}

export const KNOWN = 3;
/** answered faster than this counts as known by heart */
export const FAST_MS = 4000;
const DAY = 864e5;
const GAPS = [0, DAY, 2 * DAY, 4 * DAY, 8 * DAY, 16 * DAY];

export function updateFact(rec: FactRecord | undefined, right: boolean, ms: number, now: number): FactRecord {
  const s0 = rec?.s ?? 0, n = (rec?.n ?? 0) + 1;
  const s = !right ? 0 : ms <= FAST_MS ? Math.min(5, s0 + 1) : s0;
  return { s, n, due: now + (right ? GAPS[s]! : 0) };
}

export const levelOf = (facts: Record<string, FactRecord>, t: FactTable, f: Fact) => facts[factKey(t, f)]?.s ?? 0;

export function tableProgress(facts: Record<string, FactRecord>, t: FactTable): { known: number; total: number } {
  return { known: t.facts.filter(f => levelOf(facts, t, f) >= KNOWN).length, total: t.facts.length };
}

/**
 * The facts for one sprint: due ones first (a missed fact comes straight back), then new ones in table order, then
 * the weakest of the rest. Shuffled, and never the same fact twice in a row.
 */
export function pickSprint(facts: Record<string, FactRecord>, t: FactTable, size: number, now: number, rng: Rng): Fact[] {
  const rec = (f: Fact) => facts[factKey(t, f)];
  const due = t.facts.filter(f => rec(f) && rec(f)!.due <= now).sort((a, b) => rec(a)!.s - rec(b)!.s);
  const fresh = rng.shuffle(t.facts.filter(f => !rec(f)));
  const rest = t.facts.filter(f => rec(f) && rec(f)!.due > now).sort((a, b) => rec(a)!.s - rec(b)!.s);
  // a few new facts at a time, so a sprint is mostly wins
  const picked = [...due.slice(0, size), ...fresh.slice(0, Math.max(3, Math.ceil(size / 3))), ...rest].slice(0, size);
  while (picked.length < size && t.facts.length) picked.push(t.facts[rng.int(0, t.facts.length - 1)]!);
  const out = rng.shuffle(picked);
  for (let i = 1; i < out.length; i++) if (out[i] === out[i - 1]) { const j = (i + 1) % out.length; [out[i], out[j]] = [out[j]!, out[i]!]; }
  return out;
}

/**
 * The table a "today's sprint" should use: of the tables with facts due or still to learn, the one that starts
 * closest to this grade (3rd grade gets times tables before adding to 20).
 */
export function sprintTableFor(facts: Record<string, FactRecord>, tables: FactTable[], now: number): FactTable | undefined {
  return [...tables].sort((a, b) => b.grades[0] - a.grades[0]).find(t => t.facts.some(f => { const r = facts[factKey(t, f)]; return !r || r.s < KNOWN || r.due <= now; })) ?? tables[0];
}

export const sprintDoneToday = (sprints: SprintRecord[], now: number) => sprints.some(s => new Date(s.date).toDateString() === new Date(now).toDateString());

export { tableById };

/** One answer in a sprint: the fact, whether the first try was right, and how long it took. */
export interface SprintAnswer { key: string; right: boolean; ms: number }

/** Saves a finished sprint: each fact's level, the sprint itself, a little XP (1 per right answer) and the day's streak. */
export function finishSprint<P extends { facts: Record<string, FactRecord>; sprints: SprintRecord[]; xp: number; gxp: Record<number, number>; streak: number; last: string }>(
  p: P, table: string, grade: number | null, answers: SprintAnswer[], now: number,
): P {
  const facts = { ...p.facts };
  for (const a of answers) facts[a.key] = updateFact(facts[a.key], a.right, a.ms, now);
  const right = answers.filter(a => a.right).length, ms = answers.reduce((t, a) => t + a.ms, 0);
  const today = new Date(now).toDateString(), yesterday = new Date(now - 864e5).toDateString();
  return {
    ...p, facts,
    sprints: [...p.sprints, { date: now, table, right, total: answers.length, ms }].slice(-200),
    xp: p.xp + right, gxp: grade == null ? p.gxp : { ...p.gxp, [grade]: (p.gxp[grade] ?? 0) + right },
    streak: p.last === today ? p.streak : p.last === yesterday ? p.streak + 1 : 1, last: today,
  };
}
