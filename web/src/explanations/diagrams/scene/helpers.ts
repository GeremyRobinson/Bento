// Small helpers family builders share: scales and number formatting for labels.
import { formatNumber } from "../../../curriculum/schemas/math-text";
import type { SceneItem } from "./schema";

/** Maps a value range onto a pixel range. */
export const scale = (d0: number, d1: number, r0: number, r1: number) => (v: number) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);

export const label = (v: number) => formatNumber(v);

/** A small arrowhead at (x, y) pointing along angle (radians). */
export function arrowHead(x: number, y: number, angle: number, size = 9, extra: Partial<SceneItem> = {}): SceneItem {
  const a1 = angle + Math.PI * 0.85, a2 = angle - Math.PI * 0.85;
  return {
    type: "polygon",
    points: [[x, y], [x + size * Math.cos(a1), y + size * Math.sin(a1)], [x + size * Math.cos(a2), y + size * Math.sin(a2)]],
    cls: "dotp",
    ...extra,
  } as SceneItem;
}

/** Rounds coordinates so the SVG stays small and stable in tests. */
export const r1 = (x: number) => Math.round(x * 10) / 10;
