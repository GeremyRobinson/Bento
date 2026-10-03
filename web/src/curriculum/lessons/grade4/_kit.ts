// Small helpers the new 4th grade lessons share. (A file, not a folder with index.ts, so the registry skips it.)
import type { MathText } from "../../schemas/math-text";
import type { AnswerStep, RichText } from "../../schemas/lesson";

/** Predictable slips, minus any that equal the right answer or repeat an earlier one. */
export function slips(ans: number, list: [number, string, RichText][]): [number, string, RichText][] {
  const seen = new Set<number>([ans]);
  return list.filter(([v]) => {
    if (!Number.isFinite(v) || seen.has(v)) return false;
    seen.add(v);
    return true;
  });
}

/** Several-box slips, minus any that match the right answer in every box or repeat an earlier one. */
export function boxSlips(ans: Record<string, number>, list: [Record<string, number>, string, RichText][]): [Record<string, number>, string, RichText][] {
  const key = (v: Record<string, number>) => Object.keys(ans).map(k => v[k]).join("|");
  const seen = new Set<string>([key(ans)]);
  return list.filter(([v]) => {
    const k = key(v);
    if (Object.values(v).some(x => !Number.isFinite(x)) || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export const COMPARE = ["<", "=", ">"] as const;
/** The index of the right sign for x ? y in COMPARE. */
export const compareIndex = (x: number, y: number) => (x < y ? 0 : x === y ? 1 : 2);
export const signName = ["is less than", "is equal to", "is greater than"] as const;

/**
 * A tap-to-answer step: the student taps one of `choices`; the slot "c" expects the right index.
 * `wrong` gives a message for each wrong choice, by index.
 */
export function tapStep(o: {
  id: string;
  label: string;
  question?: RichText;
  prompt: MathText;
  choices: readonly string[];
  ans: number;
  wrong: Record<number, [string, RichText]>;
  hint: RichText;
  explain: RichText;
  work: MathText;
}): AnswerStep {
  return {
    id: o.id,
    label: o.label,
    ...(o.question ? { question: o.question } : {}),
    prompt: o.prompt,
    choices: [...o.choices],
    slots: [{ id: "c", expected: o.ans }],
    known: Object.entries(o.wrong)
      .filter(([i]) => Number(i) !== o.ans)
      .map(([i, [kind, message]]) => ({ values: { c: Number(i) }, kind, message })),
    hint: o.hint,
    explain: o.explain,
    work: o.work,
  };
}
