// The practice engine: pure functions from one session state to the next.
// Same rules as the current app (index.html: newRun, startProblem, loadStep, check, hint, pass, showMe, nextProblem).
import { bandOf, type Band } from "../../curriculum/grades";
import type { Rng } from "../../curriculum/generators/rng";
import { formatNumber, toPlainText } from "../../curriculum/schemas/math-text";
import { lessonById, requireLesson, LESSONS } from "../../curriculum/registry";
import type { AnyLesson } from "../../curriculum/schemas/lesson";
import { canShowMe, canSkip, hintBudget, HINT_WAIT_MS, lessonLength, MAX_LESSON_LENGTH, RUSHED_MS, tierFor, type Tier } from "../adaptive-help/policy";
import { CATEGORIES, diagnose, nudge, SAY } from "../diagnosis/diagnose";
import { parseNumber } from "../evaluation/numbers";
import { checkStep, expectedValues, finalPartsOf, finalStep, runtimeSteps, type RuntimeStep } from "../evaluation/steps";
import { levelOf, problemXp, stepPoints } from "../mastery/levels";
import { lastScore, type Progress } from "../mastery/progress";
import { PRAISE } from "./praise";
import type { Mistake, PracticeSession, RunItem, SessionReport } from "./types";

/** Clock and randomness are passed in, so every rule can be tested exactly. */
export interface Deps {
  now: number;
  rng: Rng;
}

const isTest = (s: PracticeSession) => s.mode === "test";
export const currentItem = (s: PracticeSession): RunItem => s.items[s.i]!;
export const lessonOfItem = (it: RunItem): AnyLesson => requireLesson(it.lessonId);
export const bandOfSession = (s: PracticeSession): Band => bandOf(lessonOfItem(currentItem(s)).grade);

/** The canonical problem for the current item, re-validated by its lesson. */
export function problemOf(it: RunItem): unknown {
  const p = lessonOfItem(it).restore(it.problem);
  if (p == null) throw new Error(`stored problem for ${it.lessonId} is not valid`);
  return p;
}

/** Steps for the current problem, derived fresh from its answer model each time. */
export function stepsOf(s: PracticeSession): RuntimeStep[] {
  const it = currentItem(s), lesson = lessonOfItem(it);
  const model = lesson.answers(problemOf(it));
  return s.collapsed ? [finalStep(finalPartsOf(model.steps, model.finalParts))] : runtimeSteps(model);
}

export const currentStep = (s: PracticeSession): RuntimeStep | undefined => (s.solved ? undefined : stepsOf(s)[s.step]);

const makeItem = (lesson: AnyLesson, index: number, rng: Rng): RunItem => ({ lessonId: lesson.id, problem: lesson.generate(rng, index) });

// ---------------------------------------------------------------- starting

export function startPractice(lessonId: string, progress: Progress, deps: Deps): PracticeSession {
  const lesson = requireLesson(lessonId);
  const n = lessonLength(lastScore(progress, lessonId));
  const items = Array.from({ length: n }, (_, i) => makeItem(lesson, i, deps.rng));
  const startTier = tierFor(lastScore(progress, lessonId));
  return newRun({ mode: "practice", key: lesson.id, title: lesson.title, items, startTier }, progress, deps);
}

function newRun(o: { mode: PracticeSession["mode"]; key: string; title: string; items: RunItem[]; startTier: Tier; hintsLeft?: number },
  progress: Progress, deps: Deps): PracticeSession {
  const s: PracticeSession = {
    mode: o.mode, key: o.key, title: o.title, items: o.items, i: 0, step: 0, work: [],
    collapsed: false, skip: true, skipThis: true, tier: 0, startTier: o.startTier,
    values: {}, active: null, pick: null, misses: 0, hinted: false,
    hintsLeft: o.hintsLeft ?? hintBudget(o.items.length), lastTry: 0, stepT0: deps.now,
    prob: { wrong: 0, hints: 0, shown: 0, t0: deps.now },
    pts: 0, maxPts: 0, clean: 0, extra: 0, xpEarned: 0, hints: 0, shown: 0,
    mistakes: [], probs: [], feedback: null, fx: null, t0: deps.now, solved: false,
  };
  return startProblem(s, progress, deps);
}

function startProblem(s: PracticeSession, progress: Progress, deps: Deps): PracticeSession {
  const tier = isTest(s) ? 0 : tierFor(lastScore(progress, currentItem(s).lessonId));
  const next: PracticeSession = {
    ...s, step: 0, work: [], solved: false, collapsed: false, skipThis: true, tier,
    prob: { wrong: 0, hints: 0, shown: 0, t0: deps.now },
  };
  return loadStep(next, deps);
}

/** Prepare the current step: collapse to a final answer when allowed, offer plan choices at tier 1, clear the boxes. */
function loadStep(s: PracticeSession, deps: Deps): PracticeSession {
  let next = { ...s };
  const full = runtimeSteps(lessonOfItem(currentItem(next)).answers(problemOf(currentItem(next))));
  if (!next.collapsed && next.skip && next.skipThis && canSkip({ test: isTest(next), tier: next.tier }) && next.step === 0 && full.length > 1) {
    next = { ...next, collapsed: true };
  }
  next = { ...next, values: {}, misses: 0, hinted: false, lastTry: 0, stepT0: deps.now, feedback: null };
  next.pick = planFor(next, deps.rng);
  const step = currentStep(next);
  next.active = next.pick || !step ? null : step.slots[0]?.id ?? null;
  return next;
}

// ---------------------------------------------------------------- plan the step (tier 1)

function planFor(s: PracticeSession, rng: Rng): PracticeSession["pick"] {
  const steps = stepsOf(s), here = steps[s.step];
  const later = steps.slice(s.step + 1);
  if (s.tier !== 1 || !here || here.skipped || !later.length) return null;
  const right = here.base, options = [right];
  for (const t of rng.shuffle(later)) if (options.length < 3 && !options.includes(t.base)) options.push(t.base);
  if (options.length < 3) {
    const lesson = lessonOfItem(currentItem(s));
    for (const m of rng.shuffle(LESSONS.filter(m => m.grade === lesson.grade && m.unit === lesson.unit && m.id !== lesson.id))) {
      if (options.length >= 3) break;
      const first = m.answers(m.generate(rng, 1)).steps[0];
      if (first && !options.includes(first.label)) options.push(first.label);
    }
  }
  return { options: rng.shuffle(options), right, misses: 0 };
}

export function pickPlan(s: PracticeSession, index: number): PracticeSession {
  const pk = s.pick, here = currentStep(s);
  if (!pk || !here) return s;
  const choice = pk.options[index];
  const firstSlot = here.slots[0]?.id ?? null;
  if (choice === pk.right) {
    return { ...s, pick: null, active: firstSlot, fx: "line", feedback: { type: "good", strong: "Good plan.", text: "Now do it." } };
  }
  const misses = pk.misses + 1;
  const mistake = {
    n: s.i + 1, step: s.step + 1, label: "Planning", lessonId: currentItem(s).lessonId, typed: choice ?? "", want: pk.right,
    kind: CATEGORIES.plan[0], cat: "plan" as const, msg: CATEGORIES.plan[1], rushed: false,
  };
  if (misses >= 2) {
    return { ...s, pick: null, active: firstSlot, fx: "shake", mistakes: [...s.mistakes, mistake],
      feedback: { type: "hint", text: `The next step is ${pk.right}. Now do it.` } };
  }
  const isLater = stepsOf(s).slice(s.step + 1).some(t => t.base === choice);
  return { ...s, pick: { ...pk, misses }, fx: "shake", mistakes: [...s.mistakes, mistake],
    feedback: { type: "bad", strong: "Not yet.", text: isLater ? "That step comes later. What has to happen first?" : "That step isn't part of this problem." } };
}

// ---------------------------------------------------------------- typing

export function focusSlot(s: PracticeSession, id: string): PracticeSession {
  return { ...s, active: id };
}

/** Number pad: digits, "−", ".", "back", and "next" (move to the next box). */
export function pressKey(s: PracticeSession, key: string): PracticeSession {
  const step = currentStep(s);
  if (!step || s.pick || !s.active) return s;
  const ids = step.slots.map(x => x.id);
  if (key === "next") return { ...s, active: ids[(ids.indexOf(s.active) + 1) % ids.length] ?? s.active };
  const cur = s.values[s.active] ?? "";
  let v = cur;
  if (key === "back") v = cur.slice(0, -1);
  else if (key === "−") v = cur.startsWith("−") ? cur.slice(1) : "−" + cur;
  else if (key === ".") v = cur.includes(".") ? cur : (cur === "" || cur === "−" ? cur + "0." : cur + ".");
  else if (/^\d$/.test(key)) v = cur.length >= 9 ? cur : cur + key;
  else return s;
  return { ...s, values: { ...s.values, [s.active]: v } };
}

// ---------------------------------------------------------------- checking

const typedText = (values: Record<string, number | null>) =>
  Object.values(values).filter((x): x is number => x != null).map(formatNumber).join(", ");

export function check(s: PracticeSession, progress: Progress, deps: Deps): PracticeSession {
  const step = currentStep(s);
  if (!step) return s;
  if (s.pick) return { ...s, fx: "feedback", feedback: { type: "hint", text: "First pick the step that comes next." } };
  const values = Object.fromEntries(step.slots.map(x => [x.id, parseNumber(s.values[x.id])]));
  if (Object.values(values).every(x => x == null)) {
    return { ...s, fx: "feedback", feedback: { type: "hint", text: "Tap a box and use the number pad to type your answer." } };
  }
  const r = checkStep(step, values);
  if (r.ok) return pass(s, false, progress, deps);
  if (r.soft) return { ...s, fx: "feedback", feedback: { type: "hint", text: r.message } };

  const rushed = s.misses >= 1 && deps.now - s.lastTry < RUSHED_MS;
  const expected = expectedValues(step);
  const earlier = stepsOf(s).slice(0, s.step).flatMap(t => Object.values(expectedValues(t)));
  const cat = r.generic ? diagnose(expected, values, earlier) : "concept";
  const mistake: Mistake = {
    n: s.i + 1, step: s.step + 1, label: step.base, lessonId: currentItem(s).lessonId,
    typed: typedText(values), want: typedText(expected),
    kind: cat === "concept" ? r.kind : CATEGORIES[cat][0], cat, msg: cat === "concept" ? r.message : CATEGORIES[cat][1], rushed,
  };
  let next: PracticeSession = {
    ...s, lastTry: deps.now, misses: s.misses + 1, prob: { ...s.prob, wrong: s.prob.wrong + 1 }, fx: "shake",
    mistakes: [...s.mistakes, mistake],
  };

  if (step.skipped) { // the shortcut missed: do this one the long way
    next = loadStep({ ...next, skipThis: false, collapsed: false, maxPts: next.maxPts + 1, step: 0 }, deps);
    return { ...next, fx: "shake", feedback: { type: "bad", strong: "Not quite.", text: "Let's do this one step by step." } };
  }
  if (isTest(next)) {
    const shownValues = Object.fromEntries(Object.entries(expected).map(([k, v]) => [k, formatNumber(v)]));
    const after = pass({ ...next, values: shownValues }, true, progress, deps);
    return { ...after, feedback: { type: "hint", text: `Not this time. The answer was ${typedText(expected)}.${currentStep(after) ? " Keep going." : ""}` } };
  }
  const band = bandOfSession(next);
  const msg = cat === "concept" ? r.message
    : SAY[cat] ?? `${nudge(expected, values, band)} ${next.hinted ? step.hint : `Read the step again${next.hintsLeft ? ", or tap Hint" : ""}.`}`.trim();
  const lines: string[] = [];
  if (rushed) lines.push("Slow down a little and read the step again.");
  if (canShowMe({ test: false, misses: next.misses, hinted: next.hinted })) lines.push("Stuck? Tap Show me.");
  return { ...next, feedback: { type: "bad", strong: "Not yet.", text: msg, lines } };
}

/** Hints are limited: about one for every two problems, and only after a first try. */
export function hint(s: PracticeSession, deps: Deps): PracticeSession {
  const step = currentStep(s);
  if (!step || isTest(s)) return s;
  if (s.hinted) return { ...s, fx: "feedback", feedback: { type: "hint", strong: "Hint:", text: step.hint } };
  if (!s.hintsLeft) return { ...s, fx: "feedback", feedback: { type: "hint", text: "No hints left in this lesson. Give it your best try. Show me opens after two tries." } };
  if (!s.misses && deps.now - s.stepT0 < HINT_WAIT_MS) return { ...s, fx: "feedback", feedback: { type: "hint", text: "Give it one try first. The hint opens after you try." } };
  return {
    ...s, hinted: true, hintsLeft: s.hintsLeft - 1, hints: s.hints + 1, prob: { ...s.prob, hints: s.prob.hints + 1 }, fx: "feedback",
    feedback: { type: "hint", strong: "Hint:", text: step.hint },
  };
}

export const showMeAvailable = (s: PracticeSession) => canShowMe({ test: isTest(s), misses: s.misses, hinted: s.hinted });
export const skipAvailable = (s: PracticeSession) => canSkip({ test: isTest(s), tier: s.tier });

export function showMe(s: PracticeSession, progress: Progress, deps: Deps): PracticeSession {
  const step = currentStep(s);
  if (!step || !showMeAvailable(s)) return s;
  const values = Object.fromEntries(Object.entries(expectedValues(step)).map(([k, v]) => [k, formatNumber(v)]));
  return pass({ ...s, values, shown: s.shown + 1, prob: { ...s.prob, shown: s.prob.shown + 1 } }, true, progress, deps);
}

/** "Final answer only" ↔ "Show steps", at the top help tier. Applies from the start of the problem. */
export function toggleSkip(s: PracticeSession, deps: Deps): PracticeSession {
  if (!skipAvailable(s)) return s;
  const skip = !s.skip;
  return loadStep({ ...s, skip, skipThis: true, collapsed: false, step: 0, work: [] }, deps);
}

function pass(s: PracticeSession, shown: boolean, progress: Progress, deps: Deps): PracticeSession {
  const step = currentStep(s)!;
  const steps = stepsOf(s);
  const band = bandOfSession(s);
  let next: PracticeSession = {
    ...s,
    pts: s.pts + stepPoints({ shown, test: isTest(s), misses: s.misses, hinted: s.hinted }),
    maxPts: s.maxPts + 1,
    work: [...s.work, { math: step.work, shown }],
    step: s.step + 1,
    fx: "line",
  };
  if (next.step < steps.length) {
    const praise = deps.rng.pick(PRAISE[band]);
    next = loadStep(next, deps);
    return { ...next, feedback: shown ? { type: "hint", strong: `Here's how: ${step.explain}` } : { type: "good", strong: praise } };
  }

  // the problem is finished
  const pr = next.prob, clean = !pr.wrong && !pr.hints && !pr.shown;
  const xp = problemXp({ test: isTest(next), ...pr });
  const it = currentItem(next);
  next = {
    ...next, solved: true, pick: null, active: null,
    xpEarned: next.xpEarned + xp, clean: next.clean + (clean ? 1 : 0),
    probs: [...next.probs, { lessonId: it.lessonId, problem: it.problem, work: next.work, hints: pr.hints, wrong: pr.wrong, shown: pr.shown, ms: deps.now - pr.t0 }],
  };
  const lines: string[] = [];
  if (!isTest(next) && (pr.wrong || pr.shown) && next.items.length < MAX_LESSON_LENGTH) {
    next = { ...next, items: [...next.items, makeItem(lessonOfItem(it), next.items.length, deps.rng)], extra: next.extra + 1 };
    lines.push("I added one more problem like this so you can practice it.");
  }
  void progress;
  if (isTest(next)) return { ...next, feedback: { type: "good", strong: `Problem done. +${xp} XP` } };
  if (shown) return { ...next, feedback: { type: "hint", text: `Here's how: ${step.explain}`, lines: [`+${xp} XP. That one was tricky, and you finished it.`, ...lines] } };
  if (band === "little") return { ...next, feedback: { type: "good", pop: "big", strong: `You solved it! +${xp} XP`, lines } };
  if (band === "middle" || band === "high") return { ...next, feedback: { type: "good", strong: `Solved. +${xp} XP`, text: clean ? "(no mistakes)" : "", lines } };
  return { ...next, feedback: { type: "good", pop: "star", strong: `Solved! +${xp} XP`, text: clean ? "(no mistakes bonus)" : "", lines } };
}

// ---------------------------------------------------------------- moving on and finishing

export const isLastProblem = (s: PracticeSession) => s.i >= s.items.length - 1;

/** Next problem, or null when the run is over (then call finishRun). */
export function nextProblem(s: PracticeSession, progress: Progress, deps: Deps): PracticeSession | null {
  if (!s.solved) return s;
  if (isLastProblem(s)) return null;
  return startProblem({ ...s, i: s.i + 1 }, progress, deps);
}

export function finishRun(s: PracticeSession, progress: Progress, now: number): { progress: Progress; report: SessionReport } {
  const pct = s.maxPts ? s.pts / s.maxPts : 0, level = levelOf(pct);
  const report: SessionReport = {
    key: s.key, mode: s.mode, title: s.title, date: now, ms: now - s.t0, total: s.items.length, extra: s.extra, clean: s.clean,
    hints: s.hints, shown: s.shown, pct, level, xp: s.xpEarned, probs: s.probs, mistakes: s.mistakes,
  };
  const p: Progress = structuredClone(progress);
  p.xp += s.xpEarned;
  const grade = s.mode === "test" ? Number(s.key.split(":")[1]) : s.mode === "review" ? (p.grade ?? 5) : requireLesson(s.key).grade;
  p.gxp[grade] = (p.gxp[grade] ?? 0) + s.xpEarned;
  const today = new Date(now).toDateString(), yesterday = new Date(now - 864e5).toDateString();
  if (p.last !== today) p.streak = p.last === yesterday ? p.streak + 1 : 1;
  p.last = today;
  const book = s.mode === "test" ? p.tests : s.mode === "practice" ? p.scores : null;
  if (book) {
    const old = book[s.key];
    book[s.key] = { last: level, best: Math.max(level, old?.best ?? 0) as typeof level, pct, date: now,
      mastered: !!old?.mastered || (level === 4 && s.startTier === 2) };
  }
  if (s.mode === "practice") { p.done += 1; p.lessons[s.key] = (p.lessons[s.key] ?? 0) + 1; }
  if (s.mode === "review") p.reviews[today] = level;
  for (const it of s.items) p.seen[it.lessonId] = now;
  const cats: Record<string, number> = {};
  for (const m of s.mistakes) cats[m.kind] = (cats[m.kind] ?? 0) + 1;
  p.log = [{ key: s.key, mode: s.mode, title: s.title, date: now, level, total: report.total, hints: report.hints, shown: report.shown, cats,
    rushed: s.mistakes.filter(m => m.rushed).length }, ...p.log].slice(0, 60);
  p.run = null;
  return { progress: p, report };
}

/** A saved run can only resume if every lesson in it still exists and every stored problem is still valid. */
export function canResume(run: PracticeSession | null): run is PracticeSession {
  if (!run) return false;
  try {
    return run.items.every(it => lessonById(it.lessonId) && lessonById(it.lessonId)!.restore(it.problem) != null);
  } catch {
    return false;
  }
}

/** Plain text for a math line in the current step, for screen readers and tests. */
export const stepText = (step: RuntimeStep) => toPlainText(step.prompt);
