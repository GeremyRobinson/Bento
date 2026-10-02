// Counting pictures for the youngest, shown with the problem (the current app's dots() and tenFrame()):
// groups of dots joined by "+", or ten frames filled one dot per counter. Counts come from the problem.
import type { SceneDiagram, SceneItem } from "../scene/schema";
import { r1 } from "../scene/helpers";

const GAP = 30, R = 10, PLUS = 40;

/** Rows of dots, one group per count, with a "+" between groups. */
export function dotGroups(counts: number[], alt: string): SceneDiagram {
  if (counts.some(c => !Number.isInteger(c) || c < 0 || c > 20)) throw new Error("dot groups hold 0 to 20 dots");
  const items: SceneItem[] = [];
  let x = 16;
  const y = 24;
  counts.forEach((c, g) => {
    if (g) { items.push({ type: "text", x: r1(x + PLUS / 2 - GAP / 2 + R), y, text: "+", cls: "big" }); x += PLUS; }
    for (let i = 0; i < c; i++) {
      items.push({ type: "circle", cx: r1(x + R), cy: y, r: R, cls: "dotp", enter: "pop", delay: r1(0.05 * i + 0.3 * g) });
      x += GAP;
    }
  });
  return { kind: "scene", family: "counters", width: r1(x - GAP + 2 * R + 16), height: 48, items, alt };
}

const CELL = 26;

/** Ten frames (two rows of five), one per count, with the first `count` cells holding a dot, and "+" between frames. */
export function tenFrames(counts: number[], alt: string): SceneDiagram {
  if (counts.some(c => !Number.isInteger(c) || c < 0 || c > 10)) throw new Error("a ten frame holds 0 to 10");
  const items: SceneItem[] = [];
  const top = 8, frameW = 5 * CELL;
  let x = 8;
  counts.forEach((c, g) => {
    if (g) { items.push({ type: "text", x: r1(x + PLUS / 2), y: top + CELL, text: "+", cls: "big" }); x += PLUS; }
    for (let i = 0; i < 10; i++) {
      const cx = x + (i % 5) * CELL, cy = top + Math.floor(i / 5) * CELL;
      items.push({ type: "rect", x: r1(cx), y: r1(cy), w: CELL, h: CELL, cls: "seg" });
      if (i < c) items.push({ type: "circle", cx: r1(cx + CELL / 2), cy: r1(cy + CELL / 2), r: 8, cls: "dotp", enter: "pop", delay: r1(0.04 * i + 0.3 * g) });
    }
    x += frameW;
  });
  return { kind: "scene", family: "counters", width: r1(x + 8), height: top + 2 * CELL + 8, items, alt };
}
