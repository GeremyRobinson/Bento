// An analog clock face: the numbers 1 to 12, minute ticks, a short hour hand and a long minute hand,
// both at their true angles for the time. In a lesson the hands light up one at a time and the time is written below.
import type { SceneDiagram } from "../scene/schema";
import { arc, frame, path, polar, t, type Draft, type Pt } from "../geo/kit";

const R = 104, C: Pt = [0, 0];
/** screen angle (degrees, counterclockwise from the right) of a clock position measured in minutes (0 to 60) */
const at = (minutes: number) => 90 - minutes * 6;

export interface ClockSpec {
  hour: number;
  minute: number;
  /** beats for the hour hand, the minute hand and the written time; leave out for a plain clock to read */
  beats?: { hour: number; minute: number; time: number };
  /** labels for those beats, from the problem: e.g. "short hand: 8", "long hand: 30 minutes", "8:30" */
  text?: { hour: string; minute: string; time: string };
  alt: string;
}

export function buildClock(s: ClockSpec): SceneDiagram {
  if (!Number.isInteger(s.hour) || s.hour < 1 || s.hour > 12 || s.minute < 0 || s.minute >= 60) throw new Error("clock: hour 1 to 12, minute 0 to 59");
  const items: Draft[] = [
    { type: "circle", cx: 0, cy: 0, r: R, cls: "fillsoft", enter: "fade" } as Draft,
    { type: "circle", cx: 0, cy: 0, r: R, cls: "ax", enter: "fade" } as Draft,
  ];
  for (let m = 0; m < 60; m++) {
    const big = m % 5 === 0, [x1, y1] = polar(C, R - (big ? 11 : 6), at(m)), [x2, y2] = polar(C, R - 2, at(m));
    items.push({ type: "line", x1, y1, x2, y2, cls: big ? "ax thin" : "tk", enter: "fade" } as Draft);
  }
  for (let h = 1; h <= 12; h++) {
    const [x, y] = polar(C, R - 27, at(h * 5));
    items.push(t(x, y, String(h), "", { enter: "fade" }));
  }
  const b = s.beats, txt = s.text;
  const hourPos = (s.hour % 12) * 5 + (s.minute / 60) * 5;
  const hourTip = polar(C, R * 0.44, at(hourPos)), minTip = polar(C, R * 0.64, at(s.minute));
  // the minute hand's sweep from 12, under the hands
  if (b && s.minute > 0) items.push(path(arc(C, R * 0.52, 90, at(s.minute)), "hlline", { from: b.minute, enter: "draw slow", delay: 0.2 }));
  if (b) {
    items.push({ type: "line", x1: 0, y1: 0, x2: hourTip[0], y2: hourTip[1], cls: "hlline", from: b.hour, until: b.hour, enter: "fade" } as Draft);
    items.push({ type: "line", x1: 0, y1: 0, x2: minTip[0], y2: minTip[1], cls: "hlline", from: b.minute, until: b.minute, enter: "fade" } as Draft);
  }
  items.push({ type: "line", x1: 0, y1: 0, x2: minTip[0], y2: minTip[1], cls: "ln", enter: "draw", delay: 0.3 } as Draft);
  items.push({ type: "line", x1: 0, y1: 0, x2: hourTip[0], y2: hourTip[1], cls: "beam", enter: "draw", delay: 0.5 } as Draft);
  items.push({ type: "circle", cx: 0, cy: 0, r: 6, cls: "dotp", enter: "pop", delay: 0.6 } as Draft);
  if (b && txt) {
    const y = R + 30;
    items.push(t(0, y, txt.hour, "lbl", { from: b.hour, until: b.hour, enter: "rise", delay: 0.2 }));
    items.push(t(0, y, txt.minute, "lbl acc", { from: b.minute, until: b.minute, enter: "rise", delay: 0.4 }));
    items.push({ type: "rect", x: -58, y: y - 20, w: 116, h: 40, rx: 10, cls: "sq", from: b.time, enter: "pop" } as Draft);
    items.push(t(0, y, txt.time, "lbl big", { from: b.time, enter: "rise", delay: 0.2 }));
  }
  return frame("clock", items, s.alt, 14, { w: 520 });
}
