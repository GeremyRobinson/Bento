// Column addition and subtraction (4th grade): the two numbers lined up by place, worked one column at a time.
// Addition shows each carried 1 over the next column; subtraction crosses out the digit that lends a ten
// and writes the new digits above. The thousands and up are worked together in the last beat.
import type { SceneDiagram } from "../scene/schema";
import { frame, seg, t, type Draft } from "../geo/kit";

export interface ColumnSpec {
  a: number;
  b: number;
  sign: "+" | "−";
  /** beat each of the ones, tens and hundreds columns is worked at; the thousands and up come at `rest` */
  beats: { ones: number; tens: number; hundreds: number; rest: number };
  alt: string;
}

const CW = 40, ROW = 48, COMMA = 12;
const digitsOf = (n: number) => String(n).split("").reverse().map(Number);

/** What happens in each column, ones first: the carry or the trade, and the digit written. */
export function columnWork(a: number, b: number, sign: "+" | "−") {
  const A = digitsOf(a), B = digitsOf(b), out: { top: number; bottom: number; carryIn: number; write: number; regroup: boolean }[] = [];
  let carry = 0;
  for (let i = 0; i < 3; i++) {
    const top = (A[i] ?? 0) - (sign === "−" ? carry : 0), bottom = B[i] ?? 0;
    if (sign === "+") {
      const sum = top + bottom + carry;
      out.push({ top, bottom, carryIn: carry, write: sum % 10, regroup: sum >= 10 });
      carry = sum >= 10 ? 1 : 0;
    } else {
      const regroup = top < bottom;
      out.push({ top, bottom, carryIn: carry, write: (regroup ? top + 10 : top) - bottom, regroup });
      carry = regroup ? 1 : 0;
    }
  }
  return { cols: out, carryOut: carry };
}

export function buildColumns(s: ColumnSpec): SceneDiagram {
  const res = s.sign === "+" ? s.a + s.b : s.a - s.b;
  const n = Math.max(String(s.a).length, String(s.b).length, String(res).length);
  // column i counts from the ones (i = 0); the thousands sit a little apart, like the comma does
  const X = (i: number) => (n - 1 - i) * CW + (i < 3 && n > 3 ? COMMA : 0);
  const beatOf = (i: number) => (i === 0 ? s.beats.ones : i === 1 ? s.beats.tens : i === 2 ? s.beats.hundreds : s.beats.rest);
  const { cols } = columnWork(s.a, s.b, s.sign);
  const items: Draft[] = [];
  const yA = 0, yB = ROW, yLine = ROW + 28, yR = ROW * 2 + 12, yUp = -34;

  // the column being worked lights up
  for (const i of [0, 1, 2]) {
    if (i >= n) continue;
    const b = beatOf(i);
    items.push({ type: "rect", x: X(i) - CW / 2 + 2, y: yUp - 16, w: CW - 4, h: yR + 22 - yUp + 16, rx: 10, cls: "fillsoft", from: b, until: b, enter: "fade" } as Draft);
  }
  if (n > 3) {
    const b = s.beats.rest;
    items.push({ type: "rect", x: X(n - 1) - CW / 2 + 2, y: yUp - 16, w: X(3) - X(n - 1) + CW - 4, h: yR + 22 - yUp + 16, rx: 10, cls: "fillsoft", from: b, until: b, enter: "fade" } as Draft);
  }

  const A = digitsOf(s.a), B = digitsOf(s.b), R = digitsOf(res);
  const comma = (row: number[], y: number, cls: string, extra: Partial<Draft> = {}) => {
    if (row.length > 3) items.push(t((X(3) + X(2)) / 2 + 2, y + 10, ",", cls, extra));
  };
  A.forEach((d, i) => items.push(t(X(i), yA, String(d), "big", { enter: "fade" })));
  comma(A, yA, "big");
  B.forEach((d, i) => items.push(t(X(i), yB, String(d), "big", { enter: "fade" })));
  comma(B, yB, "big");
  items.push(t(X(n - 1) - CW, yB, s.sign, "big"));
  items.push(seg([X(n - 1) - CW * 1.5, yLine], [X(0) + CW / 2, yLine], "ax"));

  // regrouping marks above the top number
  if (s.sign === "+") {
    cols.forEach((c, i) => {
      if (!c.regroup) return;
      items.push(t(X(i + 1), yUp, "1", "sm acc", { from: beatOf(i), enter: "drop", delay: 0.5 }));
    });
  } else {
    // a digit that lends a ten is crossed out and its new value written above; the digit that borrows gets a 1 in front
    cols.forEach((c, i) => {
      if (!c.regroup) return;
      const lend = i + 1, bt = beatOf(i), lendNow = (A[lend] ?? 0) - 1;
      const lendNext = cols[lend];
      const lendUntil = lendNext?.regroup ? beatOf(lend) - 1 : undefined;
      items.push(seg([X(lend) - 11, yA + 13], [X(lend) + 11, yA - 13], "ln2", { from: bt, enter: "draw" }));
      items.push(t(X(lend), yUp, String(lendNow), "sm acc", { from: bt, enter: "drop", delay: 0.3, ...(lendUntil != null ? { until: lendUntil } : {}) }));
      if (lendNext?.regroup) items.push(t(X(lend), yUp, String(lendNow + 10), "sm acc", { from: beatOf(lend), enter: "pop" }));
      // the borrowing digit: crossed and rewritten with ten more (unless it already shows a new value above)
      const wasLent = i > 0 && cols[i - 1]!.regroup;
      if (!wasLent) {
        items.push(seg([X(i) - 11, yA + 13], [X(i) + 11, yA - 13], "ln2", { from: bt, enter: "draw", delay: 0.4 }));
        items.push(t(X(i), yUp, String(c.top + 10), "sm acc", { from: bt, enter: "drop", delay: 0.6 }));
      }
    });
  }

  // the answer, a column at a time; the thousands and up all at once
  R.forEach((d, i) => {
    if (s.sign === "−" && i === R.length - 1 && d === 0 && i > 0) return;
    items.push(t(X(i), yR, String(d), "big acc", { from: beatOf(Math.min(i, 3)), enter: "rise", delay: i < 3 ? 0.8 : 0.3 }));
  });
  if (R.length > 3) items.push(t((X(3) + X(2)) / 2 + 2, yR + 10, ",", "big acc", { from: s.beats.rest, enter: "fade" }));

  return frame("columns", items, s.alt, 14, { w: 300 });
}
