import { useMemo, useState, type CSSProperties } from "react";
import { useApp } from "../app/AppState";
import { entryById } from "../app/curriculum";
import { CATALOG } from "../curriculum/catalog";
import { GRADES, gradeOf } from "../curriculum/grades";
import { lessonById, lessonsInGrade } from "../curriculum/registry";
import type { Rng } from "../curriculum/generators/rng";
import { PlayingDiagram } from "../components/diagrams/PlayingDiagram";
import { GradeBadge } from "../components/primitives/Score";
import type { Explanation } from "../explanations/schema";

/** Tile sizes for the landing grid. Each pattern fills a 3 × 3 grid, so whichever is drawn, the bento stays square. */
type Size = "big" | "wide" | "one";
const PATTERNS: Size[][] = [
  ["big", "one", "one", "one", "one", "one"],
  ["big", "wide", "one", "one", "one"],
  ["wide", "wide", "wide", "one", "one", "one"],
];

export interface Showcase { id: string; size: Size; color: string }

/**
 * A fresh landing grid on every visit: a random layout, and one random lesson from each of a few random grades,
 * each showing a picture drawn from its own random problem.
 */
export function pickShowcase(rng: Rng): (Showcase & { ex: Pictured })[] {
  const sizes = rng.shuffle(rng.pick(PATTERNS));
  const out: (Showcase & { ex: Pictured })[] = [];
  for (const g of rng.shuffle(GRADES.map(x => x.grade))) {
    if (out.length === sizes.length) break;
    for (const l of rng.shuffle(lessonsInGrade(g))) {
      const ex = showcasePicture(l.id, rng);
      if (ex) { out.push({ id: l.id, size: sizes[out.length]!, color: gradeOf(g).color, ex }); break; }
    }
  }
  return out;
}

type Pictured = Explanation & { diagram: NonNullable<Explanation["diagram"]> };

/** A fresh problem's explanation picture for a showcase lesson, or null while the lesson isn't rebuilt (or has no picture). */
export function showcasePicture(id: string, rng: Rng): Pictured | null {
  const lesson = lessonById(id);
  if (!lesson) return null;
  const tryOne = (p: unknown): Pictured | null => {
    const ex = lesson.explain(p, lesson.answers(p));
    return ex.diagram ? (ex as Pictured) : null;
  };
  try { return tryOne(lesson.generate(rng, 0)); } catch { /* fall back to the worked reference */ }
  try { return tryOne(lesson.reference); } catch { return null; }
}

function Shot({ id, size, color, ex, k }: Showcase & { ex: Pictured; k: number }) {
  const entry = entryById(id), grade = gradeOf(entry?.grade ?? 5);
  const [replay, setReplay] = useState(0);
  const style = { "--tint": color, "--acc": "#f59e0b", "--i": k } as CSSProperties;
  return (
    <figure className={`lshot ${size}`} style={style} onClick={() => setReplay(r => r + 1)}>
      <PlayingDiagram ex={ex} replay={replay} />
      <figcaption><span className="lchip">{grade.name.split(" · ")[0]}</span>{entry?.title ?? id}</figcaption>
    </figure>
  );
}

/** The first screen on a new device: what Bento is, real lesson pictures, and the grade choice built in. */
export function Welcome() {
  const { progress, chooseGrade, deps, go } = useApp();
  const shots = useMemo(() => pickShowcase(deps().rng), []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="land">
      <nav className="lnav"><b>Bento</b>
        {progress.chosen
          ? <button className="lback" onClick={() => go({ name: "home" }, "fwd")}>My lessons ›</button>
          : <span>Kindergarten to 12th grade</span>}
      </nav>
      <section className="lhero">
        <h1>Math that finally clicks.</h1>
        <p>See the idea move. Solve it one step at a time. When you slip, find out exactly where, and why.</p>
        <div className="lpick"><span>Pick your grade to start</span>
          <div className="lgrades">{GRADES.map(g => (
            <button key={g.grade} className="lg" style={{ "--tint": g.color, "--j": g.grade } as CSSProperties} aria-label={g.name} onClick={() => chooseGrade(g.grade)}>
              <GradeBadge grade={g.grade} gxp={progress.gxp[g.grade] ?? 0} />
            </button>
          ))}</div>
        </div>
      </section>
      <section className="lsec"><h2>See it first.</h2><p>Every lesson opens with a picture that moves, so the idea makes sense before the numbers show up.</p></section>
      <section className="lshots">{shots.map((s, k) => <Shot key={s.id} {...s} k={k} />)}</section>
      <section className="lsec"><h2>One step at a time.</h2><p>Big problems get split into small moves. Each one is checked the moment you enter it.</p></section>
      <section className="lpair">
        <article className="lf"><span className="lk">Solve it</span>
          <div className="lsteps"><div className="q">47 × 36</div><div><span>47 × 30</span><b>1410</b></div><div><span>47 × 6</span><b>282</b></div><div className="sum"><span>1410 + 282</span><b>1692</b></div></div>
        </article>
        <article className="lf"><span className="lk">Slip up</span>
          <div className="lmiss"><div className="q">47 × 6</div><div className="bad"><span>Your answer</span><b>242</b></div>
            <p><b>You dropped a carry.</b> 7 × 6 is 42, so the 4 carries over. 40 × 6 = 240, plus 42 makes 282.</p></div>
        </article>
      </section>
      <section className="lfeats">
        <article className="lf"><h3>Help that steps back.</h3><p>Hints and worked steps fade as you get stronger, until it's just you and the problem.</p></article>
        <article className="lf"><h3>Review that sticks.</h3><p>A few old problems every day, picked from the skills you're shakiest on.</p></article>
        <article className="lf"><h3>K through 12.</h3><p>Counting to calculus. {CATALOG.length} lessons, unit tests and a check-up for every grade.</p></article>
        <article className="lf wide"><h3>A report for your grown-up.</h3><p>Scores, time spent and the exact mistakes made, so everyone knows what to work on next.</p></article>
      </section>
      <footer className="lfoot">Bento · Free. Private. No account needed.</footer>
    </div>
  );
}
