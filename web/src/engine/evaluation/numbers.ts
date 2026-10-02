export const round6 = (x: number) => Math.round(x * 1e6) / 1e6;

/** Equal within float noise; null never equals anything. */
export const eq = (a: number | null | undefined, b: number | null | undefined) =>
  a != null && b != null && Math.abs(a - b) < 1e-6;

/** What the number pad typed, as a number. Accepts the real minus sign. Empty or "−" alone is no answer yet. */
export function parseNumber(str: string | null | undefined): number | null {
  if (str == null || str === "" || str === "−") return null;
  const n = Number(String(str).replace("−", "-"));
  return Number.isFinite(n) ? n : null;
}
