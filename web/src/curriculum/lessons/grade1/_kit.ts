// Small helpers the 1st grade lessons share: slip lists that never contain the right answer,
// and tap-to-answer steps (comparison signs, halves and quarters).
import { num, text, type MathText } from "../../schemas/math-text";
import type { AnswerStep, RichText } from "../../schemas/lesson";

export type Slip = [number, string, RichText];
export type SlipMany = [Record<string, number>, string, RichText];

/** Keeps the slips a 6-year-old could type (whole numbers 0 to 120) that differ from the answer and from each other. */
export function slips(ans: number, list: Slip[]): Slip[] {
  const seen = new Set<number>([ans]);
  return list.filter(([v]) => {
    if (!Number.isInteger(v) || v < 0 || v > 120 || seen.has(v)) return false;
    seen.add(v);
    return true;
  });
}

/** The same for several boxes checked together. */
export function slipsMany(ans: Record<string, number>, list: SlipMany[]): SlipMany[] {
  const key = (v: Record<string, number>) => Object.keys(ans).map(k => v[k]).join(",");
  const seen = new Set<string>([key(ans)]);
  return list.filter(([v]) => {
    const vals = Object.keys(ans).map(k => v[k]);
    if (vals.some(x => x == null || !Number.isInteger(x) || x < 0 || x > 120)) return false;
    const k = key(v);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** A tap-to-answer step: one slot "c" holding the index of the right choice, and a message for each wrong tap. */
export function choiceStep(o: {
  id: string;
  label: string;
  question?: RichText;
  prompt: MathText;
  choices: string[];
  ans: number;
  /** [index tapped, kind, message] */
  wrong: Slip[];
  hint: RichText;
  explain: RichText;
  work: MathText;
}): AnswerStep {
  if (!o.choices[o.ans]) throw new Error(`choice ${o.ans} is not one of ${o.choices.join(", ")}`);
  return {
    id: o.id,
    label: o.label,
    ...(o.question ? { question: o.question } : {}),
    prompt: o.prompt,
    slots: [{ id: "c", expected: o.ans }],
    choices: o.choices,
    known: o.wrong.filter(([i]) => i !== o.ans && o.choices[i] != null).map(([i, kind, message]) => ({ values: { c: i }, kind, message })),
    hint: o.hint,
    explain: o.explain,
    work: o.work,
  };
}

/** Tens and ones of a whole number. */
export const tensOf = (n: number) => Math.floor(n / 10);
export const onesOf = (n: number) => n % 10;
/** "1 ten" or "4 tens", "1 one" or "7 ones". */
export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "4 tens" as math: the number, then the word in the right form. */
export const count = (n: number, one: string, many: string): MathText => [num(n), text(` ${n === 1 ? one : many}`)];
