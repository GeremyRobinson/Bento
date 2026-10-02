// Math as data, not HTML: every number in a prompt, a worked line or a narration sentence is a value,
// so it can be traced back to the problem model and formatted the same way everywhere.
export type Operator = "+" | "−" | "×" | "÷" | "=";

export type MathToken =
  | { t: "text"; v: string }
  | { t: "num"; v: number }
  | { t: "op"; v: Operator }
  | { t: "slot"; id: string }
  | { t: "answer"; id: string; v: number };

export type MathText = MathToken[];

export const text = (v: string): MathToken => ({ t: "text", v });
export const num = (v: number): MathToken => ({ t: "num", v });
export const op = (v: Operator): MathToken => ({ t: "op", v });
export const slot = (id: string): MathToken => ({ t: "slot", id });
export const answer = (id: string, v: number): MathToken => ({ t: "answer", id, v });

const round6 = (x: number) => Math.round(x * 1e6) / 1e6;

/** The one number format used on screen: a real minus sign, no float noise. */
export function formatNumber(x: number): string {
  const r = round6(x);
  return (r < 0 ? "−" : "") + String(Math.abs(r));
}

/** Plain-text reading of a math line, used for narration, accessibility labels and tests. */
export function toPlainText(m: MathText, slotText = "?"): string {
  return m
    .map(tok => {
      switch (tok.t) {
        case "text": return tok.v;
        case "num": return formatNumber(tok.v);
        case "op": return ` ${tok.v} `;
        case "slot": return slotText;
        case "answer": return formatNumber(tok.v);
      }
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

/** Numbers that appear in a math line, in order (answers included). */
export const numbersIn = (m: MathText): number[] =>
  m.flatMap(tok => (tok.t === "num" || tok.t === "answer" ? [tok.v] : []));
