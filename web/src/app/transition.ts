import { flushSync } from "react-dom";

export type Dir = "" | "fwd" | "back";

export const reduceMotion = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

type VTDocument = Document & { startViewTransition?: (cb: () => void) => unknown };

/** True while a cross-fade is drawing, so screens skip their own entrance animation. */
export const canCrossFade = () => typeof document !== "undefined" && !!(document as VTDocument).startViewTransition && !reduceMotion();

/**
 * Moving between screens (or grades) cross-fades with a view transition, sliding a little in the direction of travel,
 * like the current app. Browsers without view transitions get the screens' own rise-in instead.
 */
export function withTransition(update: () => void, dir: Dir = ""): void {
  const d = typeof document === "undefined" ? null : (document as VTDocument);
  if (!d || !d.startViewTransition || reduceMotion()) { update(); return; }
  d.documentElement.dataset.dir = dir;
  try {
    d.startViewTransition(() => { flushSync(update); });
  } catch {
    update();
  }
}
