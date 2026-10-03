// Words that depend on a number, written right at the source: "1 dot" / "3 dots", "is" / "are", "a 7" / "an 8",
// "x" / "−x" / "3x". Lessons use these instead of patching text afterwards, so a count of one always reads right.
import { formatNumber } from "./schemas/math-text";

/** A count that may already be written out ("1", "−3", "0.5"): it's one only when it reads exactly 1. */
const isOne = (n: number | string) => n === 1 || n === "1";

/** "1 dot", "3 dots"; irregular plurals are given: count(2, "box", "boxes"). A count already formatted is kept as written. */
export const count = (n: number | string, one: string, many = `${one}s`) => `${typeof n === "number" ? formatNumber(n) : n} ${isOne(n) ? one : many}`;

/** Just the noun, for when the number is written separately. */
export const noun = (n: number | string, one: string, many = `${one}s`) => (isOne(n) ? one : many);

export const isAre = (n: number) => (n === 1 ? "is" : "are");

/** The verb that agrees with a count: verb(1, "stays", "stay") → "stays". */
export const verb = (n: number, one: string, many: string) => (n === 1 ? one : many);

/** "a" or "an" before a number, by how it's said: an 8, an 11, an 18, an 80; a 1, a 7, a 100. */
export function aOrAn(n: number): "a" | "an" {
  const s = String(Math.abs(Math.trunc(n)));
  if (s.startsWith("8")) return "an";
  if (s === "11" || s === "18") return "an";
  // 11,000 and 18,000 and so on are said "eleven thousand"
  if ((s.length - 2) % 3 === 0 && (s.startsWith("11") || s.startsWith("18"))) return "an";
  return "a";
}
/** The article and the number together: "an 8", "a 6". */
export const aNum = (n: number) => `${aOrAn(n)} ${formatNumber(n)}`;

/** A coefficient and its variable as written: coef(1, "x") → "x", coef(−1, "x") → "−x", coef(3, "x") → "3x". */
export const coef = (a: number, v: string) => (a === 1 ? v : a === -1 ? `−${v}` : `${formatNumber(a)}${v}`);

/** A number to put after an operator: a negative gets brackets, "(−8)". */
export const paren = (n: number) => (n < 0 ? `(${formatNumber(n)})` : formatNumber(n));

/** "+ 3" or "− 3": a signed term added on, so "x + −1" reads "x − 1". */
export const signed = (n: number) => (n < 0 ? `− ${formatNumber(-n)}` : `+ ${formatNumber(n)}`);

/** The first letter as a capital, for a phrase that starts a sentence: cap(aNum(8)) → "An 8". */
export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** A term after an operator: term(−8, "x") → "(−8x)", term(1, "x") → "x", term(3, "x²") → "3x²". */
export const term = (a: number, v: string) => (a < 0 ? `(${coef(a, v)})` : coef(a, v));

/** "a" or "an" before a word ("an orange", "a cube"); capital for the start of a sentence. */
export function aOrAnWord(word: string, capital = false): string {
  const a = /^[aeiou]/i.test(word) ? "an" : "a";
  return capital ? cap(a) : a;
}
