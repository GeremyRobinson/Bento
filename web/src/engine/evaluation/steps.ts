import { slot, text, type MathText } from "../../curriculum/schemas/math-text";
import type { AnswerModel, AnswerSlot, AnswerStep, KnownMistake } from "../../curriculum/schemas/lesson";
import { eq } from "./numbers";

/** A step as practice uses it: the answer-model step plus its numbered label and help state. */
export interface RuntimeStep {
  id: string;
  /** "Step 2 · Multiply by the ones" */
  label: string;
  /** "Multiply by the ones", used by plan-the-step choices */
  base: string;
  question?: string;
  prompt: MathText;
  slots: AnswerSlot[];
  hint: string;
  explain: string;
  work: MathText;
  /** true for the final-answer shortcut that stands in for several steps */
  skipped?: boolean;
  note?: string;
  /** checks the typed values; for normal steps this is checkAnswerStep */
  parts: { step: AnswerStep; suffix: string }[];
}

export type CheckResult =
  | { ok: true }
  | { ok: false; soft: true; message: string }
  | { ok: false; soft?: false; kind: string; message: string; generic: boolean };

export function runtimeSteps(model: AnswerModel): RuntimeStep[] {
  return model.steps.map((s, k) => ({
    id: s.id,
    label: `Step ${k + 1} · ${s.label}`,
    base: s.label,
    ...(s.question ? { question: s.question } : {}),
    prompt: s.prompt,
    slots: s.slots,
    hint: s.hint,
    explain: s.explain,
    work: s.work,
    parts: [{ step: s, suffix: "" }],
  }));
}

/** Check one answer-model step against parsed values keyed by slot id. */
export function checkAnswerStep(step: AnswerStep, values: Record<string, number | null>): CheckResult {
  if (step.slots.every(s => eq(values[s.id], s.expected))) return { ok: true };
  const single = step.slots.length === 1 ? step.slots[0]! : null;
  if (single) {
    const known = step.known.find((k: KnownMistake) => k.slot === single.id && eq(values[single.id], k.value));
    if (known) return { ok: false, kind: known.kind, message: known.message, generic: false };
  }
  return { ok: false, kind: step.label, message: `Not quite. ${step.hint}`, generic: true };
}

/** Check a runtime step; the final-answer step checks each of its parts in turn. */
export function checkStep(step: RuntimeStep, values: Record<string, number | null>): CheckResult {
  const many = step.parts.length > 1;
  for (const { step: part, suffix } of step.parts) {
    const sub = Object.fromEntries(part.slots.map(s => [s.id, values[s.id + suffix] ?? null]));
    if (step.skipped && Object.values(sub).some(x => x == null)) return { ok: false, soft: true, message: "Fill in every box." };
    const r = checkAnswerStep(part, sub);
    if (!r.ok) return many && !r.soft ? { ...r, generic: false, kind: `${part.label}: ${r.kind}` } : r;
  }
  return { ok: true };
}

/** All boxes of a step with their expected values, using the step's own slot ids. */
export const expectedValues = (step: RuntimeStep): Record<string, number> =>
  Object.fromEntries(step.parts.flatMap(({ step: s, suffix }) => s.slots.map(x => [x.id + suffix, x.expected])));

/** The current app's "which steps make the final answer": negative counts from the end. */
export function finalPartsOf(steps: AnswerStep[], finalParts: number[]): AnswerStep[] {
  return finalParts.map(i => steps[(i + steps.length) % steps.length]!);
}

/** One "Final answer" step built from the last steps. Each part keeps its own check and mistake messages. */
export function finalStep(parts: AnswerStep[]): RuntimeStep {
  const many = parts.length > 1;
  const withSuffix = parts.map((step, j) => ({ step, suffix: many ? String(j) : "" }));
  const prompt: MathText = withSuffix.flatMap(({ step, suffix }) => [
    ...(many ? [text(`${step.label}: `)] : []),
    ...step.slots.map(s => slot(s.id + suffix)),
  ]);
  return {
    id: "final",
    label: "Final answer",
    base: "Final answer",
    question: "Type the final answer.",
    prompt,
    slots: withSuffix.flatMap(({ step, suffix }) => step.slots.map(s => ({ id: s.id + suffix, expected: s.expected }))),
    hint: parts.map(p => p.hint).join(" "),
    explain: parts.map(p => p.explain).join(" "),
    work: parts.flatMap((p, i) => (i ? [text("   "), ...p.work] : p.work)),
    skipped: true,
    note: "Steps skipped. Miss it and we'll go step by step.",
    parts: withSuffix,
  };
}
