const PLACE_NAMES = ["ones", "tens", "hundreds", "thousands", "ten thousands", "hundred thousands"];

/** 36 → [30, 6]; 305 → [300, 5]. Biggest place first, zero places left out. */
export function splitByPlaceValue(n: number): number[] {
  if (!Number.isInteger(n) || n <= 0) throw new Error(`splitByPlaceValue needs a positive whole number, got ${n}`);
  const digits = String(n).split("").map(Number);
  return digits
    .map((d, i) => d * 10 ** (digits.length - 1 - i))
    .filter(part => part !== 0);
}

/** 30 → "tens", 6 → "ones", 300 → "hundreds". */
export function placeName(part: number): string {
  const zeros = String(part).length - 1;
  return PLACE_NAMES[zeros] ?? `10^${zeros}`;
}

/** The single non-zero digit of a place-value part: 30 → 3. */
export const leadingDigit = (part: number) => Number(String(part)[0]);
