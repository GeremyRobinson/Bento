// The number-line family (the current app's numberLine()): ticks, hops, points and highlighted stretches,
// every position computed from the values. Lessons pass values and beats; this decides all the geometry.
import { formatNumber } from "../../../curriculum/schemas/math-text";
import type { SceneDiagram, SceneItem } from "../scene/schema";
import { r1 } from "../scene/helpers";

/** A jump along the line, drawn as an arc. Hops below the line count the other way (the accent colour). */
export interface Hop {
  from: number;
  to: number;
  label?: string;
  below?: boolean;
  beat: number;
  until?: number;
  /** stagger within the beat, in seconds */
  delay?: number;
  /** draw a dot where the hop starts (default true) */
  start?: boolean;
  /** draw a dot where it lands (default true) */
  land?: boolean;
}

/** A point on the line, with an optional label above it. */
export interface Mark {
  v: number;
  label?: string;
  beat: number;
  until?: number;
  delay?: number;
  cls?: "dotp" | "dota" | "hole";
}

/** A highlighted stretch of the line (the original's `seg`), with an optional label under the tick numbers. */
export interface Span {
  from: number;
  to: number;
  beat: number;
  until?: number;
  label?: string;
}

export interface NumberLineSpec {
  min: number;
  max: number;
  /** distance between ticks (default 1) */
  step?: number;
  /** label every n-th tick; default: as often as the labels fit */
  every?: number;
  /** extra tick values to label even when `every` skips them (e.g. a halfway mark) */
  labelAt?: number[];
  width?: number;
  hops?: Hop[];
  marks?: Mark[];
  spans?: Span[];
  alt: string;
}

/** Rough width of a label in the picture's number font. */
export const textWidth = (s: string, size = 15) => s.length * size * 0.6 + 4;

const round6 = (x: number) => Math.round(x * 1e6) / 1e6;
const MARGIN = 30;
/** how tall an arc gets for a jump of dx pixels (the current app's rule) */
export const hopHeight = (dx: number) => Math.min(56, Math.abs(dx) * 0.45 + 12);

/**
 * Picks min, max and tick step so every value fits with at most `maxTicks` ticks, using steps of 1, 2 or 5 × 10ⁿ.
 * `pad` adds that many ticks of room at each end; `minStep` keeps whole-number lines from getting fractional ticks.
 */
export function fitRange(values: number[], opts: { maxTicks?: number; pad?: number; minStep?: number } = {}): { min: number; max: number; step: number } {
  const { maxTicks = 24, pad = 1, minStep = 1e-6 } = opts;
  if (!values.length) throw new Error("fitRange needs at least one value");
  const lo = Math.min(...values), hi = Math.max(...values);
  for (let e = -6; e <= 9; e++) {
    for (const m of [1, 2, 5]) {
      const step = round6(m * 10 ** e);
      if (step < minStep - 1e-9) continue;
      const min = round6(Math.floor(round6(lo / step)) * step - pad * step);
      const max = round6(Math.ceil(round6(hi / step)) * step + pad * step);
      if ((max - min) / step <= maxTicks + 1e-9) return { min, max, step };
    }
  }
  throw new Error("values too far apart for a number line");
}

/** Builds the scene. Throws when a value lies off the line, so a lesson can never draw a wrong picture silently. */
export function buildNumberLine(spec: NumberLineSpec): SceneDiagram {
  const { min, max, step = 1, hops = [], marks = [], spans = [], labelAt = [] } = spec;
  const W = spec.width ?? 520;
  if (!(max > min)) throw new Error(`number line needs max > min (got ${min}..${max})`);
  const n = Math.round((max - min) / step);
  if (Math.abs(n * step - (max - min)) > 1e-6) throw new Error("the range must be a whole number of steps");
  const inside = (v: number) => v >= min - 1e-9 && v <= max + 1e-9;
  for (const v of [...hops.flatMap(h => [h.from, h.to]), ...marks.map(m => m.v), ...spans.flatMap(s => [s.from, s.to])]) {
    if (!inside(v)) throw new Error(`${v} is off the number line ${min}..${max}`);
  }
  const x = (v: number) => MARGIN + ((v - min) / (max - min)) * (W - 2 * MARGIN);
  const px = (W - 2 * MARGIN) / n;

  // tick labels as often as they fit
  const tickLabel = (i: number) => formatNumber(round6(min + i * step));
  const widest = Math.max(...Array.from({ length: n + 1 }, (_, i) => textWidth(tickLabel(i))));
  let every = spec.every ?? 1;
  if (spec.every == null) {
    const options = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000];
    every = options.find(k => k * px >= widest + 6) ?? n;
  }

  // vertical room: arcs and labels above, tick numbers and labels below
  const above = hops.filter(h => !h.below && h.from !== h.to).map(h => hopHeight(x(h.to) - x(h.from)));
  const belowHops = hops.filter(h => h.below && h.from !== h.to).map(h => hopHeight(x(h.to) - x(h.from)));
  const topRoom = Math.max(
    above.length ? Math.max(...above) + 14 + 14 : 0,
    marks.some(m => m.label) ? 22 + 14 : 0,
    18,
  );
  const y = r1(topRoom + 8);
  const belowLabelY = (hh: number) => y + Math.max(hh + 16, 44);
  const spanLabelY = y + 44 + (belowHops.length ? Math.max(...belowHops) + 4 : 0);
  const bottom = Math.max(
    y + 22 + 12,
    belowHops.length ? Math.max(...belowHops.map(belowLabelY)) + 12 : 0,
    spans.some(s => s.label) ? spanLabelY + 12 : 0,
  );

  const items: SceneItem[] = [{ type: "line", x1: 16, y1: y, x2: W - 16, y2: y, cls: "ax", enter: "fade" }];
  const labelled = new Set(labelAt.map(v => Math.round((v - min) / step)));
  for (let i = 0; i <= n; i++) {
    const xv = r1(x(min + i * step));
    items.push({ type: "line", x1: xv, y1: y - 6, x2: xv, y2: y + 6, cls: "tk", enter: "fade", delay: r1(i * 0.02 * Math.min(1, 24 / n)) });
    if (i % every === 0 || labelled.has(i)) items.push({ type: "text", x: xv, y: y + 22, text: tickLabel(i), cls: "sm", enter: "fade", delay: r1(i * 0.02 * Math.min(1, 24 / n)) });
  }
  const timing = (o: { beat: number; until?: number; delay?: number }, extra = 0) => ({
    from: o.beat,
    ...(o.until != null ? { until: o.until } : {}),
    ...(o.delay != null || extra ? { delay: r1((o.delay ?? 0) + extra) } : {}),
  });

  for (const s of spans) {
    items.push({ type: "line", x1: r1(x(s.from)), y1: y, x2: r1(x(s.to)), y2: y, cls: "hl", enter: "growx", ...timing(s) });
    if (s.label) items.push({ type: "text", x: r1((x(s.from) + x(s.to)) / 2), y: r1(spanLabelY), text: s.label, cls: "lbl acc", enter: "rise", ...timing(s, 0.3) });
  }
  for (const h of hops) {
    if (h.from === h.to) continue;
    const x1 = x(h.from), x2 = x(h.to), hh = hopHeight(x2 - x1) * (h.below ? -1 : 1), mx = (x1 + x2) / 2;
    if (h.start !== false) items.push({ type: "circle", cx: r1(x1), cy: y, r: 7, cls: "dotp", enter: "pop", ...timing(h) });
    items.push({ type: "path", d: `M${r1(x1)} ${y} Q${r1(mx)} ${r1(y - hh * 2)} ${r1(x2)} ${y}`, cls: h.below ? "ln2" : "ln", enter: "draw", ...timing(h, 0.1) });
    if (h.label) {
      const ly = h.below ? belowLabelY(-hh) : y - hh - 14;
      items.push({ type: "text", x: r1(mx), y: r1(ly), text: h.label, cls: h.below ? "lbl acc" : "lbl", enter: "rise", ...timing(h, 0.35) });
    }
    if (h.land !== false) items.push({ type: "circle", cx: r1(x2), cy: y, r: 7, cls: h.below ? "dota" : "dotp", enter: "pop", ...timing(h, 0.55) });
  }
  for (const m of marks) {
    items.push({ type: "circle", cx: r1(x(m.v)), cy: y, r: 7, cls: m.cls ?? "dotp", enter: "pop", ...timing(m) });
    if (m.label) items.push({ type: "text", x: r1(x(m.v)), y: r1(y - 22), text: m.label, cls: "lbl", enter: "rise", ...timing(m, 0.2) });
  }
  return { kind: "scene", family: "number-line", width: W, height: r1(bottom), items, alt: spec.alt };
}
