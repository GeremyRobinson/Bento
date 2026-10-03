import type { AnyLesson } from "./schemas/lesson";
import { CATALOG } from "./catalog";
import { withSingulars } from "./plural";

// Every lesson module registers itself by living at lessons/<grade>/<id>/index.ts and exporting `lesson`.
const modules = import.meta.glob<{ lesson: AnyLesson }>("./lessons/*/*/index.ts", { eager: true });
const BY_ID = new Map(Object.values(modules).map(m => [m.lesson.id, withSingulars(m.lesson)]));

/** Lessons rebuilt so far, in curriculum order (the catalog's). */
export const LESSONS: AnyLesson[] = CATALOG.flatMap(c => {
  const l = BY_ID.get(c.id);
  return l ? [l] : [];
});

export const lessonById = (id: string): AnyLesson | undefined => BY_ID.get(id);

export function requireLesson(id: string): AnyLesson {
  const l = lessonById(id);
  if (!l) throw new Error(`no lesson ${id}`);
  return l;
}

export const lessonsInGrade = (g: number) => LESSONS.filter(l => l.grade === g);

export function unitsOf(g: number): { name: string; lessons: AnyLesson[] }[] {
  const out: { name: string; lessons: AnyLesson[] }[] = [];
  for (const l of lessonsInGrade(g)) {
    let u = out.find(o => o.name === l.unit);
    if (!u) out.push((u = { name: l.unit, lessons: [] }));
    u.lessons.push(l);
  }
  return out;
}
