// A number bond for kindergarten: the whole on top, its two parts below, and the dots that make them,
// the first group in the grade's first color and the other group in its second (design/pictures-k4.md).
import type { SceneDiagram } from "../scene/schema";
import { frame, t, type Draft } from "../geo/kit";
import { WIDE } from "./fit";

const R = 15, PITCH = 42, GAP = 30;

export interface BondSpec {
  whole: number;
  part: number;
  /** beats: the whole counted, the first group, the other group, the sentence. Leave out for practice. */
  beats?: { whole: number; first: number; other: number; sentence: number };
  alt: string;
}

export function numberBond(s: BondSpec): SceneDiagram {
  const { whole, part } = s, rest = whole - part, b = s.beats;
  if (!Number.isInteger(whole) || !Number.isInteger(part) || whole < 1 || whole > 10 || part < 0 || part > whole) throw new Error("a bond splits 1 to 10 into two parts");
  const rowW = whole * PITCH + (part && rest ? GAP : 0), cx = rowW / 2;
  const top: [number, number] = [cx, 0], left: [number, number] = [cx - 90, 104], right: [number, number] = [cx + 90, 104];
  const items: Draft[] = [
    { type: "line", x1: top[0], y1: top[1], x2: left[0], y2: left[1], cls: "ax thin", from: 0 } as Draft,
    { type: "line", x1: top[0], y1: top[1], x2: right[0], y2: right[1], cls: "ax thin", from: 0 } as Draft,
    { type: "circle", cx: top[0], cy: top[1], r: 34, cls: "hole", from: 0 } as Draft,
    { type: "circle", cx: left[0], cy: left[1], r: 30, cls: "hole", from: 0 } as Draft,
    { type: "circle", cx: right[0], cy: right[1], r: 30, cls: "hole", from: 0 } as Draft,
  ];
  const dx = (i: number) => PITCH / 2 + i * PITCH + (i >= part && part && rest ? GAP : 0), y = 200;
  for (let i = 0; i < whole; i++) {
    const first = i < part;
    if (b) {
      items.push({ type: "circle", cx: dx(i), cy: y, r: R, cls: "dotp", from: b.whole, enter: "pop", delay: 0.1 * i } as Draft);
      items.push(t(dx(i), y + 32, String(i + 1), "xs", { from: b.whole, until: b.whole, enter: "fade", delay: 0.1 * i }));
      items.push({ type: "circle", cx: dx(i), cy: y, r: R, cls: `marble ${first ? "c0" : "c1"}`, from: first ? b.first : b.other, enter: "pop", delay: 0.1 * (first ? i : i - part) } as Draft);
    } else items.push({ type: "circle", cx: dx(i), cy: y, r: R, cls: `marble ${first ? "c0" : "c1"}`, from: 0 } as Draft);
  }
  items.push(t(top[0], top[1], String(whole), "lbl big", b ? { from: b.whole, enter: "rise", delay: 0.1 * whole } : {}));
  items.push(t(left[0], left[1], String(part), "lbl big", b ? { from: b.first, enter: "rise", delay: 0.1 * part } : {}));
  if (b) {
    items.push(t(right[0], right[1], "?", "lbl big", { from: 0, until: b.other - 1 }));
    items.push(t(right[0], right[1], String(rest), "lbl big", { from: b.other, enter: "rise", delay: 0.1 * rest }));
    items.push(t(cx, y + 62, `${whole} is ${part} and ${rest}`, "lbl big acc", { from: b.sentence, enter: "rise" }));
  } else items.push(t(right[0], right[1], "?", "lbl big"));
  return frame("early-bond", items, s.alt, 16, WIDE);
}
