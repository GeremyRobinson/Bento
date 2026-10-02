// Two similar triangles side by side, the big one exactly k times the small one, with matching sides labelled.
import type { SceneDiagram } from "../scene/schema";
import { frame, poly, t, type Draft, type Pt } from "../geo/kit";

export interface SimilarSpec {
  /** the small triangle's two sides (drawn up and across) and the scale factor */
  a: number; b: number; k: number;
  /** labels: the big triangle's known side and its missing side (before and after it is found) */
  bigA: string; bigB: string;
  factorBeat: number; missingBeat: number;
  factorNote: string; missingNote: string;
  alt: string;
}

export function buildSimilar(s: SimilarSpec): SceneDiagram {
  const { a, b, k } = s;
  if (!(a > 0 && b > 0 && k > 0)) throw new Error("sides and factor must be positive");
  const gap = 70;
  const u = Math.min(210 / (a * Math.max(k, 1)), 380 / (b * (1 + k)));
  const tri = (x0: number, sc: number): Pt[] => [[x0, 0], [x0 + b * u * sc, 0], [x0, -a * u * sc]];
  const x1 = b * u + gap;
  const items: Draft[] = [
    poly(tri(0, 1), "ln fillsoft", { enter: "draw" }),
    t(-10, (-a * u) / 2, String(a), "lbl end", { enter: "rise", delay: 0.4 }),
    t((b * u) / 2, 18, String(b), "lbl", { enter: "rise", delay: 0.4 }),
    poly(tri(x1, k), "ln2 fillsoft", { enter: "draw", delay: 0.6 }),
    t(x1 - 10, (-a * u * k) / 2, s.bigA, "lbl acc end", { enter: "rise", delay: 1 }),
    t(x1 + (b * u * k) / 2, 18, "?", "lbl acc", { until: s.missingBeat - 1, enter: "rise", delay: 1 }),
    t(x1 + (b * u * k) / 2, 18, s.bigB, "lbl acc", { from: s.missingBeat, enter: "rise" }),
  ];
  const top = -a * u * Math.max(k, 1) - 30;
  const mid = (x1 + b * u * k) / 2;
  items.push(t(mid, top, s.factorNote, "lbl acc", { from: s.factorBeat, enter: "rise" }));
  items.push(t(mid, top - 28, s.missingNote, "lbl acc", { from: s.missingBeat, enter: "rise" }));
  return frame("similar", items, s.alt, 14, { w: 300 });
}
