import { useEffect, useMemo, useState } from "react";
import { useApp } from "../app/AppState";
import { gradeOf } from "../curriculum/grades";
import { lessonsInGrade, requireLesson } from "../curriculum/registry";
import { HELP_TIERS, tierFor } from "../engine/adaptive-help/policy";
import { LEVELS } from "../engine/mastery/levels";
import { lastScore } from "../engine/mastery/progress";
import { when } from "../app/format";
import { AreaModelDiagram } from "../components/diagrams/AreaModelDiagram";
import { Chevron, HomeIcon } from "../components/primitives/icons";
import { MathLine } from "../components/primitives/MathLine";
import { ScoreChip } from "../components/primitives/Score";
import type { Explanation } from "../explanations/schema";

const PLAY_MS = 1800;
const reduceMotion = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Which beat a timeline position belongs to: done, playing now, or still to come. */
export const beatState = (beatAt: number, at: number) => (beatAt < at ? "done" : beatAt === at ? "now" : "later");

/**
 * The lesson: the problem, its picture and its narration, all from one explanation model.
 * Each "Next" moves one state along the timeline; the picture, the highlighted beat and the dots follow it.
 */
export function Learn({ lessonId }: { lessonId: string }) {
  const { progress, reports, go, startLesson, deps } = useApp();
  const lesson = requireLesson(lessonId);
  const [example, setExample] = useState<unknown>(lesson.reference);
  const [at, setAt] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => { setExample(lesson.reference); setAt(0); setPlaying(false); }, [lesson]);

  const ex: Explanation = useMemo(() => lesson.explain(example, lesson.answers(example)), [lesson, example]);
  const last = ex.timeline.length - 1, finished = at >= last;

  useEffect(() => {
    if (!playing) return;
    if (finished) { setPlaying(false); return; }
    const t = setTimeout(() => setAt(a => Math.min(last, a + 1)), PLAY_MS);
    return () => clearTimeout(t);
  }, [playing, at, finished, last]);

  const grade = lessonsInGrade(lesson.grade), k = grade.indexOf(lesson);
  const prev = grade[k - 1], next = grade[k + 1];
  const sc = lastScore(progress, lesson.id), rep = reports[lesson.id], tier = tierFor(sc);

  return (
    <>
      <div className="bar">
        <button className="ctl circ" onClick={() => go({ name: "home" })} aria-label="Home"><HomeIcon /></button>
        <span className="dots-nav" aria-label={`Part ${at + 1} of ${last + 1}`}>
          {ex.timeline.map((_, i) => <span key={i} className={`dot ${i < at ? "ok" : i === at ? "busy" : ""}`} />)}
        </span>
        <button className="ctl" onClick={() => startLesson(lesson.id)}>Practice</button>
      </div>
      <div className="bar">
        <button className="ctl circ" disabled={!prev} onClick={() => prev && go({ name: "learn", lessonId: prev.id })} aria-label="Previous lesson"><Chevron dir="left" /></button>
        <span className="grow" style={{ textAlign: "center" }}>{lesson.title}</span>
        <button className="ctl circ" disabled={!next} onClick={() => next && go({ name: "learn", lessonId: next.id })} aria-label="Next lesson"><Chevron dir="right" /></button>
      </div>
      <div className="blearn">
        <section className="panel learn walk">
          <div className="card">
            <h2 className="label">{ex.heading}</h2>
            <div className="math"><MathLine math={ex.statement} /></div>
            <AreaModelDiagram diagram={ex.diagram} timeline={ex.timeline} at={reduceMotion() && playing ? last : at} />
            <ol className="beats" aria-live="polite">
              {ex.steps.map((s, i) => (
                <li key={s.id} className="beat" data-state={beatState(s.state, at)}>
                  <span className="badge">{i + 1}</span>
                  <span className="say"><MathLine math={s.math} /><span>{s.narration}</span></span>
                </li>
              ))}
            </ol>
            {(finished || at === 0) && <p className="note">{finished ? "That's the whole problem. Your turn!" : "Tap Play to watch it split up."}</p>}
          </div>
          <div className="actions" style={{ justifyContent: "space-between" }}>
            <button className="ctl" disabled={at === 0} onClick={() => { setPlaying(false); setAt(a => Math.max(0, a - 1)); }}>Back</button>
            <span className="actions">
              {finished ? (
                <>
                  <button className="ctl" onClick={() => { setExample(lesson.generate(deps().rng, 0)); setAt(0); }}>Another one</button>
                  <button className="ctl go" onClick={() => startLesson(lesson.id)}>Start practice</button>
                </>
              ) : (
                <>
                  <button className="ctl" onClick={() => { setPlaying(false); setAt(last); }}>Show all</button>
                  {!playing && at === 0
                    ? <button className="ctl go" onClick={() => { setAt(1); setPlaying(true); }}>Play</button>
                    : <button className="ctl go" onClick={() => { setPlaying(false); setAt(a => Math.min(last, a + 1)); }}>Next</button>}
                </>
              )}
            </span>
          </div>
        </section>
        <aside className="lside">
          <section className="tile lmap">
            <span className="k">{lesson.unit} · lesson {k + 1} of {grade.length}</span>
            <div className="outline">
              {ex.steps.map((s, i) => (
                <button key={s.id} className={s.state === at ? "on" : s.state < at ? "seen" : ""} disabled={s.state === at}
                  onClick={() => { setPlaying(false); setAt(s.state); }}>
                  <span className="badge">{i + 1}</span><span className="name">{s.narration}</span>
                </button>
              ))}
            </div>
            <button className="ctl go" onClick={() => startLesson(lesson.id)}>Start practice ›</button>
          </section>
          {rep && (
            <button className="lesson" onClick={() => go({ name: "report", key: rep.key })}>
              <ScoreChip n={rep.level} /><span className="name">Last time: {LEVELS[rep.level]}</span><span className="muted">{when(rep.date)} ›</span>
            </button>
          )}
          {sc != null && (
            <section className="tile helptile">
              <span className="k">Help in practice</span><b>{HELP_TIERS[tier]}</b>
              <span className="muted">{["It fades as your score grows.", "Score 3 to go to final answers.", "Miss one and the steps come back."][tier]}</span>
            </section>
          )}
          <span className="visually-hidden">{gradeOf(lesson.grade).name}</span>
        </aside>
      </div>
    </>
  );
}
