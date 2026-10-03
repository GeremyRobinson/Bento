// Flat shapes for kindergarten: the shape drawn from its size and turn, then each side lit and numbered,
// then each corner dotted and numbered, then its name. A circle shows its one round edge and no corners.
import type { SceneDiagram } from "../scene/schema";
import { ellipse, frame, path, poly, seg, t, type Draft, type Pt } from "../geo/kit";
import { WIDE } from "./fit";

export type ShapeKind = "circle" | "triangle" | "square" | "rectangle" | "hexagon";

export interface ShapeSpec {
  kind: ShapeKind;
  /** width and height in pixels before turning (a square uses w for both, a hexagon and circle use w across) */
  w: number;
  h: number;
  /** turn in degrees, clockwise on screen */
  turn: number;
  /** the name written under the shape */
  name: string;
  /** beats: sides, corners, name. Leave out for the practice picture (just the shape). */
  beats?: { sides: number; corners: number; name: number };
  alt: string;
}

/** The corners of the shape around (0, 0), in order, before turning; empty for a circle. */
export function cornersOf(kind: ShapeKind, w: number, h: number): Pt[] {
  switch (kind) {
    case "circle": return [];
    case "triangle": return [[-w / 2, h / 3], [w / 2, h / 3], [w * 0.12, (-2 * h) / 3]];
    case "square": return [[-w / 2, -w / 2], [w / 2, -w / 2], [w / 2, w / 2], [-w / 2, w / 2]];
    case "rectangle": return [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];
    case "hexagon": return Array.from({ length: 6 }, (_, i): Pt => [(w / 2) * Math.cos((Math.PI / 3) * i), (w / 2) * Math.sin((Math.PI / 3) * i)]);
  }
}

const turned = (p: Pt, deg: number): Pt => {
  const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return [p[0] * c - p[1] * s, p[0] * s + p[1] * c];
};
/** a point `d` further out from the middle of the shape than p */
const outward = (p: Pt, mid: Pt, d: number): Pt => {
  const dx = p[0] - mid[0], dy = p[1] - mid[1], len = Math.hypot(dx, dy) || 1;
  return [p[0] + (dx / len) * d, p[1] + (dy / len) * d];
};

export function flatShape(s: ShapeSpec): SceneDiagram {
  const b = s.beats, items: Draft[] = [];
  let bottom: number;
  if (s.kind === "circle") {
    const r = s.w / 2;
    items.push(path(ellipse([0, 0], r, r), "sq"));
    bottom = r;
    if (b) {
      items.push(path(ellipse([0, 0], r, r), "ln2", { from: b.sides, enter: "draw slow" }));
      items.push(t(0, r + 34, "no straight sides", "lbl acc", { from: b.sides, until: b.sides, enter: "rise", delay: 1.2 }));
      items.push(t(0, r + 34, "no corners", "lbl", { from: b.corners, until: b.corners, enter: "rise", delay: 0.2 }));
    }
  } else {
    const raw = cornersOf(s.kind, s.w, s.h);
    const c0: Pt = [raw.reduce((a, p) => a + p[0], 0) / raw.length, raw.reduce((a, p) => a + p[1], 0) / raw.length];
    const pts = raw.map(p => turned([p[0] - c0[0], p[1] - c0[1]], s.turn));
    const mid: Pt = [0, 0];
    items.push(poly(pts, "sq"));
    bottom = Math.max(...pts.map(p => p[1]));
    if (b) {
      pts.forEach((p, i) => {
        const q = pts[(i + 1) % pts.length]!, m: Pt = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
        items.push(seg(p, q, "ln2", { from: b.sides, enter: "draw", delay: 0.5 * i }));
        const at = outward(m, mid, 22);
        items.push(t(at[0], at[1], String(i + 1), "lbl acc", { from: b.sides, until: b.sides, enter: "rise", delay: 0.5 * i + 0.3 }));
      });
      pts.forEach((p, i) => {
        items.push({ type: "circle", cx: p[0], cy: p[1], r: 8, cls: "dota", from: b.corners, enter: "pop", delay: 0.5 * i } as Draft);
        const at = outward(p, mid, 26);
        items.push(t(at[0], at[1], String(i + 1), "lbl", { from: b.corners, enter: "rise", delay: 0.5 * i + 0.2 }));
      });
    }
  }
  if (b) items.push(t(0, bottom + 58, s.name, "lbl big", { from: b.name, enter: "rise", delay: 0.2 }));
  return frame("early-shapes", items, s.alt, 16, WIDE);
}
