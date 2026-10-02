import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useApp } from "../app/AppState";
import { mins, when } from "../app/format";
import { reduceMotion } from "../app/transition";
import { bandOf, gradeOf } from "../curriculum/grades";
import { lessonById, lessonsInGrade } from "../curriculum/registry";
import { LEVELS } from "../engine/mastery/levels";
import { backFor } from "../engine/session/practice";
import type { SessionReport } from "../engine/session/types";
import { SessionReportView } from "../components/reports/SessionReportView";

function Confetti() {
  const bits = useMemo(() => {
    const cols = ["var(--c0)", "var(--c1)", "var(--c2)", "var(--acc)"], r = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
    return Array.from({ length: 28 }, (_, i) => ({ "--x": `${r(-160, 160)}px`, "--y": `${r(-220, -80)}px`, "--r": `${r(-300, 300)}deg`, "--c": cols[i % 4], "--d": `${(i % 7) * 0.03}s` }) as CSSProperties);
  }, []);
  return <div className="confetti" aria-hidden="true">{bits.map((s, i) => <i key={i} style={s} />)}</div>;
}

/** Counts up from 0 over a moment, like the current app's XP figure. */
export function CountUp({ to, pre = "" }: { to: number; pre?: string }) {
  const [v, setV] = useState(() => (reduceMotion() || typeof requestAnimationFrame === "undefined" ? to : 0));
  useEffect(() => {
    if (reduceMotion() || typeof requestAnimationFrame === "undefined") { setV(to); return; }
    const t0 = performance.now(), dur = 900;
    let id = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      setV(Math.round(to * e));
      if (k < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [to]);
  return <span aria-label={`${pre}${to}`}>{pre}{v}</span>;
}

/** The screen after a run: score ring, XP, time, what to do next, then the full report. */
export function Results() {
  const { lastReport: rep, progress, go, startLesson, startTest } = useApp();
  if (!rep) return <section className="panel"><p className="empty">Nothing finished yet.</p><div className="actions"><button className="ctl go" onClick={() => go({ name: "home" })}>All lessons</button></div></section>;
  const lesson = lessonById(rep.key), test = rep.mode === "test", review = rep.mode === "review";
  const grade = lesson ? lessonsInGrade(lesson.grade) : [], k = lesson ? grade.indexOf(lesson) : -1, next = grade[k + 1];
  const lastLesson = lessonById(rep.probs[rep.probs.length - 1]?.lessonId ?? "");
  const band = bandOf(lesson?.grade ?? lastLesson?.grade ?? progress.grade ?? 5);
  // a low score suggests the lesson that builds up to this one
  const back = rep.mode === "practice" && rep.level <= 1 ? backFor(rep.key) : null;
  return (
    <>
      <div className="bar"><span className="grow">{rep.title}: done</span><span className="ctl badged"><span className="badge on">⭐</span><span className="mono">{progress.xp}</span></span></div>
      <div className="bdone">
        <section className="panel">
          <div className={`donehead s${rep.level}`}>
            {rep.level >= 3 && band !== "high" && <Confetti />}
            <div className="ring"><svg viewBox="0 0 92 92"><circle className="trk" cx="46" cy="46" r="40" /><circle className="val" cx="46" cy="46" r="40" pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1 - rep.level / 4 }} /></svg><b>{rep.level}</b></div>
            <div className="donetext"><h2>{LEVELS[rep.level]}</h2><p className="muted">Score {rep.level} of 4 · {Math.round(rep.pct * 100)}% of steps right the first time</p></div>
          </div>
          <div className="bento">
            <div><span className="k">XP earned</span><span className="v"><CountUp to={rep.xp} pre="+" /></span></div>
            <div><span className="k">{test ? "All steps right" : "No mistakes"}</span><span className="v">{rep.clean}/{rep.total}</span></div>
            <div><span className="k">Time</span><span className="v">{mins(rep.ms)}<small className="muted"> min</small></span></div>
          </div>
          {back && (
            <button className="lesson t1 backup" onClick={() => go({ name: "learn", lessonId: back.id })}>
              <span className="badge">↩</span><span className="name">Build up first: {back.title}</span><span className="muted">{gradeOf(back.grade).name}</span>
            </button>
          )}
          <div className="actions">
            {rep.mode === "practice" && next && <button className="ctl go" onClick={() => go({ name: "learn", lessonId: next.id }, "fwd")}>Next lesson</button>}
            {test ? <button className="ctl go" onClick={() => startTest(rep.key)}>Take it again</button>
              : !review && lesson && <button className="ctl" onClick={() => startLesson(lesson.id)}>Practice again</button>}
            <button className="ctl" onClick={() => go({ name: "home" }, "back")}>All lessons</button>
          </div>
        </section>
        <div className="bcol"><SessionReportView rep={rep} /></div>
      </div>
    </>
  );
}

/** A saved report, opened from the lesson's "Last time" tile or from the grown-up page. */
export function ReportScreen({ rep }: { rep: SessionReport | undefined }) {
  const { go } = useApp();
  const back = () => go(rep && lessonById(rep.key) ? { name: "learn", lessonId: rep.key } : { name: "parent" }, "back");
  return (
    <>
      <div className="bar"><button className="ctl" onClick={back}>Back</button><span className="ctl grow" style={{ background: "none" }}>{rep ? `${rep.title}: ${when(rep.date)}` : "Report"}</span></div>
      {rep ? <SessionReportView rep={rep} /> : <p className="empty">That report isn't saved on this device.</p>}
    </>
  );
}
