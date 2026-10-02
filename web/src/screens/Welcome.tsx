import { useMemo, useState, type CSSProperties } from "react";
import { useApp } from "../app/AppState";
import { entryById } from "../app/curriculum";
import { CATALOG } from "../curriculum/catalog";
import { GRADES, gradeOf } from "../curriculum/grades";
import { lessonById } from "../curriculum/registry";
import type { Rng } from "../curriculum/generators/rng";
import { PlayingDiagram } from "../components/diagrams/PlayingDiagram";
import { GradeBadge } from "../components/primitives/Score";
import { gradePattern } from "../components/primitives/gradePattern";
import type { Explanation } from "../explanations/schema";

/** The lessons shown on the landing page, with the tile colour each one takes (the current app's SHOWCASE). */
export const SHOWCASE: { id: string; big: boolean; color: string }[] = [
  { id: "g8-pyth", big: true, color: "#3b82f6" },
  { id: "g4-equiv", big: false, color: "#10b981" },
  { id: "g12-tangent", big: false, color: "#8b5cf6" },
  { id: "g8-translate", big: false, color: "#f2683c" },
  { id: "g12-defint", big: false, color: "#0ea5e9" },
  { id: "g8-slope", big: false, color: "#ec4899" },
];

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

function Shot({ id, big, color, k, rng }: { id: string; big: boolean; color: string; k: number; rng: Rng }) {
  const entry = entryById(id), grade = gradeOf(entry?.grade ?? 5);
  const ex = useMemo(() => showcasePicture(id, rng), [id, rng]);
  const [replay, setReplay] = useState(0);
  const style = { "--tint": color, "--acc": "#f59e0b", "--i": k } as CSSProperties;
  const caption = <figcaption><span className="lchip">{grade.name.split(" · ")[0]}</span>{entry?.title ?? id}</figcaption>;
  if (!ex) {
    // not rebuilt yet: a quiet tile in the lesson's grade pattern, so the grid keeps its shape
    return (
      <figure className={`lshot pending${big ? " big" : ""}`} style={style} aria-label={`${entry?.title ?? id}, picture coming soon`}>
        <div className="lpend" style={{ backgroundImage: gradePattern(grade.grade, color) }}><span className="lpend-mark">{grade.short}</span></div>
        {caption}
      </figure>
    );
  }
  return (
    <figure className={`lshot${big ? " big" : ""}`} style={style} onClick={() => setReplay(r => r + 1)}>
      <PlayingDiagram ex={ex} replay={replay} />
      {caption}
    </figure>
  );
}

/** The first screen on a new device: what Bento is, real lesson pictures, and the grade choice built in. */
export function Welcome() {
  const { progress, chooseGrade, deps, go } = useApp();
  const rng = useMemo(() => deps().rng, []); // eslint-disable-line react-hooks/exhaustive-deps
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
      <section className="lshots">{SHOWCASE.map((s, k) => <Shot key={s.id} {...s} k={k} rng={rng} />)}</section>
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
