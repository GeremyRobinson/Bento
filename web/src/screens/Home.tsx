import { useEffect, useRef, type CSSProperties } from "react";
import { useApp } from "../app/AppState";
import { gradeOf } from "../curriculum/grades";
import { lessonsInGrade, unitsOf } from "../curriculum/registry";
import { lastScore, timesDone, type Progress } from "../engine/mastery/progress";
import { currentItem, lessonOfItem } from "../engine/session/practice";
import { TopBar } from "../components/TopBar";
import { BigRing, ScoreChip } from "../components/primitives/Score";
import { gradePattern } from "../components/primitives/gradePattern";

/** Average of the last scores in a grade, or null when nothing is scored yet. */
export function gradeAverage(p: Progress, grade: number): number | null {
  const s: number[] = lessonsInGrade(grade).flatMap(l => { const v = lastScore(p, l.id); return v == null ? [] : [v]; });
  return s.length ? s.reduce((a, b) => a + b, 0) / s.length : null;
}

/** Home is a bento grid: the big tile is what to do next; progress sits beside it; units fill the rest. */
export function Home() {
  const { progress, go, openSheet } = useApp();
  const g = progress.grade ?? 5, grade = gradeOf(g), list = lessonsInGrade(g), units = unitsOf(g);
  const isDone = (id: string) => timesDone(progress, id) > 0;
  const next = list.find(l => !isDone(l.id));
  const pick = next ?? [...list].sort((a, b) => (lastScore(progress, a.id) ?? 9) - (lastScore(progress, b.id) ?? 9))[0];
  const run = progress.run;
  const done = list.filter(l => isDone(l.id)).length, avg = gradeAverage(progress, g);
  const weak = list.filter(l => { const s = lastScore(progress, l.id); return s != null && s <= 1; });

  // first time on this device: start on the grade picker instead of assuming a grade
  const asked = useRef(false);
  useEffect(() => {
    if (!asked.current && !progress.chosen && !progress.xp && !progress.done) { asked.current = true; openSheet(true); }
  }, [progress.chosen, progress.xp, progress.done, openSheet]);

  let k = 0;
  return (
    <>
      <TopBar />
      <div className={`bhome${weak.length ? " tall" : ""}`}>
        <section className="hero t0 b-hero"><div className="pat" style={{ backgroundImage: gradePattern(g) }} />
          <div><h1>{grade.name}</h1><p className="sub">{grade.subtitle} · {list.length} lesson{list.length === 1 ? "" : "s"}</p></div>
          {units.length > 1 && (
            <div className="uprog">{units.map(u => { const d = u.lessons.filter(l => isDone(l.id)).length; return (
              <div key={u.name}><span className="k">{u.name}</span><span className="bar2"><i style={{ width: `${(100 * d / u.lessons.length).toFixed(1)}%` }} /></span><span className="mono">{d}/{u.lessons.length}</span></div>
            ); })}</div>
          )}
          {run ? (
            <button className="upnext" onClick={() => go({ name: "practice" })}>
              <span className="k">Keep going · {gradeOf(lessonOfItem(currentItem(run)).grade).name}</span><b>{run.title}</b>
              <span className="row"><span className="muted">Problem <span className="mono">{run.i + 1}</span> of <span className="mono">{run.items.length}</span></span><span className="ctl go">Keep going ›</span></span>
            </button>
          ) : pick ? (
            <button className="upnext" onClick={() => go({ name: "learn", lessonId: pick.id })}>
              <span className="k">{next ? "Up next" : "Practice"} · {pick.unit} · lesson {list.indexOf(pick) + 1}</span><b>{pick.title}</b>
              <span className="row">{lastScore(progress, pick.id) != null ? <ScoreChip n={lastScore(progress, pick.id)} words /> : <span className="muted">Learn it, then practice</span>}<span className="ctl go">Start ›</span></span>
            </button>
          ) : (
            <div className="upnext"><span className="k">Being rebuilt</span><b>{grade.name} lessons are on their way</b><span className="row"><span className="muted">5th grade has the first rebuilt lesson.</span></span></div>
          )}
        </section>
        <section className="tile b-stats solo">
          <div className="statgrid">
            <div className="st"><BigRing small frac={list.length ? done / list.length : 0} label={done} /><span className="k">of {list.length} lessons done</span></div>
            <div className="st"><span className="v">{avg == null ? "—" : avg.toFixed(1)}</span><span className="k">average score of 4</span></div>
            <div className="st"><span className="v">{progress.streak}</span><span className="k">day streak</span></div>
          </div>
        </section>
        {weak.length > 0 && (
          <section className="tile b-weak"><div className="unit"><h3>Practice again</h3></div>
            <div className="lessons">{weak.slice(0, 3).map(l => (
              <button key={l.id} className="lesson" onClick={() => go({ name: "learn", lessonId: l.id })}><ScoreChip n={lastScore(progress, l.id)} /><span className="name">{l.title}</span></button>
            ))}</div>
          </section>
        )}
      </div>
      <div className="units">
        {units.map(u => (
          <section className="panel" key={u.name}>
            <div className="unit"><h3>{u.name}</h3></div>
            <div className="lessons">{u.lessons.map(l => {
              const sc = lastScore(progress, l.id); k++;
              return (
                <button key={l.id} className={`lesson t${(k - 1) % 3}`} onClick={() => go({ name: "learn", lessonId: l.id })}>
                  <span className={`badge${isDone(l.id) ? " on" : ""}`}>{k}</span><span className="name">{l.title}</span>
                  {sc != null ? <ScoreChip n={sc} /> : l === next ? <><span className="muted">up next</span><span className="dot busy" /></> : <span className="dot" />}
                </button>
              );
            })}</div>
          </section>
        ))}
      </div>
      <BackupFoot />
    </>
  );
}

/** Save or restore everything on this device as one file. */
function BackupFoot() {
  const { exportBackup, importBackup } = useApp();
  const file = useRef<HTMLInputElement>(null);
  const save = () => {
    const url = URL.createObjectURL(new Blob([exportBackup()], { type: "application/json" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `bento-backup-${new Date().toISOString().slice(0, 10)}.json` });
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const load = async (f: File | undefined) => {
    if (!f) return;
    try { await importBackup(await f.text()); } catch (e) { alert((e as Error).message); }
    if (file.current) file.current.value = "";
  };
  return (
    <footer className="foot" style={{ "--tint": "var(--muted)" } as CSSProperties}>
      <button onClick={save}>Save a backup</button>
      <button onClick={() => file.current?.click()}>Restore a backup</button>
      <input ref={file} type="file" accept="application/json,.json" hidden onChange={e => void load(e.target.files?.[0])} />
    </footer>
  );
}
