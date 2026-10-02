import { useMemo, type CSSProperties } from "react";
import { useApp } from "../app/AppState";
import { mins, when } from "../app/format";
import { bandOf } from "../curriculum/grades";
import { lessonById, lessonsInGrade } from "../curriculum/registry";
import { LEVELS } from "../engine/mastery/levels";
import type { SessionReport } from "../engine/session/types";
import { SessionReportView } from "../components/reports/SessionReportView";

function Confetti() {
  const bits = useMemo(() => {
    const cols = ["var(--c0)", "var(--c1)", "var(--c2)", "var(--acc)"], r = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
    return Array.from({ length: 28 }, (_, i) => ({ "--x": `${r(-160, 160)}px`, "--y": `${r(-220, -80)}px`, "--r": `${r(-300, 300)}deg`, "--c": cols[i % 4], "--d": `${(i % 7) * 0.03}s` }) as CSSProperties);
  }, []);
  return <div className="confetti" aria-hidden="true">{bits.map((s, i) => <i key={i} style={s} />)}</div>;
}

/** The screen after a run: score ring, XP, time, then the full report. */
export function Results() {
  const { lastReport: rep, progress, go, startLesson } = useApp();
  if (!rep) return <section className="panel"><p className="empty">Nothing finished yet.</p><div className="actions"><button className="ctl go" onClick={() => go({ name: "home" })}>All lessons</button></div></section>;
  const lesson = lessonById(rep.key), test = rep.mode === "test", review = rep.mode === "review";
  const grade = lesson ? lessonsInGrade(lesson.grade) : [], k = lesson ? grade.indexOf(lesson) : -1, next = grade[k + 1];
  const band = bandOf(lesson?.grade ?? progress.grade ?? 5);
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
            <div><span className="k">XP earned</span><span className="v">+{rep.xp}</span></div>
            <div><span className="k">{test ? "All steps right" : "No mistakes"}</span><span className="v">{rep.clean}/{rep.total}</span></div>
            <div><span className="k">Time</span><span className="v">{mins(rep.ms)}<small className="muted"> min</small></span></div>
          </div>
          <div className="actions">
            {rep.mode === "practice" && next && <button className="ctl go" onClick={() => go({ name: "learn", lessonId: next.id })}>Next lesson</button>}
            {!test && !review && lesson && <button className="ctl" onClick={() => startLesson(lesson.id)}>Practice again</button>}
            <button className="ctl" onClick={() => go({ name: "home" })}>All lessons</button>
          </div>
        </section>
        <div className="bcol"><SessionReportView rep={rep} /></div>
      </div>
    </>
  );
}

/** A saved report, opened from the lesson's "Last time" tile. */
export function ReportScreen({ rep }: { rep: SessionReport | undefined }) {
  const { go } = useApp();
  const back = () => go(rep && lessonById(rep.key) ? { name: "learn", lessonId: rep.key } : { name: "home" });
  return (
    <>
      <div className="bar"><button className="ctl" onClick={back}>Back</button><span className="ctl grow" style={{ background: "none" }}>{rep ? `${rep.title}: ${when(rep.date)}` : "Report"}</span></div>
      {rep ? <SessionReportView rep={rep} /> : <p className="empty">That report isn't saved on this device.</p>}
    </>
  );
}
