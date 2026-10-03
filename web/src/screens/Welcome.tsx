import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useApp } from "../app/AppState";
import { entryById } from "../app/curriculum";
import { GRADES, gradeOf, tintStyle } from "../curriculum/grades";
import { lessonById, lessonsInGrade } from "../curriculum/registry";
import type { Rng } from "../curriculum/generators/rng";
import { PlayingDiagram } from "../components/diagrams/PlayingDiagram";
import { reduceMotion } from "../app/transition";
import { FeatureBox } from "../components/LandingTiles";
import { GradeNum, Shelf } from "../components/Shelf";
import { Advanced } from "../components/Advanced";
import type { Explanation } from "../explanations/schema";

/**
 * Layouts for the landing grid, in the order the tiles are placed. Each one fills three columns by three rows
 * exactly, so whichever is drawn, the bento stays a clean rectangle with no gaps.
 */
type Size = "big" | "wide" | "one";
const LAYOUTS: Size[][] = [
  ["big", "one", "one", "one", "one", "one"],
  ["one", "big", "one", "one", "one", "one"],
  ["big", "one", "one", "wide", "one"],
  ["one", "big", "one", "one", "wide"],
  ["wide", "one", "one", "wide", "wide", "one"],
  ["one", "wide", "wide", "one", "one", "wide"],
];

export interface Showcase { id: string; size: Size; color: string; tail?: boolean }

/**
 * A fresh landing grid on every visit: a random layout, and one random lesson from each of a few random grades,
 * each showing a picture drawn from its own random problem.
 */
export function pickShowcase(rng: Rng): (Showcase & { ex: Pictured })[] {
  const sizes = rng.pick(LAYOUTS);
  const out: (Showcase & { ex: Pictured })[] = [];
  for (const g of rng.shuffle(GRADES.map(x => x.grade))) {
    if (out.length === sizes.length) break;
    for (const l of rng.shuffle(lessonsInGrade(g))) {
      const ex = showcasePicture(l.id, rng);
      if (ex) { out.push({ id: l.id, size: sizes[out.length]!, color: gradeOf(g).color, ex }); break; }
    }
  }
  // in two columns, single tiles pair up; an odd one out takes the whole row instead of leaving a gap
  const ones = out.filter(o => o.size === "one");
  if (ones.length % 2) ones[ones.length - 1]!.tail = true;
  return out;
}

type Pictured = Explanation & { diagram: NonNullable<Explanation["diagram"]> };

/** Showcases want pictures, not ladders of equations: those look crammed in a tile (G, 2026-10-03), so they're passed over. */
const tooTall = (d: Pictured["diagram"]) => d.kind === "chain";

/** A fresh problem's explanation picture for a showcase lesson, or null while the lesson isn't rebuilt (or has no picture that fits a tile). */
export function showcasePicture(id: string, rng: Rng): Pictured | null {
  const lesson = lessonById(id);
  if (!lesson) return null;
  const tryOne = (p: unknown): Pictured | null => {
    const ex = lesson.explain(p, lesson.answers(p));
    if (!ex.diagram || tooTall(ex.diagram)) return null;
    return ex as Pictured;
  };
  try { return tryOne(lesson.generate(rng, 0)); } catch { /* fall back to the worked reference */ }
  try { return tryOne(lesson.reference); } catch { return null; }
}

/**
 * The landing's moving pictures come from the lessons with the boldest, most colorful diagrams: blocks, clocks,
 * coins, graphs, shapes and solids. Thin number lines and balances teach well but look plain at this size.
 */
export const SHOWY = [
  "k-tens", "k-teens", "k-make10", "g1-tensones", "g1-time", "g1-halves", "g2-hundreds", "g2-regroup", "g2-money", "g2-bargraph", "g2-arrays",
  "g3-split", "g3-fraccompare", "g3-area", "g4-partial", "g4-likefrac", "g4-dec",
  "add", "g5-improper", "g5-multfrac", "g5-volume", "g6-gcf", "g6-mean", "g6-tri", "g7-circarea", "g7-prob",
  "g8-system", "g8-pyth", "g8-cyl", "g8-cone", "g8-tri",
  "g9-foil", "g9-quadform", "g10-polygon", "g10-similar", "g10-trig", "g10-sector", "g10-surface",
  "g11-geo", "g11-vertex", "g12-unit", "g12-tangent", "g12-dot",
];
/** Three bands so the three pictures always span the school years: one early, one middle, one high. */
const BANDS = [[0, 4], [5, 8], [9, 12]] as const;

/** A moving lesson picture that plays, then moves on to another from its band. Tap for the next one. */
function LandingPicture({ rng, band, big, delay }: { rng: Rng; band: readonly [number, number]; big?: boolean; delay: number }) {
  const [n, setN] = useState(0);
  const pool = useMemo(() => rng.shuffle(SHOWY.filter(id => { const g = lessonById(id)?.grade; return g != null && g >= band[0] && g <= band[1]; })), [rng, band]);
  const shot = useMemo(() => {
    for (let k = 0; k < pool.length; k++) {
      const id = pool[(n + k) % pool.length]!, ex = showcasePicture(id, rng);
      if (ex) return { id, grade: lessonById(id)!.grade, ex };
    }
    return null;
  }, [n, pool, rng]);
  // every picture opens finished, holds, then plays; the first round is staggered so the three stay out of step
  const hold = 1200 + (n ? 0 : delay);
  useEffect(() => {
    if (reduceMotion() || !shot) return;
    const t = setTimeout(() => setN(k => k + 1), hold + 2400 + shot.ex.timeline.length * 750);
    return () => clearTimeout(t);
  }, [shot, hold]);
  if (!shot) return null;
  const g = gradeOf(shot.grade), entry = entryById(shot.id);
  return (
    // the card stays put; only what's inside it fades over to the next picture
    <figure className={`lhpic${big ? "" : " sm"}`} style={tintStyle(g) as CSSProperties} onClick={() => setN(k => k + 1)}>
      <figcaption key={`c${n}`}><GradeNum grade={shot.grade} /><span>{big && <small>See it first</small>}<b>{entry?.title ?? shot.id}</b></span></figcaption>
      <div className="lhd" key={`d${n}`}><PlayingDiagram ex={shot.ex} hold={hold} /></div>
    </figure>
  );
}

/** The hero box: one big moving picture and two smaller ones, each from a different part of school. */
function HeroPictures({ rng }: { rng: Rng }) {
  const bands = useMemo(() => rng.shuffle([...BANDS]), [rng]);
  return <>{bands.map((b, i) => <LandingPicture key={b[0]} rng={rng} band={b} big={i === 0} delay={i * 1600} />)}</>;
}

/** The first screen on a new device: what Bento is, the real thing working, and the grade shelf to start from. */
export function Welcome() {
  const { chooseGrade, deps } = useApp();
  const rng = useMemo(() => deps().rng, []); // eslint-disable-line react-hooks/exhaustive-deps
  const toShelf = () => document.getElementById("lshelf")?.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
  return (
    <div className="land">
      <section className="lhero">
        <h1>Math that <span>clicks.</span></h1>
        <p>See the idea move. Solve it one step at a time. When you slip, find out exactly where, and why.</p>
        <div className="lcta"><button className="ctl go" onClick={toShelf}>Choose your grade</button><span>Free. No account.</span></div>
      </section>
      <section className="lhbox">
        <HeroPictures rng={rng} />
      </section>
      <section className="lsec" id="lshelf"><h2>Pick your grade.</h2><p>Every grade is a book of chapters, Kindergarten to 12th. Start anywhere, and change any time.</p></section>
      <div className="lshelf"><Shelf current={null} onPick={chooseGrade} soon={false} /></div>
      <section className="lsec"><h2>Everything in one box.</h2><p>Bento is more than lessons. Here's the rest of it, working.</p></section>
      <FeatureBox rng={rng} />
      <Advanced />
      <footer className="lfoot">Bento · Free. Private. No account needed.</footer>
    </div>
  );
}
