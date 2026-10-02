import type { CSSProperties } from "react";
import { useApp } from "../app/AppState";
import { gradeOf } from "../curriculum/grades";
import { LEVEL_XP } from "../engine/mastery/levels";
import { currentItem, lessonOfItem } from "../engine/session/practice";
import { GradeBadge, gradeLevel } from "./primitives/Score";

/** A simple person: a head and shoulders. */
const MeIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="8.5" r="3.6" /><path d="M5 20c1.2-3.6 4-5.4 7-5.4s5.8 1.8 7 5.4" /></svg>
);

export function TopBar() {
  const { progress, openSheet, go } = useApp();
  const g = progress.grade ?? 5, gxp = progress.gxp[g] ?? 0, { lvl, into } = gradeLevel(gxp);
  // an unfinished lesson waits here, on every page, instead of taking over a grade's own "up next"
  const run = progress.run, runGrade = run ? gradeOf(lessonOfItem(currentItem(run)).grade) : null;
  return (
    <header className={`top${run ? " has-resume" : ""}`}>
      <button className="brand" onClick={() => go({ name: "welcome" }, "back")} aria-label="Bento home page">Bento</button>
      <button className="gpick" onClick={() => openSheet(true)} aria-label="Change grade">
        <GradeBadge grade={g} gxp={gxp} />
        <span className="gtext"><b>{gradeOf(g).name}</b><small>Level {lvl} · {into}/{LEVEL_XP} XP</small></span>
      </button>
      {run && runGrade && (
        <button className="resume" style={{ "--rtint": runGrade.color } as CSSProperties} onClick={() => go({ name: "practice" }, "fwd")} aria-label={`Resume ${run.title}, ${runGrade.name}, problem ${run.i + 1} of ${run.items.length}`}>
          <span className="rdot" style={{ background: runGrade.color }}>{runGrade.short}</span>
          <span className="rtext"><small>Resume · {runGrade.name}</small><b>{run.title}</b></span>
          <span className="mono rcount">{run.i + 1}/{run.items.length}</span>
          <span className="rshort">Resume ›</span>
        </button>
      )}
      <button className="mebtn" onClick={() => go({ name: "me" }, "fwd")} aria-label={`Me: ${progress.streak} day streak, ${progress.xp} XP`}>
        <span className="mestat"><i aria-hidden>🔥</i><span className="mono">{progress.streak}</span></span>
        <span className="mestat"><i aria-hidden>⭐</i><span className="mono">{progress.xp}</span></span>
        <span className="meav" aria-hidden><MeIcon /></span>
      </button>
    </header>
  );
}
