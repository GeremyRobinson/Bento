import { useLayoutEffect, useRef } from "react";

/**
 * Keeps picture labels readable when an SVG shrinks (phones): sets `--px`, the drawing's units per screen pixel,
 * so the CSS can hold every label at 12px or more on screen (Design handoff 3).
 */
export function useLabelFloor<T extends SVGSVGElement>(width: number) {
  const ref = useRef<T>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const set = () => { const w = el.getBoundingClientRect().width; if (w > 0) el.style.setProperty("--px", (width / w).toFixed(3)); };
    set();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  return ref;
}
