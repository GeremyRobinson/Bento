/**
 * Places where a rebuilt lesson intentionally differs from the current app, with the reason.
 * Keys are `<lessonId>` → field → reason. Fields: show, note, story, label, prompt, stepNote, hint, explain, work, choices, checks, steps.
 * Every entry is reviewed; nothing goes here to make a test pass.
 */
export const DEVIATIONS: Record<string, Partial<Record<string, string>>> = {};
