// What the screens list: every lesson of the current app (the catalog), whether or not its module is rebuilt yet.
// Scores carried over from the current app belong to catalog ids, so lists, counts and averages use the catalog;
// only rebuilt lessons can be opened.
import { CATALOG, type CatalogEntry } from "../curriculum/catalog";
import { lessonById } from "../curriculum/registry";
import { lastScore, timesDone, type Progress } from "../engine/mastery/progress";
import { testKey } from "../engine/session/practice";

export type Entry = CatalogEntry;

export const entriesInGrade = (g: number): Entry[] => CATALOG.filter(c => c.grade === g);
export const entryById = (id: string): Entry | undefined => CATALOG.find(c => c.id === id);
export const isReady = (id: string) => !!lessonById(id);
export const titleOf = (id: string) => lessonById(id)?.title ?? entryById(id)?.title ?? id;

export function unitsInGrade(g: number): { name: string; entries: Entry[] }[] {
  const out: { name: string; entries: Entry[] }[] = [];
  for (const c of entriesInGrade(g)) {
    const name = c.unit || "Skills";
    let u = out.find(o => o.name === name);
    if (!u) out.push((u = { name, entries: [] }));
    u.entries.push(c);
  }
  return out;
}

/** Average of the last scores in a grade, or null when nothing is scored yet (the current app's gradeLevel). */
export function gradeAverage(p: Progress, g: number): number | null {
  const s: number[] = entriesInGrade(g).flatMap(c => { const v = lastScore(p, c.id); return v == null ? [] : [v]; });
  return s.length ? s.reduce((a, b) => a + b, 0) / s.length : null;
}

export const doneCount = (p: Progress, entries: Entry[]) => entries.filter(c => timesDone(p, c.id) > 0).length;

/** A unit test or grade check-up can start once at least one of its lessons is rebuilt. */
export const testReady = (g: number, unit?: string) =>
  entriesInGrade(g).some(c => (!unit || (c.unit || "Skills") === unit) && isReady(c.id));

export { testKey };
