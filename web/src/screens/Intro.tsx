import { useMemo, useState, type CSSProperties } from "react";
import { useApp } from "../app/AppState";
import { doneCount, entriesInGrade, isReady, unitsInGrade, type Entry } from "../app/curriculum";
import { COMING_SOON } from "../curriculum/catalog";
import { gradeOf } from "../curriculum/grades";
import type { Rng } from "../curriculum/generators/rng";
import { PlayingDiagram } from "../components/diagrams/PlayingDiagram";
import { GradeBadge } from "../components/primitives/Score";
import { showcasePicture } from "./Welcome";

/** One unit of the year: a moving picture from a fresh problem of its first lesson that has one, then its lessons. */
function UnitTile({ name, entries, k, solo, soon = [], rng, open }: { name: string; entries: Entry[]; k: number; solo: boolean; soon?: string[]; rng: Rng; open: (c: Entry) => void }) {
  const ex = useMemo(() => {
    for (const c of entries) { const pic = isReady(c.id) ? showcasePicture(c.id, rng) : null; if (pic) return pic; }
    return null;
  }, [entries, rng]);
  const [replay, setReplay] = useState(0);
  return (
    <article className={`yunit${solo ? " solo" : ""}`} style={{ "--i": k } as CSSProperties}>
      {ex && <div className="ypic" onClick={() => setReplay(r => r + 1)}><PlayingDiagram ex={ex} replay={replay} /></div>}
      <div className="ybody">
        {solo ? <h2>This year's lessons</h2> : <><span className="k">Unit {k + 1}</span><h2>{name}</h2></>}
        <ol>{entries.map(c => (
          <li key={c.id}><button disabled={!isReady(c.id)} onClick={() => open(c)}>{c.title}</button></li>
        ))}{soon.map(t => <li key={t} className="soon"><button disabled>{t}<small>soon</small></button></li>)}</ol>
      </div>
    </article>
  );
}

/** A grade's own opening page: what this year is about, one moving picture per unit, and every lesson in order. */
export function Intro() {
  const { progress, go, deps } = useApp();
  const rng = useMemo(() => deps().rng, []); // eslint-disable-line react-hooks/exhaustive-deps
  const g = progress.grade ?? 5, grade = gradeOf(g), list = entriesInGrade(g), units = unitsInGrade(g);
  const started = doneCount(progress, list) > 0;
  const open = (c: Entry) => go({ name: "learn", lessonId: c.id }, "fwd");
  const home = () => go({ name: "home" }, "fwd");
  return (
    <div className="year">
      <nav className="lnav"><b>Bento</b><button className="lback" onClick={home}>My lessons ›</button></nav>
      <section className="yhero">
        <GradeBadge grade={g} gxp={progress.gxp[g] ?? 0} />
        <h1>{grade.name}</h1>
        <p className="ysub">This year: {grade.subtitle.toLowerCase()}.</p>
        <p>{list.length} lesson{list.length === 1 ? "" : "s"}{units.length > 1 ? ` in ${units.length} units` : ""}. Each one starts with a picture that moves, then you solve it one step at a time.</p>
        <button className="ctl go big" onClick={home}>{started ? "Back to my lessons ›" : "Start the year ›"}</button>
      </section>
      <section className="yunits">{units.map((u, k) => <UnitTile key={u.name} {...u} k={k} solo={units.length === 1} soon={units.length === 1 ? COMING_SOON[g] : undefined} rng={rng} open={open} />)}</section>
    </div>
  );
}
