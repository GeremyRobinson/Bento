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
import { SlipTile, SolveTile } from "../components/StepDemos";
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

/** The hero's big picture: a lesson's moving picture from a random grade, moving on to another after it plays. */
function HeroPicture({ rng }: { rng: Rng }) {
  const [n, setN] = useState(0);
  const shot = useMemo(() => {
    for (let tries = 0; tries < 20; tries++) {
      const g = rng.pick(GRADES).grade, l = rng.pick(lessonsInGrade(g));
      const ex = l && showcasePicture(l.id, rng);
      if (l && ex) return { id: l.id, grade: g, ex };
    }
    return null;
  }, [n, rng]);
  useEffect(() => {
    if (reduceMotion() || !shot) return;
    const t = setTimeout(() => setN(k => k + 1), 2400 + shot.ex.timeline.length * 750);
    return () => clearTimeout(t);
  }, [shot]);
  if (!shot) return null;
  const g = gradeOf(shot.grade), entry = entryById(shot.id);
  return (
    <figure className="lhpic" key={n} style={tintStyle(g) as CSSProperties} onClick={() => setN(k => k + 1)}>
      <figcaption><GradeNum grade={shot.grade} /><span><small>See it first</small><b>{entry?.title ?? shot.id}</b></span></figcaption>
      <PlayingDiagram ex={shot.ex} />
    </figure>
  );
}

/** The first screen on a new device: what Bento is, the real thing working, and the grade shelf to start from. */
export function Welcome() {
  const { chooseGrade, deps } = useApp();
  const rng = useMemo(() => deps().rng, []); // eslint-disable-line react-hooks/exhaustive-deps
  const toShelf = () => document.getElementById("lshelf")?.scrollIntoView({ behavior: reduceMotion() ? "auto" : "smooth", block: "start" });
  return (
    <div className="land">
      <section className="lhero">
        <h1>Math that <span>finally clicks.</span></h1>
        <p>See the idea move. Solve it one step at a time. When you slip, find out exactly where, and why.</p>
        <div className="lcta"><button className="ctl go" onClick={toShelf}>Choose your grade</button><span>Free. No account.</span></div>
      </section>
      <section className="lhbox">
        <HeroPicture rng={rng} />
        <SolveTile rng={rng} />
        <SlipTile rng={rng} />
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
