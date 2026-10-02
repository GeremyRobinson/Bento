// A cylinder, or a cone inside its cylinder, drawn with the problem's radius and height in proportion.
import type { SceneDiagram } from "../scene/schema";
import { ellipse, frame, path, seg, t, M, L, type Draft } from "../geo/kit";

export interface CylinderSpec {
  cone: boolean;
  r: number; h: number;
  /** lines of working beside the solid, each from its beat */
  notes: { text: string; from: number; acc?: boolean }[];
  /** beat the base is shaded (its area) and the beat the solid fills */
  baseBeat: number; fillBeat: number;
  alt: string;
}

export function buildCylinder(s: CylinderSpec): SceneDiagram {
  const { r, h } = s;
  if (!(r > 0 && h > 0)) throw new Error("radius and height must be positive");
  const u = Math.min(150 / (2 * r), 200 / h);
  const rx = r * u, ry = Math.max(6, rx * 0.28), H = h * u;
  const items: Draft[] = [];
  // the base, shaded at its beat: its area times the height is the volume
  items.push(path(ellipse([0, 0], rx, ry), "fill", { from: s.baseBeat, enter: "fade" }));
  if (s.cone) {
    items.push(path([M([-rx, 0]), L([-rx, -H]), M([rx, 0]), L([rx, -H])], "ln faint dash", { enter: "fade" }));
    items.push(path(ellipse([0, -H], rx, ry), "ln faint dash", { enter: "fade" }));
    items.push(path([M([-rx, 0]), L([0, -H]), L([rx, 0]), { c: "Z" }], "fillsoft", { from: s.fillBeat, enter: "fade" }));
    items.push(path([M([-rx, 0]), L([0, -H]), L([rx, 0])], "ln", { enter: "draw" }));
  } else {
    items.push(path([M([-rx, 0]), L([-rx, -H]), L([rx, -H]), L([rx, 0]), { c: "Z" }], "fillsoft", { from: s.fillBeat, enter: "growy" }));
    items.push(path([M([-rx, 0]), L([-rx, -H]), M([rx, 0]), L([rx, -H])], "ln", { enter: "draw" }));
    items.push(path(ellipse([0, -H], rx, ry), "ln", { enter: "fade", delay: 0.4 }));
  }
  items.push(path(ellipse([0, 0], rx, ry), "ln", { enter: "fade" }));
  // radius along the base, height up the right side
  items.push(seg([0, 0], [rx, 0], "ln2", { enter: "draw", delay: 0.6 }));
  items.push(t(rx / 2, ry + 16, `r = ${r}`, "lbl acc", { enter: "rise", delay: 0.8 }));
  items.push(seg([rx + 16, 0], [rx + 16, -H], "tk", { enter: "draw", delay: 0.8 }));
  items.push(t(rx + 24, -H / 2, `h = ${h}`, "lbl acc start", { enter: "rise", delay: 1 }));
  const x0 = rx + 100;
  s.notes.forEach((n, i) => items.push(t(x0, -H / 2 - 30 + i * 30, n.text, `lbl start${n.acc ? " acc" : ""}`, { from: n.from, enter: "rise" })));
  return frame("cylinder", items, s.alt);
}
