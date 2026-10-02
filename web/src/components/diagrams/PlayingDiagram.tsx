import { useEffect, useRef, useState } from "react";
import { reduceMotion } from "../../app/transition";
import type { Explanation } from "../../explanations/schema";
import { Diagram } from "./Diagram";

const BEAT_MS = 750;

/**
 * An explanation's picture that plays through its whole timeline by itself: when it scrolls into view,
 * and again each time `replay` changes. Without motion (or without IntersectionObserver) it shows the finished picture.
 */
export function PlayingDiagram({ ex, replay = 0 }: { ex: Explanation & { diagram: NonNullable<Explanation["diagram"]> }; replay?: number }) {
  const last = ex.timeline.length - 1;
  const still = reduceMotion() || typeof IntersectionObserver === "undefined";
  const [at, setAt] = useState(still ? last : 0);
  const [playing, setPlaying] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // start when at least a third of it is on screen
  useEffect(() => {
    if (still || !box.current) return;
    const io = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting)) { io.disconnect(); setPlaying(true); }
    }, { threshold: 0.35 });
    io.observe(box.current);
    return () => io.disconnect();
  }, [still]);

  // a tap replays from the start
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (still) return;
    setAt(0);
    setPlaying(true);
  }, [replay, still]);

  useEffect(() => {
    if (!playing) return;
    if (at >= last) { setPlaying(false); return; }
    const t = setTimeout(() => setAt(a => Math.min(last, a + 1)), at === 0 ? 450 : BEAT_MS);
    return () => clearTimeout(t);
  }, [playing, at, last]);

  return <div className="viz" ref={box}><Diagram key={replay} diagram={ex.diagram} timeline={ex.timeline} at={at} /></div>;
}
