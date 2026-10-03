import type { AnswerModel, AnswerStep, AnyLesson } from "./schemas/lesson";
import { CATALOG } from "./catalog";
import { eq } from "../engine/evaluation/numbers";

/**
 * Some slips equal the right answer for some numbers ("2² means 2 × 2, not 2 × 2"). Right answers are checked first,
 * so a child never sees them, but they'd still show up as mistakes the step knows about. Drop them here, once.
 */
const isAnswer = (s: AnswerStep, values: Record<string, number>) =>
  s.slots.every(x => (x.expected == null ? values[x.id] == null : eq(values[x.id], x.expected)));
export const dropDeadSlips = (m: AnswerModel): AnswerModel =>
  ({ ...m, steps: m.steps.map(s => (s.known.some(k => isAnswer(s, k.values)) ? { ...s, known: s.known.filter(k => !isAnswer(s, k.values)) } : s)) });
const live = (l: AnyLesson): AnyLesson => ({ ...l, answers: (p: never) => dropDeadSlips(l.answers(p)) }) as AnyLesson;

// Every lesson module registers itself by living at lessons/<grade>/<id>/index.ts and exporting `lesson`.
const modules = import.meta.glob<{ lesson: AnyLesson }>("./lessons/*/*/index.ts", { eager: true });
const BY_ID = new Map(Object.values(modules).map(m => [m.lesson.id, live(m.lesson)]));

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
