import type { AnyLesson } from "./schemas/lesson";
import { splitMultiplication } from "./lessons/grade5/split-multiplication";

/** Lessons rebuilt so far, in curriculum order. Later milestones add the rest of the current app's 122. */
export const LESSONS: AnyLesson[] = [splitMultiplication];

export const lessonById = (id: string): AnyLesson | undefined => LESSONS.find(l => l.id === id);

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
